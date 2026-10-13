import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState('alumno');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', { nombre, email, password, rol });
            setMsg('¡Registro exitoso! Ya puedes iniciar sesión.');
            setError('');
        } catch (err) {
            setError(err.response?.data?.msg || 'Error en el registro');
            setMsg('');
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '50px auto', padding: 25, border: '1px solid #ddd', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' }}>
            <h2>Registro de Usuario</h2>
            {msg && <p style={{ color: 'green' }}>{msg}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 15 }}>
                    <label>Nombre:</label><br />
                    <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: 15 }}>
                    <label>Correo Electrónico:</label><br />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: 15 }}>
                    <label>Contraseña:</label><br />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: 15 }}>
                    <label>Rol:</label><br />
                    <select value={rol} onChange={(e) => setRol(e.target.value)} style={{ width: '100%', padding: 8 }}>
                        <option value="alumno">Alumno</option>
                        <option value="profesor">Profesor</option>
                        <option value="administrador">Administrador</option>
                    </select>
                </div>
                <button type="submit" style={{ width: '100%', padding: 10, background: '#28a745', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Registrarse</button>
            </form>
            <p style={{ marginTop: 15, textAlign: 'center' }}>
                ¿Ya tienes una cuenta? <Link to="/login" style={{ color: '#007bff' }}>Inicia sesión</Link>
            </p>
        </div>
    );
}