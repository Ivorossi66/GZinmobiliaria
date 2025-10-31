import React from "react";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import "../styles/Footer.css";
import logo from '../assets/images/logo1.png';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Logo */}
        <div className="footer-logo">
          <img src={logo} alt="GZ Inmobiliaria" />
        </div>

        {/* Redes */}
        <div className="footer-redes">
          <h4>Nuestras redes:</h4>
          <div className="footer-icons">
            <a href="https://www.instagram.com/g.z_inmobiliaria" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
            <a href="https://wa.me/3533407785" target="_blank" rel="noopener noreferrer">
              <FaWhatsapp />
            </a>
          </div>
        </div>

        {/* Dirección */}
        <p className="footer-direccion">
          España 56 - Las Varillas, Córdoba, Argentina
        </p>

        {/* Horarios de atención */}
        <p className="footer-horarios">
          <b>Horarios de atención:</b> Lunes a Viernes de 8:00 a 12:00 y de 16:00 a 20:00
        </p>

        {/* Derechos */}
        <p className="footer-derechos">
          © {new Date().getFullYear()} GZ Inmobiliaria — Desarrollado por{" "}
          <a href="https://www.linkedin.com/in/ivorossi" target="_blank" rel="noopener noreferrer">
            Ivo Rossi
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
