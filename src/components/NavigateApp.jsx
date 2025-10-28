import React from 'react'
import { NavLink } from "react-router-dom";
import {  Container, Nav, Navbar } from "react-bootstrap";
import logo from '../assets/images/logo1.png';

export const NavigateApp = () => {
  return (
    <Navbar expand="lg" className="bg-body-tertiary">
              <Container fluid>
                <img src={logo} alt="Logo GZ Inmobiliaria" />
                <Navbar.Brand className='navBar-titulo'>GZ Inmobiliaria</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                  <Nav className="me-auto">
                    <NavLink to="/" end className="nav-link">Inicio</NavLink>
                    <a href="#ubicacion" className="nav-link">Ubicación</a>
                    <a href="#contacto" className="nav-link">Contacto</a>
                  </Nav>
                </Navbar.Collapse>
              </Container>
            </Navbar>
  )
}
