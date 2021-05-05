'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const peliculaSchema = new Schema({
    pelicula: {type: mongoose.Schema.Types.ObjectId, ref: 'pelicula'},
    titulo: String,
    imagen: String,
    nota: Number
});

const serieSchema = new Schema({
    serie: {type: mongoose.Schema.Types.ObjectId, ref: 'serie'},
    titulo: String,
    imagen: String,
    nota: Number
});

//esquema de los datos de los usuarios
const UsuarioSchema = Schema({
    id_model: Number,
    nombre: String,
    email: String,
    pass: String,
    descripcion: String,
    nick: String,
    imagen: String,
    seguidores: Array[{ 
        nick: String,
        usuario: {type: mongoose.Schema.Types.ObjectId, ref: 'usuario'}
    }],
    seguidos: Array[{
        nick: String, 
        usuario: {type: mongoose.Schema.Types.ObjectId, ref: 'usuario'}
    }],
    peliculas: Array[peliculaSchema],
    series: Array[serieSchema]
});

module.exports = mongoose.model('usuario', UsuarioSchema);