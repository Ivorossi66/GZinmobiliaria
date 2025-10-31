import React, { useState, useEffect } from 'react';
import  supabase  from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminPanel.css';

export const AdminPanel = () => {
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { signOut } = useAuth();
    const navigate = useNavigate();

    // --- NUEVO ESTADO PARA EL RESUMEN ---
    const [fechasPorMes, setFechasPorMes] = useState({});

    // --- NUEVA FUNCIÓN PARA PROCESAR FECHAS ---
    const procesarFechasOcupadas = (reservasData) => {
        const fechasAgrupadas = {};
        // Formato de mes y año (ej: "Octubre 2025")
        const monthFormat = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' });

        for (const reserva of reservasData) {
            let currentDate = new Date(reserva.fecha_inicio + 'T00:00:00Z');
            const endDate = new Date(reserva.fecha_fin + 'T00:00:00Z');

            while (currentDate < endDate) {
                // Obtiene el nombre del mes (ej: "Octubre 2025")
                const monthYear = monthFormat.format(currentDate);
                // Capitaliza el nombre (ej: "octubre" -> "Octubre")
                const monthYearCapitalized = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);

                const day = currentDate.getUTCDate();

                // Si el mes no existe en el objeto, lo crea
                if (!fechasAgrupadas[monthYearCapitalized]) {
                    fechasAgrupadas[monthYearCapitalized] = new Set();
                }
                // Añade el día al Set (un Set evita días duplicados)
                fechasAgrupadas[monthYearCapitalized].add(day);

                // Avanza al siguiente día
                currentDate.setUTCDate(currentDate.getUTCDate() + 1);
            }
        }

        const fechasOrdenadas = {};
        for (const month in fechasAgrupadas) {
            fechasOrdenadas[month] = [...fechasAgrupadas[month]].sort((a, b) => a - b);
        }

        setFechasPorMes(fechasOrdenadas);
    };

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

    // 2. Función para cambiar el estado (Modificada para borrado suave o permanente)
    const handleEstadoChange = async (id, nuevoEstado) => {
        if (nuevoEstado === 'Cancelada') {
            if (!window.confirm('¿Seguro que quieres CANCELAR esta reserva? Se liberará la fecha.')) {
                return;
            }

            const { error } = await supabase
                .from('reservas')
                .update({ estado: 'Cancelada' }) 
                .eq('id_reserva', id);

            if (error) {
                alert('Error al actualizar el estado.');
            } else {
                fetchReservas();
            }
        } else {
            
            const { error } = await supabase
                .from('reservas')
                .update({ estado: nuevoEstado })
                .eq('id_reserva', id);

            if (error) {
                alert('Error al actualizar el estado.');
            } else {
                fetchReservas();
            }
        }
    };


    // 3. Función de Logout
    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    if (loading) return <p>Cargando reservas...</p>;
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
            <div className="resumen-mensual">
                <h3>Resumen de Fechas Ocupadas</h3>
                {Object.keys(fechasPorMes).length === 0 ? (
                    <p>No hay fechas ocupadas registradas.</p>
                ) : (
                    Object.entries(fechasPorMes).map(([mes, dias]) => (
                        <div key={mes} className="mes-resumen">
                            <h4>{mes}</h4>
                            <div className="dias-lista">
                                {dias.map(dia => (
                                    <span key={dia} className="dia-ocupado">{dia}</span>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
            {/* --- FIN RESUMEN MENSUAL --- */}

            <hr className="admin-divider" />

            <div className="reservas-lista">
                <h2>Listado de Reservas</h2>
                {reservas.map((reserva) => (
                    <div key={reserva.id_reserva} className={`reserva-card estado-${reserva.estado.toLowerCase()}`}>
                        <h4>Reserva #{reserva.id_reserva} - {reserva.departamentos.nombre}</h4>
                        <p><strong>Cliente:</strong> {reserva.nombre_completo}</p>
                        <p><strong>Check-in:</strong> {reserva.fecha_inicio}</p>
                        <p><strong>Check-out:</strong> {reserva.fecha_fin}</p>
                        <p><strong>Personas:</strong> {reserva.cantidad_personas}</p>
                        <p><strong>Monto Seña:</strong> ${reserva.monto_seña.toLocaleString('es-AR')}</p>
                        <p><strong>Estado Actual:</strong> {reserva.estado}</p>

                        <div className="botones-accion">
                            {reserva.estado === 'Pendiente' && (
                                <>
                                    <button
                                        onClick={() => handleEstadoChange(reserva.id_reserva, 'Confirmada')}
                                        className="btn-confirmar">
                                        Confirmar (Pago Recibido)
                                    </button>
                                    <button
                                        onClick={() => handleEstadoChange(reserva.id_reserva, 'Cancelada')}
                                        className="btn-cancelar">
                                        Cancelar
                                    </button>
                                </>
                            )}
                            {reserva.estado === 'Confirmada' && (
                                <button
                                    onClick={() => handleEstadoChange(reserva.id_reserva, 'Cancelada')}
                                    className="btn-cancelar">
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};