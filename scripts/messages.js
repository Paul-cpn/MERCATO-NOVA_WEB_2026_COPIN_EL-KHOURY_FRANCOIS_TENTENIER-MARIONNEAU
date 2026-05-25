const { useState, useEffect, useRef } = React;

const Header = window.Header;
const Footer = window.Footer;

function MessagesPage() {
  const [negotiations, setNegotiations] = useState([]);
  const [activeNeg, setActiveNeg] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [replyOffer, setReplyOffer] = useState("");
  const [status, setStatus] = useState({ message: '', type: '' });
  const chatEndRef = useRef(null);
  
  let user = null;
  try {
    const savedUser = localStorage.getItem('user');
    user = savedUser ? JSON.parse(savedUser) : null;
  } catch (e) {
    console.error("Erreur parsing user:", e);
  }

  const fetchNegotiations = () => {
    if (!user) return;
    fetch(`../scripts/get_negotiations.php?id_user=${user.id_user}`)
      .then(res => res.json())
      .then(data => setNegotiations(data));
  };

  useEffect(() => {
    fetchNegotiations();
  }, []);

  const fetchMessages = () => {
    if (activeNeg) {
      fetch(`../scripts/get_negotiation_echanges.php?id=${activeNeg.id_negociation}`)
        .then(res => res.json())
        .then(data => setMessages(data));
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [activeNeg]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!replyText.trim() && !replyOffer) return;
    fetch('../scripts/send_reply.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_negociation: activeNeg.id_negociation,
        id_user: user.id_user,
        message: replyText || (replyOffer ? `Nouvelle contre-offre à ${replyOffer} €` : ""),
        montant: replyOffer || null
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setReplyText("");
        setReplyOffer("");
        fetchMessages();
        fetchNegotiations();
      }
    });
  };

  const handleUpdateStatus = (statut) => {
    fetch('../scripts/update_negotiation.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_negociation: activeNeg.id_negociation,
        statut: statut
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setStatus({ message: `Offre ${statut === 'acceptee' ? 'acceptée' : 'refusée'} !`, type: 'success' });
        setTimeout(() => setStatus({ message: '', type: '' }), 3000);
        fetchMessages();
        fetchNegotiations();
        setActiveNeg({...activeNeg, statut_negociation: statut});
      } else {
        setStatus({ message: "Erreur: " + data.error, type: 'error' });
      }
    });
  };

  if (!user) {
    return (
      <div>
        <Header />
        <main className="main" style={{textAlign: 'center', padding: '100px 20px'}}>
          <h2>Connectez-vous pour voir vos messages</h2>
        </main>
        <Footer />
      </div>
    );
  }

  const lastOfferMessage = [...messages].reverse().find(m => m.montant_echange !== null);
  const isSeller = activeNeg && activeNeg.id_user_vendeur == user.id_user;
  const canAccept = isSeller && activeNeg.statut_negociation === 'en_cours' && lastOfferMessage && lastOfferMessage.id_user != user.id_user;

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
            fontWeight: '600',
            position: 'relative',
            zIndex: 100
          }}>
            {status.message}
          </div>
        )}

        <div className="messages-container">

          {/* ── LISTE DES NÉGOCIATIONS ── */}
          <div className="negociations-list">
            <div style={{padding: '20px', borderBottom: '1px solid #f0f0f0', fontWeight: '800', fontSize: '16px'}}>
              Discussions
            </div>
            {negotiations.length === 0 && (
              <p style={{padding: '20px', color: '#999'}}>Aucune négociation en cours.</p>
            )}
            {negotiations.map(n => (
              <div
                key={n.id_negociation}
                className={`negociation-item ${activeNeg?.id_negociation === n.id_negociation ? 'active' : ''}`}
                onClick={() => setActiveNeg(n)}
              >
                <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                  
                  {/* Image article */}
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '10px',
                    flexShrink: 0,
                    backgroundColor: '#e0e0e0',
                    backgroundImage: n.image_url ? `url(${n.image_url})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }} />

                  {/* Infos */}
                  <div style={{flex: 1, minWidth: 0}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px'}}>
                      <div className="neg-title" style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px'}}>
                        {n.titre_annonce}
                      </div>
                      {n.statut_negociation !== 'en_cours' && (
                        <span style={{
                          fontSize: '10px',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          flexShrink: 0,
                          background: n.statut_negociation === 'acceptee' ? '#7ed957' : '#ff5757',
                          color: '#fff',
                          fontWeight: '700'
                        }}>
                          {n.statut_negociation}
                        </span>
                      )}
                    </div>
                    <div style={{fontSize: '12px', color: '#aaa', marginBottom: '3px'}}>
                      {n.id_user_acheteur == user.id_user ? `Vendeur : ${n.vendeur_pseudo}` : `Acheteur : ${n.acheteur_pseudo}`}
                    </div>
                    <div className="neg-last-msg" style={{fontStyle: 'italic'}}>
                      {n.dernier_message}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── VUE CHAT ── */}
          <div className="chat-view">
            {activeNeg ? (
              <>
                {/* Header du chat avec image */}
                <div className="chat-header">
                  <div style={{display: 'flex', alignItems: 'center', gap: '14px'}}>
                    
                    {/* Image article */}
                    <a href={`produit.html?id=${activeNeg.id_annonce}`} style={{textDecoration: 'none', flexShrink: 0}}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '10px',
                        backgroundColor: '#e0e0e0',
                        backgroundImage: activeNeg.image_url ? `url(${activeNeg.image_url})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        border: '2px solid #f0f0f0',
                        transition: 'border-color 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#e4ca3e'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#f0f0f0'}
                      />
                    </a>

                    {/* Titre + interlocuteur */}
                    <div>
                      <div style={{fontWeight: '800', fontSize: '15px', color: '#111'}}>
                        {activeNeg.titre_annonce}
                      </div>
                      <div style={{fontSize: '12px', color: '#999', marginTop: '2px'}}>
                        {activeNeg.id_user_acheteur == user.id_user ? `Vendeur : ${activeNeg.vendeur_pseudo}` : `Acheteur : ${activeNeg.acheteur_pseudo}`}
                      </div>
                    </div>

                    {/* Boutons accepter/refuser */}
                    {canAccept && (
                      <div style={{display: 'flex', gap: '10px', marginLeft: 'auto'}}>
                        <button
                          onClick={() => handleUpdateStatus('acceptee')}
                          style={{padding: '6px 14px', background: '#7ed957', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700'}}
                        >
                          Accepter l'offre
                        </button>
                        <button
                          onClick={() => handleUpdateStatus('refusee')}
                          style={{padding: '6px 14px', background: '#ff5757', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700'}}
                        >
                          Refuser
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="chat-messages">
                  {messages.map(m => (
                    <div key={m.id_echange} className={`message-bubble ${m.id_user == user.id_user ? 'mine' : 'other'}`}>
                      {m.montant_echange && (
                        <div className="offer-badge">Offre : {m.montant_echange} €</div>
                      )}
                      <div>{m.message_echange}</div>
                      <div style={{fontSize: '10px', marginTop: '5px', opacity: 0.7}}>
                        {new Date(m.date_echange).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Zone de saisie */}
                <div className="chat-input-area">
                  <input
                    type="text"
                    placeholder="Votre message..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSend()}
                    disabled={activeNeg.statut_negociation !== 'en_cours'}
                  />
                  <input
                    type="number"
                    className="chat-input-offer"
                    placeholder="Offre €"
                    value={replyOffer}
                    onChange={e => setReplyOffer(e.target.value)}
                    disabled={activeNeg.statut_negociation !== 'en_cours'}
                  />
                  <button
                    className="chat-send-btn"
                    onClick={handleSend}
                    disabled={activeNeg.statut_negociation !== 'en_cours'}
                  >
                    Envoyer
                  </button>
                </div>
              </>
            ) : (
              <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999'}}>
                Sélectionnez une discussion pour commencer
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<MessagesPage />);