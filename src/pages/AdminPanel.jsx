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

    // 1. Cargar todas las reservas
    async function fetchReservas() {
        setLoading(true);
        const { data, error } = await supabase
            .from('reservas')
            .select('*, departamentos(nombre)')
            .order('fecha_inicio', { ascending: true });

        if (error) {
            setError('Error al cargar las reservas.');
        } else {
            setReservas(data);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchReservas();
    }, []);

    // 2. Función para cambiar el estado
    const handleEstadoChange = async (id, nuevoEstado) => {
        if (nuevoEstado === 'Cancelada') {
            if (!window.confirm('¿Seguro que quieres CANCELAR esta reserva? Se liberará la fecha.')) {
                return;
            }
        }

        const { error } = await supabase
            .from('reservas')
            .update({ estado: nuevoEstado })
            .eq('id_reserva', id);

        if (error) {
            alert('Error al actualizar el estado.');
        } else {
            fetchReservas();
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

            <div className="reservas-lista">
                {reservas.map((reserva) => (
                    <div key={reserva.id_reserva} className={`reserva-card estado-${reserva.estado.toLowerCase()}`}>
                        <h4>Reserva #{reserva.id_reserva} - {reserva.departamentos.nombre}</h4>
                        <p><strong>Cliente:</strong> {reserva.nombre_completo}</p>
                        <p><strong>Check-in:</strong> {reserva.fecha_inicio}</p>
                        <p><strong>Check-out:</strong> {reserva.fecha_fin}</p>
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