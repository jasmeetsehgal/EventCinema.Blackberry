/// <reference path="lib/persistence.js" />
/// <reference path="lib/persistence.jquery.js" />
var EC_DB = {

    DB_VERSION : "0.0.2q",

    tables : {},

    creditCardTypes: {
        creditCardTypesList: [
            { id: 0, text: "Visa" },
            { id: 1, text: "Mastercard" },
            { id: 2, text: "Amex" },
            { id: 3, text: "Diners" }
        ],

        getById: function (id) {
            for (var ctr = 0, maxLength = EC_DB.creditCardTypes.creditCardTypesList.length; ctr < maxLength; ctr++) {
                var ccType = EC_DB.creditCardTypes.creditCardTypesList[ctr];
                if (ccType.id == id) {
                    return ccType.text;
                }
            }
            return "";
        }
    },

    states: {

        statesList: [
            { id: 0, text: "NSW" },
            { id: 1, text: "VIC" },
            { id: 2, text: "QLD" },
            { id: 3, text: "ACT" },
            { id: 4, text: "TAS" },
            { id: 5, text: "NT" },
            { id: 6, text: "WA" },
            { id: 7, text: "SA" },
        ],

        getStateById: function (id) {
            for (var ctr = 0 ; ctr < EC_DB.states.statesList.length; ctr++) {
                var state = EC_DB.states.statesList[ctr];
                if (state.id == id) {
                    return state.text;
                }
            }
            return "";
        }
    },

    cinemas : {
        getByCinemaId: function (cinemaId, callback) {
            var q = EC_DB.tables.cinemas.all().filter("cinemaId", "=", cinemaId);
            q.one(null, function (cinema) {
                if (callback != null) {
                    callback(cinema);
                }
            });
        },

        getAll: function (callback) {
            var q = EC_DB.tables.cinemas.all();
            q.list(null, function (data) {
                if (callback != null) {
                    callback(data);
                }
            });
        },

        getAllByState: function (state, callback) {
            var q = EC_DB.tables.cinemas.all().filter("state", "=", state);
            q.list(null, function (data) {
                if (callback != null) {
                    callback(data);
                }
            });
        },

        addAll: function (cinemas, callback) {
            
            for (var ctr = 0; ctr < cinemas.length; ctr++) {
                var cinema = cinemas[ctr];
                var dcinema = new EC_DB.tables.cinemas(cinema);
                persistence.add(dcinema);
            }

            persistence.flush(null, function () {
                if (callback != null) {
                    callback();
                }
            });
        },

        deleteAll: function (callback) {
            EC_DB.tables.cinemas.all().destroyAll(function () {
                if (callback != null) {
                    callback();
                }
            });
        }
    },
    
    cinemasClosest: {
        addAll: function (cinemas, callback) {
            for (var ctr = 0, cinemasLength = cinemas.length; ctr < cinemasLength; ctr++) {
                var cinema = cinemas[ctr];
                var dcinema = new EC_DB.tables.cinemasClosest(cinema);
                persistence.add(dcinema);
            }

            persistence.flush(null, function () {
                if (callback != null) {
                    callback();
                }
            });
        },

        deleteAll: function (callback) {
            EC_DB.tables.cinemasClosest.all().destroyAll(function () {
                if (callback != null) {
                    callback();
                }
            });
        },

        getAll: function (callback) {
            var q = EC_DB.tables.cinemasClosest.all();
            q.list(null, function (data) {
                if (callback != null) {
                    callback(data);
                }
            });
        }
    },

    sessions: {
        SCREENTYPES: {
            ALL: "all",
            _3D: "3D",
            VMAX: "vmax",
            GoldClass: "goldClass"
        },

        isVMax: function (screenType) {
            return screenType == 2;
        },

        isGoldClass: function (screenType) {
            return screenType == 3;
        },

        isThreeD: function (screenType) {
            return screenType == 3;
        }
    },

    ratings: {
        ratingList: [
            { id: 0, code: "G", string: "G" },
            { id: 1, code: "PG", string: "PG" },
            { id: 2, code: "M", string: "M" },
            { id: 3, code: "MA15", string: "MA15+" },
            { id: 4, code: "R18", string: "R18" },
            { id: 5, code: "TBC", string: "Rating TBC" },
            { id: 6, code: "NR", string: "NR" },
            { id: 7, code: "CTC", string: "CTC" },
            { id: 8, code: "R", string: "R" }
        ],

        getById: function (id) {
            for (var ctr = 0, maxLength = EC_DB.ratings.ratingList.length; ctr < maxLength; ctr++) {
                var rating = EC_DB.ratings.ratingList[ctr];
                if (rating.id == id) {
                    return rating;
                }
            }
            return null;
        },

        getCodeById: function (id) {
            var rating = EC_DB.ratings.getById(id);
            var result = "";
            if (rating != null) {
                result = rating.code;
            }
            return result;
        },

        getStringById: function (id) {
            var rating = EC_DB.ratings.getById(id);
            var result = "NR";
            if (rating != null) {
                result = rating.string;
            }
            return result;
        }
    },

    settings: {
        keys: {
            db_version: "db_version",
            preferred_cinema_id: "preferred_cinema_id",
            cache_db_cinemas_closest: "cache_db_cinemas_closest",
            cache_db_cinemas: "cache_db_cinemas",
            cache_db_movies: "cache_db_movies",
            cache_db_movie_summaries: "cache_db_movie_summaries",
            user_json: "user_json",
            user_details_json: "user_details_json",
            user_token: "user_token"
        },

        get: function (key, callback) {
            var q = EC_DB.tables.settings.all().filter("key", "=", key);
            q.one(null, function (setting) {
                if (callback != null) {
                    callback(setting);
                }
            });
        },

        getValue: function (key, callback) {
            EC_DB.settings.get(key, function (setting) {
                if (callback != null) {
                    callback(setting.value());
                }
            });
        },

        initAdd: function (callback) {
            var obj = new EC_DB.tables.settings({
                key: EC_DB.settings.keys.db_version,
                value: EC_DB.DB_VERSION
            });
            persistence.add(obj);

            obj = new EC_DB.tables.settings({
                key: EC_DB.settings.keys.preferred_cinema_id,
                value: 0
            });
            persistence.add(obj);
            var oldDate = new Date();
            oldDate.setFullYear(oldDate.getFullYear() - 1);
            var oldDateStr = oldDate.toJSON();
            obj = new EC_DB.tables.settings({
                key: EC_DB.settings.keys.cache_db_cinemas_closest,
                value: oldDateStr
            });
            persistence.add(obj);
            obj = new EC_DB.tables.settings({
                key: EC_DB.settings.keys.cache_db_cinemas,
                value: oldDateStr
            });
            persistence.add(obj);
            obj = new EC_DB.tables.settings({
                key: EC_DB.settings.keys.cache_db_movie_summaries,
                value: oldDateStr
            });
            persistence.add(obj);
            obj = new EC_DB.tables.settings({
                key: EC_DB.settings.keys.cache_db_movies,
                value: oldDateStr
            });
            persistence.add(obj);

            obj = new EC_DB.tables.settings({
                key: EC_DB.settings.keys.user_json,
                value: ""
            });
            persistence.add(obj);
            obj = new EC_DB.tables.settings({
                key: EC_DB.settings.keys.user_details_json,
                value: ""
            });
            persistence.add(obj);
            obj = new EC_DB.tables.settings({
                key: EC_DB.settings.keys.user_token,
                value: ""
            });
            persistence.add(obj);

            persistence.flush(null, function () {
                if (callback != null) {
                    callback();
                }
            });
        },
        add: function (key, value, callback) {
            var obj = new EC_DB.tables.settings({
                key: key,
                value: value
            });
            persistence.add(obj);
            persistence.flush(null, function () {
                if (callback != null) {
                    callback();
                }
            });
        },

        set: function (key, value, callback) {
            var q = EC_DB.settings.get(key,
                function (setting) {
                    setting.value(value);
                    persistence.flush(null, function () {
                        if (callback != null) {
                            callback();
                        }
                    });
                }
            );
        },

        getPreferredCinema: function (callback) {
            EC_DB.settings.get(EC_DB.settings.keys.preferred_cinema_id, function (setting) {
                if (callback != null) {
                    callback(setting.value());
                }
            });
        },

        setPreferredCinema: function (cinemaId, callback) {
            EC_DB.settings.set(EC_DB.settings.keys.preferred_cinema_id, cinemaId, function () {
                if (callback != null) {
                    callback();
                }
            });
        }
    },

    movieSummaries: {

        getByMovieId: function (movieId, callback) {
            var q = EC_DB.tables.movieSummaries.all().filter("movieId", "=", movieId);
            q.one(null, function (data) {
                if (callback != null) {
                    callback(data);
                }
            });
        },

        addAll: function (movies, callback) {
            var ictr = 0;
            for (var ctr = 0, moviesLength = movies.length; ctr < moviesLength; ctr++) {
                var movie = movies[ctr];
                /*EC_DB.movieSummaries.getByMovieId(movie.movieId, function (nmovie) {
                    if (nmovie != null) {
                        persistence.remove(nmovie);
                    }
                });*/
                var dmovie = new EC_DB.tables.movieSummaries(movie);
                persistence.add(dmovie);
            }
            persistence.flush(null, function () {
                if (callback != null) {
                    callback();
                }
            });

        },

        getNowShowing: function (callback) {
            var q = EC_DB.tables.movieSummaries.all().filter("isNowShowing", "=", true);
            q.list(null, function (data) {
                if (callback != null) {
                    callback(data);
                }
            });
        },

        getAdvancedTicket: function (callback) {
            var cDate = new Date();
            var q = EC_DB.tables.movieSummaries.all()
                .filter("hasAdvancedTicketing", "=", true)
                .filter("releaseDate", ">", cDate)
                .order("title");
            q.list(null, function (data) {
                if (callback != null) {
                    callback(data);
                }
            });
        },

        getNowShowingThisWeek: function (callback) {
            var cDate = new Date();
            var nDate = new Date();
            nDate.setDate(nDate.getDate() - 7);
            var q = EC_DB.tables.movieSummaries.all()
                .filter("isNowShowing", "=", true)
                .filter("releaseDate", "<=", cDate)
                .filter("releaseDate", ">=", nDate);
            q.list(null, function (data) {
                if (callback != null) {
                    callback(data);
                }
            });
        },

        getNowShowingLastWeek: function (callback) {
            var cDate = new Date();
            cDate.setDate(cDate.getDate() - 7);
            var nDate = new Date();
            nDate.setDate(nDate.getDate() - 14);
            var q = EC_DB.tables.movieSummaries.all()
                .filter("isNowShowing", "=", true)
                .filter("releaseDate", "<", cDate)
                .filter("releaseDate", ">=", nDate);
            q.list(null, function (data) {
                if (callback != null) {
                    callback(data);
                }
            });
        },

        getNowShowingAZ: function (callback) {
            var cDate = new Date();
            cDate.setDate(cDate.getDate() - 14);
            var q = EC_DB.tables.movieSummaries.all()
                .filter("isNowShowing", "=", true)
                .filter("releaseDate", "<", cDate)
                .order("title");
            q.list(null, function (data) {
                if (callback != null) {
                    callback(data);
                }
            });
        },

        getComingSoon: function (callback) {
            var q = EC_DB.tables.movieSummaries.all()
                .filter("isNowShowing", "=", false)
                .order("title");

            q.list(null, function (data) {
                if (callback != null) {
                    callback(data);
                }
            });
        },

        deleteAll: function (callback) {
            EC_DB.tables.movieSummaries.all().destroyAll(function () {
                if (callback != null) {
                    callback();
                }
            });
        }
    },

    movies: {
        addAllFromJson: function (json, callback) {
            var movies = EC_API.parseMovies(json);
            for (var ctr = 0; ctr < movies.length; ctr++) {
                var movie = movies[ctr];
                var dmovie = new EC_DB.tables.movies(movie);
                persistence.add(dmovie);
            }

            persistence.flush(null, function () {
                if (callback != null) {
                    callback();
                }
            });
        },

        addFromJson: function (json, callback) {
            var movie = EC_API.parseMovie(json);
            var dmovie = new EC_DB.tables.movies(movie);
            persistence.add(dmovie);
            persistence.flush(null, function () {
                if (callback != null) {
                    callback();
                }
            });
        },

        getByMovieId: function (movieId, callback) {
            return EC_DB.tables.movies.all().filter("movieId", "=", movieId);
        }
    },

    init : function (callback) {
        persistence.store.websql.config(persistence, 'EC_DB', 'EC_DB', 5 * 1024 * 1024);
        EC_DB._initDb(function () {
            var qDbVersion = EC_DB.settings.get(EC_DB.settings.keys.db_version, function (setting) {
                if (setting != null && setting.value() == EC_DB.DB_VERSION) {
                    DEBUG.log("setting.value(): " + setting.value());
                    DEBUG.log("EC_DB.DB_VERSION: " + EC_DB.DB_VERSION);
                    if (callback != null) {
                        callback(false);
                    }
                } else {
                    persistence.reset(function () {
                        EC_DB._initDb(function () {
                            EC_DB.settings.initAdd(function () {
                                if (callback != null) {
                                    callback(true);
                                }
                            });
                        });
                    });
                }
            });
            
        });
    },

    _initDb: function (callback) {
        EC_DB.tables.settings = persistence.define('Setting', {
            key: "TEXT",
            value: "TEXT"
        });

        EC_DB.tables.cinemas = persistence.define('Cinema', {
            streetAddress: "TEXT",
            suburb: "TEXT",
            postcode: "TEXT",
            country: "TEXT",
            introText: "TEXT",
            tradingHours: "TEXT",
            goldClassPhoneNumber: "TEXT",
            parkingInfo: "TEXT",
            busInfo: "TEXT",
            taxiInfo: "TEXT",
            trainInfo: "TEXT",
            ferryInfo: "TEXT",
            brand: "TEXT",
            localTimeZone: "TEXT",
            name: "TEXT",
            distanceFromMe: "INT",
            longitude: "TEXT",
            latitude: "TEXT",
            hasGoldClass: "BOOL",
            hasVMax: "BOOL",
            has3D: "BOOL",
            state: "INT",
            cinemaId: "INT"
        });

        EC_DB.tables.movieSummaries = persistence.define('MovieSummary', {
            rating: "INT",
            movieId: "INT",
            title: "TEXT",
            releaseDate: "DATE",
            is3D: "BOOL",
            hasVmaxSessions: "BOOL",
            hasGoldClassSessions: "BOOL",
            moviePosterImageThumbnail: "TEXT",
            moviePosterImage: "TEXT",
            hasAdvancedTicketing: "BOOL",
            isNowShowing: "BOOL"
        });

        EC_DB.tables.movies = persistence.define('Movie', {
            director: "TEXT",
            mainCast: "TEXT",
            distributor: "TEXT",
            miniSynopsis: "TEXT",
            synopsis: "TEXT",
            url: "TEXT",
            runningTime: "TEXT",
            policy: "TEXT",
            extrasJson: "TEXT",
            extrasTrailerUrl: "TEXT",
            extrasTrailerThumbnail: "TEXT",
            galleryJson: "TEXT",
            firstAvailableSession: "DATE",
            movieId: "INT",
            title: "TEXT",
            rating: "INT",
            releaseDate: "DATE",
            is3D: "BOOL",
            hasVmaxSessions: "BOOL",
            hasGoldClassSessions: "BOOL",
            moviePosterImageThumbnail: "TEXT",
            moviePosterImage: "TEXT",
            hasAdvancedTicketing: "BOOL"
        });

        EC_DB.tables.cinemasClosest = persistence.define('CinemaClosest', {
            cinemaId: "INT",
            distanceFromMe: "INT",
            distanceFromMeText: "TEXT",
            name: "TEXT",
            has3D: "BOOL",
            hasGoldClass: "BOOL",
            hasVMax: "BOOL",
            latitude: "INT",
            longitude: "INT"
        });

        persistence.schemaSync(function (tx) {
            EC_DB._schemaSynchCallback(tx);
            if (callback != null) {
                callback();
            }
        });
    },

    _schemaSynchCallback : function (tx) {
        DEBUG.log("_schemaSynchCallback");
    }
};