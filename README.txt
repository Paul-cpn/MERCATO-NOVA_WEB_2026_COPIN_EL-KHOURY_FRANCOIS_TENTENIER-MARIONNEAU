========================================================================
                      MERCATO NOVA - GUIDE D'INSTALLATION
========================================================================

Ce projet est une plateforme web interactive. Voici les étapes pour l'installer
et l'utiliser correctement sur votre machine locale.

1. IMPORTATION DE LA BASE DE DONNÉES (BDD)
------------------------------------------
- Lancez votre outil de gestion de base de données (ex: phpMyAdmin).
- Créez une nouvelle base de données nommée : mercato_nova
- Importez le fichier "creationBDD.sql" situé à la racine du projet dans 
  cette base de données.

2. CONFIGURATION DU SERVEUR LOCAL
---------------------------------
Selon l'outil que vous utilisez, placez le dossier complet du projet dans le
répertoire spécifique :

- MAMP : placez le dossier dans "C:\MAMP\htdocs\"
- WAMP : placez le dossier dans "C:\wamp64\www\"

3. LANCEMENT DES SERVEURS
-------------------------
- Ouvrez le panneau de contrôle de MAMP ou WAMP.
- Démarrez les deux serveurs : le serveur Web (Apache) et le serveur de base
  de données (MySQL). Assurez-vous qu'ils sont bien allumés (voyants verts).

4. ACCÈS AU PROJET
------------------
- Ouvrez votre navigateur Web (Chrome, Firefox, etc.).
- Dans la barre d'adresse, saisissez l'URL suivante :
  http://localhost/MERCATO-NOVA_WEB_2026_COPIN_EL-KHOURY_FRANCOIS_TENTENIER-MARIONNEAU/pages/index.html

  (Note : Adaptez le nom du dossier dans l'URL si vous l'avez renommé).

========================================================================
Bonne navigation sur Mercato Nova !
