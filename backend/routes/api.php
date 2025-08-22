<?php
use App\Controllers\AuthController;
use App\Controllers\SearchController;

return [
    'POST' => [
        '/api/login' => function($config){ (new AuthController($config))->login(); },
        '/api/logout' => function($config){ (new AuthController($config))->logout(); },
        '/api/personnel' => function($config){ (new AuthController($config))->createUser(); }, // admin only
    ],
    'GET' => [
        '/api/me' => function($config){ (new AuthController($config))->me(); },
        '/api/personnel' => function($config){ (new SearchController($config))->search(); },
    ],
];
