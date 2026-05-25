const { useState, useEffect } = React;

function ArticleCard({ article, isFav, onFavToggle, onRemoveFromCart, isAdmin, onAdminDelete }) {
  const prixFormate = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(article.prix_annonce);
  
  const handleFavClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onFavToggle(article.id_annonce);
  };

  const handleRemoveClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onRemoveFromCart(article.id_annonce);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Voulez-vous vraiment supprimer cette annonce définitivement (Admin) ?")) {
        onAdminDelete(article.id_annonce);
    }
  };

  return (
    <div className="article-card-container">
      <div className={`btn-fav-card ${isFav ? 'active' : ''}`} onClick={handleFavClick}>
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
          <div className="article-prix">
            {article.is_negotiated && <small style={{display: 'block', color: '#7ed957', fontSize: '10px'}}>✓ Offre acceptée</small>}
            {article.is_auction_win && <small style={{display: 'block', color: '#68c3e2', fontSize: '10px'}}>🏆 Enchère gagnée</small>}
            {prixFormate}
          </div>
          <div className="article-details">
            {article.taille_annonce && <div className="article-detail">Taille : <span>{article.taille_annonce}</span></div>}
            {article.couleur_annonce && <div className="article-detail">Couleur : <span>{article.couleur_annonce}</span></div>}
          </div>
          <button 
            onClick={handleRemoveClick}
            style={{
                marginTop: '10px',
                padding: '5px 10px',
                backgroundColor: '#ff5757',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer'
            }}
          >Retirer du panier</button>
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

function PanierPage() {
  const [articles, setArticles] = useState([]);
  const [favIds, setFavIds] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user && user.role_user === 'admin';

  const fetchCart = () => {
    if (!user) {
        setLoading(false);
        return;
    }
    fetch(`../scripts/get_cart.php?id_user=${user.id_user}`)
      .then(res => res.json())
      .then(data => {
        setArticles(data);
        setLoading(false);
      });

    fetch(`../scripts/get_user_favorites_ids.php?id_user=${user.id_user}`)
      .then(res => res.json())
      .then(ids => setFavIds(ids));
  };

  useEffect(() => {
    fetchCart();
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
        if (data.action === 'added') setFavIds([...favIds, id_annonce]);
        else setFavIds(favIds.filter(id => id !== id_annonce));
      }
    });
  };

  const handleRemoveFromCart = (id_annonce) => {
    fetch('../scripts/toggle_cart.php', {
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

  const total = articles.reduce((sum, a) => sum + parseFloat(a.prix_annonce), 0);

  if (!user) {
    return (
      <div>
        <Header />
        <main className="main" style={{textAlign: 'center', padding: '100px 20px'}}>
          <h2>Connectez-vous pour voir votre panier</h2>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main className="main">
        <h2 className="section-title" style={{textAlign: 'center', marginBottom: '40px'}}>Mon Panier</h2>
        
        {loading && <p style={{ textAlign: 'center' }}>Chargement...</p>}
        
        {!loading && articles.length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <p style={{ fontSize: '18px', color: '#666' }}>Votre panier est vide.</p>
            <a href="index.html" style={{ color: 'var(--jaune)', fontWeight: '700' }}>Continuer mes achats</a>
          </div>
        )}

        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
            <div className="articles-grid" style={{ flex: 1, gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {articles.map(article => (
                    <ArticleCard 
                        key={article.id_annonce} 
                        article={article} 
                        isFav={favIds.includes(article.id_annonce)}
                        onFavToggle={handleFavToggle}
                        onRemoveFromCart={handleRemoveFromCart}
                        isAdmin={isAdmin}
                        onAdminDelete={handleAdminDelete}
                    />
                ))}
            </div>

            {articles.length > 0 && (
                <div style={{ width: '300px', background: '#fff', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                    <h3 style={{ marginBottom: '20px' }}>Résumé</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>Articles ({articles.length})</span>
                        <span>{total.toFixed(2)}€</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontWeight: '800', fontSize: '18px' }}>
                        <span>Total</span>
                        <span style={{ color: 'var(--jaune)' }}>{total.toFixed(2)}€</span>
                    </div>
                    <button 
                        className="btn-buy" 
                        onClick={() => { window.location.href = "paiement.html?type=cart"; }}
                    >Passer à la caisse</button>
                </div>
            )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<PanierPage />);
