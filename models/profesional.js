'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProfesionalSchema = new Schema({
    id_TMDB: Number,
    nombre: String,
    biografia: String,
    fecha_nacimiento: Date,
    lugar_nacimiento: String,
    imagen: String,
    /*filmografia: [{ //De esta forma se añade un identificador
        titulo: String,
        rol: String,
        tipo: String,
        personaje: String,
        pelicula: {type: mongoose.Schema.Types.ObjectId, ref: 'pelicula'},
        serie: {type: mongoose.Schema.Types.ObjectId, ref: 'serie'}
    }]*/
    filmografia:[Object]
});

module.exports = mongoose.model('profesionales', ProfesionalSchema);