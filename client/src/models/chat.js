const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Esquema para la colección "chat"
const chatSchema = new Schema({
    nombre: String,
    mensaje: String,
}, {
    versionKey: false 
});

// Esquema para la colección "cuentas"
const cuentaSchema = new Schema({
    nombre: {
        type: String,
        required: true
    },
    contraseña: {
        type: String,
        required: true
    },
    correo: {
        type: String,
        required: true
    },
}, {
    versionKey: false 
});


  module.exports = {
    chatModel: mongoose.model('chat', chatSchema),
    cuentaModel: mongoose.model('cuentas', cuentaSchema),
};