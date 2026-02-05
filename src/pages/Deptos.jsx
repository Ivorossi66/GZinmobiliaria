import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { deptos } from '../data/carousel';
import Footer from '../components/Footer';
import CarouselComponent from '../components/CarouselComponent';
import '../components/NavigateApp';
import '../styles/Deptos.css';
import '../styles/Home.css';
import { IoPersonSharp } from 'react-icons/io5';
import { FaWhatsapp } from 'react-icons/fa';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import supabase from '../supabaseClient';
import { Modal, Button } from 'react-bootstrap';
// Nota: Importamos 'es' para el calendario, ya no necesitamos date-fns para la validación manual que haremos
import { es } from 'date-fns/locale'; 

// --- Función para formatear fechas a d-m-a ---
const formatFecha = (date) => {
  if (!date) return '';
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const anio = date.getFullYear();
  return `${dia}-${mes}-${anio}`;
};

export const Deptos = () => {
  const { id } = useParams();
  const depto = deptos.find((d) => d.id === id);

  // Estados
  const [diasOcupados, setDiasOcupados] = useState([]); // VISUALES (Lo que se ve gris)
  const [reservasExactas, setReservasExactas] = useState([]); // LÓGICA (Datos reales para validar)
  
  const [rangoSeleccionado, setRangoSeleccionado] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [errorReserva, setErrorReserva] = useState('');
  const [exitoReserva, setExitoReserva] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [cantidadPersonas, setCantidadPersonas] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [reservaInfo, setReservaInfo] = useState(null);

  // Cargar las fechas ocupadas de Supabase
  useEffect(() => {
    async function getReservas() {
      if (!id) return;
      setLoading(true);

      const { data, error } = await supabase
        .from('reservas')
        .select('fecha_inicio, fecha_fin')
        .eq('id_apartamento', parseInt(id))
        .neq('estado', 'Cancelada'); 

      if (error) {
        console.error('Error al cargar reservas:', error);
        setErrorReserva('No se pudo cargar la disponibilidad.');
      } else {
        const visuales = [];
        const exactas = [];

        data.forEach((reserva) => {
          // 1. Guardamos las fechas EXACTAS para el "Policía" (Validación)
          const realStart = new Date(reserva.fecha_inicio + 'T00:00:00');
          const realEnd = new Date(reserva.fecha_fin + 'T00:00:00');
          exactas.push({ from: realStart, to: realEnd });

          // 2. Calculamos los días "SÁNDWICH" para la Visual (Lo que se ve gris)
          // Solo bloqueamos los días que están ESTRICTAMENTE en el medio.
          // Ejemplo: Reserva del 12 al 15.
          // Visual Start = 13 (Start + 1)
          // Visual End   = 14 (End - 1)
          // Resultado: 12 y 15 quedan LIBRES para clic (Check-out/Check-in), 13 y 14 GRISES.
          
          let visualStart = new Date(realStart);
          visualStart.setDate(visualStart.getDate() + 1); // Empezamos un día después

          let visualEnd = new Date(realEnd);
          visualEnd.setDate(visualEnd.getDate() - 1); // Terminamos un día antes

          // Solo agregamos rango visual si hay días en el medio
          if (visualStart <= visualEnd) {
             visuales.push({ from: visualStart, to: visualEnd });
          }
        });

        setReservasExactas(exactas); // Para validar lógica
        setDiasOcupados(visuales);   // Para pintar el calendario
      }
      setLoading(false);
    }

    getReservas();
  }, [id]);

  // --- FUNCIÓN DE VALIDACIÓN "EL POLICÍA" ---
  const handleSelectRange = (range) => {
    setErrorReserva(''); 

    // Si está seleccionando, permitimos
    if (!range || !range.from || !range.to) {
       setRangoSeleccionado(range);
       return;
    }

    const userStart = range.from.getTime();
    const userEnd = range.to.getTime();

    // Verificamos conflicto matemático
    // Regla: (InicioA < FinB) y (FinA > InicioB)
    const hayConflicto = reservasExactas.some((ocupado) => {
       const bookedStart = ocupado.from.getTime();
       const bookedEnd = ocupado.to.getTime();

       // Esta fórmula detecta cualquier superposición de intervalos
       return (userStart < bookedEnd && userEnd > bookedStart);
    });

    if (hayConflicto) {
       setErrorReserva('⚠️ Fechas no disponibles (se superponen con otra reserva).');
       setRangoSeleccionado(undefined); // Borramos selección
    } else {
       setRangoSeleccionado(range); // Todo ok
    }
  };

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

    // --- 1. LÓGICA DE CÁLCULO DE SEÑA ---
    let montoSeniaNum = 0;
    try {
      const fechaInicio = new Date(rangoSeleccionado.from);
      const fechaFin = new Date(rangoSeleccionado.to);
      const tiempoDiferencia = fechaFin.getTime() - fechaInicio.getTime();
      const numeroDeNoches = Math.ceil(tiempoDiferencia / (1000 * 3600 * 24));

      if (numeroDeNoches <= 0) {
        setErrorReserva('La fecha de check-out debe ser posterior a la de check-in.');
        setLoading(false);
        return;
      }

      const precioInfo = depto.precio.find(p => p.personas === parseInt(cantidadPersonas));
      if (!precioInfo) {
        setErrorReserva(`No se encontró un precio para ${cantidadPersonas} personas.`);
        setLoading(false);
        return;
      }
      const precioPorNoche = precioInfo.precio;
      const montoTotal = precioPorNoche * numeroDeNoches;
      montoSeniaNum = montoTotal * 0.5;

    } catch (calcError) {
      console.error('Error calculando seña:', calcError, depto);
      setErrorReserva('Error al calcular el monto de la seña.');
      setLoading(false);
      return;
    }

    const fecha_inicio_str = rangoSeleccionado.from.toISOString().split('T')[0];
    const fecha_fin_str = rangoSeleccionado.to.toISOString().split('T')[0];

    // 2. VERIFICACIÓN DE OVERLAP FINAL (Doble chequeo en Base de Datos)
    const { data: conflicto, error: errorConflicto } = await supabase
      .from('reservas')
      .select('id_reserva')
      .eq('id_apartamento', parseInt(id))
      .neq('estado', 'Cancelada')
      .lt('fecha_inicio', fecha_fin_str)
      .gt('fecha_fin', fecha_inicio_str);

    if (errorConflicto) {
      console.error('Error en el chequeo de overlap:', errorConflicto);
      setErrorReserva('Error al verificar disponibilidad. Intenta de nuevo.');
      setLoading(false);
      return;
    }

    if (conflicto && conflicto.length > 0) {
      setErrorReserva('Ups! Esas fechas acaban de ser ocupadas. Actualiza la página.');
      setLoading(false);
      return;
    }

    // 3. CREAR LA RESERVA 
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
        metodo_pago: 'Transferencia',
      });

    if (errorInsert) {
      setErrorReserva('Error al guardar la reserva. Intenta de nuevo.');
      console.error('Error insertando:', errorInsert);
    } else {
      setReservaInfo({
        nombre: nombreCompleto,
        depto: depto.nombre,
        monto: montoSeniaNum,
        fechaInicio: formatFecha(rangoSeleccionado.from),
        fechaFin: formatFecha(rangoSeleccionado.to)
      });
      setRangoSeleccionado(undefined);
      setNombreCompleto('');
      setCantidadPersonas(1);
      setExitoReserva('');
      setShowModal(true);
      
      // Actualizamos visuales: Agregamos el "Sándwich" nuevo a lo gris
      // para que el usuario vea el cambio instantáneo
      let visualStart = new Date(rangoSeleccionado.from);
      visualStart.setDate(visualStart.getDate() + 1);
      let visualEnd = new Date(rangoSeleccionado.to);
      visualEnd.setDate(visualEnd.getDate() - 1);

      if (visualStart <= visualEnd) {
        setDiasOcupados([
          ...diasOcupados,
          { from: visualStart, to: visualEnd },
        ]);
      }
      
      // Actualizamos lógica también
      setReservasExactas([
         ...reservasExactas,
         { from: rangoSeleccionado.from, to: rangoSeleccionado.to }
      ]);
    }
    setLoading(false);
  };

  const handleWhatsAppNotify = () => {
    const adminNumber = '5493533407784';
    const mensaje = `¡Hola! Acabo de hacer una reserva a nombre de ${reservaInfo.nombre} para el ${reservaInfo.depto} (del ${reservaInfo.fechaInicio} al ${reservaInfo.fechaFin}). Ya te envío el comprobante de la seña de $${reservaInfo.monto.toLocaleString('es-AR')}.`;
    const whatsappUrl = `https://wa.me/${adminNumber}?text=${encodeURIComponent(mensaje)}`;
    window.open(whatsappUrl, '_blank');
    setShowModal(false);
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

          <h3>Incluye Ropa Blanca</h3>
          <p>{depto.blanco}</p>

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
          <h3>Prohibido Fumar</h3>
          <h3>Dirección</h3>
          <p>{depto.direccion}</p>

          <h3>Mapa</h3>
          <div className="map-container" id="ubicacion">
            <div
              className="map-container"
              dangerouslySetInnerHTML={{ __html: depto.ubicacion }}
            />
          </div>

          <div className="reserva-container">
            <h3>Disponibilidad y Reserva</h3>
            <p>Selecciona tu fecha de check-in y check-out en el calendario.</p>

            {loading && <p>Cargando disponibilidad...</p>}

            <DayPicker
              mode="range"
              selected={rangoSeleccionado}
              onSelect={handleSelectRange} 
              disabled={[...diasOcupados, { before: new Date() }]}
              numberOfMonths={1}
              locale={es}
            />
            
            <div className="fecha-seleccionada">
              {rangoSeleccionado?.from && (
                <p>Check-in: <strong>{formatFecha(rangoSeleccionado.from)}</strong></p>
              )}
              {rangoSeleccionado?.to && (
                <p>Check-out: <strong>{formatFecha(rangoSeleccionado.to)}</strong></p>
              )}
            </div>
            
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
                  max={depto.capacidad}
                  required
                />
              </div>
              {errorReserva && <p className="error-msg">{errorReserva}</p>}
              {exitoReserva && <p className="exito-msg">{exitoReserva}</p>}
              <button type="submit" disabled={loading} className="boton-reservar">
                {loading ? 'Procesando...' : 'Solicitar Reserva'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>¡Reserva Pendiente!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Tu solicitud de reserva ha sido registrada.</p>
          <p>Para confirmarla, transfiere la seña de <strong>${reservaInfo?.monto.toLocaleString('es-AR')}</strong> a la siguiente cuenta:</p>
          <div className="datos-bancarios">
            <p><strong>CBU:</strong> 0110332630033213189065</p>
            <p><strong>Alias:</strong> APART.PLAZA.LV</p>
            <p><strong>Titular:</strong> Graciela Andrea Zorzenón (27-17967345-8)</p>
            <p><strong>Banco:</strong> Banco Nación</p>
          </div>
          <hr />
          <p className="fw-bold">MUY IMPORTANTE:</p>
          <p>Una vez realizada la transferencia, ENVIAR COMPROBANTE tocando el botón de Whatsapp.</p>
          <p>Si NO envía el comprobante, NO se tendrá en cuenta la reserva.</p>
          <p>La seña NO se reintegra.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cerrar
          </Button>
          <Button variant="success" onClick={handleWhatsAppNotify}>
            <FaWhatsapp /> Avisar por WhatsApp
          </Button>
        </Modal.Footer>
      </Modal>
      <Footer />
    </>
  );
};