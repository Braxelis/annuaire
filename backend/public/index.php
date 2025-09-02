<?php
declare(strict_types=1);

spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $base_dir = __DIR__ . '/../src/';
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) return;
    $relative = strtolower(substr($class, $len));
    $file = $base_dir . str_replace('\\', '/', $relative) . '.php';
    error_log("Autoloading $class from $file");
    if (file_exists($file)) {
        error_log("File exists, requiring $file");
        require $file;
    } else {
        error_log("File does not exist: $file");
    }
});

require_once __DIR__ . '/../vendor/autoload.php';

require_once __DIR__ . '/../src/helpers/Response.php';

spl_autoload_register(function ($class) {
    $prefix = 'App\\Helpers\\';
    $base_dir = __DIR__ . '/../src/helpers/';
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) return;
    $relative = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative) . '.php';
    if (file_exists($file)) require $file;
});

use App\Helpers\Response;

$config = require __DIR__ . '/../config/config.php';

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $config['cors']['allowed_origins'])) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$routes = require __DIR__ . '/../routes/api.php';
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$scriptName = $_SERVER['SCRIPT_NAME'];
if (strpos($path, $scriptName) === 0) $path = substr($path, strlen($scriptName));
$path = rtrim($path, '/') ?: '/';

// Debug log
error_log("REQUEST_URI: {$_SERVER['REQUEST_URI']}, SCRIPT_NAME: {$_SERVER['SCRIPT_NAME']}, Parsed path: $path");

// Vérifier les routes exactes d'abord
if (isset($routes[$method][$path])) {
    $routes[$method][$path]($config);
    exit;
}

// Vérifier les routes avec wildcards
foreach ($routes[$method] ?? [] as $routePattern => $handler) {
    if (strpos($routePattern, '*') !== false) {
        // Convertir le pattern en regex
        $pattern = str_replace('/', '\/', $routePattern);
        $pattern = '/^' . str_replace('*', '([^\/]+)', $pattern) . '$/';

        if (preg_match($pattern, $path, $matches)) {
            $handler($config);
            exit;
        }
    }
}

\App\Helpers\Response::error('Not Found', 404);
