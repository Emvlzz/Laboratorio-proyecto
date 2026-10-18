# Resumen del Estado del Proyecto

## Ya Implementado

### Backend
* Autenticacion mediante JWT (almacena ID, rol, credenciales y nombre).
* Encriptacion de contraseñas con bcrypt.
* Middlewares de seguridad: `verificarToken` y `esAdmin`.
* Modelos y relaciones de Sequelize: `Usuario`, `Computadora`, `Carrito`, `Inventario`, `Reporte` y `Auditoria`.
* Rutas y controladores CRUD para Usuarios, Computadoras, Carritos, Inventario, Reportes y Auditoria.
* Ruta para asignacion directa de computadoras a usuarios (`PUT /Usuarios/:id/computadora`).

### Frontend
* Enrutamiento con React Router (`/`, `/login`, `/register`, `/admin`).
* Inicio (`Home.jsx`): Muestra nombre y rol del usuario logueado. Oculta el boton de Administracion a usuarios no administradores.
* Registro (`Register.jsx`): Formulario con campos Nombre, Apellido, Curso, Credenciales, Contraseña y Rol.
* Panel de Administracion (`AdminDashboard.jsx`): Interfaz con pestañas para Usuarios, Computadoras y Carritos, con asignacion de equipos en tiempo real y boton de navegacion al inicio.
* Componentes e interfaz visual para las secciones de Inventario y Reportes.
* Pestaña en el Panel de Administracion para visualizar los registros de Auditoria (bitacora).
---

## Pendiente

### Frontend
* Filtros de busqueda por curso y rol en las tablas de administracion.
* Escribir reportes
* Bitacoras