import { API_KEY } from './apikey.js';

// Sélectionnez l'élément d'entrée de texte
const searchInput = document.getElementById('search-input');

// Ajoutez un événement d'écoute pour la saisie de texte
searchInput.addEventListener('input', async function() {
    const searchTerm = searchInput.value;
    searchMovies(searchTerm);
});

async function searchMovies(searchTerm) {
    const url = `https://www.omdbapi.com/?s=${encodeURIComponent(searchTerm)}&apikey=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.Response === 'True') {
            displayMovies(data.Search); // Affiche les films si la recherche est réussie
        } else {
            console.error('Aucun film trouvé');
        }
    } catch (error) {
        console.error('Erreur lors de la recherche des films:', error);
    }
}


function displayMovies(movies) {
    const filmsList = document.getElementById('films-list');
    filmsList.innerHTML = ''; // Efface les résultats précédents
    
    if (movies.length === 0) {
        filmsList.innerHTML = '<p>Aucun film trouvé.</p>';
        return;
    }

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const filmCard = entry.target;
                const imdbID = filmCard.getAttribute('data-imdbid'); // Récupérez l'ID IMDb

                fetchFilmData(imdbID).then(filmData => {
                    // Mettez à jour la carte de film avec les données chargées
                    filmCard.querySelector('.film-poster').src = filmData.Poster;
                    filmCard.querySelector('.film-title').textContent = filmData.Title;
                    filmCard.querySelector('.film-release-date').textContent = `Date de sortie: ${filmData.Year}`;

                    filmCard.style.opacity = 1;
                    filmCard.style.transform = 'translateX(0)';
                }).catch(error => {
                    console.error('Erreur lors de la récupération des données du film:', error);
                });

                observer.unobserve(filmCard); // Détachez l'observer une fois que les données sont chargées
            }
        });
    }, { rootMargin: '0px', threshold: 0.1 }); // Configurez l'observer 

    movies.forEach(movie => {
        const filmCard = document.createElement('div');
        filmCard.classList.add('card', 'mb-3', 'film-card');

        filmCard.innerHTML = `
            <div class="row g-0">
                <div class="col-md-4">
                    <img src="" class="img-fluid rounded-start film-poster" alt="Affiche de ${movie.Title}">
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                        <h5 class="card-title film-title"></h5>
                        <p class="card-text film-release-date"><small class="text-muted"></small></p>
                        <button class="btn btn-primary" onclick="readMore('${movie.imdbID}')">Read more</button>
                    </div>
                </div>
            </div>
        `;

        // Ajoutez l'attribut data-imdbid avec l'ID IMDb du film
        filmCard.setAttribute('data-imdbid', movie.imdbID);

        filmsList.appendChild(filmCard);

        // Observe the filmCard with Intersection Observer
        observer.observe(filmCard);
    });
}



window.readMore = async function(imdbID) {
    const url = `https://www.omdbapi.com/?i=${imdbID}&apikey=${API_KEY}`;

    const modal = new bootstrap.Modal(document.getElementById('filmModal'));
    modal.show();
    try {
        const response = await fetch(url);
        const movie = await response.json();
        if (movie.Response === 'True') {
            const modalBody = document.querySelector('.modal-body');
            modalBody.innerHTML = `
                <div class="col-md-4">
                    <img src="${movie.Poster}" class="img-fluid rounded-start" alt="Affiche de ${movie.Title}">
                </div>
                <h5>${movie.Title}</h5>
                <p>${movie.Plot}</p>
                <p>Date de sortie: ${movie.Year}</p>
                <!-- Autres détails du film -->
            `;
        } else {
            console.error('Détails du film non trouvés');
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des détails du film:', error);
    }
};


async function fetchFilmData(imdbID) {
    const url = `https://www.omdbapi.com/?i=${imdbID}&apikey=${API_KEY}`;

    try {
        const response = await fetch(url);
        const movie = await response.json();
        if (movie.Response === 'True') {
            return movie;
        } else {
            console.error('Film data not found');
        }
    } catch (error) {
        console.error('Error fetching film data:', error);
    }
}


