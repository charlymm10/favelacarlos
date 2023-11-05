const express = require('express');
const app = express();
const log = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const os = require('os');
const IndexRoutes = require('./routers/index.js');

const ipAddress = '192.168.2.38'; 

app.use(log('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', IndexRoutes);

app.listen(80, ipAddress, () => {
    console.log(`El servidor está funcionando en http://${ipAddress}`);
});

mongoose
    .connect("mongodb+srv://node:favela03@cluster0.wxos6ze.mongodb.net/punto-venta?retryWrites=true&w=majority")
    .then(() => {
        console.log('Conexión a la base de datos establecida');
    })
    .catch((err) => {
        console.error('Error al conectar a la base de datos:', err);
    });

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
