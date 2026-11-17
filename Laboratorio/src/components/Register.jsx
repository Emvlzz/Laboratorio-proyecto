import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css';

export default function Register() {
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [curso, setCurso] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMsg('');

        try {
            const response = await fetch('http://localhost:3000/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, apellido, curso, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                setMsg('¡Cuenta creada con éxito! Redirigiendo al login...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(data.msg || 'Error al registrar la cuenta');
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
        }
    };

    return (
        <div className="register-wrapper">
            <div className="register-card">
                <div className="register-header">
                    <h2>Crear Cuenta</h2>
                    <p>Regístrate en el sistema de gestión del laboratorio</p>
                </div>

                {error && <div className="register-alert register-alert-error">{error}</div>}
                {msg && <div className="register-alert register-alert-success">{msg}</div>}

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="register-field">
                        <label>Nombre</label>
                        <input 
                            type="text" 
                            value={nombre} 
                            onChange={(e) => setNombre(e.target.value)} 
                            required 
                            placeholder="Tu nombre"
                        />
                    </div>

                    <div className="register-field">
                        <label>Apellido</label>
                        <input 
                            type="text" 
                            value={apellido} 
                            onChange={(e) => setApellido(e.target.value)} 
                            placeholder="Tu apellido"
                        />
                    </div>

                    <div className="register-field">
                        <label>Curso / Aula</label>
                        <input 
                            type="text" 
                            value={curso} 
                            onChange={(e) => setCurso(e.target.value)} 
                            placeholder="Ej: 5° Año Informática"
                        />
                    </div>

                    <div className="register-field">
                        <label>Correo Electrónico</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            placeholder="correo@ejemplo.com"
                        />
                    </div>

                    <div className="register-field">
                        <label>Contraseña</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className="register-btn">Registrarse</button>
                </form>

                <div className="register-footer">
                    <p>¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link></p>
                </div>
            </div>
        </div>
    );
}