import { Router } from "express";
import {MoviesController} from '../controllers/movies.js';

export const createMoviesRouter = ({MovieModel}) => {
    const moviesController = new MoviesController({MovieModel});
    const moviesRouter = Router();

    moviesRouter.get('/', moviesController.getAll);

    moviesRouter.get('/:id', moviesController.getById);

    moviesRouter.post('/', moviesController.create);

    moviesRouter.put('/:id', moviesController.update);

    moviesRouter.patch('/:id', moviesController.update);

    moviesRouter.delete('/:id', moviesController.delete);

    return moviesRouter;
}