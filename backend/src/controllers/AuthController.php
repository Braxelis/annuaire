<?php
namespace App\Controllers;

use App\Helpers\Response;
use App\Helpers\Auth as AuthHelper;
use App\Services\AuthService;
use App\Models\Personnel;
use App\Database\Database;

class AuthController {
    private array $config;
    public function __construct(array $config) { $this->config = $config; }

    public function login() : void {
        $in = json_decode(file_get_contents('php://input'), true) ?: [];
        $matricule = trim($in['matricule'] ?? '');
        $password  = (string)($in['motdepasse'] ?? '');
        if (!$matricule || !$password) Response::error('Matricule et mot de passe requis', 400);

        $auth = new AuthService($this->config);
        $token = $auth->login($matricule, $password);
        if (!$token) Response::error('Identifiants invalides ou utilisateur sans mot de passe', 401);
        Response::json(['token' => $token]);
    }

    public function logout() : void {
        $authData = AuthHelper::requireToken($this->config);
        $token = $authData['token'];
        $auth = new AuthService($this->config);
        $auth->revoke($token);
        Response::json(['message' => 'Déconnexion réussie']);
    }

    public function me() : void {
        $authData = AuthHelper::requireToken($this->config);
        $matricule = $authData['payload']['sub'];

        // Récupérer toutes les informations de l'utilisateur
        $pdo = Database::getConnection($this->config['db']);
        $model = new Personnel($pdo);
        $userData = $model->findByMatricule($matricule);

        if (!$userData) {
            Response::error('Utilisateur non trouvé', 404);
        }

        Response::json($userData);
    }

    public function createUser() : void {
        $authData = AuthHelper::requireToken($this->config);
        AuthHelper::requireAdmin($authData['payload']);
        $in = json_decode(file_get_contents('php://input'), true) ?: [];

        $required = ['matricule','idsite','nom','email','telephoneqc','poste','statut','departement','service'];
        foreach ($required as $r) if (empty($in[$r])) Response::error("Champ requis: $r", 400);

        $pdo = Database::getConnection($this->config['db']);
        $model = new Personnel($pdo);

        $existing = $model->findByMatricule($in['matricule']);
        if ($existing) Response::error('Matricule déjà existant', 409);

        $hashed = null;
        if (!empty($in['motdepasse'])) $hashed = password_hash($in['motdepasse'], PASSWORD_DEFAULT);

        $mat = $model->create([
            'matricule' => $in['matricule'],
            'idsite' => $in['idsite'],
            'nom' => $in['nom'],
            'email' => $in['email'],
            'telephoneqc' => $in['telephoneqc'],
            'poste' => $in['poste'],
            'statut' => $in['statut'],
            'departement' => $in['departement'],
            'service' => $in['service'],
            'motdepasse' => $hashed,
            'isadmin' => isset($in['isadmin']) ? (int)$in['isadmin'] : 0,
        ]);

        Response::json(['matricule' => $mat], 201);
    }

    public function updateUser() : void {
        $authData = AuthHelper::requireToken($this->config);
        AuthHelper::requireAdmin($authData['payload']);
        
        // Récupérer le matricule depuis l'URL
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $parts = explode('/', $path);
        $matricule = end($parts);
        
        if (empty($matricule)) {
            Response::error('Matricule requis dans l\'URL', 400);
        }

        $in = json_decode(file_get_contents('php://input'), true) ?: [];
        
        // Vérifier qu'au moins un champ à mettre à jour est fourni
        $allowedFields = ['idsite', 'nom', 'email', 'telephoneqc', 'poste', 'statut', 'departement', 'service', 'isadmin', 'motdepasse'];
        $hasUpdate = false;
        
        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $in)) {
                $hasUpdate = true;
                break;
            }
        }
        
        if (!$hasUpdate) {
            Response::error('Aucun champ valide fourni pour la mise à jour', 400);
        }

        $pdo = Database::getConnection($this->config['db']);
        $model = new Personnel($pdo);

        // Vérifier que l'utilisateur existe
        $existing = $model->findByMatricule($matricule);
        if (!$existing) {
            Response::error('Utilisateur non trouvé', 404);
        }

        $success = $model->update($matricule, $in);
        
        if ($success) {
            Response::json(['message' => 'Utilisateur mis à jour avec succès', 'matricule' => $matricule]);
        } else {
            Response::error('Erreur lors de la mise à jour de l\'utilisateur', 500);
        }
    }
    
    public function deleteUser() : void {
        try {
            // Use AuthHelper instead of Auth
            $authData = AuthHelper::requireToken($this->config);
            AuthHelper::requireAdmin($authData['payload']);
            
            // Get matricule from URL
            $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            $parts = explode('/', $path);
            $matricule = end($parts);
            
            if (empty($matricule)) {
                Response::error('Matricule requis dans l\'URL', 400);
            }

            // Get database connection and personnel model
            $pdo = Database::getConnection($this->config['db']);
            $model = new Personnel($pdo);

            // Check if user exists
            $existing = $model->findByMatricule($matricule);
            if (!$existing) {
                Response::error('Utilisateur non trouvé', 404);
            }

            // Delete the user
            $success = $model->delete($matricule);
            
            if ($success) {
                Response::json(['message' => 'Utilisateur supprimé avec succès']);
            } else {
                Response::error('Erreur lors de la suppression', 500);
            }
            
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }
}
