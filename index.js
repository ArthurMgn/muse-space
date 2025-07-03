// index.js
require('dotenv').config();  // charge les variables d'environnemen
const express = require('express');
const path = require('path');
const MovieDB = require('node-themoviedb');
const mdb = new MovieDB(process.env.TMDB_API_KEY); // clé depuis .env

const app = express();
const PORT = process.env.PORT || 3000;

// Sert tous les fichiers de /public
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint pour récupérer les détails d'un film
app.get('/api/movie/:id', async (req, res) => {
    try {
        const args = {
            pathParameters: { movie_id: req.params.id },
            query: { append_to_response: 'videos,images,credits' }
        };
        const response = await mdb.movie.getDetails(args);
        res.json(response.data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur interne' });
    }
});

// Endpoint pour récupérer la filmographie d'un acteur
app.get('/api/person/:id/movies', async (req, res) => {
    try {
        const args = {
            pathParameters: { person_id: req.params.id }
        };
        const response = await mdb.person.getMovieCredits(args);
        res.json(response.data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur interne' });
    }
});

// Endpoint pour récupérer les détails d'un acteur
app.get('/api/person/:id', async (req, res) => {
    try {
        const args = {
            pathParameters: { person_id: req.params.id }
        };
        const response = await mdb.person.getDetails(args);
        res.json(response.data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur interne' });
    }
});

// Endpoint pour rechercher un film par nom
app.get('/api/search-movie', async (req, res) => {
    try {
        const q = req.query.q;
        if (!q) return res.status(400).json({ error: 'Requête invalide' });
        const args = {
            query: { query: q, page: 1 }
        };
        const response = await mdb.search.movies(args);
        res.json(response.data.results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur interne' });
    }
});

// Endpoint pour obtenir deux films populaires au hasard
app.get('/api/random-movies', async (req, res) => {
    try {
        const popular = await mdb.movie.getPopular({ query: { page: 1 } });
        const list = popular.data.results || [];
        if (list.length < 2) return res.status(500).json({ error: 'Pas assez de films' });
        const pick = () => list[Math.floor(Math.random() * list.length)];
        let first = pick();
        let second = pick();
        while (second.id === first.id) second = pick();
        res.json([first, second]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur interne' });
    }
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
