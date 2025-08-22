<?php
namespace App\Helpers;

use App\Services\AuthService;

class Auth {
    public static function requireToken(array $config) : array {
        $headers = function_exists('getallheaders') ? getallheaders() : [];
        $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        if (!preg_match('/Bearer\s(\S+)/', $auth, $m)) {
            Response::error('Unauthorized', 401);
        }
        $token = $m[1];
        $service = new AuthService($config);
        $payload = $service->decode($token);
        if (!$payload) Response::error('Invalid or expired token', 401);
        if ($service->isRevoked($token)) Response::error('Token revoked', 401);
        return ['payload' => $payload, 'token' => $token];
    }

    public static function requireAdmin(array $payload) : void {
        if (empty($payload['isadmin']) || (int)$payload['isadmin'] !== 1) {
            Response::error('Forbidden (admin only)', 403);
        }
    }
}
