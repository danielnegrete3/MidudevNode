import mysql from 'mysql2/promise';
import "dotenv/config";

const config = {
    host: process.env.MySQL_HOST,
    user: process.env.MySQL_USER,
    password: process.env.MySQL_PASSWORD,
    database: process.env.MySQL_DB,
    port: process.env.MySQL_PORT,
    namedPlaceholders: true,
}

const connection = await mysql.createConnection(config);

export class MovieModel {

    static async getAll({genre}) {
        if (genre) {
            const [[genre_id]] = await connection.execute("SELECT id FROM genres WHERE name = :genre", {genre});
            if (!genre_id) return null;

            const [movie_ids] = await connection.execute('SELECT BIN_TO_UUID(movie_id) as id FROM movie_genres WHERE genre_id = :id', {id:genre_id.id});
            return await Promise.all(movie_ids.map(async movie => await this.getById({id:movie.id})));
         
        }
            
        const [movie_ids] = await connection.execute('SELECT BIN_TO_UUID(id) as id FROM movies');
        return await Promise.all(movie_ids.map(async movie => await this.getById({id:movie.id})));
    }

    static async getById({id}) {
        const [[movie]] = await connection.execute('SELECT *, BIN_TO_UUID(id) as id FROM movies WHERE id = UUID_TO_BIN(:id)', {id});
        if (!movie) return null;

        const [genres] = await connection.execute('SELECT name FROM genres WHERE id IN (SELECT genre_id FROM movie_genres WHERE movie_id = UUID_TO_BIN(:id))', {id});
        movie.genre = genres.map(genre => genre.name);
        return movie;
    }

    static async create({input}) {
        const {genre,...inserts} = input;

        const [[uuid]] = await connection.execute("SELECT UUID() as id");

        // Insertar la pelicula
        try{

            await connection.query("INSERT INTO movies SET ?, id = UUID_TO_BIN(?)", [inserts,uuid.id]);
        }catch(e){
            console.log(e);
            throw new Error("Movie creation failed");
        }
        
        // Insertar los generos de la pelicula
        await this.#AddGenders({id: uuid.id, genres: genre});
        // se comprueba que la pelicula y los generos se haya insertado correctamente
        const movie = await this.getById({id:uuid.id});
        return movie
        
    }

    static async update({id, input}) {
        const {genre,...inserts} = input;
        const movie = await this.getById({id});
        if (!movie) return null;

        // Actualizar la pelicula
        if(Object.keys(inserts).length > 0){
            try{
                await connection.query('UPDATE movies SET ? WHERE id = UUID_TO_BIN(?)', [inserts, id]);
            }catch(e){
                console.log(e);
                throw new Error("Movie update failed");
            }
        }

        // Actualizar los generos de la pelicula
        if(genre){
            // generos pasados y nuevos en minusculas
            const passGenresLower = movie.genre.map(gen => gen.toLowerCase());
            const newGenresLower = genre.map(gen => gen.toLowerCase());
            // generos nuevos
            // si no son incluidos en los generos pasados son nuevos
            const newGenres = genre.filter(gen => !passGenresLower.includes(gen.toLowerCase()));
            // generos a eliminar
            // si no se encuentran en los generos nuevos son para eliminar
            const dropGenders = passGenresLower.filter(gen => !newGenresLower.includes(gen));

            // Insertar los nuevos generos de la pelicula
            await this.#AddGenders({id, genres: newGenres});

            if(dropGenders.length > 0) {
                // Eliminar los generos de la pelicula que ya no contiene
                try{
                    await connection.query('DELETE FROM movie_genres WHERE movie_id = UUID_TO_BIN(?) AND genre_id IN (SELECT id FROM genres WHERE LOWER(name) IN (?))', [id,dropGenders]);
                }catch(e){
                    console.log(e);
                    throw new Error("Movie genre delete failed");
                }
            }
            
        }

        return await this.getById({id});

    }

    static async delete({id}) {
        const [[movie]] = await connection.execute('SELECT * FROM movies WHERE id = UUID_TO_BIN(:id)', {id});
        if (!movie) return false;
        connection.execute('DELETE FROM movies WHERE id = UUID_TO_BIN(:id)', {id});
        connection.execute('DELETE FROM movie_genres WHERE movie_id = UUID_TO_BIN(:id)', {id});
        return true
    }

    static async #AddGenders({id, genres}) {
        genres.forEach(async gen => {
            let [[genre_id]] = await connection.execute("SELECT id FROM genres WHERE LOWER(name) = LOWER(:gen)", {gen});
            if(!genre_id){
                // si no existe el genero, lo creamos, devido a que se verifica con zod
                try{
                    await connection.query("INSERT INTO genres SET ?", [{name: gen}]);
                    [[genre_id]] = await connection.execute("SELECT id FROM genres WHERE LOWER(name) = LOWER(:gen)", {gen});
                }catch(e){
                    console.log(e);
                    throw new Error("Genre creation failed");
                }
            }
            try{
                await connection.execute("INSERT INTO movie_genres SET movie_id = UUID_TO_BIN(:movie_id), genre_id = :genre_id", {movie_id: id, genre_id: genre_id.id});
            }catch(e){
                console.log(e);
                throw new Error("Movie genre creation failed");
            }
        });
    }
}