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
  
  // Nouveaux états pour la confirmation des données
  const [step, setStep] = useState('confirmation'); // 'confirmation' ou 'payment'
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempUser, setTempUser] = useState({
    nom: '', prenom: '', email: '', adresse: '', pseudo: ''
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
        window.location.href = "index.html";
        return;
    }
    const u = JSON.parse(savedUser);
    setCurrentUser(u);
    setTempUser({
        nom: u.nom_user || '',
        prenom: u.prenom_user || '',
        email: u.email_user || '',
        adresse: u.adresse_user || '',
        pseudo: u.pseudo_user || ''
    });

    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    const id = urlParams.get('id');

    if (type === 'direct' && id) {
        fetch(`../scripts/get_article_details.php?id=${id}&id_user=${u.id_user}`)
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
        fetch(`../scripts/get_cart.php?id_user=${u.id_user}`)
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

  const handleUpdateUserData = (e) => {
    e.preventDefault();
    setLoading(true);
    fetch('../scripts/update_profile.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...tempUser, id_user: currentUser.id_user })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem('user', JSON.stringify(data.user));
            setCurrentUser(data.user);
            setIsEditing(false);
            setStatus({ message: 'Informations mises à jour !', type: 'success' });
            setTimeout(() => setStatus({ message: '', type: '' }), 3000);
        } else {
            setStatus({ message: 'Erreur : ' + data.error, type: 'error' });
        }
        setLoading(false);
    })
    .catch(() => {
        setStatus({ message: 'Erreur réseau', type: 'error' });
        setLoading(false);
    });
  };

  // États pour les données de carte (pour la validation)
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvc: '', name: '' });

  const handleConfirmPayment = (e) => {
    e.preventDefault();
    setStatus({ message: '', type: '' });

    // 1. Validation Frontend de la carte
    const cardRegex = /^[0-9]{16}$/;
    const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    const cvcRegex = /^[0-9]{3,4}$/;

    if (!cardRegex.test(cardData.number.replace(/\s/g, ''))) {
        setStatus({ message: "Numéro de carte invalide (16 chiffres requis).", type: 'error' });
        return;
    }
    if (!expiryRegex.test(cardData.expiry)) {
        setStatus({ message: "Date d'expiration invalide (MM/YY).", type: 'error' });
        return;
    }
    if (!cvcRegex.test(cardData.cvc)) {
        setStatus({ message: "Code CVC invalide (3 chiffres).", type: 'error' });
        return;
    }

    setLoading(true);
    fetch('../scripts/process_payment.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id_user: currentUser.id_user,
            articles: items,
            // On envoie une confirmation que le paiement a été "validé" côté front
            payment_confirmed: true 
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

    fetch('../scripts/submit_rating.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id_user_auteur: currentUser.id_user,
            id_user_cible: idVendeur,
            id_transaction: idTransaction,
            note: note,
            commentaire: commentaire
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            setRatingsSubmitted(prev => ({...prev, [idAnnonce]: true}));
        } else {
            setStatus({ message: "Erreur lors de la notation : " + data.error, type: 'error' });
        }
    });
  };

  const total = items.reduce((sum, item) => sum + parseFloat(item.prix || 0), 0);

  if (loading && !items.length) {
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
                <h1 style={{textAlign: 'center'}}>Merci {currentUser.prenom_user} pour votre commande !</h1>
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
                    <p style={{color: '#333', margin: 0}}>{currentUser.prenom_user} {currentUser.nom_user}</p>
                    <p style={{color: '#555', marginTop: '4px'}}>
                        {currentUser.adresse_user ? currentUser.adresse_user : "Aucune adresse renseignée dans votre profil."}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* ETAPE 1 : CONFIRMATION DES COORDONNÉES */}
                <div className={`data-confirmation-card ${step !== 'confirmation' ? 'disabled' : ''}`} style={{ opacity: step === 'confirmation' ? 1 : 0.6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ margin: 0 }}>1. Coordonnées & Livraison</h2>
                        {step === 'payment' && (
                            <button className="edit-info-btn" onClick={() => setStep('confirmation')}>Modifier</button>
                        )}
                    </div>

                    {!isEditing ? (
                        <div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', fontWeight: '800' }}>Prénom</label>
                                    <p style={{ margin: '5px 0 0', fontWeight: '600' }}>{currentUser.prenom_user}</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', fontWeight: '800' }}>Nom</label>
                                    <p style={{ margin: '5px 0 0', fontWeight: '600' }}>{currentUser.nom_user}</p>
                                </div>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', fontWeight: '800' }}>Email</label>
                                <p style={{ margin: '5px 0 0', fontWeight: '600' }}>{currentUser.email_user}</p>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', fontWeight: '800' }}>Adresse de livraison</label>
                                <p style={{ margin: '5px 0 0', fontWeight: '600' }}>{currentUser.adresse_user || "Non renseignée"}</p>
                            </div>
                            {step === 'confirmation' && (
                                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                    <button className="edit-info-btn" style={{ margin: 0 }} onClick={() => setIsEditing(true)}>Modifier mes infos</button>
                                    <button className="btn-confirm" style={{ margin: 0, flex: 1 }} 
                                        onClick={() => {
                                            if (!currentUser.adresse_user) {
                                                setStatus({ message: "Veuillez renseigner une adresse de livraison.", type: 'error' });
                                                setIsEditing(true);
                                                return;
                                            }
                                            setStep('payment');
                                        }}>
                                        Confirmer ces informations
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleUpdateUserData}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Prénom</label>
                                    <input type="text" value={tempUser.prenom} required minLength="2" maxLength="50" onChange={e => setTempUser({...tempUser, prenom: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Nom</label>
                                    <input type="text" value={tempUser.nom} required minLength="2" maxLength="50" onChange={e => setTempUser({...tempUser, nom: e.target.value})} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" value={tempUser.email} required onChange={e => setTempUser({...tempUser, email: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Adresse de livraison complète</label>
                                <input type="text" value={tempUser.adresse} required minLength="5" maxLength="200" onChange={e => setTempUser({...tempUser, adresse: e.target.value})} placeholder="Rue, code postal, ville..." />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="btn-confirm" style={{ margin: 0, flex: 1 }}>Enregistrer</button>
                                <button type="button" className="edit-info-btn" onClick={() => setIsEditing(false)}>Annuler</button>
                            </div>
                        </form>
                    )}
                </div>

                {/* ETAPE 2 : PAIEMENT (Visible seulement si étape 1 validée) */}
                {step === 'payment' && (
                    <div className="payment-form-card">
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <img src="../images/LOGO-NOVA.png" alt="Logo" style={{ height: '60px', width: 'auto' }} />
                        </div>
                        <h2>2. Paiement Sécurisé</h2>
                        <form onSubmit={handleConfirmPayment}>
                            <div className="form-group">
                                <label>Numéro de carte</label>
                                <input type="text" placeholder="0000 0000 0000 0000" required 
                                    value={cardData.number} onChange={e => setCardData({...cardData, number: e.target.value})} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date d'expiration</label>
                                    <input type="text" placeholder="MM/YY" required 
                                        value={cardData.expiry} onChange={e => setCardData({...cardData, expiry: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>CVC</label>
                                    <input type="text" placeholder="123" required 
                                        value={cardData.cvc} onChange={e => setCardData({...cardData, cvc: e.target.value})} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Nom sur la carte</label>
                                <input type="text" placeholder="EX: MARIE DUPONT" required 
                                    value={cardData.name} onChange={e => setCardData({...cardData, name: e.target.value})} />
                            </div>
                            <button type="submit" className="btn-confirm" disabled={loading}>
                                {loading ? 'Traitement...' : `Payer ${total.toFixed(2)}€`}
                            </button>
                        </form>
                    </div>
                )}
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
                
                <div style={{ marginTop: '20px', padding: '15px', borderRadius: '12px', background: '#f9f9f9', border: '1px solid #eee' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                        🛡️ <strong>Protection Mercato Nova</strong> incluse. Votre argent est sécurisé jusqu'à la réception.
                    </p>
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
