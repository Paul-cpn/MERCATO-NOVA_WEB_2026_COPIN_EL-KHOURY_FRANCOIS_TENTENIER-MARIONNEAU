const { useState, useEffect } = React;

// COMPOSANT GALERIE
function Galerie({ images, isFavorite, onToggleFavorite }) {
  const [mainImg, setMainImg] = useState(0);
  
  if (!images || images.length === 0) {
    return (
      <div className="gallery" style={{ width: '100%' }}>
        <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0', borderRadius: '15px', border: '1px dashed #ccc' }}>
          <span style={{ color: '#888', fontWeight: '600' }}>📷 Aucune image disponible</span>
        </div>
      </div>
    );
  }

  return (
    <div className="gallery" style={{ position: 'relative', width: '100%' }}>
      <button 
        className="btn-fav"
        onClick={onToggleFavorite}
        style={{
          position: 'absolute',
          top: '15px',
          right: '15px',
          background: '#fff',
          border: 'none',
          borderRadius: '50%',
          width: '45px',
          height: '45px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
          zIndex: 10,
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        {isFavorite ? 
          <img src="../images/coeur_survole.png" style={{height: '24px'}} alt="favori" /> : 
          <img src="../images/coeur_classique.png" style={{height: '24px'}} alt="favori" />
        }
      </button>

      <div className="main-image-container" style={{ 
        width: '100%', 
        height: '520px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '15px', 
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #eaeaea'
      }}>
        <img 
          src={images[mainImg]} 
          alt="produit" 
          style={{ 
            width: '100%', 
            height: '100%', 
            display: 'block', 
            objectFit: 'cover' 
          }} 
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentNode.style.backgroundColor = '#e9ecef';
            e.target.parentNode.innerHTML = "<span style='color:#999;font-weight:600;'>⚠️ Image introuvable ou cassée</span>";
          }}
        />
      </div>

      <div className="thumbnails" style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={"vue " + (i+1)}
            className={"thumb" + (mainImg === i ? " active" : "")}
            onClick={() => setMainImg(i)}
            style={{ width: '75px', height: '75px', borderRadius: '8px', cursor: 'pointer', objectFit: 'cover', border: mainImg === i ? '2px solid var(--jaune)' : '2px solid transparent' }}
          />
        ))}
      </div>
    </div>
  );
}

// COMPOSANT MODE ACHAT
function ModeAchat({ prix, originalPrix, isNegotiated, onAddToCart, isInCart, onSubmitOffer, onDirectBuy }) {
  const [isOfferMode, setIsOfferMode] = useState(false);
  const [offerVal, setOfferVal] = useState(prix);

  const handleConfirm = () => {
    onSubmitOffer(offerVal);
    setIsOfferMode(false);
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ marginBottom: '5px' }}>
        {isNegotiated && <small style={{ color: '#7ed957', fontWeight: '800' }}>✓ PRIX NÉGOCIÉ ACCEPTÉ</small>}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--jaune)' }}>{prix}€</span>
            {originalPrix && <span style={{ textDecoration: 'line-through', color: '#bbb' }}>{originalPrix}€</span>}
        </div>
      </div>
      
      <button className="btn-buy" onClick={onDirectBuy}>
        <img src="../images/achatimediat.png" style={{height: '18px', verticalAlign: 'middle', marginRight: '8px'}} alt="achat" /> ACHAT IMMÉDIAT
      </button>
      
      <button 
        className={`btn-cart ${isInCart ? 'active' : ''}`} 
        onClick={onAddToCart}
        style={isInCart ? { backgroundColor: '#ff5757', color: '#fff' } : {}}
      >
        {isInCart ? 
          <><img src="../images/croix.png" style={{height: '18px', verticalAlign: 'middle', marginRight: '8px'}} alt="retirer" /> RETIRER DU PANIER</> : 
          <><img src="../images/panier_survoler.png" style={{height: '18px', verticalAlign: 'middle', marginRight: '8px'}} alt="panier" /> AJOUTER AU PANIER</>
        }
      </button>
      
      {!isOfferMode ? (
        <button className="btn-negociate" onClick={() => setIsOfferMode(true)}>
          <img src="../images/faireOffre.png" style={{height: '18px', verticalAlign: 'middle', marginRight: '8px'}} alt="offre" /> FAIRE UNE OFFRE
        </button>
      ) : (
        <div style={{ display: 'flex', gap: '5px' }}>
          <input 
            type="number" 
            className="btn-negociate"
            style={{ flex: 1, padding: '10px', borderRadius: '14px', textAlign: 'center' }}
            value={offerVal}
            onChange={e => setOfferVal(e.target.value)}
            autoFocus
          />
          <button 
            onClick={handleConfirm}
            style={{ background: 'var(--bleu)', color: '#fff', border: 'none', borderRadius: '12px', padding: '0 15px', fontWeight: '800', cursor: 'pointer' }}
          >
            OK
          </button>
          <button 
            onClick={() => setIsOfferMode(false)}
            style={{ background: '#eee', color: '#666', border: 'none', borderRadius: '12px', padding: '0 10px', fontWeight: '800', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

function ModeEnchere({ data, onPlaceBid }) {
  if (!data) return <div className="card"><p>Chargement des infos d'enchère...</p></div>;
  
  const [bidInput, setBidInput] = useState("");
  const [timeLeft, setTimeLeft] = useState("");

  const bestBid = parseFloat(data.meilleure_offre_enchere || data.prix_depart_enchere);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(data.date_fin_enchere).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Terminée");
        clearInterval(timer);
      } else {
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [data.date_fin_enchere]);

  return (
    <div className="card">
      <div className="enchere-header">
        <h3>🔨 Enchère en cours</h3>
        <span className="timer">⏱ {timeLeft}</span>
      </div>
      <div className="enchere-stats">
        <div className="stat-box">
          <p>Prix départ</p>
          <strong>{data.prix_depart_enchere}€</strong>
        </div>
        <div className="stat-box">
          <p>Meilleure offre</p>
          <strong className="meilleure">{bestBid.toFixed(2)}€</strong>
        </div>
        <div className="stat-box">
          <p>Offres</p>
          <strong>{data.nombre_offres || 0}</strong>
        </div>
      </div>
      
      {data.statut_enchere === 'en_cours' && (
        <div className="bid-input-group">
          <input
            type="number"
            placeholder={`Min ${ (bestBid + 1).toFixed(2) } €`}
            value={bidInput}
            onChange={e => setBidInput(e.target.value)}
          />
          <button onClick={() => { onPlaceBid(bidInput); setBidInput(""); }}>Enchérir</button>
        </div>
      )}
      <span className="historique">Fin le {new Date(data.date_fin_enchere).toLocaleString()}</span>
    </div>
  );
}

// COMPOSANT TABS
function Tabs({ description, avis }) {
  const [activeTab, setActiveTab] = useState("description");

  return (
    <div className="tabs" style={{ marginTop: '20px', background: '#fff', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', width: '100%' }}>
      <div className="tab-buttons" style={{ display: 'flex', gap: '10px', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        {["description", "avis", "guide"].map(tab => (
          <button
            key={tab}
            className={"tab-btn" + (activeTab === tab ? " active" : "")}
            onClick={() => setActiveTab(tab)}
            style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '600', background: activeTab === tab ? 'var(--jaune)' : '#f5f5f5', color: activeTab === tab ? '#fff' : '#333' }}
          >
            {tab === "description" ? "Description" : tab === "avis" ? `Avis (${avis ? avis.length : 0})` : "Guide"}
          </button>
        ))}
      </div>
      
      <div className="tab-content" style={{ fontSize: '14px', lineHeight: '1.6', color: '#555' }}>
        {activeTab === "description" && (
          <p>{description || "Aucune description disponible."}</p>
        )}
        {activeTab === "avis" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {avis && avis.length > 0 ? (
              avis.map((a, i) => (
                <div className="review" key={i} style={{ borderBottom: '1px solid #f5f5f5', paddingBottom: '10px' }}>
                  <div className="review-header" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '13px', marginBottom: '4px' }}>
                    <strong>{a.auteur_nom || "Anonyme"}</strong>
                    <span style={{ color: '#aaa', fontWeight: '400' }}>{new Date(a.date_avis).toLocaleDateString()}</span>
                  </div>
                  <div className="review-rating" style={{ display: 'flex', gap: '2px', marginBottom: '4px' }}>
                    {[...Array(5)].map((_, j) => (
                      <img key={j} src="../images/star.png" style={{ height: '12px', opacity: j < a.note_avis ? 1 : 0.2 }} alt="star" />
                    ))}
                  </div>
                  <p style={{ margin: 0 }}>{a.commentaire_avis}</p>
                </div>
              ))
            ) : (
              <p>Aucun avis pour ce vendeur.</p>
            )}
          </div>
        )}
        {activeTab === "guide" && (
          <div>
            <h4 style={{ margin: '0 0 8px 0', color: '#222' }}>📏 Guide des tailles & informations</h4>
            <p style={{ margin: '0 0 10px 0' }}>Assurez-vous de sélectionner la bonne taille. En cas de doute, référez-vous aux mensurations standards de la marque.</p>
            <h4 style={{ margin: '15px 0 8px 0', color: '#222' }}>📦 Conditions de livraison</h4>
            <p style={{ margin: 0 }}>L'article est emballé avec soin par le vendeur et expédié sous 48h ouvrées.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInCart, setIsInCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  let user = null;
  try {
    const savedUser = localStorage.getItem('user');
    user = savedUser ? JSON.parse(savedUser) : null;
  } catch (e) {
    console.error("Erreur parsing user:", e);
  }

  const HeaderComp = window.Header;
  const NavBarComp = window.NavBar;
  const FooterComp = window.Footer;

  const fetchData = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (!id) return;

    const userIdParam = user ? `&id_user=${user.id_user}` : '';
    fetch(`../scripts/get_article_details.php?id=${id}${userIdParam}`)
      .then(res => res.json())
      .then(json => {
        if (json.error) throw new Error(json.error);
        setData(json);
        setLoading(false);
        
        if (json.annonce && json.annonce.is_favorite !== undefined) {
          setIsFavorite(json.annonce.is_favorite);
        }

        if (user) {
            fetch(`../scripts/get_cart.php?id_user=${user.id_user}`)
                .then(r => r.json())
                .then(cartItems => {
                    const found = cartItems.some(item => item.id_annonce == id);
                    setIsInCart(found);
                    localStorage.setItem('cart_count', cartItems.length);
                    window.dispatchEvent(new CustomEvent('cartUpdated'));
                });
        }
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleFavorite = () => {
    if (!user) { window.dispatchEvent(new CustomEvent('openAuthModal')); return; }
    fetch('../scripts/toggle_favorite.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_annonce: data.annonce.id_annonce, id_user: user.id_user })
    })
    .then(res => res.json())
    .then(resData => {
      if (resData.success) {
        const added = resData.action === 'added' || resData.is_favorite;
        setIsFavorite(added);
        setFeedback({ message: added ? "Ajouté aux favoris !" : "Retiré des favoris !", type: 'success' });
        setTimeout(() => setFeedback({ message: '', type: '' }), 2500);
      }
    });
  };

  const handleAddToCart = () => {
    if (!user) { window.dispatchEvent(new CustomEvent('openAuthModal')); return; }
    fetch('../scripts/toggle_cart.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_annonce: data.annonce.id_annonce, id_user: user.id_user })
    })
    .then(res => res.json())
    .then(resData => {
      if (resData.success) {
        const added = resData.action === 'added';
        setIsInCart(added);
        const currentCount = parseInt(localStorage.getItem('cart_count') || '0', 10);
        const newCount = added ? currentCount + 1 : Math.max(0, currentCount - 1);
        localStorage.setItem('cart_count', newCount);
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        setFeedback({ message: added ? "Article ajouté au panier !" : "Article retiré du panier !", type: 'success' });
        setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
      }
    });
  };

  const submitOffer = (montant) => {
    if (!user) { window.dispatchEvent(new CustomEvent('openAuthModal')); return; }
    if (!montant || isNaN(montant)) return;
    fetch('../scripts/start_negotiation.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_annonce: data.annonce.id_annonce,
        id_user_acheteur: user.id_user,
        montant: parseFloat(montant),
        message: `Je vous propose ${montant} € pour cet article.`
      })
    })
    .then(res => res.json())
    .then(resData => {
      if (resData.success) {
        setFeedback({ message: "Votre offre a été envoyée ! Redirection...", type: 'success' });
        setTimeout(() => window.location.href = "messages.html", 2000);
      } else {
        setFeedback({ message: "Erreur : " + resData.error, type: 'error' });
      }
    });
  };

  const handleDirectBuy = () => {
    if (!user) { window.dispatchEvent(new CustomEvent('openAuthModal')); return; }
    window.location.href = `paiement.html?type=direct&id=${data.annonce.id_annonce}`;
  };

  const handlePlaceBid = (amount) => {
    if (!user) { window.dispatchEvent(new CustomEvent('openAuthModal')); return; }
    fetch('../scripts/place_bid.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_enchere: data.enchere.id_enchere, id_user: user.id_user, montant: parseFloat(amount) })
    })
    .then(res => res.json())
    .then(resData => {
      if (resData.success) {
        setFeedback({ message: "Enchère placée avec succès !", type: 'success' });
        fetchData();
        setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
      } else {
        setFeedback({ message: "Erreur: " + resData.error, type: 'error' });
      }
    });
  };

  if (loading) return (
    <div style={{padding: '50px', textAlign: 'center'}}>
      {HeaderComp && <HeaderComp />}
      {NavBarComp && <NavBarComp />}
      <main>Chargement...</main>
      {FooterComp && <FooterComp />}
    </div>
  );

  if (error) return (
    <div style={{padding: '50px', textAlign: 'center', color: 'red'}}>
      {HeaderComp && <HeaderComp />}
      {NavBarComp && <NavBarComp />}
      <main>Erreur : {error}</main>
      {FooterComp && <FooterComp />}
    </div>
  );

  const { annonce, images, avis } = data;
  const isEnchere = annonce.type_vente_annonce === 'enchere';
  const isAdmin = user && user.role_user === 'admin';

  const handleAdminDelete = () => {
    if (confirm("Voulez-vous vraiment supprimer cette annonce définitivement (Admin) ?")) {
      fetch('../scripts/admin_delete_annonce.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_annonce: annonce.id_annonce, id_user: user.id_user })
      })
      .then(res => res.json())
      .then(d => {
        if (d.success) {
          setFeedback({ message: "Annonce supprimée. Redirection...", type: 'success' });
          setTimeout(() => window.location.href = "index.html", 2000);
        } else {
          setFeedback({ message: "Erreur: " + d.error, type: 'error' });
        }
      });
    }
  };

  return (
    <div>
      {HeaderComp && <HeaderComp />}
      {NavBarComp && <NavBarComp />}

      {/* ← BOUTON RETOUR */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '12px 20px 0' }}>
        <button
          onClick={() => window.history.back()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: '2px solid #e0e0e0',
            borderRadius: '12px',
            padding: '8px 18px',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '14px',
            color: '#444',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--jaune)';
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.borderColor = 'var(--jaune)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.color = '#444';
            e.currentTarget.style.borderColor = '#e0e0e0';
          }}
        >
          ← Retour
        </button>
      </div>

      {/* GRILLE PRINCIPALE */}
      <div className="product-page" style={{ 
        display: 'grid', 
        gridTemplateColumns: '62% 35%', 
        gap: '3%', 
        maxWidth: '1200px', 
        margin: '20px auto', 
        padding: '0 20px',
        alignItems: 'start'
      }}>
        
        {/* COLONNE GAUCHE */}
        <div className="product-left-column" style={{ width: '100%' }}>
          <Galerie images={images} isFavorite={isFavorite} onToggleFavorite={handleToggleFavorite} />
          <Tabs description={annonce.description_annonce} avis={avis} />
        </div>
        
        {/* COLONNE DROITE */}
        <div className="product-info" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {feedback.message && (
            <div style={{
              padding: '12px', borderRadius: '10px', textAlign: 'center',
              background: feedback.type === 'success' ? '#d4edda' : '#f8d7da',
              color: feedback.type === 'success' ? '#155724' : '#721c24',
              border: `1px solid ${feedback.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
              fontSize: '14px', fontWeight: '600'
            }}>
              {feedback.message}
            </div>
          )}
          
          {isAdmin && (
            <button 
              onClick={handleAdminDelete}
              style={{width: '100%', background: '#ff5757', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer'}}
            >
              🗑️ SUPPRIMER L'ANNONCE (ADMIN)
            </button>
          )}

          <div className="card" style={{display:"flex", flexDirection:"column", gap:"1rem"}}>
            <div>
              <p className="brand" style={{ margin: '0 0 4px 0', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px', color: '#888' }}>
                {annonce.marque_annonce || "Mercato Nova"}
              </p>
              <h2 className="product-title" style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: '#222' }}>
                {annonce.titre_annonce}
              </h2>
            </div>
            
            <hr className="divider" style={{ margin: '5px 0' }} />
            
            <div className="tags-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {annonce.taille_annonce && <div className="tag">Taille <strong>{annonce.taille_annonce}</strong></div>}
              {annonce.couleur_annonce && <div className="tag">Couleur <span>{annonce.couleur_annonce}</span></div>}
              <div className="tag">État <span>{(annonce.etat_objet_annonce || "").replace('_', ' ')}</span></div>
            </div>

            {isEnchere && (
              <div className="price-card" style={{ marginTop: '5px' }}>
                <span className="price" style={{ fontSize: '1.4rem', fontWeight: '700' }}>Prix de départ : {annonce.prix_annonce}€</span>
              </div>
            )}

            <hr className="divider" style={{ margin: '5px 0' }} />
            
            <div className="seller-card" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f9f9f9', padding: '10px', borderRadius: '12px' }}>
              <div className="seller-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--jaune)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                {(annonce.vendeur_prenom || "U")[0]}
              </div>
              <div className="seller-info" style={{ flexGrow: 1 }}>
                <p style={{ margin: '0 0 4px 0', fontWeight: '700', fontSize: '14px' }}>{annonce.vendeur_prenom} {annonce.vendeur_nom}</p>
                <div className="rating" style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '12px' }}>
                  {[...Array(5)].map((_, i) => (
                    <img key={i} src="../images/star.png" style={{ height: '12px', opacity: i < Math.round(annonce.vendeur_note || 0) ? 1 : 0.2 }} alt="star" />
                  ))}
                  <span style={{ color: '#666', marginLeft: '5px' }}>({parseFloat(annonce.vendeur_note || 0).toFixed(1)} · {annonce.vendeur_ventes || 0} ventes)</span>
                </div>
              </div>
              <span className="seller-arrow" style={{ fontSize: '20px', color: '#ccc' }}>›</span>
            </div>
          </div>

          {isEnchere ? (
            <ModeEnchere data={data.enchere} onPlaceBid={handlePlaceBid} />
          ) : (
            <ModeAchat 
              prix={annonce.prix_annonce} 
              originalPrix={annonce.prix_original} 
              isNegotiated={annonce.is_negotiated}
              onAddToCart={handleAddToCart} 
              isInCart={isInCart} 
              onSubmitOffer={submitOffer}
              onDirectBuy={handleDirectBuy}
            />
          )}
          
          <div className="card badges-card">
            <span className="badge badge-livraison">
              <img src="../images/livraison.png" style={{height: '16px', marginRight: '6px'}} alt="livraison" /> Livraison gratuite
            </span>
            <span className="badge badge-retour">
              <img src="../images/return.png" style={{height: '16px', marginRight: '6px'}} alt="retour" /> Retour 30j
            </span>
            <span className="badge badge-securite">
              <img src="../images/paimentSecurisé.png" style={{height: '16px', marginRight: '6px'}} alt="sécurité" /> Paiement sécurisé
            </span>
          </div>
        </div>
      </div>

      {FooterComp && <FooterComp />}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);