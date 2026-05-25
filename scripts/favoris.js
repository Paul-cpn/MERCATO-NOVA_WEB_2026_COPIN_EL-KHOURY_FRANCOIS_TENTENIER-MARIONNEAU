const { useState, useEffect } = React;

// Récupération des composants globaux
const Header = window.Header;
const Footer = window.Footer;

function ArticleCard({ article, isFav, onFavToggle, isAdmin, onAdminDelete, setNotification }) {
  const prixFormate = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(article.prix_annonce);
  
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    let panier = [];
    try {
      // 1. Récupération sécurisée et parsing du panier
      const localData = localStorage.getItem('panier');
      panier = localData ? JSON.parse(localData) : [];
      
      // Sécurité : Si le contenu du localStorage n'est pas un tableau, on le réinitialise
      if (!Array.isArray(panier)) {
        panier = [];
      }
    } catch (err) {
      panier = [];
    }

    // 2. Vérification stricte de présence (conversion en String pour éviter les conflits Integer/String)
    const dejaPresent = panier.some(item => 
      item && item.id_annonce && item.id_annonce.toString() === article.id_annonce.toString()
    );

    if (!dejaPresent) {
      // 3. Ajout de l'article complet au tableau
      panier.push(article);
      
      // 4. Sauvegarde dans le localStorage
      localStorage.setItem('panier', JSON.stringify(panier));
      
      // 5. Notification visuelle de succès
      setNotification({ message: `"${article.titre_annonce}" ajouté au panier !`, type: 'success' });
      setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    } else {
      // Notification visuelle d'information si déjà présent
      setNotification({ message: "Cet article est déjà dans votre panier.", type: 'error' });
      setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    }
  };

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
    <div className="custom-mercato-card">
      {/* Bouton supprimer Admin */}
      {isAdmin && (
        <div onClick={handleDelete} title="Supprimer l'annonce (Admin)" className="btn-admin-delete-left">
          &times;
        </div>
      )}

      {/* Bouton Favori */}
      <button className="btn-fav-card-right active" onClick={handleFavClick} title="Retirer des favoris">
        <svg viewBox="0 0 24 24" style={{ width: '18px', height: '18px', fill: '#ff5757' }}>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </button>

      <a href={`produit.html?id=${article.id_annonce}`} className="article-card-link">
        {/* Zone Supérieure : Image de l'article */}
        <div className="article-image-area" style={{ 
            backgroundColor: '#e0e0e0',
            backgroundImage: article.image_url ? `url(${article.image_url})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
          {!article.image_url && <span className="no-photo-text">Photo</span>}
        </div>

        {/* Zone Inférieure : Informations textuelles */}
        <div className="article-details-area">
          <div className="article-title-row">
            <h3 className="article-txt-title">{article.titre_annonce}</h3>
            <span className="article-txt-price">{prixFormate}</span>
          </div>

          {/* Description de l'article */}
          <p className="article-txt-description">
            {article.description_annonce ? article.description_annonce : "Aucune description disponible pour cet article."}
          </p>
          
          <div className="article-footer-row">
            <div className="article-tags-group">
              {article.taille_annonce && <div className="article-tag-spec">Taille : <span>{article.taille_annonce}</span></div>}
              {article.couleur_annonce && <div className="article-tag-spec">Couleur : <span>{article.couleur_annonce}</span></div>}
            </div>

            {/* Bouton Panier Carré */}
            <button className="btn-add-cart-square" onClick={handleAddToCart} title="Ajouter au panier">
              <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px', fill: 'none', stroke: '#111', strokeWidth: '2.5' }}>
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M16 10a4 4 0 01-8 0" />
              </svg>
            </button>
          </div>
        </div>
      </a>
    </div>
  );
}

function FavorisPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });
  
  let user = null;
  try {
    const savedUser = localStorage.getItem('user');
    user = savedUser ? JSON.parse(savedUser) : null;
  } catch (e) {
    console.error("Erreur parsing user:", e);
  }
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
            setNotification({ message: "Annonce supprimée avec succès.", type: 'success' });
            setTimeout(() => setNotification({ message: '', type: '' }), 3000);
        } else {
            setNotification({ message: "Erreur: " + data.error, type: 'error' });
        }
    });
  };

  if (!user) {
    return (
      <div>
        <Header />
        <main className="main" style={{textAlign: 'center', padding: '100px 20px', minHeight: '60vh'}}>
          <h2>Connectez-vous pour voir vos favoris</h2>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      {notification.message && (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 25px',
            borderRadius: '12px',
            zIndex: 1000,
            background: notification.type === 'success' ? '#d4edda' : '#f8d7da',
            color: notification.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${notification.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            fontWeight: '600',
            transition: 'all 0.3s ease'
        }}>
            {notification.message}
        </div>
      )}
      <main className="main">
        <h2 className="section-title" style={{textAlign: 'left', marginBottom: '30px', fontWeight: '800', paddingLeft: '20px'}}>Mes Favoris</h2>
        
        {loading && <p style={{ textAlign: 'center' }}>Chargement...</p>}
        
        {!loading && articles.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: '18px', color: '#666', marginBottom: '15px' }}>Vous n'avez pas encore d'articles en favoris.</p>
            <a href="index.html" style={{ color: '#e4ca3e', fontWeight: '700', textDecoration: 'none' }}>Parcourir les annonces →</a>
          </div>
        )}

        {/* Grille de 3 colonnes */}
        <div className="articles-grid-three-columns">
          {articles.map(article => (
            <ArticleCard 
              key={article.id_annonce} 
              article={article} 
              isFav={true} 
              onFavToggle={handleFavToggle}
              isAdmin={isAdmin}
              onAdminDelete={handleAdminDelete}
              setNotification={setNotification}
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