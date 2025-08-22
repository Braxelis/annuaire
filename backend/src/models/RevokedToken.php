<?php
namespace App\Models;

use PDO;

class RevokedToken {
    private PDO $pdo;
    
    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function add(string $token, int $expiresAt) : void {
        try {
            $stmt = $this->pdo->prepare('
                INSERT INTO revoked_tokens (token, expires_at) 
                VALUES (:t, FROM_UNIXTIME(:e))
            ');
            $stmt->execute(['t' => $token, 'e' => $expiresAt]);
        } catch (\PDOException $e) {
            // If duplicate entry, silently continue
            if ($e->getCode() !== '23000') {
                throw $e;
            }
        }
    }

    public function exists(string $token) : bool {
        $stmt = $this->pdo->prepare('
            SELECT 1 FROM revoked_tokens 
            WHERE token = :t LIMIT 1
        ');
        $stmt->execute(['t' => $token]);
        return (bool)$stmt->fetchColumn();
    }

    public function cleanup() : void {
        $this->pdo->exec('DELETE FROM revoked_tokens WHERE expires_at < NOW()');
    }
}
