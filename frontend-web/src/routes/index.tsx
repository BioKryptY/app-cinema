import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
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

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/filmes" element={<Filmes />} />
      <Route path="/filmes/novo" element={<FilmeForm />} />
      <Route path="/filmes/editar/:id" element={<FilmeForm />} />
      <Route path="/salas" element={<Salas />} />
      <Route path="/salas/nova" element={<SalaForm />} />
      <Route path="/salas/editar/:id" element={<SalaForm />} />
      <Route path="/sessoes" element={<Sessoes />} />
      <Route path="/sessoes/nova" element={<SessaoForm />} />
      <Route path="/sessoes/editar/:id" element={<SessaoForm />} />
      <Route path="/lanches-combos" element={<LanchesCombos />} />
      <Route path="/lanches-combos/novo" element={<LancheComboForm />} />
      <Route path="/lanches-combos/editar/:id" element={<LancheComboForm />} />
      <Route path="/ingressos" element={<Ingressos />} />
      <Route path="/pedidos" element={<Pedidos />} />
    </Routes>
  );
}

export default AppRoutes;
