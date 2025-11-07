import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
  FiArrowLeft, 
  FiMapPin, 
  FiLock, 
  FiMail, 
  FiTrash2,
  FiChevronRight 
} from 'react-icons/fi';
import './index.css';

const Configuracoes = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  if (!user) {
    return null;
  }

  const menuItems = [
    {
      icon: <FiMapPin />,
      title: 'Endereço',
      description: 'Cadastrar ou editar endereço de entrega',
      path: '/configuracoes/endereco',
      iconColor: 'config-icon-blue'
    },
    {
      icon: <FiLock />,
      title: 'Alterar Senha',
      description: 'Modificar sua senha de acesso',
      path: '/configuracoes/senha',
      iconColor: 'config-icon-green'
    },
    {
      icon: <FiMail />,
      title: 'Alterar Email',
      description: 'Modificar seu email de cadastro',
      path: '/configuracoes/email',
      iconColor: 'config-icon-orange'
    },
    {
      icon: <FiTrash2 />,
      title: 'Excluir Conta',
      description: 'Remover permanentemente sua conta',
      path: '/configuracoes/excluir',
      iconColor: 'config-icon-red'
    }
  ];

  return (
    <div className="configuracoes-page">
      {/* Header */}
      <div className="configuracoes-header">
        <button onClick={() => navigate('/perfil')} className="back-button-config">
          <FiArrowLeft />
        </button>
        <h1>Configurações da Conta</h1>
        <div style={{ width: '40px' }}></div>
      </div>

      {/* Content */}
      <div className="configuracoes-content">
        <div className="config-info-card">
          <div className="config-user-info">
            <div className="config-user-avatar">
              {user.nome.charAt(0).toUpperCase()}
            </div>
            <div className="config-user-details">
              <h2>{user.nome}</h2>
              <p>{user.email}</p>
            </div>
          </div>
        </div>

        <div className="config-menu">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className="config-menu-item"
              onClick={() => navigate(item.path)}
            >
              <div className={`config-item-icon ${item.iconColor}`}>
                {item.icon}
              </div>
              <div className="config-item-content">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
              <FiChevronRight className="config-chevron" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;
