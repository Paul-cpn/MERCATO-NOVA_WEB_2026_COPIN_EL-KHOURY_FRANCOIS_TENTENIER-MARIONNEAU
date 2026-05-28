-- phpMyAdmin SQL Dump
-- version 5.1.2
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost:3306
-- Généré le : jeu. 28 mai 2026 à 14:23
-- Version du serveur : 5.7.24
-- Version de PHP : 8.3.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `mercato_nova`
--

CREATE DATABASE IF NOT EXISTS `mercato_nova` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `mercato_nova`;


-- --------------------------------------------------------

--
-- Structure de la table `annonce`
--

CREATE TABLE `annonce` (
  `id_annonce` int(11) NOT NULL,
  `titre_annonce` varchar(50) NOT NULL,
  `description_annonce` varchar(300) DEFAULT NULL,
  `prix_annonce` decimal(10,2) NOT NULL,
  `etat_objet_annonce` enum('neuf','tres_bon','bon','acceptable','mauvais') NOT NULL,
  `type_vente_annonce` varchar(50) NOT NULL,
  `taille_annonce` varchar(50) DEFAULT NULL,
  `couleur_annonce` varchar(100) DEFAULT NULL,
  `marque_annonce` varchar(100) DEFAULT NULL,
  `statut_annonce` varchar(50) DEFAULT 'active',
  `date_annonce` datetime DEFAULT CURRENT_TIMESTAMP,
  `id_user` int(11) NOT NULL,
  `id_categorie` int(11) DEFAULT NULL,
  `matiere_annonce` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `annonce`
--

INSERT INTO `annonce` (`id_annonce`, `titre_annonce`, `description_annonce`, `prix_annonce`, `etat_objet_annonce`, `type_vente_annonce`, `taille_annonce`, `couleur_annonce`, `marque_annonce`, `statut_annonce`, `date_annonce`, `id_user`, `id_categorie`, `matiere_annonce`) VALUES
(25, 'Polo lacoste', 'tres confortable pour l\'été', '20.00', 'tres_bon', 'achat_direct', 'M', 'Rose', 'Lacoste', 'vendu', '2026-05-27 14:14:36', 4, 21, 'Denim'),
(26, 'Botine UGG', 'tien bien au chaud', '40.00', 'bon', 'enchere', 'Unique', 'Noir', 'UGG', 'active', '2026-05-27 14:17:53', 4, 48, 'Coton'),
(27, 'Haut avec design fleuri', 'top blanc excellent pour les soirée', '35.00', 'tres_bon', 'achat_direct', 'S', 'Blanc', 'Zara', 'active', '2026-05-27 14:20:16', 4, 21, 'Lin'),
(28, 'Haut pour la plage', 'pret pour la plage avec ce superbe haut', '30.00', 'neuf', 'achat_direct', 'XS', 'Rose', 'Bershka', 'vendu', '2026-05-27 14:23:20', 4, 21, 'Coton'),
(29, 'Jeans bleu', 'coupe baggy tres bien pour les baddies', '35.00', 'tres_bon', 'enchere', '38', 'Bleu', 'Zara', 'active', '2026-05-27 14:25:20', 4, 39, 'Denim'),
(30, 'Robe fleury', 'robe avec des motif fleury pour etre matchy avec la nature', '50.00', 'neuf', 'achat_direct', 'L', 'Bleu', 'Cos', 'active', '2026-05-27 14:28:53', 4, 33, 'Synthétique'),
(31, 'robe zebre', 'tres tendance et en plus tu sera corda avec les animaux', '60.00', 'bon', 'achat_direct', 'M', 'Blanc', 'Asos', 'active', '2026-05-27 14:31:01', 4, 33, 'Lin'),
(32, 'Sweat pull Zippé ralph Lauren', 'sweat Pull Zippé Ralph Lauren', '35.00', 'tres_bon', 'achat_direct', 'L', 'Bleu', 'ralph Lauren', 'active', '2026-05-27 14:32:46', 5, 26, 'Autre'),
(33, 'Sweat pull Zippé ralph Lauren', 'sweat Pull Zippé Ralph Lauren', '35.00', 'tres_bon', 'achat_direct', 'L', 'Bleu', 'ralph Lauren', 'vendu', '2026-05-27 14:32:48', 5, 26, 'Autre'),
(34, 'Pull a capuche', 'pull gris confortable en bien', '35.00', 'neuf', 'achat_direct', 'XL', 'Gris', 'Moc', 'active', '2026-05-27 14:34:40', 4, 23, 'Coton'),
(35, 'Jacadi', '8 ans / 128 cm·Très bon éta', '15.00', 'neuf', 'enchere', 'XS', 'Rose', 'autre', 'active', '2026-05-27 14:37:23', 5, 31, 'Autre'),
(36, 'veste pour evenement', 'veste pour des evenement pro tres clasique', '45.00', 'bon', 'enchere', 'L', 'Vert', 'H&M', 'active', '2026-05-27 14:38:36', 4, 33, 'Synthétique'),
(37, 'bracelet/boucle d\'oreilles', 'Super offre 2 en 1', '300.00', 'neuf', 'achat_direct', 'Unique', 'Doré', 'Dior', 'active', '2026-05-27 14:39:10', 7, 54, 'Autre'),
(38, 'lunnete pour la plage', 'lunnete pour attirer les pains', '25.00', 'neuf', 'achat_direct', 'Unique', 'Noir', 'claires', 'active', '2026-05-27 14:40:21', 4, 54, 'Autre'),
(39, 'Joli t-shirt 10ans', '10 ans / 140 cm·Neuf avec étiquette', '8.00', 'neuf', 'achat_direct', 'XS', 'Bleu', 'AUTRE', 'active', '2026-05-27 14:41:24', 5, 22, 'Coton'),
(40, 'casquette de sport', 'Super pour la haute vitesse', '32.00', 'acceptable', 'enchere', 'L', 'Vert', 'American', 'active', '2026-05-27 14:42:48', 7, 56, 'Synthétique'),
(41, 'Pyjama canard', 'Pyjama canard', '9.99', 'acceptable', 'achat_direct', '42', 'Jaune', 'autre', 'active', '2026-05-27 14:43:08', 5, 44, 'Coton'),
(42, 'top blanc coquette', 'haut blanc trop style pour les dates', '15.00', 'tres_bon', 'achat_direct', 'XS', 'Blanc', 'Zara', 'active', '2026-05-27 14:43:14', 8, 21, 'Lin'),
(43, 'haut rose', 'modele 2026 coupe plier', '20.00', 'acceptable', 'achat_direct', 'XXS', 'Rose', 'Pullandbear', 'active', '2026-05-27 14:44:55', 8, 21, 'Soie'),
(44, 'Maillot du PSG 21/22 Messi', 'Maillot du PSG 21/22 Messi', '45.00', 'neuf', 'achat_direct', 'M', 'Noir', 'NIKE', 'active', '2026-05-27 14:45:04', 5, 20, 'Coton'),
(45, 'pantalon a carreau', 'on dirait la nape de mon grand pere mais c est tres style', '15.00', 'tres_bon', 'enchere', '40', 'Rouge', 'Primark', 'active', '2026-05-27 14:46:12', 8, 42, 'Laine'),
(46, 'Robe légère', 'Robe légère', '25.00', 'tres_bon', 'achat_direct', 'M', 'Vert', 'ZARA', 'active', '2026-05-27 14:46:59', 5, 33, 'Autre'),
(47, 'haut avec zip noir', 'hyper confortable', '23.00', 'bon', 'achat_direct', 'S', 'Noir', 'Zara', 'active', '2026-05-27 14:47:54', 8, 21, 'Soie'),
(50, 'Lot 2 bodies MC Kiabi lapins/fleurs', 'Lot 2 bodies MC Kiabi lapins/fleurs', '12.99', 'tres_bon', 'achat_direct', 'XS', 'Blanc', 'autre', 'active', '2026-05-27 14:49:14', 5, 34, 'Coton'),
(51, 'cardigan ralph lauren', 'veste tres chic', '45.00', 'neuf', 'achat_direct', 'XXL', 'Gris', 'Ralph lauren', 'active', '2026-05-27 14:49:20', 8, 26, 'Laine'),
(52, 'doudoune north face', 'jacket qui tien chaud pour l\'hiver', '60.00', 'bon', 'achat_direct', 'XL', 'Noir', 'North face', 'active', '2026-05-27 14:50:36', 8, 29, 'Coton'),
(53, 'chaussure new balence', 'bien pour courire', '35.00', 'acceptable', 'achat_direct', 'Unique', 'Gris', 'New balence', 'active', '2026-05-27 14:52:27', 8, 47, 'Autre'),
(54, 'birken beige', 'tres style pour aller en cour', '30.00', 'neuf', 'achat_direct', 'Unique', 'Beige', 'Birken', 'active', '2026-05-27 14:53:38', 8, 48, 'Autre'),
(55, 'autri blanc', 'chaussure a la mode cette été', '50.00', 'neuf', 'enchere', 'Unique', 'Blanc', 'Autri', 'active', '2026-05-27 14:54:51', 8, 48, 'Autre'),
(56, 'Tshirt vert et jaune', 't shirt avec colorie joyeux', '20.00', 'bon', 'achat_direct', 'L', 'Vert', 'Zara', 'active', '2026-05-27 15:04:39', 8, 20, 'Coton'),
(57, 'jordan t shirt', 't shirt bleu jordan', '30.00', 'tres_bon', 'achat_direct', 'XL', 'Bleu', 'Nike jordan', 'active', '2026-05-27 15:05:46', 8, 20, 'Coton'),
(58, 'sweat north face', 'taille tres bien et tien chaud', '25.00', 'bon', 'achat_direct', 'XL', 'Noir', 'North face', 'active', '2026-05-27 15:09:29', 10, 23, 'Laine'),
(59, 'T shirt imprimer rick et morty', 'dessin imprimer avec graffity', '15.00', 'bon', 'achat_direct', 'L', 'Noir', 'HandM', 'active', '2026-05-27 15:10:50', 10, 20, 'Coton'),
(60, 'T shirt image imprimer', 'happy place and magic place', '15.00', 'neuf', 'enchere', 'M', 'Noir', 'Zara', 'active', '2026-05-27 15:12:02', 10, 20, 'Coton'),
(61, 'T shirt hugo boss', 'tu devient le boss enfaite', '25.00', 'tres_bon', 'achat_direct', 'XL', 'Noir', 'HUGO BOSS', 'active', '2026-05-27 15:13:50', 10, 20, 'Coton'),
(62, 'T shirt noir STWD', 'imprime devant et a l\'arriere du t shirt', '20.00', 'bon', 'enchere', 'L', 'Noir', 'Pullandbear', 'active', '2026-05-27 15:20:36', 10, 20, 'Coton'),
(63, 'Jeans bleu', 'coupe droite', '50.00', 'neuf', 'achat_direct', '44', 'Bleu', 'Levis', 'active', '2026-05-27 15:22:24', 10, 38, 'Denim');

-- --------------------------------------------------------

--
-- Structure de la table `avis`
--

CREATE TABLE `avis` (
  `id_avis` int(11) NOT NULL,
  `note_avis` int(11) NOT NULL,
  `commentaire_avis` varchar(300) DEFAULT NULL,
  `date_avis` datetime DEFAULT CURRENT_TIMESTAMP,
  `id_transaction` int(11) NOT NULL,
  `id_user_auteur` int(11) NOT NULL,
  `id_user_cible` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `avis`
--

INSERT INTO `avis` (`id_avis`, `note_avis`, `commentaire_avis`, `date_avis`, `id_transaction`, `id_user_auteur`, `id_user_cible`) VALUES
(7, 4, 'Super vendeur, juste un peux pour l\'envoie', '2026-05-27 14:29:41', 12, 6, 4),
(8, 2, 'mal poli mais le haut est bien', '2026-05-27 14:31:24', 13, 6, 4),
(9, 4, 'Super polo merci je recommandes', '2026-05-27 14:35:33', 14, 7, 5);

-- --------------------------------------------------------

--
-- Structure de la table `categorie`
--

CREATE TABLE `categorie` (
  `id_categorie` int(11) NOT NULL,
  `nom_categorie` varchar(50) NOT NULL,
  `id_categorie_mere` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `categorie`
--

INSERT INTO `categorie` (`id_categorie`, `nom_categorie`, `id_categorie_mere`) VALUES
(8, 'Homme', NULL),
(9, 'Femme', NULL),
(10, 'Enfant', NULL),
(11, 'Haut', 8),
(12, 'Bas', 8),
(13, 'Accessoire', 8),
(14, 'Haut', 9),
(15, 'Bas', 9),
(16, 'Accessoire', 9),
(17, 'Haut', 10),
(18, 'Bas', 10),
(19, 'Accessoire', 10),
(20, 'T-shirt', 11),
(21, 'T-shirt', 14),
(22, 'T-shirt', 17),
(23, 'Sweat', 11),
(24, 'Sweat', 14),
(25, 'Sweat', 17),
(26, 'Pull', 11),
(27, 'Pull', 14),
(28, 'Pull', 17),
(29, 'Manteau', 11),
(30, 'Manteau', 14),
(31, 'Manteau', 17),
(32, 'Veste', 11),
(33, 'Veste', 14),
(34, 'Veste', 17),
(35, 'Short', 12),
(36, 'Short', 15),
(37, 'Short', 18),
(38, 'Jeans', 12),
(39, 'Jeans', 15),
(40, 'Jeans', 18),
(41, 'Pantalon', 12),
(42, 'Pantalon', 15),
(43, 'Pantalon', 18),
(44, 'Jogging', 12),
(45, 'Jogging', 15),
(46, 'Jogging', 18),
(47, 'Chaussures', 13),
(48, 'Chaussures', 16),
(49, 'Chaussures', 19),
(50, 'Sac', 13),
(51, 'Sac', 16),
(52, 'Sac', 19),
(53, 'Bijou', 13),
(54, 'Bijou', 16),
(55, 'Bijou', 19),
(56, 'Couvre chef', 13),
(57, 'Couvre chef', 16),
(58, 'Couvre chef', 19);

-- --------------------------------------------------------

--
-- Structure de la table `echange`
--

CREATE TABLE `echange` (
  `id_echange` int(11) NOT NULL,
  `montant_echange` decimal(10,2) DEFAULT NULL,
  `message_echange` varchar(500) DEFAULT NULL,
  `date_echange` datetime DEFAULT CURRENT_TIMESTAMP,
  `id_negociation` int(11) NOT NULL,
  `id_user` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `echange`
--

INSERT INTO `echange` (`id_echange`, `montant_echange`, `message_echange`, `date_echange`, `id_negociation`, `id_user`) VALUES
(48, '13.00', 'Je vous propose 13 € pour cet article.', '2026-05-27 14:18:20', 8, 3),
(49, NULL, 'salut', '2026-05-27 14:21:00', 8, 4),
(50, NULL, 'coucou', '2026-05-27 14:21:06', 8, 3),
(51, NULL, 'L\'offre a été refusée.', '2026-05-27 14:21:15', 8, 4),
(52, NULL, 'nan pourquoi ?', '2026-05-27 14:21:27', 8, 3),
(53, '27.00', 'Je vous propose 27 € pour cet article.', '2026-05-27 14:33:37', 9, 7),
(54, NULL, 'Offre acceptée ! Le prix final est de 27 €.', '2026-05-27 14:33:44', 9, 5),
(55, NULL, 'merci, vous l\'envoyer quand ?', '2026-05-27 14:34:21', 9, 7);

-- --------------------------------------------------------

--
-- Structure de la table `enchere`
--

CREATE TABLE `enchere` (
  `id_enchere` int(11) NOT NULL,
  `prix_depart_enchere` decimal(10,2) NOT NULL,
  `meilleure_offre_enchere` decimal(10,2) DEFAULT NULL,
  `date_fin_enchere` datetime NOT NULL,
  `statut_enchere` varchar(50) DEFAULT 'en_cours',
  `id_annonce` int(11) NOT NULL,
  `id_user_gagnant` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `enchere`
--

INSERT INTO `enchere` (`id_enchere`, `prix_depart_enchere`, `meilleure_offre_enchere`, `date_fin_enchere`, `statut_enchere`, `id_annonce`, `id_user_gagnant`) VALUES
(7, '40.00', '46.00', '2026-06-04 14:16:00', 'en_cours', 26, 7),
(8, '35.00', NULL, '2026-06-05 14:24:00', 'en_cours', 29, NULL),
(9, '15.00', NULL, '2026-06-07 14:36:00', 'en_cours', 35, NULL),
(10, '45.00', NULL, '2026-06-06 14:38:00', 'en_cours', 36, NULL),
(11, '32.00', NULL, '2026-06-07 12:03:00', 'en_cours', 40, NULL),
(12, '15.00', NULL, '2026-06-06 14:45:00', 'en_cours', 45, NULL),
(13, '50.00', NULL, '2026-06-06 14:54:00', 'en_cours', 55, NULL),
(14, '15.00', NULL, '2026-06-06 15:11:00', 'en_cours', 60, NULL),
(15, '20.00', NULL, '2026-06-10 15:19:00', 'en_cours', 62, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `favoris`
--

CREATE TABLE `favoris` (
  `id_favoris` int(11) NOT NULL,
  `date_favoris` datetime DEFAULT CURRENT_TIMESTAMP,
  `id_user` int(11) NOT NULL,
  `id_annonce` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `favoris`
--

INSERT INTO `favoris` (`id_favoris`, `date_favoris`, `id_user`, `id_annonce`) VALUES
(20, '2026-05-27 14:39:14', 5, 27);

-- --------------------------------------------------------

--
-- Structure de la table `image`
--

CREATE TABLE `image` (
  `id_image` int(11) NOT NULL,
  `url_image` text NOT NULL,
  `ordre_image` int(11) DEFAULT '1',
  `id_annonce` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `image`
--

INSERT INTO `image` (`id_image`, `url_image`, `ordre_image`, `id_annonce`) VALUES
(30, '../images/images_produit/img_6a16e02c874d59.82296217.png', 1, 25),
(31, '../images/images_produit/img_6a16e0f1a846f4.61567279.png', 1, 26),
(32, '../images/images_produit/img_6a16e0f1b2e442.00447806.png', 2, 26),
(33, '../images/images_produit/img_6a16e18085f730.09026355.png', 1, 27),
(34, '../images/images_produit/img_6a16e238ca7fa6.86778599.png', 1, 28),
(35, '../images/images_produit/img_6a16e2b04a4151.28288963.png', 1, 29),
(36, '../images/images_produit/img_6a16e3852a0e56.55900327.png', 1, 30),
(37, '../images/images_produit/img_6a16e385331b41.29486149.png', 2, 30),
(38, '../images/images_produit/img_6a16e40505cc42.75250311.png', 1, 31),
(39, '../images/images_produit/img_6a16e405062ca6.69954513.png', 2, 31),
(40, '../images/images_produit/img_6a16e46e87aaf4.07458523.png', 1, 32),
(41, '../images/images_produit/img_6a16e46e920461.46267335.png', 2, 32),
(42, '../images/images_produit/img_6a16e46e929610.18014302.png', 3, 32),
(43, '../images/images_produit/img_6a16e46e9a03a0.36106456.png', 4, 32),
(44, '../images/images_produit/img_6a16e46e9a6ba4.48513521.png', 5, 32),
(45, '../images/images_produit/img_6a16e470227339.12595092.png', 1, 33),
(46, '../images/images_produit/img_6a16e47022d8b8.08494743.png', 2, 33),
(47, '../images/images_produit/img_6a16e470231f91.58081515.png', 3, 33),
(48, '../images/images_produit/img_6a16e470237043.05709333.png', 4, 33),
(49, '../images/images_produit/img_6a16e47023a478.76483005.png', 5, 33),
(50, '../images/images_produit/img_6a16e4e0c3d104.83961688.png', 1, 34),
(51, '../images/images_produit/img_6a16e4e0c445c5.44945916.png', 2, 34),
(52, '../images/images_produit/img_6a16e583567448.34028941.png', 1, 35),
(53, '../images/images_produit/img_6a16e583570158.41616780.png', 2, 35),
(54, '../images/images_produit/img_6a16e583573f07.53263089.png', 3, 35),
(55, '../images/images_produit/img_6a16e5cca20993.60818340.png', 1, 36),
(56, '../images/images_produit/img_6a16e5ee122446.79937140.webp', 1, 37),
(57, '../images/images_produit/img_6a16e5ee129135.40504907.webp', 2, 37),
(58, '../images/images_produit/img_6a16e5ee132821.51157666.webp', 3, 37),
(59, '../images/images_produit/img_6a16e5ee136ac3.84167530.webp', 4, 37),
(60, '../images/images_produit/img_6a16e63530fe20.60100813.png', 1, 38),
(61, '../images/images_produit/img_6a16e635399c13.72702420.png', 2, 38),
(62, '../images/images_produit/img_6a16e674257dc7.76800864.png', 1, 39),
(63, '../images/images_produit/img_6a16e674265d65.36985535.png', 2, 39),
(64, '../images/images_produit/img_6a16e67426bd93.01343779.png', 3, 39),
(65, '../images/images_produit/img_6a16e6c8f19423.52531885.webp', 1, 40),
(66, '../images/images_produit/img_6a16e6c8f25272.03607310.webp', 2, 40),
(67, '../images/images_produit/img_6a16e6c8f2aa52.83898814.webp', 3, 40),
(68, '../images/images_produit/img_6a16e6c8f2fa13.57477788.webp', 4, 40),
(69, '../images/images_produit/img_6a16e6dc74efe9.83274599.png', 1, 41),
(70, '../images/images_produit/img_6a16e6e2c88ba5.91773969.png', 1, 42),
(71, '../images/images_produit/img_6a16e7472f5700.33828397.png', 1, 43),
(72, '../images/images_produit/img_6a16e75018ec03.08999043.png', 1, 44),
(73, '../images/images_produit/img_6a16e750199e91.94706161.png', 2, 44),
(74, '../images/images_produit/img_6a16e75019fbd3.85397854.png', 3, 44),
(75, '../images/images_produit/img_6a16e7501a2ef8.24194309.png', 4, 44),
(76, '../images/images_produit/img_6a16e7501a6082.31771513.png', 5, 44),
(77, '../images/images_produit/img_6a16e794200494.99556540.png', 1, 45),
(78, '../images/images_produit/img_6a16e7942a8979.17420618.png', 2, 45),
(79, '../images/images_produit/img_6a16e7c361acf6.98361600.png', 1, 46),
(80, '../images/images_produit/img_6a16e7c3620b69.66250795.png', 2, 46),
(81, '../images/images_produit/img_6a16e7c3625486.79843941.png', 3, 46),
(82, '../images/images_produit/img_6a16e7fae477a9.15133729.png', 1, 47),
(86, '../images/images_produit/img_6a16e84a229d95.23659527.png', 1, 50),
(87, '../images/images_produit/img_6a16e84a22fb06.33237734.png', 2, 50),
(88, '../images/images_produit/img_6a16e84a2358e0.41575323.png', 3, 50),
(89, '../images/images_produit/img_6a16e84a23af45.17294608.png', 4, 50),
(90, '../images/images_produit/img_6a16e850194551.18716602.png', 1, 51),
(91, '../images/images_produit/img_6a16e89c9abb03.47829683.png', 1, 52),
(92, '../images/images_produit/img_6a16e90b0eb2a8.51257936.png', 1, 53),
(93, '../images/images_produit/img_6a16e90b0f6614.43505742.png', 2, 53),
(94, '../images/images_produit/img_6a16e95265f269.24783744.png', 1, 54),
(95, '../images/images_produit/img_6a16e9526634e4.61210664.png', 2, 54),
(96, '../images/images_produit/img_6a16e99bc6bdc3.88907419.png', 1, 55),
(97, '../images/images_produit/img_6a16e99bc74666.58773475.png', 2, 55),
(98, '../images/images_produit/img_6a16ebe7ce44e1.89148218.jpeg', 1, 56),
(99, '../images/images_produit/img_6a16ebe7cf0607.93758476.jpeg', 2, 56),
(100, '../images/images_produit/img_6a16ec2a1e9022.20856626.jpeg', 1, 57),
(101, '../images/images_produit/img_6a16ec2a1f2b44.22295231.jpeg', 2, 57),
(102, '../images/images_produit/img_6a16ed095452d7.85718740.jpeg', 1, 58),
(103, '../images/images_produit/img_6a16ed5a020066.16136957.jpeg', 1, 59),
(104, '../images/images_produit/img_6a16ed5a0252d4.42360505.jpeg', 2, 59),
(105, '../images/images_produit/img_6a16eda2443249.25765882.jpeg', 1, 60),
(106, '../images/images_produit/img_6a16eda2451536.81401770.jpeg', 2, 60),
(107, '../images/images_produit/img_6a16ee0e4367c6.04126791.jpeg', 1, 61),
(108, '../images/images_produit/img_6a16efa46ccbc5.65486442.jpeg', 1, 62),
(109, '../images/images_produit/img_6a16efa478b5f6.55676566.jpeg', 2, 62),
(110, '../images/images_produit/img_6a16f0105f3d68.30375018.png', 1, 63);

-- --------------------------------------------------------

--
-- Structure de la table `negociation`
--

CREATE TABLE `negociation` (
  `id_negociation` int(11) NOT NULL,
  `offre_initiale_negociation` decimal(10,2) NOT NULL,
  `statut_negociation` varchar(50) DEFAULT 'en_cours',
  `date_negociation` datetime DEFAULT CURRENT_TIMESTAMP,
  `id_annonce` int(11) NOT NULL,
  `id_user_acheteur` int(11) NOT NULL,
  `id_user_vendeur` int(11) NOT NULL,
  `prix_negocie` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `negociation`
--

INSERT INTO `negociation` (`id_negociation`, `offre_initiale_negociation`, `statut_negociation`, `date_negociation`, `id_annonce`, `id_user_acheteur`, `id_user_vendeur`, `prix_negocie`) VALUES
(8, '13.00', 'refusee', '2026-05-27 14:18:20', 25, 3, 4, NULL),
(9, '27.00', 'acceptee', '2026-05-27 14:33:37', 33, 7, 5, '27.00');

-- --------------------------------------------------------

--
-- Structure de la table `notification`
--

CREATE TABLE `notification` (
  `id_notification` int(11) NOT NULL,
  `type_notification` varchar(50) NOT NULL,
  `texte_notification` varchar(300) NOT NULL,
  `lu_notification` tinyint(1) DEFAULT '0',
  `date_notification` datetime DEFAULT CURRENT_TIMESTAMP,
  `id_user` int(11) NOT NULL,
  `id_cible` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `notification`
--

INSERT INTO `notification` (`id_notification`, `type_notification`, `texte_notification`, `lu_notification`, `date_notification`, `id_user`, `id_cible`) VALUES
(26, 'negociation', 'Nouvelle offre de 23 € sur votre article : ', 1, '2026-05-25 23:58:26', 3, 5),
(27, 'negociation', 'Bonne nouvelle ! Votre offre de 23.00 € a été acceptée pour l\'article : vbn,', 1, '2026-05-26 00:40:43', 4, 5),
(28, 'message', 'Nouveau message de le vendeur sur l\'article : vbn,', 1, '2026-05-26 00:40:46', 4, 5),
(29, 'negociation', 'Votre offre pour l\'article jkl a été refusée.', 1, '2026-05-26 00:40:51', 4, 4),
(30, 'message', 'Nouvelle offre de 40 € sur l\'article : jkl', 1, '2026-05-26 00:40:55', 4, 4),
(31, 'message', 'Nouvelle offre de 60 € sur l\'article : jkl', 1, '2026-05-26 00:43:35', 4, 4),
(32, 'negociation', 'Votre offre pour l\'article jkl a été refusée.', 1, '2026-05-26 00:43:46', 4, 4),
(33, 'message', 'Nouvelle offre de 30 € sur l\'article : jkl', 1, '2026-05-26 00:53:26', 4, 4),
(34, 'negociation', 'L\'offre pour l\'article jkl a été refusée.', 1, '2026-05-26 00:53:46', 3, 4),
(35, 'message', 'Nouvelle offre de 44 € sur l\'article : jkl', 1, '2026-05-26 10:01:35', 4, 4),
(36, 'vente', 'Félicitations ! Votre article \'qsd\' a été vendu pour 12 €.', 1, '2026-05-26 17:48:46', 3, 21),
(37, 'negociation', 'Nouvelle offre de 34 € sur votre article : ', 1, '2026-05-26 18:10:12', 3, 6),
(38, 'negociation', 'Nouvelle offre de 2 € sur votre article : BITE', 1, '2026-05-26 18:25:59', 3, 6),
(39, 'negociation', 'L\'offre pour l\'article BITE a été refusée.', 1, '2026-05-26 18:26:34', 4, 6),
(40, 'message', 'Nouvelle offre de 3 € sur l\'article : BITE', 1, '2026-05-26 18:26:39', 4, 6),
(41, 'negociation', 'L\'offre pour l\'article BITE a été refusée.', 1, '2026-05-26 18:26:53', 3, 6),
(42, 'message', 'Nouvelle offre de 34 € sur l\'article : BITE', 1, '2026-05-26 18:27:00', 3, 6),
(43, 'negociation', 'L\'offre pour l\'article BITE a été refusée.', 1, '2026-05-26 18:27:18', 4, 6),
(44, 'message', 'Nouvelle offre de 23 € sur l\'article : BITE', 1, '2026-05-26 18:27:28', 4, 6),
(45, 'negociation', 'L\'offre de 23 € a été acceptée pour l\'article : BITE', 1, '2026-05-26 18:39:26', 3, 6),
(46, 'message', 'Nouveau message de l\'acheteur sur l\'article : BITE', 1, '2026-05-26 18:39:29', 3, 6),
(47, 'message', 'Nouveau message de l\'acheteur sur l\'article : BITE', 1, '2026-05-26 19:06:08', 3, 6),
(48, 'message', 'Nouveau message de le vendeur sur l\'article : BITE', 1, '2026-05-26 19:06:29', 4, 6),
(49, 'message', 'Nouveau message de l\'acheteur sur l\'article : BITE', 1, '2026-05-26 19:07:16', 3, 6),
(50, 'message', 'Nouveau message de l\'acheteur sur l\'article : BITE', 1, '2026-05-26 19:07:19', 3, 6),
(51, 'message', 'Nouveau message de l\'acheteur sur l\'article : BITE', 1, '2026-05-26 19:07:22', 3, 6),
(52, 'message', 'Nouveau message de le vendeur sur l\'article : BITE', 1, '2026-05-26 19:09:45', 4, 6),
(53, 'message', 'Nouveau message de l\'acheteur sur l\'article : BITE', 1, '2026-05-26 19:13:28', 3, 6),
(54, 'message', 'Nouveau message de l\'acheteur sur l\'article : BITE', 1, '2026-05-26 19:18:45', 3, 6),
(55, 'message', 'Nouveau message de l\'acheteur sur l\'article : BITE', 1, '2026-05-26 19:18:52', 3, 6),
(56, 'message', 'Nouveau message de l\'acheteur sur l\'article : BITE', 1, '2026-05-26 23:38:24', 3, 6),
(57, 'negociation', 'L\'offre de 44 € a été acceptée pour l\'article : jkl', 1, '2026-05-26 23:38:47', 3, 4),
(58, 'message', 'Nouveau message de l\'acheteur sur l\'article : jkl', 1, '2026-05-26 23:38:59', 3, 4),
(59, 'negociation', 'Nouvelle offre de 35 € sur votre article : jkl', 1, '2026-05-26 23:39:54', 3, 7),
(60, 'vente', 'Félicitations ! Votre article \'jkl\' a été vendu pour 45 €.', 1, '2026-05-26 23:49:26', 3, 19),
(61, 'enchere', 'Nouvelle enchère de 34 € sur votre article : qsdf', 1, '2026-05-27 11:33:30', 4, 24),
(62, 'enchere', 'Votre enchère pour \'qsdf\' est terminée sans aucune offre. L\'article a été supprimé du catalogue.', 1, '2026-05-27 11:34:04', 4, 23),
(63, 'enchere', 'Félicitations ! Vous avez gagné l\'enchère pour \'qsdf\' à 34.00 €. L\'article est dans votre panier.', 1, '2026-05-27 11:34:04', 3, 24),
(64, 'vente', 'Votre enchère pour \'qsdf\' est terminée. Vendue pour 34.00 €.', 1, '2026-05-27 11:34:04', 4, 24),
(65, 'negociation', 'Nouvelle offre de 13 € sur votre article : Polo lacoste', 1, '2026-05-27 14:18:20', 4, 8),
(66, 'message', 'Nouveau message de le vendeur sur l\'article : Polo lacoste', 0, '2026-05-27 14:21:00', 3, 8),
(67, 'message', 'Nouveau message de l\'acheteur sur l\'article : Polo lacoste', 1, '2026-05-27 14:21:06', 4, 8),
(68, 'negociation', 'L\'offre pour l\'article Polo lacoste a été refusée.', 0, '2026-05-27 14:21:15', 3, 8),
(69, 'message', 'Nouveau message de l\'acheteur sur l\'article : Polo lacoste', 1, '2026-05-27 14:21:27', 4, 8),
(70, 'vente', 'Félicitations ! Votre article \'Polo lacoste\' a été vendu pour 20 €.', 1, '2026-05-27 14:29:19', 4, 25),
(71, 'avis', 'Vous avez reçu une nouvelle note de 4/5 !', 1, '2026-05-27 14:29:41', 4, 12),
(72, 'vente', 'Félicitations ! Votre article \'Haut pour la plage\' a été vendu pour 30 €.', 1, '2026-05-27 14:31:01', 4, 28),
(73, 'avis', 'Vous avez reçu une nouvelle note de 2/5 !', 1, '2026-05-27 14:31:24', 4, 13),
(74, 'negociation', 'Nouvelle offre de 27 € sur votre article : Sweat pull Zippé ralph Lauren', 1, '2026-05-27 14:33:37', 5, 9),
(75, 'negociation', 'L\'offre de 27 € a été acceptée pour l\'article : Sweat pull Zippé ralph Lauren', 1, '2026-05-27 14:33:44', 7, 9),
(76, 'message', 'Nouveau message de l\'acheteur sur l\'article : Sweat pull Zippé ralph Lauren', 1, '2026-05-27 14:34:21', 5, 9),
(77, 'vente', 'Félicitations ! Votre article \'Sweat pull Zippé ralph Lauren\' a été vendu pour 35 €.', 1, '2026-05-27 14:35:22', 5, 33),
(78, 'avis', 'Vous avez reçu une nouvelle note de 4/5 !', 1, '2026-05-27 14:35:33', 5, 14),
(79, 'enchere', 'Nouvelle enchère de 46 € sur votre article : Botine UGG', 0, '2026-05-27 14:39:54', 4, 26);

-- --------------------------------------------------------

--
-- Structure de la table `offre`
--

CREATE TABLE `offre` (
  `id_offre` int(11) NOT NULL,
  `montant_offre` decimal(10,2) NOT NULL,
  `date_offre` datetime DEFAULT CURRENT_TIMESTAMP,
  `id_enchere` int(11) NOT NULL,
  `id_user` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `offre`
--

INSERT INTO `offre` (`id_offre`, `montant_offre`, `date_offre`, `id_enchere`, `id_user`) VALUES
(2, '46.00', '2026-05-27 14:39:54', 7, 7);

-- --------------------------------------------------------

--
-- Structure de la table `panier`
--

CREATE TABLE `panier` (
  `id_panier` int(11) NOT NULL,
  `date_ajout` datetime DEFAULT CURRENT_TIMESTAMP,
  `id_user` int(11) NOT NULL,
  `id_annonce` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `panier`
--

INSERT INTO `panier` (`id_panier`, `date_ajout`, `id_user`, `id_annonce`) VALUES
(4, '2026-05-27 16:25:38', 9, 53);

-- --------------------------------------------------------

--
-- Structure de la table `transaction`
--

CREATE TABLE `transaction` (
  `id_transaction` int(11) NOT NULL,
  `montant_transaction` decimal(10,2) NOT NULL,
  `mode_transaction` varchar(50) NOT NULL,
  `statut_transaction` varchar(50) DEFAULT 'finalisee',
  `date_transaction` datetime DEFAULT CURRENT_TIMESTAMP,
  `id_annonce` int(11) NOT NULL,
  `id_user_acheteur` int(11) NOT NULL,
  `id_user_vendeur` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `transaction`
--

INSERT INTO `transaction` (`id_transaction`, `montant_transaction`, `mode_transaction`, `statut_transaction`, `date_transaction`, `id_annonce`, `id_user_acheteur`, `id_user_vendeur`) VALUES
(12, '20.00', 'CB', 'finalisee', '2026-05-27 14:29:19', 25, 6, 4),
(13, '30.00', 'CB', 'finalisee', '2026-05-27 14:31:01', 28, 6, 4),
(14, '35.00', 'CB', 'finalisee', '2026-05-27 14:35:22', 33, 7, 5);

-- --------------------------------------------------------

--
-- Structure de la table `user`
--

CREATE TABLE `user` (
  `id_user` int(11) NOT NULL,
  `pseudo_user` varchar(50) NOT NULL,
  `email_user` varchar(50) NOT NULL,
  `mdp_user` varchar(255) NOT NULL,
  `nom_user` varchar(50) DEFAULT NULL,
  `prenom_user` varchar(50) DEFAULT NULL,
  `tel_user` varchar(20) DEFAULT NULL,
  `adresse_user` varchar(100) DEFAULT NULL,
  `note_user` decimal(3,2) DEFAULT '0.00',
  `etat_user` varchar(50) DEFAULT 'actif',
  `role_user` varchar(50) DEFAULT 'acheteur'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `user`
--

INSERT INTO `user` (`id_user`, `pseudo_user`, `email_user`, `mdp_user`, `nom_user`, `prenom_user`, `tel_user`, `adresse_user`, `note_user`, `etat_user`, `role_user`) VALUES
(1, 'admin', 'admin', 'admin123', NULL, NULL, NULL, NULL, '0.00', 'actif', 'admin'),
(4, 'Joe', 'joseph.khoury@gmail.com', '123456789', 'el khoury', 'joseph', NULL, '7 rue des oliviers', '0.00', 'actif', 'vendeur'),
(5, 'AlexisTM17', 'alexistentenier@gmail.com', 'Salto2846', 'Tentenier Marionneau', 'Alexis', NULL, '6 rue des romarins 17420', '0.00', 'actif', 'vendeur'),
(6, 'Polo', 'paul.copin@outlook.com', '123456789', 'Copin', 'Paul', NULL, '6 rue riboutté', '0.00', 'actif', 'acheteur'),
(7, 'FFDLT', 'fdlt@gmail.com', 'piscine234', 'De la Tour', 'Francois', NULL, '8 rue de sauvages', '0.00', 'actif', 'vendeur'),
(8, 'LEO', 'leopain@gmail.com', 'leo123456', 'dupain', 'leo', NULL, '67 avenue de la boulangerie', '0.00', 'actif', 'vendeur'),
(9, 'BUBU', 'bubu@gmail.com', 'BELLEROSE', 'Bureau', 'Alexis', NULL, 'Cognac', '0.00', 'actif', 'vendeur'),
(10, 'clem', 'clemaud@gmail.com', 'clem123456', 'Audebert', 'Clemence', NULL, '33 rue des canard', '0.00', 'actif', 'vendeur');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `annonce`
--
ALTER TABLE `annonce`
  ADD PRIMARY KEY (`id_annonce`),
  ADD KEY `id_user` (`id_user`),
  ADD KEY `id_categorie` (`id_categorie`);

--
-- Index pour la table `avis`
--
ALTER TABLE `avis`
  ADD PRIMARY KEY (`id_avis`),
  ADD KEY `id_transaction` (`id_transaction`),
  ADD KEY `id_user_auteur` (`id_user_auteur`),
  ADD KEY `id_user_cible` (`id_user_cible`);

--
-- Index pour la table `categorie`
--
ALTER TABLE `categorie`
  ADD PRIMARY KEY (`id_categorie`),
  ADD KEY `id_categorie_mere` (`id_categorie_mere`);

--
-- Index pour la table `echange`
--
ALTER TABLE `echange`
  ADD PRIMARY KEY (`id_echange`),
  ADD KEY `id_negociation` (`id_negociation`),
  ADD KEY `id_user` (`id_user`);

--
-- Index pour la table `enchere`
--
ALTER TABLE `enchere`
  ADD PRIMARY KEY (`id_enchere`),
  ADD KEY `id_annonce` (`id_annonce`),
  ADD KEY `id_user_gagnant` (`id_user_gagnant`);

--
-- Index pour la table `favoris`
--
ALTER TABLE `favoris`
  ADD PRIMARY KEY (`id_favoris`),
  ADD UNIQUE KEY `id_user` (`id_user`,`id_annonce`),
  ADD KEY `id_annonce` (`id_annonce`);

--
-- Index pour la table `image`
--
ALTER TABLE `image`
  ADD PRIMARY KEY (`id_image`),
  ADD KEY `id_annonce` (`id_annonce`);

--
-- Index pour la table `negociation`
--
ALTER TABLE `negociation`
  ADD PRIMARY KEY (`id_negociation`),
  ADD KEY `id_annonce` (`id_annonce`),
  ADD KEY `id_user_acheteur` (`id_user_acheteur`),
  ADD KEY `id_user_vendeur` (`id_user_vendeur`);

--
-- Index pour la table `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`id_notification`),
  ADD KEY `id_user` (`id_user`);

--
-- Index pour la table `offre`
--
ALTER TABLE `offre`
  ADD PRIMARY KEY (`id_offre`),
  ADD KEY `id_enchere` (`id_enchere`),
  ADD KEY `id_user` (`id_user`);

--
-- Index pour la table `panier`
--
ALTER TABLE `panier`
  ADD PRIMARY KEY (`id_panier`),
  ADD UNIQUE KEY `id_user` (`id_user`,`id_annonce`),
  ADD KEY `id_annonce` (`id_annonce`);

--
-- Index pour la table `transaction`
--
ALTER TABLE `transaction`
  ADD PRIMARY KEY (`id_transaction`),
  ADD KEY `id_annonce` (`id_annonce`),
  ADD KEY `id_user_acheteur` (`id_user_acheteur`),
  ADD KEY `id_user_vendeur` (`id_user_vendeur`);

--
-- Index pour la table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `pseudo_user` (`pseudo_user`),
  ADD UNIQUE KEY `email_user` (`email_user`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `annonce`
--
ALTER TABLE `annonce`
  MODIFY `id_annonce` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT pour la table `avis`
--
ALTER TABLE `avis`
  MODIFY `id_avis` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT pour la table `categorie`
--
ALTER TABLE `categorie`
  MODIFY `id_categorie` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT pour la table `echange`
--
ALTER TABLE `echange`
  MODIFY `id_echange` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT pour la table `enchere`
--
ALTER TABLE `enchere`
  MODIFY `id_enchere` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT pour la table `favoris`
--
ALTER TABLE `favoris`
  MODIFY `id_favoris` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT pour la table `image`
--
ALTER TABLE `image`
  MODIFY `id_image` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=111;

--
-- AUTO_INCREMENT pour la table `negociation`
--
ALTER TABLE `negociation`
  MODIFY `id_negociation` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT pour la table `notification`
--
ALTER TABLE `notification`
  MODIFY `id_notification` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=80;

--
-- AUTO_INCREMENT pour la table `offre`
--
ALTER TABLE `offre`
  MODIFY `id_offre` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `panier`
--
ALTER TABLE `panier`
  MODIFY `id_panier` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `transaction`
--
ALTER TABLE `transaction`
  MODIFY `id_transaction` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT pour la table `user`
--
ALTER TABLE `user`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `annonce`
--
ALTER TABLE `annonce`
  ADD CONSTRAINT `annonce_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`),
  ADD CONSTRAINT `annonce_ibfk_2` FOREIGN KEY (`id_categorie`) REFERENCES `categorie` (`id_categorie`);

--
-- Contraintes pour la table `avis`
--
ALTER TABLE `avis`
  ADD CONSTRAINT `avis_ibfk_1` FOREIGN KEY (`id_transaction`) REFERENCES `transaction` (`id_transaction`),
  ADD CONSTRAINT `avis_ibfk_2` FOREIGN KEY (`id_user_auteur`) REFERENCES `user` (`id_user`),
  ADD CONSTRAINT `avis_ibfk_3` FOREIGN KEY (`id_user_cible`) REFERENCES `user` (`id_user`);

--
-- Contraintes pour la table `categorie`
--
ALTER TABLE `categorie`
  ADD CONSTRAINT `categorie_ibfk_1` FOREIGN KEY (`id_categorie_mere`) REFERENCES `categorie` (`id_categorie`);

--
-- Contraintes pour la table `echange`
--
ALTER TABLE `echange`
  ADD CONSTRAINT `echange_ibfk_1` FOREIGN KEY (`id_negociation`) REFERENCES `negociation` (`id_negociation`),
  ADD CONSTRAINT `echange_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`);

--
-- Contraintes pour la table `enchere`
--
ALTER TABLE `enchere`
  ADD CONSTRAINT `enchere_ibfk_1` FOREIGN KEY (`id_annonce`) REFERENCES `annonce` (`id_annonce`),
  ADD CONSTRAINT `enchere_ibfk_2` FOREIGN KEY (`id_user_gagnant`) REFERENCES `user` (`id_user`);

--
-- Contraintes pour la table `favoris`
--
ALTER TABLE `favoris`
  ADD CONSTRAINT `favoris_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`),
  ADD CONSTRAINT `favoris_ibfk_2` FOREIGN KEY (`id_annonce`) REFERENCES `annonce` (`id_annonce`);

--
-- Contraintes pour la table `image`
--
ALTER TABLE `image`
  ADD CONSTRAINT `image_ibfk_1` FOREIGN KEY (`id_annonce`) REFERENCES `annonce` (`id_annonce`);

--
-- Contraintes pour la table `negociation`
--
ALTER TABLE `negociation`
  ADD CONSTRAINT `negociation_ibfk_1` FOREIGN KEY (`id_annonce`) REFERENCES `annonce` (`id_annonce`),
  ADD CONSTRAINT `negociation_ibfk_2` FOREIGN KEY (`id_user_acheteur`) REFERENCES `user` (`id_user`),
  ADD CONSTRAINT `negociation_ibfk_3` FOREIGN KEY (`id_user_vendeur`) REFERENCES `user` (`id_user`);

--
-- Contraintes pour la table `notification`
--
ALTER TABLE `notification`
  ADD CONSTRAINT `notification_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`);

--
-- Contraintes pour la table `offre`
--
ALTER TABLE `offre`
  ADD CONSTRAINT `offre_ibfk_1` FOREIGN KEY (`id_enchere`) REFERENCES `enchere` (`id_enchere`),
  ADD CONSTRAINT `offre_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`);

--
-- Contraintes pour la table `panier`
--
ALTER TABLE `panier`
  ADD CONSTRAINT `panier_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`),
  ADD CONSTRAINT `panier_ibfk_2` FOREIGN KEY (`id_annonce`) REFERENCES `annonce` (`id_annonce`);

--
-- Contraintes pour la table `transaction`
--
ALTER TABLE `transaction`
  ADD CONSTRAINT `transaction_ibfk_1` FOREIGN KEY (`id_annonce`) REFERENCES `annonce` (`id_annonce`),
  ADD CONSTRAINT `transaction_ibfk_2` FOREIGN KEY (`id_user_acheteur`) REFERENCES `user` (`id_user`),
  ADD CONSTRAINT `transaction_ibfk_3` FOREIGN KEY (`id_user_vendeur`) REFERENCES `user` (`id_user`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
