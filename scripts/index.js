const { useState, useEffect } = React;

function ArticleCard({ article }) {
  // Formatage du prix
  const prixFormate = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(article.prix_annonce);

  return (
    <a href="#" className="article-card">
      <div className="article-info">
        <div className="article-titre">{article.titre_annonce}</div>
        <div className="article-prix">{prixFormate}</div>
        <div className="article-details">
          {article.taille_annonce && <div className="article-detail">Taille : <span>{article.taille_annonce}</span></div>}
          {article.couleur_annonce && <div className="article-detail">Couleur : <span>{article.couleur_annonce}</span></div>}
        </div>
      </div>
      <div className="article-image" style={{ 
          backgroundColor: '#e0e0e0',
          backgroundImage: article.image_url ? `url(${article.image_url})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
        {!article.image_url && 'Photo'}
      </div>
    </a>
  );
}

function ArticlesSection() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // On appelle notre fichier PHP
    fetch('../scripts/get_articles.php')
      .then(response => {
        if (!response.ok) {
          throw new Error('Erreur réseau lors de la récupération');
        }
        return response.json();
      })
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        }
        setArticles(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Erreur :", error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  return (
    <main className="main">
      <h2 className="section-title">Dernières annonces</h2>
      
      {loading && <p style={{ padding: '20px' }}>Chargement des annonces...</p>}
      {error && <p style={{ padding: '20px', color: 'red' }}>Erreur : {error}</p>}
      
      {!loading && !error && articles.length === 0 && (
        <p style={{ padding: '20px' }}>Aucune annonce disponible pour le moment.</p>
      )}

      <div className="articles-grid">
        {articles.map(article => (
          <ArticleCard key={article.id_annonce} article={article} />
        ))}
      </div>
    </main>
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
