import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Container, Nav, Navbar, Button } from 'react-bootstrap'; 
import logo from '../assets/images/logo1.png';
import { useAuth } from '../context/AuthContext';

export const NavigateApp = () => {
  const { session, signOut } = useAuth(); 
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <Navbar expand="lg" variant='dark'>
      <Container fluid>
        <img src={logo} alt="Logo GZ Inmobiliaria" className="navbar-logo" />
        <Navbar.Brand className="navBar-titulo">GZ Inmobiliaria</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <NavLink to="/" end className="nav-link">
              Inicio
            </NavLink>
            <a href="#ubicacion" className="nav-link">
              Ubicación
            </a>
            <a href="#contacto" className="nav-link">
              Contacto
            </a>
          </Nav>
          <Nav>
            {session ? (
              // Si está logueado
              <>
                <NavLink to="/admin" className="nav-link">
                  Panel
                </NavLink>
                <Button
                  onClick={handleLogout}
                  variant="outline-light"
                  size="sm"
                  className="ms-2"
                >
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              // Si NO está logueado
              <NavLink to="/login" className="nav-link">
                Iniciar Sesión
              </NavLink>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};