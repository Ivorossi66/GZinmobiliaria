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
          <div className="map-container" dangerouslySetInnerHTML={{ __html: apart7.ubicacion }}></div>
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
