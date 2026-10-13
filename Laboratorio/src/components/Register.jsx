import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [curso, setCurso] = useState('');
    const [credenciales, setCredenciales] = useState('');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState('alumno');
    
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setMsg('');

        try {
            // Asegúrate de que la ruta coincida con la de tu backend (ej. /auth/register o /Usuarios/register)
            await api.post('/auth/register', {
                nombre,
                apellido,
                curso,
                credenciales,
                password,
                rol
            });

            setMsg('¡Registro exitoso! Redirigiendo al inicio de sesión...');
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.msg || 'Error al intentar registrar el usuario');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', fontFamily: 'sans-serif' }}>
            <div style={{ background: '#ffffff', padding: '40px', borderRadius: '12px', boxScroll: '0 8px 24px rgba(0,0,0,0.1)', width: '100%', maxWidth: '450px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '20px' }}>Registro de Usuario</h2>

                {error && <p style={{ color: 'red', background: '#f8d7da', padding: '10px', borderRadius: '4px', fontSize: '14px', textAlign: 'center' }}>{error}</p>}
                {msg && <p style={{ color: 'green', background: '#d4edda', padding: '10px', borderRadius: '4px', fontSize: '14px', textAlign: 'center' }}>{msg}</p>}

                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Nombre:</label>
                        <input 
                            type="text" 
                            value={nombre} 
                            onChange={(e) => setNombre(e.target.value)} 
                            required 
                            style={{ width: '100%', padding: '10px', marginTop: '5px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }} 
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Apellido:</label>
                        <input 
                            type="text" 
                            value={apellido} 
                            onChange={(e) => setApellido(e.target.value)} 
                            required 
                            style={{ width: '100%', padding: '10px', marginTop: '5px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }} 
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Curso / Aula:</label>
                        <input 
                            type="text" 
                            value={curso} 
                            onChange={(e) => setCurso(e.target.value)} 
                            placeholder="Ej: 3° Año Informática" 
                            style={{ width: '100%', padding: '10px', marginTop: '5px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }} 
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Credencial (Email / Usuario):</label>
                        <input 
                            type="text" 
                            value={credenciales} 
                            onChange={(e) => setCredenciales(e.target.value)} 
                            required 
                            style={{ width: '100%', padding: '10px', marginTop: '5px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }} 
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Contraseña:</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            style={{ width: '100%', padding: '10px', marginTop: '5px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }} 
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Rol:</label>
                        <select 
                            value={rol} 
                            onChange={(e) => setRol(e.target.value)} 
                            style={{ width: '100%', padding: '10px', marginTop: '5px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px', background: '#fff' }}
                        >
                            <option value="alumno">Alumno</option>
                            <option value="profesor">Profesor</option>
                            <option value="administrador">Administrador</option>
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        style={{ background: '#17a2b8', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}
                    >
                        Registrarse
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <Link to="/login" style={{ color: '#007bff', textDecoration: 'none', fontSize: '14px' }}>
                        ¿Ya tienes cuenta? Inicia sesión aquí
                    </Link>
                    <br />
                    <Link to="/" style={{ color: '#6c757d', textDecoration: 'none', fontSize: '13px', display: 'inline-block', marginTop: '10px' }}>
                        ← Volver al Inicio
                    </Link>
                </div>
            </div>
        </div>
    );
}