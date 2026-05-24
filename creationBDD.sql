CREATE TABLE annonce (
    id_annonce INT PRIMARY KEY AUTO_INCREMENT,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    prix DECIMAL(10, 2) NOT NULL,
    etat ENUM('neuf', 'tres_bon', 'bon', 'acceptable', 'mauvais') NOT NULL,
    taille VARCHAR(50),
    couleur VARCHAR(100),
    marque VARCHAR(100),
    matiere VARCHAR(100),
    date_publication DATETIME DEFAULT CURRENT_TIMESTAMP
);
