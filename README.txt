========================================================================
                      MERCATO NOVA - GUIDE D'INSTALLATION
========================================================================

Ce projet est une plateforme web interactive. Voici les étapes pour l'installer
et l'utiliser correctement sur votre machine locale.

1. IMPORTATION DE LA BASE DE DONNÉES (BDD)
------------------------------------------
- Lancez votre outil de gestion de base de données (ex: phpMyAdmin).
- Importez directement le fichier "creationBDD.sql" situé à la racine du projet.
- Le script créera automatiquement la base de données nommée "mercato_nova" 
  et toutes ses tables.

2. CONFIGURATION DU SERVEUR LOCAL
---------------------------------
Placez le dossier complet du projet dans le répertoire de votre serveur :
- MAMP : placez le dossier dans "C:\MAMP\htdocs\"
- WAMP : placez le dossier dans "C:\wamp64\www\"
- XAMPP : placez le dossier dans "C:\xampp\htdocs\"

3. VÉRIFICATION DE LA CONNEXION (IMPORTANT)
-------------------------------------------
Selon votre logiciel, vous devrez peut-être modifier le fichier : 
"bdd/connexion.php"

- MAMP (Windows) : Le mot de passe par défaut est souvent "root".
- WAMP / XAMPP : Le mot de passe par défaut est souvent vide ("").

Ouvrez le fichier "bdd/connexion.php" et ajustez la ligne :
$password = 'votre_mot_de_passe';

4. LANCEMENT DES SERVEURS
-------------------------
- Ouvrez le panneau de contrôle de MAMP, WAMP ou XAMPP.
- Démarrez les serveurs Apache (Web) et MySQL (Base de données).
- Assurez-vous que les voyants sont au vert.

5. ACCÈS AU PROJET
------------------
- Ouvrez votre navigateur Web.
- Dans la barre d'adresse, saisissez l'URL suivante :
  http://localhost/[NOM_DU_DOSSIER]/pages/index.html

  Remplacez [NOM_DU_DOSSIER] par le nom exact du dossier que vous avez placé 
  dans htdocs ou www (par défaut : MERCATO-NOVA_WEB_2026_...).

========================================================================
Bonne navigation sur Mercato Nova !
