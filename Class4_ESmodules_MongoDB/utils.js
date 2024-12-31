// import fs from 'node:fs';
// let movies = JSON.parse(fs.readFileSync('./movies.json', 'utf-8'));
import { createRequire } from 'node:module';
export const ReadJSON = createRequire(import.meta.url);