<?php
return [
    'db' => [
        'host' => getenv('DB_HOST') ?: '127.0.0.1',
        'port' => getenv('DB_PORT') ?: 3306,
        'name' => getenv('DB_NAME') ?: 'annuaire',
        'user' => getenv('DB_USER') ?: 'root',
        'pass' => getenv('DB_PASS') ?: '',
        'charset' => 'utf8mb4',
    ],
    'jwt' => [
        'secret' => getenv('JWT_SECRET') ?: 'change_this_to_a_strong_secret',
        'algo' => 'HS256',
        'ttl'  => 3600
    ],
    'cors' => [
        'allowed_origins' => explode(',', getenv('CORS_ALLOWED') ?: 'http://127.0.0.1:5500,http://localhost:3000,http://localhost:8080'),
    ],
];
