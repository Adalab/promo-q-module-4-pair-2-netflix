const express = require('express');
const cors = require('cors');
const movies = require('./data/movies.json');
const Database = require('better-sqlite3');
const { verbose } = require('nodemon/lib/config/defaults');

// create and config server
const server = express();
server.use(cors());
server.use(express.json());

const db = new Database('./src/db/database.db', {
  verbose: console.log,
});

// init express aplication
const serverPort = 4000;
server.listen(serverPort, () => {
  console.log(`Server listening at http://localhost:${serverPort}`);
});

server.get('/movies', (req, resp) => {
  const query = db.prepare(`SELECT * FROM movies`);
  const allMovies = query.all();
  console.log(allMovies);
  resp.json({
    success: true,
    movies: allMovies,
  });
});

server.set('view engine', 'ejs');
server.get('/movie/:movieId', (req, res) => {
  console.log(req.params.movieId);
  const foundMovie = movies.find((movie) => {
    return movie.id === req.params.movieId;
  });
  console.log(foundMovie);
  res.render('movie', foundMovie);
});

//endpoint para gestionar las peticiones POST:/sign-up
server.post('/sign-up', (req, res) => {
  console.log(req.body);
  const query = db.prepare('INSERT INTO users(email,password) VALUES (?,?)');
  const result = query.run(req.body.email, req.body.password);
  res.json({
    success: true,
    userId: result,
  });
});

//endpoint user/movies
server.get('/user/movies', (req, res) => {
  console.log(req.headers);
  // const userId = req.headers.userid;
  const movieIdsQuery = db.prepare(
    'SELECT movieId FROM rel_movies_users WHERE userId = ?'
  );
  const movieIds = movieIdsQuery.all(req.header('userId'));

  res.json({
    success: true,
    movies: movieIds,
  });
  console.log(movieIds);
});

const staticServer = './src/public-react';
server.use(express.static(staticServer));

const staticPhotos = './src/public-movies-images';
server.use(express.static(staticPhotos));

const staticStyles = './src/styles';
server.use(express.static(staticStyles));
