const { useState, useEffect } = React;

// Récupération des composants globaux
const Header = window.Header;
const Footer = window.Footer;

function PaiementPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [transactionIds, setTransactionIds] = useState({});
  const [showRecap, setShowRecap] = useState(false);
  const [orderDate, setOrderDate] = useState(null);
  const [ratingsSubmitted, setRatingsSubmitted] = useState({});
  const [selectedNotes, setSelectedNotes] = useState({});
  const [comments, setComments] = useState({});
  const [status, setStatus] = useState({ message: '', type: '' });
  
  let user = null;
  try {
    const savedUser = localStorage.getItem('user');
    user = savedUser ? JSON.parse(savedUser) : null;
  } catch (e) {
    console.error("Erreur parsing user:", e);
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    const id = urlParams.get('id');

    if (!user) {
        window.location.href = "index.html";
        return;
    }

    if (type === 'direct' && id) {
        fetch(`../scripts/get_article_details.php?id=${id}&id_user=${user.id_user}`)
          .then(res => res.json())
          .then(data => {
            if (data.error) throw new Error(data.error);
            setItems([{ 
                id_annonce: data.annonce.id_annonce, 
                titre: data.annonce.titre_annonce, 
                prix: data.annonce.prix_annonce, 
                id_vendeur: data.annonce.id_user, 
                vendeur_nom: data.annonce.vendeur_prenom 
            }]);
            setLoading(false);
          })
          .catch(err => {
              setStatus({ message: "Erreur: " + err.message, type: 'error' });
              setLoading(false);
          });
    } else {
        fetch(`../scripts/get_cart.php?id_user=${user.id_user}`)
          .then(res => res.json())
          .then(data => {
            if (data.error) throw new Error(data.error);
            setItems(data.map(a => ({ 
                id_annonce: a.id_annonce, 
                titre: a.titre_annonce, 
                prix: a.prix_annonce, 
                id_vendeur: a.id_vendeur, 
                vendeur_nom: a.vendeur_nom 
            })));
            setLoading(false);
          })
          .catch(err => {
              setStatus({ message: "Erreur panier: " + err.message, type: 'error' });
              setLoading(false);
          });
    }
  }, []);

  const handleConfirmPayment = (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ message: '', type: '' });

    fetch('../scripts/process_payment.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id_user: user.id_user,
            articles: items
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            setTransactionIds(data.transactionIds || {});
            setOrderDate(new Date());
            setIsSuccess(true);
            setLoading(false);
        } else {
            setStatus({ message: "Erreur: " + data.error, type: 'error' });
            setLoading(false);
        }
    })
    .catch(() => {
        setStatus({ message: "Erreur réseau", type: 'error' });
        setLoading(false);
    });
  };

  const submitRating = (idVendeur, idAnnonce) => {
    const idTransaction = transactionIds[idAnnonce];
    if (!idTransaction) {
        setStatus({ message: "Erreur: ID de transaction manquant pour cet article.", type: 'error' });
        return;
    }

    const note = selectedNotes[idAnnonce];
    if (!note) {
        setStatus({ message: "Veuillez sélectionner une note avant d'envoyer votre avis.", type: 'error' });
        return;
    }
    const commentaire = (comments[idAnnonce] || "").trim();

    console.log("Envoi d'une note de " + note + " pour le vendeur #" + idVendeur + " (Transaction #" + idTransaction + ")");
    fetch('../scripts/submit_rating.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id_user_auteur: user.id_user,
            id_user_cible: idVendeur,
            id_transaction: idTransaction,
            note: note,
            commentaire: commentaire
        })
    })
    .then(res => res.json())
    .then(data => {
        console.log("Réponse du serveur:", data);
        if (data.success) {
            setRatingsSubmitted(prev => ({...prev, [idAnnonce]: true}));
        } else {
            setStatus({ message: "Erreur lors de la notation : " + data.error, type: 'error' });
        }
    })
    .catch(err => {
        console.error("Erreur réseau notation:", err);
    });
  };

  const total = items.reduce((sum, item) => sum + parseFloat(item.prix || 0), 0);

  if (loading) {
    return (
        <div>
            <Header />
            <main className="main" style={{textAlign: 'center', padding: '100px'}}>
                <h2>Chargement de votre commande...</h2>
            </main>
            <Footer />
        </div>
    );
  }

  if (isSuccess && showRecap) {
    const dateCommande = orderDate || new Date();
    const dateLivraison = new Date(dateCommande);
    dateLivraison.setDate(dateLivraison.getDate() + 5);
    const optionsDate = { day: '2-digit', month: 'long', year: 'numeric' };

    return (
        <div>
            <Header />
            <main className="main success-view">
                <h1 style={{textAlign: 'center'}}>Merci {user.prenom_user} pour votre commande !</h1>
                <p style={{textAlign: 'center'}}>Voici le récapitulatif de votre achat sur Mercato Nova.</p>

                <div style={{marginTop: '40px', background: '#fff', padding: '30px', borderRadius: '20px', maxWidth: '500px', margin: '40px auto', textAlign: 'left'}}>
                    <h3 style={{marginBottom: '15px'}}>Articles commandés</h3>
                    {items.map((item, i) => (
                        <div key={i} className="summary-item">
                            <span>{item.titre}</span>
                            <span>{parseFloat(item.prix || 0).toFixed(2)}€</span>
                        </div>
                    ))}
                    <div className="summary-total">
                        <span>Total</span>
                        <span style={{color: 'var(--jaune)'}}>{total.toFixed(2)}€</span>
                    </div>

                    <h3 style={{margin: '25px 0 10px'}}>Adresse de livraison</h3>
                    <p style={{color: '#333', margin: 0}}>{user.prenom_user} {user.nom_user}</p>
                    <p style={{color: '#555', marginTop: '4px'}}>
                        {user.adresse_user ? user.adresse_user : "Aucune adresse renseignée dans votre profil."}
                    </p>

                    <div style={{marginTop: '20px', padding: '15px', borderRadius: '12px', background: '#fdf8e1', border: '1px solid var(--jaune)'}}>
                        <p style={{margin: 0, fontWeight: '700'}}>📦 Votre colis arrive sous 5 jours</p>
                        <p style={{margin: '6px 0 0', fontSize: '13px', color: '#555'}}>
                            Commande passée le {dateCommande.toLocaleDateString('fr-FR', optionsDate)}.<br/>
                            Livraison estimée le <strong>{dateLivraison.toLocaleDateString('fr-FR', optionsDate)}</strong>.
                        </p>
                    </div>
                </div>

                <a href="index.html" className="cta-btn">Retour à l'accueil</a>
            </main>
            <Footer />
        </div>
    );
  }

  if (isSuccess) {
    const vendeursUniques = Array.from(new Set(items.map(i => i.id_vendeur)))
                                 .map(id => items.find(i => i.id_vendeur === id));

    return (
        <div>
            <Header />
            <main className="main success-view">
                <div style={{textAlign: 'center', marginBottom: '30px'}}>
                    <img src="../images/payment-confirmation.png" alt="Succès" style={{height: '100px', width: 'auto'}} />
                </div>
                <h1>Paiement Réussi !</h1>
                <p>Merci pour votre achat sur Mercato Nova.</p>
                
                <div style={{marginTop: '40px', background: '#fff', padding: '30px', borderRadius: '20px', maxWidth: '500px', margin: '40px auto'}}>
                    <h3 style={{marginBottom: '20px'}}>Notez vos vendeurs</h3>
                    {vendeursUniques.map(v => (
                        <div key={v.id_vendeur} style={{marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee'}}>
                            <p style={{fontWeight: '700', marginBottom: '10px'}}>Comment s'est passée la vente avec {v.vendeur_nom} ?</p>
                            {ratingsSubmitted[v.id_annonce] ? (
                                <p style={{color: '#7ed957', fontWeight: '800'}}>Avis envoyé ! ✓</p>
                            ) : (
                                <div>
                                    <div style={{display: 'flex', justifyContent: 'center', gap: '10px'}}>
                                        {[1,2,3,4,5].map(n => {
                                            const active = (selectedNotes[v.id_annonce] || 0) >= n;
                                            return (
                                                <button
                                                    key={n}
                                                    onClick={() => setSelectedNotes(prev => ({...prev, [v.id_annonce]: n}))}
                                                    style={{background: active ? '#fdf8e1' : 'none', border: `1px solid ${active ? 'var(--jaune)' : '#ddd'}`, borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px', opacity: active ? 1 : 0.45}}
                                                >{n} <img src="../images/star.png" style={{height: '14px'}} alt="star" /></button>
                                            );
                                        })}
                                    </div>
                                    <textarea
                                        value={comments[v.id_annonce] || ''}
                                        onChange={(e) => setComments(prev => ({...prev, [v.id_annonce]: e.target.value}))}
                                        maxLength={300}
                                        placeholder="Laissez un avis sur cette vente (qualité de l'article, contact avec le vendeur...)"
                                        style={{width: '100%', marginTop: '15px', minHeight: '70px', padding: '10px', borderRadius: '12px', border: '1px solid #ddd', fontFamily: 'inherit', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box'}}
                                    />
                                    <div style={{textAlign: 'right', fontSize: '11px', color: '#bbb', marginTop: '2px'}}>
                                        {(comments[v.id_annonce] || '').length}/300
                                    </div>
                                    <button
                                        onClick={() => submitRating(v.id_vendeur, v.id_annonce)}
                                        disabled={!selectedNotes[v.id_annonce]}
                                        style={{marginTop: '8px', width: '100%', padding: '10px', borderRadius: '12px', border: 'none', background: selectedNotes[v.id_annonce] ? 'var(--jaune)' : '#eee', color: selectedNotes[v.id_annonce] ? '#000' : '#aaa', fontWeight: '800', cursor: selectedNotes[v.id_annonce] ? 'pointer' : 'not-allowed', fontSize: '14px'}}
                                    >Envoyer mon avis</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <button onClick={() => setShowRecap(true)} className="cta-btn" style={{border: 'none', cursor: 'pointer'}}>
                    Voir le récapitulatif de ma commande
                </button>
            </main>
            <Footer />
        </div>
    );
  }

  return (
    <div>
      <Header />
      <main className="main">
        {status.message && (
            <div style={{
                padding: '12px',
                margin: '10px auto',
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
        <div className="payment-container">
            <div className="payment-form-card">
                <div style={{textAlign: 'center', marginBottom: '20px'}}>
                    <img src="../images/LOGO-NOVA.png" alt="Logo" style={{height: '60px', width: 'auto'}} />
                </div>
                <h2>Paiement Sécurisé</h2>
                <form onSubmit={handleConfirmPayment}>
                    <div className="form-group">
                        <label>Numéro de carte</label>
                        <input type="text" placeholder="0000 0000 0000 0000" required />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Date d'expiration</label>
                            <input type="text" placeholder="MM/YY" required />
                        </div>
                        <div className="form-group">
                            <label>CVC</label>
                            <input type="text" placeholder="123" required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Nom sur la carte</label>
                        <input type="text" placeholder="EX: MARIE DUPONT" required />
                    </div>
                    <button type="submit" className="btn-confirm" disabled={loading}>
                        {loading ? 'Traitement...' : `Payer ${total.toFixed(2)}€`}
                    </button>
                </form>
            </div>

            <div className="order-summary">
                <h3>Votre Commande</h3>
                {items.length === 0 && <p>Aucun article sélectionné.</p>}
                {items.map((item, i) => (
                    <div key={i} className="summary-item">
                        <span>{item.titre}</span>
                        <span>{parseFloat(item.prix || 0).toFixed(2)}€</span>
                    </div>
                ))}
                <div className="summary-total">
                    <span>Total</span>
                    <span style={{color: 'var(--jaune)'}}>{total.toFixed(2)}€</span>
                </div>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<PaiementPage />);
