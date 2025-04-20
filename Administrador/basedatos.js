// db.js
const mysql = require('mysql2');

// Configuración de la conexión a la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',        // Cambia esto si tu usuario es diferente
    password: '',        // La contraseña por defecto de XAMPP está vacía
    database: 'administrador' // Cambia esto al nombre de tu base de datos
});

// Conectar a la base de datos
db.connect(err => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
});

// Exportar la conexión para usarla en otros archivos
module.exports = db;
