const { useState, useEffect } = React;

function ArticleCard({ article, isFav, onFavToggle, isAdmin, onAdminDelete }) {
  const prixFormate = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(article.prix_annonce);
  
  const handleFavClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onFavToggle(article.id_annonce);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Voulez-vous vraiment supprimer cette annonce (Admin) ?")) {
        onAdminDelete(article.id_annonce);
    }
  };

  return (
    <div className="article-card-container">
      <div className={`btn-fav-card active`} onClick={handleFavClick}>
      </div>

      {isAdmin && (
        <div 
            onClick={handleDelete}
            title="Supprimer l'annonce (Admin)"
            style={{
                position: 'absolute', 
                top: '10px', 
                left: '10px', 
                width: '24px', 
                height: '24px', 
                background: '#ff5757', 
                color: '#fff', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer', 
                zIndex: 10, 
                fontSize: '18px',
                fontWeight: '800',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                lineHeight: 0
            }}
        >&times;</div>
      )}

      <a href={`produit.html?id=${article.id_annonce}`} className="article-card">
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
    </div>
  );
}

function FavorisPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user && user.role_user === 'admin';

  const fetchFavoris = () => {
    if (!user) {
        setLoading(false);
        return;
    }
    fetch(`../scripts/get_favoris.php?id_user=${user.id_user}`)
      .then(res => res.json())
      .then(data => {
        setArticles(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFavoris();
  }, []);

  const handleFavToggle = (id_annonce) => {
    fetch('../scripts/toggle_favorite.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_annonce, id_user: user.id_user })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setArticles(articles.filter(a => a.id_annonce !== id_annonce));
      }
    });
  };

  const handleAdminDelete = (id_annonce) => {
    fetch('../scripts/admin_delete_annonce.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_annonce, id_user: user.id_user })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            setArticles(articles.filter(a => a.id_annonce !== id_annonce));
            alert("Annonce supprimée.");
        } else {
            alert("Erreur: " + data.error);
        }
    });
  };

  if (!user) {
    return (
      <div>
        <Header />
        <main className="main" style={{textAlign: 'center', padding: '100px 20px'}}>
          <h2>Connectez-vous pour voir vos favoris</h2>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main className="main">
        <h2 className="section-title" style={{textAlign: 'center', marginBottom: '40px'}}>Mes Favoris</h2>
        
        {loading && <p style={{ textAlign: 'center' }}>Chargement...</p>}
        
        {!loading && articles.length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <p style={{ fontSize: '18px', color: '#666' }}>Vous n'avez pas encore d'articles en favoris.</p>
            <a href="index.html" style={{ color: 'var(--jaune)', fontWeight: '700' }}>Parcourir les annonces</a>
          </div>
        )}

        <div className="articles-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {articles.map(article => (
            <ArticleCard 
              key={article.id_annonce} 
              article={article} 
              isFav={true} 
              onFavToggle={handleFavToggle}
              isAdmin={isAdmin}
              onAdminDelete={handleAdminDelete}
            />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<FavorisPage />);
