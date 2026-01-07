import React from 'react'
import Footer from "../components/Footer"
import FormComponent from '../components/FormComponent';
import '../styles/Home.css'
import CardGroupExample from '../components/CardComponent'
import { deptos } from "../data/carousel";

export const Home = () => {

  const apart7 = deptos.find((depto) => depto.id === "7");

  return (
    <>
      <div className="home-container">

        {/* --- Encabezado --- */}
        <header className="home-header" id='inicio'>
          <h1 className="home-title">APART PLAZA</h1>
          <h2 className="home-subtitle">GZ Inmobiliaria de Graciela Zorzenón</h2>
          <h2 className="home-subtitle">Las Varillas, Córdoba</h2>
        </header>

        {/* --- Cards --- */}
        <section className="home-cards">
          <CardGroupExample />
        </section>

        {/* --- Mapa --- */}
        <section className="home-map" id='ubicacion'>
          <h3 className="map-title">Nuestra Ubicación</h3>
          <div className="map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3388.368198546669!2d-62.72230302456787!3d-31.86940357405607!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95cb646d4c2aeabb%3A0x15b6142c4e83d3c2!2sEspa%C3%B1a%2056%2C%20X5941%20Las%20Varillas%2C%20C%C3%B3rdoba!5e0!3m2!1ses!2sar!4v1767799113830!5m2!1ses!2sar"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </section>

        {/* Formulario de contacto */}
        <section className="home-contacto" id='contacto'>
          <h3 className="contacto-title">Contacto</h3>
          <FormComponent />
        </section>
      </div>

      {/* --- Footer --- */}
      <Footer />
    </>

  )
}
