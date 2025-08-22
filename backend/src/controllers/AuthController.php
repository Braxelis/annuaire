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
}
