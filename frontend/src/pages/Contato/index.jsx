import React, { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiInstagram, FiSend } from 'react-icons/fi';
import './index.css';

const Contato = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    assunto: '',
    mensagem: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulação de envio
    setTimeout(() => {
      setSubmitMessage('Mensagem enviada com sucesso! Entraremos em contato em breve.');
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        assunto: '',
        mensagem: ''
      });
      setIsSubmitting(false);
      
      setTimeout(() => {
        setSubmitMessage('');
      }, 5000);
    }, 1500);
  };

  return (
    <div className="contato-page">
      {/* Hero Section */}
      <section className="contato-hero">
        <h1>Entre em Contato</h1>
        <p>Adoraríamos ouvir você! Envie sua mensagem e responderemos o mais breve possível.</p>
      </section>

      <div className="contato-content">
        {/* Contact Form */}
        <section className="contact-form-section">
          <h2>Envie sua Mensagem</h2>
          
          {submitMessage && (
            <div className="success-message">
              <FiSend />
              <p>{submitMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nome">Nome Completo *</label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  placeholder="Seu nome"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">E-mail *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="telefone">Telefone</label>
                <input
                  type="tel"
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="assunto">Assunto *</label>
                <select
                  id="assunto"
                  name="assunto"
                  value={formData.assunto}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione um assunto</option>
                  <option value="duvida">Dúvida sobre produto</option>
                  <option value="pedido">Status do pedido</option>
                  <option value="troca">Troca ou devolução</option>
                  <option value="sugestao">Sugestão</option>
                  <option value="reclamacao">Reclamação</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="mensagem">Mensagem *</label>
              <textarea
                id="mensagem"
                name="mensagem"
                value={formData.mensagem}
                onChange={handleChange}
                required
                rows="6"
                placeholder="Escreva sua mensagem aqui..."
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner-small"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <FiSend />
                  Enviar Mensagem
                </>
              )}
            </button>
          </form>
        </section>

        {/* Contact Info */}
        <aside className="contact-info-section">
          <h2>Informações de Contato</h2>
          
          <div className="info-cards">
            <div className="info-card">
              <FiMail className="info-icon" />
              <h3>E-mail</h3>
              <p>contato@luxusbrecho.com</p>
              <a href="mailto:contato@luxusbrecho.com">Enviar e-mail</a>
            </div>

            <div className="info-card">
              <FiPhone className="info-icon" />
              <h3>Telefone</h3>
              <p>(11) 99999-9999</p>
              <a href="tel:+5511999999999">Ligar agora</a>
            </div>

            <div className="info-card">
              <FiMapPin className="info-icon" />
              <h3>Endereço</h3>
              <p>São Paulo, SP<br />Brasil</p>
            </div>

            <div className="info-card">
              <FiInstagram className="info-icon" />
              <h3>Instagram</h3>
              <p>@luxus.brecho_</p>
              <a href="https://www.instagram.com/luxus.brecho_/" target="_blank" rel="noopener noreferrer">
                Seguir no Instagram
              </a>
            </div>
          </div>

          <div className="business-hours">
            <h3>Horário de Atendimento</h3>
            <ul>
              <li><strong>Segunda a Sexta:</strong> 9h às 18h</li>
              <li><strong>Sábado:</strong> 9h às 14h</li>
              <li><strong>Domingo:</strong> Fechado</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Contato;
