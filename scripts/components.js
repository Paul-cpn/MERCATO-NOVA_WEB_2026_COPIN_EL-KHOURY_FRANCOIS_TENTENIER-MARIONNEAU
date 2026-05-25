const { useState, useEffect } = React;

// Composant de gestion de l'authentification (Modal)
function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    nom: '', prenom: '', mail: '', mdp: '', pseudo: '', adresse: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const endpoint = isLogin ? '../scripts/login.php' : '../scripts/register.php';
    const body = isLogin 
      ? { pseudo: formData.pseudo, mdp: formData.mdp }
      : formData;

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        setError(data.error);
      } else {
        if (isLogin) {
          onLoginSuccess(data.user);
          window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: data.user }));
          onClose();
        } else {
          setSuccess("Compte créé avec succès ! Connectez-vous.");
          setTimeout(() => setIsLogin(true), 2000);
        }
      }
    })
    .catch(() => setError("Erreur de connexion au serveur"));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <span className="close-sidebar" style={{top: '10px', right: '10px'}} onClick={onClose}>&times;</span>
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>{isLogin ? 'Connexion' : 'Inscription'}</h2>
          {error && <p style={{color: 'red', fontSize: '13px', textAlign: 'center', marginBottom: '10px'}}>{error}</p>}
          {success && <p style={{color: 'green', fontSize: '13px', textAlign: 'center', marginBottom: '10px'}}>{success}</p>}
          
          {!isLogin && (
            <>
              <input type="text" placeholder="Prénom" required onChange={e => setFormData({...formData, prenom: e.target.value})} />
              <input type="text" placeholder="Nom" required onChange={e => setFormData({...formData, nom: e.target.value})} />
              <input type="email" placeholder="Email" required onChange={e => setFormData({...formData, mail: e.target.value})} />
              <input type="text" placeholder="Adresse" onChange={e => setFormData({...formData, adresse: e.target.value})} />
            </>
          )}
          
          <input type="text" placeholder="Pseudo" required onChange={e => setFormData({...formData, pseudo: e.target.value})} />
          <input type="password" placeholder="Mot de passe" required onChange={e => setFormData({...formData, mdp: e.target.value})} />
          
          <button type="submit">{isLogin ? 'Se connecter' : "S'inscrire"}</button>
          
          <p className="auth-switch">
            {isLogin ? "Pas encore de compte ? " : "Déjà un compte ? "}
            <span onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "S'inscrire" : "Se connecter"}
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

// Composant Profil
function ProfileModal({ isOpen, user, onClose, onLogout }) {
  if (!isOpen || !user) return null;

  const canSell = user.role_user === 'vendeur' || user.role_user === 'admin';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content profile-view" onClick={e => e.stopPropagation()}>
        <span className="close-sidebar" style={{top: '10px', right: '10px'}} onClick={onClose}>&times;</span>
        <div className="profile-header">{user.prenom_user} {user.nom_user}</div>
        <p>@{user.pseudo_user} <span style={{fontSize: '10px', background: 'var(--jaune)', color: '#fff', padding: '2px 6px', borderRadius: '10px'}}>{user.role_user}</span></p>
        <p style={{color: '#666', fontSize: '14px'}}>{user.email_user}</p>
        <p style={{color: '#888', fontSize: '12px', marginTop: '10px'}}>{user.adresse_user}</p>
        
        {canSell && (
            <>
                <button 
                    onClick={() => window.location.href = "vendre.html"}
                    style={{marginTop: '25px', width: '100%', background: 'var(--jaune)', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer'}}
                >
                    Mettre un article en vente
                </button>
                <button 
                    onClick={() => window.location.href = "mes_articles.html"}
                    style={{marginTop: '10px', width: '100%', background: '#fff', color: 'var(--jaune)', border: '2px solid var(--jaune)', padding: '10px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer'}}
                >
                    Mes annonces
                </button>
            </>
        )}

        <button className="btn-logout" onClick={onLogout}>Se déconnecter</button>
      </div>
    </div>
  );
}

// Composant Notifications
function NotificationsModal({ isOpen, user, onClose }) {
    const [notifs, setNotifs] = useState([]);
    
    useEffect(() => {
        if (isOpen && user) {
            fetch(`../scripts/get_notifications.php?id_user=${user.id_user}`)
                .then(res => res.json())
                .then(data => setNotifs(data));
            
            // Marquer comme lu après un délai
            setTimeout(() => {
                fetch('../scripts/mark_notifications_read.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({id_user: user.id_user})
                }).then(() => window.dispatchEvent(new CustomEvent('notificationsRead')));
            }, 2000);
        }
    }, [isOpen, user]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" style={{maxHeight: '80vh', overflowY: 'auto'}} onClick={e => e.stopPropagation()}>
                <span className="close-sidebar" style={{top: '10px', right: '10px'}} onClick={onClose}>&times;</span>
                <h2 style={{marginBottom: '20px'}}>Historique des notifications</h2>
                {notifs.length === 0 && <p style={{textAlign: 'center', color: '#999'}}>Aucune notification pour le moment.</p>}
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    {notifs.map(n => (
                        <div key={n.id_notification} style={{padding: '12px', borderRadius: '12px', background: n.lu_notification ? '#f9f9f9' : '#fdf8e1', border: '1px solid #eee'}}>
                            <div style={{fontSize: '10px', color: '#bbb', marginBottom: '4px'}}>{new Date(n.date_notification).toLocaleString()}</div>
                            <div style={{fontSize: '13px', color: '#333'}}>{n.texte_notification}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Composant Header commun
window.Header = function({ onCategoryClick, isSidebarOpen }) {
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [notifHover, setNotifHover] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const fetchNotifCount = (u) => {
    if (!u) return;
    fetch(`../scripts/get_notifications.php?id_user=${u.id_user}`)
        .then(res => res.json())
        .then(data => {
            const unread = data.filter(n => !n.lu_notification).length;
            setNotifCount(unread);
        });
  };

  // NOUVELLE FONCTION : Récupère la taille réelle du panier en base de données
  const fetchCartCount = (u) => {
    if (!u) {
      localStorage.removeItem('cart_count');
      setCartCount(0);
      return;
    }
    fetch(`../scripts/get_cart.php?id_user=${u.id_user}`)
      .then(res => res.json())
      .then(data => {
        const count = Array.isArray(data) ? data.length : 0;
        localStorage.setItem('cart_count', count);
        setCartCount(count);
      })
      .catch(() => {
        // En cas d'erreur de requête, on récupère au moins ce qu'il y a en LocalStorage
        const savedCount = localStorage.getItem('cart_count');
        setCartCount(savedCount ? parseInt(savedCount, 10) : 0);
      });
  };

  useEffect(() => {
    let u = null;
    try {
        const savedUser = localStorage.getItem('user');
        u = savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
        console.error("Erreur parsing user:", e);
    }

    if (u) {
        setUser(u);
        fetchNotifCount(u);
        fetchCartCount(u); 
    } else {
        localStorage.setItem('cart_count', '0');
        setCartCount(0);
    }

    const syncCartCount = () => {
      const count = localStorage.getItem('cart_count');
      setCartCount(count ? parseInt(count, 10) : 0);
    };

    const handleOpenAuth = () => setIsAuthOpen(true);
    const handleRefreshNotifs = () => fetchNotifCount(u);

    window.addEventListener('openAuthModal', handleOpenAuth);
    window.addEventListener('notificationsRead', handleRefreshNotifs);
    window.addEventListener('cartUpdated', syncCartCount);
    window.addEventListener('storage', syncCartCount);
    
    window.addEventListener('userLoggedIn', (e) => {
        setUser(e.detail);
        fetchNotifCount(e.detail);
        fetchCartCount(e.detail); // <--- Récupération immédiate dès que l'utilisateur s'identifie !
    });

    return () => {
        window.removeEventListener('openAuthModal', handleOpenAuth);
        window.removeEventListener('notificationsRead', handleRefreshNotifs);
        window.removeEventListener('cartUpdated', syncCartCount);
        window.removeEventListener('storage', syncCartCount);
    };
  }, []);

  const handleUserClick = (e) => {
    e.preventDefault();
    if (user) setIsProfileOpen(true);
    else setIsAuthOpen(true);
  };

  const handleNotifClick = (e) => {
    e.preventDefault();
    if (user) setIsNotifOpen(true);
    else setIsAuthOpen(true);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('cart_count'); // Nettoyage du panier à la déconnexion
    setIsProfileOpen(false);
    window.location.reload();
  };

  return (
    <header className="header">
      <div className="header-top">
        <a href="index.html" className="header-logo" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <img src="../images/LOGO-NOVA.png" alt="Logo" style={{height: '45px', width: 'auto'}} />
          <span className="logo-name">Mercato Nova</span>
        </a>
        <div className="header-search">
          <input type="text" placeholder="Rechercher un article..." />
          <button className="search-btn">Rechercher</button>
        </div>
        <nav className="header-actions">
          <a href="#" className="action-item" onClick={handleNotifClick} onMouseEnter={() => setNotifHover(true)} onMouseLeave={() => setNotifHover(false)}>
            <span className="action-icon" style={{ 
                position: 'relative',
                backgroundImage: `url(../images/notification_${notifHover ? 'survole' : 'classique'}.png)`,
                width: '24px', 
                height: '24px', 
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center'
            }}>
                {notifCount > 0 && <span style={{position: 'absolute', top: '-5px', right: '-5px', background: '#ff5757', color: '#fff', fontSize: '9px', width: '15px', height: '15px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800'}}>{notifCount}</span>}
            </span>
            <span>Notifications</span>
          </a>
          
          <a href="panier.html" className="action-item">
            <span className="action-icon cart-icon" style={{ position: 'relative' }}>
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-7px',
                  background: 'var(--jaune)',
                  color: '#111',
                  fontSize: '9px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '900',
                  border: '1.5px solid #ffffff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                  lineHeight: 1,
                  zIndex: 10
                }}>
                  {cartCount}
                </span>
              )}
            </span>
            <span>Panier</span>
          </a>

          <a href="favoris.html" className="action-item">
            <span className="action-icon heart-icon"></span>
            <span>Favoris</span>
          </a>
          <a href="messages.html" className="action-item">
            <span className="action-icon message-icon"></span>
            <span>Messages</span>
          </a>
          <a href="#" className="action-item" onClick={handleUserClick}>
            <span className="action-icon user-icon"></span>
            <span>{user ? user.prenom_user : 'Mon compte'}</span>
          </a>
        </nav>
      </div>

      <div className={`header-categories ${isSidebarOpen ? 'hidden' : ''}`}>
        <span className="header-cat-link" onClick={() => onCategoryClick && onCategoryClick('Homme')}>Homme</span>
        <span className="header-cat-link" onClick={() => onCategoryClick && onCategoryClick('Femme')}>Femme</span>
        <span className="header-cat-link" onClick={() => onCategoryClick && onCategoryClick('Enfant')}>Enfant</span>
      </div>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLoginSuccess={handleLogin} 
      />
      
      <ProfileModal 
        isOpen={isProfileOpen} 
        user={user} 
        onClose={() => setIsProfileOpen(false)} 
        onLogout={handleLogout} 
      />

      <NotificationsModal
        isOpen={isNotifOpen}
        user={user}
        onClose={() => setIsNotifOpen(false)}
      />
    </header>
  );
};

window.NavBar = function() { return null; };

window.Footer = function() {
  return (
    <footer className="footer">
      <div className="footer-links">
        <a href="apropo.html" className="footer-link">À propos</a>
        <a href="#" className="footer-link">FAQ</a>
        <a href="#" className="footer-link">Contactez-nous</a>
      </div>
    </footer>
  );
};