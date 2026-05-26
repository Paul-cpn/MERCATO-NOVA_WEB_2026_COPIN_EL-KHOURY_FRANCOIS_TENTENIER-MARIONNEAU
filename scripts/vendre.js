const { useState, useEffect } = React;

// Récupération des composants globaux
const Header = window.Header;
const Footer = window.Footer;

function VendrePage() {
  let user = null;
  try {
    const savedUser = localStorage.getItem('user');
    user = savedUser ? JSON.parse(savedUser) : null;
  } catch (e) {
    console.error("Erreur parsing user:", e);
  }
  
  // États pour les catégories hiérarchiques
  const [categoryTree, setCategoryTree] = useState([]);
  const [level1, setLevel1] = useState([]); // Homme, Femme, Enfant
  const [level2, setLevel2] = useState([]); // Haut, Bas, Accessoire
  const [level3, setLevel3] = useState([]); // T-shirt, Jeans...

  const [selectedL1, setSelectedL1] = useState('');
  const [selectedL2, setSelectedL2] = useState('');

  const [formData, setFormData] = useState({
    titre: '', description: '', prix: '', etat: 'bon', type_vente: 'achat_direct',
    taille: '', couleur: '', marque: '', id_categorie: '', matiere: '',
    date_fin_enchere: ''
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);

    // Générer des prévisualisations
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

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

    if (selectedFiles.length === 0) {
        setStatus({ message: "Veuillez ajouter au moins une image.", type: 'error' });
        return;
    }
    
    // Utilisation de FormData pour l'envoi de fichiers
    const data = new FormData();
    data.append('id_user', user.id_user);
    data.append('titre', formData.titre);
    data.append('description', formData.description);
    data.append('prix', formData.prix);
    data.append('etat', formData.etat);
    data.append('type_vente', formData.type_vente);
    data.append('taille', formData.taille);
    data.append('couleur', formData.couleur);
    data.append('marque', formData.marque);
    data.append('matiere', formData.matiere);
    data.append('id_categorie', formData.id_categorie);
    data.append('date_fin_enchere', formData.date_fin_enchere);

    // Ajout des fichiers
    selectedFiles.forEach(file => {
        data.append('images[]', file);
    });

    fetch('../scripts/add_article.php', {
        method: 'POST',
        body: data // Pas de header Content-Type ici, le navigateur le mettra avec le boundary
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

  const constants = window.APP_CONSTANTS || { ETATS: [], MATIERES: [], COULEURS: [], TAILLES_VETEMENTS: [] };

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
                        <label>Images de l'article (Minimum 1)</label>
                        <input type="file" multiple accept="image/*" onChange={handleFileChange} style={{ marginBottom: '10px' }} />
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {previews.map((src, i) => (
                                <img key={i} src={src} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }} />
                            ))}
                        </div>
                    </div>

                    <div className="form-section">
                        <label>Titre de l'annonce</label>
                        <input type="text" required minLength="3" maxLength="50" value={formData.titre} onChange={e => setFormData({...formData, titre: e.target.value})} placeholder="Ex: Veste en jean" />
                    </div>

                    <div className="form-section">
                        <label>Description</label>
                        <textarea rows="4" required maxLength="300" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Décrivez votre article..." />
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
                            <input type="number" required min="1" step="0.01" value={formData.prix} onChange={e => setFormData({...formData, prix: e.target.value})} />
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
                            <input type="datetime-local" required min={new Date().toISOString().slice(0, 16)} value={formData.date_fin_enchere} onChange={e => setFormData({...formData, date_fin_enchere: e.target.value})} />
                        </div>
                    )}

                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
                        <div className="form-section">
                            <label>État</label>
                            <select value={formData.etat} required onChange={e => setFormData({...formData, etat: e.target.value})}>
                                <option value="">Choisir...</option>
                                {constants.ETATS.map(et => <option key={et.id} value={et.id}>{et.label}</option>)}
                            </select>
                        </div>
                        <div className="form-section">
                            <label>Marque</label>
                            <input type="text" required maxLength="50" value={formData.marque} onChange={e => setFormData({...formData, marque: e.target.value})} placeholder="Nike, Zara..." />
                        </div>
                    </div>

                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
                        <div className="form-section">
                            <label>Taille</label>
                            <select value={formData.taille} required onChange={e => setFormData({...formData, taille: e.target.value})}>
                                <option value="">Choisir...</option>
                                {(() => {
                                    const catL2 = level2.find(c => c.id_categorie == selectedL2)?.nom_categorie.toLowerCase() || '';
                                    if (catL2.includes('chaussure')) return constants.TAILLES_CHAUSSURES;
                                    if (catL2.includes('bas') || catL2.includes('pantalon')) return constants.TAILLES_BAS;
                                    return constants.TAILLES_VETEMENTS;
                                })().map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="form-section">
                            <label>Couleur</label>
                            <select value={formData.couleur} required onChange={e => setFormData({...formData, couleur: e.target.value})}>
                                <option value="">Choisir...</option>
                                {constants.COULEURS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="form-section">
                        <label>Matière</label>
                        <select value={formData.matiere} required onChange={e => setFormData({...formData, matiere: e.target.value})}>
                            <option value="">Choisir...</option>
                            {constants.MATIERES.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
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
