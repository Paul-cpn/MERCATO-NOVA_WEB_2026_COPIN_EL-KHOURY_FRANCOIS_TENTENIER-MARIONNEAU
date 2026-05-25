const { useState, useEffect, useRef } = React;

function MessagesPage() {
  const [negotiations, setNegotiations] = useState([]);
  const [activeNeg, setActiveNeg] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [replyOffer, setReplyOffer] = useState("");
  const chatEndRef = useRef(null);
  
  const user = JSON.parse(localStorage.getItem('user'));

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
            alert(`Offre ${statut === 'acceptee' ? 'acceptée' : 'refusée'} !`);
            fetchMessages();
            fetchNegotiations();
            // Mettre à jour l'objet de nego local pour cacher les boutons
            setActiveNeg({...activeNeg, statut_negociation: statut});
        } else {
            alert("Erreur: " + data.error);
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

  // Chercher la dernière offre
  const lastOfferMessage = [...messages].reverse().find(m => m.montant_echange !== null);
  const isSeller = activeNeg && activeNeg.id_user_vendeur == user.id_user;
  const canAccept = isSeller && activeNeg.statut_negociation === 'en_cours' && lastOfferMessage && lastOfferMessage.id_user != user.id_user;

  return (
    <div>
      <Header />
      <main className="main">
        <div className="messages-container">
          <div className="negociations-list">
            <div style={{padding: '20px', borderBottom: '1px solid #f0f0f0', fontWeight: '800'}}>Discussions</div>
            {negotiations.length === 0 && <p style={{padding: '20px', color: '#999'}}>Aucune négociation en cours.</p>}
            {negotiations.map(n => (
              <div 
                key={n.id_negociation} 
                className={`negociation-item ${activeNeg?.id_negociation === n.id_negociation ? 'active' : ''}`}
                onClick={() => setActiveNeg(n)}
              >
                <div className="neg-title">{n.titre_annonce}</div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div className="neg-last-msg">
                        {n.id_user_acheteur == user.id_user ? `Vendeur: ${n.vendeur_pseudo}` : `Acheteur: ${n.acheteur_pseudo}`}
                    </div>
                    {n.statut_negociation !== 'en_cours' && (
                        <span style={{fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: n.statut_negociation === 'acceptee' ? '#7ed957' : '#ff5757', color: '#fff'}}>
                            {n.statut_negociation}
                        </span>
                    )}
                </div>
                <div className="neg-last-msg" style={{marginTop: '5px', fontStyle: 'italic'}}>{n.dernier_message}</div>
              </div>
            ))}
          </div>

          <div className="chat-view">
            {activeNeg ? (
              <>
                <div className="chat-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div>{activeNeg.titre_annonce} - {activeNeg.id_user_acheteur == user.id_user ? activeNeg.vendeur_pseudo : activeNeg.acheteur_pseudo}</div>
                  {canAccept && (
                    <div style={{display: 'flex', gap: '10px'}}>
                        <button onClick={() => handleUpdateStatus('acceptee')} style={{padding: '6px 12px', background: '#7ed957', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700'}}>Accepter l'offre</button>
                        <button onClick={() => handleUpdateStatus('refusee')} style={{padding: '6px 12px', background: '#ff5757', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700'}}>Refuser</button>
                    </div>
                  )}
                </div>
                <div className="chat-messages">
                  {messages.map(m => (
                    <div key={m.id_echange} className={`message-bubble ${m.id_user == user.id_user ? 'mine' : 'other'}`}>
                      {m.montant_echange && <div className="offer-badge">Offre : {m.montant_echange} €</div>}
                      <div>{m.message_echange}</div>
                      <div style={{fontSize: '10px', marginTop: '5px', opacity: 0.7}}>
                        {new Date(m.date_echange).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
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
                  <button className="chat-send-btn" onClick={handleSend} disabled={activeNeg.statut_negociation !== 'en_cours'}>Envoyer</button>
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
