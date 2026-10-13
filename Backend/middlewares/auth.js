const jwt = require('jsonwebtoken');

// Asegúrate de usar la misma clave secreta que definiste en tus rutas de autenticación
const JWT_SECRET = 'tu_clave_secreta_super_segura';

const miMiddleware = (req, res, next) => {
    try {
        // 1. Obtener el encabezado de autorización
        const authHeader = req.headers['authorization'];
        
        if (!authHeader) {
            return res.status(401).json({ msg: 'Acceso denegado. No se proporcionó un token.' });
        }

        // 2. El formato esperado es "Bearer <token>", extraemos la segunda parte
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ msg: 'Formato de token inválido.' });
        }

        // 3. Verificar y decodificar el token
        const decoded = jwt.verify(token, JWT_SECRET);

        // 4. Guardamos los datos del usuario decodificados en req.user para usarlos en las rutas
        req.user = decoded;

        // 5. Dejar pasar al siguiente controlador o ruta
        next();
    } catch (error) {
        console.error("Error en la autenticación del token:", error.message);
        return res.status(403).json({ msg: 'Token inválido o expirado.', error: error.message });
    }
};

module.exports = miMiddleware;