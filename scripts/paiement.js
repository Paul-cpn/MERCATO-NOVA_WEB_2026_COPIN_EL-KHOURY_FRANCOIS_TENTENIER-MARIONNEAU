const { useState, useEffect } = React;

// Récupération des composants globaux
const Header = window.Header;
const Footer = window.Footer;

function PaiementPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [transactionIds, setTransactionIds] = useState({});
  const [ratingsSubmitted, setRatingsSubmitted] = useState({});
  const [status, setStatus] = useState({ message: '', type: '' });
  const user = JSON.parse(localStorage.getItem('user'));

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

  const submitRating = (idVendeur, idAnnonce, note) => {
    const idTransaction = transactionIds[idAnnonce];
    if (!idTransaction) {
        setStatus({ message: "Erreur: ID de transaction manquant pour cet article.", type: 'error' });
        return;
    }

    console.log("Envoi d'une note de " + note + " pour le vendeur #" + idVendeur + " (Transaction #" + idTransaction + ")");
    fetch('../scripts/submit_rating.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id_user_auteur: user.id_user,
            id_user_cible: idVendeur,
            id_transaction: idTransaction,
            note: note,
            commentaire: `Achat de l'article #${idAnnonce}`
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
                                <p style={{color: '#7ed957', fontWeight: '800'}}>Note envoyée ! ✓</p>
                            ) : (
                                <div style={{display: 'flex', justifyContent: 'center', gap: '10px'}}>
                                    {[1,2,3,4,5].map(n => (
                                        <button 
                                            key={n} 
                                            onClick={() => submitRating(v.id_vendeur, v.id_annonce, n)}
                                            style={{background: 'none', border: '1px solid #ddd', borderRadius: '50%', width: '35px', height: '32px', cursor: 'pointer', fontSize: '16px'}}
                                        >{n}★</button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <a href="index.html" className="cta-btn">Retour à l'accueil</a>
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
