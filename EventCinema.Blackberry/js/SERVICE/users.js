SERVICE.users = {
    login: function (username, password, callback) {
        EC_API.users.login(username, password, function (data) {
            if (data.isValid) {
                SERVICE.settings.setUserToken(data.token, function () {
                    var user = JSON.stringify(data.user);
                    SERVICE.settings.setUser(user, function () {
                        var jsonUser = JSON.parse(user);
                        SERVICE.settings.setPreferredCinema(jsonUser.preferredCinemaId, function () {
                            if (callback != null) {
                                callback(data);
                            }
                        });
                    });
                });
            } else {
                if (callback != null) {
                    callback(data);
                }
            }
        });
    },

    register: function (
            username,
            firstName,
            surname,
		    email,
		    password,
		    pin,
	        agreesToTNC, /*bool*/
	        preferredCinemaID, /* int */
		    cinebuzzNumber,
		    gender,
		    homePhone,
		    mobilePhone,
		    streetAddress,
		    suburb,
		    state,
		    postcode,
		    memberType,
		    dob,
            callback) {
        EC_API.users.register(username,
            firstName,
            surname,
		    email,
		    password,
		    pin,
	        agreesToTNC, /*bool*/
	        preferredCinemaID, /* int */
		    cinebuzzNumber,
		    gender,
		    homePhone,
		    mobilePhone,
		    streetAddress,
		    suburb,
		    state,
		    postcode,
		    memberType,
		    dob,
            function (data) {
                if (callback != null) {
                    callback(data);
                }
            },
            function (data) {
                if (callback != null) {
                    callback(data);
                }
            });
    },

    edit: function (
            existingPassword,
            username,
            email,
            preferredCinema, /*int*/
            password,
            pin,
            memberType,
            gender,
            homePhone,
            mobilePhone,
            streetAddress,
            suburb,
            state,
            postcode,
            optinForMail,
            callback) {
        SERVICE.settings.getUserToken(function (token) {
            EC_API.users.edit(token,
                existingPassword,
                username,
                email,
                preferredCinema, /*int*/
                password,
                pin,
                memberType,
                gender,
                homePhone,
                mobilePhone,
                streetAddress,
                suburb,
                state,
                postcode,
                optinForMail,
                function (data) {
                    SERVICE.settings.setUserToken(data.token, function () {
                        var jsonData = JSON.stringify(data);
                        if (data != null) {
                            callback(data);
                        }
                    });
                },
                function (data) {
                    if (data != null) {
                        callback(data);
                    }
                });
        });
    },

    logout: function (callback) {
        SERVICE.settings.setUser("", function () {
            SERVICE.settings.setUserDetails("", function () {
                SERVICE.settings.setUserToken("", function () {
                    if (callback != null) {
                        callback();
                    }
                });
            });
        });
    },

    forgotPassword: function (firstName, email, callback) {
        EC_API.users.forgotPassword(firstName, email, function (data) {
            if (data != null) {
                callback(data);
            }
        });
    },

    setPreferredCinema: function (cinemaId, callback) {
        SERVICE.settings.getUserToken(function (token) {
            //Only call if token is there
            if (token != null && token != "") {
                EC_API.users.setPreferredCinema(token, cinemaId, function (data) {
                    if (data.isValid) {
                        SERVICE.settings.setUserToken(data.token, function () {
                            if (data != null) {
                                if (callback != null) {
                                    callback(data);
                                }
                            }
                        });
                    } else {
                        if (data != null) {
                            if (callback != null) {
                                callback(data);
                            }
                        }
                    }
                });
            } else {
                if (callback != null) {
                    callback();
                }
            }
        });
    },

    getUserDetails: function (callback) {
        SERVICE.settings.getUserToken(function (token) {
            EC_API.users.getUserDetails(token, function (data) {
                SERVICE.settings.setUserToken(data.token, function () {
                    var jsonData = JSON.stringify(data.userDetails);
                    if (data.isValid) {
                        SERVICE.settings.setUserDetails(jsonData, function () {
                            if (data != null) {
                                callback(data);
                            }
                        });
                    }
                });
            });
        });
    },
    getCreditCards: function (callback) {
        SERVICE.settings.getUserToken(function (token) {
            EC_API.users.getCreditCards(token, function (data) {
                SERVICE.settings.setUserToken(data.token, function () {
                    if (data != null) {
                        callback(data);
                    }
                });
            });
        });
    },
    addCreditCard: function (cardType, cardNumber, expiryMMYY, callback) {
        SERVICE.settings.getUserToken(function (token) {
            EC_API.users.addCreditCard(token, cardType, cardNumber, expiryMMYY, function (data) {
                SERVICE.settings.setUserToken(data.token, function () {
                    if (data != null) {
                        callback(data);
                    }
                });
            });
        });
    },
    deleteCreditCard: function (cardId, callback) {
        SERVICE.settings.getUserToken(function (token) {
            EC_API.users.deleteCreditCard(token, cardId, function (data) {
                SERVICE.settings.setUserToken(data.token, function () {
                    if (data != null) {
                        callback(data);
                    }
                });
            });
        });
    },
    getGiftCards: function(callback){
        SERVICE.settings.getUserToken(function (token) {
            EC_API.users.getGiftCards(token, function (data) {
                SERVICE.settings.setUserToken(data.token, function () {
                    if (data != null) {
                        callback(data);
                    }
                });
            });
        });
    },
    addGiftCard: function (cardNumber, pin, callback) {
        SERVICE.settings.getUserToken(function (token) {
            EC_API.users.addGiftCard(token, cardNumber, pin, function (data) {
                SERVICE.settings.setUserToken(data.token, function () {
                    if (data != null) {
                        callback(data);
                    }
                });
            });
        });
    },
    getOrderHistory: function (callback) {
        SERVICE.settings.getUserToken(function (token) {
            EC_API.users.getOrderHistory(token, function (data) {
                SERVICE.settings.setUserToken(data.token, function () {
                    if (data != null) {
                        callback(data);
                    }
                });
            });
        });
    },
    getPointsHistory: function (callback) {
        SERVICE.settings.getUserToken(function (token) {
            EC_API.users.getPointsHistory(token, function (data) {
                SERVICE.settings.setUserToken(data.token, function () {
                    if (data != null) {
                        callback(data);
                    }
                });
            });
        });
    },
    getOffers: function (callback) {
        SERVICE.settings.getUserToken(function (token) {
            EC_API.users.getOffers(token, function (data) {
                SERVICE.settings.setUserToken(data.token, function () {
                    if (data != null) {
                        callback(data);
                    }
                });
            });
        });
    },
    getBarcodeUrl: function (cardNum, dpi, callback) {
        var url = EC_API.users.getBarcodeUrl(cardNum, dpi, function (url) {
            if (callback != null) {
                callback(url);
            }
        });
        return url;
    },
    sendFeedback: function (fromEmail, body, callback) {
        EC_API.users.sendFeedback(fromEmail, body, function (data) {
            if (callback != null) {
                callback(data);
            }
        });
    },
    getTnCUrl: function () {
        return EC_API.users.getTnCUrl();
    }
}