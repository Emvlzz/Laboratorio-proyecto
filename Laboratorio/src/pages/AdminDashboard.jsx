import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import './AdminDashboard.css';

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
        <div className="dashboard-container">
            <div className="dashboard-back-wrapper">
                <Link to="/" className="dashboard-back-link">
                    ← Volver al Inicio
                </Link>
            </div>

            <h2 className="dashboard-title">Panel de Administración - Laboratorio</h2>

            {msg && <p className="msg-success">{msg}</p>}
            {error && <p className="msg-error">{error}</p>}

            {/* Pestañas de Navegación */}
            <div className="dashboard-tabs">
                <button onClick={() => setActiveTab('usuarios')} className={`tab-btn ${activeTab === 'usuarios' ? 'active' : 'inactive'}`}>Usuarios</button>
                <button onClick={() => setActiveTab('computadoras')} className={`tab-btn ${activeTab === 'computadoras' ? 'active' : 'inactive'}`}>Computadoras</button>
                <button onClick={() => setActiveTab('carritos')} className={`tab-btn ${activeTab === 'carritos' ? 'active' : 'inactive'}`}>Carritos</button>
                <button onClick={() => setActiveTab('reportes')} className={`tab-btn ${activeTab === 'reportes' ? 'active' : 'inactive'}`}>Reportes</button>
                <button onClick={() => setActiveTab('inventario')} className={`tab-btn ${activeTab === 'inventario' ? 'active' : 'inactive'}`}>Inventario</button>
                <button onClick={() => setActiveTab('bitacora')} className={`tab-btn ${activeTab === 'bitacora' ? 'active' : 'inactive'}`}>Bitácora</button>
            </div>

            {/* TABLA USUARIOS */}
            {activeTab === 'usuarios' && (
                <div>
                    <h3>Gestión de Usuarios (Alumnos, Profesores y Administradores)</h3>
                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Apellido</th>
                                <th>Curso / Aula</th>
                                <th>Credencial</th>
                                <th>Rol</th>
                                <th>Computadora Asignada</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map(u => (
                                <tr key={u.idUsuario}>
                                    <td>{u.nombre}</td>
                                    <td>{u.apellido || '-'}</td>
                                    <td>{u.curso || '-'}</td>
                                    <td>{u.credenciales}</td>
                                    <td>
                                        <span className={u.rol === 'administrador' ? 'badge-admin' : 'badge-user'}>
                                            {u.rol}
                                        </span>
                                    </td>
                                    <td>
                                        <select
                                            defaultValue={u.computadoraId || ""}
                                            onChange={(e) => handleAsignarComputadora(u.idUsuario, e.target.value)}
                                            className="form-control"
                                        >
                                            <option value="">-- Sin asignar --</option>
                                            {computadoras.map(c => (
                                                <option key={c.idComputadora} value={c.idComputadora}>
                                                    {c.nombre} {c.carrito ? `(Carrito: ${c.carrito.nombre})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <button onClick={() => handleDelete('Usuarios', u.idUsuario)} className="btn-danger-custom">Eliminar</button>
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
                    <form onSubmit={handleCreateComputadora} className="dashboard-form">
                        <h4>Añadir Nueva Computadora</h4>
                        <div className="form-group">
                            <label>Nombre / Identificador:</label><br />
                            <input type="text" value={compNombre} onChange={(e) => setCompNombre(e.target.value)} required className="form-control" />
                        </div>
                        <div className="form-group">
                            <label>Descripción:</label><br />
                            <input type="text" value={compDesc} onChange={(e) => setCompDesc(e.target.value)} className="form-control" />
                        </div>
                        <div className="form-group">
                            <label>Asignar a Carrito:</label><br />
                            <select value={selectedCarritoId} onChange={(e) => setSelectedCarritoId(e.target.value)} className="form-control">
                                <option value="">-- Sin Carrito Asignado --</option>
                                {carritos.map(car => (
                                    <option key={car.idCarrito} value={car.idCarrito}>
                                        {car.nombre} (Curso: {car.curso})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="btn-success-custom">Guardar Computadora</button>
                    </form>

                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Carrito Asignado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {computadoras.map(c => (
                                <tr key={c.idComputadora}>
                                    <td>{c.idComputadora}</td>
                                    <td>{c.nombre}</td>
                                    <td>
                                        {c.carrito ? `${c.carrito.nombre} (Curso: ${c.carrito.curso})` : 'Sin asignar'}
                                    </td>
                                    <td>
                                        <button onClick={() => handleDelete('computadoras', c.idComputadora)} className="btn-danger-custom">Eliminar</button>
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
                    <form onSubmit={handleCreateCarrito} className="dashboard-form">
                        <h4>Añadir Nuevo Carrito</h4>
                        <div className="form-group">
                            <label>Nombre del Carrito:</label><br />
                            <input type="text" value={carritoNombre} onChange={(e) => setCarritoNombre(e.target.value)} required className="form-control" />
                        </div>
                        <div className="form-group">
                            <label>Curso / Aula Asignada:</label><br />
                            <input type="text" value={carritoCurso} onChange={(e) => setCarritoCurso(e.target.value)} required placeholder="Ej: 3° Año Informática" className="form-control" />
                        </div>
                        <div className="form-group">
                            <label>Descripción:</label><br />
                            <input type="text" value={carritoDesc} onChange={(e) => setCarritoDesc(e.target.value)} className="form-control" />
                        </div>
                        <button type="submit" className="btn-success-custom">Guardar Carrito</button>
                    </form>

                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Curso / Aula</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {carritos.map(car => (
                                <tr key={car.idCarrito}>
                                    <td>{car.idCarrito}</td>
                                    <td>{car.nombre}</td>
                                    <td>{car.curso}</td>
                                    <td>
                                        <button onClick={() => handleDelete('carritos', car.idCarrito)} className="btn-danger-custom">Eliminar</button>
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
                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Descripción</th>
                                <th>Fecha / Hora</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportes.map(r => (
                                <tr key={r.idReporte}>
                                    <td>{r.idReporte}</td>
                                    <td>{r.descripcion}</td>
                                    <td>{new Date(r.fecha || r.createdAt).toLocaleString()}</td>
                                    <td>
                                        <span className={r.estado === 'pendiente' ? 'badge-reporte-pendiente' : 'badge-reporte-completado'}>
                                            {r.estado}
                                        </span>
                                    </td>
                                    <td>
                                        <select 
                                            value={r.estado}
                                            onChange={(e) => handleCambiarEstadoReporte(r.idReporte, e.target.value)}
                                            style={{ padding: '6px' }}
                                        >
                                            <option value="pendiente">Pendiente</option>
                                            <option value="completado">Completado</option>
                                        </select>
                                        <button onClick={() => handleDelete('reportes', r.idReporte)} className="btn-danger-custom" style={{ marginLeft: '8px' }}>Eliminar</button>
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
                    <form onSubmit={handleCreateInventario} className="dashboard-form">
                        <h4>Registrar Nuevo Artículo / Insumo</h4>
                        <div className="form-group">
                            <label>Nombre del Artículo / Componente:</label><br />
                            <input type="text" value={invNombre} onChange={(e) => setInvNombre(e.target.value)} required className="form-control" />
                        </div>
                        <div className="form-row">
                            <div style={{ flex: 1 }}>
                                <label>Categoría:</label><br />
                                <input type="text" placeholder="Ej: Periféricos, Cables, Herramientas" value={invCategoria} onChange={(e) => setInvCategoria(e.target.value)} className="form-control" />
                            </div>
                            <div style={{ width: '120px' }}>
                                <label>Cantidad:</label><br />
                                <input type="number" min="1" value={invCantidad} onChange={(e) => setInvCantidad(e.target.value)} required className="form-control" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Ubicación / Depósito:</label><br />
                            <input type="text" placeholder="Ej: Armario B, Estante 3" value={invUbicacion} onChange={(e) => setInvUbicacion(e.target.value)} className="form-control" />
                        </div>
                        <div className="form-group">
                            <label>Descripción / Observaciones:</label><br />
                            <input type="text" value={invDesc} onChange={(e) => setInvDesc(e.target.value)} className="form-control" />
                        </div>
                        <button type="submit" className="btn-success-custom">Guardar en Inventario</button>
                    </form>

                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Artículo</th>
                                <th>Categoría</th>
                                <th>Stock / Cantidad</th>
                                <th>Ubicación</th>
                                <th>Descripción</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventario.map(item => (
                                <tr key={item.idInventario}>
                                    <td>{item.idInventario}</td>
                                    <td style={{ fontWeight: 'bold' }}>{item.nombreItem}</td>
                                    <td>{item.categoria}</td>
                                    <td>{item.cantidad}</td>
                                    <td>{item.ubicacion}</td>
                                    <td>{item.descripcion || '-'}</td>
                                    <td>
                                        <button onClick={() => handleDelete('inventario', item.idInventario)} className="btn-danger-custom">Eliminar</button>
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
                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Detalle de la Actividad</th>
                                <th>Fecha y Hora</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bitacora.map(b => (
                                <tr key={b.idAuditoria}>
                                    <td>{b.idAuditoria}</td>
                                    <td>{b.descripcion}</td>
                                    <td>{new Date(b.fecha || b.createdAt).toLocaleString()}</td>
                                    <td>
                                        <button onClick={() => handleDelete('auditoria', b.idAuditoria)} className="btn-danger-custom">Eliminar</button>
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