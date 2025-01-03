import { MovieModel } from "../models/db/mysql/movie.js";
import { validateMovie, validatePartialMovie } from "../schemas/movie.js";

export class MoviesController{
    static async getAll(req, res) {
        const { genre } = req.query
        const filteredMovies = await MovieModel.getAll({genre})
        res.json(filteredMovies)
    }

    static async getById(req, res) {
        const { id } = req.params
        const movie = await MovieModel.getById({id})
        if (!movie) {
            res.status(404).send('The movie with the given ID was not found');
        }
        res.json(movie);
    }

    static async create(req, res) {
        const result = validateMovie(req.body);
        if (result.error) {
            res.status(422).json({error: JSON.parse(result.error.message)});
        }

        const newMovie = await MovieModel.create({input: result.data});
        res.status(201);
        res.json(newMovie);
    }

    static async update(req, res) {
        const { id } = req.params;
        const result = req.method === "PUT"? validateMovie(req.body):validatePartialMovie(req.body);
        if (result.error) {
            res.status(422).json({error: JSON.parse(result.error.message)});
        }

        const updatedMovie = await MovieModel.update({id, input: result.data});
        if (!updatedMovie) {
            res.status(404).send('The movie with the given ID was not found');
        }
        res.json(updatedMovie);
    }

    static async delete(req, res) {
        const { id } = req.params;
        const deleted = await MovieModel.delete({id});
        if (!deleted) {
            res.status(404).send('The movie with the given ID was not found');
        }
        res.status(204).send();
    }
}