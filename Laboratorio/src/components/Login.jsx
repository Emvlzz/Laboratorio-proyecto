import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            
            if (response.ok) {
                // 1. Guardamos el token
                localStorage.setItem('token', data.token);
                
                // 2. GUARDAMOS EL ROL (Esto era lo que faltaba)
                // Dependiendo de cómo lo devuelva tu backend, puede venir en data.usuario.rol o data.rol
                const rolUsuario = data.usuario?.rol || data.rol || 'alumno';
                localStorage.setItem('rol', rolUsuario);

                navigate('/');
            } else {
                setError(data.msg || 'Credenciales inválidas');
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <div className="login-header">
                    <h2>Iniciar Sesión</h2>
                    <p>Accede al sistema de gestión de laboratorio</p>
                </div>

                {error && <div className="login-alert">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-field">
                        <label>Correo Electrónico</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            placeholder="correo@ejemplo.com"
                        />
                    </div>

                    <div className="login-field">
                        <label>Contraseña</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className="login-btn">Entrar</button>
                </form>

                <div className="login-footer">
                    <p>¿No tienes una cuenta? <Link to="/register">Regístrate</Link></p>
                </div>
            </div>
        </div>
    );
}