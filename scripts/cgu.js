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
          <h1 style={{ textAlign: 'center', marginBottom: '40px', color: '#333' }}>Conditions Générales d'Utilisation</h1>
          
          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--jaune)' }}>1. Présentation du site</h2>
            <p>
              Le site <strong>Mercato Nova</strong> est une plateforme de mise en relation entre vendeurs et acheteurs d'articles de seconde main. 
              Il permet la vente directe, la négociation et la mise aux enchères d'articles.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--jaune)' }}>2. Inscription et Compte</h2>
            <p>
              Pour utiliser les fonctionnalités de vente et d'achat, l'utilisateur doit créer un compte. 
              L'utilisateur s'engage à fournir des informations exactes et à maintenir la confidentialité de ses identifiants.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--jaune)' }}>3. Engagements de l'utilisateur</h2>
            <p>
              L'utilisateur s'engage à ne pas mettre en vente d'articles illicites, contrefaits ou dangereux. 
              Toute tentative de fraude ou d'utilisation abusive de la plateforme pourra entraîner la suspension du compte.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--jaune)' }}>4. Système d'enchères</h2>
            <p>
              Les enchères sur Mercato Nova sont contractuelles. En plaçant une enchère, l'utilisateur s'engage à acheter l'article au prix proposé si son offre est la plus élevée à la clôture de l'enchère.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--jaune)' }}>5. Paiements et Sécurité</h2>
            <p>
              Les paiements sont sécurisés via notre partenaire bancaire. L'argent est conservé sur un compte séquestre jusqu'à la confirmation de réception de l'article par l'acheteur.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--jaune)' }}>6. Protection des données</h2>
            <p>
              Conformément au RGPD, Mercato Nova s'engage à protéger les données personnelles de ses utilisateurs. Pour plus d'informations, consultez notre Politique de Confidentialité.
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
