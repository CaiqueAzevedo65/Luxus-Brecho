import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { ToastProvider } from './contexts/ToastContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Sobre from './pages/Sobre';
import Produtos from './pages/Produtos';
import ProdutoDetalhes from './pages/ProdutoDetalhes';
import Categorias from './pages/Categorias';
import Suporte from './pages/Suporte';
import Contato from './pages/Contato';
import Carrinho from './pages/Carrinho';
import Login from './pages/Login';
import Registro from './pages/Registro';
import RegistroAdmin from './pages/RegistroAdmin';
import EsqueciSenha from './pages/EsqueciSenha';
import RedefinirSenha from './pages/RedefinirSenha';
import Perfil from './pages/Perfil';
import Configuracoes from './pages/Configuracoes';
import ConfigEndereco from './pages/ConfigEndereco';
import ConfigSenha from './pages/ConfigSenha';
import ConfigEmail from './pages/ConfigEmail';
import ProductsList from './pages/Admin/ProductsList';
import ProductFormNew from './pages/Admin/ProductFormNew';

// Componente para scroll to top ao navegar
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
}

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  // Inicializar autenticação ao carregar a aplicação
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Router>
      <ToastProvider>
        <ScrollToTop />
        <Routes>
        {/* Rotas principais com layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="sobre" element={<Sobre />} />
          <Route path="produtos" element={<Produtos />} />
          <Route path="produto/:id" element={<ProdutoDetalhes />} />
          <Route path="categorias" element={<Categorias />} />
          <Route path="suporte" element={<Suporte />} />
          <Route path="contato" element={<Contato />} />
          <Route path="carrinho" element={<Carrinho />} />
          <Route path="login" element={<Login />} />
          <Route path="registro" element={<Registro />} />
          <Route path="esqueci-senha" element={<EsqueciSenha />} />
          <Route path="redefinir-senha/:token" element={<RedefinirSenha />} />
          <Route path="perfil" element={<Perfil />} />
          
          {/* Rotas de configurações */}
          <Route path="configuracoes" element={<Configuracoes />} />
          <Route path="configuracoes/endereco" element={<ConfigEndereco />} />
          <Route path="configuracoes/senha" element={<ConfigSenha />} />
          <Route path="configuracoes/email" element={<ConfigEmail />} />

          {/* Rotas admin */}
          <Route path="admin/registro" element={<RegistroAdmin />} />
          <Route path="admin/products" element={<ProductsList />} />
          <Route path="admin/products/new" element={<ProductFormNew />} />
          <Route path="admin/products/edit/:id" element={<ProductFormNew />} />
        </Route>
      </Routes>
      </ToastProvider>
    </Router>
  );
}

export default App;
