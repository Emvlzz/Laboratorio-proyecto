import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('rol', res.data.rol);
            localStorage.setItem('nombre', res.data.nombre);
            navigate('/'); // Redirige al Home
        } catch (err) {
            setError(err.response?.data?.msg || 'Error al iniciar sesión');
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '50px auto', padding: 25, border: '1px solid #ddd', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' }}>
            <h2>Iniciar Sesión</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 15 }}>
                    <label>Correo Electrónico:</label><br />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: 15 }}>
                    <label>Contraseña:</label><br />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} />
                </div>
                <button type="submit" style={{ width: '100%', padding: 10, background: '#007bff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Entrar</button>
            </form>
            <p style={{ marginTop: 15, textAlign: 'center' }}>
                ¿No tienes una cuenta? <Link to="/register" style={{ color: '#007bff' }}>Regístrate aquí</Link>
            </p>
        </div>
    );
}