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

                {/* Tarjeta de bienvenida con nombre y rol del usuario actual */}
                {token && user && (
                    <div className="user-welcome-box">
                        <p className="user-welcome-title">
                            👋 Hola, {user.nombre}
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
                            {/* Botón para editar perfil (Disponible para cualquier usuario logueado) */}
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
            </div>
        </div>
    );
}