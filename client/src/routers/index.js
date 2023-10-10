const express = require('express');
const router = express.Router();
const { chatModel, cuentaModel } = require('../models/chat');
const session = require('express-session');

// Configurar express-session
router.use(
  session({
    secret: 'secret', 
    resave: false,
    saveUninitialized: true,
  })
);

// Variable para rastrear el estado de autenticación
let usuarioAutenticado = false;

// Verificar la autenticación
const verificarAutenticacion = (req, res, next) => {
  if (usuarioAutenticado || req.session.usuarioAutenticado) {
    // Si el usuario está autenticado, permite el acceso a la ruta del chat
    next();
  } else {
    // Si el usuario no está autenticado, redirige a la página de inicio de sesión
    res.redirect('/login');
  }
};

// Ruta principal que muestra la vista de registro
router.get('/', async (req, res) => {
  try {
    const datos = await obtenerDatos(); 
    res.render('index.ejs', { datos }); // Pasa los datos a la vista
  } catch (error) {
    console.error('Error al obtener los datos:', error);
    res.status(500).send('Error en el servidor');
  }
});

// Ruta para manejar POST
router.post('/registro', async (req, res) => {
  try {
   
    const { nombre, correo, contraseña } = req.body;

    // Validación de datos 
    if (!nombre || !correo || !contraseña) {
      return res.render('registro.ejs', {
        error: 'Nombre, correo y contraseña son obligatorios',
      });
    }

    // Crea una nueva instancia del modelo cuentaModel
    const nuevaCuenta = new cuentaModel({
      nombre,
      correo, 
      contraseña,
    });

    // Guarda la cuenta en la base de datos
    await nuevaCuenta.save();

    // Redirige después del registro exitoso
    res.redirect('/login'); 
  } catch (error) {
    console.error('Error al registrar la cuenta:', error);
    res.status(500).send('Error en el servidor');
  }
});

// Ruta para mostrar login
router.get('/login', (req, res) => {
  res.render('login.ejs');
});
router.get('/registro', (req, res) => {
  res.render('registro.ejs'); 
});

// autenticación POST
router.post('/login', async (req, res) => {
  try {
    const { nombre, contraseña } = req.body;

    // Consulta la base de datos para verificar la autenticación
    const cuenta = await cuentaModel.findOne({ nombre, contraseña });

    if (cuenta) {
      // La autenticación es exitosa, establece el indicador de autenticación en verdadero
      usuarioAutenticado = true;

      // Guarda el nombre de usuario en la sesión
      req.session.nombreUsuario = nombre;
      req.session.usuarioAutenticado = true;

      // Redirige automáticamente al chat
      res.redirect('/chat'); 
    } else {
      // Si falla, redirige de nuevo al login
      res.render('login.ejs', { error: 'Nombre o contraseña incorrectos' });
    }
  } catch (error) {
    console.error('Error al autenticar:', error);
    res.status(500).send('Error en el servidor');
  }
});

//envío de mensajes del chat
router.post('/send', async (req, res) => {
  try {
    const { nombre, mensaje } = req.body;

    // Validación de datos 
    if (!nombre || !mensaje) {
      return res.status(400).json({ error: 'Nombre y mensaje son obligatorios' });
    }

    // Crea una nueva instancia de chatModel
    const nuevoMensaje = new chatModel({
      nombre,
      mensaje,
    });

    //Guarda el mensaje en la base de datos
    await nuevoMensaje.save();

    // Redirige de nuevo a la página de chat
    res.redirect('/chat');
  } catch (error) {
    console.error('Error al enviar el mensaje:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Ruta para cerrar la sesión
router.get('/logout', (req, res) => {
  // Destruye la sesión y redirige al inicio de sesión
  req.session.destroy(() => {
    usuarioAutenticado = false;
    res.redirect('/login');
  });
});

// Ruta  protegida por la verificación de autenticación
router.get('/chat', verificarAutenticacion, async (req, res) => {
  try {
    //obtener los mensajes del chat de la bd
    const mensajes = await chatModel.find(); 
    // pasar los mensajes como 'datos' y el nombre de usuario
    res.render('index.ejs', {
      datos: mensajes,
      nombreUsuario: req.session.nombreUsuario, // Obténr el nombre de usuario de la sesión
    });
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).send('Error en el servidor');
  }
});


module.exports = router;
