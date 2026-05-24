const { useState } = React;

const articles = [
  { id: 1, titre: "Jean slim délavé", prix: "25,00 €", taille: "M", couleur: "Bleu", bg: "#b8d4e8" },
  { id: 2, titre: "Robe fleurie d'été", prix: "18,00 €", taille: "S", couleur: "Rose", bg: "#f5c6cb" },
  { id: 3, titre: "Veste en cuir noir", prix: "55,00 €", taille: "L", couleur: "Noir", bg: "#c8c8c8" },
  { id: 4, titre: "Pull en laine douce", prix: "22,00 €", taille: "M", couleur: "Beige", bg: "#e8dcc8" },
  { id: 5, titre: "Manteau long gris", prix: "45,00 €", taille: "M", couleur: "Gris", bg: "#d0d0d0" },
  { id: 6, titre: "Chemise à carreaux", prix: "15,00 €", taille: "XL", couleur: "Rouge", bg: "#f5b8b8" },
  { id: 7, titre: "Jogging enfant", prix: "12,00 €", taille: "4 ans", couleur: "Bleu marine", bg: "#b8c8e8" },
  { id: 8, titre: "T-shirt rayé", prix: "8,00 €", taille: "6 ans", couleur: "Blanc/Bleu", bg: "#d8e8f5" },
];

function Header() {
  return (
    <header className="header">
      <a href="#" className="header-logo">
        <div className="logo-icon">MN</div>
        <span className="logo-name">Mercato Nova</span>
      </a>
      <div className="header-search">
        <input type="text" placeholder="Rechercher un article..." />
        <button className="search-btn">Rechercher</button>
      </div>
      <nav className="header-actions">
        <a href="#" className="action-item">
          <span className="action-icon">🛒</span>
          <span>Panier</span>
        </a>
        <a href="#" className="action-item">
          <span className="action-icon">❤️</span>
          <span>Favoris</span>
        </a>
        <a href="#" className="action-item">
          <span className="action-icon">✉️</span>
          <span>Messages</span>
        </a>
        <a href="#" className="action-item">
          <span className="action-icon">👤</span>
          <span>Mon compte</span>
        </a>
      </nav>
    </header>
  );
}

function NavBar() {
  return (
    <nav className="navbar">
      <a href="#" className="nav-link">Homme</a>
      <a href="#" className="nav-link">Femme</a>
      <a href="#" className="nav-link">Enfant</a>
    </nav>
  );
}

function ArticleCard({ article }) {
  return (
    <a href="#" className="article-card">
      <div className="article-info">
        <div className="article-titre">{article.titre}</div>
        <div className="article-prix">{article.prix}</div>
        <div className="article-details">
          <div className="article-detail">Taille : <span>{article.taille}</span></div>
          <div className="article-detail">Couleur : <span>{article.couleur}</span></div>
        </div>
      </div>
      <div className="article-image" style={{ backgroundColor: article.bg }}>
        Photo
      </div>
    </a>
  );
}

function ArticlesSection() {
  return (
    <main className="main">
      <h2 className="section-title">Dernières annonces</h2>
      <div className="articles-grid">
        {articles.map(article => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </main>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-links">
        <a href="#" className="footer-link">À propos</a>
        <a href="#" className="footer-link">FAQ</a>
        <a href="#" className="footer-link">Contactez-nous</a>
      </div>
    </footer>
  );
}

function App() {
  return (
    <div>
      <Header />
      <NavBar />
      <ArticlesSection />
      <Footer />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
