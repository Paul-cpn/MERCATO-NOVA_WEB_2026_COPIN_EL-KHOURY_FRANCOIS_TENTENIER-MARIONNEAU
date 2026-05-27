const { useState, useEffect } = React;
 
// ==========================================
// 0. CONSTANTES GLOBALES (ENUMS)
// ==========================================
window.APP_CONSTANTS = {
  ETATS: [
    { id: 'neuf', label: 'Neuf' },
    { id: 'tres_bon', label: 'Très bon état' },
    { id: 'bon', label: 'Bon état' },
    { id: 'acceptable', label: 'Acceptable' }
  ],
  MATIERES: ['Coton', 'Laine', 'Cuir', 'Soie', 'Synthétique', 'Denim', 'Lin', 'Autre'],
  COULEURS: ['Noir', 'Blanc', 'Gris', 'Bleu', 'Rouge', 'Vert', 'Jaune', 'Rose', 'Beige', 'Marron', 'Argenté', 'Doré', 'Multicolore'],
  TAILLES_VETEMENTS: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'Unique'],
  TAILLES_BAS: ['34', '36', '38', '40', '42', '44', '46', '48'],
  TAILLES_CHAUSSURES: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46']
};
 
// ==========================================
// 1. MODALE D'AUTHENTIFICATION (CONNEXION / INSCRIPTION)
// ==========================================
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
 
    // 1. Validation Frontend (Inscriptions)
    if (!isLogin) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.mail)) {
            setError("Format d'email invalide.");
            return;
        }
        if (formData.mdp.length < 8) {
            setError("Le mot de passe doit faire au moins 8 caractères.");
            return;
        }
        if (formData.pseudo.length < 3) {
            setError("Le pseudo est trop court.");
            return;
        }
    }
   
    const endpoint = isLogin ? '../scripts/login.php' : '../scripts/register.php';
    const body = isLogin ? { pseudo: formData.pseudo, mdp: formData.mdp } : formData;
 
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
          // Redirection directe vers la page complète du compte après connexion réussie
          window.location.href = "profil.html";
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
              <input type="text" placeholder="Prénom" required minLength="2" maxLength="50" onChange={e => setFormData({...formData, prenom: e.target.value})} />
              <input type="text" placeholder="Nom" required minLength="2" maxLength="50" onChange={e => setFormData({...formData, nom: e.target.value})} />
              <input type="email" placeholder="Email" required onChange={e => setFormData({...formData, mail: e.target.value})} />
              <input type="text" placeholder="Adresse" maxLength="200" onChange={e => setFormData({...formData, adresse: e.target.value})} />
            </>
          )}
         
          <input type="text" placeholder="Pseudo" required minLength="3" maxLength="20" onChange={e => setFormData({...formData, pseudo: e.target.value})} />
          <input type="password" placeholder="Mot de passe" required minLength="8" onChange={e => setFormData({...formData, mdp: e.target.value})} />
         
          <button type="submit">{isLogin ? 'Se connecter' : "S'inscrire"}</button>
         
          <p className="auth-switch">
            {isLogin ? "Pas encore de compte ? " : "Déjà un compte ? "}
            <span onClick={() => setIsLogin(!isLogin)} style={{color: '#e4ca3e', fontWeight: 'bold', cursor: 'pointer'}}>
              {isLogin ? "S'inscrire" : "Se connecter"}
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
 
// ==========================================
// 2. MODALE DES NOTIFICATIONS
// ==========================================
function NotificationsModal({ isOpen, user, onClose }) {
    const [notifs, setNotifs] = useState([]);
   
    useEffect(() => {
        if (isOpen && user) {
            fetch(`../scripts/get_notifications.php?id_user=${user.id_user}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setNotifs(data);
                    } else {
                        console.error("Erreur notifications:", data.error);
                        setNotifs([]);
                    }
                })
                .catch(err => {
                    console.error("Erreur réseau notifications:", err);
                    setNotifs([]);
                });
           
            const timer = setTimeout(() => {
                fetch('../scripts/mark_notifications_read.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({id_user: user.id_user})
                }).then(() => {
                    window.dispatchEvent(new CustomEvent('notificationsRead'));
                    setNotifs(prev => prev.map(n => ({...n, lu_notification: 1})));
                }).catch(() => {});
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, user]);
 
    const handleNotifClick = (n) => {
        if (!n.id_cible) return;
 
        switch (n.type_notification) {
            case 'enchere':
            case 'vente':
            case 'avis':
                window.location.href = `produit.html?id=${n.id_cible}`;
                break;
            case 'negociation':
            case 'message':
                window.location.href = `messages.html?id_negociation=${n.id_cible}`;
                break;
            default:
                break;
        }
        onClose();
    };
 
    if (!isOpen) return null;
 
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" style={{maxHeight: '80vh', overflowY: 'auto'}} onClick={e => e.stopPropagation()}>
                <span className="close-sidebar" style={{top: '10px', right: '10px'}} onClick={onClose}>&times;</span>
                <h2 style={{marginBottom: '20px'}}>Historique des notifications</h2>
                {notifs.length === 0 && <p style={{textAlign: 'center', color: '#999'}}>Aucune notification pour le moment.</p>}
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    {notifs.map(n => (
                        <div
                            key={n.id_notification}
                            onClick={() => handleNotifClick(n)}
                            style={{
                                padding: '12px',
                                borderRadius: '12px',
                                background: n.lu_notification ? '#f9f9f9' : '#fdf8e1',
                                border: '1px solid #eee',
                                cursor: n.id_cible ? 'pointer' : 'default',
                                transition: 'transform 0.2s ease'
                            }}
                            onMouseEnter={e => n.id_cible && (e.currentTarget.style.transform = 'scale(1.02)')}
                            onMouseLeave={e => n.id_cible && (e.currentTarget.style.transform = 'scale(1)')}
                        >
                            <div style={{fontSize: '10px', color: '#bbb', marginBottom: '4px'}}>{new Date(n.date_notification).toLocaleString()}</div>
                            <div style={{fontSize: '13px', color: '#333'}}>{n.texte_notification}</div>
                            {n.id_cible && <div style={{fontSize: '10px', color: 'var(--jaune)', marginTop: '5px', fontWeight: '700'}}>Voir les détails →</div>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
 
// ==========================================
// 3. COMPOSANT SIDEBAR (FILTRES)
// ==========================================
window.Sidebar = function({ isOpen, initialCategory, onClose, onFilterChange }) {
  const [allCategories, setAllCategories] = useState([]);
  const [displayCategories, setDisplayCategories] = useState([]);
  const [openCats, setOpenCats] = useState({});
 
  const defaultFilters = {
    categorie_id: null,
    prix_min: 0,
    prix_max: 500,
    etats: [],
    couleurs: [],
    matieres: [],
    tailles: [],
    type_vente: null
  };
 
  const [filters, setFilters] = useState(defaultFilters);
  const maxPossiblePrice = 1000;
 
  const [isBottomSelected, setIsBottomSelected] = useState(false);
 
  useEffect(() => {
    if (filters.categorie_id && allCategories.length > 0) {
        const findCatAndPath = (list, id, path = []) => {
            for (let c of list) {
                if (c.id_categorie === id) return [...path, c];
                if (c.subs) {
                    let found = findCatAndPath(c.subs, id, [...path, c]);
                    if (found) return found;
                }
            }
            return null;
        };
        const path = findCatAndPath(allCategories, filters.categorie_id);
        const hasBottomInPath = path && path.some(c => c.nom_categorie.toLowerCase() === 'bas');
        setIsBottomSelected(hasBottomInPath);
    } else {
        setIsBottomSelected(false);
    }
  }, [filters.categorie_id, allCategories]);
 
  useEffect(() => {
    if (!isOpen) {
      setFilters(defaultFilters);
      setOpenCats({});
    }
  }, [isOpen]);
 
  const updateFilters = (newFields) => {
    const updated = { ...filters, ...newFields };
    setFilters(updated);
    onFilterChange(updated);
  };
 
  const [localPrice, setLocalPrice] = useState({ min: 0, max: 500 });
 
  useEffect(() => {
    setLocalPrice({ min: filters.prix_min, max: filters.prix_max });
  }, [filters.prix_min, filters.prix_max]);
 
  const handlePriceDrag = (e, type) => {
    const val = parseInt(e.target.value);
    if (type === 'min') {
      const newMin = Math.min(val, localPrice.max - 10);
      setLocalPrice(prev => ({ ...prev, min: newMin }));
    } else {
      const newMax = Math.max(val, localPrice.min + 10);
      setLocalPrice(prev => ({ ...prev, max: newMax }));
    }
  };
 
  const triggerPriceFilter = () => {
    updateFilters({ prix_min: localPrice.min, prix_max: localPrice.max });
  };
 
  useEffect(() => {
    fetch('../scripts/get_categories.php')
      .then(res => res.json())
      .then(data => {
        setAllCategories(data);
      });
  }, []);
 
  useEffect(() => {
    if (allCategories.length > 0) {
      if (initialCategory) {
        const selectedBranch = allCategories.filter(c => c.nom_categorie === initialCategory);
        setDisplayCategories(selectedBranch);
       
        if (selectedBranch.length > 0) {
          const catId = selectedBranch[0].id_categorie;
          setOpenCats({ [catId]: true });
          const updated = { ...filters, categorie_id: catId };
          setFilters(updated);
          onFilterChange(updated);
        }
      } else {
        setDisplayCategories(allCategories);
      }
    }
  }, [initialCategory, allCategories]);
 
  const toggleCat = (id, e) => {
    e.stopPropagation();
    setOpenCats(prev => ({ ...prev, [id]: !prev[id] }));
  };
 
  const selectCat = (id) => {
    updateFilters({ categorie_id: id });
  };
 
  const handleCheckbox = (listName, value) => {
    const list = [...filters[listName]];
    const index = list.indexOf(value);
    if (index > -1) list.splice(index, 1);
    else list.push(value);
    updateFilters({ [listName]: list });
  };
 
  const renderCategory = (cat) => {
    const hasSubs = cat.subs && cat.subs.length > 0;
    const isOpened = openCats[cat.id_categorie];
 
    return (
      <div key={cat.id_categorie} className="category-node">
        <div
          className={`category-parent ${filters.categorie_id === cat.id_categorie ? 'active' : ''}`}
          onClick={() => selectCat(cat.id_categorie)}
        >
          {cat.nom_categorie}
          {hasSubs && (
            <span className="toggle-icon" onClick={(e) => toggleCat(cat.id_categorie, e)}>
              {isOpened ? '−' : '+'}
            </span>
          )}
        </div>
        {hasSubs && isOpened && (
          <div className="category-subs">
            {cat.subs.map(sub => renderCategory(sub))}
          </div>
        )}
      </div>
    );
  };
 
  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <span className="close-sidebar" onClick={onClose}>&times;</span>
 
        <div className="filter-group" style={{marginTop: '40px'}}>
          <h3 className="filter-title">Type de vente</h3>
          <div style={{
            display: 'flex',
            background: '#f0f0f0',
            borderRadius: '12px',
            padding: '4px',
            marginBottom: '20px'
          }}>
            {[
              { id: 'all', label: 'Tous' },
              { id: 'enchere', label: 'Enchère' },
              { id: 'achat_direct', label: 'Direct' }
            ].map(type => (
              <button
                key={type.id}
                onClick={() => updateFilters({ type_vente: type.id === 'all' ? null : type.id })}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  background: (filters.type_vente || 'all') === type.id ? '#fff' : 'transparent',
                  color: (filters.type_vente || 'all') === type.id ? 'var(--jaune)' : '#666',
                  boxShadow: (filters.type_vente || 'all') === type.id ? '0 2px 5px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
 
        <div className="filter-group">
          <h3 className="filter-title">Catégories</h3>
          <div className="filter-list">
            {displayCategories.map(cat => renderCategory(cat))}
          </div>
        </div>
 
        <div className="filter-group">
          <h3 className="filter-title">Prix</h3>
          <div className="price-inputs">
            <div className="price-values">
              <span>{localPrice.min}€</span>
              <span>{localPrice.max}€</span>
            </div>
            <div className="range-slider">
              <div
                className="progress"
                style={{
                  left: `${(localPrice.min / maxPossiblePrice) * 100}%`,
                  right: `${100 - (localPrice.max / maxPossiblePrice) * 100}%`
                }}
              ></div>
              <input
                type="range"
                min="0"
                max={maxPossiblePrice}
                value={localPrice.min}
                onChange={(e) => handlePriceDrag(e, 'min')}
                onMouseUp={triggerPriceFilter}
                onTouchEnd={triggerPriceFilter}
              />
              <input
                type="range"
                min="0"
                max={maxPossiblePrice}
                value={localPrice.max}
                onChange={(e) => handlePriceDrag(e, 'max')}
                onMouseUp={triggerPriceFilter}
                onTouchEnd={triggerPriceFilter}
              />
            </div>
          </div>
        </div>
 
        <div className="filter-group">
          <h3 className="filter-title">État</h3>
          <div className="filter-list">
            {window.APP_CONSTANTS.ETATS.map(e => (
              <label key={e.id} className="filter-item">
                <input
                  type="checkbox"
                  checked={filters.etats.includes(e.id)}
                  onChange={() => handleCheckbox('etats', e.id)}
                />
                {e.label}
              </label>
            ))}
          </div>
        </div>
 
        <div className="filter-group">
          <h3 className="filter-title">Couleur</h3>
          <div className="filter-list">
            {window.APP_CONSTANTS.COULEURS.map(c => (
              <label key={c} className="filter-item">
                <input
                  type="checkbox"
                  checked={filters.couleurs.includes(c)}
                  onChange={() => handleCheckbox('couleurs', c)}
                />
                {c}
              </label>
            ))}
          </div>
        </div>
 
        <div className="filter-group">
          <h3 className="filter-title">Matière</h3>
          <div className="filter-list">
            {window.APP_CONSTANTS.MATIERES.map(m => (
              <label key={m} className="filter-item">
                <input
                  type="checkbox"
                  checked={filters.matieres.includes(m)}
                  onChange={() => handleCheckbox('matieres', m)}
                />
                {m}
              </label>
            ))}
          </div>
        </div>
 
        <div className="filter-group">
          <h3 className="filter-title">Taille</h3>
          <div className="filter-list">
            {(isBottomSelected
              ? window.APP_CONSTANTS.TAILLES_BAS
              : window.APP_CONSTANTS.TAILLES_VETEMENTS
            ).map(t => (
              <label key={t} className="filter-item">
                <input
                  type="checkbox"
                  checked={filters.tailles.includes(t)}
                  onChange={() => handleCheckbox('tailles', t)}
                />
                {t}
              </label>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};
 
// ==========================================
// 4. COMPOSANT HEADER COMMUN (GLOBAL)
// ==========================================
window.Header = function({ onCategoryClick, isSidebarOpen }) {
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [notifHover, setNotifHover] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchText, setSearchText] = useState('');
 
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!searchText.trim()) return;
   
    // Si on est sur l'index, on pourrait théoriquement filtrer en direct,
    // mais pour la cohérence on redirige ou on utilise un paramètre URL.
    window.location.href = `index.html?search=${encodeURIComponent(searchText.trim())}`;
  };
 
  const fetchNotifCount = (u) => {
    if (!u) return;
    fetch(`../scripts/get_notifications.php?id_user=${u.id_user}`)
        .then(res => res.json())
        .then(data => {
            const unread = data.filter(n => !n.lu_notification).length;
            setNotifCount(unread);
        });
  };
 
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
    const handleRefreshNotifs = () => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) fetchNotifCount(JSON.parse(savedUser));
    };
 
    // Polling des notifications (toutes les 10 secondes)
    const notifInterval = setInterval(() => {
        if (u) fetchNotifCount(u);
    }, 10000);
 
    window.addEventListener('openAuthModal', handleOpenAuth);
    window.addEventListener('notificationsRead', handleRefreshNotifs);
    window.addEventListener('cartUpdated', syncCartCount);
    window.addEventListener('storage', syncCartCount);
   
    window.addEventListener('userLoggedIn', (e) => {
        setUser(e.detail);
        fetchNotifCount(e.detail);
        fetchCartCount(e.detail);
    });
 
    return () => {
        clearInterval(notifInterval);
        window.removeEventListener('openAuthModal', handleOpenAuth);
        window.removeEventListener('notificationsRead', handleRefreshNotifs);
        window.removeEventListener('cartUpdated', syncCartCount);
        window.removeEventListener('storage', syncCartCount);
    };
  }, []);
 
  // Redirection propre vers la page complète ici
  const handleUserClick = (e) => {
    e.preventDefault();
    if (user) {
      window.location.href = "profil.html";
    } else {
      setIsAuthOpen(true);
    }
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
 
  return (
    <header className="header">
      <div className="header-top">
        <a href="index.html" className="header-logo" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <img src="../images/LOGO-NOVA.png" alt="Logo" style={{height: '45px', width: 'auto'}} />
          <span className="logo-name">Mercato Nova</span>
        </a>
        <div className="header-search">
          <input
            type="text"
            placeholder="Rechercher un article..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="search-btn" onClick={handleSearch}>Rechercher</button>
        </div>
        <nav className="header-actions">
          <a href="#" className="action-item" onClick={handleNotifClick} onMouseEnter={() => setNotifHover(true)} onMouseLeave={() => setNotifHover(false)}>
            <span className="action-icon" style={{
                position: 'relative',
                backgroundImage: `url(../images/notification_${notifHover ? 'survole' : 'classique'}.png)`,
                width: '24px', height: '24px', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center'
            }}>
                {notifCount > 0 && <span style={{position: 'absolute', top: '-5px', right: '-5px', background: '#ff5757', color: '#fff', fontSize: '9px', width: '15px', height: '15px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800'}}>{notifCount}</span>}
            </span>
            <span>Notifications</span>
          </a>
         
          <a href="panier.html" className="action-item">
            <span className="action-icon cart-icon" style={{ position: 'relative' }}>
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-5px', right: '-7px', background: 'var(--jaune)', color: '#111', fontSize: '9px',
                  width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '900', border: '1.5px solid #ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.15)', lineHeight: 1, zIndex: 10
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
 
          {user && user.role_user === 'admin' && (
            <a href="admin.html" className="action-item" style={{color: 'var(--jaune)'}}>
              <span className="action-icon" style={{backgroundImage: 'url(../images/user_survole.png)', width: '24px', height: '24px', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center'}}></span>
              <span style={{fontWeight: '800'}}>Admin</span>
            </a>
          )}
 
          <a href="#" className="action-item" onClick={handleUserClick}>
            <span className="action-icon user-icon"></span>
            <span>{user ? user.prenom_user : 'Mon compte'}</span>
          </a>
        </nav>
      </div>
 
      {window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/') ? (
        <div className={`header-categories ${isSidebarOpen ? 'hidden' : ''}`}>
          <a href="index.html?cat=Homme" className="header-cat-link" onClick={(e) => {
            if (onCategoryClick) {
              e.preventDefault();
              onCategoryClick('Homme');
            }
          }}>Homme</a>
          <a href="index.html?cat=Femme" className="header-cat-link" onClick={(e) => {
            if (onCategoryClick) {
              e.preventDefault();
              onCategoryClick('Femme');
            }
          }}>Femme</a>
          <a href="index.html?cat=Enfant" className="header-cat-link" onClick={(e) => {
            if (onCategoryClick) {
              e.preventDefault();
              onCategoryClick('Enfant');
            }
          }}>Enfant</a>
        </div>
      ) : null}
 
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLogin}
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
      <div className="footer-container">
        {/* Colonne 1: Aide & Contact */}
        <div className="footer-column">
          <h3>Aide et Contact</h3>
          <ul className="footer-list">
            <li><a href="faq.html" className="footer-link">FAQ</a></li>
            <li><a href="contact.html" className="footer-link">Contactez-nous</a></li>
            <li><a href="apropo.html" className="footer-link">À propos de Mercato Nova</a></li>
            <li><a href="protection-acheteur.html" className="footer-link">Protection de l'acheteur</a></li>
          </ul>
        </div>
 
        {/* Colonne 2: Modes de paiement */}
        <div className="footer-column">
          <h3>Modes de paiement</h3>
          <p className="footer-link" style={{marginBottom: '10px'}}>Paiements 100% sécurisés</p>
          <div className="footer-icons-group">
            <div className="footer-icon-badge" title="Visa">
              <img src="../images/VISA.png" style={{ maxHeight: '14px' }} alt="Visa" />
            </div>
            <div className="footer-icon-badge" title="Mastercard">
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" />
            </div>
            <div className="footer-icon-badge" title="PayPal">
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" />
            </div>
            <div className="footer-icon-badge" title="Paiement Sécurisé">
              <img src="../images/paimentSecurisé.png" alt="Sécurisé" />
            </div>
          </div>
        </div>
 
        {/* Colonne 3: Livraison */}
        <div className="footer-column">
          <h3>Modes de livraison</h3>
          <p className="footer-link" style={{marginBottom: '10px'}}>Expédition rapide & suivie</p>
          <div className="footer-icons-group">
            <div className="footer-icon-badge" title="Mondial Relay">
              <img src="../images/MondialRelay.png" alt="Mondial Relay" />
            </div>
            <div className="footer-icon-badge" title="Colissimo">
              <img src="../images/colissimo.png" alt="Colissimo" />
            </div>
            <div className="footer-icon-badge" title="Chronopost">
              <img src="../images/Chronopost.png" alt="Chronopost" />
            </div>
            <div className="footer-icon-badge" title="Livraison standard">
              <img src="../images/livraison.png" alt="Livraison" />
            </div>
          </div>
        </div>
 
        {/* Colonne 4: Social */}
        <div className="footer-column">
          <h3>Suivez-nous</h3>
          <div className="footer-icons-group">
            <a href="#" className="footer-icon-badge" title="Instagram" style={{ padding: '8px' }}>
              <img src="../images/instagram.png" alt="Instagram" style={{ maxHeight: '24px' }} />
            </a>
            <a href="#" className="footer-icon-badge" title="Facebook" style={{ padding: '8px' }}>
              <img src="../images/facebook.png" alt="Facebook" style={{ maxHeight: '24px' }} />
            </a>
            <a href="#" className="footer-icon-badge" title="Twitter" style={{ padding: '8px' }}>
              <img src="../images/twitter.png" alt="Twitter" style={{ maxHeight: '24px' }} />
            </a>
          </div>
        </div>
      </div>
 
      <div className="footer-bottom">
        <div className="footer-copyright">
          © 2026 Mercato Nova. Tous droits réservés.
        </div>
        <div style={{display: 'flex', gap: '20px'}}>
          <a href="mentions-legales.html" className="footer-link">Mentions légales</a>
          <a href="cgu.html" className="footer-link">CGU</a>
          <a href="confidentialite.html" className="footer-link">Confidentialité</a>
        </div>
      </div>
    </footer>
  );
};
 
