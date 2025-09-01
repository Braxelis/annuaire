-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : lun. 01 sep. 2025 à 14:20
-- Version du serveur : 10.4.28-MariaDB
-- Version de PHP : 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `annuaire`
--

-- --------------------------------------------------------

--
-- Structure de la table `personnel`
--

CREATE TABLE `personnel` (
  `matricule` varchar(128) NOT NULL,
  `idsite` varchar(128) DEFAULT NULL,
  `nom` varchar(128) NOT NULL,
  `email` varchar(191) NOT NULL,
  `telephoneqc` varchar(64) NOT NULL,
  `poste` varchar(128) NOT NULL,
  `statut` varchar(128) NOT NULL,
  `departement` varchar(128) NOT NULL,
  `service` varchar(128) NOT NULL,
  `motdepasse` varchar(255) DEFAULT NULL,
  `isadmin` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `personnel`
--

INSERT INTO `personnel` (`matricule`, `idsite`, `nom`, `email`, `telephoneqc`, `poste`, `statut`, `departement`, `service`, `motdepasse`, `isadmin`) VALUES
('CRC001', '001', 'John Doe', 'john.doe@camairco.cm', '+237600000000', 'Ingénieur', 'Employé', 'Informatique', 'Développement', '$2y$10$Hjif9fcirlZTkvFKu4Pmouo5Q79P8Rg5F5l3Ud7RCNYz7IcrjI1rO', 1),
('EMP010', '001', 'Kouadi', 'jean.kouadio@exemple.com', '690000000', 'Développeur', 'stagiaire', 'Informatique', 'Applications', '$2y$10$j5Gahx2Ghh8YkHTtN3g1zeRlW2dCIeKqa9ynZgUTWo2x.ICRB1b0.', 1),
('EMP020', '002', 'Nji', 'emmanuel.nji@exemple.com', '690000001', 'Responsable CS', 'stagiaire', 'Informatique', 'CyberSec', '$2y$10$wjDaZ0L8yXGKkOnSMJ1MqO7cRHe7OjwCWscUE/G6VMqo7K0xj5kHe', 0),
('EMP030', '001', 'Tamo', 'tamomichel@exemple.com', '690000002', 'Responsable CS', 'stagiaire', 'Informatique', 'DSI', '$2y$10$xHkKp87ZXYyj0WDMSi28fOt/.8CF/SYYEr7XReC9Ly3f1LrO98Eya', 0);

-- --------------------------------------------------------

--
-- Structure de la table `revoked_tokens`
--

CREATE TABLE `revoked_tokens` (
  `id` int(10) UNSIGNED NOT NULL,
  `token` varchar(512) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `site`
--

CREATE TABLE `site` (
  `idsite` varchar(128) NOT NULL,
  `ville` varchar(128) NOT NULL,
  `quartier` varchar(128) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `site`
--

INSERT INTO `site` (`idsite`, `ville`, `quartier`) VALUES
('001', 'Douala', 'Bonanjo'),
('002', 'Douala', 'Hangar'),
('003', 'Yaoundé', 'Nsimalen');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `personnel`
--
ALTER TABLE `personnel`
  ADD PRIMARY KEY (`matricule`),
  ADD KEY `fk_personnel_site` (`idsite`),
  ADD KEY `idx_personnel_nom_prenom` (`nom`),
  ADD KEY `idx_personnel_dept` (`departement`),
  ADD KEY `idx_personnel_service` (`service`),
  ADD KEY `idx_personnel_statut` (`statut`),
  ADD KEY `idx_personnel_poste` (`poste`);

--
-- Index pour la table `revoked_tokens`
--
ALTER TABLE `revoked_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_token` (`token`(128)),
  ADD KEY `expires_at` (`expires_at`);

--
-- Index pour la table `site`
--
ALTER TABLE `site`
  ADD PRIMARY KEY (`idsite`),
  ADD KEY `idx_site_ville` (`ville`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `revoked_tokens`
--
ALTER TABLE `revoked_tokens`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `personnel`
--
ALTER TABLE `personnel`
  ADD CONSTRAINT `fk_personnel_site` FOREIGN KEY (`idsite`) REFERENCES `site` (`idsite`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
