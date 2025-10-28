import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { deptos } from '../data/carousel';
import Footer from '../components/Footer';
import CarouselComponent from '../components/CarouselComponent';
import '../components/NavigateApp';
import '../styles/Deptos.css';
import '../styles/Home.css';
import { IoPersonSharp } from 'react-icons/io5';

// --- Imports para la reserva ---
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import  supabase  from '../supabaseClient'; // <-- Importación corregida y estandarizada

// --- Función Helper para formatear fechas ---
const formatFecha = (date) => {
  if (!date) return '';
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0'); // +1 porque Enero es 0
  const anio = date.getFullYear();
  return `${dia}-${mes}-${anio}`;
};

export const Deptos = () => {
  const { id } = useParams();
  const depto = deptos.find((d) => d.id === id);

  //Estados para la reserva
  const [diasOcupados, setDiasOcupados] = useState([]);
  const [rangoSeleccionado, setRangoSeleccionado] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [errorReserva, setErrorReserva] = useState('');
  const [exitoReserva, setExitoReserva] = useState('');

  //Estados para el formulario
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [cantidadPersonas, setCantidadPersonas] = useState(1);

  //Cargar las fechas ocupadas de Supabase
  useEffect(() => {
    async function getReservas() {
      if (!id) return;
      setLoading(true);

      const { data, error } = await supabase
        .from('reservas')
        .select('fecha_inicio, fecha_fin')
        .eq('id_apartamento', parseInt(id))
        .in('estado', ['Confirmada', 'Pendiente']);

      if (error) {
        console.error('Error al cargar reservas:', error);
        setErrorReserva('No se pudo cargar la disponibilidad.');
      } else {
        const rangosOcupados = data.map((reserva) => {
          const fromDate = new Date(reserva.fecha_inicio + 'T00:00:00Z');
          const toDate = new Date(reserva.fecha_fin + 'T00:00:00Z');
          toDate.setDate(toDate.getDate() - 1);
          return { from: fromDate, to: toDate };
        });
        setDiasOcupados(rangosOcupados);
      }
      setLoading(false);
    }

    getReservas();
  }, [id]);

  // Manejo de la reserva
  const handleReservar = async (e) => {
    e.preventDefault();
    setErrorReserva('');
    setExitoReserva('');

    if (!rangoSeleccionado || !rangoSeleccionado.from || !rangoSeleccionado.to) {
      setErrorReserva('Por favor, selecciona un rango de fechas.');
      return;
    }

    if (!nombreCompleto || cantidadPersonas < 1) {
      setErrorReserva('Por favor, completa tu nombre y la cantidad de personas.');
      return;
    }

    setLoading(true);

    const fecha_inicio_str = rangoSeleccionado.from.toISOString().split('T')[0];
    const fecha_fin_str = rangoSeleccionado.to.toISOString().split('T')[0];

    // 1. VERIFICACIÓN DE OVERLAP
    const { data: conflicto, error: errorConflicto } = await supabase
      .from('reservas')
      .select('id_reserva')
      .eq('id_apartamento', parseInt(id))
      .in('estado', ['Confirmada', 'Pendiente'])
      .lt('fecha_inicio', fecha_fin_str)
      .gt('fecha_fin', fecha_inicio_str);

    if (errorConflicto) {
      // ESTE ES EL ERROR QUE ESTÁS VIENDO
      console.error('Error en el chequeo de overlap:', errorConflicto); // Añade esto
      setErrorReserva('Error al verificar disponibilidad. Intenta de nuevo.');
      setLoading(false);
      return;
    }

    if (conflicto && conflicto.length > 0) {
      setErrorReserva('Esas fechas (o parte de ellas) acaban de ser reservadas. Por favor, actualiza la página y elige otras.');
      setLoading(false);
      return;
    }

    // 2. CREAR LA RESERVA
    const montoSeniaNum = parseFloat(depto.senia.replace('$', '').replace(/\./g, ''));

    const { error: errorInsert } = await supabase
      .from('reservas')
      .insert({
        id_apartamento: parseInt(id),
        nombre_completo: nombreCompleto,
        cantidad_personas: cantidadPersonas,
        fecha_inicio: fecha_inicio_str,
        fecha_fin: fecha_fin_str,
        monto_seña: montoSeniaNum,
        estado: 'Pendiente',
        metodo_pago: 'Pendiente',
      });

    if (errorInsert) {
      setErrorReserva('Error al guardar la reserva. Intenta de nuevo.');
      console.error('Error insertando:', errorInsert);
    } else {
      // --- MENSAJE DE ÉXITO ACTUALIZADO ---
      setExitoReserva(
        `¡Reserva creada del ${formatFecha(rangoSeleccionado.from)} al ${formatFecha(
          rangoSeleccionado.to
        )}! Queda pendiente de pago.`
      );
      // Limpiar formulario
      setRangoSeleccionado(undefined);
      setNombreCompleto('');
      setCantidadPersonas(1);
      // Actualizar el calendario con la nueva reserva
      setDiasOcupados([
        ...diasOcupados,
        {
          from: rangoSeleccionado.from,
          to: new Date(rangoSeleccionado.to.getTime() - 24 * 60 * 60 * 1000),
        },
      ]);
    }
    setLoading(false);
  };

  if (!depto) return <h2>Departamento no encontrado</h2>;

  return (
    <>
      <div className="depto-container">
        <h1>{depto.nombre}</h1>
        <CarouselComponent imagenes={depto.imagenes} titulo={depto.nombre} />

        <div className="depto-precio">
          <h3>Precios</h3>
          <div className="precios">
            {depto.precio.map((p, i) => (
              <div key={i} className="precio-item">
                {Array.from({ length: p.personas }).map((_, j) => (
                  <IoPersonSharp key={j} />
                ))}
                <span>${p.precio.toLocaleString('es-AR')}</span>
              </div>
            ))}
          </div>
        </div>

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
          <div className="map-container" id="ubicacion">
            <div
              className="map-container"
              dangerouslySetInnerHTML={{ __html: depto.ubicacion }}
            />
          </div>

          {/* == INICIO: CALENDARIO Y FORMULARIO DE RESERVA == */}

          <div className="reserva-container">
            <h3>Disponibilidad y Reserva</h3>
            <p>Selecciona tu fecha de check-in y check-out en el calendario.</p>

            {loading && <p>Cargando disponibilidad...</p>}

            <DayPicker
              mode="range"
              selected={rangoSeleccionado}
              onSelect={setRangoSeleccionado}
              disabled={diasOcupados}
              numberOfMonths={2}
              fromDate={new Date()}
            />

            {/* --- DIV PARA FECHAS SELECCIONADAS --- */}
            <div className="fecha-seleccionada">
              {rangoSeleccionado?.from && (
                <p>
                  Check-in: <strong>{formatFecha(rangoSeleccionado.from)}</strong>
                </p>
              )}
              {rangoSeleccionado?.to && (
                <p>
                  Check-out: <strong>{formatFecha(rangoSeleccionado.to)}</strong>
                </p>
              )}
            </div>
            {/* --- FIN DIV FECHAS --- */}

            <form onSubmit={handleReservar} className="reserva-form">
              <div className="form-group">
                <label htmlFor="nombre">Nombre Completo</label>
                <input
                  type="text"
                  id="nombre"
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                  placeholder="Tu nombre y apellido"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="personas">Cantidad de Personas</label>
                <input
                  type="number"
                  id="personas"
                  value={cantidadPersonas}
                  onChange={(e) => setCantidadPersonas(parseInt(e.target.value))}
                  min="1"
                  max={depto.capacidad} // Asegúrate que 'depto.capacidad' exista en tus datos
                  required
                />
              </div>

              {errorReserva && <p className="error-msg">{errorReserva}</p>}
              {exitoReserva && <p className="exito-msg">{exitoReserva}</p>}

              <button type="submit" disabled={loading} className="boton-reservar">
                {loading ? 'Procesando...' : 'Reservar (Pendiente de Pago)'}
              </button>
            </form>
          </div>
          {/* == FIN: CALENDARIO Y FORMULARIO DE RESERVA == */}
        </div>
      </div>

      <Footer />
    </>
  );
};