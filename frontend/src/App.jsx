import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Sobre from './pages/Sobre';
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
