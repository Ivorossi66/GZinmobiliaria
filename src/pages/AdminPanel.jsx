import React, { useState, useEffect } from 'react';
import  supabase  from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import '../styles/AdminPanel.css';

export const AdminPanel = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { signOut } = useAuth();
  const navigate = useNavigate();

  // --- ESTADOS PARA EL RESUMEN ---
  const [resumenData, setResumenData] = useState({});
  const [fechaVisualizacion, setFechaVisualizacion] = useState(new Date());

  const monthFormat = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' });

  // --- LÓGICA DE PROCESAMIENTO DEL RESUMEN ---
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

  // --- NAVEGACIÓN DE MES ---
  const cambiarMes = (direccion) => {
    const nuevaFecha = new Date(fechaVisualizacion);
    nuevaFecha.setMonth(nuevaFecha.getMonth() + direccion);
    setFechaVisualizacion(nuevaFecha);
  };

  const mesVisualActualStr = monthFormat.format(fechaVisualizacion);
  const mesVisualActualCap = mesVisualActualStr.charAt(0).toUpperCase() + mesVisualActualStr.slice(1);
  const datosDelMesActual = resumenData[mesVisualActualCap] || {};

  // 1. Cargar todas las reservas
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

  // 2. Función para cambiar estado
  const handleEstadoChange = async (id, nuevoEstado) => {
    if (nuevoEstado === 'Cancelada') {
      if (!window.confirm('¿Seguro que quieres CANCELAR esta reserva? Se liberará la fecha.')) {
        return;
      }
      const { error } = await supabase
        .from('reservas')
        .update({ estado: 'Cancelada' })
        .eq('id_reserva', id);
      if (error) alert('Error al actualizar.'); else fetchReservas();
    } else {
      const { error } = await supabase
        .from('reservas')
        .update({ estado: nuevoEstado })
        .eq('id_reserva', id);
      if (error) alert('Error al actualizar.'); else fetchReservas();
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // --- LÓGICA NUEVA: AGRUPAR LAS RESERVAS POR APARTAMENTO ---
  const reservasAgrupadas = reservas.reduce((acc, reserva) => {
    const nombreDepto = reserva.departamentos.nombre;
    if (!acc[nombreDepto]) {
      acc[nombreDepto] = [];
    }
    acc[nombreDepto].push(reserva);
    return acc;
  }, {});

  // Ordenamos las llaves para que aparezcan en orden (Apart 2, Apart 6, Apart 7)
  const nombresDeptosOrdenados = Object.keys(reservasAgrupadas).sort();


  if (loading) return <p className="loading-text">Cargando panel...</p>;
  if (error) return <p className="error-msg">{error}</p>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Panel de Administración</h1>
        <button onClick={handleLogout} className="boton-logout">
          Cerrar Sesión
        </button>
      </div>

      {/* --- RESUMEN MENSUAL --- */}
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
                  {dias.map(dia => (
                    <span key={dia} className="dia-ocupado">{dia}</span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <hr className="admin-divider" />

      <h2>Listado de Reservas</h2>
      <br />
      
      {/* --- LISTADO AGRUPADO POR APARTAMENTO --- */}
      
      {nombresDeptosOrdenados.length === 0 ? (
        <p className="text-center">No hay reservas activas.</p>
      ) : (
        nombresDeptosOrdenados.map((nombreDepto) => (
          <div key={nombreDepto} className="seccion-depto">
            <h3 className="titulo-seccion-depto">{nombreDepto}</h3>
            
            <div className="reservas-grid">
              {reservasAgrupadas[nombreDepto].map((reserva) => (
                <div key={reserva.id_reserva} className={`reserva-card estado-${reserva.estado.toLowerCase()}`}>
                  <div className="card-header-admin">
                    <h4>Reserva #{reserva.id_reserva}</h4>
                    {/* Ya no necesitamos el badge aquí porque el título de sección lo dice */}
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
                        onClick={() => handleEstadoChange(reserva.id_reserva, 'Confirmada')}
                        className="btn-confirmar">
                        Confirmar Pago
                      </button>
                    )}
                    <button 
                      onClick={() => handleEstadoChange(reserva.id_reserva, 'Cancelada')}
                      className="btn-cancelar">
                      Cancelar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

    </div>
  );
};

const formatFecha = (fechaStr) => {
    const [anio, mes, dia] = fechaStr.split('-');
    return `${dia}/${mes}/${anio}`;
}