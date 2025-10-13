import { useParams } from "react-router-dom";
import { deptos } from "../data/carousel";
import Footer from "../components/Footer"
import CarouselComponent from '../components/CarouselComponent';
import "../components/NavigateApp"
import "../styles/Deptos.css";
import "../styles/Home.css";
import { IoPersonSharp } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa"

export const Deptos = () => {
  const { id } = useParams();
  const depto = deptos.find((d) => d.id === id);

  if (!depto) return <h2>Departamento no encontrado</h2>;

  return (
    <>

      <div className="depto-container">
        <h1>{depto.nombre}</h1>

        {/* Slider */}
        <CarouselComponent imagenes={depto.imagenes} titulo={depto.nombre} />

        {/* Precio */}
        <div className="depto-precio">
          <h3>Precios</h3>
          <div className="precios">
            {depto.precio.map((p, i) => (
              <div key={i} className="precio-item">
                {Array.from({ length: p.personas }).map((_, j) => (
                  <IoPersonSharp key={j} />
                ))}
                <span>${p.precio.toLocaleString("es-AR")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Descripción */}
        <div className="depto-info">
          <h3>Descripción</h3>
          <p>{depto.descripcion}</p>

          {depto.servicios.length > 0 && (
            <>
              <h3>Servicios</h3>
              <ul className="servicios-lista">
                {depto.servicios.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </>
          )}

          <h3>Seña</h3>
          <p>{depto.senia}</p>

          {depto.descuento && (
            <>
              <h3>Descuento</h3>
              <p>{depto.descuento}</p>
            </>
          )}

          <h3>Horario</h3>
          <p>{depto.horario}</p>

          <h3>Dirección</h3>
          <p>{depto.direccion}</p>

          <h3>Mapa</h3>
          <div className="map-container" id='ubicacion'>
            <div
              className="map-container"
              dangerouslySetInnerHTML={{ __html: depto.ubicacion }}
            />
          </div>

          {/* Botón WhatsApp */}
          <a
            href={`https://wa.me/3533407785?text=${encodeURIComponent(
              `Hola, me gustaría reservar el ${depto.nombre}.¿Qué disponibilidad tenés? Muchas gracias.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-float"
          >
            <FaWhatsapp className="whatsapp-icon" />
            <span className="whatsapp-text">Solicitar información</span>
          </a>

        </div>
      </div>

      <Footer />
    </>
  );
};