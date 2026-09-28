import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { estaLogado } from '../services/auth';

// Porteiro das telas que pedem login: sem token, manda para /login
export default function RotaProtegida({ children }: { children: ReactNode }) {
  if (!estaLogado()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
