<?php
namespace App\Services;

use App\Database\Database;
use App\Models\Personnel;
use App\Models\RevokedToken;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use PDO;

class AuthService {
    private array $jwt;
    private PDO $pdo;

    public function __construct(array $config) {
        $this->jwt = $config['jwt'];
        $this->pdo = Database::getConnection($config['db']);
    }

    public function login(string $matricule, string $password) : ?string {
        $model = new Personnel($this->pdo);
        $user = $model->findByMatricule($matricule);
        if (!$user) return null;
        if (empty($user['motdepasse'])) return null;
        if (!password_verify($password, $user['motdepasse'])) return null;

        $now = time();
        $payload = [
            'sub' => $user['matricule'],
            'nom' => $user['nom'],
            'email' => $user['email'],
            'isadmin' => (int)$user['isadmin'],
            'iat' => $now,
            'exp' => $now + ($this->jwt['ttl'] ?? 3600),
        ];
        return JWT::encode($payload, $this->jwt['secret'], $this->jwt['algo']);
    }

    public function decode(string $token) : ?array {
        try {
            $decoded = JWT::decode($token, new Key($this->jwt['secret'], $this->jwt['algo']));
            return (array)$decoded;
        } catch (\Throwable $e) {
            return null;
        }
    }

    public function revoke(string $token) : void {
        $payload = $this->decode($token);
        if (!$payload || empty($payload['exp'])) return;
        $rev = new RevokedToken($this->pdo);
        $rev->add($token, (int)$payload['exp']);
        $rev->cleanup();
    }

    public function isRevoked(string $token) : bool {
        $rev = new RevokedToken($this->pdo);
        return $rev->exists($token);
    }
    
    public function deleteUser($userId) {
        // This method is unused and references undefined $this->config
        // It should be removed or fixed if needed
        throw new \BadMethodCallException('deleteUser method is deprecated. Use Personnel model delete method instead.');
    }
}
