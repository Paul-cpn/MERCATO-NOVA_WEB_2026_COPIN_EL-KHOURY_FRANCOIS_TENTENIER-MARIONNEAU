const Header = window.Header;
const NavBar = window.NavBar;
const Footer = window.Footer;

function App() {
  return (
    <div>
      <Header />
      <NavBar />

      <main style={{ padding: '40px 20px', backgroundColor: '#fdfdfd', minHeight: '60vh' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', lineHeight: '1.8', color: '#444' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '40px', color: '#333' }}>Politique de Confidentialité</h1>
          
          <p>Chez <strong>Mercato Nova</strong>, nous accordons une importance primordiale à la protection de vos données personnelles.</p>

          <section style={{ marginBottom: '30px' }}>
            <h2>1. Collecte des données</h2>
            <p>Nous collectons les informations que vous nous fournissez lors de votre inscription : nom, prénom, adresse e-mail, adresse de livraison et pseudonyme.</p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2>2. Utilisation des données</h2>
            <p>Vos données sont utilisées pour :</p>
            <ul>
              <li>Gérer vos achats et vos ventes.</li>
              <li>Vous envoyer des notifications relatives à votre activité sur le site.</li>
              <li>Améliorer nos services.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2>3. Partage des données</h2>
            <p>Vos coordonnées de livraison sont partagées avec le vendeur uniquement lorsqu'une transaction est conclue, afin de permettre l'envoi du colis.</p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2>4. Vos droits</h2>
            <p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Vous pouvez exercer ces droits depuis les paramètres de votre compte ou en nous contactant.</p>
          </section>

          <div style={{ marginTop: '50px', fontSize: '12px', color: '#999', textAlign: 'center' }}>
            Dernière mise à jour : 26 Mai 2026
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
