SERVICE.cinemas = {
    populate: function (isNew, callback) {
        if (isNew) {
            SERVICE.cinemas._populate(callback);
        } else {
            SERVICE.settings.getCacheDbCinemas(function (cacheDate) {
                cacheDate = cacheDate.setSeconds(cacheDate.getSeconds() + APP_CONSTANT.PREFERENCES_CINEMA_TIME_REFRESH);
                if (cacheDate < new Date()) {
                    SERVICE.cinemas._populate(function () {
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

    _populate: function (callback) {
        EC_DB.cinemas.deleteAll(function () {
            EC_API.getCinemas(function (cinemas) {
                EC_DB.cinemas.addAll(cinemas, function () {
                    SERVICE.settings.setCacheDbCinemas(function () {
                        if (callback != null) {
                            callback();
                        }
                    });
                });
            });
        });
    },

    getByCinemaId: function (cinemaId, callback) {
        EC_DB.cinemas.getByCinemaId(cinemaId, function (cinema) {
            if (callback != null) {
                callback(cinema);
            }
        });
    },

    getAll: function (callback) {
        EC_DB.cinemas.getAll(function (results) {
            if (callback != null) {
                callback(results);
            }
        });
    },

    getAllByState: function (state, callback) {
        var allCinemas = EC_DB.cinemas.getAllByState(state, function (results) {
            if (callback != null) {
                callback(state, results);
            }
        });
    }
}