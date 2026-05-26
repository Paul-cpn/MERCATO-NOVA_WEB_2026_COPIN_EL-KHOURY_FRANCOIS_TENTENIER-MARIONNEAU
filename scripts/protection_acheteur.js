const Header = window.Header;
const NavBar = window.NavBar;
const Footer = window.Footer;

function App() {
  return (
    <div>
      <Header />
      <NavBar />

      <main style={{ padding: '40px 20px', backgroundColor: '#fdfdfd', minHeight: '60vh' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>Protection de l'Acheteur</h1>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
            <div style={{ padding: '25px', background: '#fff', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
              <h3 style={{ color: 'var(--jaune)', marginBottom: '15px' }}>🔒 Paiements Sécurisés</h3>
              <p>Votre argent est conservé en toute sécurité par notre partenaire bancaire. Il n'est versé au vendeur que lorsque vous confirmez la réception de votre article.</p>
            </div>
            <div style={{ padding: '25px', background: '#fff', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
              <h3 style={{ color: 'var(--jaune)', marginBottom: '15px' }}>📦 Remboursement Garanti</h3>
              <p>Si l'article n'arrive jamais, s'il est endommagé ou s'il ne correspond pas du tout à la description, vous êtes remboursé intégralement.</p>
            </div>
          </div>

          <section style={{ marginBottom: '30px' }}>
            <h2>Comment ça fonctionne ?</h2>
            <ol>
              <li><strong>Vous achetez :</strong> Vous payez via notre plateforme sécurisée.</li>
              <li><strong>Le vendeur expédie :</strong> Le vendeur dispose de 5 jours pour envoyer le colis.</li>
              <li><strong>Vous recevez :</strong> Une fois le colis reçu, vous avez 48h pour valider ou signaler un problème.</li>
              <li><strong>Le vendeur est payé :</strong> Si tout est ok, nous libérons les fonds.</li>
            </ol>
          </section>

          <section style={{ padding: '30px', background: '#f8f9fa', borderRadius: '15px' }}>
            <h3 style={{ marginTop: 0 }}>Besoin d'aide avec une commande ?</h3>
            <p>Notre service client est disponible pour arbitrer tout litige entre un acheteur et un vendeur.</p>
            <a href="contact.html" style={{ color: 'var(--jaune)', fontWeight: 'bold' }}>Contacter le support</a>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
