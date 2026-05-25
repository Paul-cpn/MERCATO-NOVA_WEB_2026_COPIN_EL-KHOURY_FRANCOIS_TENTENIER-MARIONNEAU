const { useState } = React;

function App() {
  const user = JSON.parse(localStorage.getItem('user'));

  const handleBecomeSeller = (e) => {
    e.preventDefault();
    if (!user) {
        window.dispatchEvent(new CustomEvent('openAuthModal'));
        return;
    }

    if (user.role_user === 'vendeur' || user.role_user === 'admin') {
        alert("Vous êtes déjà autorisé à vendre !");
        return;
    }

    fetch('../scripts/upgrade_to_seller.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_user: user.id_user })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("Félicitations ! Vous êtes maintenant vendeur.");
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.reload();
        } else {
            alert("Erreur : " + data.error);
        }
    });
  };

  return (
    <div>
      <Header />
      <NavBar />

      <main>
        {/* ─── HERO SECTION ─── */}
        <section className="about-hero">
          <h1>Tu ne le portes plus ? Vends-le !</h1>
          <p>
            Découvrez notre plateforme communautaire qui donne une seconde vie à vos objets. 
            Ensemble, changeons notre façon de consommer au quotidien de manière plus responsable et économique.
          </p>
        </section>

        <div className="about-container">
          
          {/* ─── VALEURS GRID ─── */}
          <div className="about-grid">
            <div className="about-card">
              <div className="icon-box" style={{ backgroundColor: 'var(--jaune)' }}>🏷️</div>
              <h3>Vendez simplement</h3>
              <p>Prenez vos articles en photo, ajoutez une description et fixez votre prix. C'est entièrement gratuit et cela ne prend que quelques minutes.</p>
            </div>
            
            <div className="about-card">
              <div className="icon-box" style={{ backgroundColor: 'var(--bleu)' }}>📦</div>
              <h3>Envoi sécurisé</h3>
              <p>Imprimez votre bordereau d'envoi prépayé. Grâce à nos partenaires de livraison, expédiez vos colis l'esprit tranquille et suivez-les en temps réel.</p>
            </div>
            
            <div className="about-card">
              <div className="icon-box" style={{ backgroundColor: 'var(--rose)' }}>🛡️</div>
              <h3>Achat protégé</h3>
              <p>Notre système de paiement bloque l'argent en toute sécurité. Le vendeur n'est payé que lorsque vous validez la bonne réception de votre commande.</p>
            </div>
          </div>

          {/* ─── SECTION MISSION ─── */}
          <div className="about-section-inline">
            <div className="about-inline-content">
              <h2>Notre Mission</h2>
              <p>Nous pensons que le beau ne devrait pas rimer avec le neuf. En facilitant l'échange, l'achat en direct ou via notre système unique d'enchères, nous permettons à des milliers d'utilisateurs de vider leurs placards tout en gagnant de l'argent.</p>
              <p>Faites de la place pour ce qui compte vraiment aujourd'hui, et laissez quelqu'un d'autre profiter de ce que vous avez adoré hier.</p>
            </div>
            <div className="about-inline-img">
              [ Illustration Seconde Main ]
            </div>
          </div>

          {/* ─── SECTION DEUX FAÇONS D'ACHETER (REVERSED) ─── */}
          <div className="about-section-inline" style={{ flexDirection: 'row-reverse' }}>
            <div className="about-inline-content">
              <h2>Deux façons d'acheter</h2>
              <p>Parce que chaque expérience est unique, notre plateforme vous propose d'acheter immédiatement vos coups de cœur au prix affiché, ou de participer à des <strong>enchères excitantes</strong> pour dénicher la perle rare au meilleur prix.</p>
              <p>Négociez directement avec les vendeurs et faites partie d'une communauté active et passionnée.</p>
            </div>
            <div className="about-inline-img">
              [ Aperçu des Fonctionnalités ]
            </div>
          </div>

          {/* ─── CALL TO ACTION ─── */}
          <div className="cta-box">
            <h2>Prêt à faire de la place dans vos placards ?</h2>
            <p>Rejoignez notre communauté dès aujourd'hui et commencez à vendre ou à chiner de façon plus responsable.</p>
            <a href="#" className="cta-btn" onClick={handleBecomeSeller}>Commencer à vendre</a>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
