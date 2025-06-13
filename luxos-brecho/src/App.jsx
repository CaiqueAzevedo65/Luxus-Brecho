import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          {/* Adicione mais rotas aqui conforme necessário */}
          {/* Exemplo: <Route path="sobre" element={<Sobre />} /> */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
