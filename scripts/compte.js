const { useState, useEffect } = React;

function ComptePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupération des données de l'utilisateur stockées à la connexion
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('cart_count');
    window.location.href = "index.html"; // Retour à l'accueil
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px', fontSize: '16px', color: '#666', fontFamily: 'sans-serif' }}>
        Chargement de votre compte...
      </div>
    );
  }

  // Si aucun utilisateur n'est dans le localStorage (non connecté)
  if (!user) {
    return (
      <main style={{ minHeight: '70vh', background: '#fdfbf7', padding: '60px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ padding: '40px', maxWidth: '450px', width: '100%', textAlign: 'center', background: '#fff', borderRadius: '20px', boxShadow: '0 4px 25px rgba(0,0,0,0.06)' }}>
          <h2 style={{ marginBottom: '15px', fontWeight: '900', color: '#111' }}>Accès réservé</h2>
          <p style={{ color: '#666', marginBottom: '25px', fontSize: '14px', lineHeight: '1.5' }}>Veuillez vous connecter pour accéder aux informations de votre espace personnel.</p>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('openAuthModal'))}
            style={{ background: '#e4ca3e', color: '#111', border: 'none', padding: '12px 35px', borderRadius: '25px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(228, 202, 62, 0.3)' }}
          >
            Se connecter
          </button>
        </div>
      </main>
    );
  }

  const canSell = user.role_user === 'vendeur' || user.role_user === 'admin';

  return (
    <main style={{ minHeight: '75vh', background: '#fdfbf7', padding: '50px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 30px rgba(0,0,0,0.04)' }}>
        
        {/* En-tête de la page - Reprise exacte des badges de ta DA */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', borderBottom: '2px solid #fdfbf7', paddingBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: '#111' }}>Mon Profil</h2>
          <span style={{ fontSize: '11px', background: '#fff9db', padding: '6px 14px', borderRadius: '15px', color: '#bfa413', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {user.role_user || 'Acheteur'}
          </span>
        </div>

        {/* Liste des informations utilisateur (comme dans la modale) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', marginBottom: '35px' }}>
          <div>
            <span style={{ fontSize: '11px', color: '#999', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pseudo</span>
            <p style={{ margin: '5px 0 0 0', fontSize: '16px', fontWeight: '700', color: '#111' }}>@{user.pseudo_user}</p>
          </div>
          
          <div>
            <span style={{ fontSize: '11px', color: '#999', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Prénom & Nom</span>
            <p style={{ margin: '5px 0 0 0', fontSize: '16px', fontWeight: '700', color: '#111' }}>{user.prenom_user} {user.nom_user || ''}</p>
          </div>
          
          <div>
            <span style={{ fontSize: '11px', color: '#999', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Adresse e-mail</span>
            <p style={{ margin: '5px 0 0 0', fontSize: '16px', fontWeight: '700', color: '#111' }}>{user.email_user}</p>
          </div>

          {user.adresse_user && (
            <div>
              <span style={{ fontSize: '11px', color: '#999', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Adresse de livraison</span>
              <p style={{ margin: '5px 0 0 0', fontSize: '16px', fontWeight: '700', color: '#111' }}>{user.adresse_user}</p>
            </div>
          )}
        </div>

        {/* Alerte Statut Jaune / Vert de ton modèle */}
        {canSell ? (
          <div style={{ background: '#e6f4ea', color: '#137333', padding: '15px 20px', borderRadius: '12px', marginBottom: '35px', fontSize: '13px', fontWeight: '600' }}>
            ✅ Votre statut de compte vous autorise à vendre des articles sur Mercato Nova.
          </div>
        ) : (
          <div style={{ background: '#fff3cd', color: '#856404', padding: '15px 20px', borderRadius: '14px', marginBottom: '35px', fontSize: '13px', fontWeight: '600', lineHeight: '1.4' }}>
            ⚠️ Compte acheteur. Contactez le support si vous souhaitez vendre des articles sur la plateforme.
          </div>
        )}

        {/* Zone des boutons du bas */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f9f6ee', paddingTop: '25px' }}>
          <button 
            onClick={handleLogout} 
            style={{ background: '#ff5757', color: '#fff', border: 'none', padding: '12px 30px', borderRadius: '25px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(255, 87, 87, 0.25)', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#e04444'}
            onMouseLeave={e => e.currentTarget.style.background = '#ff5757'}
          >
            Déconnexion
          </button>
        </div>

      </div>
    </main>
  );
}

// Rendre la page disponible pour l'assemblage dans compte.html
window.ComptePage = ComptePage;