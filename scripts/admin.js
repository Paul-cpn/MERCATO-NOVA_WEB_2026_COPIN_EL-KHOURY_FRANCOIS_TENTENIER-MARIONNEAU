const { useState, useEffect } = React;

const Header = window.Header;
const Footer = window.Footer;

function AdminPage() {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [feedback, setFeedback] = useState({ message: '', type: '' });
    
    // Pour la modale de modification (On réutilise la logique de profil.js)
    const [editingArticle, setEditingArticle] = useState(null);
    const constants = window.APP_CONSTANTS || { ETATS: [], MATIERES: [], COULEURS: [], TAILLES_VETEMENTS: [], TAILLES_BAS: [] };

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (!savedUser) {
            window.location.href = "index.html";
            return;
        }
        const u = JSON.parse(savedUser);
        if (u.role_user !== 'admin') {
            window.location.href = "index.html";
            return;
        }
        setCurrentUser(u);
        fetchData(u.id_user);
    }, []);

    const fetchData = (adminId) => {
        setLoading(true);
        fetch('../scripts/admin_get_data.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_admin: adminId })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setUsers(data.users);
                setArticles(data.articles);
            } else {
                setFeedback({ message: data.error, type: 'error' });
            }
            setLoading(false);
        });
    };

    const handleDeleteUser = (id) => {
        if (id === currentUser.id_user) {
            alert("Vous ne pouvez pas supprimer votre propre compte admin.");
            return;
        }
        if (!confirm("⚠️ ATTENTION : Cela supprimera définitivement le compte, toutes ses annonces, ses messages et ses transactions. Continuer ?")) return;

        fetch('../scripts/admin_delete_user.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_admin: currentUser.id_user, id_target: id })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setFeedback({ message: "Utilisateur supprimé avec succès", type: 'success' });
                fetchData(currentUser.id_user);
            } else {
                setFeedback({ message: data.error, type: 'error' });
            }
            setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
        });
    };

    const handleDeleteArticle = (id) => {
        if (!confirm("Supprimer cet article définitivement ?")) return;

        fetch('../scripts/admin_delete_annonce.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_annonce: id, id_user: currentUser.id_user })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setFeedback({ message: "Article supprimé", type: 'success' });
                fetchData(currentUser.id_user);
            } else {
                setFeedback({ message: data.error, type: 'error' });
            }
            setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
        });
    };

    const handleUpdateArticle = (e) => {
        e.preventDefault();
        fetch('../scripts/update_article.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...editingArticle, id_user: editingArticle.id_user }) // On utilise l'ID du proprio original
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setEditingArticle(null);
                setFeedback({ message: 'Article mis à jour par admin !', type: 'success' });
                fetchData(currentUser.id_user);
            } else {
                setFeedback({ message: 'Erreur : ' + data.error, type: 'error' });
            }
            setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
        });
    };

    if (loading && !users.length) return <div style={{padding: '100px', textAlign: 'center'}}>Chargement du dashboard...</div>;

    return (
        <div>
            <Header />
            <main className="admin-container">
                <h1 style={{fontSize: '32px', marginBottom: '30px'}}>Tableau de Bord Administrateur</h1>

                {feedback.message && (
                    <div style={{ padding: '15px', borderRadius: '12px', marginBottom: '20px', background: feedback.type === 'success' ? '#d4edda' : '#f8d7da', color: feedback.type === 'success' ? '#155724' : '#721c24', fontWeight: '700', textAlign: 'center' }}>
                        {feedback.message}
                    </div>
                )}

                <div className="admin-stats">
                    <div className="stat-card">
                        <h3>Utilisateurs</h3>
                        <p>{users.length}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Articles en ligne</h3>
                        <p>{articles.length}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Ventes totales</h3>
                        <p>{articles.filter(a => a.statut_annonce === 'vendu').length}</p>
                    </div>
                </div>

                <div className="admin-nav">
                    <button className={`admin-nav-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>👥 Gestion Utilisateurs</button>
                    <button className={`admin-nav-btn ${activeTab === 'articles' ? 'active' : ''}`} onClick={() => setActiveTab('articles')}>🛍️ Gestion Articles</button>
                </div>

                {activeTab === 'users' ? (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Pseudo</th>
                                <th>Nom / Prénom</th>
                                <th>Email</th>
                                <th>Rôle</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id_user}>
                                    <td>{u.id_user}</td>
                                    <td><strong>{u.pseudo_user}</strong></td>
                                    <td>{u.nom_user} {u.prenom_user}</td>
                                    <td>{u.email_user}</td>
                                    <td><span className={`badge-role badge-${u.role_user}`}>{u.role_user}</span></td>
                                    <td>
                                        <button className="btn-action btn-delete" onClick={() => handleDeleteUser(u.id_user)}>Supprimer</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Titre</th>
                                <th>Vendeur</th>
                                <th>Prix</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.map(a => (
                                <tr key={a.id_annonce}>
                                    <td><img src={a.image_url || '../images/panier_classique.png'} style={{width: '40px', height: '40px', borderRadius: '5px', objectFit: 'cover'}} /></td>
                                    <td>{a.titre_annonce}</td>
                                    <td>{a.vendeur_pseudo}</td>
                                    <td>{a.prix_annonce} €</td>
                                    <td>{a.statut_annonce}</td>
                                    <td>
                                        <button className="btn-action btn-edit" onClick={() => setEditingArticle(a)}>Modifier</button>
                                        <button className="btn-action btn-delete" onClick={() => handleDeleteArticle(a.id_annonce)}>Supprimer</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* MODALE DE MODIFICATION (ADMIN) */}
                {editingArticle && (
                    <div className="modal-overlay" onClick={() => setEditingArticle(null)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '600px'}}>
                            <h2>Modifier (Mode Admin)</h2>
                            <form onSubmit={handleUpdateArticle}>
                                <div className="form-group">
                                    <label>Titre</label>
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
                                            {constants.ETATS.map(et => <option key={et.id} value={et.id}>{et.label}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Matière</label>
                                    <select value={editingArticle.matiere_annonce} required
                                        onChange={e => setEditingArticle({...editingArticle, matiere_annonce: e.target.value})}>
                                        {constants.MATIERES.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea rows="4" value={editingArticle.description_annonce} required
                                        onChange={e => setEditingArticle({...editingArticle, description_annonce: e.target.value})}
                                        style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd'}}></textarea>
                                </div>
                                <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
                                    <button type="submit" className="save-btn" style={{margin: 0}}>Enregistrer modifications</button>
                                    <button type="button" className="btn-danger" onClick={() => setEditingArticle(null)} style={{background: '#999'}}>Annuler</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<AdminPage />);
