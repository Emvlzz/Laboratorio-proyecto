import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import './Login.css';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg('');
        setError('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, nuevaPassword: password })
            });

            const data = await response.json();

            if (response.ok) {
                setMsg('¡Contraseña restablecida con éxito! Redirigiendo al login...');
                setTimeout(() => {
                    navigate('/login');
                }, 2500);
            } else {
                setError(data.msg || 'El enlace es inválido o ha expirado.');
            }
        } catch (err) {
            setError('Error de conexión con el servidor.');
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <div className="login-header">
                    <h2>Restablecer Contraseña</h2>
                    <p>Ingresa tu nueva contraseña para acceder al sistema</p>
                </div>

                {error && <div className="login-alert" style={{ backgroundColor: '#fde7e9', color: '#a80000', border: '1px solid #f9c2c6', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '13px' }}>{error}</div>}
                {msg && <div className="login-alert" style={{ backgroundColor: '#dff6dd', color: '#107c10', border: '1px solid #b8e6b4', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '13px' }}>{msg}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-field">
                        <label>Nueva Contraseña</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="login-field">
                        <label>Confirmar Nueva Contraseña</label>
                        <input 
                            type="password" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            required 
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className="login-btn">Actualizar Contraseña</button>
                </form>

                <div className="login-footer">
                    <p><Link to="/login">Volver al inicio de sesión</Link></p>
                </div>
            </div>
        </div>
    );
}