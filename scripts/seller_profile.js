// seller_profile.js
const { useState, useEffect } = React;

function SellerProfile() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Récupération sécurisée des composants globaux
    const HeaderComp = window.Header;
    const FooterComp = window.Footer;

    useEffect(() => {
        console.log("SellerProfile: useEffect running");
        const urlParams = new URLSearchParams(window.location.search);
        const sellerId = urlParams.get('id');

        if (!sellerId) {
            console.log("SellerProfile: No ID found, redirecting...");
            window.location.href = "index.html";
            return;
        }

        console.log("SellerProfile: Fetching data for seller", sellerId);
        fetch(`../scripts/get_seller_profile.php?id=${sellerId}`)
            .then(res => {
                if (!res.ok) throw new Error("Réponse serveur non OK: " + res.status);
                return res.json();
            })
            .then(resData => {
                console.log("SellerProfile: Data received", resData);
                if (resData.error) {
                    setError(resData.error);
                } else {
                    setData(resData);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("SellerProfile: Fetch error:", err);
                setError("Erreur lors du chargement du profil : " + err.message);
                setLoading(false);
            });
    }, []);

    // Rendu en cas de chargement
    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                {HeaderComp && <HeaderComp />}
                <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '50px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '40px', marginBottom: '20px' }}>⌛</div>
                        <p style={{ fontSize: '18px', color: '#666' }}>Chargement du profil vendeur...</p>
                    </div>
                </main>
                {FooterComp && <FooterComp />}
            </div>
        );
    }

    // Rendu en cas d'erreur
    if (error) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                {HeaderComp && <HeaderComp />}
                <main style={{ flex: 1, padding: '50px' }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                        <h2 style={{ color: '#ff5757', marginBottom: '15px' }}>Oups !</h2>
                        <p style={{ color: '#666', marginBottom: '25px' }}>{error}</p>
                        <button 
                            onClick={() => window.location.href = 'index.html'}
                            style={{ padding: '12px 25px', background: 'var(--jaune)', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            Retour à l'accueil
                        </button>
                    </div>
                </main>
                {FooterComp && <FooterComp />}
            </div>
        );
    }

    // Sécurité supplémentaire
    if (!data || !data.seller) {
        return (
            <div style={{ padding: '50px', textAlign: 'center' }}>
                <p>Aucune donnée trouvée pour ce vendeur.</p>
                <a href="index.html">Retour</a>
            </div>
        );
    }

    const { seller, articles, avis } = data;
    const rating = parseFloat(seller.note || 0).toFixed(1);
    const initial = seller.pseudo_user ? seller.pseudo_user.charAt(0).toUpperCase() : '?';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {HeaderComp && <HeaderComp />}
            
            <main style={{ flex: 1, maxWidth: '1000px', margin: '40px auto', padding: '0 20px', width: '100%' }}>
                {/* ← BOUTON RETOUR */}
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
                        marginBottom: '30px'
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

                {/* Header Profil */}
                <div style={{ 
                    background: '#fff', 
                    padding: '40px', 
                    borderRadius: '20px', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '40px',
                    marginBottom: '50px',
                    border: '1px solid #f0f0f0'
                }}>
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: 'var(--jaune)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '50px',
                        color: '#fff',
                        fontWeight: '900'
                    }}>
                        {initial}
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '800' }}>{seller.pseudo_user}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '15px', color: '#666' }}>
                            <span>⭐ {rating} / 5 ({seller.nb_avis} avis)</span>
                            <span>|</span>
                            <span>📦 {seller.ventes} ventes</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '40px' }}>
                    {/* Liste des articles */}
                    <div>
                        <h2 style={{ marginBottom: '20px', fontSize: '22px', fontWeight: '800' }}>Articles en vente</h2>
                        {articles.length === 0 ? (
                            <p style={{ color: '#999' }}>Ce vendeur n'a aucun article en vente.</p>
                        ) : (
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                                gap: '20px' 
                            }}>
                                {articles.map(a => (
                                    <a key={a.id_annonce} href={`produit.html?id=${a.id_annonce}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div className="article-card" style={{ height: '100%', borderRadius: '12px', border: '1px solid #eee', overflow: 'hidden' }}>
                                            <div style={{ height: '180px', background: `url(${a.image_url || '../images/panier_classique.png'}) center/cover` }}></div>
                                            <div style={{ padding: '15px' }}>
                                                <div style={{ fontSize: '14px', fontWeight: '600', height: '40px', overflow: 'hidden' }}>{a.titre_annonce}</div>
                                                <div style={{ fontWeight: '800', marginTop: '10px', color: 'var(--jaune)' }}>{a.prix_annonce} €</div>
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Derniers avis */}
                    <div>
                        <h2 style={{ marginBottom: '20px', fontSize: '22px', fontWeight: '800' }}>Derniers avis</h2>
                        {avis.length === 0 ? (
                            <p style={{ color: '#999' }}>Aucun avis.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {avis.map(av => (
                                    <div key={av.id_avis} style={{ padding: '15px', background: '#f9f9f9', borderRadius: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                            <span style={{ fontWeight: 'bold' }}>{av.auteur_pseudo}</span>
                                            <span style={{ color: 'var(--jaune)' }}>{'⭐'.repeat(av.note_avis)}</span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{av.commentaire_avis}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {FooterComp && <FooterComp />}
        </div>
    );
}

// Initialisation du rendu
const container = document.getElementById("root");
if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(<SellerProfile />);
} else {
    console.error("SellerProfile: Root container not found!");
}
