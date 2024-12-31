import { ReadJSON } from "../../utils.js";
import { randomUUID } from 'node:crypto';
let movies = ReadJSON('./movies.json');

export class MovieModel {
    static async getAll({genre}) {
        const filteredMovies =genre?  
        movies.filter(movie => movie.genre.some(g => g.toLowerCase()===genre.toLowerCase())):
        movies;
        return filteredMovies;
    }

    static async getById({id}) {
        return movies.find(movie => movie.id === id);
    }

    static async create({input}) {
        const newMovie = {
            id: randomUUID(),
            ...input
        };
        movies.push(newMovie);
        return newMovie;
    }

    static async update({id, input}) {
        const movieIndex = movies.findIndex(movie => movie.id === id);
        if (movieIndex === -1) {
            return null;
        }

        const updatedMovie = {
            ...movies[movieIndex],
            ...input
        };
        movies[movieIndex] = updatedMovie;
        return updatedMovie;
    }

    static async delete({id}) {
        const movieIndex = movies.findIndex(movie => movie.id === id);
        if (movieIndex === -1) {
            return false;
        }
        movies.splice(movieIndex, 1);
        return true;
    }
}