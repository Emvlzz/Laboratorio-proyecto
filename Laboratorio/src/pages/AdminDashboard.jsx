import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('usuarios');
    const [usuarios, setUsuarios] = useState([]);
    const [computadoras, setComputadoras] = useState([]);
    const [carritos, setCarritos] = useState([]);
    const [reportes, setReportes] = useState([]);
    const [inventario, setInventario] = useState([]);
    const [bitacora, setBitacora] = useState([]);

    // Formularios Computadoras
    const [compNombre, setCompNombre] = useState('');
    const [compDesc, setCompDesc] = useState('');
    const [selectedCarritoId, setSelectedCarritoId] = useState('');

    // Formularios Carritos
    const [carritoNombre, setCarritoNombre] = useState('');
    const [carritoDesc, setCarritoDesc] = useState('');
    const [carritoCurso, setCarritoCurso] = useState('');

    // Formularios Inventario
    const [invNombre, setInvNombre] = useState('');
    const [invCategoria, setInvCategoria] = useState('');
    const [invCantidad, setInvCantidad] = useState(1);
    const [invUbicacion, setInvUbicacion] = useState('');
    const [invDesc, setInvDesc] = useState('');

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

            const [resUsers, resComps, resCarritos, resReportes, resInventario, resBitacora] = await Promise.all([
                api.get('/Usuarios', headers),
                api.get('/computadoras', headers),
                api.get('/carritos', headers),
                api.get('/reportes', headers),
                api.get('/inventario', headers),
                api.get('/auditoria', headers)
            ]);

            setUsuarios(resUsers.data);
            setComputadoras(resComps.data);
            setCarritos(resCarritos.data);
            setReportes(resReportes.data);
            setInventario(resInventario.data);
            setBitacora(resBitacora.data);

        } catch (err) {
            setError(err.response?.data?.msg || 'Error al cargar los datos');
            if (err.response?.status === 401 || err.response?.status === 403) {
                navigate('/login');
            }
        }
    };

    useEffect(() => {
        const rol = localStorage.getItem('rol');
        if (rol !== 'administrador') {
            alert('Acceso restringido: Esta sección requiere rol de Administrador.');
            navigate('/');
        } else {
            fetchData();
        }
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

    const handleAsignarComputadora = async (userId, computadoraId) => {
        try {
            await api.put(`/Usuarios/${userId}/computadora`, { computadoraId }, getAuthHeaders());
            setMsg('¡Computadora asignada al usuario correctamente!');
            fetchData();
        } catch (err) {
            setError(err.response?.data?.msg || 'Error al asignar la computadora');
        }
    };

    const handleCambiarEstadoReporte = async (idReporte, nuevoEstado) => {
        try {
            await api.put(`/reportes/${idReporte}`, { estado: nuevoEstado }, getAuthHeaders());
            setMsg('¡Estado del reporte actualizado!');
            fetchData();
        } catch (err) {
            setError(err.response?.data?.msg || 'Error al actualizar el estado del reporte');
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

    const handleCreateInventario = async (e) => {
        e.preventDefault();
        try {
            await api.post('/inventario', {
                nombreItem: invNombre,
                categoria: invCategoria,
                cantidad: invCantidad,
                ubicacion: invUbicacion,
                descripcion: invDesc
            }, getAuthHeaders());

            setMsg('¡Artículo de inventario registrado con éxito!');
            setInvNombre('');
            setInvCategoria('');
            setInvCantidad(1);
            setInvUbicacion('');
            setInvDesc('');
            fetchData();
        } catch (err) {
            setError(err.response?.data?.msg || 'Error al registrar artículo');
        }
    };

    return (
        <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '20px' }}>
                <Link
                    to="/"
                    style={{
                        display: 'inline-block',
                        padding: '8px 16px',
                        background: '#6c757d',
                        color: '#fff',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        fontSize: '14px'
                    }}
                >
                    ← Volver al Inicio
                </Link>
            </div>

            <h2>Panel de Administración - Laboratorio</h2>

            {msg && <p style={{ color: 'green', fontWeight: 'bold' }}>{msg}</p>}
            {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

            {/* Pestañas de Navegación */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', borderBottom: '2px solid #ddd', paddingBottom: '10px', flexWrap: 'wrap' }}>
                <button onClick={() => setActiveTab('usuarios')} style={{ padding: '10px 20px', background: activeTab === 'usuarios' ? '#007bff' : '#f8f9fa', color: activeTab === 'usuarios' ? '#fff' : '#333', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>Usuarios</button>
                <button onClick={() => setActiveTab('computadoras')} style={{ padding: '10px 20px', background: activeTab === 'computadoras' ? '#007bff' : '#f8f9fa', color: activeTab === 'computadoras' ? '#fff' : '#333', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>Computadoras</button>
                <button onClick={() => setActiveTab('carritos')} style={{ padding: '10px 20px', background: activeTab === 'carritos' ? '#007bff' : '#f8f9fa', color: activeTab === 'carritos' ? '#fff' : '#333', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>Carritos</button>
                <button onClick={() => setActiveTab('reportes')} style={{ padding: '10px 20px', background: activeTab === 'reportes' ? '#007bff' : '#f8f9fa', color: activeTab === 'reportes' ? '#fff' : '#333', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>Reportes</button>
                <button onClick={() => setActiveTab('inventario')} style={{ padding: '10px 20px', background: activeTab === 'inventario' ? '#007bff' : '#f8f9fa', color: activeTab === 'inventario' ? '#fff' : '#333', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>Inventario</button>
                <button onClick={() => setActiveTab('bitacora')} style={{ padding: '10px 20px', background: activeTab === 'bitacora' ? '#007bff' : '#f8f9fa', color: activeTab === 'bitacora' ? '#fff' : '#333', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>Bitácora</button>
            </div>

            {/* TABLA USUARIOS */}
            {activeTab === 'usuarios' && (
                <div>
                    <h3>Gestión de Usuarios (Alumnos, Profesores y Administradores)</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead>
                            <tr style={{ background: '#f1f1f1', textAlign: 'left' }}>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Nombre</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Apellido</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Curso / Aula</th>
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
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{u.apellido || '-'}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{u.curso || '-'}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{u.credenciales}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                        <span style={{ padding: '3px 8px', borderRadius: '4px', background: u.rol === 'administrador' ? '#ffc107' : '#e2e3e5', fontSize: '12px', textTransform: 'capitalize' }}>
                                            {u.rol}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                        <select
                                            defaultValue={u.computadoraId || ""}
                                            onChange={(e) => handleAsignarComputadora(u.idUsuario, e.target.value)}
                                            style={{ padding: '6px', width: '100%' }}
                                        >
                                            <option value="">-- Sin asignar --</option>
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

            {/* REPORTES */}
            {activeTab === 'reportes' && (
                <div>
                    <h3>Registro de Reportes del Sistema</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead>
                            <tr style={{ background: '#f1f1f1', textAlign: 'left' }}>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Descripción</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Fecha / Hora</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Estado</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportes.map(r => (
                                <tr key={r.idReporte}>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{r.idReporte}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{r.descripcion}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{new Date(r.fecha || r.createdAt).toLocaleString()}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                        <span style={{ 
                                            padding: '4px 8px', 
                                            borderRadius: '4px', 
                                            background: r.estado === 'pendiente' ? '#ffc107' : '#28a745',
                                            color: r.estado === 'pendiente' ? '#000' : '#fff',
                                            fontWeight: 'bold',
                                            fontSize: '12px',
                                            textTransform: 'capitalize'
                                        }}>
                                            {r.estado}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                        <select 
                                            value={r.estado}
                                            onChange={(e) => handleCambiarEstadoReporte(r.idReporte, e.target.value)}
                                            style={{ padding: '6px' }}
                                        >
                                            <option value="pendiente">Pendiente</option>
                                            <option value="completado">Completado</option>
                                        </select>
                                        <button onClick={() => handleDelete('reportes', r.idReporte)} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginLeft: '8px' }}>Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* INVENTARIO */}
            {activeTab === 'inventario' && (
                <div>
                    <h3>Gestión de Inventario del Laboratorio</h3>
                    <form onSubmit={handleCreateInventario} style={{ background: '#f9f9f9', padding: '15px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #e1e1e1' }}>
                        <h4>Registrar Nuevo Artículo / Insumo</h4>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Nombre del Artículo / Componente:</label><br />
                            <input type="text" value={invNombre} onChange={(e) => setInvNombre(e.target.value)} required style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
                            <div style={{ flex: 1 }}>
                                <label>Categoría:</label><br />
                                <input type="text" placeholder="Ej: Periféricos, Cables, Herramientas" value={invCategoria} onChange={(e) => setInvCategoria(e.target.value)} style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ width: '120px' }}>
                                <label>Cantidad:</label><br />
                                <input type="number" min="1" value={invCantidad} onChange={(e) => setInvCantidad(e.target.value)} required style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }} />
                            </div>
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Ubicación / Depósito:</label><br />
                            <input type="text" placeholder="Ej: Armario B, Estante 3" value={invUbicacion} onChange={(e) => setInvUbicacion(e.target.value)} style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Descripción / Observaciones:</label><br />
                            <input type="text" value={invDesc} onChange={(e) => setInvDesc(e.target.value)} style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }} />
                        </div>
                        <button type="submit" style={{ background: '#28a745', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>Guardar en Inventario</button>
                    </form>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead>
                            <tr style={{ background: '#f1f1f1', textAlign: 'left' }}>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Artículo</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Categoría</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Stock / Cantidad</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Ubicación</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Descripción</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventario.map(item => (
                                <tr key={item.idInventario}>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.idInventario}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>{item.nombreItem}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.categoria}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.cantidad}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.ubicacion}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.descripcion || '-'}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                        <button onClick={() => handleDelete('inventario', item.idInventario)} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Eliminar</button>
                                    </td>
                                </tr>
                           ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* BITÁCORA */}
            {activeTab === 'bitacora' && (
                <div>
                    <h3>Bitácora de Accesos y Actividad del Sistema</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead>
                            <tr style={{ background: '#f1f1f1', textAlign: 'left' }}>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Detalle de la Actividad</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Fecha y Hora</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bitacora.map(b => (
                                <tr key={b.idAuditoria}>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{b.idAuditoria}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{b.descripcion}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{new Date(b.fecha || b.createdAt).toLocaleString()}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                        <button onClick={() => handleDelete('auditoria', b.idAuditoria)} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Eliminar</button>
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