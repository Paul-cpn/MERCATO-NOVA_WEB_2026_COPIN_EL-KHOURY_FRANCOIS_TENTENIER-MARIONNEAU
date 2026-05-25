const { useState, useEffect } = React;

const Header = window.Header;
const Footer = window.Footer;

function Sidebar({ isOpen, initialCategory, onClose, onFilterChange }) {
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
    tailles: []
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
            {['neuf', 'tres_bon', 'bon', 'acceptable'].map(e => (
              <label key={e} className="filter-item">
                <input 
                  type="checkbox" 
                  checked={filters.etats.includes(e)}
                  onChange={() => handleCheckbox('etats', e)}
                />
                {e.replace('_', ' ')}
              </label>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <h3 className="filter-title">Couleur</h3>
          <div className="filter-list">
            {['Noir', 'Blanc', 'Bleu', 'Rouge', 'Vert'].map(c => (
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
            {['Coton', 'Laine', 'Cuir', 'Soie', 'Synthétique'].map(m => (
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
              ? ['36', '38', '40', '42', '44', '46'] 
              : ['XS', 'S', 'M', 'L', 'XL', 'XXL']
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
}

function Countdown({ dateFinale }) {
  const [temps, setTemps] = useState('');

  useEffect(() => {
    const calc = () => {
      const diff = new Date(dateFinale) - new Date();
      if (diff <= 0) { setTemps('Terminée'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (h > 24) {
        const j = Math.floor(h / 24);
        setTemps(`${j}j ${h % 24}h`);
      } else {
        setTemps(`${h}h ${m}m ${s}s`);
      }
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [dateFinale]);

  return <span>{temps}</span>;
}

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
    if (confirm("Voulez-vous vraiment supprimer cette annonce définitivement (Admin) ?")) {
      onAdminDelete(article.id_annonce);
    }
  };

  return (
    <div className="article-card-container">
      <div className={`btn-fav-card ${isFav ? 'active' : ''}`} onClick={handleFavClick} />

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
        <div className="article-image-wrapper">
          <div
            className="article-image"
            style={{
              backgroundColor: '#e0e0e0',
              backgroundImage: article.image_url ? `url(${article.image_url})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center top'
            }}
          >
            {!article.image_url && 'Photo'}
          </div>
        </div>
        <div className="article-info">
          <div className="article-titre">{article.titre_annonce}</div>
          <div className="article-prix">{prixFormate}</div>

          {article.type_annonce === 'enchere' && article.date_fin_enchere && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#fff0f5',
              border: '1px solid #e6678f',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: '700',
              color: '#e6678f',
              marginTop: '4px'
            }}>
              🔴 Enchère en cours · <Countdown dateFinale={article.date_fin_enchere} />
            </div>
          )}

          <div className="article-details">
            {article.taille_annonce && (
              <div className="article-detail">Taille : <span>{article.taille_annonce}</span></div>
            )}
            {article.couleur_annonce && (
              <div className="article-detail">· Couleur : <span>{article.couleur_annonce}</span></div>
            )}
          </div>
        </div>
      </a>
    </div>
  );
}
function ArticlesSection() {
  const [articles, setArticles] = useState([]);
  const [favIds, setFavIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [initialCategory, setInitialCategory] = useState(null);
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [notification, setNotification] = useState({ message: '', type: '' });

  useEffect(() => {
    const handleUserChange = () => {
        const u = JSON.parse(localStorage.getItem('user'));
        setCurrentUser(u);
    };
    window.addEventListener('userLoggedIn', handleUserChange);
    window.addEventListener('storage', handleUserChange);
    return () => {
        window.removeEventListener('userLoggedIn', handleUserChange);
        window.removeEventListener('storage', handleUserChange);
    };
  }, []);

  const isAdmin = currentUser && String(currentUser.role_user).toLowerCase() === 'admin';

  const loadFavorites = () => {
    if (currentUser) {
      fetch(`../scripts/get_user_favorites_ids.php?id_user=${currentUser.id_user}`)
        .then(res => res.json())
        .then(ids => setFavIds(ids))
        .catch(err => console.error("Erreur favs:", err));
    } else {
      setFavIds([]);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [currentUser]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.categorie_id) params.append('categorie_id', filters.categorie_id);
    if (filters.prix_min !== undefined && filters.prix_min !== null) params.append('prix_min', filters.prix_min);
    if (filters.prix_max !== undefined && filters.prix_max !== null) params.append('prix_max', filters.prix_max);
    if (filters.etats && filters.etats.length > 0) params.append('etats', filters.etats.join(','));
    if (filters.couleurs && filters.couleurs.length > 0) params.append('couleurs', filters.couleurs.join(','));
    if (filters.matieres && filters.matieres.length > 0) params.append('matieres', filters.matieres.join(','));
    if (filters.tailles && filters.tailles.length > 0) params.append('tailles', filters.tailles.join(','));

    fetch('../scripts/get_articles.php?' + params.toString())
      .then(response => response.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setArticles(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, [filters]);

  const handleFavToggle = (id_annonce) => {
    if (!currentUser) {
      window.dispatchEvent(new CustomEvent('openAuthModal'));
      return;
    }
    fetch('../scripts/toggle_favorite.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_annonce, id_user: currentUser.id_user })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        if (data.action === 'added') setFavIds([...favIds, id_annonce]);
        else setFavIds(favIds.filter(id => id !== id_annonce));
      }
    });
  };

  const handleAdminDelete = (id_annonce) => {
    fetch('../scripts/admin_delete_annonce.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_annonce, id_user: currentUser.id_user })
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

  const handleHeaderCategoryClick = (catName) => {
    setInitialCategory(catName);
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setInitialCategory(null);
    setFilters({});
  };

  return (
    <div>
      <Header onCategoryClick={handleHeaderCategoryClick} isSidebarOpen={isSidebarOpen} />
      {isAdmin && (
        <div style={{background: '#ff5757', color: '#fff', textAlign: 'center', padding: '5px', fontSize: '12px', fontWeight: 'bold'}}>
          MODE ADMINISTRATEUR ACTIF
        </div>
      )}
      
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
            fontWeight: '600'
        }}>
            {notification.message}
        </div>
      )}

      <div className={`catalog-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <Sidebar isOpen={isSidebarOpen} initialCategory={initialCategory} onClose={closeSidebar} onFilterChange={setFilters} />
        <main className="main">
          {!isSidebarOpen && (
            <button className="filter-trigger-btn" onClick={() => setIsSidebarOpen(true)}>
              <span>🔍</span> Filtrer les articles
            </button>
          )}
          {loading && <p style={{ padding: '20px' }}>Chargement...</p>}
          {error && <p style={{ padding: '20px', color: 'red' }}>Erreur : {error}</p>}
          {!loading && !error && articles.length === 0 && (
            <p style={{ padding: '20px' }}>Aucun article ne correspond à vos critères.</p>
          )}
          <div className="articles-grid">
            {articles.map(article => (
              <ArticleCard 
                key={article.id_annonce} 
                article={article} 
                isFav={favIds.includes(article.id_annonce)}
                onFavToggle={handleFavToggle}
                isAdmin={isAdmin}
                onAdminDelete={handleAdminDelete}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <div>
      <ArticlesSection />
      <Footer />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);