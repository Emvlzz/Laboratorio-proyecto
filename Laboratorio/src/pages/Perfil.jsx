import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Perfil.css';

export default function Perfil() {
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [curso, setCurso] = useState('');
    const [credenciales, setCredenciales] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    // Cargar los datos actualizados del perfil desde la ruta correcta del backend
    useEffect(() => {
        const fetchPerfil = async () => {
            try {
                const response = await api.get('/Usuarios/perfil', getAuthHeaders());
                const data = response.data;
                setNombre(data.nombre || '');
                setApellido(data.apellido || '');
                setCurso(data.curso || '');
                setCredenciales(data.credenciales || '');
            } catch (err) {
                setError(err.response?.data?.msg || 'Error al cargar los datos del perfil');
                if (err.response?.status === 401 || err.response?.status === 403) {
                    navigate('/login');
                }
            }
        };

        fetchPerfil();
    }, [navigate]);

    // Manejar la actualización del perfil
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg('');
        setError('');

        try {
            const bodyData = {
                nombre,
                apellido,
                curso,
                credenciales
            };

            // Solo enviamos la contraseña si el usuario escribió una nueva
            if (password.trim() !== '') {
                bodyData.password = password;
            }

            await api.put('/Usuarios/perfil', bodyData, getAuthHeaders());
            setMsg('¡Perfil actualizado con éxito!');
            setPassword('');
        } catch (err) {
            setError(err.response?.data?.msg || 'Error al actualizar el perfil');
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