import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Home() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div style={{ maxWidth: 600, margin: '50px auto', padding: 30, border: '1px solid #ddd', borderRadius: 8, textAlign: 'center', fontFamily: 'sans-serif', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h1>Sistema de Gestión de Laboratorio</h1>
            <p style={{ color: '#666', marginBottom: 30 }}>
                Bienvenido al sistema de control y administración de usuarios, computadoras y carritos.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {token ? (
                    <>
                        <Link 
                            to="/admin" 
                            style={{ padding: '12px', background: '#007bff', color: '#fff', textDecoration: 'none', borderRadius: 4, fontWeight: 'bold' }}
                        >
                            Ir al Panel de Administración
                        </Link>
                        <button 
                            onClick={handleLogout}
                            style={{ padding: '12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            Cerrar Sesión
                        </button>
                    </>
                ) : (
                    <>
                        <Link 
                            to="/login" 
                            style={{ padding: '12px', background: '#28a745', color: '#fff', textDecoration: 'none', borderRadius: 4, fontWeight: 'bold' }}
                        >
                            Iniciar Sesión
                        </Link>
                        <Link 
                            to="/register" 
                            style={{ padding: '12px', background: '#17a2b8', color: '#fff', textDecoration: 'none', borderRadius: 4, fontWeight: 'bold' }}
                        >
                            Registrarse
                        </Link>
                        <Link 
                            to="/admin" 
                            style={{ padding: '12px', background: '#6c757d', color: '#fff', textDecoration: 'none', borderRadius: 4, fontWeight: 'bold' }}
                        >
                            Panel de Administración
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}