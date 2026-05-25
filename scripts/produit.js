const { useState, useEffect } = React;

// Récupération des composants globaux
const Header = window.Header;
const NavBar = window.NavBar;
const Footer = window.Footer;

function Galerie({ images }) {
  const [mainImg, setMainImg] = useState(0);
  if (!images || images.length === 0) return <div className="gallery"><div className="main-image-container"><div style={{height: '440px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eee'}}>Pas d'image</div></div></div>;

  return (
    <div className="gallery">
      <div className="main-image-container">
        <img src={images[mainImg]} alt="produit" />
      </div>
      <div className="thumbnails">
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={"vue " + (i+1)}
            className={"thumb" + (mainImg === i ? " active" : "")}
            onClick={() => setMainImg(i)}
          />
        ))}
      </div>
    </div>
  );
}

function ModeAchat({ prix, originalPrix, isNegotiated, onAddToCart, isInCart, onMakeOffer, onDirectBuy }) {
  return (
    <div className="card">
      <div style={{marginBottom: '15px'}}>
        {isNegotiated && <small style={{color: '#7ed957', fontWeight: '800'}}>✓ PRIX NÉGOCIÉ ACCEPTÉ</small>}
        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <span style={{fontSize: '2.2rem', fontWeight: '900', color: 'var(--jaune)'}}>{prix}€</span>
            {originalPrix && <span style={{textDecoration: 'line-through', color: '#bbb'}}>{originalPrix}€</span>}
        </div>
      </div>
      <button className="btn-buy" onClick={onDirectBuy}>⚡ ACHAT IMMÉDIAT</button>
      <button 
        className={`btn-cart ${isInCart ? 'active' : ''}`} 
        onClick={onAddToCart}
        style={isInCart ? {backgroundColor: 'var(--jaune)', color: '#fff'} : {}}
      >
        {isInCart ? '🛒 ARTICLE AU PANIER' : '🛒 AJOUTER AU PANIER'}
      </button>
      <button className="btn-negociate" onClick={onMakeOffer}>💬 FAIRE UNE OFFRE</button>
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

function Tabs({ description, avis }) {
  const [activeTab, setActiveTab] = useState("description");

  return (
    <div className="tabs">
      <div className="tab-buttons">
        <button
          className={"tab-btn" + (activeTab === "description" ? " active" : "")}
          onClick={() => setActiveTab("description")}
        >Description</button>
        <button
          className={"tab-btn" + (activeTab === "avis" ? " active" : "")}
          onClick={() => setActiveTab("avis")}
        >Avis ({avis ? avis.length : 0})</button>
      </div>
      <div className="tab-content">
        {activeTab === "description" && (
          <div>
            <p>{description || "Aucune description disponible."}</p>
          </div>
        )}
        {activeTab === "avis" && (
          <div>
            {avis && avis.length > 0 ? (
                avis.map((a, i) => (
                    <div className="review" key={i}>
                        <div className="review-header">
                        <strong>{a.auteur_nom || "Anonyme"}</strong>
                        <span>{new Date(a.date_avis).toLocaleDateString()}</span>
                        </div>
                        <p>{"★".repeat(a.note_avis)}{"☆".repeat(5-a.note_avis)} {a.commentaire_avis}</p>
                    </div>
                ))
            ) : (
                <p>Aucun avis pour ce vendeur.</p>
            )}
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
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  const user = JSON.parse(localStorage.getItem('user'));

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
        
        if (user) {
            fetch(`../scripts/get_cart.php?id_user=${user.id_user}`)
                .then(r => r.json())
                .then(cartItems => {
                    const found = cartItems.some(item => item.id_annonce == id);
                    setIsInCart(found);
                    
                    // SYNC INITIAL DU COMPTEUR : On enregistre la taille réelle du panier en base
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

  const handleAddToCart = () => {
    if (!user) {
        window.dispatchEvent(new CustomEvent('openAuthModal'));
        return;
    }

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
            
            // CALCUL EN TEMPS RÉEL DU COMPTEUR GLOBAL
            const currentCount = parseInt(localStorage.getItem('cart_count') || '0', 10);
            const newCount = added ? currentCount + 1 : Math.max(0, currentCount - 1);
            
            // Sauvegarde dans la mémoire et déclenchement instantané pour le Header
            localStorage.setItem('cart_count', newCount);
            window.dispatchEvent(new CustomEvent('cartUpdated'));

            if (added) {
                setFeedback({ message: "Article ajouté au panier !", type: 'success' });
                setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
            } else {
                setFeedback({ message: "Article retiré du panier !", type: 'success' });
                setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
            }
        }
    });
  };

  const handleMakeOffer = () => {
    if (!user) {
        window.dispatchEvent(new CustomEvent('openAuthModal'));
        return;
    }

    const montant = prompt("Quel montant souhaitez-vous proposer ?", data.annonce.prix_annonce);
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
    .then(data => {
        if (data.success) {
            setFeedback({ message: "Votre offre a été envoyée ! Redirection...", type: 'success' });
            setTimeout(() => window.location.href = "messages.html", 2000);
        } else {
            setFeedback({ message: "Erreur : " + data.error, type: 'error' });
        }
    });
  };

  const handleDirectBuy = () => {
    if (!user) {
        window.dispatchEvent(new CustomEvent('openAuthModal'));
        return;
    }
    window.location.href = `paiement.html?type=direct&id=${data.annonce.id_annonce}`;
  };

  const handlePlaceBid = (amount) => {
    if (!user) {
        window.dispatchEvent(new CustomEvent('openAuthModal'));
        return;
    }

    fetch('../scripts/place_bid.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id_enchere: data.enchere.id_enchere,
            id_user: user.id_user,
            montant: parseFloat(amount)
        })
    })
    .then(res => res.json())
    .then(resData => {
        if (resData.success) {
            setFeedback({ message: "Enchère placée avec succès !", type: 'success' });
            fetchData(); // Recharger les infos
            setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
        } else {
            setFeedback({ message: "Erreur: " + resData.error, type: 'error' });
        }
    });
  };

  if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>{Header && <Header/>}{NavBar && <NavBar/>}<main>Chargement...</main>{Footer && <Footer/>}</div>;
  if (error) return <div style={{padding: '50px', textAlign: 'center', color: 'red'}}>{Header && <Header/>}{NavBar && <NavBar/>}<main>Erreur : {error}</main>{Footer && <Footer/>}</div>;

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
        .then(data => {
            if (data.success) {
                setFeedback({ message: "Annonce supprimée. Redirection...", type: 'success' });
                setTimeout(() => window.location.href = "index.html", 2000);
            } else {
                setFeedback({ message: "Erreur: " + data.error, type: 'error' });
            }
        });
    }
  };

  return (
    <div>
      <Header />
      <NavBar />
      
      <div className="product-page">
        <Galerie images={images} />
        <div className="product-info">
          {feedback.message && (
            <div style={{
                padding: '12px', 
                borderRadius: '10px', 
                marginBottom: '15px', 
                textAlign: 'center',
                background: feedback.type === 'success' ? '#d4edda' : '#f8d7da',
                color: feedback.type === 'success' ? '#155724' : '#721c24',
                border: `1px solid ${feedback.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                fontSize: '14px',
                fontWeight: '600'
            }}>
                {feedback.message}
            </div>
          )}
          {isAdmin && (
            <button 
                onClick={handleAdminDelete}
                style={{width: '100%', background: '#ff5757', color: '#fff', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', marginBottom: '10px'}}
            >
                🗑️ SUPPRIMER L'ANNONCE (ADMIN)
            </button>
          )}
          <div className="card" style={{display:"flex", flexDirection:"column", gap:"1.25rem"}}>
            <div>
              <p className="brand">{annonce.marque_annonce || "Mercato Nova"}</p>
              <h2 className="product-title">{annonce.titre_annonce}</h2>
              <div className="rating">
                <span style={{color:"#e4ca3e"}}>{"★".repeat(Math.round(annonce.vendeur_note || 0))}</span>
                <span style={{color:"#ddd"}}>{"★".repeat(5 - Math.round(annonce.vendeur_note || 0))}</span>
                <p>{parseFloat(annonce.vendeur_note || 0).toFixed(1)} · {annonce.vendeur_ventes || 0} ventes</p>
              </div>
            </div>
            <hr className="divider" />
            
            {isEnchere && (
                <div className="price-card">
                    <span className="price">{annonce.prix_annonce}€</span>
                </div>
            )}

            <hr className="divider" />
            <div className="tags-card">
              {annonce.taille_annonce && <div className="tag">Taille <span>{annonce.taille_annonce}</span></div>}
              {annonce.couleur_annonce && <div className="tag">Couleur <span>{annonce.couleur_annonce}</span></div>}
              <div className="tag">État <span>{(annonce.etat_objet_annonce || "").replace('_', ' ')}</span></div>
              {annonce.marque_annonce && <div className="tag">Marque <span>{annonce.marque_annonce}</span></div>}
            </div>
            <hr className="divider" />
            <div className="seller-card">
              <div className="seller-avatar">{(annonce.vendeur_prenom || "U")[0]}</div>
              <div className="seller-info">
                <p>{annonce.vendeur_prenom} {annonce.vendeur_nom}</p>
                <small>⭐ {parseFloat(annonce.vendeur_note || 0).toFixed(1)} · France</small>
              </div>
              <span className="seller-arrow">›</span>
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
                onMakeOffer={handleMakeOffer}
                onDirectBuy={handleDirectBuy}
            />
          )}
          
          <div className="card badges-card">
            <span className="badge badge-livraison">🚚 Livraison gratuite</span>
            <span className="badge badge-retour">↩️ Retour 30j</span>
            <span className="badge badge-securite">🔒 Paiement sécurisé</span>
          </div>
        </div>
      </div>

      <Tabs
        description={annonce.description_annonce}
        avis={avis}
      />
      <Footer />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);