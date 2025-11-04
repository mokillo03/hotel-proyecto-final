import React from 'react';
import { Routes, Route } from 'react-router-dom';
// Páginas de Autenticación
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
// Páginas Públicas y Dashboards (Stubs)
import HomePage from './pages/Public/HomePage'; 
import AdminDashboard from './pages/Dashboards/AdminDashboard';
import OperatorDashboard from './pages/Dashboards/OperatorDashboard';
// Componente de protección
import ProtectedRoute from './components/ProtectedRoute'; 

// Componente simple de No Encontrado (404)
const NotFound = () => <h1>404 | Página no encontrada</h1>;

const App = () => {
  return (
    <Routes>
      {/* RUTAS PÚBLICAS */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={ <RegisterPage />} />
      <Route path="/habitaciones" element={ <HomePage />} /> 

      {/* RUTAS PROTEGIDAS (ADMINISTRADOR) */}
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute requiredRole="Administrador">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* RUTAS PROTEGIDAS (OPERADOR) */}
      <Route 
        path="/operator/dashboard" 
        element={
          <ProtectedRoute requiredRole="Operador">
            <OperatorDashboard />
          </ProtectedRoute>
        } 
      />

      {/* RUTA CATCH-ALL (404) */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
