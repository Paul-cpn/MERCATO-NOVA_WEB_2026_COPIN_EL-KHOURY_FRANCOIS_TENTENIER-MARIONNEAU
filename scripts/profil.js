const { useState, useEffect } = React;

function ProfilePage() {
    const Header = window.Header;
    const Footer = window.Footer;
    const [activeTab, setActiveTab] = useState('infos');
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        nom: '', prenom: '', email: '', pseudo: '', adresse: ''
    });
    const [history, setHistory] = useState([]);
    const [myArticles, setMyArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState({ message: '', type: '' });
    const [editingArticle, setEditingArticle] = useState(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const u = JSON.parse(savedUser);
            setUser(u);
            setFormData({
                nom: u.nom_user || '',
                prenom: u.prenom_user || '',
                email: u.email_user || '',
                pseudo: u.pseudo_user || '',
                adresse: u.adresse_user || ''
            });
            setLoading(false);
        } else {
            window.location.href = "index.html";
        }
    }, []);

    const fetchHistory = (type) => {
        if (!user) return;
        fetch(`../scripts/get_order_history.php?id_user=${user.id_user}&type=${type}`)
            .then(res => res.json())
            .then(data => setHistory(data));
    };

    const fetchMyArticles = () => {
        if (!user) return;
        fetch(`../scripts/get_user_articles.php?id_user=${user.id_user}`)
            .then(res => res.json())
            .then(data => setMyArticles(data));
    };

    useEffect(() => {
        if (activeTab === 'achats') fetchHistory('achats');
        if (activeTab === 'ventes') fetchHistory('ventes');
        if (activeTab === 'annonces') fetchMyArticles();
    }, [activeTab, user]);

    const handleUpdateProfile = (e) => {
        e.preventDefault();
        fetch('../scripts/update_profile.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, id_user: user.id_user })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                localStorage.setItem('user', JSON.stringify(data.user));
                setUser(data.user);
                setFeedback({ message: 'Profil mis à jour !', type: 'success' });
            } else {
                setFeedback({ message: 'Erreur : ' + data.error, type: 'error' });
            }
            setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
        });
    };

    const handleDeleteArticle = (id) => {
        if (!confirm("Supprimer cette annonce ?")) return;
        fetch('../scripts/admin_delete_annonce.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_annonce: id, id_user: user.id_user })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) fetchMyArticles();
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.href = "index.html";
    };

    const handleUpdateArticle = (e) => {
        e.preventDefault();
        fetch('../scripts/update_article.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...editingArticle, id_user: user.id_user })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setEditingArticle(null);
                fetchMyArticles();
                setFeedback({ message: 'Annonce mise à jour avec succès !', type: 'success' });
            } else {
                setFeedback({ message: 'Erreur : ' + data.error, type: 'error' });
            }
            setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
        });
    };

    if (loading) return null;

    const isVendeur = user && (user.role_user === 'vendeur' || user.role_user === 'admin');

    return (
        <div>
            <Header />
            <main className="profile-container">
                {editingArticle && (
                    <div className="modal-overlay" onClick={() => setEditingArticle(null)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '600px'}}>
                            <h2 style={{marginBottom: '20px'}}>Modifier mon annonce</h2>
                            <form onSubmit={handleUpdateArticle}>
                                <div className="form-group">
                                    <label>Titre de l'annonce</label>
                                    <input type="text" value={editingArticle.titre_annonce} required
                                        onChange={e => setEditingArticle({...editingArticle, titre_annonce: e.target.value})} />
                                </div>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Prix (€)</label>
                                        <input type="number" step="0.01" value={editingArticle.prix_annonce} required
                                            onChange={e => setEditingArticle({...editingArticle, prix_annonce: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>État</label>
                                        <select value={editingArticle.etat_objet_annonce} required
                                            onChange={e => setEditingArticle({...editingArticle, etat_objet_annonce: e.target.value})}>
                                            <option value="neuf">Neuf</option>
                                            <option value="tres_bon">Très bon état</option>
                                            <option value="bon">Bon état</option>
                                            <option value="acceptable">Acceptable</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Taille</label>
                                        <input type="text" value={editingArticle.taille_annonce}
                                            onChange={e => setEditingArticle({...editingArticle, taille_annonce: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Couleur</label>
                                        <input type="text" value={editingArticle.couleur_annonce}
                                            onChange={e => setEditingArticle({...editingArticle, couleur_annonce: e.target.value})} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Matière</label>
                                    <input type="text" value={editingArticle.matiere_annonce}
                                        onChange={e => setEditingArticle({...editingArticle, matiere_annonce: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea rows="4" value={editingArticle.description_annonce} required
                                        onChange={e => setEditingArticle({...editingArticle, description_annonce: e.target.value})}
                                        style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd'}}></textarea>
                                </div>
                                <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
                                    <button type="submit" className="save-btn" style={{margin: 0}}>Enregistrer</button>
                                    <button type="button" className="btn-danger" onClick={() => setEditingArticle(null)} style={{background: '#999'}}>Annuler</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                <div className="profile-nav">
                    <button className={`profile-nav-btn ${activeTab === 'infos' ? 'active' : ''}`} onClick={() => setActiveTab('infos')}>Mes informations</button>
                    <button className={`profile-nav-btn ${activeTab === 'achats' ? 'active' : ''}`} onClick={() => setActiveTab('achats')}>Historique d'achat</button>
                    {isVendeur && (
                        <>
                            <button className={`profile-nav-btn ${activeTab === 'ventes' ? 'active' : ''}`} onClick={() => setActiveTab('ventes')}>Historique de vente</button>
                            <button className={`profile-nav-btn ${activeTab === 'annonces' ? 'active' : ''}`} onClick={() => setActiveTab('annonces')}>Mes annonces en ligne</button>
                        </>
                    )}
                    <button className="profile-nav-btn" style={{ color: '#ff5757', marginTop: '20px' }} onClick={handleLogout}>Déconnexion</button>
                </div>

                <div className="profile-content">
                    {feedback.message && (
                        <div style={{ padding: '15px', borderRadius: '10px', marginBottom: '20px', background: feedback.type === 'success' ? '#d4edda' : '#f8d7da', color: feedback.type === 'success' ? '#155724' : '#721c24' }}>
                            {feedback.message}
                        </div>
                    )}

                    {activeTab === 'infos' && (
                        <div>
                            <h2 className="profile-section-title">Mes informations</h2>
                            <form onSubmit={handleUpdateProfile}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Prénom</label>
                                        <input type="text" value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Nom</label>
                                        <input type="text" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Pseudo</label>
                                        <input type="text" value={formData.pseudo} onChange={e => setFormData({...formData, pseudo: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                    </div>
                                </div>
                                <div className="form-group" style={{ marginTop: '20px' }}>
                                    <label>Adresse de livraison</label>
                                    <input type="text" value={formData.adresse} onChange={e => setFormData({...formData, adresse: e.target.value})} />
                                </div>
                                <div style={{ marginTop: '15px' }}>
                                    <span className={`badge-role ${isVendeur ? 'badge-seller' : 'badge-buyer'}`}>
                                        Statut : {user.role_user}
                                    </span>
                                </div>
                                <button type="submit" className="save-btn">Enregistrer les modifications</button>
                            </form>
                        </div>
                    )}

                    {(activeTab === 'achats' || activeTab === 'ventes') && (
                        <div>
                            <h2 className="profile-section-title">{activeTab === 'achats' ? "Historique d'achat" : "Historique de vente"}</h2>
                            {history.length === 0 ? (
                                <p style={{ color: '#999', textAlign: 'center', padding: '40px' }}>Aucune transaction trouvée.</p>
                            ) : (
                                history.map(t => (
                                    <div key={t.id_transaction} className="history-item">
                                        <img src={t.image_url || '../images/panier_classique.png'} className="history-img" />
                                        <div className="history-info">
                                            <div className="history-title">{t.titre_annonce}</div>
                                            <div className="history-meta">Transaction n°{t.id_transaction} · {new Date(t.date_transaction).toLocaleDateString()}</div>
                                        </div>
                                        <div className="history-price">{t.montant_transaction} €</div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'annonces' && (
                        <div>
                            <h2 className="profile-section-title">Mes annonces en ligne</h2>
                            {myArticles.length === 0 ? (
                                <p style={{ color: '#999', textAlign: 'center', padding: '40px' }}>Vous n'avez aucune annonce en ligne.</p>
                            ) : (
                                myArticles.map(a => (
                                    <div key={a.id_annonce} className="history-item">
                                        <img src={a.image_url || '../images/panier_classique.png'} className="history-img" />
                                        <div className="history-info">
                                            <div className="history-title">{a.titre_annonce}</div>
                                            <div className="history-meta">Publiée le {new Date(a.date_annonce).toLocaleDateString()} · Statut : {a.statut_annonce}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <div className="history-price">{a.prix_annonce} €</div>
                                            <button className="save-btn" style={{margin: 0, padding: '8px 15px', fontSize: '12px'}} 
                                                onClick={() => setEditingArticle(a)}>Modifier</button>
                                            <button className="btn-danger" onClick={() => handleDeleteArticle(a.id_annonce)}>Supprimer</button>
                                        </div>
                                    </div>
                                ))
                            )}
                            <a href="vendre.html" className="save-btn" style={{ display: 'inline-block', textDecoration: 'none', marginTop: '20px' }}>Vendre un nouvel article</a>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<ProfilePage />);
