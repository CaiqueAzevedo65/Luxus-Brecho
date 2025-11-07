import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Sobre from './pages/Sobre';
import Produtos from './pages/Produtos';
import Categorias from './pages/Categorias';
import Suporte from './pages/Suporte';
import Contato from './pages/Contato';
import Carrinho from './pages/Carrinho';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Perfil from './pages/Perfil';
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
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Rotas principais com layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="sobre" element={<Sobre />} />
          <Route path="produtos" element={<Produtos />} />
          <Route path="categorias" element={<Categorias />} />
          <Route path="suporte" element={<Suporte />} />
          <Route path="contato" element={<Contato />} />
          <Route path="carrinho" element={<Carrinho />} />
          <Route path="login" element={<Login />} />
          <Route path="registro" element={<Registro />} />
          <Route path="perfil" element={<Perfil />} />

          {/* Rotas admin */}
          <Route path="admin/products" element={<ProductsList />} />
          <Route path="admin/products/new" element={<ProductFormNew />} />
          <Route path="admin/products/edit/:id" element={<ProductFormNew />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
