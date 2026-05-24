const { useState, useEffect } = React;

// Composant Header commun
window.Header = function() {
  // Déterminer le chemin vers l'index selon la page actuelle
  const isSubPage = window.location.pathname.includes('/pages/');
  const indexPath = isSubPage ? 'index.html' : 'pages/index.html'; // Ajustement si on est à la racine ou dans /pages/
  // Note: Dans votre structure actuelle, index.html est dans /pages/ donc le lien relatif est juste index.html
  const logoLink = "index.html";

  return (
    <header className="header">
      <a href={logoLink} className="header-logo">
        <div className="logo-icon"></div>
        <span className="logo-name">Mercato Nova</span>
      </a>
      <div className="header-search">
        <input type="text" placeholder="Rechercher un article..." />
        <button className="search-btn">Rechercher</button>
      </div>
      <nav className="header-actions">
        <a href="#" className="action-item">
          <span className="action-icon cart-icon"></span>
          <span>Panier</span>
        </a>
        <a href="#" className="action-item">
          <span className="action-icon heart-icon"></span>
          <span>Favoris</span>
        </a>
        <a href="#" className="action-item">
          <span className="action-icon message-icon"></span>
          <span>Messages</span>
        </a>
        <a href="#" className="action-item">
          <span className="action-icon user-icon"></span>
          <span>Mon compte</span>
        </a>
      </nav>
    </header>
  );
};

// Composant NavBar commun
window.NavBar = function() {
  return (
    <nav className="navbar">
      <a href="#" className="nav-link">Homme</a>
      <a href="#" className="nav-link">Femme</a>
      <a href="#" className="nav-link">Enfant</a>
    </nav>
  );
};

// Composant Footer commun
window.Footer = function() {
  return (
    <footer className="footer">
      <div className="footer-links">
        <a href="#" className="footer-link">À propos</a>
        <a href="#" className="footer-link">FAQ</a>
        <a href="#" className="footer-link">Contactez-nous</a>
      </div>
    </footer>
  );
};
