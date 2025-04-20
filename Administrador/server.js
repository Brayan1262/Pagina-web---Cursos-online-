// server.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require("cors");
const nodemailer = require('nodemailer');
const multer = require("multer");
const db = require('./basedatos'); // Importar la conexión desde db.js
const app = express();
const PORT = 3030;
const upload = multer({ dest: "uploads/" });
const fs = require("fs");
const sharp = require("sharp");
const phpExpress = require('php-express')({
    bin: 'php',  // El binario de PHP. Asegúrate de tener PHP instalado
    index: 'pago.php', // Ruta por defecto para archivos PHP
});
const bcrypt = require("bcryptjs");
const moment = require("moment"); // Para manejar fechas fácilmente

app.use(cors());
// Middleware para parsear JSON y datos de formulario
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configurar la ruta estática para las carpetas 'login', 'Administrador' y 'Administrar-supremo'
app.use(express.static(path.join(__dirname, 'login')));
app.use('/imagenes', express.static(path.join(__dirname, 'imagenes')));
app.use('/Administrar-normal', express.static(path.join(__dirname, 'Administrar-normal')));
app.use('/Administrar-supremo', express.static(path.join(__dirname, 'Administrar-supremo')));

// Usar php-express para manejar archivos PHP
app.use('/php', phpExpress.router);  // Esta ruta manejará las peticiones PHP
// Ruta para servir el archivo login.html en la raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login', 'login.html'));
});

// Servir archivos estáticos si es necesario (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'Proyecto_Cursos_Web')));
app.use(express.static(path.join(__dirname, 'NEXUS_ACADEMY')));

//Login administrador
app.post("/login", (req, res) => {
    const { username, password } = req.body;
  
    // Consulta para obtener el hash de la contraseña del usuario
    db.query( "SELECT nombrecompleto, correo, tipo_administrador, password FROM administrador WHERE username = ?", [username], (err, results) => {
        if (err) {
          return res.json({ success: false, message: "Error en la consulta" });
        }
  
        if (results.length > 0) {
            const { nombrecompleto, correo, tipo_administrador, password: hash, } = results[0];
    
            // Comparar la contraseña ingresada con el hash almacenado
            bcrypt.compare(password, hash, (err, isMatch) => {
                if (err) {
                return res.json({
                    success: false,
                    message: "Error al verificar la contraseña",
                });
                }
    
                if (isMatch) {
                // Contraseña válida, redirigir según el tipo de administrador
                if (tipo_administrador === "administrador") {
                    res.json({
                    success: true,
                    message: "Inicio de sesión exitoso",
                    redirectUrl: "/Administrar-normal/administrador.html",
                    nombrecompleto,
                    correo,
                    tipo_administrador,
                    });
                } else if (tipo_administrador === "super administrador") {
                    res.json({
                    success: true,
                    message: "Inicio de sesión exitoso",
                    redirectUrl: "/Administrar-supremo/administradorsupremo.html",
                    nombrecompleto,
                    correo,
                    tipo_administrador,
                    });
                }
            } else {
              // Contraseña incorrecta
              res.json({ success: false, message: "Credenciales incorrectas" });
            }
          });
        } else {
          // Usuario no encontrado
          res.json({ success: false, message: "Credenciales incorrectas" });
        }
    });
});

// Endpoint para actualizar el perfil
app.post("/editar-perfil", upload.single("foto"), async (req, res) => {
    const { nombrecompleto, correo, tipo_administrador } = req.body;
    let foto = null;

    // Si se ha subido una imagen, procesarla
    if (req.file) {
        const imagePath = req.file.path;
        const filename = `${Date.now()}-${req.file.originalname.split('.')[0]}.webp`;
        const outputPath = path.join(__dirname, '/imagenes', filename);

        try {
            // Convertir la imagen a WebP
            await sharp(imagePath)
                .webp()
                .toFile(outputPath);
            foto = filename; // Guardar el nombre de la nueva imagen en WebP
        } catch (error) {
            console.error("Error al convertir la imagen:", error);
            return res.status(500).json({ success: false, message: "Error al convertir la imagen." });
        }
    }

    const query = `
        UPDATE administrador
        SET nombrecompleto = ?, correo = ?, tipo_administrador = ?, foto = ?
        WHERE id = ? AND estado = 'S'
    `;

    db.query(
        query,
        [nombrecompleto, correo, tipo_administrador, foto, req.session.userId], // Suponiendo que el id está almacenado en la sesión
        (err, results) => {
            if (err) {
                console.error("Error al actualizar el perfil:", err);
                return res.status(500).json({ success: false, message: "Error al actualizar el perfil." });
            }

            res.json({
                success: true,
                message: "Perfil actualizado exitosamente.",
                foto: foto || null, // Devolver la nueva foto si se subió
            });
        }
    );
});

// Ruta para agregar una nueva ruta
app.post('/agregar-area', (req, res) => {
    const { nombreArea } = req.body;

    // Inserción en la base de datos con todos los nuevos campos, incluyendo estado
    db.query(
        'INSERT INTO areas (nombre_area, estado) VALUES (?, ?)',
        [ nombreArea, 'S'],
        (err, results) => {
            if (err) {
                console.error('Error al insertar en la base de datos:', err);
                return res.json({ success: false, message: 'Error al agregar la ruta' });
            }
            res.json({ success: true, message: 'Ruta agregada exitosamente' });
        }
    );
});

// Ruta para obtener los administradores activos
app.get('/obtener-areas', (req, res) => {
    db.query('SELECT id, nombre_area FROM areas WHERE estado = "S"', (err, results) => {
        if (err) {
            console.error('Error al obtener areas:', err);
            return res.json({ success: false, message: 'Error al obtener datos' });
        }
        res.json({ success: true, areas: results });
    });
});

// Ruta para obtener detalles de un administrador específico
app.get('/obtener-area/:id', (req, res) => {
    const id = req.params.id;
    db.query(
        'SELECT id, nombre_area FROM areas WHERE id = ?',
        [id],
        (err, results) => {
            if (err) {
                console.error('Error al obtener los detalles del administrador:', err);
                return res.json({ success: false, message: 'Error al obtener datos' });
            }
            if (results.length > 0) {
                res.json({ success: true, area: results[0] });
            } else {
                res.json({ success: false, message: 'Administrador no encontrado' });
            }
        }
    );
});

// Ruta para actualizar un administrador
app.put('/editar-area/:id', (req, res) => {
    const { id } = req.params;
    const { nombreArea } = req.body;

    // Imprimir los datos recibidos para verificar
    console.log('Datos recibidos para actualizar:', { id, nombreArea });

    db.query(
        'UPDATE areas SET nombre_area = ? WHERE id = ?',
        [nombreArea, id],
        (err, results) => {
            if (err) {
                console.error('Error al actualizar el area:', err);
                return res.json({ success: false, message: 'Error al actualizar area' });
            }

            // Verificar si la consulta afectó alguna fila
            if (results.affectedRows === 0) {
                return res.json({ success: false, message: 'No se encontró el administrador para area' });
            }

            res.json({ success: true, message: 'Area actualizado exitosamente' });
        }
    );
});

// Ruta para actualizar el estado del administrador a 'N'
app.post('/eliminar-area', (req, res) => {
    const { id } = req.body;

    db.query(
        'UPDATE areas SET estado = "N" WHERE id = ?',
        [id],
        (err, results) => {
            if (err) {
                console.error('Error al actualizar el estado del area:', err);
                return res.json({ success: false, message: 'Error al eliminar area' });
            }
            res.json({ success: true, message: 'Area eliminado exitosamente' });
        }
    );
});

// Ruta para agregar un nuevo administrador
app.post("/agregar-administrador", (req, res) => {
    const { nombre, genero, correo, telefono, fecha, ciudad, pais, username, password, tipoAdministrador, } = req.body;
  
    // Generar hash para la contraseña antes de la inserción
    bcrypt.hash(password, 8, (err, hash) => {
        if (err) {
            console.error("Error al encriptar la contraseña:", err);
            return res.json({
            success: false,
            message: "Error al procesar la solicitud",
            });
        }
  
      // Inserción en la base de datos con la contraseña encriptada
      db.query(
        "INSERT INTO administrador (username, password, tipo_administrador, nombrecompleto, genero, correo, telefono, fecha_nacimiento, ciudad, pais, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [ username, hash, tipoAdministrador, nombre, genero, correo, telefono, fecha, ciudad, pais, "S", ], (err, results) => {
            if (err) {
                console.error("Error al insertar en la base de datos:", err);
                return res.json({
                success: false,
                message: "Error al agregar administrador",
                });
            }
    
            // Configurar los detalles del correo
            const mailOptions = {
                from: "graypadilla6@gmail.com", // Coloca tu correo
                to: correo, // Aquí se envía al correo del usuario que se está creando
                subject: "Bienvenido/a a la plataforma",
                text: `Hola ${nombre},\n\nSe ha creado tu cuenta exitosamente.\n\nTu contraseña temporal es: ${password}\n\nPor favor, cámbiala después de iniciar sesión.\n\nSaludos,\nEl equipo`,
            };
    
            // Enviar el correo electrónico
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                console.error("Error al enviar el correo:", error);
                return res.json({
                    success: false,
                    message: "Usuario agregado, pero no se pudo enviar el correo",
                });
                }
                console.log("Correo enviado:", info.response);
                res.json({
                success: true,
                message: "Usuario agregado y correo enviado exitosamente",
                });
            });
        });
    });
});

// Ruta para obtener los administradores activos
app.get('/obtener-administradores', (req, res) => {
    db.query('SELECT id, username, nombrecompleto, correo FROM administrador WHERE estado = "S"', (err, results) => {
        if (err) {
            console.error('Error al obtener administradores:', err);
            return res.json({ success: false, message: 'Error al obtener datos' });
        }
        res.json({ success: true, administradores: results });
    });
});

// Ruta para obtener detalles de un administrador específico
app.get('/obtener-administrador/:id', (req, res) => {
    const id = req.params.id;
    db.query(
        'SELECT id, username, nombrecompleto, genero, correo, telefono, fecha_nacimiento, ciudad, pais FROM administrador WHERE id = ?',
        [id],
        (err, results) => {
            if (err) {
                console.error('Error al obtener los detalles del administrador:', err);
                return res.json({ success: false, message: 'Error al obtener datos' });
            }
            if (results.length > 0) {
                res.json({ success: true, administrador: results[0] });
            } else {
                res.json({ success: false, message: 'Administrador no encontrado' });
            }
        }
    );
});

// Ruta para actualizar un administrador
app.put('/editar-administrador/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, correo, telefono, ciudad, pais } = req.body;

    // Imprimir los datos recibidos para verificar
    console.log('Datos recibidos para actualizar:', { id, nombre, correo, telefono, ciudad, pais });

    db.query(
        'UPDATE administrador SET nombrecompleto = ?, correo = ?, telefono = ?, ciudad = ?, pais = ? WHERE id = ?',
        [nombre, correo, telefono, ciudad, pais, id],
        (err, results) => {
            if (err) {
                console.error('Error al actualizar el administrador:', err);
                return res.json({ success: false, message: 'Error al actualizar administrador' });
            }

            // Verificar si la consulta afectó alguna fila
            if (results.affectedRows === 0) {
                return res.json({ success: false, message: 'No se encontró el administrador para actualizar' });
            }

            res.json({ success: true, message: 'Administrador actualizado exitosamente' });
        }
    );
});

// Ruta para actualizar el estado del administrador a 'N'
app.post('/eliminar-administrador', (req, res) => {
    const { id } = req.body;

    db.query(
        'UPDATE administrador SET estado = "N" WHERE id = ?',
        [id],
        (err, results) => {
            if (err) {
                console.error('Error al actualizar el estado del administrador:', err);
                return res.json({ success: false, message: 'Error al eliminar administrador' });
            }
            res.json({ success: true, message: 'Administrador eliminado exitosamente' });
        }
    );
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'graypadilla6@gmail.com', // Coloca tu correo
        pass: 'onde brig pkbb lxct'     // Coloca la contraseña o App Password si usas autenticación en dos pasos
    },
    tls: {
        rejectUnauthorized: false // Permite conexiones inseguras (no recomendado en producción)
    }
});

// Ruta para agregar un nuevo usuario
app.post("/agregar-usuario", (req, res) => {
    const { nombre, apellidos, genero, correo, telefono, fecha, plan, beca, ciudad, pais, username, password, } = req.body;

    // Validar que los campos requeridos estén presentes
    if (!username || !password || !correo || !nombre) {
        return res.json({
        success: false,
        message: "Por favor, completa todos los campos obligatorios",
        });
    }

    // Generar el hash de la contraseña
    bcrypt.hash(password, 8, (err, hashedPassword) => {
    if (err) {
      console.error("Error al generar el hash de la contraseña:", err);
      return res.json({
        success: false,
        message: "Error al procesar la contraseña",
      });
    }

    // Inserción en la base de datos con la contraseña hasheada
    db.query(
      "INSERT INTO usuarios (username, password, nombres, apellidos, genero, correo, telefono, fecha_nacimiento, plan, beca, ciudad, pais, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [ username, hashedPassword, nombre, apellidos, genero, correo, telefono, fecha, plan, beca, ciudad, pais, "S", ],
      (err, results) => {
        if (err) {
          console.error("Error al insertar en la base de datos:", err);
          return res.json({
            success: false,
            message: "Error al agregar usuario",
          });
        }

        // Configurar los detalles del correo
        const mailOptions = {
          from: "graypadilla6@gmail.com", // Coloca tu correo
          to: correo, // Correo del usuario creado
          subject: "Bienvenido/a a la plataforma",
          text: `Hola ${nombre},\n\nSe ha creado tu cuenta exitosamente.\n\nTu contraseña es: ${password}\n\nPor razones de seguridad, no se muestra la contraseña en este correo. Por favor, usa la contraseña que se te proporcionó al registrarte e inicia sesión para cambiarla inmediatamente.\n\nSaludos,\nEl equipo`,
        };

        // Enviar el correo electrónico
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error al enviar el correo:", error);
            return res.json({
              success: false,
              message: "Usuario agregado, pero no se pudo enviar el correo",
            });
          }
          console.log("Correo enviado:", info.response);
          res.json({
            success: true,
            message: "Usuario agregado y correo enviado exitosamente",
          });
        });
      }
    );
  });
});

// Ruta para obtener los usuarios
app.get('/obtener-usuarios', (req, res) => {
    db.query('SELECT id, nombres, apellidos, correo FROM usuarios WHERE estado = "S"', (err, results) => {
        if (err) {
            console.error('Error al obtener usuarios:', err);
            return res.json({ success: false, message: 'Error al obtener datos' });
        }
        res.json({ success: true, usuarios: results });
    });
});

// Ruta para obtener los detalles de un usuario
app.get('/obtener-usuario/:id', (req, res) => {
    const usuarioId = req.params.id;
    db.query('SELECT * FROM usuarios WHERE id = ?', [usuarioId], (err, results) => {
        if (err) {
            console.error('Error al obtener detalles del usuario:', err);
            return res.json({ success: false, message: 'Error al obtener datos del usuario' });
        }
        if (results.length > 0) {
            res.json({ success: true, usuario: results[0] });
        } else {
            res.json({ success: false, message: 'Usuario no encontrado' });
        }
    });
});

// Ruta para actualizar un administrador
app.put('/editar-usuario/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, apellidos, correo, telefono, plan, beca, ciudad, pais } = req.body;

    // Imprimir los datos recibidos para verificar
    console.log('Datos recibidos para actualizar:', { id, nombre, apellidos, correo, telefono, plan, beca, ciudad, pais });

    db.query(
        'UPDATE usuarios SET nombres = ?, apellidos = ?, correo = ?, telefono = ?, plan = ?, beca = ?, ciudad = ?, pais = ? WHERE id = ?',
        [nombre, apellidos, correo, telefono, plan, beca, ciudad, pais, id],
        (err, results) => {
            if (err) {
                console.error('Error al actualizar el usuario:', err);
                return res.json({ success: false, message: 'Error al actualizar usuario' });
            }

            // Verificar si la consulta afectó alguna fila
            if (results.affectedRows === 0) {
                return res.json({ success: false, message: 'No se encontró el usuario para actualizar' });
            }

            res.json({ success: true, message: 'Usuario actualizado exitosamente' });
        }
    );
});

// Ruta para actualizar el estado del administrador a 'N'
app.post('/eliminar-usuario', (req, res) => {
    const { id } = req.body;

    db.query(
        'UPDATE usuarios SET estado = "N" WHERE id = ?',
        [id],
        (err, results) => {
            if (err) {
                console.error('Error al actualizar el estado del usuario:', err);
                return res.json({ success: false, message: 'Error al eliminar usuario' });
            }
            res.json({ success: true, message: 'Usuario eliminado exitosamente' });
        }
    );
});

// Login de usuario
app.post("/login-usuario", (req, res) => {
    const { usuario1, password1 } = req.body; // Recibiendo los datos del cliente
  
    // Consulta SQL para verificar si el usuario existe
    const sql = "SELECT * FROM usuarios WHERE username = ?";
  
    db.query(sql, [usuario1], (err, result) => {
        if (err) {
            console.error("Error al consultar el usuario:", err);
            return res.status(500).json({ success: false, message: "Error en la consulta" });
        }
    
        if (result.length === 0) {
            console.log(`Usuario no encontrado: ${usuario1}`);
            return res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }
    
        const user = result[0];
        console.log(`Datos completos del usuario encontrado:`, user); // Imprime toda la información del usuario
    
        // Comparar la contraseña proporcionada con el hash almacenado
        bcrypt.compare(password1, user.password, (err, isMatch) => {
            if (err) {
                console.error("Error al comparar contraseñas:", err);
                return res.status(500).json({ success: false, message: "Error en el servidor" });
            }
    
            if (isMatch) {
                console.log(`Login exitoso para el usuario: ${usuario1}`);
                
                // Calcular la edad del usuario
                const fechaNacimiento = moment(user.fecha_nacimiento); // Usando moment.js para manejar fechas
                const edad = moment().diff(fechaNacimiento, 'years'); // Calcula la edad en años

                let rutaDestino;
                
                if (edad >= 18) {
                    // Si el usuario tiene 18 años o más, redirigir a la ruta de adulto
                    rutaDestino = "../NEXUS_ACADEMY 2/InterfazUsuario/interfaz.html";
                } else if (edad >= 13 && edad <= 17) {
                    // Si el usuario tiene entre 13 y 17 años, redirigir a la ruta de adolescente
                    rutaDestino = "../NEXUS_ACADEMY - ADOLECENTES/InterfazUsuario/interfaz.html";
                } else if (edad >= 8 && edad <= 12) {
                    // Si el usuario tiene entre 8 y 12 años, redirigir a la ruta de niño
                    rutaDestino = "../NEXUS_ACADEMY - NIÑOS/InterfazUsuario/interfaz.html";
                } else {
                    // En caso de que la edad sea menor a 8, redirigir a una página por defecto o un mensaje de error
                    return res.status(400).json({ success: false, message: "Edad no válida para acceder." });
                }

                // Redirigir a la ruta correspondiente
                res.status(200).json({
                    success: true,
                    message: "Login exitoso",
                    rutaDestino: rutaDestino, // Devolver la ruta de redirección
                });
            } else {
                console.log(`Contraseña incorrecta para el usuario: ${usuario1}`);
                res.status(401).json({ success: false, message: "Contraseña incorrecta" });
            }
        });
    });
});

// Ruta para agregar un nuevo administrador
app.post('/agregar-profesor', (req, res) => {
    const { nombre, apellidos, genero, correo, telefono, fecha, plan, ciudad, pais, area, carrera, username, password } = req.body;

    // Generar un hash para la contraseña antes de almacenarla
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error al hashear la contraseña:', err);
            return res.json({ success: false, message: 'Error al procesar la contraseña' });
        }

        // Inserción en la base de datos con la contraseña hasheada
        db.query(
            'INSERT INTO profesores (username, password, nombres, apellidos, genero, correo, telefono, fecha_nacimiento, plan, ciudad, pais, area, carrera, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [username, hashedPassword, nombre, apellidos, genero, correo, telefono, fecha, plan, ciudad, pais, area, carrera, 'S'],
            (err, results) => {
                if (err) {
                    console.error('Error al insertar en la base de datos:', err);
                    return res.json({ success: false, message: 'Error al agregar profesor' });
                }

                // Configurar los detalles del correo
                const mailOptions = {
                    from: 'graypadilla6@gmail.com', // Coloca tu correo
                    to: correo, // Correo del profesor
                    subject: 'Bienvenido/a a la plataforma',
                    text: `Hola ${nombre},\n\nSe ha creado tu cuenta exitosamente.\n\nTu contraseña temporal es: ${password}\n\nPor favor, cámbiala después de iniciar sesión.\n\nSaludos,\nEl equipo`
                };

                // Enviar el correo electrónico
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error('Error al enviar el correo:', error);
                        return res.json({ success: false, message: 'Profesor agregado, pero no se pudo enviar el correo' });
                    }
                    console.log('Correo enviado:', info.response);
                    res.json({ success: true, message: 'Profesor agregado y correo enviado exitosamente' });
                });
            }
        );
    });
});


// Ruta para obtener los usuarios
app.get('/obtener-profesores', (req, res) => {
    db.query('SELECT id, nombres, apellidos, correo FROM profesores WHERE estado = "S"', (err, results) => {
        if (err) {
            console.error('Error al obtener profesores:', err);
            return res.json({ success: false, message: 'Error al obtener datos' });
        }
        res.json({ success: true, profesores: results });
    });
});

// Ruta para obtener los detalles de un usuario
app.get('/obtener-profesor/:id', (req, res) => {
    const profesorId = req.params.id;
    db.query('SELECT * FROM profesores WHERE id = ?', [profesorId], (err, results) => {
        if (err) {
            console.error('Error al obtener detalles del profesor:', err);
            return res.json({ success: false, message: 'Error al obtener datos del profesor' });
        }
        if (results.length > 0) {
            res.json({ success: true, profesor: results[0] });
        } else {
            res.json({ success: false, message: 'Profesor no encontrado' });
        }
    });
});

// Ruta para actualizar un administrador
app.put('/editar-profesor/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, apellidos, correo, telefono, plan, ciudad, pais } = req.body;

    // Imprimir los datos recibidos para verificar
    console.log('Datos recibidos para actualizar:', { id, nombre, apellidos, correo, telefono, plan, ciudad, pais });

    db.query(
        'UPDATE profesores SET nombres = ?, apellidos = ?, correo = ?, telefono = ?, plan = ?, ciudad = ?, pais = ? WHERE id = ?',
        [nombre, apellidos, correo, telefono, plan, ciudad, pais, id],
        (err, results) => {
            if (err) {
                console.error('Error al actualizar el profesor:', err);
                return res.json({ success: false, message: 'Error al actualizar profesor' });
            }

            // Verificar si la consulta afectó alguna fila
            if (results.affectedRows === 0) {
                return res.json({ success: false, message: 'No se encontró el profesor para actualizar' });
            }

            res.json({ success: true, message: 'Profesor actualizado exitosamente' });
        }
    );
});

// Ruta para actualizar el estado del administrador a 'N'
app.post('/eliminar-profesor', (req, res) => {
    const { id } = req.body;

    db.query(
        'UPDATE profesores SET estado = "N" WHERE id = ?',
        [id],
        (err, results) => {
            if (err) {
                console.error('Error al actualizar el estado del profesor:', err);
                return res.json({ success: false, message: 'Error al eliminar profesor' });
            }
            res.json({ success: true, message: 'Profesor eliminado exitosamente' });
        }
    );
});

app.post("/agregar-ruta", upload.fields([{ name: "imagenRuta" }, { name: "iconoRuta" }]), (req, res) => {
    const { nombre, area, tipoRuta } = req.body; // Get tipoRuta from request body
    const imagenRuta = req.files.imagenRuta ? req.files.imagenRuta[0] : null;
    const iconoRuta = req.files.iconoRuta ? req.files.iconoRuta[0] : null;

    // Determine paths based on tipoRuta
    let basePath, htmlBasePath;
    
    switch (tipoRuta) {
        case "adulto-ruta":
            basePath = "../NEXUS_ACADEMY 2/BuscarRutas/rutaPython/images";
            htmlBasePath = "../NEXUS_ACADEMY 2/BuscarRutas/rutaPython";
            break;
        case "adolescente-ruta":
            basePath = "../NEXUS_ACADEMY - ADOLECENTES/BuscarRutas/rutaPython/images";
            htmlBasePath = "../NEXUS_ACADEMY - ADOLECENTES/BuscarRutas/rutaPython";
            break;
        case "niño-ruta":
            basePath = "../NEXUS_ACADEMY - NIÑOS/BuscarRutas/rutaPython/images";
            htmlBasePath = "../NEXUS_ACADEMY - NIÑOS/BuscarRutas/rutaPython";
            break;
        default:
            return res.status(400).json({ success: false, message: 'Tipo de ruta no válido' });
    }

    // Function to process image and convert it to WebP format
    const procesarImagen = async (imagen, tipo) => {
        if (!imagen) {
            return tipo === "ruta" ? "default-ruta.webp" : "default-icono.webp";
        }
        const nombreImagenOriginal = imagen.originalname.split(".").slice(0, -1).join(".");
        const nombreImagenConvertida = `${Date.now()}-${nombreImagenOriginal}.webp`;
        const rutaImagenConvertida = path.join(basePath, nombreImagenConvertida); // Use determined base path

        try {
            await sharp(imagen.path).webp().toFile(rutaImagenConvertida);
            return nombreImagenConvertida;
        } catch (error) {
            console.error(`Error al procesar la imagen ${tipo}:`, error);
            throw error;
        }
    };

    // Process both images (route and icon)
    Promise.all([procesarImagen(imagenRuta, "ruta"), procesarImagen(iconoRuta, "icono")])
    .then(([imagenRutaConvertida, iconoRutaConvertido]) => {
        const query = `INSERT INTO ruta (nombre, imagen, icono, area, tipo, estado) VALUES (?, ?, ?, ?, ?, ?)`;
        
        db.query(query, [nombre, imagenRutaConvertida, iconoRutaConvertido, area, tipoRuta, 'S'], (err) => {
            if (err) {
                console.error('Error al insertar la ruta:', err);
                return res.status(500).json({ success: false, message: 'Error al agregar la ruta' });
            }

            // Create HTML file for the route
            const archivoRuta = path.join(htmlBasePath, `ruta${nombre}.html`);
            const contenidoHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Rutas - ${nombre}</title>
    <link rel="icon" href="images/GUIMARBOT.ico" type="image/x-icon" />
    <link rel="stylesheet" href="../css/rutaPython.css" />
</head>
<body>
    <header class="header">
        <div class="left">
            <div class="menu-container">
                <div class="menu" id="menu">
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>
            <div class="brand" onclick="irInicio()">
                <h1>GUIMAR<span>BOT</span></h1>
            </div>
        </div>
        <div class="right">
            <div class="notificaciones">
                <a href="#" id="notification-link">
                    <img src="images/alarm-bell-svgrepo-com.svg" alt="notificaciones" />
                    <span>5</span>
                </a>
            </div>
            <div class="perfile" id="perfile">
                <img src="images/image.png" alt="Foto de perfil" />
                <span id="Angelo Del Aguila">Angelo</span>
                <img src="images/down-2-svgrepo-com.svg" alt="" class="down-user" />
            </div>
        </div>
        <div class="profile-menu" id="profile-menu">
            <p>¡Hola Jose!</p>
            <a href="../Perfil/Perfil.html" class="profile-option">Ver perfil</a>
            <a href="../contactanos/contactanos.html" class="profile-option">Contáctanos</a>
            <a href="../selecionInteres.html" class="profile-option">Obtener una beca</a>
            <a href="../index.html" class="profile-cerrar">Cerrar sesión</a>
        </div>
    </header>

    <main class="main-container">
        <section class="cards-container">
            <a href="../irRutaPython/ruta${nombre}.html" class="card-link">
                <div class="card">
                    <h2>${nombre}: De Cero a Experto</h2>
                    <p>Desarrollo e Ingeniería • 7 cursos</p>
                    <div class="courses-container">
                        <div class="course-box">
                            <img src="images/piton.png" alt="Icono" class="icon-image" />
                            Curso de Estructuras de Datos Lineales con ${nombre}
                        </div>
                        <div class="course-box">
                            <img src="images/piton.png" alt="Icono" class="icon-image" />
                            Curso de ${nombre}: Comprehensions, Funciones y más
                        </div>
                        <div class="course-box">
                            <img src="images/piton.png" alt="Icono" class="icon-image" />
                            Curso de FastAPI
                        </div>
                    </div>
                    <span class="view-more">Ver 7 cursos más</span>
                </div>
            </a>
        </section>
    </main>

    <script src="js/interfaz.js"></script>
    <script src="../js/Gestion-Tarjetas-Rutas.js"></script>
</body>
</html>
            `;

            fs.writeFile(archivoRuta, contenidoHTML, (error) => {
                if (error) {
                    console.error(`Error al crear el archivo HTML para la ruta: ${error}`);
                    return res.json({ success: false, message: 'Error al crear el archivo HTML de la ruta' });
                }
                console.log(`Archivo HTML creado exitosamente: ${archivoRuta}`);
                res.json({ success: true, message: 'Ruta agregada exitosamente, imágenes convertidas y archivo HTML creado' });
            });
        });
    })
    .catch(error => {
        console.error('Error al procesar las imágenes:', error);
        res.json({ success: false, message: 'Error al procesar las imágenes' });
    });
});

// Ruta para obtener los usuarios
app.get('/obtener-rutas', (req, res) => {
    db.query('SELECT * FROM ruta WHERE estado = "S"', (err, results) => {
        if (err) {
            console.error('Error al obtener rutas:', err);
            return res.json({ success: false, message: 'Error al obtener datos' });
        }
        res.json({ success: true, rutas: results });
    });
});

// Ruta para obtener los usuarios
app.get('/obtener-rutas-tarjetas', (req, res) => {
    const tipo = req.query.tipo; // Obtener el tipo desde los parámetros de la consulta
    const query = `SELECT * FROM ruta WHERE estado = "S" AND tipo = ?`;
    
    db.query(query, [tipo], (err, results) => {
        if (err) {
            console.error('Error al obtener rutas:', err);
            return res.json({ success: false, message: 'Error al obtener datos' });
        }
        res.json({ success: true, rutas: results });
    });
});

// Ruta para obtener los cursos de la ruta
app.get('/obtener-cursos-por-ruta/:nombreRuta', (req, res) => {
    const { nombreRuta } = req.params;

    const query = `
        SELECT 
            c.nombre_curso, 
            c.lema, 
            c.imagen_curso, 
            c.icono_curso, 
            c.descripcion_curso, 
            c.nombre_ruta, 
            c.nombre_profesor, 
            c.imagen_profesor, 
            GROUP_CONCAT(t.nombre_tema SEPARATOR '|') AS nombres_temas, 
            COUNT(t.id) AS total_temas
        FROM 
            cursos c
        INNER JOIN 
            temas t ON c.nombre_curso = t.nombre_curso
        INNER JOIN 
            ruta r ON c.nombre_ruta = r.nombre
        WHERE 
            r.nombre = ? 
            AND c.estado = 'S' 
            AND t.estado = 'S'
        GROUP BY 
            c.id;
    `;

    db.query(query, [nombreRuta], (err, results) => {
        if (err) {
            console.error('Error al obtener los cursos por ruta:', err);
            return res.status(500).json({ success: false, message: 'Error al obtener los cursos por la ruta.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'No se encontraron cursos para esta ruta.' });
        }

        res.json({ success: true, data: results });
    });
});

app.get("/obtener-areas-oficiales", (req, res) => {
    const query = "SELECT nombre_area FROM areas WHERE estado = 'S'";
    db.query(query, (error, results) => {
        if (error) {
            console.error("Error al obtener las áreas:", error);
            return res.status(500).json({ success: false, message: "Error al obtener las áreas." });
        }
        res.json({ success: true, areas: results.map(row => row.nombre_area) });
    });
});

// Ruta para obtener las rutas por área
app.get("/obtener-rutas-oficiales/:area", (req, res) => {
    const { area } = req.params;

    const query = `
        SELECT nombre 
        FROM ruta 
        WHERE area = ? AND estado = 'S'
    `;

    db.query(query, [area], (error, results) => {
        if (error) {
            console.error("Error al obtener las rutas oficiales:", error);
            return res.status(500).json({ success: false, message: "Error al obtener las rutas oficiales." });
        }

        res.json({ success: true, rutas: results.map(row => row.nombre) });
    });
});

app.get("/obtener-profesores-oficiales/:area", (req, res) => {
    const { area } = req.params;

    const query = `
        SELECT nombres 
        FROM profesores 
        WHERE area = ? AND estado = 'S'
    `;

    db.query(query, [area], (error, results) => {
        if (error) {
            console.error("Error al obtener los profesores oficiales:", error);
            return res.status(500).json({ success: false, message: "Error al obtener los profesores oficiales." });
        }

        res.json({ success: true, profesores: results.map(row => row.nombres) });
    });
});

app.get("/obtener-cursos-ruta/:ruta", (req, res) => {
    const { ruta } = req.params;

    if (!ruta) {
        return res.status(400).json({ success: false, message: "Ruta no especificada." });
    }

    const query = `
        SELECT c.id, c.nombre_curso, r.area 
        FROM cursos c
        INNER JOIN ruta r ON c.nombre_ruta = r.nombre
        WHERE r.nombre = ? AND c.estado = 'S' AND r.estado = 'S'
    `;

    db.query(query, [ruta], (error, results) => {
        if (error) {
            console.error("Error al obtener los cursos de la ruta:", error);
            return res.status(500).json({ success: false, message: "Error al obtener los cursos de la ruta." });
        }

        res.json({ success: true, cursos: results });
    });
});

// Ruta para actualizar el estado del administrador a 'N'
app.post('/eliminar-ruta', (req, res) => {
    const { id } = req.body;

    db.query(
        'UPDATE ruta SET estado = "N" WHERE id = ?',
        [id],
        (err, results) => {
            if (err) {
                console.error('Error al actualizar el estado de la ruta:', err);
                return res.json({ success: false, message: 'Error al eliminar ruta' });
            }
            res.json({ success: true, message: 'Ruta eliminado exitosamente' });
        }
    );
});

app.post("/agregar-curso", upload.fields([{ name: "imagenDocente" }, { name: "imagen_curso" }, { name: "icono_curso" }]), (req, res) => {
    const { 
        nombre_curso, lema, descripcion_curso, tipo_curso, 
        nombre_ruta, nombre_profesor, horas_teoricas, horas_practicas, 
        conocimiento_previo_1, conocimiento_previo_2, conocimiento_previo_3, descripcion_curso_2 
    } = req.body;

    const imagenDocente = req.files.imagenDocente ? req.files.imagenDocente[0] : null;
    const imagenCurso = req.files.imagen_curso ? req.files.imagen_curso[0] : null;
    const iconoCurso = req.files.icono_curso ? req.files.icono_curso[0] : null;

    // 📁 Determinar la carpeta principal según el tipo de curso
    let basePath;
    if (tipo_curso.toLowerCase() === 'adulto') {
        basePath = "../NEXUS_ACADEMY 2";
    } else if (tipo_curso.toLowerCase() === 'adolescente') {
        basePath = "../NEXUS_ACADEMY - ADOLECENTES";
    } else if (tipo_curso.toLowerCase() === 'niño') {
        basePath = "../NEXUS_ACADEMY - NIÑOS";
    } else {
        basePath = "../NEXUS_ACADEMY 2"; // Valor por defecto
    }

    const procesarImagen = async (imagen, tipo) => {
        if (!imagen) {
            return tipo === "docente" ? "default-docente.jpg" : 
                    tipo === "icono" ? "default-icono.jpg" : 
                    "default-curso.jpg";
        }

        const nombreImagenOriginal = imagen.originalname.split(".").slice(0, -1).join(".");
        const nombreImagenConvertida = `${Date.now()}-${nombreImagenOriginal}.webp`;
        
        // 📂 Ruta para la carpeta de imágenes
        const rutaCarpetaImagenes = path.join(__dirname, basePath, "img");
        
        // 📁 Crear la carpeta de imágenes si no existe
        if (!fs.existsSync(rutaCarpetaImagenes)) {
            fs.mkdirSync(rutaCarpetaImagenes, { recursive: true });
        }

        // 📄 Ruta completa para la imagen convertida
        const rutaImagenConvertida = path.join(rutaCarpetaImagenes, nombreImagenConvertida);

        try {
            await sharp(imagen.path).webp().toFile(rutaImagenConvertida);
            return nombreImagenConvertida;
        } catch (error) {
            console.error(`❌ Error al procesar la imagen ${tipo}:`, error);
            throw error;
        }
    };

    Promise.all([
        procesarImagen(imagenDocente, "docente"), 
        procesarImagen(imagenCurso, "curso"), 
        procesarImagen(iconoCurso, "icono")
    ])
    .then(([imagenDocenteConvertida, imagenCursoConvertida, imagenIconoConvertida]) => {
        const query = `
            INSERT INTO cursos (
                nombre_curso, lema, imagen_curso, icono_curso, descripcion_curso, tipo_curso, 
                nombre_ruta, nombre_profesor, imagen_profesor, horas_teoricas, horas_practicas, 
                conocimiento_previo_1, conocimiento_previo_2, conocimiento_previo_3, 
                descripcion_curso_2, estado, activacion
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'S', 'I')
        `;

        db.query(
            query,
            [
                nombre_curso,
                lema,
                imagenCursoConvertida,
                imagenIconoConvertida, 
                descripcion_curso,
                tipo_curso,
                nombre_ruta,
                nombre_profesor,
                imagenDocenteConvertida,
                horas_teoricas,
                horas_practicas,
                conocimiento_previo_1,
                conocimiento_previo_2,
                conocimiento_previo_3,
                descripcion_curso_2
            ],
            (error, results) => {
                if (error) {
                    console.error("❌ Error al insertar el curso:", error);
                    return res.status(500).json({ success: false, message: "Error al insertar el curso." });
                }

                // 📁 Crear la carpeta específica para el curso
                const cursoFolderPath = path.join(__dirname, basePath, "Interfaz/Cursos y video", nombre_curso);

                try {
                    fs.mkdirSync(cursoFolderPath, { recursive: true });

                    // 📄 Crear el archivo Cursos.html
                    const indexPath = path.join(cursoFolderPath, "Cursos.html");
                    const indexContent = `

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximun=1.0, minimun-scale=1.0">
    <link rel="stylesheet" href="../css/Cursos.css">
    <script src="https://kit.fontawesome.com/52a4982f62.js" crossorigin="anonymous"></script>
    <link rel="icon" href="../IMG/Icono-GuimarBot2.ico" type="image/x-icon">
    <title>Curso ${nombre_curso} - GuirmarBot</title>
    <link rel="icon" href="../img/GUIMARBOT.ico" type="image/x-icon">
</head>
<body>
    <header>
        <div class="left">
            <div class="brand" onclick="irInicio()">
                <h1>GUIMAR<span>BOT</span></h1>
            </div>
        </div>
        <div class="right">
            <div class="planes" onclick="toggleVentana()">
                <button class="button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 24">
                        <path d="m18 0 8 12 10-8-4 20H4L0 4l10 8 8-12z"></path>
                    </svg>
                    Planes
                </button>
            </div>
            <div class="shop">
                <a href="carritocompras.html" class="icons-header">
                    <img src="../IMG/shopping-cart-svgrepo-com.svg" alt="shop">
                </a>
            </div>
            <div class="notificaciones" onclick="toggleNotifi()">
                <a href="#" class="icons-header">
                    <img src="../IMG/remind-svgrepo-com.svg" alt="notificaciones"><span>5</span>
                </a>
            </div>
            <div class="perfil" id="perfil">
                <img src="../Img/image.png" alt="Foto de perfil">
                <span id="Angelo Del Aguila">Angelo</span>
                <img src="../Img/down-2-svgrepo-com.svg" alt="" class="down-user">
            </div>
        </div>
        <div class="profile-menu" id="profile-menu">
            <p>¡Hola Jose!</p>
            <a href="../../../perfil.html" class="profile-option">Ver perfil</a>
            <a href="contactanos.html" class="profile-option">Contáctanos</a>
            <a href="../../../index.html" class="profile-cerrar">Cerrar sesión</a>
        </div>

        
        <div class="notifi-box" id="box">
            <h2>Notifications <span>5</span></h2>
        
            <div class="notifi-item">
                <img src="../img/avatar1.png" alt="img">
                <div class="text">
                    <h4>Elias Abdurrahman</h4>
                    <p>@lorem ipsum dolor sit amet</p>
                    <span class="fecha">2024-11-13 10:30 AM</span> <!-- Fecha añadida -->
                </div> 
            </div>
        
            <div class="notifi-item">
                <img src="../img/avatar2.png" alt="img">
                <div class="text">
                    <h4>John Doe</h4>
                    <p>@lorem ipsum dolor sit amet</p>
                    <span class="fecha">2024-11-13 09:45 AM</span> <!-- Fecha añadida -->
                </div> 
            </div>
        
            <div class="notifi-item">
                <img src="../img/avatar3.png" alt="img">
                <div class="text">
                    <h4>Emad Ali</h4>
                    <p>@lorem ipsum dolor sit amet</p>
                    <span class="fecha">2024-11-12 11:20 AM</span> <!-- Fecha añadida -->
                </div> 
            </div>
        
            <div class="notifi-item">
                <img src="../img/avatar4.png" alt="img">
                <div class="text">
                    <h4>Ekram Abu</h4>
                    <p>@lorem ipsum dolor sit amet</p>
                    <span class="fecha">2024-11-12 10:05 AM</span> <!-- Fecha añadida -->
                </div> 
            </div>
        
            <div class="notifi-item">
                <img src="../img/avatar5.png" alt="img">
                <div class="text">
                    <h4>Jane Doe</h4>
                    <p>@lorem ipsum dolor sit amet</p>
                    <span class="fecha">2024-11-11 04:15 PM</span> <!-- Fecha añadida -->
                </div> 
            </div>
        </div>
        
        <div id="ventana-flotante" class="ventana-flotante">
            <div class="contenido-ventana">
                <button class="cerrar-ventana" onclick="toggleVentana()">X</button>
                <div class="container-membresia">
                    <h2 class="titulo-membresia">Elige el plan ideal para ti</h2>
                    <div class="tabs">
                        <button class="tab-button active" onclick="showPlans('mensual')">Plan Mensual</button>
                        <button class="tab-button" onclick="showPlans('anual')">Plan Anual</button>
                    </div>
                    <div id="plan-mensual" class="plans active">
                        <div class="plan basic">
                            <h2>Básico</h2>
                            <p>Para 1 estudiante</p>
                            <p class="price">S/80/mes</p>
                            <p>Cobro mensual recurrente</p>
                            <ul id="Opciones">
                                <li>✔ Contenido profesional y actualizado</li>
                                <li>✔ Certificados digitales</li>
                                <li>✖ English Academy, Escuela de Startups. Liderazgo y Management</li>
                                <li>✖ Eventos exclusivos como Platzi Conf</li>
                                <li>✖ Descarga contenido en la app móvil</li>
                                <li>✖ Certificados físicos para rutas de perfil profesional</li>
                            </ul>
                            <button class="subscribe" onclick="location.href='Metodo Pago.html'">Suscríbete a Básico</button>
                        </div>
            
                        <div class="plan advanced">
                            <h2>Avanzado</h2>
                            <p>Para 2 estudiantes</p>
                            <p class="price">S/120/mes</p>
                            <p>Cobro mensual recurrente</p>
                            <ul id="Opciones">
                                <li>✔ Contenido profesional y actualizado</li>
                                <li>✔ Certificados digitales</li>
                                <li>✔ English Academy, Escuela de Startups. Liderazgo y Management</li>
                                <li>✔ Eventos exclusivos como Platzi Conf</li>
                                <li>✔ Descarga contenido en la app móvil</li>
                                <li>✔ Certificados físicos para rutas de perfil profesional</li>
                            </ul>
                            <button class="subscribe" onclick="location.href='Metodo Pago.html'">Suscríbete a Avanzado</button>
                        </div>
            
                        <div class="plan expert">
                            <h2>Experto</h2>
                            <p>Para 4 estudiantes</p>
                            <p class="price">S/240/mes</p>
                            <p>Cobro mensual recurrente</p>
                            <ul id="Opciones">
                                <li>✔ Contenido profesional y actualizado</li>
                                <li>✔ Certificados digitales</li>
                                <li>✔ English Academy, Escuela de Startups. Liderazgo y Management</li>
                                <li>✔ Eventos exclusivos como Platzi Conf</li>
                                <li>✔ Descarga contenido en la app móvil</li>
                                <li>✔ Certificados físicos para rutas de perfil profesional</li>
                            </ul>
                            <button class="subscribe" onclick="location.href='Metodo Pago.html'">Suscríbete a Experto</button>
                        </div>
                    </div>
                    </div>
                        <div id="plan-anual" class="plans">
                            <div class="plan basic">
                                <h2>Básico</h2>
                                <p>Para 5 estudiantes</p>
                                <p class="price">S/200/anual</p>
                                <p>Cobro anual recurrente</p>
                                <ul id="Opciones">
                                    <li>✔ Contenido profesional y actualizado</li>
                                    <li>✔ Certificados digitales</li>
                                    <li>✖ English Academy, Escuela de Startups. Liderazgo y Management</li>
                                    <li>✖ Eventos exclusivos como Platzi Conf</li>
                                    <li>✖ Descarga contenido en la app móvil</li>
                                    <li>✖ Certificados físicos para rutas de perfil profesional</li>
                                </ul>
                                <button class="subscribe" onclick="location.href='Metodo Pago.html'">Suscríbete a Básico</button>
                            </div>
                
                            <div class="plan advanced">
                                <h2>Avanzado</h2>
                                <p>Para 10 estudiantes</p>
                                <p class="price">S/350/anual</p>
                                <p>Cobro anual recurrente</p>
                                <ul id="Opciones">
                                    <li>✔ Contenido profesional y actualizado</li>
                                    <li>✔ Certificados digitales</li>
                                    <li>✔ English Academy, Escuela de Startups. Liderazgo y Management</li>
                                    <li>✔ Eventos exclusivos como Platzi Conf</li>
                                    <li>✔ Descarga contenido en la app móvil</li>
                                    <li>✔ Certificados físicos para rutas de perfil profesional</li>
                                </ul>
                                <button class="subscribe" onclick="location.href='Metodo Pago.html'">Suscríbete a Avanzado</button>
                            </div>
                
                            <div class="plan expert">
                                <h2>Experto</h2>
                                <p>Para 15 estudiantes</p>
                                <p class="price">S/500/anual</p>
                                <p>Cobro anual recurrente</p>
                                <ul id="Opciones">
                                    <li>✔ Contenido profesional y actualizado</li>
                                    <li>✔ Certificados digitales</li>
                                    <li>✔ English Academy, Escuela de Startups. Liderazgo y Management</li>
                                    <li>✔ Eventos exclusivos como Platzi Conf</li>
                                    <li>✔ Descarga contenido en la app móvil</li>
                                    <li>✔ Certificados físicos para rutas de perfil profesional</li>
                                </ul>
                                <button class="subscribe" onclick="location.href='Metodo Pago.html'">Suscríbete a Experto</button>
                            </div>
                        </div>
                    </div>
            </div>
        </div>
    </header>

    <main class="contenido-general">
        <section class="encabezado">
            <a href="../../../Interfaces/InterfazUsuario/interfaz.html">←</a>
            <div class="course-title">
                <div class="descripcion">
                    <div class="titulo">
                        <img src="../../../img/${imagenIconoConvertida}" alt="imagen del curso">
                        <h1>Curso completo de ${nombre_curso}</h1>
                        </div>
                        <div class="descripcion-curso">
                        <span class="rating" onclick="location.href='video-python.html'">⭐⭐⭐⭐⭐ <span id="num">300 Opiniones</span></span>
                        <h1 class="amateur-box icon-skyblue"><p class="fa-solid fa-signal"></p>AMATEUR </h1>
                        <h1 class="amateur-box icon-skyblue"><p class="fa-sharp-duotone fa-solid fa-video"></p>29 CURSOS </h1>
                        <p class="last-update">Última actualización: ${new Date().toLocaleDateString()}</p>
                        <p class="description text-align-justify">
                            ${descripcion_curso}
                        </p>
                        <div class="btn-container">
                            <button class="btn-primary" onclick="location.href='video.html'">
                                <i class="fa-solid fa-play"></i> COMENCEMOS AHORA
                            </button>
                            <button class="btn-primary-2" onclick="location.href='VideosClase1Python.html'">
                                <i class="fa-solid fa-certificate"></i> OBTENER CERTIFICADO
                            </button>
                        </div>
                    </div>
                </div>
                <div class="infoprofe">
                    <div class="teacher-image">
                        <img src="../../../img/${imagenDocenteConvertida}" alt="Profesor">
                    </div>
                    <div class="professor-info">
                        <h3>${nombre_profesor}</h3>
                        <p>Profesor de ${nombre_curso}</p>
                    </div>
                </div>
            </div>
        </section>
        <div class="linea"></div>

        <section class="cuerpo">
            <div class="cur-video">
                <div class="cuadro pequeño">
                    <div class="horas">
                        <h4>Para este curso vas a necesitar:</h4>
                        <ul>
                            <li><i class="fa-solid fa-stopwatch"></i>${horas_teoricas} Horas de contenido</li>
                            <li><i class="fa-solid fa-list-check"></i>${horas_practicas} Horas de práctica</li>
                        </ul>
                    </div>
                    <div class="conocimiento">
                        <h4>Conocimientos previos:</h4>
                        <ul>
                            <li><i class="fa-solid fa-cubes"></i>${conocimiento_previo_1}</li>
                            <li><i class="fa-solid fa-cubes"></i>${conocimiento_previo_2}</li>
                            <li><i class="fa-solid fa-cubes"></i>${conocimiento_previo_3}</li>
                        </ul>
                        <h4>Software para este curso:</h4>
                        <ul>
                            <li><i class="fa-solid fa-briefcase"></i>Sublime Text</li>
                            <li><i class="fa-solid fa-briefcase"></i>Visual Studio Code</li>
                        </ul>
                    </div>
                    <div class="infoextra">
                    <h4>Mas sobre el curso:</h4>
                        <ul>
                            <li class="text-align-content">${descripcion_curso_2}</li>
                        </ul>
                    </div>
                </div>
                <div class="cuadro grande">
                    <div class="accordion-section"> 
                        <h2 id="introduccion-python">Introducción a HTML y Conceptos Básicos</h2>
                        <div class="accordion">
                            <div class="flex-center">
                                <button class="accordion-button" onclick="location.href='video.html'"> 
                                    <img class="img-miniaturas" src="../img/Miniatura1HTML.png">
                                        <div class="text-container">
                                            <span class="title">Estructura básica de un documento HTML</span>
                                            <span class="duration">
                                                <i class="fa-solid fa-clock"></i> Duración: 00:52 min
                                            </span>
                                        </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>
    <script src="../js/Cursos.js"></script>
    <script src="../js/Gestion-temas.js"></script>
</body>
</html>
                            `;
                            // 📝 Escribir el archivo HTML
                    fs.writeFileSync(indexPath, indexContent);
                    res.json({ success: true, message: "Curso creado exitosamente." });
                } catch (error) {
                    console.error("❌ Error al crear la carpeta o el archivo del curso:", error);
                    res.status(500).json({ success: false, message: "Error al crear la carpeta o el archivo del curso." });
                }
            }
        );
    })
    .catch((error) => {
        console.error("❌ Error al procesar imágenes:", error);
        res.status(500).json({ success: false, message: "Error al procesar imágenes." });
    });
});

app.get('/obtener-cursos', (req, res) => {
    db.query('SELECT id, nombre_curso, nombre_profesor FROM cursos WHERE estado = "S"', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ cursos: results });
    });
});

// Endpoint para cambiar el estado de un curso a "N"
app.put("/eliminar-curso/:id", (req, res) => {
    const { id } = req.params;

    const query = `
        UPDATE cursos
        SET estado = 'N'
        WHERE id = ?
    `;

    db.query(query, [id], (error, results) => {
        if (error) {
            console.error("Error al actualizar el estado del curso:", error);
            return res.status(500).json({ success: false, message: "Error al eliminar el curso." });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Curso no encontrado." });
        }

        res.status(200).json({ success: true, message: "Estado del curso actualizado a 'N'." });
    });
});

app.get("/obtener-tarjetas", (req, res) => {
    const tipoCurso = req.query.tipoCurso; // Recibe el tipo de curso como filtro
    const query = "SELECT * FROM cursos WHERE tipo_curso = ? AND estado = 'S'";
    db.query(query, [tipoCurso], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Error al obtener los cursos" });
        }
        res.json({ success: true, cursos: results });
    });
});

app.put('/activar-curso/:nombreCurso', (req, res) => {
    const { nombreCurso } = req.params;

    const query = `UPDATE cursos SET activacion = 'A' WHERE nombre_curso = ?`;

    db.query(query, [nombreCurso], (error, results) => {
        if (error) {
            console.error("Error al activar el curso:", error);
            return res.status(500).json({ success: false, message: "Error al activar el curso." });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "No se encontró el curso para activar." });
        }

        res.json({ success: true, message: "Curso activado con éxito." });
    });
});

app.get('/obtener-cursos-activados', (req, res) => {
    const tipoCurso = req.query.tipo_curso; // Obtenemos el tipo de curso desde los parámetros de la consulta (query params)

    // Construimos la consulta para filtrar por tipo de curso
    const query = `
        SELECT nombre_curso, nombre_profesor, imagen_curso, tipo_curso
        FROM cursos 
        WHERE activacion = 'A' AND estado = 'S' AND tipo_curso = ?
    `;

    db.query(query, [tipoCurso], (error, results) => {
        if (error) {
            console.error("Error al obtener los cursos activados:", error);
            return res.status(500).json({ success: false, message: "Error al obtener los cursos activados." });
        }

        res.json({ success: true, cursos: results });
    });
});

// Endpoint para agregar un tema
app.post("/agregar-tema", (req, res) => {
    const { nombreCurso, nombreTema } = req.body;

    // Insertar el tema en la base de datos
    const query = "INSERT INTO temas (nombre_curso, nombre_tema, estado) VALUES (?, ?, ?)";
    const valores = [nombreCurso, nombreTema, "S"]; // 'S' para el estado activo

    db.query(query, valores, (error, resultados) => {
        if (error) {
            console.error("Error al insertar en la tabla 'temas':", error);
            return res.status(500).json({ mensaje: "Error al insertar el tema" });
        }

        res.status(201).json({ mensaje: "Tema agregado exitosamente", id: resultados.insertId });
    });
});

// Endpoint para obtener los temas por curso
app.get("/obtener-temas/:nombreCurso", (req, res) => {
    const { nombreCurso } = req.params;

    // Consulta los temas relacionados con el curso
    const query = "SELECT * FROM temas WHERE nombre_curso = ? AND estado = 'S'";
    db.query(query, [nombreCurso], (error, resultados) => {
        if (error) {
            console.error("Error al obtener los temas:", error);
            return res.status(500).json({ mensaje: "Error al obtener los temas" });
        }

        res.json({ temas: resultados });
    });
});

app.post("/insertar-imagen-tema/:nombreCurso", upload.single("imagen_tema"), async (req, res) => {
    const { tema_id, nombre_curso } = req.body;

    if (!req.file) {
        console.error("❌ No se ha recibido ninguna imagen.");
        return res.status(400).json({ success: false, message: "No se seleccionó ninguna imagen." });
    }

    const imagenTema = req.file;
    console.log("📁 Archivo recibido por Multer:", imagenTema);
    console.log("📘 Valores de tema_id y nombre_curso:", tema_id, nombre_curso); 

    try {
        // 📘 Consulta para obtener el tipo de curso (adulto, adolescente o niño)
        const querySelectTipoCurso = `SELECT tipo_curso FROM cursos WHERE nombre_curso = ? LIMIT 1`;

        db.query(querySelectTipoCurso, [nombre_curso], async (error, results) => {
            if (error) {
                console.error("❌ Error al obtener el tipo de curso:", error);
                return res.status(500).json({ success: false, message: "Error al obtener el tipo de curso." });
            }

            if (results.length === 0) {
                console.error("⚠️ No se encontró el tipo de curso para:", nombre_curso);
                return res.status(404).json({ success: false, message: "No se encontró el tipo de curso." });
            }

            const tipoCurso = results[0].tipo_curso;
            console.log(`🛠️ Tipo de curso detectado: ${tipoCurso}`);

            // 🔥 Determinar la ruta según el tipo de curso
            let rutaBaseImagen = '';
            if (tipoCurso === 'adulto') {
                rutaBaseImagen = path.join(__dirname, "../NEXUS_ACADEMY 2/img");
            } else if (tipoCurso === 'adolescente') {
                rutaBaseImagen = path.join(__dirname, "../NEXUS_ACADEMY - ADOLECENTES/img");
            } else if (tipoCurso === 'niño') {
                rutaBaseImagen = path.join(__dirname, "../NEXUS_ACADEMY - NIÑOS/img");
            } else {
                console.error("❌ Tipo de curso no válido:", tipoCurso);
                return res.status(400).json({ success: false, message: "El tipo de curso no es válido." });
            }

            console.log(`📂 La imagen se almacenará en: ${rutaBaseImagen}`);

            // 🔥 Proceso de conversión y almacenamiento de la imagen
            const nombreImagenOriginal = imagenTema.originalname.split(".").slice(0, -1).join(".");
            const nombreImagenConvertida = `${Date.now()}-${nombreImagenOriginal}.webp`;
            const rutaImagenConvertida = path.join(rutaBaseImagen, nombreImagenConvertida);

            try {
                await sharp(imagenTema.path)
                    .webp()
                    .toFile(rutaImagenConvertida);

                console.log(`✅ Imagen convertida y guardada en: ${rutaImagenConvertida}`);

                // 🟢 Consulta SQL para actualizar la imagen en la tabla "temas"
                const query = `UPDATE temas SET imagen_tema = ? WHERE id = ? AND nombre_curso = ?`;

                db.query(query, [nombreImagenConvertida, tema_id, nombre_curso], (error, results) => {
                    if (error) {
                        console.error("❌ Error al actualizar la imagen en la base de datos:", error);
                        return res.status(500).json({ success: false, message: "Error al actualizar la imagen en la base de datos." });
                    }

                    console.log(`📘 Resultados de la consulta SQL:`, results);
                    res.json({
                        success: true,
                        message: "Imagen actualizada correctamente.",
                        imagen_tema: nombreImagenConvertida,
                        tipo_curso: tipoCurso
                    });
                });
            } catch (error) {
                console.error("❌ Error al procesar la imagen:", error);
                res.status(500).json({ success: false, message: "Error al procesar la imagen." });
            }
        });
    } catch (error) {
        console.error("❌ Error en el proceso general:", error);
        res.status(500).json({ success: false, message: "Error en el proceso general." });
    }
});


// Endpoint para eliminar un tema
app.delete("/eliminar-tema/:id", (req, res) => {
    const { id } = req.params;

    // Eliminar el tema en la base de datos
    const query = "DELETE FROM temas WHERE id = ?";
    db.query(query, [id], (error, resultados) => {
        if (error) {
            console.error("Error al eliminar el tema:", error);
            return res.status(500).json({ mensaje: "Error al eliminar el tema" });
        }

        if (resultados.affectedRows === 0) {
            return res.status(404).json({ mensaje: "Tema no encontrado" });
        }

        res.status(200).json({ mensaje: "Tema eliminado exitosamente" });
    });
});

app.post("/guardar-video", (req, res) => {
    const { nombreCurso, nombreVideo, videoLink, resumenVideo, siguienteVideo, anteriorVideo, estado } = req.body;

    if (!nombreCurso || !nombreVideo || !videoLink || !resumenVideo || !estado) {
        return res.status(400).json({ success: false, message: "Faltan datos obligatorios" });
    }

    // Consulta para obtener el tipo_curso del curso
    const querySelectTipoCurso = `SELECT tipo_curso FROM cursos WHERE nombre_curso = ?`;

    db.query(querySelectTipoCurso, [nombreCurso], (error, results) => {
        if (error) {
            console.error("Error al obtener el tipo de curso:", error);
            return res.status(500).json({ success: false, message: "Error al obtener el tipo de curso" });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "El curso no se encontró" });
        }

        const tipoCurso = results[0].tipo_curso;
        console.log(`🛠️ Tipo de curso detectado: ${tipoCurso}`);

        // Determinar la ruta donde se almacenará el archivo HTML según el tipo de curso
        let videoFilePath = '';
        if (tipoCurso === 'adulto') {
            videoFilePath = path.join(__dirname, `../NEXUS_ACADEMY 2/Interfaz/Cursos y video/${nombreCurso}/VideoClase${nombreVideo}.html`);
        } else if (tipoCurso === 'adolescente') {
            videoFilePath = path.join(__dirname, `../NEXUS_ACADEMY - ADOLECENTES/Interfaz/Cursos y video/${nombreCurso}/VideoClase${nombreVideo}.html`);
        } else if (tipoCurso === 'niño') {
            videoFilePath = path.join(__dirname, `../NEXUS_ACADEMY - NIÑOS/Interfaz/Cursos y video/${nombreCurso}/VideoClase${nombreVideo}.html`);
        } else {
            return res.status(400).json({ success: false, message: "El tipo de curso no es válido" });
        }

        // Realizar las tres consultas SQL en paralelo
        const queryProfesor = `SELECT p.nombres, p.apellidos, c.imagen_profesor 
                               FROM profesores p 
                               JOIN cursos c ON p.nombres = c.nombre_profesor 
                               WHERE c.nombre_curso = ? 
                               LIMIT 1;`;

        const queryCurso = `SELECT icono_curso, descripcion_curso FROM cursos WHERE nombre_curso = ? LIMIT 1`;

        const queryTemas = `SELECT COUNT(*) AS total_temas FROM temas WHERE nombre_curso = ? AND estado = 'S'`;

        Promise.all([
            db.promise().query(queryProfesor, [nombreCurso]),
            db.promise().query(queryCurso, [nombreCurso]),
            db.promise().query(queryTemas, [nombreCurso])
        ])
        .then(([profesorResult, cursoResult, temasResult]) => {
            const profesor = profesorResult[0][0];
            const curso = cursoResult[0][0];
            const totalTemas = temasResult[0][0].total_temas;

            const posicionVideo = parseInt(nombreVideo.match(/\d+/)) || 1; // Extrae la posición del video, asumiendo que el nombre es "VideoClase1"

            // Insertar el video en la base de datos
            const queryInsertVideo = `
                INSERT INTO videos (nombre_curso, nombre_video, link_video, resumen_video, siguiente_video, anterior_video, estado) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(queryInsertVideo, [nombreCurso, nombreVideo, videoLink, resumenVideo, siguienteVideo, anteriorVideo, estado], (error) => {
                if (error) {
                    console.error("Error al insertar el video en la base de datos:", error);
                    return res.status(500).json({ success: false, message: "Error al guardar el video" });
                }

        let videoHTMLContent = "";

        if (anteriorVideo === null) {
            // Caso cuando `anterior_video` es null
            videoHTMLContent = `

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Temario: ${nombreVideo} - GuimarBot</title>
    <link rel="stylesheet" href="../css/video.css">
    <script src="https://kit.fontawesome.com/52a4982f62.js" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.2/css/all.min.css">
    <link rel="icon" href="../img/GUIMARBOT.ico" type="image/x-icon">
</head>
<body>
    <header>
        <div class="left">
            <div class="brand" onclick="location.href='Cursos.html'">
                <h1>GUIMAR<span>BOT</span></h1>
            </div>
        </div>
        <div class="right">
            <div class="planes" onclick="toggleVentana()">
                <button class="button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 24">
                        <path d="m18 0 8 12 10-8-4 20H4L0 4l10 8 8-12z"></path>
                    </svg>
                    Planes
                </button>
            </div>
            <div class="shop">
                <a href="carritocompras.html" class="icons-header">
                    <img src="../img/shopping-cart-svgrepo-com.svg" alt="shop">
                </a>
            </div>
            <div class="notificaciones" onclick="toggleNotifi()">
                <a href="#" class="icons-header">
                    <img src="../img/remind-svgrepo-com.svg" alt="notificaciones"><span>5</span>
                </a>
            </div>
            <div class="perfil" id="perfil">
                <img src="../img/image.png" alt="Foto de perfil">
                <span id="Angelo Del Aguila">Angelo</span>
                <img src="../img/down-2-svgrepo-com.svg" alt="" class="down-user">
            </div>
        </div>
        <div class="profile-menu" id="profile-menu">
            <p>¡Hola Jose!</p>
            <a href="perfil.html" class="profile-option">Ver perfil</a>
            <a href="contactanos.html" class="profile-option">Contáctanos</a>
            <a href="../../../index.html" class="profile-cerrar">Cerrar sesión</a>
        </div>
        
        <div class="notifi-box" id="box">
            <h2>Notifications <span>5</span></h2>
        
            <div class="notifi-item">
                <img src="../img/Usuario1.png" alt="img">
                <div class="text">
                    <h4>Elias Abdurrahman</h4>
                    <p>@lorem ipsum dolor sit amet</p>
                    <span class="fecha">2024-11-13 10:30 AM</span> <!-- Fecha añadida -->
                </div> 
            </div>
        
            <div class="notifi-item">
                <img src="../img/avatar2.png" alt="img">
                <div class="text">
                    <h4>John Doe</h4>
                    <p>@lorem ipsum dolor sit amet</p>
                    <span class="fecha">2024-11-13 09:45 AM</span> <!-- Fecha añadida -->
                </div> 
            </div>
        
            <div class="notifi-item">
                <img src="../img/avatar3.png" alt="img">
                <div class="text">
                    <h4>Emad Ali</h4>
                    <p>@lorem ipsum dolor sit amet</p>
                    <span class="fecha">2024-11-12 11:20 AM</span> <!-- Fecha añadida -->
                </div> 
            </div>
        
            <div class="notifi-item">
                <img src="../img/avatar4.png" alt="img">
                <div class="text">
                    <h4>Ekram Abu</h4>
                    <p>@lorem ipsum dolor sit amet</p>
                    <span class="fecha">2024-11-12 10:05 AM</span> <!-- Fecha añadida -->
                </div> 
            </div>
        
            <div class="notifi-item">
                <img src="../img/avatar5.png" alt="img">
                <div class="text">
                    <h4>Jane Doe</h4>
                    <p>@lorem ipsum dolor sit amet</p>
                    <span class="fecha">2024-11-11 04:15 PM</span> <!-- Fecha añadida -->
                </div> 
            </div>
        </div>

        <div id="ventana-flotante" class="ventana-flotante">
            <div class="contenido-ventana">
                <button class="cerrar-ventana" onclick="toggleVentana()">X</button>
                <div class="container-membresia">
                    <h2 class="titulo-membresia">Elige el plan ideal para ti</h2>
                    <div class="tabs">
                        <button class="tab-button active" onclick="showPlans('mensual')">Plan Mensual</button>
                        <button class="tab-button" onclick="showPlans('anual')">Plan Anual</button>
                    </div>
                    <div id="plan-mensual" class="plans active">
                        <div class="plan basic">
                            <h2>Básico</h2>
                            <p>Para 1 estudiante</p>
                            <p class="price">S/80/mes</p>
                            <p>Cobro mensual recurrente</p>
                            <ul id="Opciones">
                                <li>✔ Contenido profesional y actualizado</li>
                                <li>✔ Certificados digitales</li>
                                <li>✖ English Academy, Escuela de Startups. Liderazgo y Management</li>
                                <li>✖ Eventos exclusivos como Platzi Conf</li>
                                <li>✖ Descarga contenido en la app móvil</li>
                                <li>✖ Certificados físicos para rutas de perfil profesional</li>
                            </ul>
                            <button class="subscribe" onclick="location.href='Metodo Pago.html'">Suscríbete a Básico</button>
                        </div>
            
                        <div class="plan advanced">
                            <h2>Avanzado</h2>
                            <p>Para 2 estudiantes</p>
                            <p class="price">S/120/mes</p>
                            <p>Cobro mensual recurrente</p>
                            <ul id="Opciones">
                                <li>✔ Contenido profesional y actualizado</li>
                                <li>✔ Certificados digitales</li>
                                <li>✔ English Academy, Escuela de Startups. Liderazgo y Management</li>
                                <li>✔ Eventos exclusivos como Platzi Conf</li>
                                <li>✔ Descarga contenido en la app móvil</li>
                                <li>✔ Certificados físicos para rutas de perfil profesional</li>
                            </ul>
                            <button class="subscribe" onclick="location.href='Metodo Pago.html'">Suscríbete a Avanzado</button>
                        </div>
            
                        <div class="plan expert">
                            <h2>Experto</h2>
                            <p>Para 4 estudiantes</p>
                            <p class="price">S/240/mes</p>
                            <p>Cobro mensual recurrente</p>
                            <ul id="Opciones">
                                <li>✔ Contenido profesional y actualizado</li>
                                <li>✔ Certificados digitales</li>
                                <li>✔ English Academy, Escuela de Startups. Liderazgo y Management</li>
                                <li>✔ Eventos exclusivos como Platzi Conf</li>
                                <li>✔ Descarga contenido en la app móvil</li>
                                <li>✔ Certificados físicos para rutas de perfil profesional</li>
                            </ul>
                            <button class="subscribe" onclick="location.href='Metodo Pago.html'">Suscríbete a Experto</button>
                        </div>
                    </div>
                    </div>
                        <div id="plan-anual" class="plans">
                            <div class="plan basic">
                                <h2>Básico</h2>
                                <p>Para 5 estudiantes</p>
                                <p class="price">S/200/anual</p>
                                <p>Cobro anual recurrente</p>
                                <ul id="Opciones">
                                    <li>✔ Contenido profesional y actualizado</li>
                                    <li>✔ Certificados digitales</li>
                                    <li>✖ English Academy, Escuela de Startups. Liderazgo y Management</li>
                                    <li>✖ Eventos exclusivos como Platzi Conf</li>
                                    <li>✖ Descarga contenido en la app móvil</li>
                                    <li>✖ Certificados físicos para rutas de perfil profesional</li>
                                </ul>
                                <button class="subscribe" onclick="location.href='Metodo Pago.html'">Suscríbete a Básico</button>
                            </div>
                
                            <div class="plan advanced">
                                <h2>Avanzado</h2>
                                <p>Para 10 estudiantes</p>
                                <p class="price">S/350/anual</p>
                                <p>Cobro anual recurrente</p>
                                <ul id="Opciones">
                                    <li>✔ Contenido profesional y actualizado</li>
                                    <li>✔ Certificados digitales</li>
                                    <li>✔ English Academy, Escuela de Startups. Liderazgo y Management</li>
                                    <li>✔ Eventos exclusivos como Platzi Conf</li>
                                    <li>✔ Descarga contenido en la app móvil</li>
                                    <li>✔ Certificados físicos para rutas de perfil profesional</li>
                                </ul>
                                <button class="subscribe" onclick="location.href='Metodo Pago.html'">Suscríbete a Avanzado</button>
                            </div>
                
                            <div class="plan expert">
                                <h2>Experto</h2>
                                <p>Para 15 estudiantes</p>
                                <p class="price">S/500/anual</p>
                                <p>Cobro anual recurrente</p>
                                <ul id="Opciones">
                                    <li>✔ Contenido profesional y actualizado</li>
                                    <li>✔ Certificados digitales</li>
                                    <li>✔ English Academy, Escuela de Startups. Liderazgo y Management</li>
                                    <li>✔ Eventos exclusivos como Platzi Conf</li>
                                    <li>✔ Descarga contenido en la app móvil</li>
                                    <li>✔ Certificados físicos para rutas de perfil profesional</li>
                                </ul>
                                <button class="subscribe" onclick="location.href='Metodo Pago.html'">Suscríbete a Experto</button>
                            </div>
                        </div>
                    </div>
            </div>
        </div>
    </header>

    <main class="contenido-general">
        <section class="videocurso">
            <div class="cuadro pequeño">
                <h1>Curso completo de ${nombreCurso}</h1>
                <img src="../../../img/${curso.icono_curso}" alt="logo">
                <hr>
                <p>Clase: <span>${posicionVideo}/${totalTemas}</span></p>
                <p>Profesor: <span>${profesor.nombres} ${profesor.apellidos}</span></p>
                <hr>
                <h3>Presentación:</h3>
                <p>${curso.descripcion_curso}</p>
            </div>
            <div class="cuadro grande">
                <div class="titulo">
                    <a href="Cursos.html">←</a>
                    <h1>Curso completo de ${nombreCurso}</h1>
                </div>
                <iframe src="${videoLink}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                <div class="datosvideo">
                    <div class="user">
                        <img src="../../../img/${profesor.imagen_profesor}" alt="perfil">
                    </div>
                    <div class="infoprofe">
                        <h1>${profesor.nombres} ${profesor.apellidos}</h1>
                        <p>Nivel: Intermedio</p>
                        <div class="infovideo">
                            <p>Fecha: <span>${new Date().toLocaleDateString()}</span></p>
                            <p><i class="fa-solid fa-heart"></i><span>240 me gustas</span></p>
                        </div>
                    </div>
                    <div class="btnseguir">
                        <button aria-label="Dar me gusta al video"><i class="fa-solid fa-heart"></i> Me gusta</button>
                    </div>
                </div>
                <div class="btnsiguiente">
                    <button onclick="location.href='VideoClase${siguienteVideo}.html'"><i class="fa-solid fa-play"></i> Siguiente</button>
                </div>
                <div class="descripcion">
                    <h3>Descripción</h3>
                    <p>${resumenVideo}</p>
                </div>

                <div class="comentarios">
                    <h1>Comentarios<span>5</span></h1>
                    <hr>
                    <div class="escribircon">
                        <h1>Escribe algún comentario</h1>
                        <textarea name="comentario" placeholder="Escribe un comentario..."></textarea>
                        <button>Enviar Comentario</button>
                    </div> 
                    <div class="usercoment">
                        <img src="../img/Usuario1.png" alt="perfil">
                        <div class="infocomentario">
                            <h1>@Angelo</h1>
                            <p>Excelente curso, me ha ayudado mucho a entender mejor el lenguaje</p>
                            <div class="btn">
                                <button>Editar</button>
                                <button>Eliminar</button>
                            </div>
                        </div>
                        <span>hace 1 mes</span>
                    </div>
                    <div class="usercoment">
                        <img src="../img/Usuario2.webp" alt="perfil">
                        <div class="infocomentario">
                            <h1>@Jose</h1>
                            <p>Excelente curso, me ha ayudado mucho a entender mejor el lenguaje</p>
                        </div>
                        <span>hace 1 dia</span>
                    </div>
                    <div class="usercoment">
                        <img src="../img/Usuario3.webp" alt="perfil">
                        <div class="infocomentario">
                            <h1>@Paulo</h1>
                            <p>Excelente curso, me ha ayudado mucho a entender mejor el lenguaje</p>
                        </div>
                        <span>hace 1 semana</span>
                    </div>
                    <div class="usercoment">
                        <img src="../img/Usuario4.webp" alt="perfil">
                        <div class="infocomentario">
                            <h1>@Paulo</h1>
                            <p>Excelente curso, me ha ayudado mucho a entender mejor el lenguaje</p>
                        </div>
                        <span>hace 2 mes</span>
                    </div>
                    <div class="usercoment">
                        <img src="../img/Usuario5.webp" alt="perfil">
                        <div class="infocomentario">
                            <h1>@Paulo</h1>
                            <p>Excelente curso, me ha ayudado mucho a entender mejor el lenguaje</p>
                        </div>
                        <span>hace 1 hora</span>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <script src="../js/video.js"></script>
</body>
</html>
            `;
      } else if (siguienteVideo === null) {
        // Caso cuando `siguiente_video` es null
        videoHTMLContent = `

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Temario: ${nombreVideo} - GuimarBot</title>
    <link rel="stylesheet" href="../css/video.css">
    <script src="https://kit.fontawesome.com/52a4982f62.js" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.2/css/all.min.css">
    <link rel="icon" href="../img/GUIMARBOT.ico" type="image/x-icon">
</head>
<body>
    <header>
        <div class="left">
            <div class="brand" onclick="location.href='Cursos.html'">
                <h1>GUIMAR<span>BOT</span></h1>
            </div>
        </div>
        <div class="right">
            <div class="planes" onclick="toggleVentana()">
                <button class="button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 24">
                        <path d="m18 0 8 12 10-8-4 20H4L0 4l10 8 8-12z"></path>
                    </svg>
                    Planes
                </button>
            </div>
            <div class="shop">
                <a href="carritocompras.html" class="icons-header">
                    <img src="../img/shopping-cart-svgrepo-com.svg" alt="shop">
                </a>
            </div>
            <div class="notificaciones" onclick="toggleNotifi()">
                <a href="#" class="icons-header">
                    <img src="../img/remind-svgrepo-com.svg" alt="notificaciones"><span>5</span>
                </a>
            </div>
            <div class="perfil" id="perfil">
                <img src="../img/image.png" alt="Foto de perfil">
                <span id="Angelo Del Aguila">Angelo</span>
                <img src="../img/down-2-svgrepo-com.svg" alt="" class="down-user">
            </div>
        </div>
        <div class="profile-menu" id="profile-menu">
            <p>¡Hola Jose!</p>
            <a href="perfil.html" class="profile-option">Ver perfil</a>
            <a href="contactanos.html" class="profile-option">Contáctanos</a>
            <a href="../../../index.html" class="profile-cerrar">Cerrar sesión</a>
        </div>
        
        <div class="notifi-box" id="box">
            <h2>Notifications <span>5</span></h2>
        
            <div class="notifi-item">
                <img src="../img/Usuario1.png" alt="img">
                <div class="text">
                    <h4>Elias Abdurrahman</h4>
                    <p>@lorem ipsum dolor sit amet</p>
                    <span class="fecha">2024-11-13 10:30 AM</span> <!-- Fecha añadida -->
                </div> 
            </div>
        
            <div class="notifi-item">
                <img src="../img/avatar2.png" alt="img">
                <div class="text">
                    <h4>John Doe</h4>
                    <p>@lorem ipsum dolor sit amet</p>
                    <span class="fecha">2024-11-13 09:45 AM</span> <!-- Fecha añadida -->
                </div> 
            </div>
        
            <div class="notifi-item">
                <img src="../img/avatar3.png" alt="img">
                <div class="text">
                    <h4>Emad Ali</h4>
                    <p>@lorem ipsum dolor sit amet</p>
                    <span class="fecha">2024-11-12 11:20 AM</span> <!-- Fecha añadida -->
                </div> 
            </div>
        
            <div class="notifi-item">
                <img src="../img/avatar4.png" alt="img">
                <div class="text">
                    <h4>Ekram Abu</h4>
                    <p>@lorem ipsum dolor sit amet</p>
                    <span class="fecha">2024-11-12 10:05 AM</span> <!-- Fecha añadida -->
                </div> 
            </div>
        
            <div class="notifi-item">
                <img src="../img/avatar5.png" alt="img">
                <div class="text">
                    <h4>Jane Doe</h4>
                    <p>@lorem ipsum dolor sit amet</p>
                    <span class="fecha">2024-11-11 04:15 PM</span> <!-- Fecha añadida -->
                </div> 
            </div>
        </div>

        <div id="ventana-flotante" class="ventana-flotante">
            <div class="contenido-ventana">
                <button class="cerrar-ventana" onclick="toggleVentana()">X</button>
                <div class="container-membresia">
                    <h2 class="titulo-membresia">Elige el plan ideal para ti</h2>
                    <div class="tabs">
                        <button class="tab-button active" onclick="showPlans('mensual')">Plan Mensual</button>
                        <button class="tab-button" onclick="showPlans('anual')">Plan Anual</button>
                    </div>
                    <div id="plan-mensual" class="plans active">
                        <div class="plan basic">
                            <h2>Básico</h2>
                            <p>Para 1 estudiante</p>
                            <p class="price">S/80/mes</p>
                            <p>Cobro mensual recurrente</p>
                            <ul id="Opciones">
                                <li>✔ Contenido profesional y actualizado</li>
                                <li>✔ Certificados digitales</li>
                                <li>✖ English Academy, Escuela de Startups. Liderazgo y Management</li>
                                <li>✖ Eventos exclusivos como Platzi Conf</li>
                                <li>✖ Descarga contenido en la app móvil</li>
                                <li>✖ Certificados físicos para rutas de perfil profesional</li>
                            </ul>
                            <button class="subscribe" onclick="location.href='Metodo Pago.html'">Suscríbete a Básico</button>
                        </div>
            
                        <div class="plan advanced">
                            <h2>Avanzado</h2>
                            <p>Para 2 estudiantes</p>
                            <p class="price">S/120/mes</p>
                            <p>Cobro mensual recurrente</p>
                            <ul id="Opciones">
                                <li>✔ Contenido profesional y actualizado</li>
                                <li>✔ Certificados digitales</li>
                                <li>✔ English Academy, Escuela de Startups. Liderazgo y Management</li>
                                <li>✔ Eventos exclusivos como Platzi Conf</li>
                                <li>✔ Descarga contenido en la app móvil</li>
                                <li>✔ Certificados físicos para rutas de perfil profesional</li>
                            </ul>
                            <button class="subscribe" onclick="location.href='Metodo Pago.html'">Suscríbete a Avanzado</button>
                        </div>
            
                        <div class="plan expert">
                            <h2>Experto</h2>
                            <p>Para 4 estudiantes</p>
                            <p class="price">S/240/mes</p>
                            <p>Cobro mensual recurrente</p>
                            <ul id="Opciones">
                                <li>✔ Contenido profesional y actualizado</li>
                                <li>✔ Certificados digitales</li>
                                <li>✔ English Academy, Escuela de Startups. Liderazgo y Management</li>
                                <li>✔ Eventos exclusivos como Platzi Conf</li>
                                <li>✔ Descarga contenido en la app móvil</li>
                                <li>✔ Certificados físicos para rutas de perfil profesional</li>
                            </ul>
                            <button class="subscribe" onclick="location.href='Metodo Pago.html'">Suscríbete a Experto</button>
                        </div>
                    </div>
                    </div>
                        <div id="plan-anual" class="plans">
                            <div class="plan basic">
                                <h2>Básico</h2>
                                <p>Para 5 estudiantes</p>
                                <p class="price">S/200/anual</p>
                                <p>Cobro anual recurrente</p>
                                <ul id="Opciones">
                                    <li>✔ Contenido profesional y actualizado</li>
                                    <li>✔ Certificados digitales</li>
                                    <li>✖ English Academy, Escuela de Startups. Liderazgo y Management</li>
                                    <li>✖ Eventos exclusivos como Platzi Conf</li>
                                    <li>✖ Descarga contenido en la app móvil</li>
                                    <li>✖ Certificados físicos para rutas de perfil profesional</li>
                                </ul>
                                <button class="subscribe" onclick="location.href='Metodo Pago.html'">Suscríbete a Básico</button>
                            </div>
                
                            <div class="plan advanced">
                                <h2>Avanzado</h2>
                                <p>Para 10 estudiantes</p>
                                <p class="price">S/350/anual</p>
                                <p>Cobro anual recurrente</p>
                                <ul id="Opciones">
                                    <li>✔ Contenido profesional y actualizado</li>
                                    <li>✔ Certificados digitales</li>
                                    <li>✔ English Academy, Escuela de Startups. Liderazgo y Management</li>
                                    <li>✔ Eventos exclusivos como Platzi Conf</li>
                                    <li>✔ Descarga contenido en la app móvil</li>
                                    <li>✔ Certificados físicos para rutas de perfil profesional</li>
                                </ul>
                                <button class="subscribe" onclick="location.href='Metodo Pago.html'">Suscríbete a Avanzado</button>
                            </div>
                
                            <div class="plan expert">
                                <h2>Experto</h2>
                                <p>Para 15 estudiantes</p>
                                <p class="price">S/500/anual</p>
                                <p>Cobro anual recurrente</p>
                                <ul id="Opciones">
                                    <li>✔ Contenido profesional y actualizado</li>
                                    <li>✔ Certificados digitales</li>
                                    <li>✔ English Academy, Escuela de Startups. Liderazgo y Management</li>
                                    <li>✔ Eventos exclusivos como Platzi Conf</li>
                                    <li>✔ Descarga contenido en la app móvil</li>
                                    <li>✔ Certificados físicos para rutas de perfil profesional</li>
                                </ul>
                                <button class="subscribe" onclick="location.href='Metodo Pago.html'">Suscríbete a Experto</button>
                            </div>
                        </div>
                    </div>
            </div>
        </div>
    </header>

    <main class="contenido-general">
        <section class="videocurso">
            <div class="cuadro pequeño">
                <h1>Curso completo de ${nombreCurso}</h1>
                <img src="../../../img/${curso.icono_curso}" alt="logo">
                <hr>
                <p>Clase: <span>${posicionVideo}/${totalTemas}</span></p>
                <p>Profesor: <span>${profesor.nombres} ${profesor.apellidos}</span></p>
                <p>Nivel <span>Intermedio</span></p>
                <hr>
                <h3>Presentación:</h3>
                <p>${curso.descripcion_curso}</p>
            </div>
            <div class="cuadro grande">
                <div class="titulo">
                    <a href="Cursos.html">←</a>
                    <h1>Curso completo de ${nombreCurso}</h1>
                </div>
                <iframe src="${videoLink}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                <div class="datosvideo">
                    <div class="user">
                        <img src="../../../img/${profesor.imagen_profesor}" alt="perfil">
                    </div>
                    <div class="infoprofe">
                        <h1>${profesor.nombres} ${profesor.apellidos}</h1>
                        <p>Nivel: Intermedio</p>
                        <div class="infovideo">
                            <p>Fecha: <span>${new Date().toLocaleDateString()}</span></p>
                            <p><i class="fa-solid fa-heart"></i><span>240 me gustas</span></p>
                        </div>
                    </div>
                    <div class="btnseguir">
                        <button aria-label="Dar me gusta al video"><i class="fa-solid fa-heart"></i> Me gusta</button>
                    </div>
                </div>
                <div class="botones">
                    <div class="btnanterior">
                        <button onclick="location.href='VideoClase${anteriorVideo}.html'"><i class="fa-solid fa-play"></i>Anterior</button>
                    </div>
                    <div class="btnsiguiente">
                        <button onclick="location.href='VideoClase${nombreVideo}.html'"><i class="fa-solid fa-play"></i>Realizar examen</button>
                    </div>
                </div>
                <div class="descripcion">
                    <h3>Descripción</h3>
                    <p>${resumenVideo}</p>
                </div>

                <div class="comentarios">
                    <h1>Comentarios<span>5</span></h1>
                    <hr>
                    <div class="escribircon">
                        <h1>Escribe algún comentario</h1>
                        <textarea name="comentario" placeholder="Escribe un comentario..."></textarea>
                        <button>Enviar Comentario</button>
                    </div> 
                    <div class="usercoment">
                        <img src="../img/Usuario1.png" alt="perfil">
                        <div class="infocomentario">
                            <h1>@Angelo</h1>
                            <p>Excelente curso, me ha ayudado mucho a entender mejor el lenguaje</p>
                            <div class="btn">
                                <button>Editar</button>
                                <button>Eliminar</button>
                            </div>
                        </div>
                        <span>hace 1 mes</span>
                    </div>
                    <div class="usercoment">
                        <img src="../img/Usuario2.webp" alt="perfil">
                        <div class="infocomentario">
                            <h1>@Jose</h1>
                            <p>Excelente curso, me ha ayudado mucho a entender mejor el lenguaje</p>
                        </div>
                        <span>hace 1 dia</span>
                    </div>
                    <div class="usercoment">
                        <img src="../img/Usuario3.webp" alt="perfil">
                        <div class="infocomentario">
                            <h1>@Paulo</h1>
                            <p>Excelente curso, me ha ayudado mucho a entender mejor el lenguaje</p>
                        </div>
                        <span>hace 1 semana</span>
                    </div>
                    <div class="usercoment">
                        <img src="../img/Usuario4.webp" alt="perfil">
                        <div class="infocomentario">
                            <h1>@Paulo</h1>
                            <p>Excelente curso, me ha ayudado mucho a entender mejor el lenguaje</p>
                        </div>
                        <span>hace 2 mes</span>
                    </div>
                    <div class="usercoment">
                        <img src="../img/Usuario5.webp" alt="perfil">
                        <div class="infocomentario">
                            <h1>@Paulo</h1>
                            <p>Excelente curso, me ha ayudado mucho a entender mejor el lenguaje</p>
                        </div>
                        <span>hace 1 hora</span>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <script src="../js/video.js"></script>
</body>
</html>
            `;
      } else {
        // Caso cuando todos los datos están presentes (se genera normalmente)
        videoHTMLContent = `

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Temario: ${nombreVideo} - GuimarBot</title>
    <link rel="stylesheet" href="../css/video.css">
    <script src="https://kit.fontawesome.com/52a4982f62.js" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.2/css/all.min.css">
    <link rel="icon" href="../img/GUIMARBOT.ico" type="image/x-icon">
</head>
<body>
    <header>
        <div class="left">
            <div class="brand" onclick="location.href='Cursos.html'">
                <h1>GUIMAR<span>BOT</span></h1>
            </div>
        </div>
        <div class="right">
            <div class="planes" onclick="toggleVentana()">
                <button class="button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 24">
                        <path d="m18 0 8 12 10-8-4 20H4L0 4l10 8 8-12z"></path>
                    </svg>
                    Planes
                </button>
            </div>
            <div class="shop">
                <a href="carritocompras.html" class="icons-header">
                    <img src="../img/shopping-cart-svgrepo-com.svg" alt="shop">
                </a>
            </div>
            <div class="notificaciones" onclick="toggleNotifi()">
                <a href="#" class="icons-header">
                    <img src="../img/remind-svgrepo-com.svg" alt="notificaciones"><span>5</span>
                </a>
            </div>
            <div class="perfil" id="perfil">
                <img src="../img/image.png" alt="Foto de perfil">
                <span id="Angelo Del Aguila">Angelo</span>
                <img src="../img/down-2-svgrepo-com.svg" alt="" class="down-user">
            </div>
        </div>
        <div class="profile-menu" id="profile-menu">
            <p>¡Hola Jose!</p>
            <a href="perfil.html" class="profile-option">Ver perfil</a>
            <a href="contactanos.html" class="profile-option">Contáctanos</a>
            <a href="../../../index.html" class="profile-cerrar">Cerrar sesión</a>
        </div>
        
        <div class="notifi-box" id="box">
            <h2>Notifications <span>5</span></h2>
        
            <div class="notifi-item">
                <img src="../img/Usuario1.png" alt="img">
                <div class="text">
                    <h4>Elias Abdurrahman</h4>
                    <p>@lorem ipsum dolor sit amet</p>
                    <span class="fecha">2024-11-13 10:30 AM</span> <!-- Fecha añadida -->
                </div> 
            </div>
        
            <div class="notifi-item">
                <img src="../img/avatar2.png" alt="img">
                <div class="text">
                    <h4>John Doe</h4>
                    <p>@lorem ipsum dolor sit amet</p>
                    <span class="fecha">2024-11-13 09:45 AM</span> <!-- Fecha añadida -->
                </div> 
            </div>
        
            <div class="notifi-item">
                <img src="../img/avatar3.png" alt="img">
                <div class="text">
                    <h4>Emad Ali</h4>
                    <p>@lorem ipsum dolor sit amet</p>
                    <span class="fecha">2024-11-12 11:20 AM</span> <!-- Fecha añadida -->
                </div> 
            </div>
        
            <div class="notifi-item">
                <img src="../img/avatar4.png" alt="img">
                <div class="text">
                    <h4>Ekram Abu</h4>
                    <p>@lorem ipsum dolor sit amet</p>
                    <span class="fecha">2024-11-12 10:05 AM</span> <!-- Fecha añadida -->
                </div> 
            </div>
        
            <div class="notifi-item">
                <img src="../img/avatar5.png" alt="img">
                <div class="text">
                    <h4>Jane Doe</h4>
                    <p>@lorem ipsum dolor sit amet</p>
                    <span class="fecha">2024-11-11 04:15 PM</span> <!-- Fecha añadida -->
                </div> 
            </div>
        </div>

        <div id="ventana-flotante" class="ventana-flotante">
            <div class="contenido-ventana">
                <button class="cerrar-ventana" onclick="toggleVentana()">X</button>
                <div class="container-membresia">
                    <h2 class="titulo-membresia">Elige el plan ideal para ti</h2>
                    <div class="tabs">
                        <button class="tab-button active" onclick="showPlans('mensual')">Plan Mensual</button>
                        <button class="tab-button" onclick="showPlans('anual')">Plan Anual</button>
                    </div>
                    <div id="plan-mensual" class="plans active">
                        <div class="plan basic">
                            <h2>Básico</h2>
                            <p>Para 1 estudiante</p>
                            <p class="price">S/80/mes</p>
                            <p>Cobro mensual recurrente</p>
                            <ul id="Opciones">
                                <li>✔ Contenido profesional y actualizado</li>
                                <li>✔ Certificados digitales</li>
                                <li>✖ English Academy, Escuela de Startups. Liderazgo y Management</li>
                                <li>✖ Eventos exclusivos como Platzi Conf</li>
                                <li>✖ Descarga contenido en la app móvil</li>
                                <li>✖ Certificados físicos para rutas de perfil profesional</li>
                            </ul>
                            <button class="subscribe" onclick="location.href='Metodo Pago.html'">Suscríbete a Básico</button>
                        </div>
            
                        <div class="plan advanced">
                            <h2>Avanzado</h2>
                            <p>Para 2 estudiantes</p>
                            <p class="price">S/120/mes</p>
                            <p>Cobro mensual recurrente</p>
                            <ul id="Opciones">
                                <li>✔ Contenido profesional y actualizado</li>
                                <li>✔ Certificados digitales</li>
                                <li>✔ English Academy, Escuela de Startups. Liderazgo y Management</li>
                                <li>✔ Eventos exclusivos como Platzi Conf</li>
                                <li>✔ Descarga contenido en la app móvil</li>
                                <li>✔ Certificados físicos para rutas de perfil profesional</li>
                            </ul>
                            <button class="subscribe" onclick="location.href='Metodo Pago.html'">Suscríbete a Avanzado</button>
                        </div>
            
                        <div class="plan expert">
                            <h2>Experto</h2>
                            <p>Para 4 estudiantes</p>
                            <p class="price">S/240/mes</p>
                            <p>Cobro mensual recurrente</p>
                            <ul id="Opciones">
                                <li>✔ Contenido profesional y actualizado</li>
                                <li>✔ Certificados digitales</li>
                                <li>✔ English Academy, Escuela de Startups. Liderazgo y Management</li>
                                <li>✔ Eventos exclusivos como Platzi Conf</li>
                                <li>✔ Descarga contenido en la app móvil</li>
                                <li>✔ Certificados físicos para rutas de perfil profesional</li>
                            </ul>
                            <button class="subscribe" onclick="location.href='Metodo Pago.html'">Suscríbete a Experto</button>
                        </div>
                    </div>
                    </div>
                        <div id="plan-anual" class="plans">
                            <div class="plan basic">
                                <h2>Básico</h2>
                                <p>Para 5 estudiantes</p>
                                <p class="price">S/200/anual</p>
                                <p>Cobro anual recurrente</p>
                                <ul id="Opciones">
                                    <li>✔ Contenido profesional y actualizado</li>
                                    <li>✔ Certificados digitales</li>
                                    <li>✖ English Academy, Escuela de Startups. Liderazgo y Management</li>
                                    <li>✖ Eventos exclusivos como Platzi Conf</li>
                                    <li>✖ Descarga contenido en la app móvil</li>
                                    <li>✖ Certificados físicos para rutas de perfil profesional</li>
                                </ul>
                                <button class="subscribe" onclick="location.href='Metodo Pago.html'">Suscríbete a Básico</button>
                            </div>
                
                            <div class="plan advanced">
                                <h2>Avanzado</h2>
                                <p>Para 10 estudiantes</p>
                                <p class="price">S/350/anual</p>
                                <p>Cobro anual recurrente</p>
                                <ul id="Opciones">
                                    <li>✔ Contenido profesional y actualizado</li>
                                    <li>✔ Certificados digitales</li>
                                    <li>✔ English Academy, Escuela de Startups. Liderazgo y Management</li>
                                    <li>✔ Eventos exclusivos como Platzi Conf</li>
                                    <li>✔ Descarga contenido en la app móvil</li>
                                    <li>✔ Certificados físicos para rutas de perfil profesional</li>
                                </ul>
                                <button class="subscribe" onclick="location.href='Metodo Pago.html'">Suscríbete a Avanzado</button>
                            </div>
                
                            <div class="plan expert">
                                <h2>Experto</h2>
                                <p>Para 15 estudiantes</p>
                                <p class="price">S/500/anual</p>
                                <p>Cobro anual recurrente</p>
                                <ul id="Opciones">
                                    <li>✔ Contenido profesional y actualizado</li>
                                    <li>✔ Certificados digitales</li>
                                    <li>✔ English Academy, Escuela de Startups. Liderazgo y Management</li>
                                    <li>✔ Eventos exclusivos como Platzi Conf</li>
                                    <li>✔ Descarga contenido en la app móvil</li>
                                    <li>✔ Certificados físicos para rutas de perfil profesional</li>
                                </ul>
                                <button class="subscribe" onclick="location.href='Metodo Pago.html'">Suscríbete a Experto</button>
                            </div>
                        </div>
                    </div>
            </div>
        </div>
    </header>

    <main class="contenido-general">
        <section class="videocurso">
            <div class="cuadro pequeño">
                <h1>Curso completo de ${nombreCurso}</h1>
                <img src="../../../img/${curso.icono_curso}" alt="logo">
                <hr>
                <p>Clase: <span>${posicionVideo}/${totalTemas}</span></p>
                <p>Profesor: <span>${profesor.nombres} ${profesor.apellidos}</span></p>
                <p>Nivel <span>Intermedio</span></p>
                <hr>
                <h3>Presentación:</h3>
                <p>${curso.descripcion_curso}</p>
            </div>
            <div class="cuadro grande">
                <div class="titulo">
                    <a href="Cursos.html">←</a>
                    <h1>Curso completo de ${nombreCurso}</h1>
                </div>
                <iframe src="${videoLink}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                <div class="datosvideo">
                    <div class="user">
                        <img src="../../../img/${profesor.imagen_profesor}" alt="perfil">
                    </div>
                    <div class="infoprofe">
                        <h1>${profesor.nombres} ${profesor.apellidos}</h1>
                        <p>Nivel: Intermedio</p>
                        <div class="infovideo">
                            <p>Fecha: <span>${new Date().toLocaleDateString()}</span></p>
                            <p><i class="fa-solid fa-heart"></i><span>240 me gustas</span></p>
                        </div>
                    </div>
                    <div class="btnseguir">
                        <button aria-label="Dar me gusta al video"><i class="fa-solid fa-heart"></i> Me gusta</button>
                    </div>
                </div>
                <div class="botones">
                    <div class="btnsiguiente">
                        <button onclick="location.href='VideoClase${siguienteVideo}.html'"><i class="fa-solid fa-play"></i> Siguiente</button>
                    </div>
                    <div class="btnanterior">
                        <button onclick="location.href='VideoClase${anteriorVideo}.html'"><i class="fa-solid fa-play"></i>Anterior</button>
                    </div>
                </div>
                <div class="descripcion">
                    <h3>Descripción</h3>
                    <p>${resumenVideo}</p>
                </div>

                <div class="comentarios">
                    <h1>Comentarios<span>5</span></h1>
                    <hr>
                    <div class="escribircon">
                        <h1>Escribe algún comentario</h1>
                        <textarea name="comentario" placeholder="Escribe un comentario..."></textarea>
                        <button>Enviar Comentario</button>
                    </div> 
                    <div class="usercoment">
                        <img src="../img/Usuario1.png" alt="perfil">
                        <div class="infocomentario">
                            <h1>@Angelo</h1>
                            <p>Excelente curso, me ha ayudado mucho a entender mejor el lenguaje</p>
                            <div class="btn">
                                <button>Editar</button>
                                <button>Eliminar</button>
                            </div>
                        </div>
                        <span>hace 1 mes</span>
                    </div>
                    <div class="usercoment">
                        <img src="../img/Usuario2.webp" alt="perfil">
                        <div class="infocomentario">
                            <h1>@Jose</h1>
                            <p>Excelente curso, me ha ayudado mucho a entender mejor el lenguaje</p>
                        </div>
                        <span>hace 1 dia</span>
                    </div>
                    <div class="usercoment">
                        <img src="../img/Usuario3.webp" alt="perfil">
                        <div class="infocomentario">
                            <h1>@Paulo</h1>
                            <p>Excelente curso, me ha ayudado mucho a entender mejor el lenguaje</p>
                        </div>
                        <span>hace 1 semana</span>
                    </div>
                    <div class="usercoment">
                        <img src="../img/Usuario4.webp" alt="perfil">
                        <div class="infocomentario">
                            <h1>@Paulo</h1>
                            <p>Excelente curso, me ha ayudado mucho a entender mejor el lenguaje</p>
                        </div>
                        <span>hace 2 mes</span>
                    </div>
                    <div class="usercoment">
                        <img src="../img/Usuario5.webp" alt="perfil">
                        <div class="infocomentario">
                            <h1>@Paulo</h1>
                            <p>Excelente curso, me ha ayudado mucho a entender mejor el lenguaje</p>
                        </div>
                        <span>hace 1 hora</span>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <script src="../js/video.js"></script>
</body>
</html>
            `;
            }

                // Crear el archivo HTML
                try {
                    fs.writeFileSync(videoFilePath, videoHTMLContent);
                    console.log(`📄 Archivo HTML creado exitosamente en: ${videoFilePath}`);
                    res.json({ success: true, message: "Video guardado y archivo HTML generado exitosamente." });
                } catch (error) {
                    console.error(`Error al crear el archivo HTML: ${error}`);
                    res.status(500).json({ success: false, message: "Error al crear el archivo HTML del video" });
                }
            });
        })
        .catch((error) => {
            console.error("Error en las consultas paralelas:", error);
            res.status(500).json({ success: false, message: "Error al realizar las consultas necesarias" });
        });
    });
});

app.get("/obtener-video-link", (req, res) => {
    const { nombreTema } = req.query;

    if (!nombreTema) {
        return res.status(400).json({ success: false, message: "Falta el nombre del tema." });
    }

    const query = `
        SELECT videos.link_video
        FROM videos
        JOIN temas ON videos.nombre_video = temas.nombre_tema
        WHERE temas.nombre_tema = ?
    `;

    db.query(query, [nombreTema], (error, results) => {
        if (error) {
            console.error("Error al obtener el link del video:", error);
            return res.status(500).json({ success: false, message: "Error al obtener el link del video." });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "No se encontró un video para el tema proporcionado." });
        }

        res.json({ success: true, link_video: results[0].link_video });
    });
});

app.delete("/eliminar-video/:nombreCurso/:nombreVideo", (req, res) => {
    const { nombreCurso, nombreVideo } = req.params;

    // Eliminar el video de la base de datos
    const query = `
        DELETE FROM videos
        WHERE nombre_curso = ? AND nombre_video = ?
    `;

    db.query(query, [nombreCurso, nombreVideo], (error, results) => {
        if (error) {
            console.error("Error al eliminar el video en la base de datos:", error);
            return res.status(500).json({ success: false, message: "Error al eliminar el video en la base de datos." });
        }

        if (results.affectedRows === 0) {
            console.warn("No se encontró el video en la base de datos:", { nombreCurso, nombreVideo });
            // Seguimos con la eliminación del archivo HTML, pero informamos que no se encontró el video
        }

        // Ruta del archivo HTML del video
        const videoFolderPath = path.join(__dirname, `../Proyecto_Cursos_Web/Prueba/${nombreCurso}`);
        const videoFilePath = path.join(videoFolderPath, `VideoClase${nombreVideo}.html`);

        let archivoEliminado = false;

        try {
            // Verificar si el archivo existe antes de eliminarlo
            if (fs.existsSync(videoFilePath)) {
                fs.unlinkSync(videoFilePath); // Eliminar el archivo HTML
                console.log(`Archivo HTML eliminado exitosamente: ${videoFilePath}`);
                archivoEliminado = true;
            } else {
                console.warn(`El archivo HTML no existe: ${videoFilePath}`);
            }
        } catch (error) {
            console.error("Error al intentar eliminar el archivo HTML:", error);
            return res.status(500).json({ success: false, message: "Error al eliminar el archivo HTML." });
        }

        // Respuesta exitosa si al menos uno de los dos (video o archivo HTML) fue eliminado
        if (results.affectedRows > 0 || archivoEliminado) {
            return res.json({ success: true, message: "Video y/o archivo HTML eliminados correctamente." });
        }

        // Si no se encontró el video ni el archivo, informamos de esto
        res.status(404).json({ success: false, message: "No se encontró el video ni el archivo HTML." });
    });
});

// Endpoint para cambiar el estado de un tema a "N"
app.put("/eliminar-tema-oficial/:id", (req, res) => {
    const { id } = req.params;

    const query = `
        UPDATE temas
        SET estado = 'N'
        WHERE id = ?
    `;

    db.query(query, [id], (error, results) => {
        if (error) {
            console.error("Error al actualizar el estado del tema:", error);
            return res.status(500).json({ success: false, message: "Error al eliminar el tema." });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Tema no encontrado." });
        }

        res.status(200).json({ success: true, message: "Estado del tema actualizado a 'N'." });
    });
});

app.post("/guardar-examen", (req, res) => {
    const { nombreCurso, preguntas } = req.body;  // Recibimos el nombre del curso y las preguntas con alternativas
    
    // Insertamos el examen en la tabla 'examenes'
    const queryExamen = `
        INSERT INTO examenes (nombre_curso, estado) 
        VALUES (?, 'S')
    `;

    db.query(queryExamen, [nombreCurso], (error, results) => {
        if (error) {
            console.error("Error al insertar el examen:", error);
            return res.status(500).json({ success: false, message: "Error al insertar el examen." });
        }

        const examenId = results.insertId;  // ID del examen recién insertado

        // Insertamos las preguntas y sus alternativas
        const queryPregunta = `
            INSERT INTO preguntas (nombre_examen, texto) 
            VALUES (?, ?)
        `;

        preguntas.forEach((pregunta, preguntaIndex) => {
            db.query(queryPregunta, [nombreCurso, pregunta.texto], (error, resultsPregunta) => {
                if (error) {
                    console.error("Error al insertar la pregunta:", error);
                    return res.status(500).json({ success: false, message: "Error al insertar la pregunta." });
                }

                const preguntaId = resultsPregunta.insertId; // ID de la pregunta recién insertada

                // Insertamos las alternativas para esta pregunta
                const queryAlternativa = `
                    INSERT INTO alternativas (nombre_pregunta, texto, correcta) 
                    VALUES (?, ?, ?)
                `;

                pregunta.alternativas.forEach((alternativa, alternativaIndex) => {
                    const esCorrecta = alternativaIndex == pregunta.respuestaCorrecta ? 1 : 0;  // La correcta es la que coincide con la respuesta seleccionada
                    db.query(queryAlternativa, [pregunta.texto, alternativa.texto, esCorrecta], (error, resultsAlternativa) => {
                        if (error) {
                            console.error("Error al insertar la alternativa:", error);
                            return res.status(500).json({ success: false, message: "Error al insertar la alternativa." });
                        }
                    });
                });
            });
        });

        // Crear el archivo HTML con el examen
        const examenFolderPath = path.join(__dirname, `../NEXUS_ACADEMY/Interfaz/Cursos y video/${nombreCurso}/examen`);
        const examenHTMLPath = path.join(examenFolderPath, "examen.html");

        try {
            // Crear la carpeta para el examen si no existe
            fs.mkdirSync(examenFolderPath, { recursive: true });

            // Generar el contenido HTML para el examen
            let examenHTMLContent = `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>Examen de ${nombreCurso}</title>
                    <link rel="stylesheet" href="styleExamen.css" />
                    <link rel="icon" href="../IMG/GUIMARBOT.ico" type="image/x-icon">
                </head>
                <body>
                    <h1>Examen de ${nombreCurso}</h1>
                    <form id="exam-form">
            `;

            // Agregar preguntas y alternativas al contenido HTML
            preguntas.forEach((pregunta, preguntaIndex) => {
                examenHTMLContent += `
                    <div class="question">
                        <p>${preguntaIndex + 1}. ${pregunta.texto}</p>
                `;
                pregunta.alternativas.forEach((alternativa, alternativaIndex) => {
                    examenHTMLContent += `
                        <label>
                            <input type="radio" name="q${preguntaIndex + 1}" value="${alternativaIndex}" />
                            ${alternativa.texto}
                        </label><br />
                    `;
                });
                examenHTMLContent += `</div>`;
            });

            examenHTMLContent += `
                    <button type="button" onclick="calcularResultado()">Enviar</button>
                    <button id="boton-certificado" style="display:none;" onclick="imprimirCertificado()">Imprimir Certificado</button>
                </form>
            </body>
            </html>
            `;

            // Escribir el archivo HTML
            fs.writeFileSync(examenHTMLPath, examenHTMLContent);

            // Devolver una respuesta exitosa
            res.json({ success: true, message: "Examen creado exitosamente y HTML generado." });

        } catch (error) {
            console.error("Error al crear el archivo HTML del examen:", error);
            res.status(500).json({ success: false, message: "Error al crear el archivo HTML del examen." });
        }
    });
});

app.post('/guardar-pago', (req, res) => {
    const detalles = req.body;

    // Extraer los datos necesarios
    const id_usuario = detalles.payer.payer_id; // Asume que mapeas el payer_id con un usuario existente.
    const id_transaccion = detalles.id;
    const monto = detalles.purchase_units[0].amount.value; // Obtiene el monto del pago.
    const tipo_pago = 'PAYPAL'; // Puedes definir el tipo de pago según tu sistema.
    const plan = 'BÁSICO'; // Cambia esto según corresponda.
    const fecha_pago = new Date(detalles.update_time); // Convierte a formato de fecha.
    const fecha_vencimiento = new Date(); // Por ejemplo, +1 mes de vigencia.
    fecha_vencimiento.setMonth(fecha_vencimiento.getMonth() + 1);
    const estado = 'S'; // Asume que 'S' significa activo.

    // Consulta SQL para insertar en la tabla `pagos`
    const query = `
        INSERT INTO pagos (id_usuario, id_transaccion, monto, tipo_pago, plan, fecha_pago, fecha_vencimiento, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Ejecutar la consulta
    db.query(query, [id_usuario, id_transaccion, monto, tipo_pago, plan, fecha_pago, fecha_vencimiento, estado], (err, results) => {
        if (err) {
            console.error('Error al insertar en la base de datos:', err);
            res.status(500).send('Error al guardar los datos del pago.');
            return;
        }

        console.log('Pago guardado exitosamente:', results);
        res.status(200).send('Pago guardado correctamente.');
    });
});

// Ruta para obtener los pagos
app.get('/obtener-pagos', (req, res) => {
    db.query(
      `
          SELECT u.id AS id_usuario, p.id_transaccion, p.monto, p.tipo_pago, p.plan, p.fecha_pago, p.fecha_vencimiento, p.estado
          FROM pagos p
          INNER JOIN usuarios u ON p.id_usuario = u.id
          WHERE p.estado = "S"`,
      (err, results) => {
        if (err) {
          console.error("Error al obtener pagos:", err);
          return res.json({ success: false, message: "Error al obtener datos" });
        }
        res.json({ success: true, pagos: results });
      }
    );
  });

// Ruta para actualizar el estado del pago a 'N'
app.post('/eliminar-pago', (req, res) => {
    const { id, tipo } = req.body;

    // Seleccionar el campo correcto basado en el tipo
    const campo = tipo === 'transaccion' ? 'id_transaccion' : 'id_usuario';

    db.query(
        `UPDATE pagos SET estado = "N" WHERE ${campo} = ?`,
        [id],
        (err, results) => {
            if (err) {
                console.error('Error al actualizar el estado del pago:', err);
                return res.json({ success: false, message: 'Error al eliminar pago' });
            }
            res.json({ success: true, message: 'Pago eliminado exitosamente' });
        }
    );
});

// Ruta para obtener los pagos
app.get('/obtener-becas', (req, res) => {
    db.query(`
        SELECT u.id AS id_usuario, b.id_beca, u.nombres AS nombres_usuario, u.apellidos AS apellidos_usuario, b.fecha, b.estado
        FROM becas b
        INNER JOIN usuarios u ON b.id_usuario = u.id
        WHERE b.estado = "S"`, 
    (err, results) => {
        if (err) {
            console.error('Error al obtener pagos:', err);
            return res.json({ success: false, message: 'Error al obtener datos' });
        }
        res.json({ success: true, becas: results });
    });
});

// Ruta para actualizar el estado del administrador a 'N'
app.post('/eliminar-beca', (req, res) => {
    const { id } = req.body;

    db.query(
        'UPDATE becas SET estado = "N" WHERE id_beca = ?',
        [id],
        (err, results) => {
            if (err) {
                console.error('Error al actualizar el estado del usuario:', err);
                return res.json({ success: false, message: 'Error al eliminar usuario' });
            }
            res.json({ success: true, message: 'Usuario eliminado exitosamente' });
        }
    );
});

// Ruta para obtener los pagos
app.get('/obtener-certificados', (req, res) => {
    db.query(`
        SELECT u.id AS id_usuario, c.id_certificado, c.tipo_certificado, c.fecha_emision, c.estado
        FROM certificados c
        INNER JOIN usuarios u ON c.id_usuario = u.id
        WHERE c.estado = "S"`, 
    (err, results) => {
        if (err) {
            console.error('Error al obtener pagos:', err);
            return res.json({ success: false, message: 'Error al obtener datos' });
        }
        res.json({ success: true, certificados: results });
    });
});

// Ruta para actualizar el estado del administrador a 'N'
app.post('/eliminar-certificado', (req, res) => {
    const { id } = req.body;

    db.query(
        'UPDATE certificados SET estado = "N" WHERE id_certificado = ?',
        [id],
        (err, results) => {
            if (err) {
                console.error('Error al actualizar el estado del usuario:', err);
                return res.json({ success: false, message: 'Error al eliminar usuario' });
            }
            res.json({ success: true, message: 'Usuario eliminado exitosamente' });
        }
    );
});

// Ruta para "Cuentas creadas" con filtro de periodo
app.get('/cuentas-creadas/:periodo', (req, res) => {
    const { periodo } = req.params;
    let query = '';

    // Configurar la consulta SQL según el período
    switch (periodo) {
        case 'diario':
            query = `
                SELECT DATE(fecha_registro) AS periodo, COUNT(*) AS cantidad
                FROM usuarios
                WHERE estado = 'S'
                GROUP BY DATE(fecha_registro)
                ORDER BY DATE(fecha_registro) DESC
                LIMIT 7;
            `;
            break;
        case 'semanal':
            query = `
                SELECT YEAR(fecha_registro) AS year, WEEK(fecha_registro) AS periodo, COUNT(*) AS cantidad
                FROM usuarios
                WHERE estado = 'S'
                GROUP BY year, periodo
                ORDER BY year DESC, periodo DESC
                LIMIT 7;
            `;
            break;
        case 'mensual':
            query = `
                SELECT YEAR(fecha_registro) AS year, MONTH(fecha_registro) AS periodo, COUNT(*) AS cantidad
                FROM usuarios
                WHERE estado = 'S'
                GROUP BY year, periodo
                ORDER BY year DESC, periodo DESC
                LIMIT 12;
            `;
            break;
        case 'anual':
            query = `
                SELECT YEAR(fecha_registro) AS periodo, COUNT(*) AS cantidad
                FROM usuarios
                WHERE estado = 'S'
                GROUP BY periodo
                ORDER BY periodo DESC
                LIMIT 5;
            `;
            break;
        default:
            return res.status(400).json({ error: 'Período no válido' });
    }

    // Ejecutar la consulta
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error ejecutando la consulta:', err);
            return res.status(500).json({ error: 'Error al obtener los datos' });
        }

        // Formatear y enviar los resultados
        const formattedResults = results.map(row => ({
            periodo: (periodo === 'mensual' || periodo === 'anual')
                ? `${row.year || ''}-${row.periodo}`
                : row.periodo,
            cantidad: row.cantidad
        }));
        res.json(formattedResults);
    });
});

// Ruta para "Cuentas creadas" con filtro de periodo
app.get('/docentes-registrados/:periodo', (req, res) => {
    const { periodo } = req.params;
    let query = '';

    // Configurar la consulta SQL según el período
    switch (periodo) {
        case 'diario':
            query = `
                SELECT DATE(fecha_registro) AS periodo, COUNT(*) AS cantidad
                FROM profesores
                WHERE estado = 'S'
                GROUP BY DATE(fecha_registro)
                ORDER BY DATE(fecha_registro) DESC
                LIMIT 7;
            `;
            break;
        case 'semanal':
            query = `
                SELECT YEAR(fecha_registro) AS year, WEEK(fecha_registro) AS periodo, COUNT(*) AS cantidad
                FROM profesores
                WHERE estado = 'S'
                GROUP BY year, periodo
                ORDER BY year DESC, periodo DESC
                LIMIT 7;
            `;
            break;
        case 'mensual':
            query = `
                SELECT YEAR(fecha_registro) AS year, MONTH(fecha_registro) AS periodo, COUNT(*) AS cantidad
                FROM profesores
                WHERE estado = 'S'
                GROUP BY year, periodo
                ORDER BY year DESC, periodo DESC
                LIMIT 12;
            `;
            break;
        case 'anual':
            query = `
                SELECT YEAR(fecha_registro) AS periodo, COUNT(*) AS cantidad
                FROM profesores
                WHERE estado = 'S'
                GROUP BY periodo
                ORDER BY periodo DESC
                LIMIT 5;
            `;
            break;
        default:
            return res.status(400).json({ error: 'Período no válido' });
    }

    // Ejecutar la consulta
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error ejecutando la consulta:', err);
            return res.status(500).json({ error: 'Error al obtener los datos' });
        }

        // Formatear y enviar los resultados
        const formattedResults = results.map(row => ({
            periodo: (periodo === 'mensual' || periodo === 'anual')
                ? `${row.year || ''}-${row.periodo}`
                : row.periodo,
            cantidad: row.cantidad
        }));
        res.json(formattedResults);
    });
});

// Ruta para "Cuentas becadas" con filtro de periodo
app.get('/cuentas-becadas/:periodo', (req, res) => {
    const { periodo } = req.params;
    let query = '';

    // Configurar la consulta SQL según el período
    switch (periodo) {
        case 'diario':
            query = `
                SELECT DATE(fecha_registro) AS periodo, COUNT(*) AS cantidad
                FROM usuarios
                WHERE estado = 'S' AND beca != 'Sin beca'
                GROUP BY DATE(fecha_registro)
                ORDER BY DATE(fecha_registro) DESC
                LIMIT 7;
            `;
            break;
        case 'semanal':
            query = `
                SELECT YEAR(fecha_registro) AS year, WEEK(fecha_registro) AS periodo, COUNT(*) AS cantidad
                FROM usuarios
                WHERE estado = 'S' AND beca != 'Sin beca'
                GROUP BY year, periodo
                ORDER BY year DESC, periodo DESC
                LIMIT 7;
            `;
            break;
        case 'mensual':
            query = `
                SELECT YEAR(fecha_registro) AS year, MONTH(fecha_registro) AS periodo, COUNT(*) AS cantidad
                FROM usuarios
                WHERE estado = 'S' AND beca != 'Sin beca'
                GROUP BY year, periodo
                ORDER BY year DESC, periodo DESC
                LIMIT 12;
            `;
            break;
        case 'anual':
            query = `
                SELECT YEAR(fecha_registro) AS periodo, COUNT(*) AS cantidad
                FROM usuarios
                WHERE estado = 'S' AND beca != 'Sin beca'
                GROUP BY periodo
                ORDER BY periodo DESC
                LIMIT 5;
            `;
            break;
        default:
            return res.status(400).json({ error: 'Período no válido' });
    }

    // Ejecutar la consulta
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error ejecutando la consulta:', err);
            return res.status(500).json({ error: 'Error al obtener los datos' });
        }

        // Formatear y enviar los resultados
        const formattedResults = results.map(row => ({
            periodo: (periodo === 'mensual' || periodo === 'anual')
                ? `${row.year || ''}-${row.periodo}`
                : row.periodo,
            cantidad: row.cantidad
        }));
        res.json(formattedResults);
    });
});

// Ruta para "Estudiantes con suscripción anual" con filtro de periodo
app.get('/estudiantes-anuales/:periodo', (req, res) => {
    const { periodo } = req.params;
    let query = '';

    // Configurar la consulta SQL según el período
    switch (periodo) {
        case 'diario':
            query = `
                SELECT DATE(fecha_registro) AS periodo, COUNT(*) AS cantidad
                FROM usuarios
                WHERE estado = 'S' AND plan = 'experto'
                GROUP BY DATE(fecha_registro)
                ORDER BY DATE(fecha_registro) DESC
                LIMIT 7;
            `;
            break;
        case 'semanal':
            query = `
                SELECT YEAR(fecha_registro) AS year, WEEK(fecha_registro) AS periodo, COUNT(*) AS cantidad
                FROM usuarios
                WHERE estado = 'S' AND plan = 'experto'
                GROUP BY year, periodo
                ORDER BY year DESC, periodo DESC
                LIMIT 7;
            `;
            break;
        case 'mensual':
            query = `
                SELECT YEAR(fecha_registro) AS year, MONTH(fecha_registro) AS periodo, COUNT(*) AS cantidad
                FROM usuarios
                WHERE estado = 'S' AND plan = 'experto'
                GROUP BY year, periodo
                ORDER BY year DESC, periodo DESC
                LIMIT 12;
            `;
            break;
        case 'anual':
            query = `
                SELECT YEAR(fecha_registro) AS periodo, COUNT(*) AS cantidad
                FROM usuarios
                WHERE estado = 'S' AND plan = 'experto'
                GROUP BY periodo
                ORDER BY periodo DESC
                LIMIT 5;
            `;
            break;
        default:
            return res.status(400).json({ error: 'Período no válido' });
    }

    // Ejecutar la consulta
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error ejecutando la consulta:', err);
            return res.status(500).json({ error: 'Error al obtener los datos' });
        }

        // Formatear y enviar los resultados
        const formattedResults = results.map(row => ({
            periodo: (periodo === 'mensual' || periodo === 'anual')
                ? `${row.year || ''}-${row.periodo}`
                : row.periodo,
            cantidad: row.cantidad
        }));
        res.json(formattedResults);
    });
});

//grafico de porcentajes
app.get("/porcentajes-plansuser", (req, res) => {
    const query = `
        SELECT 
            SUM(CASE WHEN plan = 'basico' THEN 1 ELSE 0 END) AS total_plan_basico,
            SUM(CASE WHEN plan = 'medio' THEN 1 ELSE 0 END) AS total_plan_medio,
            SUM(CASE WHEN plan = 'experto' THEN 1 ELSE 0 END) AS total_plan_experto
        FROM usuarios
    `;
  
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error al obtener usuarios:", err);
            // Asegúrate de devolver solo una respuesta en caso de error.
            if (!res.headersSent) {
            return res.json({ success: false, message: "Error al obtener datos" });
            }
        }
    
        // Verifica que results tenga datos antes de acceder a results[0]
        if (!results || results.length === 0) {
            if (!res.headersSent) {
            return res.json({ success: false, message: "No se encontraron datos" });
            }
        }
    
        const data = results[0]; // Tomar el primer objeto
        const total = data.total_usuarios;
    
        // Verificar si el total es 0 para evitar división por 0
        if (total === 0) {
            if (!res.headersSent) {
            return res.json({
                total_plan_basico: 0,
                total_plan_medio: 0,
                total_plan_experto: 0,
            });
            }
        }
    
        const response = {
            total_plan_basico: data.total_plan_basico,
            total_plan_medio: data.total_plan_medio,
            total_plan_experto: data.total_plan_experto,
        };
    
        if (!res.headersSent) {
            res.json(response);
        }
    });
});
  
app.get("/user-becado", (req, res) => {
    const query = `
        SELECT 
            SUM(CASE WHEN beca = 'beca guimarbot' THEN 1 ELSE 0 END) AS total_becados,
            COUNT(*) - SUM(CASE WHEN beca = 'beca guimarbot' THEN 1 ELSE 0 END) AS total_no_becados
        FROM usuarios;
    `;
  
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error al obtener datos de becas:", err);
            if (!res.headersSent) {
            return res.json({ success: false, message: "Error al obtener datos" });
            }
        }
    
        // Verificar si hay resultados antes de acceder
        if (!results || results.length === 0) {
            if (!res.headersSent) {
            return res.json({ success: false, message: "No se encontraron datos" });
            }
        }
    
        const data = results[0]; // Tomar el primer objeto del array de resultados
    
        const response = {
            total_becados: data.total_becados || 0,
            total_no_becados: data.total_no_becados || 0,
        };
    
        if (!res.headersSent) {
            res.json(response);
        }
    });
});
  
app.get("/pagos-por-dia", (req, res) => {
    const query = `
        SELECT 
            DATE(fecha_pago) AS fecha, 
            SUM(monto) AS monto_total
        FROM 
            pagos
        WHERE 
            fecha_pago IS NOT NULL AND estado = 'S'
        GROUP BY 
            DATE(fecha_pago);
    `;
  
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error al obtener datos de pagos:", err);
            if (!res.headersSent) {
            return res.json({ success: false, message: "Error al obtener datos" });
            }
        }
    
        // Verificar si hay resultados antes de acceder
        if (!results || results.length === 0) {
            if (!res.headersSent) {
            return res.json({ success: false, message: "No se encontraron datos" });
            }
        }
    
        const response = {
            success: true,
            data: results.map((row) => ({
            fecha: row.fecha,
            monto_total: row.monto_total,
            })),
        };
    
        if (!res.headersSent) {
            res.json(response);
        }
    });
});

// Ruta para obtener los pagos
app.get('/obtener-mensajes', (req, res) => {
    db.query(`
        SELECT m.id_mensaje, u.username AS de, m.asunto, m.mensaje, m.correo, m.fecha, m.estado
        FROM mensajes m
        INNER JOIN usuarios u ON m.de = u.username
        WHERE m.estado = "S"`, 
    (err, results) => {
        if (err) {
            console.error('Error al obtener mensajes:', err);
            return res.json({ success: false, message: 'Error al obtener datos' });
        }
        res.json({ success: true, mensajes: results });
    });
});

// Ruta para actualizar el estado del administrador a 'N'
app.post('/cambiar-vista', (req, res) => {
    const { id } = req.body;

    db.query(
        'UPDATE mensajes SET estado = "V" WHERE id_mensaje = ?',
        [id],
        (err, results) => {
            if (err) {
                console.error('Error al actualizar el estado del mensaje:', err);
                return res.json({ success: false, message: 'Error al cambiar vista del mensaje' });
            }
            res.json({ success: true, message: 'Mensaje visto' });
        }
    );
});

// Ruta para obtener los pagos
app.get('/obtener-mensajes-leidos', (req, res) => {
    db.query(`
        SELECT m.id_mensaje, u.username AS de, m.asunto, m.mensaje, m.correo, m.fecha, m.estado
        FROM mensajes m
        INNER JOIN usuarios u ON m.de = u.username
        WHERE m.estado = "V"`, 
    (err, results) => {
        if (err) {
            console.error('Error al obtener mensajes:', err);
            return res.json({ success: false, message: 'Error al obtener datos' });
        }
        res.json({ success: true, mensajes: results });
    });
});

// Ruta para actualizar el estado del administrador a 'N'
app.post('/eliminar-mensaje', (req, res) => {
    const { id } = req.body;

    db.query(
        'UPDATE mensajes SET estado = "N" WHERE id_mensaje = ?',
        [id],
        (err, results) => {
            if (err) {
                console.error('Error al actualizar el estado del mensaje:', err);
                return res.json({ success: false, message: 'Error al eliminar mensaje' });
            }
            res.json({ success: true, message: 'Mensaje eliminado exitosamente' });
        }
    );
});


// Ruta para verificar el plan del usuario
app.get('/verificar-plan/:id', (req, res) => {
    const { id } = req.params;
    // Consulta a la base de datos para obtener el plan del usuario
    db.query(
        'SELECT plan FROM usuarios WHERE id = ?',
        [id],
        (err, results) => {
            if (err) {
                console.error('Error al verificar el plan:', err);
                return res.status(500).json({ success: false, message: 'Error al obtener el plan del usuario' });
            }

            if (results.length === 0) {
                return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            }

            // Devuelve el plan del usuario
            const plan = results[0].plan;
            res.json({ success: true, plan });
        }
    );
});
app.post('/actualizar-plan', (req, res) => {
    const { id, plan } = req.body;

    // Verificar que los datos están presentes
    if (!id || !plan) {
        return res.status(400).json({ success: false, message: 'Datos inválidos' });
    }

    // Validar el plan
    const planesValidos = ['basico', 'premium'];  // Lista de planes permitidos
    if (!planesValidos.includes(plan)) {
        return res.status(400).json({ success: false, message: 'Plan no válido' });
    }

    // Actualizar el plan del usuario en la base de datos
    db.query(
        'UPDATE usuarios SET plan = ? WHERE id = ?',
        [plan, id],
        (err, results) => {
            if (err) {
                console.error('Error al actualizar el plan del usuario:', err);
                return res.status(500).json({ success: false, message: 'Error al actualizar el plan' });
            }

            // Verificar si se actualizó alguna fila (usuario encontrado)
            if (results.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            }

            // Si la actualización fue exitosa
            res.json({ success: true, message: 'Plan actualizado correctamente' });
        }
    );
});


// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
