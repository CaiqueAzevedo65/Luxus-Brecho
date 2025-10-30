import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import ProductForm from './pages/Admin/ProductForm';

function App() {
  return (
    <Router>
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
          <Route path="admin/products/new" element={<ProductForm />} />
          <Route path="admin/products/edit/:id" element={<ProductForm />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
