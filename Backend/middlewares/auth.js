const jwt = require('jsonwebtoken');


const JWT_SECRET = process.env.JWT_SECRET || 'mordekaiser';

const verificarToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        
        if (!authHeader) {
            return res.status(401).json({ msg: 'Acceso denegado. No se proporcionó un token.' });
        }

        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ msg: 'Formato de token inválido.' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Error en la autenticación del token:", error.message);
        return res.status(403).json({ msg: 'Token inválido o expirado.', error: error.message });
    }
};

// 2. Middleware para validar si el usuario es administrador
const esAdmin = (req, res, next) => {
    if (req.user && req.user.rol === 'administrador') {
        next();
    } else {
        return res.status(403).json({ msg: 'Acceso denegado. Se requiere rol de administrador.' });
    }
};


module.exports = {
    verificarToken,
    esAdmin
};