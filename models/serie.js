'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//esquema de los datos de las críticas 
const CriticaSchema = new Schema({
    nota: Number,
    nick: String,
    titulo: String,
    texto: String,
    fecha: Date,
    usuario_model: Number,
    usuario: {type: mongoose.Schema.Types.ObjectId, ref: 'usuario'}
});

//esquema de los datos de los comentarios
const ComentarioSchema = new Schema({
    texto: String,
    fecha: Date,
    usuario: {type: mongoose.Schema.Types.ObjectId, ref: 'usuario'},
    //respuesta: [ComentarioSchema]
});

//esquema de los datos de las películas
const SerieSchema = new Schema({
    id_model: Number,
    id_TMDB: Number,
    titulo: String,
    titulo_original: String,
    sinopsis: String,
    nota_media: Number,
    generos: [String],
    imagen: String,
    trailer_es: String,
    trailer_en: String,
    temporadas: Number,
    capitulos: Number,
    inicio: Date,
    final: Date,
    actores: [Object],
    creadores: [String],
    plataformas: [Object],
    criticas: [CriticaSchema],
    comentarios: [ComentarioSchema]
});

module.exports = mongoose.model('series', SerieSchema);