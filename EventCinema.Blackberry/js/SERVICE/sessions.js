SERVICE.sessions = {
    getByCinemaIdScreenTypeDate: function (cinemaId, screenType, date, callback) {
        EC_API.getSessions(cinemaId, screenType, null, date, function (data) {
            if (callback != null) {
                callback(data);
            }
        });
    },

    getByNearByCinemasMovieId: function (movieId, date, callback) {
        EC_DB.cinemasClosest.getAll(function (data) {
            var cinemaIds = [];
            for (var cinemaCtr = 0; cinemaCtr < data.length; cinemaCtr++) {
                var cinema = data[cinemaCtr];
                cinemaIds.push(cinema.cinemaId());
            }
            EC_API.getSessionsBulk(cinemaIds,
                EC_DB.sessions.SCREENTYPES.ALL,
                movieId,
                date,
                function (sessions) {
                    if (callback != null) {
                        callback(sessions);
                    }
                }
            );
        });
    },

    getByStatesCinemasMovieId: function (movieId, stateId, date, callback) {
        EC_DB.cinemas.getAllByState(stateId, function (data) {
            var cinemaIds = [];
            for (var cinemaCtr = 0; cinemaCtr < data.length; cinemaCtr++) {
                var cinema = data[cinemaCtr];
                cinemaIds.push(cinema.cinemaId());
            }
            DEBUG.log(cinemaIds);
            EC_API.getSessionsBulk(cinemaIds,
                EC_DB.sessions.SCREENTYPES.ALL,
                movieId,
                date,
                function (sessions) {
                    if (callback != null) {
                        callback(sessions);
                    }
                }
            );
        });
    },

    SCREENTYPES: EC_DB.sessions.SCREENTYPES,

    getBuyTiketUrl: function (sessionId, memberToken) {
        return EC_API.getBuyTicketUrl(sessionId, memberToken);
    },

    isVMax: function (screenType) {
        return EC_DB.sessions.isVMax(screenType);
    },

    isGoldClass: function (screenType) {
        return EC_DB.sessions.isGoldClass(screenType);
    },

    isThreeD: function (screenType) {
        return EC_DB.sessions.isThreeD(screenType);
    }
}