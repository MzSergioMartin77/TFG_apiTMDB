'use strict'

const mongoose = require('mongoose');
//mongoose.set('useUnifiedTopology', true);
//mongoose.set('useNewUrlParser', true);
const mdb = require('moviedb')('1acd0c7bc48f18ba631625da81edf46a');
const Pelicula = require('./models/pelicula');
const Serie = require('./models/serie');
const Profesional = require('./models/profesional');
const https = require('https');
const fs = require('fs');
const PythonS = require('python-shell');
const {exec} = require("child_process");
const {spawn} = require('child_process');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TFGdb')
    .then(() => {
        console.log("");

    }).catch(err => console.log('Error no se pudo realizar la conexión'));
main();
let stdin = process.openStdin();

function streamingPeli(id, peli, state) {
    let url = 'https://api.themoviedb.org/3/movie/' + id + '/watch/providers?api_key=1acd0c7bc48f18ba631625da81edf46a';
    https.get(url, (resp) => {
        let data = '';

        resp.on('data', (chunk) => {
            data += chunk;
        });

        resp.on('end', () => {
            /*if (!JSON.parse(data).results.ES) {
                console.log('No esta');
            }
            else {
                if (!JSON.parse(data).results.ES.flatrate) {
                    console.log('No esta en ninguna plataforma de streaming')
                }*/
            if (JSON.parse(data).results.ES) {
                if (JSON.parse(data).results.ES.flatrate) {
                    JSON.parse(data).results.ES.flatrate.forEach(element => {
                        if (element.provider_name != 'HBO') {
                            peli.plataformas.push({
                                nombre: element.provider_name,
                                icono: "https://www.themoviedb.org/t/p/original" + element.logo_path
                            })
                        }
                    })
                }
            }
            /*peli.save((err, peli) => {
                if(err){
                    console.log(err)
                }
                if(!peli){
                    console.log('No hay película')
                }
                else{
                    console.log(peli);
                    console.log("Película Guardada");
                    stdin.removeAllListeners();
                    main();
                }
            })*/
            peli.save();
            if (state == 'add') {
                console.log("Película Guardada");
                stdin.removeAllListeners();
                console.log('');
                main();
            }
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

function videoPeli(id, peli) {
    mdb.movieVideos({ id: id, language: 'es' }, (err, res) => {
        let trailer;
        if (res.results.length != 0) {
            trailer = "https://www.youtube.com/embed/" + res.results[0].key;
            peli.trailer_es = trailer;
        }
        mdb.movieVideos({ id: id }, (err, res) => {
            let trailer2;
            if (res.results.length != 0) {
                trailer2 = "https://www.youtube.com/embed/" + res.results[0].key;
                peli.trailer_en = trailer2;
            }
            streamingPeli(id, peli, 'add');
        });
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
    Pelicula.countDocuments({}, (err, count1) => {
        Serie.countDocuments({}, (err, count2) => {
            peli.id_model = count1 + count2 + 1;
        });
    });
    mdb.movieInfo({ id: id, language: 'es' }, (err, res) => {
        if (res) {
            peli.id_TMDB = res.id;
            peli.titulo = res.title;
            peli.titulo_original = res.original_title;
            peli.sinopsis = res.overview;
            peli.nota_media = null;
            peli.duracion = res.runtime;
            peli.fecha_estreno = res.release_date;
            peli.imagen = "https://image.tmdb.org/t/p/w600_and_h900_bestv2/" + res.poster_path;
            res.genres.forEach(element => {
                if (element.name == 'Action & Adventure') {
                    peli.generos.push('Acción & Aventura')
                }
                else if (element.name == 'Sci-Fi & Fantasy') {
                    peli.generos.push('Ciencia Ficción & Fantástico')
                } else {
                    peli.generos.push(element.name);
                }
            });
            castPeli(id, peli);
        }
        else {
            console.log('No hay ninguna película con este identificador')
            main();
        }

    });
}

function streamingSerie(id, serie, state) {
    let url = 'https://api.themoviedb.org/3/tv/' + id + '/watch/providers?api_key=1acd0c7bc48f18ba631625da81edf46a';
    https.get(url, (resp) => {
        let data = '';

        resp.on('data', (chunk) => {
            data += chunk;
        });

        resp.on('end', () => {
            /*if (!JSON.parse(data).results.ES) {
                console.log('No esta');
            }
            else {
                if (!JSON.parse(data).results.ES.flatrate) {
                    console.log('No esta en ninguna plataforma de streaming')
                }*/
            if (JSON.parse(data).results.ES) {
                if (JSON.parse(data).results.ES.flatrate) {
                    JSON.parse(data).results.ES.flatrate.forEach(element => {
                        if (element.provider_name != 'HBO') {
                            serie.plataformas.push({
                                nombre: element.provider_name,
                                icono: "https://www.themoviedb.org/t/p/original" + element.logo_path
                            })
                        }
                    })
                }
            }
            serie.save();

            if (state == 'add') {
                console.log("Serie Guardada");
                stdin.removeAllListeners();
                console.log('');
                main();
            }
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

function videoSerie(id, serie) {
    mdb.tvVideos({ id: id, language: 'es' }, (err, res) => {
        let trailer;
        if (res.results.length != 0) {
            trailer = "https://www.youtube.com/embed/" + res.results[0].key;
            serie.trailer_es = trailer;
        }
        mdb.tvVideos({ id: id }, (err, res) => {
            let trailer2;
            if (res.results.length != 0) {
                trailer2 = "https://www.youtube.com/embed/" + res.results[0].key;
                serie.trailer_en = trailer2;
            }
            streamingSerie(id, serie, 'add');
        });
    });
}

function castSerie(id, serie) {
    let url = 'https://api.themoviedb.org/3/tv/' + id + '/aggregate_credits?api_key=1acd0c7bc48f18ba631625da81edf46a';

    https.get(url, (resp) => {
        let data = '';

        resp.on('data', (chunk) => {
            data += chunk;
        });

        resp.on('end', () => {
            JSON.parse(data).cast.forEach(element => {
                serie.actores.push({
                    nombre: element.name,
                    personaje: element.roles[0].character
                })
            });
            videoSerie(id, serie);
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

function castS(id, serie) {
    mdb.tvCredits({ id: id, language: 'es' }, (err, res) => {
        if (res) {
            res.cast.forEach(element => {
                serie.actores.push({ nombre: element.name, personaje: element.character });
            });
        }
        videoSerie(id, serie);
    });

}

function infoSerie(id, serie) {
    Pelicula.countDocuments({}, (err, count1) => {
        Serie.countDocuments({}, (err, count2) => {
            serie.id_model = count1 + count2 + 1;
        });
    });
    mdb.tvInfo({ id: id, language: 'es' }, (err, res) => {
        if (res) {
            serie.id_TMDB = res.id;
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
                if (element.name == 'Action & Adventure') {
                    serie.generos.push('Acción & Aventura')
                }
                else if (element.name == 'Sci-Fi & Fantasy') {
                    serie.generos.push('Ciencia Ficción & Fantástico')
                } else {
                    serie.generos.push(element.name);
                }
            });
            castSerie(id, serie);
        }
        else {
            console.log('No hay ninguna serie con este identificador')
            main();
        }

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
        console.log("Profesional Guardado");
        stdin.removeAllListeners();
        console.log('');
        main();
    });
}

function infoPr(id, profesional) {
    Profesional.countDocuments({}, (err, count) => {
        profesional.id_profesional = count + 1;
    });
    mdb.personInfo({ id: id, language: 'es' }, (err, res) => {
        if (res) {
            profesional.id_TMDB = res.id;
            profesional.nombre = res.name;
            profesional.biografia = res.biography;
            profesional.fecha_nacimiento = res.birthday;
            profesional.lugar_nacimiento = res.place_of_birth;
            profesional.imagen = "https://image.tmdb.org/t/p/w600_and_h900_bestv2/" + res.profile_path;

            castPr(id, profesional);

        } else {
            console.log('No hay ninguna película con este identificador')
            main();
        }

    });
}

function actualizarModelotf() {

    const options = {
        mode: 'text',
        pythonPath: 'C:/Users/Sergi/Anaconda3/envs/tensorflowks/python.exe',
        pythonOptions: ['-u'],
        scriptPath: '',
        args: ['']
    };
    

    PythonS.PythonShell.run('recomendadorjson.py', options, function (err, results) {
        if (err) throw err;
        // results is an array consisting of messages collected during execution
        console.log('Resultado Python');
        console.log(results);
        //let dir = 'C:/Users/Sergi/Anaconda3/envs/tensorflowks';
        /*if(results){
            exec("conda activate C:/Users/Sergi/Anaconda3/envs/tensorflowks", (err, stdout, stderr) => {
                if (err) {
                    console.log(`error: ${err.message}`);
                    return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    return;
                }
                console.log(stdout);
                exec("tensorflowjs_converter --input=keras_saved_model modeltf modeltfjs", (err, stdout, stderr) => {
                    if (err) {
                        console.log(`error: ${err.message}`);
                        return;
                    }
                    if (stderr) {
                        console.log(`stderr: ${stderr}`);
                        return;
                    }
                    console.log(stdout);
                });
            });
            main();
        }*/
    });

    /*PythonS.PythonShell.run('comando.py', options, function (err, results) {
        if (err) throw err;
        // results is an array consisting of messages collected during execution
        console.log('Resultado Python');
        console.log(results);
    });*/
}

function datosModelo() {
    let datos = [];

    Pelicula.find({}, (err, peliculas) => {
        if (err) {
            console.log("Algo ha fallado")
        }
        if (!peliculas) {
            console.log("No hay películas")
        }

        for (let i = 0; i < peliculas.length; i++) {
            for (let j = 0; j < peliculas[i].criticas.length; j++) {
                datos.push({
                    movieId: peliculas[i].id_model,
                    userId: peliculas[i].criticas[j].usuario_model,
                    nota: peliculas[i].criticas[j].nota
                })
            }
        }

        Serie.find({}, (err, series) => {
            if (err) {
                console.log("Algo ha fallado")
            }
            if (!series) {
                console.log("No hay series")
            }

            for (let i = 0; i < series.length; i++) {
                for (let j = 0; j < series[i].criticas.length; j++) {
                    datos.push({
                        movieId: series[i].id_model,
                        userId: series[i].criticas[j].usuario_model,
                        nota: series[i].criticas[j].nota
                    })
                }
            }

            //console.log(datos);
            const datosJSON = JSON.stringify(datos);
            //console.log(datosJSON);
            fs.writeFile("./datos.json", datosJSON, () => {
                console.log('Fiechero de datos creado correctamente');
                console.log('');
                actualizarModelotf();
            })
        });

    });
}

function upPlataformaPeli() {

    Pelicula.find((err, peliculas) => {
        if (err) {
            console.log("Algo ha fallado")
        }
        if (!peliculas) {
            console.log("No hay películas")
        }
        peliculas.forEach(element => {
            element.plataformas.splice(0)
            streamingPeli(element.id_TMDB, element, 'update')
        })
    });
    console.log('Platafomas de películas actualizadas correctamente');
    console.log('');
    main();
}

function upPlataformaSerie() {

    Serie.find((err, series) => {
        if (err) {
            console.log("Algo ha fallado")
        }
        if (!series) {
            console.log("No hay películas")
        }
        series.forEach(element => {
            element.plataformas.splice(0)
            streamingSerie(element.id_TMDB, element, 'update')
        })
    });
    console.log('Platafomas de series actualizadas correctamente');
    console.log('');
    main();
}

function main() {

    let op;
    do {
        console.log('Eije que quieres añadir a la base de datos');
        console.log('1. Añadir películas');
        console.log('2. Añadir series');
        console.log('3. Añadir profesional');
        console.log('4. Extraer los datos para actualizar el recomendador');
        console.log('5. Actualizar las plataformas de las películas');
        console.log('6. Actualizar las plataformas de las series');
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
            case '4':
                datosModelo();
                break
            case '5':
                upPlataformaPeli();
                break
            case '6':
                upPlataformaSerie();
                break
            case '0':
                console.log('FIN');
                process.exit();
        }
    }
}

