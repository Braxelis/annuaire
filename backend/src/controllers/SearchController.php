<?php
namespace App\Controllers;

use App\Helpers\Response;
use App\Helpers\Auth as AuthHelper;
use App\Database\Database;
use App\Models\Personnel;

class SearchController {
    private array $config;
    public function __construct(array $config) { $this->config = $config; }

    public function search() : void {
        AuthHelper::requireToken($this->config);

        $filters = [];
        $validFilters = [
            'matricule', 'nom', 'email', 'poste', 'statut', 'departement', 
            'service', 'ville', 'quartier', 'isadmin', 'q'
        ];
        foreach ($validFilters as $f) {
            if (isset($_GET[$f]) && $_GET[$f] !== '') {
                $filters[$f] = trim($_GET[$f]);
            }
        }
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

        $pdo = Database::getConnection($this->config['db']);
        $model = new Personnel($pdo);
        $results = $model->search($filters, $limit, $offset);
        Response::json(['results' => $results]);
    }
}
