import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('usuarios');
    const [usuarios, setUsuarios] = useState([]);
    const [computadoras, setComputadoras] = useState([]);
    const [carritos, setCarritos] = useState([]);
    
    // Formularios Computadoras
    const [compNombre, setCompNombre] = useState('');
    const [compDesc, setCompDesc] = useState('');
    const [selectedCarritoId, setSelectedCarritoId] = useState('');

    // Formularios Carritos
    const [carritoNombre, setCarritoNombre] = useState('');
    const [carritoDesc, setCarritoDesc] = useState('');
    const [carritoCurso, setCarritoCurso] = useState('');

    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const fetchData = async () => {
        try {
            setMsg('');
            setError('');
            const headers = getAuthHeaders();
            
            const [resUsers, resComps, resCarritos] = await Promise.all([
                api.get('/Usuarios', headers),
                api.get('/computadoras', headers),
                api.get('/carritos', headers)
            ]);

            setUsuarios(resUsers.data);
            setComputadoras(resComps.data);
            setCarritos(resCarritos.data);
        } catch (err) {
            setError(err.response?.data?.msg || 'Error al cargar los datos');
            if (err.response?.status === 401 || err.response?.status === 403) {
                navigate('/login');
            }
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (endpoint, id) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este elemento?')) return;
        try {
            await api.delete(`/${endpoint}/${id}`, getAuthHeaders());
            setMsg('¡Elemento eliminado con éxito!');
            fetchData();
        } catch (err) {
            setError(err.response?.data?.msg || 'Error al intentar eliminar');
        }
    };

    // Asignar computadora a un usuario
    const handleAsignarComputadora = async (userId, computadoraId) => {
        try {
            await api.put(`/Usuarios/${userId}/computadora`, { computadoraId }, getAuthHeaders());
            setMsg('¡Computadora asignada al usuario correctamente!');
            fetchData();
        } catch (err) {
            setError(err.response?.data?.msg || 'Error al asignar la computadora');
        }
    };

    const handleCreateComputadora = async (e) => {
        e.preventDefault();
        try {
            await api.post('/computadoras', { 
                nombre: compNombre, 
                descripcion: compDesc, 
                carritoId: selectedCarritoId || null 
            }, getAuthHeaders());
            
            setMsg('¡Computadora creada con éxito!');
            setCompNombre('');
            setCompDesc('');
            setSelectedCarritoId('');
            fetchData();
        } catch (err) {
            setError(err.response?.data?.msg || 'Error al crear la computadora');
        }
    };

    const handleCreateCarrito = async (e) => {
        e.preventDefault();
        try {
            await api.post('/carritos', { 
                nombre: carritoNombre, 
                descripcion: carritoDesc, 
                curso: carritoCurso 
            }, getAuthHeaders());
            
            setMsg('¡Carrito creado con éxito!');
            setCarritoNombre('');
            setCarritoDesc('');
            setCarritoCurso('');
            fetchData();
        } catch (err) {
            setError(err.response?.data?.msg || 'Error al crear el carrito');
        }
    };

    return (
        <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '1100px', margin: '0 auto' }}>
            <h2>Panel de Administración - Laboratorio</h2>
            
            {msg && <p style={{ color: 'green', fontWeight: 'bold' }}>{msg}</p>}
            {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

            {/* Pestañas */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>
                <button onClick={() => setActiveTab('usuarios')} style={{ padding: '10px 20px', background: activeTab === 'usuarios' ? '#007bff' : '#f8f9fa', color: activeTab === 'usuarios' ? '#fff' : '#333', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>Usuarios</button>
                <button onClick={() => setActiveTab('computadoras')} style={{ padding: '10px 20px', background: activeTab === 'computadoras' ? '#007bff' : '#f8f9fa', color: activeTab === 'computadoras' ? '#fff' : '#333', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>Computadoras</button>
                <button onClick={() => setActiveTab('carritos')} style={{ padding: '10px 20px', background: activeTab === 'carritos' ? '#007bff' : '#f8f9fa', color: activeTab === 'carritos' ? '#fff' : '#333', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>Carritos</button>
            </div>

            {/* TABLA USUARIOS (Con asignación de computadora) */}
            {activeTab === 'usuarios' && (
                <div>
                    <h3>Gestión de Usuarios y Asignación de Equipos</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead>
                            <tr style={{ background: '#f1f1f1', textAlign: 'left' }}>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Nombre</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Credencial</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Rol</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Computadora Asignada</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map(u => (
                                <tr key={u.idUsuario}>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{u.nombre}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{u.credenciales}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                        <span style={{ padding: '3px 8px', borderRadius: '4px', background: u.rol === 'administrador' ? '#ffc107' : '#e2e3e5', fontSize: '12px' }}>
                                            {u.rol}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                        <select 
                                            defaultValue={u.computadoraId || ""} 
                                            onChange={(e) => handleAsignarComputadora(u.idUsuario, e.target.value)}
                                            style={{ padding: '6px', width: '100%' }}
                                        >
                                            <option value="">-- Sin computadora asignada --</option>
                                            {computadoras.map(c => (
                                                <option key={c.idComputadora} value={c.idComputadora}>
                                                    {c.nombre} {c.carrito ? `(Carrito: ${c.carrito.nombre})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                        <button onClick={() => handleDelete('Usuarios', u.idUsuario)} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* COMPUTADORAS */}
            {activeTab === 'computadoras' && (
                <div>
                    <h3>Gestión de Computadoras</h3>
                    <form onSubmit={handleCreateComputadora} style={{ background: '#f9f9f9', padding: '15px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #e1e1e1' }}>
                        <h4>Añadir Nueva Computadora</h4>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Nombre / Identificador:</label><br />
                            <input type="text" value={compNombre} onChange={(e) => setCompNombre(e.target.value)} required style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Descripción:</label><br />
                            <input type="text" value={compDesc} onChange={(e) => setCompDesc(e.target.value)} style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Asignar a Carrito:</label><br />
                            <select value={selectedCarritoId} onChange={(e) => setSelectedCarritoId(e.target.value)} style={{ width: '100%', padding: '6px' }}>
                                <option value="">-- Sin Carrito Asignado --</option>
                                {carritos.map(car => (
                                    <option key={car.idCarrito} value={car.idCarrito}>
                                        {car.nombre} (Curso: {car.curso})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" style={{ background: '#28a745', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>Guardar Computadora</button>
                    </form>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead>
                            <tr style={{ background: '#f1f1f1', textAlign: 'left' }}>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Nombre</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Carrito Asignado</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {computadoras.map(c => (
                                <tr key={c.idComputadora}>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{c.idComputadora}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{c.nombre}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                        {c.carrito ? `${c.carrito.nombre} (Curso: ${c.carrito.curso})` : 'Sin asignar'}
                                    </td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                        <button onClick={() => handleDelete('computadoras', c.idComputadora)} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* CARRITOS */}
            {activeTab === 'carritos' && (
                <div>
                    <h3>Gestión de Carritos</h3>
                    <form onSubmit={handleCreateCarrito} style={{ background: '#f9f9f9', padding: '15px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #e1e1e1' }}>
                        <h4>Añadir Nuevo Carrito</h4>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Nombre del Carrito:</label><br />
                            <input type="text" value={carritoNombre} onChange={(e) => setCarritoNombre(e.target.value)} required style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Curso / Aula Asignada:</label><br />
                            <input type="text" value={carritoCurso} onChange={(e) => setCarritoCurso(e.target.value)} required placeholder="Ej: 3° Año Informática" style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Descripción:</label><br />
                            <input type="text" value={carritoDesc} onChange={(e) => setCarritoDesc(e.target.value)} style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }} />
                        </div>
                        <button type="submit" style={{ background: '#28a745', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>Guardar Carrito</button>
                    </form>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead>
                            <tr style={{ background: '#f1f1f1', textAlign: 'left' }}>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Nombre</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Curso / Aula</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {carritos.map(car => (
                                <tr key={car.idCarrito}>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{car.idCarrito}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{car.nombre}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{car.curso}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                        <button onClick={() => handleDelete('carritos', car.idCarrito)} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}