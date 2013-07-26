SERVICE.settings = {
    getPreferredCinema: function (callback) {
        EC_DB.settings.getPreferredCinema(function (cinemaId) {
            if (callback != null) {
                callback(parseInt(cinemaId));
            }
        });
    },
    setPreferredCinema: function (cinemaId, callback) {
        EC_DB.settings.setPreferredCinema(cinemaId, function () {

            SERVICE.users.setPreferredCinema(cinemaId, function () {
                if (callback != null) {
                    callback();
                }
            });
        });
    },
    getUserDetails: function (callback) {
        EC_DB.settings.getValue(EC_DB.settings.keys.user_details_json, function (value) {
            if (callback != null) {
                callback(value);
            }
        });
    },
    setUserDetails: function (username, callback) {
        EC_DB.settings.set(EC_DB.settings.keys.user_details_json, username, function () {
            if (callback != null) {
                callback();
            }
        });
    },
    getUser: function (callback) {
        EC_DB.settings.getValue(EC_DB.settings.keys.user_json, function (value) {
            if (callback != null) {
                callback(value);
            }
        });
    },
    setUser: function (user, callback) {
        EC_DB.settings.set(EC_DB.settings.keys.user_json, user, function () {
            if (callback != null) {
                callback();
            }
        });
    },
    getUserToken: function (callback) {
        EC_DB.settings.getValue(EC_DB.settings.keys.user_token, function (value) {
            if (callback != null) {
                callback(value);
            }
        });
    },
    setUserToken: function (userToken, callback) {
        EC_DB.settings.set(EC_DB.settings.keys.user_token, userToken, function () {
            if (callback != null) {
                callback();
            }
        });
    },
    getCacheDbCinemaClosest: function (callback) {
        EC_DB.settings.getValue(EC_DB.settings.keys.cache_db_cinemas_closest, function (value) {
            if (callback != null) {
                callback(new Date(value));
            }
        });
    },
    setCacheDbCinemaClosest: function (callback) {
        var nDate = new Date();
        var nDateStr = nDate.toJSON();
        EC_DB.settings.set(EC_DB.settings.keys.cache_db_cinemas_closest, nDateStr, function () {
            if (callback != null) {
                callback();
            }
        });
    },
    getCacheDbCinemas: function (callback) {
        EC_DB.settings.getValue(EC_DB.settings.keys.cache_db_cinemas, function (value) {
            if (callback != null) {
                callback(new Date(value));
            }
        });
    },
    setCacheDbCinemas: function (callback) {
        var nDate = new Date();
        var nDateStr = nDate.toJSON();
        EC_DB.settings.set(EC_DB.settings.keys.cache_db_cinemas, nDateStr, function () {
            if (callback != null) {
                callback();
            }
        });
    },
    getCacheDbMovieSummaries: function (callback) {
        EC_DB.settings.getValue(EC_DB.settings.keys.cache_db_movie_summaries, function (value) {
            if (callback != null) {
                callback(new Date(value));
            }
        });
    },
    setCacheDbMovieSummaries: function (callback) {
        var nDate = new Date();
        var nDateStr = nDate.toJSON();
        EC_DB.settings.set(EC_DB.settings.keys.cache_db_movie_summaries, nDateStr, function () {
            if (callback != null) {
                callback();
            }
        });
    }
}