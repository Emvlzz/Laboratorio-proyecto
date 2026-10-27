import React, { useState } from 'react';
import './FormularioReporte.css'; // Opcional para tus estilos

function FormularioReporte({ onReporteCreado }) {
    const [descripcion, setDescripcion] = useState('');
    const [computadoraId, setComputadoraId] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje('');
        setError('');

        const token = localStorage.getItem('token'); // Obtenemos el token del usuario logueado

        if (!token) {
            setError('No estás autenticado. Por favor, inicia sesión.');
            return;
        }

        try {
            const respuesta = await fetch('http://localhost:3000/reportes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    descripcion,
                    computadoraId: computadoraId ? Number(computadoraId) : null
                })
            });

            const data = await respuesta.json();

            if (respuesta.ok) {
                setMensaje('¡Reporte enviado con éxito!');
                setDescripcion('');
                setComputadoraId('');
                if (onReporteCreado) onReporteCreado(); // Para actualizar la lista si la tienes cerca
            } else {
                setError(data.msg || 'Error al enviar el reporte.');
            }
        } catch (err) {
            console.error('Error de red:', err);
            setError('Error de conexión con el servidor.');
        }
    };

    return (
        <div className="reporte-form-container" style={{ padding: '20px', background: '#f9f9f9', borderRadius: '8px', maxWidth: '400px', margin: '20px auto' }}>
            <h3>Reportar una Incidencia</h3>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>ID de Computadora (Opcional):</label>
                    <input 
                        type="number" 
                        value={computadoraId}
                        onChange={(e) => setComputadoraId(e.target.value)}
                        placeholder="Ej: 1, 2, 3..."
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Descripción del problema:</label>
                    <textarea 
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        placeholder="Describe detalladamente qué le pasa a la máquina..."
                        rows="4"
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>

                <button type="submit" style={{ background: '#007bff', color: 'white', border: 'none', padding: '10px 15px', cursor: 'pointer', width: '100%', borderRadius: '4px' }}>
                    Enviar Reporte
                </button>
            </form>

            {mensaje && <p style={{ color: 'green', marginTop: '10px' }}>{mensaje}</p>}
            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        </div>
    );
}

export default FormularioReporte;