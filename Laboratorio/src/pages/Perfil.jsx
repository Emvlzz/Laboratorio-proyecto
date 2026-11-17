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
    const [miCompu, setMiCompu] = useState(null);
    
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchPerfilYCompu = async () => {
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/Usuarios/perfil', {
                    headers: { 'Authorization': `Bearer ${token}` }
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

                const resCompu = await fetch('http://localhost:3000/Usuarios/mi-computadora', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const compuData = await resCompu.json();
                if (compuData.asignada) {
                    setMiCompu(compuData.computadora);
                }
            } catch (err) {
                console.error('Error de red:', err);
                setError('Error de conexión con el servidor');
            }
        };

        fetchPerfilYCompu();
    }, [token, navigate]);

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
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                setMsg('¡Perfil actualizado con éxito!');
                setPassword('');
                setFoto(null);

                if (data.usuario && data.usuario.fotoPerfil) {
                    const urlCompleta = data.usuario.fotoPerfil.startsWith('http') 
                        ? data.usuario.fotoPerfil 
                        : `http://localhost:3000/${data.usuario.fotoPerfil}`;
                    setFotoActual(urlCompleta);
                }
            } else {
                setError(data.msg || 'Error al actualizar el perfil');
            }
        } catch (err) {
            setError('Error de conexión al enviar los datos');
        }
    };

    const handleSolicitarRecuperacion = async () => {
        if (!email) {
            setError('No se encontró un correo electrónico válido.');
            return;
        }
        try {
            const response = await fetch('http://localhost:3000/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            if (response.ok) setMsg('Se ha enviado un correo de recuperación a tu casilla.');
            else setError(data.msg || 'Error al solicitar recuperación.');
        } catch (err) {
            setError('Error de conexión.');
        }
    };

    const handleEliminarCuenta = async () => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar tu cuenta permanentemente?')) return;

        try {
            const responsePerfil = await fetch('http://localhost:3000/Usuarios/perfil', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const userData = await responsePerfil.json();

            const response = await fetch(`http://localhost:3000/Usuarios/${userData.idUsuario}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                localStorage.clear();
                alert('Cuenta eliminada con éxito.');
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
        <div className="perfil-page-wrapper">
            <div className="perfil-page-container">
                <nav className="perfil-nav">
                    <Link to="/" className="perfil-back-link">
                        ← Volver al Inicio
                    </Link>
                </nav>

                <header className="perfil-header">
                    <h2>Mi Perfil y Configuración</h2>
                    <p>Gestiona tu información personal, seguridad y equipos asignados</p>
                </header>

                {msg && <div className="perfil-alert perfil-alert-success">{msg}</div>}
                {error && <div className="perfil-alert perfil-alert-error">{error}</div>}

                <div className="perfil-layout-grid">
                    {/* Formulario Principal */}
                    <form onSubmit={handleSubmit} className="perfil-card">
                        <h3>Información Personal</h3>
                        
                        <div className="perfil-avatar-box">
                            {fotoActual ? (
                                <img src={fotoActual} alt="Avatar" className="perfil-avatar-img" />
                            ) : (
                                <div className="perfil-avatar-placeholder">Sin foto</div>
                            )}
                            <div className="perfil-avatar-upload">
                                <label>Cambiar foto de perfil</label>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => setFoto(e.target.files[0])} 
                                />
                            </div>
                        </div>

                        <div className="perfil-field">
                            <label>Nombre</label>
                            <input 
                                type="text" 
                                value={nombre} 
                                onChange={(e) => setNombre(e.target.value)} 
                                required 
                            />
                        </div>

                        <div className="perfil-field">
                            <label>Apellido</label>
                            <input 
                                type="text" 
                                value={apellido} 
                                onChange={(e) => setApellido(e.target.value)} 
                            />
                        </div>

                        <div className="perfil-field">
                            <label>Curso / Aula</label>
                            <input 
                                type="text" 
                                value={curso} 
                                onChange={(e) => setCurso(e.target.value)} 
                            />
                        </div>

                        <div className="perfil-field">
                            <label>Correo Electrónico</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                        </div>

                        <div className="perfil-field">
                            <label>Nueva Contraseña</label>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                placeholder="Dejar en blanco para mantener la actual" 
                            />
                        </div>

                        <button type="submit" className="perfil-btn perfil-btn-primary">
                            Guardar Cambios
                        </button>
                    </form>

                    {/* Columna Lateral */}
                    <aside className="perfil-aside">
                        <section className="perfil-card">
                            <h3>Mi Computadora Asignada</h3>
                            {miCompu ? (
                                <div className="perfil-compu-details">
                                    <p><strong>Equipo:</strong> {miCompu.nombre}</p>
                                    <p><strong>Carrito:</strong> {miCompu.carrito ? miCompu.carrito.nombre : 'Sin Carrito'}</p>
                                    <p>
                                        <strong>Estado:</strong>{' '}
                                        <span className={`perfil-badge ${(miCompu.estado || 'disponible').replace(/\s+/g, '-')}`}>
                                            {miCompu.estado || 'disponible'}
                                        </span>
                                    </p>
                                </div>
                            ) : (
                                <p className="perfil-muted">No tienes ninguna computadora asignada actualmente.</p>
                            )}
                        </section>

                        <section className="perfil-card">
                            <h3>Seguridad y Cuenta</h3>
                            <div className="perfil-actions-stack">
                                <button 
                                    type="button" 
                                    className="perfil-btn perfil-btn-secondary"
                                    onClick={handleSolicitarRecuperacion}
                                >
                                    Recuperar Contraseña
                                </button>

                                <button 
                                    type="button" 
                                    className="perfil-btn perfil-btn-danger"
                                    onClick={handleEliminarCuenta}
                                >
                                    Eliminar mi Cuenta
                                </button>
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </div>
    );
}