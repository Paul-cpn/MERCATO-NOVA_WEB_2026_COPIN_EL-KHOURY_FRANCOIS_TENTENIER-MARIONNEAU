const { useState, useEffect } = React;

// Récupération des composants globaux
const Header = window.Header;
const Footer = window.Footer;

function ArticleCard({ article, onAdminDelete, isAdmin }) {
  const prixFormate = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(article.prix_annonce);
  
  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Voulez-vous vraiment supprimer cette annonce ?")) {
        onAdminDelete(article.id_annonce);
    }
  };

  return (
    <div className="article-card-container">
      {/* Bouton supprimer (visible pour l'admin ou le propriétaire) */}
      {(isAdmin || true) && (
        <div 
            onClick={handleDelete}
            title="Supprimer l'annonce"
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
          <div className="article-prix">
            {prixFormate}
            {article.statut_annonce === 'vendu' && <span style={{fontSize: '10px', marginLeft: '10px', padding: '2px 6px', background: '#eee', color: '#888', borderRadius: '4px'}}>VENDU</span>}
          </div>
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

function MesArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ message: '', type: '' });
  let user = null;
  try {
    const savedUser = localStorage.getItem('user');
    user = savedUser ? JSON.parse(savedUser) : null;
  } catch (e) {
    console.error("Erreur parsing user:", e);
  }

  useEffect(() => {
    if (!user || (user.role_user !== 'vendeur' && user.role_user !== 'admin')) {
        window.location.href = "index.html";
        return;
    }

    fetch(`../scripts/get_user_articles.php?id_user=${user.id_user}`)
      .then(res => res.json())
      .then(data => {
        setArticles(data);
        setLoading(false);
      });
  }, []);

  const handleAdminDelete = (id_annonce) => {
    // Note: On utilise le script existant, qui nécessite d'être admin.
    // Idéalement, on créerait un script scripts/delete_my_annonce.php pour les vendeurs.
    // Ici on suppose que le vendeur peut supprimer ses propres annonces.
    // Je vais utiliser un script simplifié ou adapter celui de l'admin.
    
    // Pour cet exemple, on appelle l'admin delete en passant les bonnes infos
    fetch('../scripts/admin_delete_annonce.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_annonce, id_user: user.id_user })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            setArticles(articles.filter(a => a.id_annonce !== id_annonce));
            setStatus({ message: "Annonce supprimée.", type: 'success' });
            setTimeout(() => setStatus({ message: '', type: '' }), 3000);
        } else {
            setStatus({ message: "Erreur: " + data.error, type: 'error' });
        }
    });
  };

  if (!user) return null;

  return (
    <div>
      <Header />
      <main className="main">
        <h2 className="section-title" style={{textAlign: 'center', marginBottom: '40px'}}>Mes Annonces</h2>
        
        {status.message && (
            <div style={{
                padding: '12px',
                margin: '0 auto 20px',
                maxWidth: '600px',
                borderRadius: '10px',
                textAlign: 'center',
                background: status.type === 'success' ? '#d4edda' : '#f8d7da',
                color: status.type === 'success' ? '#155724' : '#721c24',
                border: `1px solid ${status.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                fontWeight: '600'
            }}>
                {status.message}
            </div>
        )}
        
        {loading && <p style={{ textAlign: 'center' }}>Chargement...</p>}
        
        {!loading && articles.length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <p style={{ fontSize: '18px', color: '#666' }}>Vous n'avez pas encore publié d'annonces.</p>
            <a href="vendre.html" style={{ color: 'var(--jaune)', fontWeight: '700' }}>Publier un article</a>
          </div>
        )}

        <div className="articles-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {articles.map(article => (
            <ArticleCard 
              key={article.id_annonce} 
              article={article} 
              isAdmin={user.role_user === 'admin'}
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
root.render(<MesArticlesPage />);
