import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import './Home.css';

// Conectamos con el backend de Socket.io
const socket = io('http://localhost:3000');

export default function Home() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // Estado principal del usuario
    const [user, setUser] = useState(null);

    // --- Estados para el manejo de reportes ---
    const [reportes, setReportes] = useState([]);
    const [descripcion, setDescripcion] = useState('');
    const [computadoraId, setComputadoraId] = useState('');
    const [mensajeReporte, setMensajeReporte] = useState('');
    const [errorReporte, setErrorReporte] = useState('');

    // Cargar datos frescos del usuario desde la base de datos
    const cargarDatosUsuario = async () => {
        if (!token) return;
        try {
            const response = await fetch('http://localhost:3000/Usuarios/perfil', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setUser(data);
            }
        } catch (err) {
            console.error('Error al cargar datos del usuario:', err);
        }
    };

    const cargarMisReportes = async () => {
        if (!token) return;
        try {
            const respuesta = await fetch('http://localhost:3000/reportes', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await respuesta.json();
            if (respuesta.ok) {
                setReportes(data);
            }
        } catch (err) {
            console.error('Error al cargar reportes:', err);
        }
    };

    useEffect(() => {
        if (token) {
            cargarDatosUsuario();
            cargarMisReportes();
        } else {
            navigate('/login');
        }
    }, [token, navigate]);

    // Escuchar cambios de perfil en tiempo real por WebSockets
    useEffect(() => {
        const handleUsuarioActualizado = (usuarioModificado) => {
            if (user) {
                const currentId = user.id || user.idUsuario;
                const modifiedId = usuarioModificado.id || usuarioModificado.idUsuario;

                if (currentId === modifiedId) {
                    setUser((prevUser) => ({
                        ...prevUser,
                        nombre: usuarioModificado.nombre,
                        apellido: usuarioModificado.apellido,
                        fotoPerfil: usuarioModificado.fotoPerfil
                    }));
                }
            }
        };

        socket.on('usuarioActualizado', handleUsuarioActualizado);

        return () => {
            socket.off('usuarioActualizado', handleUsuarioActualizado);
        };
    }, [user]);

    const isAdmin = user?.rol === 'administrador';

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleCrearReporte = async (e) => {
        e.preventDefault();
        setMensajeReporte('');
        setErrorReporte('');

        try {
            const idCompParsed = computadoraId.trim() !== '' ? Number(computadoraId) : null;

            const respuesta = await fetch('http://localhost:3000/reportes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    descripcion,
                    computadoraId: idCompParsed
                })
            });

            const data = await respuesta.json();

            if (respuesta.ok) {
                setMensajeReporte('¡Reporte enviado con éxito!');
                setDescripcion('');
                setComputadoraId('');
                cargarMisReportes();
            } else {
                setErrorReporte(data.msg || 'Error al enviar el reporte.');
            }
        } catch (err) {
            console.error('Error de red:', err);
            setErrorReporte('Error de conexión con el servidor.');
        }
    };

    return (
        <div className="home-container">
            <div className="home-card home-card-wide">
                <h1 className="home-title">Gestión de Laboratorio</h1>

                {token && user && (
                    <div className="user-welcome-box">
                        {user.fotoPerfil ? (
                            <img 
                                src={user.fotoPerfil.startsWith('http') ? user.fotoPerfil : `http://localhost:3000/${user.fotoPerfil}`} 
                                alt="Foto de perfil" 
                                className="user-avatar"
                            />
                        ) : (
                            <div className="user-avatar-placeholder">
                                Sin foto
                            </div>
                        )}

                        <p className="user-welcome-title">
                            👋 Hola, {user.nombre} {user.apellido || ''}
                        </p>
                        <p className="user-welcome-role">
                            Rol: <strong>{user.rol}</strong>
                        </p>
                    </div>
                )}

                <p className="home-subtitle">
                    Sistema integral de control para usuarios, computadoras y carritos de equipos.
                </p>

                <div className="home-actions">
                    {token ? (
                        <>
                            <Link to="/perfil" className="btn btn-profile">
                                Editar Perfil
                            </Link>

                            {isAdmin && (
                                <Link to="/admin" className="btn btn-admin">
                                    Panel de Administración
                                </Link>
                            )}
                            <button onClick={handleLogout} className="btn btn-danger">
                                Cerrar Sesión
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-success">
                                Iniciar Sesión
                            </Link>
                            <Link to="/register" className="btn btn-info">
                                Registrarse
                            </Link>
                        </>
                    )}
                </div>

                {/* --- SECCIÓN DE REPORTES --- */}
                {token && (
                    <div className="reportes-section">
                        
                        {/* 1. Crear nuevo reporte */}
                        <div className="reporte-form-box">
                            <h3>Hacer nuevo reporte</h3>
                            <form onSubmit={handleCrearReporte}>
                                <div className="form-group">
                                    <label>ID de Computadora (Opcional):</label>
                                    <input 
                                        type="number" 
                                        value={computadoraId}
                                        onChange={(e) => setComputadoraId(e.target.value)}
                                        placeholder="Ej: 1, 2, 3..."
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Descripción del problema:</label>
                                    <textarea 
                                        value={descripcion}
                                        onChange={(e) => setDescripcion(e.target.value)}
                                        placeholder="Describe la falla detalladamente..."
                                        rows="3"
                                        required
                                    />
                                </div>

                                <button type="submit" className="btn btn-success btn-full">
                                    Enviar Reporte
                                </button>
                            </form>

                            {mensajeReporte && <p className="msg-success">{mensajeReporte}</p>}
                            {errorReporte && <p className="msg-error">{errorReporte}</p>}
                        </div>

                        {/* 2. Ver mis reportes */}
                        <div className="mis-reportes-box">
                            <h3>Mis reportes</h3>
                            {reportes.length === 0 ? (
                                <p className="no-reports-text">No has realizado ningún reporte todavía.</p>
                            ) : (
                                <ul className="reportes-list">
                                    {reportes.map((rep) => (
                                        <li key={rep.idReporte || rep.id} className="reporte-item">
                                            <p><strong>PC:</strong> {rep.computadora ? rep.computadora.nombre : 'General / No especificada'}</p>
                                            <p><strong>Descripción:</strong> {rep.descripcion}</p>
                                            <p>
                                                <strong>Estado:</strong>{' '}
                                                <span className={`estado-badge ${rep.estado === 'pendiente' ? 'pendiente' : 'resuelto'}`}>
                                                    {rep.estado}
                                                </span>
                                            </p>
                                            <small className="reporte-date">Fecha: {new Date(rep.createdAt).toLocaleDateString()}</small>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                    </div>
                )}

            </div>
        </div>
    );
}