import { validateMovie, validatePartialMovie } from "../schemas/movie.js";

export class MoviesController{
    constructor({MovieModel}) {
        this.MovieModel = MovieModel;
        this.getAll = this.getAll.bind(this);
        this.getById = this.getById.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }

    async getAll(req, res) {
        const { genre } = req.query
        const filteredMovies = await this.MovieModel.getAll({genre})
        res.json(filteredMovies)
    }

    async getById(req, res) {
        const { id } = req.params
        const movie = await this.MovieModel.getById({id})
        if (!movie) {
            res.status(404).send('The movie with the given ID was not found');
        }
        res.json(movie);
    }

    async create(req, res) {
        const result = validateMovie(req.body);
        if (result.error) {
            res.status(422).json({error: JSON.parse(result.error.message)});
        }

        const newMovie = await this.MovieModel.create({input: result.data});
        res.status(201);
        res.json(newMovie);
    }

    async update(req, res) {
        const { id } = req.params;
        const result = req.method === "PUT"? validateMovie(req.body):validatePartialMovie(req.body);
        if (result.error) {
            res.status(422).json({error: JSON.parse(result.error.message)});
        }

        const updatedMovie = await this.MovieModel.update({id, input: result.data});
        if (!updatedMovie) {
            res.status(404).send('The movie with the given ID was not found');
        }
        res.json(updatedMovie);
    }

    async delete(req, res) {
        const { id } = req.params;
        const deleted = await this.MovieModel.delete({id});
        if (!deleted) {
            res.status(404).send('The movie with the given ID was not found');
        }
        res.status(204).send();
    }
}