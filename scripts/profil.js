const { useState, useEffect } = React;

function ProfilePage() {
    const Header = window.Header;
    const Footer = window.Footer;
    const [activeTab, setActiveTab] = useState('infos');
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        nom: '', prenom: '', email: '', pseudo: '', adresse: '',
        oldPassword: '', newPassword: '', confirmPassword: ''
    });
    const [history, setHistory] = useState([]);
    const [myArticles, setMyArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState({ message: '', type: '' });
    const [editingArticle, setEditingArticle] = useState(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                const u = JSON.parse(savedUser);
                setUser(u);
                setFormData({
                    nom: u.nom_user || '',
                    prenom: u.prenom_user || '',
                    email: u.email_user || '',
                    pseudo: u.pseudo_user || '',
                    adresse: u.adresse_user || '',
                    oldPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            } catch (e) {
                console.error("Error parsing user from localStorage:", e);
                window.location.href = "index.html";
            }
            setLoading(false);
        } else {
            window.location.href = "index.html";
        }
    }, []);

    const fetchHistory = (type) => {
        if (!user) return;
        fetch(`../scripts/get_order_history.php?id_user=${user.id_user}&type=${type}`)
            .then(res => res.json())
            .then(data => setHistory(data))
            .catch(err => console.error("Error fetching history:", err));
    };

    const fetchMyArticles = () => {
        if (!user) return;
        fetch(`../scripts/get_user_articles.php?id_user=${user.id_user}`)
            .then(res => res.json())
            .then(data => setMyArticles(data))
            .catch(err => console.error("Error fetching articles:", err));
    };

    const role = user ? String(user.role_user).toLowerCase() : '';
    const isVendeur = role === 'vendeur' || role === 'admin';

    useEffect(() => {
        if (activeTab === 'achats') fetchHistory('achats');
        if (activeTab === 'ventes' && isVendeur) fetchHistory('ventes');
        if (activeTab === 'annonces' && isVendeur) fetchMyArticles();

        if (!isVendeur && (activeTab === 'ventes' || activeTab === 'annonces')) {
            setActiveTab('infos');
        }
    }, [activeTab, user, isVendeur]);

    const handleUpdateProfile = (e) => {
        e.preventDefault();

        // Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setFeedback({ message: "Format d'email invalide.", type: 'error' });
            return;
        }
        if (formData.nom.trim().length < 2 || formData.prenom.trim().length < 2) {
            setFeedback({ message: "Le nom et le prénom doivent faire au moins 2 caractères.", type: 'error' });
            return;
        }
        if (formData.pseudo.trim().length < 3) {
            setFeedback({ message: "Le pseudo est trop court.", type: 'error' });
            return;
        }

        // Validation mot de passe (si l'un des champs est rempli)
        if (formData.oldPassword || formData.newPassword || formData.confirmPassword) {
            if (!formData.oldPassword) {
                setFeedback({ message: "Veuillez saisir votre mot de passe actuel.", type: 'error' });
                return;
            }
            if (!formData.newPassword) {
                setFeedback({ message: "Veuillez saisir un nouveau mot de passe.", type: 'error' });
                return;
            }
            if (formData.newPassword.length < 8) {
                setFeedback({ message: "Le nouveau mot de passe doit faire au moins 8 caractères.", type: 'error' });
                return;
            }
            if (formData.newPassword !== formData.confirmPassword) {
                setFeedback({ message: "Les nouveaux mots de passe ne correspondent pas.", type: 'error' });
                return;
            }
        }

        console.log("Sending profile update:", { ...formData, id_user: user.id_user });

        fetch('../scripts/update_profile.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, id_user: user.id_user })
        })
        .then(res => res.json())
        .then(data => {
            console.log("Response from update_profile.php:", data);
            if (data.success) {
                localStorage.setItem('user', JSON.stringify(data.user));
                setUser(data.user);
                // Reset password fields
                setFormData(prev => ({ 
                    ...prev, 
                    oldPassword: '', 
                    newPassword: '', 
                    confirmPassword: '' 
                }));
                window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: data.user }));
                setFeedback({ message: 'Profil mis à jour avec succès !', type: 'success' });
            } else {
                setFeedback({ message: 'Erreur : ' + (data.error || 'Erreur inconnue'), type: 'error' });
            }
            setTimeout(() => setFeedback({ message: '', type: '' }), 4000);
        })
        .catch(err => {
            console.error("Fetch error:", err);
            setFeedback({ message: "Erreur réseau lors de la mise à jour.", type: 'error' });
            setTimeout(() => setFeedback({ message: '', type: '' }), 4000);
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

    const constants = window.APP_CONSTANTS || { ETATS: [], MATIERES: [], COULEURS: [], TAILLES_VETEMENTS: [], TAILLES_BAS: [] };

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
                                    <input type="text" value={editingArticle.titre_annonce} required minLength="3" maxLength="50"
                                        onChange={e => setEditingArticle({...editingArticle, titre_annonce: e.target.value})} />
                                </div>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Prix (€)</label>
                                        <input type="number" step="0.01" min="1" value={editingArticle.prix_annonce} required
                                            onChange={e => setEditingArticle({...editingArticle, prix_annonce: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>État</label>
                                        <select value={editingArticle.etat_objet_annonce} required
                                            onChange={e => setEditingArticle({...editingArticle, etat_objet_annonce: e.target.value})}>
                                            <option value="">Choisir...</option>
                                            {constants.ETATS.map(et => <option key={et.id} value={et.id}>{et.label}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Taille</label>
                                        <select value={editingArticle.taille_annonce} required
                                            onChange={e => setEditingArticle({...editingArticle, taille_annonce: e.target.value})}>
                                            <option value="">Choisir...</option>
                                            {[...constants.TAILLES_VETEMENTS, ...constants.TAILLES_BAS].map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Couleur</label>
                                        <select value={editingArticle.couleur_annonce} required
                                            onChange={e => setEditingArticle({...editingArticle, couleur_annonce: e.target.value})}>
                                            <option value="">Choisir...</option>
                                            {constants.COULEURS.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Matière</label>
                                    <select value={editingArticle.matiere_annonce} required
                                        onChange={e => setEditingArticle({...editingArticle, matiere_annonce: e.target.value})}>
                                        <option value="">Choisir...</option>
                                        {constants.MATIERES.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea rows="4" value={editingArticle.description_annonce} required maxLength="300"
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
                        <div style={{ 
                            padding: '15px', 
                            borderRadius: '10px', 
                            marginBottom: '20px', 
                            background: feedback.type === 'success' ? '#d4edda' : '#f8d7da', 
                            color: feedback.type === 'success' ? '#155724' : '#721c24',
                            border: `1px solid ${feedback.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                            fontWeight: '600'
                        }}>
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
                                        <input type="text" value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Nom</label>
                                        <input type="text" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Pseudo</label>
                                        <input type="text" value={formData.pseudo} onChange={e => setFormData({...formData, pseudo: e.target.value})} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                                    </div>
                                </div>
                                <div className="form-group" style={{ marginTop: '20px' }}>
                                    <label>Adresse de livraison</label>
                                    <input type="text" value={formData.adresse} onChange={e => setFormData({...formData, adresse: e.target.value})} />
                                </div>

                                <div style={{ marginTop: '30px', padding: '25px', background: '#fcfcfc', borderRadius: '15px', border: '2px solid #f0f0f0', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.02)' }}>
                                    <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', color: '#333' }}>
                                        <span style={{fontSize: '20px'}}></span>Mot de passe
                                    </h3>
                                    <div className="form-group">
                                        <label>Mot de passe actuel</label>
                                        <input 
                                            type="password" 
                                            value={formData.oldPassword} 
                                            onChange={e => setFormData({...formData, oldPassword: e.target.value})} 
                                        />
                                    </div>
                                    <div className="form-grid" style={{ marginTop: '15px' }}>
                                        <div className="form-group">
                                            <label>Nouveau mot de passe</label>
                                            <input 
                                                type="password" 
                                                value={formData.newPassword} 
                                                onChange={e => setFormData({...formData, newPassword: e.target.value})} 
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Confirmer le nouveau mot de passe</label>
                                            <input 
                                                type="password" 
                                                value={formData.confirmPassword} 
                                                onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span className={`badge-role ${isVendeur ? 'badge-seller' : 'badge-buyer'}`} style={{fontSize: '14px'}}>
                                        Type de compte : <strong>{user.role_user.toUpperCase()}</strong>
                                    </span>
                                    <button type="submit" className="save-btn" style={{margin: 0}}>Enregistrer les modifications</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'achats' && (
                        <div>
                            <h2 className="profile-section-title">Historique d'achat</h2>
                            {history.length === 0 ? (
                                <p style={{ color: '#999', textAlign: 'center', padding: '40px' }}>Aucun achat trouvé.</p>
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

                    {activeTab === 'ventes' && isVendeur && (
                        <div>
                            <h2 className="profile-section-title">Historique de vente</h2>
                            {history.length === 0 ? (
                                <p style={{ color: '#999', textAlign: 'center', padding: '40px' }}>Aucune vente trouvée.</p>
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

                    {activeTab === 'annonces' && isVendeur && (
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
