<?php
namespace App\Models;

use PDO;

class Personnel {
    private PDO $pdo;
    public function __construct(PDO $pdo) { $this->pdo = $pdo; }

    public function findByMatricule(string $matricule) : ?array {
        $stmt = $this->pdo->prepare('SELECT p.*, s.ville, s.quartier FROM personnel p LEFT JOIN site s ON p.idsite = s.idsite WHERE p.matricule = :m LIMIT 1');
        $stmt->execute(['m' => $matricule]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function create(array $data) : string {
        $stmt = $this->pdo->prepare('INSERT INTO personnel (matricule, idsite, nom, email, telephoneqc, poste, statut, departement, service, motdepasse, isadmin) 
        VALUES (:matricule, :idsite, :nom, :email, :telephoneqc, :poste, :statut, :departement, :service, :motdepasse, :isadmin)');
        $stmt->execute([
            'matricule' => $data['matricule'],
            'idsite' => $data['idsite'],
            'nom' => $data['nom'],
            'email' => $data['email'],
            'telephoneqc' => $data['telephoneqc'],
            'poste' => $data['poste'],
            'statut' => $data['statut'],
            'departement' => $data['departement'],
            'service' => $data['service'],
            'motdepasse' => $data['motdepasse'] ?? null,
            'isadmin' => $data['isadmin'] ?? 0,
        ]);
        return $data['matricule'];
    }

    public function search(array $filters, int $limit = 50, int $offset = 0) : array {
        $sql = 'SELECT p.matricule, p.nom, p.email, p.telephoneqc, p.poste, p.statut, 
                p.departement, p.service, p.isadmin, s.ville, s.quartier
                FROM personnel p
                LEFT JOIN site s ON p.idsite = s.idsite
                WHERE 1=1';
        $params = [];

        // Recherche globale
        if (!empty($filters['q'])) {
        // Using proper parameter binding
        $searchTerm = "%{$filters['q']}%";
        $sql .= " AND (nom LIKE :search OR matricule LIKE :search OR email LIKE :search)";
        $params[':search'] = $searchTerm;
    }

        // Traitement des filtres spécifiques
        foreach (['matricule', 'nom', 'email', 'poste', 'statut', 'departement', 'service', 'ville', 'quartier', 'isadmin'] as $f) {
            if (!empty($filters[$f])) {
                if (in_array($f, ['ville', 'quartier'])) {
                    $sql .= " AND s.$f = :$f";
                    $params[$f] = $filters[$f];
                } else if (in_array($f, ['nom', 'email', 'matricule'])) {
                    // Recherche partielle pour nom, email et matricule
                    $sql .= " AND p.$f LIKE :$f";
                    $params[$f] = '%' . $filters[$f] . '%';
                } else {
                    $sql .= " AND p.$f = :$f";
                    $params[$f] = $filters[$f];
                }
            }
        }
        
        $sql .= ' ORDER BY p.nom LIMIT :limit OFFSET :offset';
        $stmt = $this->pdo->prepare($sql);
        
        foreach ($params as $k => $v) {
            $stmt->bindValue(':' . $k, $v);
        }
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
}
