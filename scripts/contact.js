const Header = window.Header;
const NavBar = window.NavBar;
const Footer = window.Footer;

function App() {
  const [sent, setSent] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div>
      <Header />
      <NavBar />

      <main style={{ padding: '40px 20px', backgroundColor: '#fdfdfd', minHeight: '60vh' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Contactez-nous</h1>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '40px' }}>
            Une question ? Une suggestion ? Notre équipe vous répond sous 24h.
          </p>

          {sent ? (
            <div style={{ padding: '40px', textAlign: 'center', background: '#d4edda', color: '#155724', borderRadius: '15px' }}>
              <h2>Merci !</h2>
              <p>Votre message a bien été envoyé. Nous reviendrons vers vous très vite.</p>
              <a href="index.html" style={{ display: 'inline-block', marginTop: '20px', color: 'var(--jaune)', fontWeight: 'bold' }}>Retour à l'accueil</a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Sujet</label>
                <select required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}>
                  <option value="">Choisissez un sujet...</option>
                  <option value="achat">Problème avec un achat</option>
                  <option value="vente">Question sur une vente</option>
                  <option value="compte">Mon compte</option>
                  <option value="autre">Autre demande</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Message</label>
                <textarea required rows="6" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', resize: 'vertical' }} placeholder="Décrivez votre demande en détail..."></textarea>
              </div>
              <button type="submit" style={{ padding: '15px', background: 'var(--jaune)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Envoyer mon message</button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
