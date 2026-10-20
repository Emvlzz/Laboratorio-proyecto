import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // Función para decodificar el token JWT y obtener la información del usuario
    const getUserData = () => {
        try {
            if (!token) return null;
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    };

    const user = getUserData();
    const isAdmin = user?.rol === 'administrador';

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="home-container">
            <div className="home-card">
                <h1 className="home-title">Gestión de Laboratorio</h1>

                {/* Tarjeta de bienvenida con el nombre y rol del usuario actual */}
                {token && user && (
                    <div style={{ marginBottom: '20px', padding: '12px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef', textAlign: 'left' }}>
                        <p style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#2c3e50', fontWeight: 'bold' }}>
                            👋 Hola, {user.nombre}
                        </p>
                        <p style={{ margin: 0, fontSize: '13px', color: '#7f8c8d', textTransform: 'capitalize' }}>
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
                            {/* Botón para editar perfil (Disponible para cualquier usuario logueado) */}
                            <Link to="/perfil" className="btn" style={{ background: '#17a2b8', color: '#fff', textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>
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
            </div>
        </div>
    );
}