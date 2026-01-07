// src/pages/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import  supabase  from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import '../styles/AdminPanel.css';

// Función auxiliar para fechas
const formatFecha = (fechaStr) => {
  const [anio, mes, dia] = fechaStr.split('-');
  return `${dia}/${mes}/${anio}`;
};

// --- NUEVO COMPONENTE INTERNO PARA EL SLIDER DE RESERVAS ---
const ReservasSlider = ({ reservas, onEstadoChange }) => {
  const [pagina, setPagina] = useState(0);
  const itemsPorPagina = 3; 

  const totalPaginas = Math.ceil(reservas.length / itemsPorPagina);
  
  const indiceInicio = pagina * itemsPorPagina;
  const indiceFin = indiceInicio + itemsPorPagina;
  const reservasVisibles = reservas.slice(indiceInicio, indiceFin);

  const avanzar = () => {
    if (pagina < totalPaginas - 1) setPagina(pagina + 1);
  };

  const retroceder = () => {
    if (pagina > 0) setPagina(pagina - 1);
  };

  if (reservas.length === 0) return <p className="text-muted">No hay reservas en este grupo.</p>;

  return (
    <div className="slider-container">
      {pagina > 0 && (
        <button onClick={retroceder} className="btn-slider-nav left">
          <FaChevronLeft />
        </button>
      )}

      {/* Grid de Cards */}
      <div className="reservas-grid">
        {reservasVisibles.map((reserva) => (
          <div key={reserva.id_reserva} className={`reserva-card estado-${reserva.estado.toLowerCase()}`}>
            <div className="card-header-admin">
              <h4>Reserva #{reserva.id_reserva}</h4>
              <span className={`estado-badge ${reserva.estado.toLowerCase()}`}>{reserva.estado}</span>
            </div>
            <div className="card-body-admin">
              <p><strong>Cliente:</strong> {reserva.nombre_completo}</p>
              <p><strong>Check-in:</strong> {formatFecha(reserva.fecha_inicio)}</p>
              <p><strong>Check-out:</strong> {formatFecha(reserva.fecha_fin)}</p>
              <p><strong>Personas:</strong> {reserva.cantidad_personas}</p>
              <p><strong>Seña:</strong> ${reserva.monto_seña.toLocaleString('es-AR')}</p>
            </div>
            <div className="botones-accion">
              {reserva.estado === 'Pendiente' && (
                <button 
                  onClick={() => onEstadoChange(reserva.id_reserva, 'Confirmada')} 
                  className="btn-confirmar">
                  Confirmar Pago
                </button>
              )}
              <button 
                onClick={() => onEstadoChange(reserva.id_reserva, 'Cancelada')} 
                className="btn-cancelar">
                Cancelar
              </button>
            </div>
          </div>
        ))}
      </div>

      {pagina < totalPaginas - 1 && (
        <button onClick={avanzar} className="btn-slider-nav right">
          <FaChevronRight />
        </button>
      )}
      
      {totalPaginas > 1 && (
        <div className="paginacion-info">
          Página {pagina + 1} de {totalPaginas}
        </div>
      )}
    </div>
  );
};
// --- FIN COMPONENTE INTERNO ---

export const AdminPanel = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const [resumenData, setResumenData] = useState({});
  const [fechaVisualizacion, setFechaVisualizacion] = useState(new Date());
  const monthFormat = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' });

  useEffect(() => {
    const originalBackground = document.body.style.backgroundImage;
    const originalBackgroundColor = document.body.style.backgroundColor;
    document.body.style.backgroundImage = 'none';
    document.body.style.backgroundColor = '#f0f2f5';
    return () => {
      document.body.style.backgroundImage = originalBackground;
      document.body.style.backgroundColor = originalBackgroundColor;
    };
  }, []);

  const procesarFechasOcupadas = (reservasData) => {
    const estructura = {};
    for (const reserva of reservasData) {
      let currentDate = new Date(reserva.fecha_inicio + 'T00:00:00');
      const endDate = new Date(reserva.fecha_fin + 'T00:00:00');
      const nombreDepto = reserva.departamentos.nombre;

      while (currentDate < endDate) {
        const mesAnioStr = monthFormat.format(currentDate);
        const mesAnioCap = mesAnioStr.charAt(0).toUpperCase() + mesAnioStr.slice(1);
        const dia = currentDate.getDate();

        if (!estructura[mesAnioCap]) estructura[mesAnioCap] = {};
        if (!estructura[mesAnioCap][nombreDepto]) estructura[mesAnioCap][nombreDepto] = new Set();
        
        estructura[mesAnioCap][nombreDepto].add(dia);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    
    const resumenFinal = {};
    Object.keys(estructura).forEach(mes => {
      resumenFinal[mes] = {};
      Object.keys(estructura[mes]).forEach(depto => {
        resumenFinal[mes][depto] = [...estructura[mes][depto]].sort((a, b) => a - b);
      });
    });
    setResumenData(resumenFinal);
  };

  const cambiarMes = (direccion) => {
    const nuevaFecha = new Date(fechaVisualizacion);
    nuevaFecha.setMonth(nuevaFecha.getMonth() + direccion);
    setFechaVisualizacion(nuevaFecha);
  };

  const mesVisualActualStr = monthFormat.format(fechaVisualizacion);
  const mesVisualActualCap = mesVisualActualStr.charAt(0).toUpperCase() + mesVisualActualStr.slice(1);
  const datosDelMesActual = resumenData[mesVisualActualCap] || {};

  async function fetchReservas() {
    setLoading(true);
    const { data, error } = await supabase
      .from('reservas')
      .select('*, departamentos(nombre)')
      .neq('estado', 'Cancelada')
      .order('fecha_inicio', { ascending: true });

    if (error) {
      setError('Error al cargar las reservas.');
      console.error(error);
    } else {
      setReservas(data);
      procesarFechasOcupadas(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchReservas();
  }, []);

  const handleEstadoChange = async (id, nuevoEstado) => {
    if (nuevoEstado === 'Cancelada') {
      if (!window.confirm('¿Seguro que quieres CANCELAR esta reserva? Se liberará la fecha.')) return;
      const { error } = await supabase.from('reservas').update({ estado: 'Cancelada' }).eq('id_reserva', id);
      if (error) alert('Error al actualizar.'); else fetchReservas();
    } else {
      const { error } = await supabase.from('reservas').update({ estado: nuevoEstado }).eq('id_reserva', id);
      if (error) alert('Error al actualizar.'); else fetchReservas();
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const reservasAgrupadas = reservas.reduce((acc, reserva) => {
    const nombreDepto = reserva.departamentos.nombre;
    if (!acc[nombreDepto]) acc[nombreDepto] = [];
    acc[nombreDepto].push(reserva);
    return acc;
  }, {});
  const nombresDeptosOrdenados = Object.keys(reservasAgrupadas).sort();

  if (loading) return <p className="loading-text">Cargando panel...</p>;
  if (error) return <p className="error-msg">{error}</p>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Panel de Administración</h1>
        <button onClick={handleLogout} className="boton-logout">Cerrar Sesión</button>
      </div>

      <div className="resumen-container">
        <div className="resumen-header">
          <button onClick={() => cambiarMes(-1)} className="btn-mes-nav"><FaChevronLeft /></button>
          <h3>Resumen: {mesVisualActualCap}</h3>
          <button onClick={() => cambiarMes(1)} className="btn-mes-nav"><FaChevronRight /></button>
        </div>
        <div className="resumen-contenido">
          {Object.keys(datosDelMesActual).length === 0 ? (
            <p className="text-muted text-center">No hay días ocupados en este mes.</p>
          ) : (
            Object.entries(datosDelMesActual).map(([nombreDepto, dias]) => (
              <div key={nombreDepto} className="depto-resumen-fila">
                <span className="depto-nombre-label">{nombreDepto}:</span>
                <div className="dias-lista">
                  {dias.map(dia => <span key={dia} className="dia-ocupado">{dia}</span>)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <hr className="admin-divider" />

      <h2>Listado de Reservas Activas</h2>
      
      {nombresDeptosOrdenados.length === 0 ? (
        <p className="text-center">No hay reservas activas.</p>
      ) : (
        nombresDeptosOrdenados.map((nombreDepto) => (
          <div key={nombreDepto} className="seccion-depto">
            <h3 className="titulo-seccion-depto">{nombreDepto}</h3>
            
            <ReservasSlider 
              reservas={reservasAgrupadas[nombreDepto]} 
              onEstadoChange={handleEstadoChange} 
            />
            
          </div>
        ))
      )}
    </div>
  );
};