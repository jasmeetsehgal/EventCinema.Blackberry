SERVICE.movieSummaries = {
    getNowShowing: function (callback) {
        EC_DB.movieSummaries.getNowShowing(function (data) {
            callback(data);
        });
    },
    getAdvancedTicket: function (callback) {
        EC_DB.movieSummaries.getAdvancedTicket(function (data) {
            callback(data);
        });
    },
    getNowShowingThisWeek: function (callback) {
        EC_DB.movieSummaries.getNowShowingThisWeek(function (data) {
            callback(data);
        });
    },
    getNowShowingLastWeek: function (callback) {
        EC_DB.movieSummaries.getNowShowingLastWeek(function (data) {
            callback(data);
        });
    },
    getNowShowingAZ: function (callback) {
        EC_DB.movieSummaries.getNowShowingAZ(function (data) {
            callback(data);
        });
    },
    getComingSoon: function (callback) {
        EC_DB.movieSummaries.getComingSoon(function (data) {
            callback(data);
        });
    },
    getByMovieId: function (movieId, callback) {
        EC_DB.movieSummaries.getByMovieId(movieId, function (data) {
            callback(data);
        });
    },

    _populate: function (callback) {
        EC_DB.movieSummaries.deleteAll(function () {
            EC_API.getNowShowingMovies(-1, function (movies) {
                EC_DB.movieSummaries.addAll(movies, function () {
                    EC_API.getComingSoonMovies(-1, function (movies) {
                        EC_DB.movieSummaries.addAll(movies, function () {
                            SERVICE.settings.setCacheDbMovieSummaries(function () {
                                if (callback != null) {
                                    callback();
                                }
                            });
                            
                        });
                    });
                });
            });
        });
    },

    populate: function (isNew, callback) {
        if (isNew) {
            SERVICE.movieSummaries._populate(callback);
        } else {
            SERVICE.settings.getCacheDbMovieSummaries(function (cacheDate) {
                cacheDate = cacheDate.setSeconds(cacheDate.getSeconds() + APP_CONSTANT.PREFERENCES_MOVIE_SUMMARIES_TIME_REFRESH);
                if (cacheDate < new Date()) {
                    SERVICE.movieSummaries._populate(function () {
                        if (callback != null) {
                            callback();
                        }
                    });
                } else {
                    if (callback != null) {
                        callback();
                    }
                }
            });
        }
    },
}