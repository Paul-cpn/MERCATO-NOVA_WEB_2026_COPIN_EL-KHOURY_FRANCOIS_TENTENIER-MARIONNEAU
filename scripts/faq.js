const { useState } = React;

const Header = window.Header;
const NavBar = window.NavBar;
const Footer = window.Footer;

function FaqItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`faq-item ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)} style={{
      background: '#fff',
      borderRadius: '12px',
      marginBottom: '15px',
      padding: '20px',
      cursor: 'pointer',
      boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
      transition: 'all 0.3s ease',
      border: '1px solid #eee'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>{question}</h3>
        <span style={{ 
          fontSize: '20px', 
          transform: isOpen ? 'rotate(45deg)' : 'rotate(0)',
          transition: 'transform 0.3s ease',
          color: 'var(--jaune)'
        }}>+</span>
      </div>
      {isOpen && (
        <div style={{ marginTop: '15px', color: '#666', lineHeight: '1.6', fontSize: '14px' }}>
          {answer}
        </div>
      )}
    </div>
  );
}

function App() {
  const faqData = [
    {
      category: "Qui sommes-nous ?",
      type: "about",
      content: (
        <div style={{ textAlign: 'center', background: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
          <img src="../images/Nous.png" alt="Notre équipe" style={{ width: '100%', maxWidth: '600px', borderRadius: '10px', marginBottom: '20px' }} />
          <p style={{ color: '#666', lineHeight: '1.6', fontSize: '16px' }}>
            Mercato Nova est née de la passion de quatre étudiants pour la mode durable et l'économie circulaire. 
            Notre mission est de donner une seconde vie à vos vêtements tout en créant une expérience d'achat et de vente unique grâce à notre système d'enchères innovant.
          </p>
        </div>
      )
    },
    {
      category: "Acheter",
      questions: [
        {
          question: "Comment puis-je acheter un article ?",
          answer: "Vous pouvez acheter un article de deux façons : via 'Achat Immédiat' au prix fixé par le vendeur, ou en participant à une enchère si l'option est disponible."
        },
        {
          question: "Quels sont les frais de port ?",
          answer: "Les frais de port sont calculés en fonction du transporteur choisi (Mondial Relay, Colissimo, Chronopost) et sont à la charge de l'acheteur."
        },
        {
          question: "Que se passe-t-il si l'article ne me convient pas ?",
          answer: "Vous bénéficiez de la Protection de l'acheteur. Si l'article n'est pas conforme à la description, vous pouvez signaler un litige sous 48h après réception."
        }
      ]
    },
    {
      category: "Vendre",
      questions: [
        {
          question: "Est-ce gratuit de vendre sur Mercato Nova ?",
          answer: "Oui, la mise en vente d'articles est entièrement gratuite pour les particuliers. Nous ne prenons pas de commission sur vos ventes."
        },
        {
          question: "Comment suis-je payé ?",
          answer: "Une fois que l'acheteur a validé la réception de son colis, l'argent est transféré vers votre porte-monnaie Mercato Nova. Vous pouvez ensuite le virer vers votre compte bancaire."
        },
        {
          question: "Comment envoyer mon colis ?",
          answer: "Dès que la vente est conclue, vous recevez un bordereau d'envoi prépayé par email. Imprimez-le, collez-le sur votre colis et déposez-le dans le point de collecte correspondant."
        }
      ]
    },
    {
      category: "Enchères",
      questions: [
        {
          question: "Comment fonctionnent les enchères ?",
          answer: "Un vendeur peut décider de mettre son article aux enchères. Vous pouvez placer une mise supérieure à l'offre actuelle. À la fin du temps imparti, le meilleur enchérisseur remporte l'article."
        },
        {
          question: "Puis-je annuler une enchère ?",
          answer: "Non, toute enchère placée est un engagement d'achat si vous remportez la vente. Réfléchissez bien avant de miser !"
        }
      ]
    }
  ];

  return (
    <div>
      <Header />
      <NavBar />

      <main style={{ padding: '40px 20px', backgroundColor: '#fdfdfd', minHeight: '60vh' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '32px' }}>Foire Aux Questions</h1>
          <p style={{ textAlign: 'center', color: '#888', marginBottom: '50px' }}>
            Tout ce que vous devez savoir pour utiliser Mercato Nova sereinement.
          </p>

          {faqData.map((cat, idx) => (
            <div key={idx} style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '20px', marginBottom: '20px', borderLeft: '4px solid var(--jaune)', paddingLeft: '15px' }}>{cat.category}</h2>
              {cat.type === 'about' ? (
                cat.content
              ) : (
                cat.questions.map((item, qIdx) => (
                  <FaqItem key={qIdx} question={item.question} answer={item.answer} />
                ))
              )}
            </div>
          ))}

          <div style={{ 
            marginTop: '60px', 
            padding: '30px', 
            background: 'var(--jaune)', 
            borderRadius: '15px', 
            textAlign: 'center',
            color: '#fff'
          }}>
            <h3>Vous n'avez pas trouvé votre réponse ?</h3>
            <p>Notre équipe support est là pour vous aider.</p>
            <a href="contact.html" style={{
              display: 'inline-block',
              marginTop: '15px',
              padding: '12px 25px',
              backgroundColor: '#fff',
              color: 'var(--jaune)',
              borderRadius: '25px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}>Contactez-nous</a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
