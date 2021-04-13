'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//esquema de los datos de las críticas 
const CriticaSchema = new Schema({
    nota: Number,
    titulo: String,
    texto: String,
    fecha: Date,
    usuario: {type: mongoose.Schema.Types.ObjectId, ref: 'usuario'}
});

//esquema de los datos de los comentarios
const ComentarioSchema = new Schema({
    texto: String,
    fecha: Date,
    usuario: {type: mongoose.Schema.Types.ObjectId, ref: 'usuario'},
    //respuesta: [ComentarioSchema]
})

//esquema de los datos de las películas
const PeliSchema = new Schema({
    id_peli: Number,
    titulo: String,
    titulo_original: String,
    sinopsis: String,
    nota_media: Number,
    generos: [String],
    imagen: String,
    trailer: String,
    duracion: Number,
    fecha_estreno: Date,
    actores: [Object],
    /*actores: [{ //De esta forma se añade un identificador
        nombre: String,
        personaje: String
    }],*/
    directores: [String],
    plataformas: [Object],
    criticas: [CriticaSchema],
    comentarios: [ComentarioSchema]
});

module.exports = mongoose.model('peliculas', PeliSchema);