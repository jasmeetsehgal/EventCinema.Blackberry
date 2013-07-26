SERVICE.movies = {
    getByMovieId: function (movieId, callback) {
        EC_API.getMovieDetails(movieId, -1, function (movie) {
            if (callback != null) {
                callback(movie);
            }
        });   
    }
}