import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Perfil.css';

export default function Perfil() {
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [curso, setCurso] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [foto, setFoto] = useState(null); 
    const [fotoActual, setFotoActual] = useState(''); 
    
    // Estados para la computadora asignada
    const [miCompu, setMiCompu] = useState(null);
    const [estadoCompu, setEstadoCompu] = useState('');
    
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const token = localStorage.getItem('token');

    // Cargar los datos del perfil y la computadora al montar el componente
    useEffect(() => {
        const fetchPerfilYCompu = async () => {
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                // 1. Cargar datos del perfil
                const response = await fetch('http://localhost:3000/Usuarios/perfil', {
                    headers: { 
                        'Authorization': `Bearer ${token}` 
                    }
                });
                
                const data = await response.json();

                if (response.ok) {
                    setNombre(data.nombre || '');
                    setApellido(data.apellido || '');
                    setCurso(data.curso || '');
                    setEmail(data.email || '');
                    
                    if (data.fotoPerfil) {
                        const urlFoto = data.fotoPerfil.startsWith('http') 
                            ? data.fotoPerfil 
                            : `http://localhost:3000/${data.fotoPerfil}`;
                        setFotoActual(urlFoto);
                    }
                } else {
                    setError(data.msg || 'Error al cargar los datos del perfil');
                    if (response.status === 401 || response.status === 403) {
                        navigate('/login');
                        return;
                    }
                }

                // 2. Cargar computadora asignada al usuario
                const resCompu = await fetch('http://localhost:3000/Usuarios/mi-computadora', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const compuData = await resCompu.json();
                if (compuData.asignada) {
                    setMiCompu(compuData.computadora);
                    setEstadoCompu(compuData.computadora.estado || 'disponible');
                }

            } catch (err) {
                console.error('Error de red al cargar perfil o computadora:', err);
                setError('Error de conexión con el servidor');
            }
        };

        fetchPerfilYCompu();
    }, [token, navigate]);

    // Manejar la actualización del perfil
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg('');
        setError('');

        try {
            const formData = new FormData();
            formData.append('nombre', nombre);
            formData.append('apellido', apellido);
            formData.append('curso', curso);
            formData.append('email', email);

            if (password.trim() !== '') {
                formData.append('password', password);
            }

            if (foto) {
                formData.append('fotoPerfil', foto);
            }

            const response = await fetch('http://localhost:3000/Usuarios/perfil', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                setMsg('¡Perfil actualizado con éxito!');
                setPassword('');
                setFoto(null);

                if (data.usuario && data.usuario.fotoPerfil) {
                    const rutaDevuelta = data.usuario.fotoPerfil;
                    const urlCompleta = rutaDevuelta.startsWith('http') 
                        ? rutaDevuelta 
                        : `http://localhost:3000/${rutaDevuelta}`;
                    setFotoActual(urlCompleta);
                }
            } else {
                setError(data.msg || 'Error al actualizar el perfil');
            }
        } catch (err) {
            console.error('Error crítico en handleSubmit:', err);
            setError('Error de conexión al enviar los datos');
        }
    };

    // Función para cambiar el estado de la computadora asignada
    const handleCambiarEstadoPC = async (nuevoEstado) => {
        setMsg('');
        setError('');
        try {
            const res = await fetch('http://localhost:3000/Usuarios/mi-computadora/estado', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ nuevoEstado })
            });
            const data = await res.json();
            if (res.ok) {
                setEstadoCompu(nuevoEstado);
                setMsg('¡Estado de la computadora actualizado con éxito!');
            } else {
                setError(data.msg || 'Error al cambiar el estado de la PC');
            }
        } catch (err) {
            setError('Error de conexión al actualizar el estado.');
        }
    };

    // Función para solicitar la recuperación de contraseña
    const handleSolicitarRecuperacion = async () => {
        if (!email) {
            setError('No se encontró un correo electrónico válido para la recuperación.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            if (response.ok) {
                setMsg('Se ha enviado un correo de recuperación a tu casilla.');
            } else {
                setError(data.msg || 'Error al solicitar la recuperación.');
            }
        } catch (err) {
            setError('Error de conexión al solicitar recuperación.');
        }
    };

    // Función para eliminar la cuenta propia
    const handleEliminarCuenta = async () => {
        if (!window.confirm('¿Estás completamente seguro de que deseas eliminar tu cuenta permanentemente? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            const responsePerfil = await fetch('http://localhost:3000/Usuarios/perfil', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const userData = await responsePerfil.json();
            const userId = userData.idUsuario;

            const response = await fetch(`http://localhost:3000/Usuarios/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                localStorage.clear();
                alert('Tu cuenta ha sido eliminada con éxito.');
                navigate('/login');
            } else {
                const data = await response.json();
                setError(data.msg || 'No se pudo eliminar la cuenta.');
            }
        } catch (err) {
            setError('Error al intentar eliminar la cuenta.');
        }
    };

    return (
        <div className="perfil-container">
            <div className="perfil-back-wrapper">
                <Link to="/" className="perfil-back-link">
                    ← Volver al Inicio
                </Link>
            </div>

            <h2 className="perfil-title">Mi Perfil y Configuración</h2>

            {msg && <p className="msg-success">{msg}</p>}
            {error && <p className="msg-error">{error}</p>}

            <form onSubmit={handleSubmit} className="perfil-form">
                
                <div className="form-group" style={{ textAlign: 'center', marginBottom: '20px' }}>
                    {fotoActual ? (
                        <img 
                            src={fotoActual} 
                            alt="Foto de perfil" 
                            style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px', border: '2px solid #ddd' }} 
                        />
                    ) : (
                        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#e9ecef', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', color: '#6c757d', fontWeight: 'bold' }}>
                            Sin foto
                        </div>
                    )}
                    <br />
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Cambiar foto de perfil:</label>
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setFoto(e.target.files[0])} 
                        className="form-control" 
                    />
                </div>

                <div className="form-group">
                    <label>Nombre:</label>
                    <input 
                        type="text" 
                        value={nombre} 
                        onChange={(e) => setNombre(e.target.value)} 
                        required 
                        className="form-control" 
                    />
                </div>

                <div className="form-group">
                    <label>Apellido:</label>
                    <input 
                        type="text" 
                        value={apellido} 
                        onChange={(e) => setApellido(e.target.value)} 
                        className="form-control" 
                    />
                </div>

                <div className="form-group">
                    <label>Curso / Aula:</label>
                    <input 
                        type="text" 
                        value={curso} 
                        onChange={(e) => setCurso(e.target.value)} 
                        className="form-control" 
                    />
                </div>

                <div className="form-group">
                    <label>Correo Electrónico (Email):</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        className="form-control" 
                    />
                </div>

                <div className="form-group">
                    <label>Nueva Contraseña (dejar en blanco para no cambiar):</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="••••••••" 
                        className="form-control" 
                    />
                </div>

                <button type="submit" className="btn-submit">
                    Guardar Cambios
                </button>
            </form>

            {/* SECCIÓN COMPUTADORA ASIGNADA */}
            <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #c3cfe2', borderRadius: '8px', background: '#f8f9fa' }}>
                <h3 style={{ color: '#2c3e50', marginTop: 0 }}>💻 Mi Computadora Asignada</h3>
                {miCompu ? (
                    <div>
                        <p><strong>Equipo:</strong> {miCompu.nombre}</p>
                        <p><strong>Carrito:</strong> {miCompu.carrito ? `${miCompu.carrito.nombre} (Curso: ${miCompu.carrito.curso})` : 'Sin Carrito'}</p>
                        <p>
                            <strong>Estado Actual:</strong>{' '}
                            <span style={{ 
                                padding: '4px 8px', 
                                borderRadius: '4px', 
                                fontWeight: 'bold',
                                color: '#fff',
                                background: estadoCompu === 'disponible' ? '#28a745' : estadoCompu === 'en uso' ? '#007bff' : '#dc3545'
                            }}>
                                {estadoCompu.toUpperCase()}
                            </span>
                        </p>

                        <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button 
                                type="button" 
                                onClick={() => handleCambiarEstadoPC('en uso')}
                                style={{ background: '#007bff', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Marcar En Uso
                            </button>

                            <button 
                                type="button" 
                                onClick={() => handleCambiarEstadoPC('disponible')}
                                style={{ background: '#28a745', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Marcar Disponible / Libre
                            </button>

                            <button 
                                type="button" 
                                onClick={() => handleCambiarEstadoPC('mantenimiento')}
                                style={{ background: '#ffc107', color: '#000', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Reportar Mantenimiento
                            </button>
                        </div>
                    </div>
                ) : (
                    <p style={{ color: '#6c757d' }}>No tienes ninguna computadora asignada actualmente por el administrador.</p>
                )}
            </div>

            {/* Botones adicionales de cuenta */}
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button 
                    type="button" 
                    onClick={handleSolicitarRecuperacion}
                    style={{ background: '#17a2b8', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Recuperar Contraseña por Correo
                </button>

                <button 
                    type="button" 
                    onClick={handleEliminarCuenta}
                    style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Eliminar mi Cuenta
                </button>
            </div>
        </div>
    );
}