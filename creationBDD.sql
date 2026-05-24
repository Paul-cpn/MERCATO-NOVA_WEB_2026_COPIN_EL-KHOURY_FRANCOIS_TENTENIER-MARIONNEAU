CREATE TABLE annonce (
    id_annonce              INTEGER         PRIMARY KEY AUTO_INCREMENT,
    titre_annonce           VARCHAR(50)     NOT NULL,
    description_annonce     VARCHAR(300),
    prix_annonce            DECIMAL(10,2)   NOT NULL,
    etat_objet_annonce      ENUM('neuf', 'tres_bon', 'bon', 'acceptable', 'mauvais') NOT NULL,
    type_vente_annonce      VARCHAR(50)     NOT NULL,
    taille_annonce          VARCHAR(50),
    couleur_annonce         VARCHAR(100),
    marque_annonce          VARCHAR(100),
    statut_annonce          VARCHAR(50)     DEFAULT 'active',
    date_annonce            DATETIME        DEFAULT CURRENT_TIMESTAMP,
    id_user                 INTEGER         NOT NULL,
    id_categorie            INTEGER,
    FOREIGN KEY (id_user)       REFERENCES user(id_user),
    FOREIGN KEY (id_categorie)  REFERENCES categorie(id_categorie)
);

CREATE TABLE image (
    id_image        INTEGER         PRIMARY KEY AUTO_INCREMENT,
    url_image       VARCHAR(500)    NOT NULL,
    ordre_image     INTEGER         DEFAULT 1,
    id_annonce      INTEGER         NOT NULL,
    FOREIGN KEY (id_annonce) REFERENCES annonce(id_annonce)
);

CREATE TABLE enchere (
    id_enchere              INTEGER         PRIMARY KEY AUTO_INCREMENT,
    prix_depart_enchere     DECIMAL(10,2)   NOT NULL,
    meilleure_offre_enchere DECIMAL(10,2)   DEFAULT NULL,
    date_fin_enchere        DATETIME        NOT NULL,
    statut_enchere          VARCHAR(50)     DEFAULT 'en_cours',
    id_annonce              INTEGER         NOT NULL,
    id_user_gagnant         INTEGER         DEFAULT NULL,
    FOREIGN KEY (id_annonce)        REFERENCES annonce(id_annonce),
    FOREIGN KEY (id_user_gagnant)   REFERENCES user(id_user)
);

CREATE TABLE offre (
    id_offre        INTEGER         PRIMARY KEY AUTO_INCREMENT,
    montant_offre   DECIMAL(10,2)   NOT NULL,
    date_offre      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    id_enchere      INTEGER         NOT NULL,
    id_user         INTEGER         NOT NULL,
    FOREIGN KEY (id_enchere)    REFERENCES enchere(id_enchere),
    FOREIGN KEY (id_user)       REFERENCES user(id_user)
);

CREATE TABLE negociation (
    id_negociation              INTEGER         PRIMARY KEY AUTO_INCREMENT,
    offre_initiale_negociation  DECIMAL(10,2)   NOT NULL,
    statut_negociation          VARCHAR(50)     DEFAULT 'en_cours',
    date_negociation            DATETIME        DEFAULT CURRENT_TIMESTAMP,
    id_annonce                  INTEGER         NOT NULL,
    id_user_acheteur            INTEGER         NOT NULL,
    id_user_vendeur             INTEGER         NOT NULL,
    FOREIGN KEY (id_annonce)        REFERENCES annonce(id_annonce),
    FOREIGN KEY (id_user_acheteur)  REFERENCES user(id_user),
    FOREIGN KEY (id_user_vendeur)   REFERENCES user(id_user)
);

CREATE TABLE echange (
    id_echange          INTEGER         PRIMARY KEY AUTO_INCREMENT,
    montant_echange     DECIMAL(10,2),
    message_echange     VARCHAR(500),
    date_echange        DATETIME        DEFAULT CURRENT_TIMESTAMP,
    id_negociation      INTEGER         NOT NULL,
    id_user             INTEGER         NOT NULL,
    FOREIGN KEY (id_negociation)    REFERENCES negociation(id_negociation),
    FOREIGN KEY (id_user)           REFERENCES user(id_user)
);

CREATE TABLE transaction (
    id_transaction      INTEGER         PRIMARY KEY AUTO_INCREMENT,
    montant_transaction DECIMAL(10,2)   NOT NULL,
    mode_transaction    VARCHAR(50)     NOT NULL,
    statut_transaction  VARCHAR(50)     DEFAULT 'finalisee',
    date_transaction    DATETIME        DEFAULT CURRENT_TIMESTAMP,
    id_annonce          INTEGER         NOT NULL,
    id_user_acheteur    INTEGER         NOT NULL,
    id_user_vendeur     INTEGER         NOT NULL,
    FOREIGN KEY (id_annonce)        REFERENCES annonce(id_annonce),
    FOREIGN KEY (id_user_acheteur)  REFERENCES user(id_user),
    FOREIGN KEY (id_user_vendeur)   REFERENCES user(id_user)
);

CREATE TABLE avis (
    id_avis             INTEGER         PRIMARY KEY AUTO_INCREMENT,
    note_avis           INTEGER         NOT NULL CHECK (note_avis BETWEEN 1 AND 5),
    commentaire_avis    VARCHAR(300),
    date_avis           DATETIME        DEFAULT CURRENT_TIMESTAMP,
    id_transaction      INTEGER         NOT NULL,
    id_user_auteur      INTEGER         NOT NULL,
    id_user_cible       INTEGER         NOT NULL,
    FOREIGN KEY (id_transaction)    REFERENCES transaction(id_transaction),
    FOREIGN KEY (id_user_auteur)    REFERENCES user(id_user),
    FOREIGN KEY (id_user_cible)     REFERENCES user(id_user)
);

CREATE TABLE notification (
    id_notification     INTEGER         PRIMARY KEY AUTO_INCREMENT,
    type_notification   VARCHAR(50)     NOT NULL,
    texte_notification  VARCHAR(300)    NOT NULL,
    lu_notification     BOOLEAN         DEFAULT FALSE,
    date_notification   DATETIME        DEFAULT CURRENT_TIMESTAMP,
    id_user             INTEGER         NOT NULL,
    FOREIGN KEY (id_user) REFERENCES user(id_user)
);

CREATE TABLE favoris (
    id_favoris      INTEGER     PRIMARY KEY AUTO_INCREMENT,
    date_favoris    DATETIME    DEFAULT CURRENT_TIMESTAMP,
    id_user         INTEGER     NOT NULL,
    id_annonce      INTEGER     NOT NULL,
    UNIQUE (id_user, id_annonce),
    FOREIGN KEY (id_user)       REFERENCES user(id_user),
    FOREIGN KEY (id_annonce)    REFERENCES annonce(id_annonce)
);