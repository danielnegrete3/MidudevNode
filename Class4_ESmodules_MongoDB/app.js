import express, { json } from 'express';
import cors from 'cors';
import {moviesRouter} from './routes/movies.js';

const app = express();
app.disable('x-powered-by');
app.use(json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/movies', moviesRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} http://localhost:${PORT}`);
});