const { useState, useEffect } = React;

const Header = window.Header;
const Footer = window.Footer;

function SellerProfile() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const sellerId = urlParams.get('id');

        if (!sellerId) {
            window.location.href = "index.html";
            return;
        }

        fetch(`../scripts/get_seller_profile.php?id=${sellerId}`)
            .then(res => res.json())
            .then(resData => {
                if (resData.error) setError(resData.error);
                else setData(resData);
                setLoading(false);
            })
            .catch(err => {
                setError("Erreur lors du chargement du profil");
                setLoading(false);
            });
    }, []);

    if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>Chargement...</div>;
    if (error) return <div style={{padding: '50px', textAlign: 'center', color: 'red'}}>{error}</div>;

    const { seller, articles, avis } = data;
    const rating = parseFloat(seller.note || 0).toFixed(1);

    return (
        <div>
            <Header />
            <main style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
                {/* Header Profil */}
                <div style={{ 
                    background: '#fff', 
                    padding: '30px', 
                    borderRadius: '15px', 
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '30px',
                    marginBottom: '40px'
                }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: 'var(--jaune)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '40px',
                        color: '#fff',
                        fontWeight: 'bold'
                    }}>
                        {seller.pseudo_user.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '28px' }}>{seller.pseudo_user}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px', color: '#666' }}>
                            <span>⭐ {rating} / 5 ({seller.nb_avis} avis)</span>
                            <span>|</span>
                            <span>📦 {seller.ventes} ventes réalisées</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
                    {/* Liste des articles */}
                    <div>
                        <h2 style={{ marginBottom: '20px', fontSize: '22px' }}>Articles en vente</h2>
                        {articles.length === 0 ? (
                            <p style={{ color: '#999' }}>Ce vendeur n'a aucun article en vente pour le moment.</p>
                        ) : (
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                                gap: '20px' 
                            }}>
                                {articles.map(a => (
                                    <a key={a.id_annonce} href={`produit.html?id=${a.id_annonce}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div className="article-card" style={{ height: '100%' }}>
                                            <div className="article-image-wrapper">
                                                <div className="article-image" style={{ backgroundImage: `url(${a.image_url || '../images/panier_classique.png'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                                            </div>
                                            <div className="article-info" style={{ padding: '15px' }}>
                                                <div className="article-titre" style={{ fontSize: '14px', height: '40px', overflow: 'hidden' }}>{a.titre_annonce}</div>
                                                <div className="article-prix" style={{ fontWeight: 'bold', marginTop: '5px' }}>{a.prix_annonce} €</div>
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Derniers avis */}
                    <div>
                        <h2 style={{ marginBottom: '20px', fontSize: '22px' }}>Derniers avis</h2>
                        {avis.length === 0 ? (
                            <p style={{ color: '#999' }}>Aucun avis pour le moment.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {avis.map(av => (
                                    <div key={av.id_avis} style={{ padding: '15px', background: '#f9f9f9', borderRadius: '10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{av.auteur_pseudo}</span>
                                            <span style={{ color: 'var(--jaune)' }}>{'⭐'.repeat(av.note_avis)}</span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{av.commentaire_avis}</p>
                                        <div style={{ fontSize: '10px', color: '#bbb', marginTop: '5px' }}>{new Date(av.date_avis).toLocaleDateString()}</div>
                                    </div>
                                ))}
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
root.render(<SellerProfile />);
