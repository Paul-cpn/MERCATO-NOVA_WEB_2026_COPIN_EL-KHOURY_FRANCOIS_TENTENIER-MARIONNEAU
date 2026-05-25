const { useState, useEffect } = React;

const Header = window.Header;
const Footer = window.Footer;

function CartItem({ article, isFav, onFavToggle, onRemoveFromCart, isAdmin, onAdminDelete }) {
  const prixFormate = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(article.prix_annonce);

  const handleFavClick = (e) => { e.preventDefault(); e.stopPropagation(); onFavToggle(article.id_annonce); };
  const handleRemoveClick = (e) => { e.preventDefault(); e.stopPropagation(); onRemoveFromCart(article.id_annonce); };
  const handleDelete = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (confirm("Voulez-vous vraiment supprimer cette annonce définitivement (Admin) ?")) onAdminDelete(article.id_annonce);
  };

  return (
    <div style={{
      display: 'flex',
      gap: '20px',
      background: '#fff',
      borderRadius: '16px',
      padding: '16px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      border: '1px solid #f0f0f0',
      alignItems: 'center',
      position: 'relative'
    }}>

      {isAdmin && (
        <div onClick={handleDelete} title="Supprimer (Admin)" style={{
          position: 'absolute', top: '10px', left: '10px',
          width: '24px', height: '24px', background: '#ff5757', color: '#fff',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 10, fontSize: '16px', fontWeight: '800',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)', lineHeight: 0
        }}>&times;</div>
      )}

      <a href={`produit.html?id=${article.id_annonce}`} style={{textDecoration: 'none', flexShrink: 0}}>
        <div style={{
          width: '110px',
          height: '130px',
          borderRadius: '12px',
          backgroundColor: '#e0e0e0',
          backgroundImage: article.image_url ? `url(${article.image_url})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center top'
        }} />
      </a>

      <div style={{flex: 1, minWidth: 0}}>
        <a href={`produit.html?id=${article.id_annonce}`} style={{textDecoration: 'none', color: 'inherit'}}>
          <div style={{fontWeight: '700', fontSize: '15px', color: '#111', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
            {article.titre_annonce}
          </div>
        </a>

        {article.is_negotiated && (
          <div style={{fontSize: '11px', color: '#7ed957', fontWeight: '700', marginBottom: '3px'}}>✓ Offre négociée acceptée</div>
        )}
        {article.is_auction_win && (
          <div style={{fontSize: '11px', color: '#68c3e2', fontWeight: '700', marginBottom: '3px'}}>🏆 Enchère gagnée</div>
        )}

        <div style={{fontSize: '18px', fontWeight: '800', color: 'var(--jaune)', marginBottom: '10px'}}>
          {prixFormate}
        </div>

        <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px'}}>
          {article.taille_annonce && (
            <span style={{fontSize: '12px', background: '#fdf8e1', padding: '3px 10px', borderRadius: '6px', color: '#555'}}>
              Taille : <strong>{article.taille_annonce}</strong>
            </span>
          )}
          {article.couleur_annonce && (
            <span style={{fontSize: '12px', background: '#fdf8e1', padding: '3px 10px', borderRadius: '6px', color: '#555'}}>
              Couleur : <strong>{article.couleur_annonce}</strong>
            </span>
          )}
        </div>

        <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
          <button onClick={handleRemoveClick}
            style={{padding: '7px 14px', backgroundColor: '#fff', color: '#ff5757', border: '1px solid #ff5757', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'}}
            onMouseEnter={e => { e.currentTarget.style.background = '#ff5757'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#ff5757'; }}
          >
            <img src="../images/croix.png" style={{height: '12px'}} alt="retirer" /> Retirer
          </button>

          <button onClick={handleFavClick}
            style={{padding: '7px 14px', backgroundColor: isFav ? '#fdf8e1' : '#fff', color: 'var(--jaune)', border: '1px solid var(--jaune)', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'}}
          >
            {isFav ? 
              <><img src="../images/coeur_survole.png" style={{height: '14px'}} /> Favori</> : 
              <><img src="../images/coeur_classique.png" style={{height: '14px'}} /> Ajouter aux favoris</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

function PanierPage() {
  const [articles, setArticles] = useState([]);
  const [favIds, setFavIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '' });

  let user = null;
  try {
      const savedUser = localStorage.getItem('user');
      user = savedUser ? JSON.parse(savedUser) : null;
  } catch (e) {
      console.error("Erreur parsing user:", e);
  }
  const isAdmin = user && user.role_user === 'admin';

  const fetchCart = () => {
    if (!user) { setLoading(false); return; }
    fetch(`../scripts/get_cart.php?id_user=${user.id_user}`)
      .then(res => res.json())
      .then(data => { 
        setArticles(data); 
        setLoading(false); 
        
        // SYNCHRONISATION DU COMPTEUR AU CHARGEMENT
        localStorage.setItem('cart_count', data.length);
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      });
      
    fetch(`../scripts/get_user_favorites_ids.php?id_user=${user.id_user}`)
      .then(res => res.json())
      .then(ids => setFavIds(ids));
  };

  useEffect(() => { fetchCart(); }, []);

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
        const updatedArticles = articles.filter(a => a.id_annonce !== id_annonce);
        setArticles(updatedArticles); 
        
        // MISE À JOUR DU COMPTEUR APRÈS RETRAIT
        localStorage.setItem('cart_count', updatedArticles.length);
        window.dispatchEvent(new CustomEvent('cartUpdated'));
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
        const updatedArticles = articles.filter(a => a.id_annonce !== id_annonce);
        setArticles(updatedArticles);
        
        // MISE À JOUR DU COMPTEUR APRÈS SUPPRESSION ADMIN
        localStorage.setItem('cart_count', updatedArticles.length);
        window.dispatchEvent(new CustomEvent('cartUpdated'));

        setNotification({ message: "Annonce supprimée avec succès.", type: 'success' });
        setTimeout(() => setNotification({ message: '', type: '' }), 3000);
      } else {
        setNotification({ message: "Erreur: " + data.error, type: 'error' });
      }
    });
  };

  const total = articles.reduce((sum, a) => sum + parseFloat(a.prix_annonce), 0);

  if (!user) {
    return (
      <div style={{display: 'flex', flexDirection: 'column', flex: 1}}>
        <Header />
        <main className="main" style={{flex: 1, textAlign: 'center', padding: '100px 20px'}}>
          <h2>Connectez-vous pour voir votre panier</h2>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', flex: 1}}>
      <Header />

      {notification.message && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px',
          padding: '15px 25px', borderRadius: '12px', zIndex: 1000,
          background: notification.type === 'success' ? '#d4edda' : '#f8d7da',
          color: notification.type === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${notification.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontWeight: '600'
        }}>
          {notification.message}
        </div>
      )}

      <main className="main" style={{flex: 1}}>
        <h2 style={{fontWeight: '900', fontSize: '22px', marginBottom: '30px', color: '#111'}}>
          Mon Panier {articles.length > 0 && (
            <span style={{color: '#aaa', fontWeight: '400', fontSize: '16px'}}>
              ({articles.length} article{articles.length > 1 ? 's' : ''})
            </span>
          )}
        </h2>

        {loading && <p style={{textAlign: 'center', color: '#999'}}>Chargement...</p>}

        {!loading && articles.length === 0 && (
          <div style={{textAlign: 'center', padding: '80px 0'}}>
            <div style={{marginBottom: '16px'}}>
              <img src="../images/panier_classique.png" style={{height: '64px'}} alt="panier vide" />
            </div>
            <p style={{fontSize: '18px', color: '#666', marginBottom: '16px'}}>Votre panier est vide.</p>
            <a href="index.html" style={{
              display: 'inline-block', background: 'var(--jaune)', color: '#fff',
              padding: '12px 28px', borderRadius: '25px', fontWeight: '700', textDecoration: 'none'
            }}>Continuer mes achats</a>
          </div>
        )}

        {articles.length > 0 && (
          <div style={{display: 'flex', gap: '30px', alignItems: 'flex-start'}}>

            <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '16px'}}>
              {articles.map(article => (
                <CartItem
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

            <div style={{
              width: '300px', flexShrink: 0,
              background: '#fff', padding: '25px', borderRadius: '20px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              position: 'sticky', top: '100px'
            }}>
              <h3 style={{fontWeight: '800', fontSize: '16px', marginBottom: '20px', color: '#111'}}>Résumé de la commande</h3>

              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', color: '#666'}}>
                <span>Articles ({articles.length})</span>
                <span>{total.toFixed(2)} €</span>
              </div>

              <div style={{borderTop: '1px solid #f0f0f0', margin: '15px 0'}} />

              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontWeight: '800', fontSize: '18px'}}>
                <span>Total</span>
                <span style={{color: 'var(--jaune)'}}>{total.toFixed(2)} €</span>
              </div>

              <button
                className="btn-buy"
                onClick={() => { window.location.href = "paiement.html?type=cart"; }}
                style={{borderRadius: '12px', fontSize: '15px', fontWeight: '800'}}
              >
                Passer à la caisse →
              </button>

              <a href="index.html" style={{
                display: 'block', textAlign: 'center', marginTop: '12px',
                color: '#aaa', fontSize: '13px', textDecoration: 'none'
              }}>
                ← Continuer mes achats
              </a>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<PanierPage />);