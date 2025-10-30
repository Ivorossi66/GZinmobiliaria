import { Routes, Route } from 'react-router-dom';
import './App.css';
import { Home } from './pages/Home';
import { Deptos } from './pages/Deptos';
import { ErrorPage } from './pages/ErrorPage';
import { NavigateApp } from './components/NavigateApp';
import { Login } from './pages/Login';
import { AdminPanel } from './pages/AdminPanel';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <>
      <NavigateApp />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/deptos/:id" element={<Deptos />} />
        <Route path="*" element={<ErrorPage />} />
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;