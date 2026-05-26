const Header = window.Header;
const NavBar = window.NavBar;
const Footer = window.Footer;

function App() {
  return (
    <div>
      <Header />
      <NavBar />

      <main style={{ padding: '40px 20px', backgroundColor: '#fdfdfd', minHeight: '60vh' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', lineHeight: '1.6', color: '#444' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '40px', color: '#333' }}>Mentions Légales</h1>
          
          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--jaune)' }}>1. Édition du site</h2>
            <p>
              Le présent site, accessible à l’URL <strong>www.mercatonova.com</strong> (le « Site »), est édité par :
            </p>
            <p>
              <strong>Mercato Nova SAS</strong>, société au capital de 10 000 euros, inscrite au R.C.S. de Paris sous le numéro 123 456 789, dont le siège social est situé au 10 rue de la Mode, 75001 Paris.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--jaune)' }}>2. Responsable de publication</h2>
            <p>
              Le Directeur de la publication du Site est <strong>Le Responsable Mercato Nova</strong>.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--jaune)' }}>3. Hébergement</h2>
            <p>
              Le Site est hébergé par la société <strong>CloudNova Hosting</strong>, située au 42 avenue des Serveurs, 69000 Lyon (téléphone : +33 4 00 00 00 00).
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--jaune)' }}>4. Propriété intellectuelle</h2>
            <p>
              L’ensemble de ce site relève de la législation française et internationale sur le droit d’auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--jaune)' }}>5. Nous contacter</h2>
            <p>
              Par téléphone : +33 1 23 45 67 89<br />
              Par email : contact@mercatonova.com<br />
              Par courrier : 10 rue de la Mode, 75001 Paris
            </p>
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
