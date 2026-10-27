import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Perfil.css';

export default function Perfil() {
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [curso, setCurso] = useState('');
    const [credenciales, setCredenciales] = useState('');
    const [password, setPassword] = useState('');
    const [foto, setFoto] = useState(null); 
    const [fotoActual, setFotoActual] = useState(''); 
    
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const token = localStorage.getItem('token');

    // Cargar los datos del perfil al montar el componente
    useEffect(() => {
        const fetchPerfil = async () => {
            if (!token) {
                console.warn("No hay token, redirigiendo a login...");
                navigate('/login');
                return;
            }

            try {
                console.log("Cargando perfil desde el servidor...");
                const response = await fetch('http://localhost:3000/Usuarios/perfil', {
                    headers: { 
                        'Authorization': `Bearer ${token}` 
                    }
                });
                
                const data = await response.json();
                console.log("Datos recibidos del perfil:", data);

                if (response.ok) {
                    setNombre(data.nombre || '');
                    setApellido(data.apellido || '');
                    setCurso(data.curso || '');
                    setCredenciales(data.credenciales || '');
                    
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
                    }
                }
            } catch (err) {
                console.error('Error de red al cargar perfil:', err);
                setError('Error de conexión con el servidor');
            }
        };

        fetchPerfil();
    }, [token, navigate]);

    // Manejar la actualización del perfil
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("¡Clic en Guardar Cambios detectado! Ejecutando handleSubmit...");
        
        setMsg('');
        setError('');

        try {
            const formData = new FormData();
            formData.append('nombre', nombre);
            formData.append('apellido', apellido);
            formData.append('curso', curso);
            formData.append('credenciales', credenciales);

            if (password.trim() !== '') {
                formData.append('password', password);
            }

            if (foto) {
                formData.append('fotoPerfil', foto);
            }

            console.log("Enviando FormData al servidor...");
            const response = await fetch('http://localhost:3000/Usuarios/perfil', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            console.log("Respuesta del servidor al actualizar:", data);

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

    return (
        <div className="perfil-container">
            <div className="perfil-back-wrapper">
                <Link to="/" className="perfil-back-link">
                    ← Volver al Inicio
                </Link>
            </div>

            <h2 className="perfil-title">Editar Mi Perfil</h2>

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
                    <label>Credencial / Usuario:</label>
                    <input 
                        type="text" 
                        value={credenciales} 
                        onChange={(e) => setCredenciales(e.target.value)} 
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
        </div>
    );
}