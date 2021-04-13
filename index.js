'use strict'

const mongoose = require('mongoose');
mongoose.set('useUnifiedTopology', true);
mongoose.set('useNewUrlParser', true);
const mdb = require('moviedb')('1acd0c7bc48f18ba631625da81edf46a');
const Pelicula = require('./models/pelicula');
const Serie = require('./models/serie');
const Profesional = require('./models/profesional');
const https = require('https');


mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TFGdb')
    .then(() => {
        console.log("Conexión realizada con éxito");
        main();
    }).catch(err => console.log('error no se pudo realizar la conexión'));

let stdin = process.openStdin();

function streaming(id, peli) {
    let url = 'https://api.themoviedb.org/3/movie/'+id+'/watch/providers?api_key=1acd0c7bc48f18ba631625da81edf46a';
    https.get(url, (resp) => {
        let data = '';

        // Un fragmento de datos ha sido recibido.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // Toda la respuesta ha sido recibida. Imprimir el resultado.
        resp.on('end', () => {
            console.log(JSON.parse(data).result);
            JSON.parse(data).results.ES.flatrate.forEach(element => {
                peli.plataformas.push({
                    nombre: element.provider_name,
                    icono: "https://www.themoviedb.org/t/p/original" + element.logo_path
                })
            })
            peli.save();
            console.log("Peli Guardado");
            stdin.removeAllListeners();
            main();
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
   /* mdb.movieWatchProviders({ id: id, language: 'es' }, (err, res) => {
        if (res) {
            res.results.ES.flatrate.forEach(element => {
                peli.plataforma.push({
                    nombre: element.provider_name,
                    icono: "https://www.themoviedb.org/t/p/original" + element.logo_path
                })
            })
        }
    })*/
}

function videoPeli(id, peli) {
    mdb.movieVideos({ id: id, language: 'es' }, (err, res) => {
        let trailer;
        if (res) {
            res.results.forEach(element => {
                trailer = "https://www.youtube.com/embed/" + element.key;
            })
            peli.trailer = trailer;
        }
        streaming(id, peli);
    });
}

function castPeli(id, peli) {
    mdb.movieCredits({ id: id, language: 'es' }, (err, res) => {
        if (res) {
            res.cast.forEach(element => {
                peli.actores.push({ nombre: element.name, personaje: element.character });
            });
            res.crew.forEach(element => {
                if (element.job == 'Director') {
                    peli.directores.push(element.name);
                }
            });
        }
        videoPeli(id, peli);
    });

}

function infoPeli(id, peli) {
    Pelicula.countDocuments({}, (err, count) => {
        console.log('-----------');
        console.log(count);
        console.log('-----------');
        peli.id_peli = count + 1;
    });

    mdb.movieInfo({ id: id, language: 'es' }, (err, res) => {
        console.log('entra');
        if (res) {
            peli.titulo = res.title;
            peli.titulo_original = res.original_title;
            peli.sinopsis = res.overview;
            peli.nota_media = null;
            peli.duracion = res.runtime;
            peli.fecha_estreno = res.release_date;
            peli.imagen = "https://image.tmdb.org/t/p/w600_and_h900_bestv2/" + res.poster_path;
            res.genres.forEach(element => {
                peli.generos.push(element.name);
            });
        }
        castPeli(id, peli);
    });
}


function castS(id, serie) {
    mdb.tvCredits({ id: id, language: 'es' }, (err, res) => {
        if (res) {
            res.cast.forEach(element => {
                serie.actores.push({ nombre: element.name, personaje: element.character });
            });
        }
        serie.save();
        console.log("Serie Guardado");
        stdin.removeAllListeners();
        main();
    });

}

function infoSerie(id, serie) {
    Serie.countDocuments({}, (err, count) => {
        serie.id_serie = count + 1;
    });
    mdb.tvInfo({ id: id, language: 'es' }, (err, res) => {
        if (res) {
            serie.titulo = res.name;
            serie.titulo_original = res.original_name;
            serie.sinopsis = res.overview;
            serie.nota_media = null;
            serie.temporadas = res.number_of_seasons;
            serie.capitulos = res.number_of_episodes;
            serie.inicio = res.first_air_date;
            serie.final = res.last_air_date;
            serie.imagen = "https://image.tmdb.org/t/p/w600_and_h900_bestv2/" + res.poster_path;
            res.created_by.forEach(element => {
                serie.creadores.push(element.name);
            });
            res.genres.forEach(element => {
                serie.generos.push(element.name);
            });
        }
        castS(id, serie);
    });
}

function castPr(id, profesional) {
    mdb.personCombinedCredits({ id: id, language: 'es' }, (err, res) => {
        if (res) {
            res.cast.forEach(element => {
                if (element.media_type == 'movie') {
                    profesional.filmografia.push({
                        titulo: element.title,
                        rol: 'Actor',
                        tipo: 'Película',
                        personaje: element.character
                    });
                }
                if (element.media_type == 'tv') {
                    profesional.filmografia.push({
                        titulo: element.name,
                        rol: 'Actor',
                        tipo: 'Serie',
                        personaje: element.character
                    });
                }
            });
            res.crew.forEach(element => {
                if (element.job == 'Director') {
                    if (element.media_type == 'movie') {
                        profesional.filmografia.push({
                            titulo: element.title,
                            rol: 'Director',
                            tipo: 'Película',
                        });
                    }
                }
                if (element.job == 'Creator') {
                    if (element.media_type == 'tv') {
                        profesional.filmografia.push({
                            titulo: element.name,
                            rol: 'Creador',
                            tipo: 'Serie',
                        });
                    }
                }

            });
        }
        profesional.save();
        console.log("Actor Guardado");
        stdin.removeAllListeners();
        main();
    });
}

function infoPr(id, profesional) {
    Profesional.countDocuments({}, (err, count) => {
        profesional.id_profesional = count + 1;
    });
    mdb.personInfo({ id: id, language: 'es' }, (err, res) => {
        if (res) {
            profesional.nombre = res.name;
            profesional.biografia = res.biography;
            profesional.fecha_nacimiento = res.birthday;
            profesional.lugar_nacimiento = res.place_of_birth;
            profesional.imagen = "https://image.tmdb.org/t/p/w600_and_h900_bestv2/" + res.profile_path;
        }
        castPr(id, profesional);
    });
}

function main() {

    let op;
    do {
        console.log('Eije que quieres añadir a la base de datos');
        console.log('1. Añadir películas');
        console.log('2. Añadir series');
        console.log('3. Añadir profesional');
        console.log('0. Salir');
        let opcion = process.openStdin();

        opcion.addListener("data", (d) => {
            op = d.toString().trim();
            opciones(op);
        });
    } while (op = ! '0')

    function opciones(op) {
        switch (op) {
            case '1':
                let peli = new Pelicula();
                console.log('Introduce el id de TMDB de la película que quieras añadir');
                stdin.addListener("data", (p) => {
                    let idPeli = p.toString().trim();
                    infoPeli(idPeli, peli);
                })
                break
            case '2':
                let serie = new Serie();
                console.log('Introduce el id de TMDB de la serie que quieras añadir');
                stdin.addListener("data", (p) => {
                    let idSerie = p.toString().trim();
                    infoSerie(idSerie, serie);
                })
                break
            case '3':
                let profesional = new Profesional();
                console.log('Introduce el id de TMDB del profesioanl que quieras añadir');
                stdin.addListener("data", (p) => {
                    let idPr = p.toString().trim();
                    infoPr(idPr, profesional);
                })
                break
            case '0':
                console.log('FIN');
                process.exit();
        }
    }
}

