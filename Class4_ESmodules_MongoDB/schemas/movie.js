import z from 'zod';

const movieSchema = z.object({
    title: z.string({invalid_type_error: 'Title must be a string'}).min(1, {invalid_type_error: 'Title must be a non-empty string'}),
    genre: z.array(z.enum(['Action', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Thriller', 'Western'])).min(1, {invalid_type_error: 'Genre must be a non-empty array of strings'}),
    year: z.number().int().min(1900),
    director: z.string(),
    duration: z.number().int().positive(),
    rate: z.number().int().min(0).max(10).optional(),
    poster: z.string().url({invalid_type_error: 'Poster must be a URL'})
});

function validateMovie(object) {
    return movieSchema.safeParse(object);
}

function validatePartialMovie(object) {
    return movieSchema.partial().safeParse(object);
}

export {validateMovie,validatePartialMovie};