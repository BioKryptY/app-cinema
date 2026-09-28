import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Filmes from '../pages/Filmes';
import FilmeForm from '../pages/FilmeForm';
import Salas from '../pages/Salas';
import SalaForm from '../pages/SalaForm';
import Sessoes from '../pages/Sessoes';
import SessaoForm from '../pages/SessaoForm';
import Ingressos from '../pages/Ingressos';
import LanchesCombos from '../pages/LanchesCombos';
import LancheComboForm from '../pages/LancheComboForm';
import Pedidos from '../pages/Pedidos';
import RotaProtegida from '../components/RotaProtegida';

function AppRoutes() {
  return (
    <Routes>
      {/* Abertas: qualquer pessoa vê */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/filmes" element={<Filmes />} />
      <Route path="/salas" element={<Salas />} />
      <Route path="/sessoes" element={<Sessoes />} />
      <Route path="/lanches-combos" element={<LanchesCombos />} />

      {/* Só com login */}
      <Route path="/filmes/novo" element={<RotaProtegida><FilmeForm /></RotaProtegida>} />
      <Route path="/filmes/editar/:id" element={<RotaProtegida><FilmeForm /></RotaProtegida>} />
      <Route path="/salas/nova" element={<RotaProtegida><SalaForm /></RotaProtegida>} />
      <Route path="/salas/editar/:id" element={<RotaProtegida><SalaForm /></RotaProtegida>} />
      <Route path="/sessoes/nova" element={<RotaProtegida><SessaoForm /></RotaProtegida>} />
      <Route path="/sessoes/editar/:id" element={<RotaProtegida><SessaoForm /></RotaProtegida>} />
      <Route path="/lanches-combos/novo" element={<RotaProtegida><LancheComboForm /></RotaProtegida>} />
      <Route path="/lanches-combos/editar/:id" element={<RotaProtegida><LancheComboForm /></RotaProtegida>} />
      <Route path="/ingressos" element={<RotaProtegida><Ingressos /></RotaProtegida>} />
      <Route path="/pedidos" element={<RotaProtegida><Pedidos /></RotaProtegida>} />
    </Routes>
  );
}

export default AppRoutes;
