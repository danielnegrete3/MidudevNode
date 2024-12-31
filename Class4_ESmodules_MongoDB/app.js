import express, { json } from 'express';
import { randomUUID } from 'node:crypto';
import cors from 'cors';
import { validateMovie, validatePartialMovie } from './schemas/movie.js';
// import fs from 'node:fs';
// let movies = JSON.parse(fs.readFileSync('./movies.json', 'utf-8'));
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const movies = require('./movies.json');

const app = express();
app.disable('x-powered-by');
app.use(json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/movies', (req, res) => {
    const { genre } = req.query;
    const filteredMovies =genre?  
        movies.filter(movie => movie.genre.some(g => g.toLowerCase()===genre.toLowerCase())):
        movies;
    res.json(filteredMovies);
});

app.get('/movies/:id', (req, res) => {
    const movie = movies.find(movie => movie.id === req.params.id);
    if (!movie) {
        res.status(404).send('The movie with the given ID was not found');
    }
    res.json(movie);
});

app.post('/movies', (req, res) => {
    const result = validateMovie(req.body);
    if (result.error) {
        res.status(422).json({error: JSON.parse(result.error.message)});
    }
    // Esto no es REST porque se guarda en memoria 
    const newMovie = {
        id: randomUUID(),
        ...result.data
    };

    movies.push(newMovie);
    res.status(201);
    res.json(newMovie);
});

app.put('/movies/:id', (req, res) => {
    const movie = movies.find(movie => movie.id === req.params.id);
    if (!movie) {
        res.status(404).send('The movie with the given ID was not found');
    }

    const result = validateMovie(req.body);
    if (result.error) {
        res.status(422).json({error: JSON.parse(result.error.message)});
    }

    const updatedMovie = {
        ...movie,
        ...result.data
    };

    const index = movies.indexOf(movie);
    movies[index] = updatedMovie;

    res.json(updatedMovie);
});

app.patch('/movies/:id', (req, res) => {
    const {id} = req.params;
    const movieIndex = movies.findIndex(movie => movie.id === req.params.id);
    if (movieIndex === -1) {
        res.status(404).send('The movie with the given ID was not found');
    }

    const result = validatePartialMovie(req.body);
    if (result.error) {
        res.status(422).json({error: JSON.parse(result.error.message)});
    }

    const updatedMovie = {
        ...movies[movieIndex],
        ...result.data
    };

    movies[movieIndex] = updatedMovie;

    res.json(updatedMovie);
});

app.delete('/movies/:id', (req, res) => {
    const index = movies.findIndex(movie => movie.id === req.params.id);
    if (index === -1) {
        res.status(204).send();
    }

    movies.splice(index, 1);
    res.status(204).send();
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} http://localhost:${PORT}`);
});