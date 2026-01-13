import React, { useState, useEffect } from 'react';
import  supabase  from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaPlus, FaTimes } from 'react-icons/fa';
import '../styles/AdminPanel.css';

// Función auxiliar para formatear fechas
const formatFecha = (fechaStr) => {
  if (!fechaStr) return '-';
  const [anio, mes, dia] = fechaStr.split('-');
  return `${dia}/${mes}/${anio}`;
};

// --- COMPONENTE INTERNO PARA EL SLIDER DE RESERVAS ---
const ReservasSlider = ({ reservas, onEstadoChange }) => {
  const [pagina, setPagina] = useState(0);
  const itemsPorPagina = 3; 

  const totalPaginas = Math.ceil(reservas.length / itemsPorPagina);
  const indiceInicio = pagina * itemsPorPagina;
  const indiceFin = indiceInicio + itemsPorPagina;
  const reservasVisibles = reservas.slice(indiceInicio, indiceFin);

  const avanzar = () => { if (pagina < totalPaginas - 1) setPagina(pagina + 1); };
  const retroceder = () => { if (pagina > 0) setPagina(pagina - 1); };

  if (reservas.length === 0) return <p className="text-muted">No hay reservas en este grupo.</p>;

  return (
    <div className="slider-container">
      {pagina > 0 && <button onClick={retroceder} className="btn-slider-nav left"><FaChevronLeft /></button>}
      <div className="reservas-grid">
        {reservasVisibles.map((reserva) => (
          <div key={reserva.id_reserva} className={`reserva-card estado-${reserva.estado.toLowerCase()}`}>
            <div className="card-header-admin">
              <h4>{reserva.estado === 'Bloqueado' ? '🔒 Bloqueo' : `Reserva #${reserva.id_reserva}`}</h4>
              <span className={`estado-badge ${reserva.estado.toLowerCase()}`}>{reserva.estado}</span>
            </div>
            <div className="card-body-admin">
              {reserva.estado === 'Bloqueado' ? (
                 <>
                   <p><strong>Motivo:</strong> {reserva.nombre_completo}</p>
                   <p><strong>Fecha:</strong> {formatFecha(reserva.fecha_inicio)}</p>
                   <p style={{fontSize: '0.85rem', color: '#777'}}>(Hasta: {formatFecha(reserva.fecha_fin)})</p>
                 </>
              ) : (
                 <>
                    <p><strong>Cliente:</strong> {reserva.nombre_completo}</p>
                    <p><strong>Check-in:</strong> {formatFecha(reserva.fecha_inicio)}</p>
                    <p><strong>Check-out:</strong> {formatFecha(reserva.fecha_fin)}</p>
                    <p><strong>Personas:</strong> {reserva.cantidad_personas}</p>
                    <p><strong>Seña:</strong> ${reserva.monto_seña ? reserva.monto_seña.toLocaleString('es-AR') : '0'}</p>
                 </>
              )}
            </div>
            <div className="botones-accion">
              {reserva.estado === 'Pendiente' && (
                <button onClick={() => onEstadoChange(reserva.id_reserva, 'Confirmada')} className="btn-confirmar">Confirmar Pago</button>
              )}
              <button onClick={() => onEstadoChange(reserva.id_reserva, 'Cancelada')} className="btn-cancelar">
                {reserva.estado === 'Bloqueado' ? 'Liberar' : 'Cancelar'}
              </button>
            </div>
          </div>
        ))}
      </div>
      {pagina < totalPaginas - 1 && <button onClick={avanzar} className="btn-slider-nav right"><FaChevronRight /></button>}
    </div>
  );
};
// --- FIN COMPONENTE INTERNO ---

export const AdminPanel = () => {
  const [reservas, setReservas] = useState([]);
  const [deptos, setDeptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { signOut } = useAuth();
  const navigate = useNavigate();

  // Estados Form Bloqueo
  const [mostrarFormBloqueo, setMostrarFormBloqueo] = useState(false);
  const [nuevoBloqueo, setNuevoBloqueo] = useState({
    id_apartamento: '', // Usamos id_apartamento para coincidir con tu tabla
    fecha_inicio: '', 
    fecha_fin: '', 
    motivo: ''
  });
  
  // Estado para los días de la semana (0=Domingo, 1=Lunes...)
  const [diasRepeticion, setDiasRepeticion] = useState({
    1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 0: false
  });

  const diasLabels = [
    { id: 1, label: 'Lu' }, { id: 2, label: 'Ma' }, { id: 3, label: 'Mi' },
    { id: 4, label: 'Ju' }, { id: 5, label: 'Vi' }, { id: 6, label: 'Sa' }, { id: 0, label: 'Do' }
  ];

  // Resumen Mensual
  const [resumenData, setResumenData] = useState({});
  const [fechaVisualizacion, setFechaVisualizacion] = useState(new Date());
  const monthFormat = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' });

  // Efecto Fondo
  useEffect(() => {
    const obg = document.body.style.backgroundImage;
    const obc = document.body.style.backgroundColor;
    document.body.style.backgroundImage = 'none';
    document.body.style.backgroundColor = '#f0f2f5';
    return () => {
      document.body.style.backgroundImage = obg;
      document.body.style.backgroundColor = obc;
    };
  }, []);

  // Cargar Deptos y Reservas
  useEffect(() => {
    const fetchDatos = async () => {
      setLoading(true);
      
      // 1. Cargar Departamentos (tabla departamentos)
      const { data: deptosData, error: deptosError } = await supabase
        .from('departamentos')
        .select('*') // Trae: id_apartamento, nombre, capacidad_max
        .order('nombre');
      
      if (deptosData) setDeptos(deptosData);

      // 2. Cargar Reservas (tabla reservas)
      // Nota: Asumimos que la relación en Supabase se llama "departamentos"
      const { data: reservasData, error: reservasError } = await supabase
        .from('reservas')
        .select('*, departamentos(nombre)') 
        .neq('estado', 'Cancelada')
        .order('fecha_inicio', { ascending: true });

      if (reservasError) {
        setError('Error al cargar datos.');
        console.error(reservasError);
      } else {
        setReservas(reservasData);
        procesarFechasOcupadas(reservasData);
      }
      setLoading(false);
    };

    fetchDatos();
  }, []);

  const procesarFechasOcupadas = (reservasData) => {
    const estructura = {};
    for (const reserva of reservasData) {
      let currentDate = new Date(reserva.fecha_inicio + 'T00:00:00');
      const endDate = new Date(reserva.fecha_fin + 'T00:00:00');
      const nombreDepto = reserva.departamentos?.nombre || 'Depto';

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

  const cambiarMes = (dir) => {
    const nf = new Date(fechaVisualizacion);
    nf.setMonth(nf.getMonth() + dir);
    setFechaVisualizacion(nf);
  };
  const mesVisualActualStr = monthFormat.format(fechaVisualizacion);
  const mesVisualActualCap = mesVisualActualStr.charAt(0).toUpperCase() + mesVisualActualStr.slice(1);
  const datosDelMesActual = resumenData[mesVisualActualCap] || {};

  // Función para recargar solo reservas
  const recargarReservas = async () => {
    const { data } = await supabase
      .from('reservas')
      .select('*, departamentos(nombre)')
      .neq('estado', 'Cancelada')
      .order('fecha_inicio', { ascending: true });
    if (data) {
      setReservas(data);
      procesarFechasOcupadas(data);
    }
  };

  const handleEstadoChange = async (id, nuevoEstado) => {
    if (nuevoEstado === 'Cancelada') {
      if (!window.confirm('¿Liberar esta fecha?')) return;
      const { error } = await supabase.from('reservas').update({ estado: 'Cancelada' }).eq('id_reserva', id);
      if (!error) recargarReservas();
    } else {
      const { error } = await supabase.from('reservas').update({ estado: nuevoEstado }).eq('id_reserva', id);
      if (!error) recargarReservas();
    }
  };

  // --- LÓGICA DE BLOQUEO (CORREGIDA FINAL) ---
  const handleCrearBloqueo = async (e) => {
    e.preventDefault();
    if(!nuevoBloqueo.id_apartamento || !nuevoBloqueo.fecha_inicio || !nuevoBloqueo.fecha_fin) {
      alert("Completa los campos obligatorios.");
      return;
    }

    const diasSeleccionados = Object.keys(diasRepeticion).filter(day => diasRepeticion[day]);
    const esRangoCompleto = diasSeleccionados.length === 0;

    let bloqueosAInsertar = [];

    // Objeto base con columnas EXACTAS de la tabla 'reservas'
    const baseBloqueo = {
        id_apartamento: parseInt(nuevoBloqueo.id_apartamento), // Aseguramos que sea entero
        nombre_completo: nuevoBloqueo.motivo || 'Bloqueo Manual',
        cantidad_personas: 0, 
        monto_seña: 0, 
        metodo_pago: 'Manual',
        estado: 'Bloqueado'
    };

    if (esRangoCompleto) {
      // Bloqueo continuo
      bloqueosAInsertar.push({
        ...baseBloqueo,
        fecha_inicio: nuevoBloqueo.fecha_inicio,
        fecha_fin: nuevoBloqueo.fecha_fin,
      });
    } else {
      // Bloqueo por días específicos
      let currentDate = new Date(nuevoBloqueo.fecha_inicio + 'T00:00:00');
      const endDate = new Date(nuevoBloqueo.fecha_fin + 'T00:00:00');

      while (currentDate <= endDate) { 
        const dayOfWeek = currentDate.getDay().toString();
        
        if (diasRepeticion[dayOfWeek]) {
          const nextDay = new Date(currentDate);
          nextDay.setDate(nextDay.getDate() + 1);
          
          const fechaInicioStr = currentDate.toISOString().split('T')[0];
          const fechaFinStr = nextDay.toISOString().split('T')[0];

          if (currentDate < endDate) { 
             bloqueosAInsertar.push({
                ...baseBloqueo,
                fecha_inicio: fechaInicioStr,
                fecha_fin: fechaFinStr,
             });
          }
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    if (bloqueosAInsertar.length === 0) {
      alert("La selección de días no generó ningún bloqueo en ese rango de fechas.");
      return;
    }

    const { error } = await supabase.from('reservas').insert(bloqueosAInsertar);

    if (error) alert('Error: ' + error.message);
    else {
      alert(`Se crearon ${bloqueosAInsertar.length} bloqueos exitosamente.`);
      setMostrarFormBloqueo(false);
      setNuevoBloqueo({ id_apartamento: '', fecha_inicio: '', fecha_fin: '', motivo: '' });
      setDiasRepeticion({ 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 0: false });
      recargarReservas();
    }
  };

  const handleToggleDia = (diaId) => {
    setDiasRepeticion(prev => ({ ...prev, [diaId]: !prev[diaId] }));
  };

  const handleLogout = async () => { await signOut(); navigate('/login'); };
  
  const reservasAgrupadas = reservas.reduce((acc, reserva) => {
    const nombreDepto = reserva.departamentos?.nombre || 'Sin Depto';
    if (!acc[nombreDepto]) acc[nombreDepto] = [];
    acc[nombreDepto].push(reserva);
    return acc;
  }, {});
  const nombresDeptosOrdenados = Object.keys(reservasAgrupadas).sort();

  if (loading) return <p className="loading-text">Cargando...</p>;
  if (error) return <p className="error-msg">{error}</p>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Panel de Administración</h1>
        <button onClick={handleLogout} className="boton-logout">Cerrar Sesión</button>
      </div>

      <div className="bloqueo-section">
        {!mostrarFormBloqueo ? (
          <button className="btn-crear-bloqueo" onClick={() => setMostrarFormBloqueo(true)}>
            <FaPlus /> Nuevo Turno Fijo / Bloquear Fecha
          </button>
        ) : (
          <div className="form-bloqueo-card">
             <div className="form-header">
                <h3>Bloquear Fechas</h3>
                <button className="btn-close-form" onClick={() => setMostrarFormBloqueo(false)}><FaTimes/></button>
             </div>
             <form onSubmit={handleCrearBloqueo} className="form-bloqueo-grid">
                <div className="input-group">
                  <label>Departamento:</label>
                  <select 
                    value={nuevoBloqueo.id_apartamento} 
                    onChange={(e) => setNuevoBloqueo({...nuevoBloqueo, id_apartamento: e.target.value})}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {deptos.map(d => (
                      /* CORRECCIÓN CLAVE AQUÍ: Usamos d.id_apartamento */
                      <option key={d.id_apartamento} value={d.id_apartamento}>
                        {d.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Desde:</label>
                  <input type="date" value={nuevoBloqueo.fecha_inicio} onChange={(e) => setNuevoBloqueo({...nuevoBloqueo, fecha_inicio: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>Hasta:</label>
                  <input type="date" value={nuevoBloqueo.fecha_fin} onChange={(e) => setNuevoBloqueo({...nuevoBloqueo, fecha_fin: e.target.value})} required />
                </div>
                
                {/* SELECCIÓN DE DÍAS */}
                <div className="input-group dias-semana-group">
                  <label>Repetir solo los días: <small>(Vacío = Todos)</small></label>
                  <div className="dias-checkboxes">
                    {diasLabels.map(dia => (
                      <div key={dia.id} 
                           className={`dia-circle ${diasRepeticion[dia.id] ? 'active' : ''}`}
                           onClick={() => handleToggleDia(dia.id)}>
                        {dia.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="input-group">
                  <label>Motivo:</label>
                  <input type="text" placeholder="Ej: Mantenimiento" value={nuevoBloqueo.motivo} onChange={(e) => setNuevoBloqueo({...nuevoBloqueo, motivo: e.target.value})} />
                </div>
                <button type="submit" className="btn-guardar-bloqueo">Guardar</button>
             </form>
          </div>
        )}
      </div>

      <div className="resumen-container">
        <div className="resumen-header">
          <button onClick={() => cambiarMes(-1)} className="btn-mes-nav"><FaChevronLeft /></button>
          <h3>Resumen: {mesVisualActualCap}</h3>
          <button onClick={() => cambiarMes(1)} className="btn-mes-nav"><FaChevronRight /></button>
        </div>
        <div className="resumen-contenido">
          {Object.keys(datosDelMesActual).length === 0 ? (
            <p className="text-muted text-center">No hay ocupación este mes.</p>
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
      <h2>Listado de Actividad</h2>
      {nombresDeptosOrdenados.length === 0 ? <p className="text-center">No hay actividad.</p> : 
        nombresDeptosOrdenados.map((nombreDepto) => (
          <div key={nombreDepto} className="seccion-depto">
            <h3 className="titulo-seccion-depto">{nombreDepto}</h3>
            <ReservasSlider reservas={reservasAgrupadas[nombreDepto]} onEstadoChange={handleEstadoChange} />
          </div>
        ))
      }
    </div>
  );
};