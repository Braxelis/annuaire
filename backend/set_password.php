<?php
require __DIR__ . '/vendor/autoload.php';
use App\Database\Database;

$config = require __DIR__ . '/config/config.php';
$pdo = Database::getConnection($config['db']);

$matricule = "EMP010";
$plainPassword = "12345678"; // ton vrai mot de passe
$hashed = password_hash($plainPassword, PASSWORD_DEFAULT);

$stmt = $pdo->prepare("UPDATE personnel SET motdepasse = ? WHERE matricule = ?");
$stmt->execute([$hashed, $matricule]);

echo "Mot de passe défini pour $matricule\n";
