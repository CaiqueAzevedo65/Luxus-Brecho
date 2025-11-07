import React, { useState } from 'react';
import { FiHelpCircle, FiMessageCircle, FiMail, FiPhone, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import './index.css';

const Suporte = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      question: 'Como faço para comprar?',
      answer: 'Navegue pela nossa loja, escolha os produtos desejados e adicione ao carrinho. Depois é só finalizar a compra informando seus dados e forma de pagamento.'
    },
    {
      question: 'Quais formas de pagamento vocês aceitam?',
      answer: 'Aceitamos Visa, Mastercard, PayPal e Google Pay. Todas as transações são seguras e criptografadas.'
    },
    {
      question: 'Qual o prazo de entrega?',
      answer: 'O prazo de entrega varia de acordo com sua localização. Geralmente leva de 5 a 15 dias úteis. Você receberá um código de rastreamento assim que o pedido for enviado.'
    },
    {
      question: 'Posso trocar ou devolver um produto?',
      answer: 'Sim! Você tem até 7 dias após o recebimento para solicitar troca ou devolução, desde que o produto esteja em perfeitas condições.'
    },
    {
      question: 'Como funciona o frete grátis?',
      answer: 'Oferecemos frete grátis para compras acima de R$ 150,00. Para valores abaixo, o frete é calculado de acordo com sua região.'
    },
    {
      question: 'Os produtos são novos ou usados?',
      answer: 'Somos um brechó, então nossos produtos são de segunda mão, mas todos passam por rigorosa seleção e são cuidadosamente higienizados e revisados antes de serem listados.'
    }
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="suporte-page">
      {/* Hero Section */}
      <section className="suporte-hero">
        <FiHelpCircle className="hero-icon" />
        <h1>Central de Suporte</h1>
        <p>Estamos aqui para ajudar! Encontre respostas rápidas ou entre em contato conosco.</p>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <h2>Perguntas Frequentes</h2>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className={`faq-item ${openFaq === index ? 'open' : ''}`}>
              <button 
                className="faq-question"
                onClick={() => toggleFaq(index)}
              >
                <span>{faq.question}</span>
                {openFaq === index ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Options */}
      <section className="contact-options">
        <h2>Outras Formas de Contato</h2>
        <div className="options-grid">
          <div className="contact-option-card">
            <FiMessageCircle className="option-icon" />
            <h3>Chat Online</h3>
            <p>Fale conosco em tempo real</p>
            <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="option-button">
              Iniciar Chat
            </a>
          </div>
          
          <div className="contact-option-card">
            <FiMail className="option-icon" />
            <h3>E-mail</h3>
            <p>Resposta em até 24 horas</p>
            <a href="mailto:suporte@luxusbrecho.com" className="option-button">
              Enviar E-mail
            </a>
          </div>
          
          <div className="contact-option-card">
            <FiPhone className="option-icon" />
            <h3>Telefone</h3>
            <p>Seg-Sex, 9h às 18h</p>
            <a href="tel:+5519982251266" className="option-button">
              (19) 98225-1266
            </a>
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="additional-help">
        <h2>Não encontrou o que procurava?</h2>
        <p>Entre em contato conosco através da nossa página de contato.</p>
        <a href="/contato" className="cta-button">Ir para Contato</a>
      </section>
    </div>
  );
};

export default Suporte;
