const { useState, useEffect } = React;

function VendrePage() {
  const user = JSON.parse(localStorage.getItem('user'));
  
  // États pour les catégories hiérarchiques
  const [categoryTree, setCategoryTree] = useState([]);
  const [level1, setLevel1] = useState([]); // Homme, Femme, Enfant
  const [level2, setLevel2] = useState([]); // Haut, Bas, Accessoire
  const [level3, setLevel3] = useState([]); // T-shirt, Jeans...

  const [selectedL1, setSelectedL1] = useState('');
  const [selectedL2, setSelectedL2] = useState('');

  const [formData, setFormData] = useState({
    titre: '', description: '', prix: '', etat: 'bon', type_vente: 'achat_direct',
    taille: '', couleur: '', marque: '', id_categorie: '', image_url: '', matiere: '',
    date_fin_enchere: ''
  });
  const [status, setStatus] = useState({ message: '', type: '' });

  useEffect(() => {
    if (!user || (user.role_user !== 'vendeur' && user.role_user !== 'admin')) {
        window.location.href = "index.html";
        return;
    }

    // Charger l'arbre complet
    fetch('../scripts/get_categories.php')
      .then(res => res.json())
      .then(data => {
        setCategoryTree(data);
        setLevel1(data);
      });
  }, []);

  // Quand on change le niveau 1 (Homme/Femme/Enfant)
  const handleL1Change = (id) => {
    setSelectedL1(id);
    setSelectedL2('');
    setFormData({...formData, id_categorie: id});
    const cat = categoryTree.find(c => c.id_categorie == id);
    setLevel2(cat ? cat.subs : []);
    setLevel3([]);
  };

  // Quand on change le niveau 2 (Haut/Bas/Accessoire)
  const handleL2Change = (id) => {
    setSelectedL2(id);
    setFormData({...formData, id_categorie: id});
    const cat = level2.find(c => c.id_categorie == id);
    setLevel3(cat ? cat.subs : []);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus({ message: '', type: '' });

    if (!formData.id_categorie) {
        setStatus({ message: "Veuillez sélectionner une catégorie finale.", type: 'error' });
        return;
    }
    
    fetch('../scripts/add_article.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id_user: user.id_user })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            setStatus({ message: "Article publié avec succès ! Redirection...", type: 'success' });
            setTimeout(() => window.location.href = "index.html", 2000);
        } else {
            setStatus({ message: "Erreur: " + data.error, type: 'error' });
        }
    })
    .catch(() => setStatus({ message: "Erreur réseau", type: 'error' }));
  };

  return (
    <div>
      <Header />
      <main className="main">
        <div className="sell-container">
            <div className="sell-card">
                <h1>Vendre un article</h1>
                
                {status.message && (
                    <div style={{
                        padding: '15px', 
                        borderRadius: '12px', 
                        marginBottom: '20px', 
                        textAlign: 'center',
                        background: status.type === 'success' ? '#d4edda' : '#f8d7da',
                        color: status.type === 'success' ? '#155724' : '#721c24',
                        border: `1px solid ${status.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
                    }}>
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-section">
                        <label>Titre de l'annonce</label>
                        <input type="text" required value={formData.titre} onChange={e => setFormData({...formData, titre: e.target.value})} placeholder="Ex: Veste en jean" />
                    </div>

                    <div className="form-section">
                        <label>Description</label>
                        <textarea rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Décrivez votre article..." />
                    </div>

                    <div className="form-section">
                        <label>Catégorie</label>
                        <div style={{display: 'flex', gap: '10px'}}>
                            <select style={{flex: 1}} required value={selectedL1} onChange={e => handleL1Change(e.target.value)}>
                                <option value="">Univers...</option>
                                {level1.map(c => <option key={c.id_categorie} value={c.id_categorie}>{c.nom_categorie}</option>)}
                            </select>

                            {level2.length > 0 && (
                                <select style={{flex: 1}} required value={selectedL2} onChange={e => handleL2Change(e.target.value)}>
                                    <option value="">Type...</option>
                                    {level2.map(c => <option key={c.id_categorie} value={c.id_categorie}>{c.nom_categorie}</option>)}
                                </select>
                            )}

                            {level3.length > 0 && (
                                <select style={{flex: 1}} required value={formData.id_categorie} onChange={e => setFormData({...formData, id_categorie: e.target.value})}>
                                    <option value="">Article...</option>
                                    {level3.map(c => <option key={c.id_categorie} value={c.id_categorie}>{c.nom_categorie}</option>)}
                                </select>
                            )}
                        </div>
                    </div>

                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
                        <div className="form-section">
                            <label>{formData.type_vente === 'enchere' ? 'Prix de départ (€)' : 'Prix (€)'}</label>
                            <input type="number" required value={formData.prix} onChange={e => setFormData({...formData, prix: e.target.value})} />
                        </div>
                        <div className="form-section">
                            <label>Type de vente</label>
                            <select value={formData.type_vente} onChange={e => setFormData({...formData, type_vente: e.target.value})}>
                                <option value="achat_direct">Achat immédiat</option>
                                <option value="enchere">Enchère</option>
                            </select>
                        </div>
                    </div>

                    {formData.type_vente === 'enchere' && (
                        <div className="form-section">
                            <label>Date et heure de fin de l'enchère</label>
                            <input type="datetime-local" required value={formData.date_fin_enchere} onChange={e => setFormData({...formData, date_fin_enchere: e.target.value})} />
                        </div>
                    )}

                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
                        <div className="form-section">
                            <label>État</label>
                            <select value={formData.etat} onChange={e => setFormData({...formData, etat: e.target.value})}>
                                <option value="neuf">Neuf</option>
                                <option value="tres_bon">Très bon état</option>
                                <option value="bon">Bon état</option>
                                <option value="acceptable">Acceptable</option>
                            </select>
                        </div>
                        <div className="form-section">
                            <label>Marque</label>
                            <input type="text" value={formData.marque} onChange={e => setFormData({...formData, marque: e.target.value})} placeholder="Nike, Zara..." />
                        </div>
                    </div>

                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
                        <div className="form-section">
                            <label>Taille</label>
                            <input type="text" value={formData.taille} onChange={e => setFormData({...formData, taille: e.target.value})} placeholder="XS, 40, etc." />
                        </div>
                        <div className="form-section">
                            <label>Couleur</label>
                            <input type="text" value={formData.couleur} onChange={e => setFormData({...formData, couleur: e.target.value})} />
                        </div>
                    </div>

                    <div className="form-section">
                        <label>Lien de l'image (URL)</label>
                        <input type="text" required value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} placeholder="https://..." />
                    </div>

                    <button type="submit" className="btn-publish">Publier mon annonce</button>
                </form>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<VendrePage />);
