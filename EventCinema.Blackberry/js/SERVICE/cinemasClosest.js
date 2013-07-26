SERVICE.cinemasClosest = {
    populate: function (isNew, callback) {
        if (isNew) {
            SERVICE.cinemasClosest._populate(callback);
        } else {
            SERVICE.settings.getCacheDbCinemaClosest(function (cacheDate) {
                cacheDate = cacheDate.setSeconds(cacheDate.getSeconds() + APP_CONSTANT.PREFERENCES_NEARBY_CINEMA_TIME_REFRESH);
                if (cacheDate < new Date()) {
                    SERVICE.cinemasClosest._populate(function () {
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
        if (navigator.geolocation !== null) {
            var options;
            navigator.geolocation.getCurrentPosition(
                //Success
                function (position) {
                    //DEBUG.log("Current position: ");
                    //DEBUG.log(position);

                    var coordinates = position.coords;
                    var lat = coordinates.latitude;
                    var lon = coordinates.longitude;

                    //alert("lat:" + coordinates.latitude + ", lon:" + coordinates.longitude);

                    EC_API.getClosestCinemas(lat, lon, function (cinemas) {
                        EC_DB.cinemasClosest.deleteAll(function () {
                            EC_DB.cinemasClosest.addAll(cinemas, function () {
                                SERVICE.settings.setCacheDbCinemaClosest(function () {
                                    if (callback != null) {
                                        callback();
                                    }
                                });
                            });
                        });
                    });
                },
                //Error
                function (error) {
                    UTILS.showAlert("Error", "An unexpected error occurred [" + error.code + "]: " + error.message + " when trying to retrieve your location", function () { });
                    //alert("An unexpected error occurred [" + error.code + "]: " + error.message + " when trying to retrieve your location");
                    if (callback != null) {
                        callback();
                    }
                },
            options);
        }
        else {
            UTILS.showAlert("Error", "HTML5 geolocation is not supported.", function () { });
            //alert("HTML5 geolocation is not supported.");
            if (callback != null) {
                callback();
            }
        }
    },

    getAll: function (callback) {
        EC_DB.cinemasClosest.getAll(function (cinemas) {
            if (callback != null) {
                callback(cinemas);
            }
        });
    }
}