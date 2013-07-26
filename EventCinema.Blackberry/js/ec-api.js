var EC_API = {

    DEVICE_TYPE : "Android", /* todo: change this to BB */
    API_PREFIX: "http://services.eventcinemas.com.au/",
    API_PREFIX_SECURE: "https://services.eventcinemas.com.au/",
    WS_PREFIX_SECURE: "https://services.eventcinemas.com.au/mobile/",
    WS_PREFIX: "https://services.eventcinemas.com.au/mobile/",
    BUY_TIKET_URL: "https://www.eventcinemas.com.au/tickets/order/step2?1=1",

    getBuyTicketUrl: function (sessionId, memberToken) {
        var url = EC_API.BUY_TIKET_URL;
        url += "&source=" + EC_API.DEVICE_TYPE;
        url += "&sessionId=" + sessionId;
        url += "&memberToken=" + memberToken;
        return url;
    },

    //Cinemas
    getCinemas : function (callback) {
        //http://services.eventcinemas.com.au/cinemaService/GetCinemasFull?clientType=Android
        var url = EC_API.API_PREFIX + "cinemaService/GetCinemasFull?clientType=" + EC_API.DEVICE_TYPE;
        EC_API.get(url, function (data) {
            var cinemas = EC_API.parseCinemasFull(data);
            if (callback != null) {
                callback(cinemas);
            }
        });
    },

    getClosestCinemas: function (lat, long, callback) {
        //http://services.eventcinemas.com.au/cinemaService/GetClosestCinemas?clientType=Android&latitude=43.465187&longitude=-80.522372&numberOfCinemasToShow=10
        var url = EC_API.API_PREFIX + "cinemaService/GetClosestCinemas?clientType=" + EC_API.DEVICE_TYPE;
        url += "&latitude=" + lat;
        url += "&longitude=" + long;
        url += "&numberOfCinemasToShow=" + APP_CONSTANT.NUMBER_OF_NEAREST_CINEMAS_TO_GET;
        EC_API.get(url, function (data) {
            var cinemas = EC_API.parseCinemaClosest(data);
            if (callback != null) {
                callback(cinemas);
            }
        });
    },

    getCinemasByMovie: function (movieId){
        //http://services.eventcinemas.com.au/cinemaService/GetCinemasByMovie?clientType=android&movieId=5416
        var url = EC_API.API_PREFIX + "cinemaService/GetCinemasByMovie?clientType=" + EC_API.DEVICE_TYPE;
        url += "&movieId=" + movieId;
        EC_API.get(url, callback);
    },

    //Movies
    getNowShowingMovies: function (cinemaId, callback) {
        //http://services.eventcinemas.com.au/movieService/GetMoviesShowing?clientType=android&cinemaId=1
        var url = EC_API.API_PREFIX + "movieService/GetMoviesShowing?clientType=" + EC_API.DEVICE_TYPE + "&cinemaId=" + cinemaId;
        EC_API.get(url, function (data) {
            var result = EC_API.parseMovieSummaries(data, true);
            if (callback != null) {
                callback(result);
            }
        });
    },
    
    getComingSoonMovies: function (cinemaId, callback) {
        //http://services.eventcinemas.com.au/movieService/GetMoviesComingSoon?clientType=android&cinemaId=54
        var url = EC_API.API_PREFIX + "movieService/GetMoviesComingSoon?clientType=" + EC_API.DEVICE_TYPE + "&cinemaId=" + cinemaId;
        EC_API.get(url, function (data) {
            var result = EC_API.parseMovieSummaries(data, false);
            if (callback != null) {
                callback(result);
            }
        });
    },

    getMovieDetails: function (movieId, cinemaId, callback) {
        //http://services.eventcinemas.com.au/movieService/GetMovieDetails?clientType=android&movieId=54&preferredCinemaId=-1
        var url = EC_API.API_PREFIX + "movieService/GetMovieDetails?clientType=" + EC_API.DEVICE_TYPE;
        url += "&preferredCinemaId=" + cinemaId;
        url += "&movieId=" + movieId;
        EC_API.get(url, function (data) {
            var movie = EC_API.parseMovie(data);
            if (callback != null) {
                callback(movie);
            }
        });
    },

    getMoviesByName: function (search) {
        //http://services.eventcinemas.com.au/movieService/GetMoviesByName?clientType=android&searchParam=3d
        var url = EC_API.API_PREFIX + "movieService/GetMoviesByName?clientType=" + EC_API.DEVICE_TYPE;
        url += "&searchParam=" + search;
        EC_API.get(url, callback);
    },

    //Sessions
    getSessions: function (cinemaId, screenType, movieId, date, callback) {
        //http://services.eventcinemas.com.au/SessionService/GetSessions?clientType=android&cinemaId=71&screenType=all&movieId=5416&date=2013-02-05
        var url = EC_API.API_PREFIX + "sessionService/GetSessions?clientType=" + EC_API.DEVICE_TYPE;
        url += "&cinemaId=" + cinemaId;
        if (screenType != null) {
            screenType = EC_DB.sessions.SCREENTYPES.ALL;
        } 
        url += "&screenType=" + screenType;
        if (movieId != null) {
            url += "&movieId=" + movieId;
        }
        url += "&date=" + FORMAT.date.formatYYYY_MM_DD(date);
        EC_API.get(url, function (data) {
            var results = EC_API.parseSessionResponse(data);
            if (callback != null) {
                callback(results);
            }
        });
    },

    getSessionsBulk: function (cinemaIds, screenType, movieId, date, callback) {
        //http://services.eventcinemas.com.au/SessionService/GetSessionsBulk?clientType=IPhone&cinemaIds=15,64,58,69,55&screenType=All&movieId=5416
        var url = EC_API.API_PREFIX + "sessionService/GetSessionsBulk?clientType=" + EC_API.DEVICE_TYPE;
        var cinemaIdsStr = cinemaIds.join(",");
        url += "&cinemaIds=" + cinemaIdsStr;
        url += "&screenType=" + screenType;
        url += "&date=" + FORMAT.date.formatYYYY_MM_DD(date);
        url += "&movieId=" + movieId;
        EC_API.get(url, function (data) {
            var results = EC_API.parseSessionCinemas(data);
            if (callback != null) {
                callback(results);
            }
        });
    },

    getAdvancedSessionsBulk: function (cinemasIds, screenType, movieId, date, callback) {
        //http://services.eventcinemas.com.au/SessionService/GetAdvancedSessionsBulk?clientType=IPhone&cinemaIds=15,64,58,69,55&screenType=All&movieId=5416
        var url = EC_API.API_PREFIX + "sessionService/GetAdvancedSessionsBulk?clientType=" + EC_API.DEVICE_TYPE;
        var cinemaIdsStr = cinemaIds.join(",");
        url += "&cinemaIds=" + cinemaIdsStr;
        url += "&screenType=" + screenType;
        url += "&date=" + FORMAT.date.formatYYYY_MM_DD(date);
        url += "&movieId=" + movieId;
        EC_API.get(url, function (data) {
            var results = EC_API.parseSessionCinemas(data);
            if (callback != null) {
                callback(results);
            }
        });
    },

    helpers: {
        getThumnailImage: function (imageUrl, width, height) {
            if (width == null) {
                width = 54;
            }
            if (height == null) {
                height = 80;
            }
            var url = "http://www.eventcinemas.com.au/image?fn=" + encodeURIComponent(imageUrl) + "&w=" + width + "&h=" + height + "&s=1&a=1&c=4&o=jpg&q=jpg";
            //Get it because CDN will throw 404 if it's the first request
            //EC_API.get(url);
            return url;
        }
    },

    users: {
        vars: {
            memberType: "CinebuzzMember"
        },
        login: function (username, password, callback) {
            var url = EC_API.WS_PREFIX_SECURE + "user.asmx/Login";
            var data = {
                clientType: EC_API.DEVICE_TYPE,
                UserName: username,
                PassWord: password
            };
            EC_API.post(url, data,
                function (xmlData) {
                    DEBUG.log(xmlData);
                    
                    var jsonData = EC_API.users.parseLogin(xmlData);
                    DEBUG.log(jsonData);
                    if (callback != null) {
                        callback(jsonData);
                    }
                },
                function () {
                    
                    var jsonData = EC_API.users.parseLogin(null);
                    if (callback != null) {
                        callback(jsonData);
                    }
                }
            );
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
            callback,
            errorCallback) {
            var data = {
                clientType: EC_API.DEVICE_TYPE,
                memberType: memberType,
                username: username,
                firstname: firstName,
                surname: surname,
                email: email,
                password: password,
                pin: pin,
                agreesTC: "False"
            }
            if (agreesToTNC) {
                data.agreesTC = "True";
            }

            if (memberType == EC_API.users.vars.memberType) {
                data.cinebuzzNumber = cinebuzzNumber;
                data.gender = gender;
                data.homePhone = homePhone;
                data.mobilePhone = mobilePhone;
                data.streetAddress = streetAddress;
                data.street = streetAddress;
                data.suburb = suburb;
                data.state = state;
                data.postcode = postcode;
                data.dateOfBirth = dob;
                data.preferredCinema = preferredCinemaID;
            } else {
                data.cinebuzzNumber = 0;
                data.gender = "Male";
                data.homePhone = "";
                data.mobilePhone = "";
                data.streetAddress = "";
                data.street = "";
                data.suburb = "";
                data.state = 0;
                data.postcode = "";
                data.dateOfBirth = "";
                data.preferredCinema = 64;
            }
            var url = EC_API.WS_PREFIX_SECURE + "user.asmx/Register";
            //DEBUG.log(url);
            EC_API.post(url, data, function (data) {
                var result = EC_API.users.parseUserRegister(data);
                if (callback != null) {
                    callback(result);
                }
            });
        },

        edit: function (
            token,
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
            callback,
            errorCallback) {
            var data = {
                clientType: EC_API.DEVICE_TYPE,
                token: token,
                existingPassword: existingPassword,
                username: username,
                email: email,
                preferredCinema: preferredCinema,
                password: password,
                pin: pin,
                gender: "Male",
                homePhone: "",
                mobilePhone: "",
                streetAddress: "",
                suburb: "",
                state: 0,
                postcode: "",
                optinForMail: false
            }
            
            if (memberType == EC_API.users.vars.memberType) {
                if (gender == 0) {
                    data.gender = "Male";
                } else {
                    data.gender = "Female";
                }
                data.homePhone = homePhone;
                data.mobilePhone = mobilePhone;
                data.streetAddress = streetAddress;
                data.suburb = suburb;
                data.state = state;
                data.postcode = postcode;
                if (optinForMail) {
                    data.optinForMail = "True";
                } else {
                    data.optinForMail = "False";
                }
            } 
            var url = EC_API.WS_PREFIX_SECURE + "user.asmx/EditUser";
            //DEBUG.log(url);
            EC_API.post(url, data, function (data) {
                var result = EC_API.users.parseEdit(data);
                if (callback != null) {
                    callback(result);
                }
            });
        },

        forgotPassword: function (firstName, email, callback) {
            var url = EC_API.WS_PREFIX_SECURE + "user.asmx/ForgotUserDetails";
            var data = {
                clientType: EC_API.DEVICE_TYPE,
                firstname: firstName,
                email: email
            };
            EC_API.post(url, data, function (data) {
                DEBUG.log(data);
                var result = EC_API.users.parseForgotPassword(data);
                if (callback != null) {
                    callback(result);
                }
            });
        },

        getUserDetails: function (token, callback) {
            var url = EC_API.WS_PREFIX_SECURE + "user.asmx/GetUserDetails";
            var data = {
                clientType: EC_API.DEVICE_TYPE,
                token: token
            };
            EC_API.post(url, data, function (data) {
                DEBUG.log(data);
                var result = EC_API.users.parseUserDetails(data);
                if (callback != null) {
                    callback(result);
                }
            });
        },

        getCreditCards: function (token, callback) {
            var url = EC_API.WS_PREFIX_SECURE + "user.asmx/GetCreditCards";
            var data = {
                clientType: EC_API.DEVICE_TYPE,
                token: token
            };
            EC_API.post(url, data, function (data) {
                DEBUG.log(data);
                var result = EC_API.users.parseCreditCards(data);
                if (callback != null) {
                    callback(result);
                }
            });
        },

        deleteCreditCard: function (token, cardId, callback) {
            var url = EC_API.WS_PREFIX_SECURE + "user.asmx/DeleteCreditCard";
            var data = {
                clientType: EC_API.DEVICE_TYPE,
                token: token,
                cardId: cardId
            };
            EC_API.post(url, data, function (data) {
                DEBUG.log(data);
                var result = EC_API.users.parseCreditCards(data);
                if (callback != null) {
                    callback(result);
                }
            });
        },

        addCreditCard: function (token, cardType, cardNumber, expiryMMYY, callback) {
            var url = EC_API.WS_PREFIX_SECURE + "user.asmx/AddCreditCard";
            var data = {
                clientType: EC_API.DEVICE_TYPE,
                token: token,
                cardtype: cardType,
                cardNumber: cardNumber, 
                expiryMMYY: expiryMMYY
            };
            EC_API.post(url, data, function (data) {
                DEBUG.log(data);
                var result = EC_API.users.parseCreditCards(data);
                if (callback != null) {
                    callback(result);
                }
            });
        },

        getGiftCards: function(token, callback){
            var url = EC_API.WS_PREFIX_SECURE + "user.asmx/GetGiftCards";
            var data = {
                clientType: EC_API.DEVICE_TYPE,
                token: token
            };
            EC_API.post(url, data, function (data) {
                DEBUG.log(data);
                var result = EC_API.users.parseGiftCards(data);
                if (callback != null) {
                    callback(result);
                }
            });
        },

        addGiftCard: function (token, cardNumber, pin, callback) {
            var url = EC_API.WS_PREFIX_SECURE + "user.asmx/AddGiftCard";
            var data = {
                clientType: EC_API.DEVICE_TYPE,
                token: token,
                cardNumber: cardNumber,
                pin: pin
            };
            EC_API.post(url, data, function (data) {
                DEBUG.log(data);
                var result = EC_API.users.parseGiftCards(data);
                if (callback != null) {
                    callback(result);
                }
            });
        },

        getOrderHistory: function (token, callback) {
            var url = EC_API.WS_PREFIX_SECURE + "user.asmx/GetOrderHistory";
            var data = {
                clientType: EC_API.DEVICE_TYPE,
                token: token,
                blockNumber: 0,
                blockSize: 1000
            };
            EC_API.post(url, data, function (data) {
                DEBUG.log(data);
                var result = EC_API.users.parseOrderHistory(data);
                if (callback != null) {
                    callback(result);
                }
            });
        },

        getPointsHistory: function (token, callback) {
            var url = EC_API.WS_PREFIX_SECURE + "user.asmx/GetPointsHistory";
            var data = {
                clientType: EC_API.DEVICE_TYPE,
                token: token,
                blockNumber: 0,
                blockSize: 1000
            };
            EC_API.post(url, data, function (data) {
                DEBUG.log(data);
                var result = EC_API.users.parsePointHistory(data);
                if (callback != null) {
                    callback(result);
                }
            });
        },

        getOffers: function (token, callback) {
            var url = EC_API.WS_PREFIX_SECURE + "user.asmx/GetOffers";
            var data = {
                clientType: EC_API.DEVICE_TYPE,
                token: token
            };
            EC_API.post(url, data, function (data) {
                DEBUG.log(data);
                var result = EC_API.users.parseOffers(data);
                if (callback != null) {
                    callback(result);
                }
            });
        },

        getBarcodeUrl: function (cardNumber, dpi, callback) {
            if (dpi == null) {
                dpi = 300;
            }
            var url = EC_API.API_PREFIX_SECURE + "BarcodeGen.axd";
            url += "?S=Code128&C=" + cardNumber + "&QZ=0&DPI=" + dpi + "&AC=T&EXT=T";

            if (callback != null) {
                callback(url);
            }

            return url;
        },

        sendFeedback: function (fromEmail, body, callback) {
            var url = EC_API.WS_PREFIX + "message.asmx/SendEmail";
            var data = {
                clientType: EC_API.DEVICE_TYPE,
                from: fromEmail,
                to: "contactus@eventcinemas.com.au",
                subject: "Mobile Application Feedback",
                body: body
            };
            EC_API.post(url, data, function (data) {
                DEBUG.log(data);
                var result = EC_API.users.parseSimpleResponse(data);
                if (callback != null) {
                    callback(result);
                }
            });
        },

        getTnCUrl: function () {
            return "http://www.eventcinemas.com.au/mobile/terms";
        },

        setPreferredCinema: function (token, cinemaId, callback) {
            var url = EC_API.WS_PREFIX_SECURE + "user.asmx/SetPreferredCinema";
            var data = {
                clientType: EC_API.DEVICE_TYPE,
                token: token,
                CinemaId: cinemaId
            };
            EC_API.post(url, data, function (data) {
                DEBUG.log(data);
                var result = EC_API.users.parseSetPreferredCinema(data);
                if (callback != null) {
                    callback(result);
                }
            });
        },

        parseOffers: function (data) {
            var result = {
                isValid: false,
                statusCode: "",
                statusDescription: "",
                token: "",
                offers: []
            };
            var data = data.d;
            result.statusCode = data.StatusCode;
            result.statusDescription = data.StatusDescription;
            result.isValid = result.statusCode == "0";
            result.token = data.Token;

            if (data.Offers != null) {
                for (var ctr = 0, maxLength = data.Offers.length; ctr < maxLength; ctr++) {
                    var offer = data.Offers[ctr];
                    var _offer = {
                        description: offer.Description,
                        expiryDate: FORMAT.date.parseJsonDate(offer.ExpiryDate),
                        offerId: offer.Id,
                        maximumQuantity: offer.MaximumQuantity,
                        name: offer.Name,
                        pointsCost: offer.PointsCost,
                        price: offer.Price
                    };
                    result.offers.push(_offer);
                }
            }

            return result;
        },

        parseSetPreferredCinema: function (data) {
            var result = {
                isValid: false,
                statusCode: "",
                statusDescription: "",
                token: ""
            };
            var data = data.d;
            result.statusCode = data.StatusCode;
            result.statusDescription = data.StatusDescription;
            result.isValid = result.statusCode == "0";
            result.token = data.Token;

            return result;
        },

        parsePointHistory: function (data) {
            var result = {
                isValid: false,
                statusCode: "",
                statusDescription: "",
                token: ""
            };
            var data = data.d;
            result.statusCode = data.StatusCode;
            result.statusDescription = data.StatusDescription;
            result.isValid = result.statusCode == "0";
            result.token = data.Token;

            //todo: finish implementation

            return result;
        },

        parseSimpleResponse: function (data) {
            var result = {
                isValid: false,
                statusCode: "",
                statusDescription: ""
            };
            var data = data.d;
            result.statusCode = data.StatusCode;
            result.statusDescription = data.StatusDescription;
            result.isValid = result.statusCode == "0";

            return result;
        },

        parseOrderHistory: function (data) {
            var result = {
                isValid: false,
                statusCode: "",
                statusDescription: "",
                token: "",
                orders: [],
                totalCount: 0
            };
            var data = data.d;
            result.statusCode = data.StatusCode;
            result.statusDescription = data.StatusDescription;
            result.isValid = result.statusCode == "0";
            result.token = data.Token;

            result.totalCount = data.TotalCount;
            if (data.Orders != null) {
            }

            //todo: finish implementation

            return result;
        },

        parseGiftCards: function (data) {
            var result = {
                isValid: false,
                statusCode: "",
                statusDescription: "",
                token: "",
                giftCards: [],
                availableGiftCardThemes: "",
                availableGiftCardValues: ""
            };
            var data = data.d;
            result.statusCode = data.StatusCode;
            result.statusDescription = data.StatusDescription;
            result.isValid = result.statusCode == "0";
            result.token = data.Token;

            result.availableGiftCardThemes = data.AvailableGiftCardThemes;
            result.availableGiftCardValues = data.AvailableGiftCardValues;

            return result;
        },

        parseCreditCards: function (data) {
            var result = {
                isValid: false,
                statusCode: "",
                statusDescription: "",
                token: "",
                creditCards: []
            };
            var data = data.d;
            result.statusCode = data.StatusCode;
            result.statusDescription = data.StatusDescription;
            result.isValid = result.statusCode == "0";
            result.token = data.Token;

            var creditCards = data.CreditCards;
            if (creditCards != null) {
                for (var ctr = 0, creditCardsLength = creditCards.length; ctr < creditCardsLength ; ctr++) {
                    var creditCard = creditCards[ctr];
                    var _creditCard = {
                        cardId: creditCard.CardIdentifier,
                        creditCardType: creditCard.CreditCardType,
                        expiryDate: creditCard.ExpiryDate,
                        redactedCardNumber: creditCard.RedactedCardNumber
                    };
                    result.creditCards.push(_creditCard);
                }
            }

            return result;
        },

        parseEdit: function (data) {
            var result = {
                isValid: false,
                statusCode: "",
                statusDescription: "",
                token: ""
            };

            var data = data.d;
            result.statusCode = data.StatusCode;
            result.statusDescription = data.StatusDescription;
            result.isValid = result.statusCode == "0";
            result.token = data.Token;

            return result;
        },

        parseLogin: function (data) {
            var result = {
                isValid: false,
                statusCode: "",
                statusDescription: "",
                token: "",
                user: {
                    cinebuzzId: "",
                    username: "",
                    displayName: "",
                    cinebuzzPoints: 0,
                    preferredCinemaId: 0,
                    memberType: "",
                    memberStatus: ""
                }
            };

            if (data != null) {
                data = data.d;
                result.statusCode = data.StatusCode;
                result.statusDescription = data.StatusDescription;
                result.isValid = result.statusCode == "0";
                result.token = data.Token;
                if (data.User != null) {
                    result.user.cinebuzzId = data.User.CinebuzzId;
                    result.user.username = data.User.Username;
                    result.user.displayName = data.User.Displayname;
                    result.user.cinebuzzPoints = data.User.CinebuzzPoints;
                    result.user.preferredCinemaId = data.User.PreferredCinemaId;
                    result.user.memberType = data.User.MemberType;
                    result.user.memberStatus = data.User.MemberStatus;
                }
            }
            return result;
        },

        parseForgotPassword: function (data) {
            var result = {
                isValid: false,
                statusCode: "",
                statusDescription: "",
                token: "",
                userExists: false
            };
            var data = data.d;
            result.statusCode = data.StatusCode;
            result.statusDescription = data.StatusDescription;
            result.isValid = result.statusCode == "0";
            result.token = data.Token;
            result.userExists = data.UserExists;
            return result;
        },

        parseUserRegister: function (data) {
            var result = {
                isValid: false,
                statusCode: "",
                statusDescription: "",
                token: ""
            };
            var data = data.d;
            result.statusCode = data.StatusCode;
            result.statusDescription = data.StatusDescription;
            result.isValid = result.statusCode == "0";
            result.token = data.Token;
            
            return result;
        },

        parseUserDetails: function (data) {
            var result = {
                isValid: false,
                statusCode: "",
                statusDescription: "",
                token: "",
                userDetails: null
            };
            var data = data.d;
            result.statusCode = data.StatusCode;
            result.statusDescription = data.StatusDescription;
            result.isValid = result.statusCode == "0";
            result.token = data.Token;
            var userDetails = data.UserDetails;
            if (userDetails != null) {
                var address = userDetails.Address;
                result.userDetails = {
                    address: {
                        country: address.Country,
                        postcode: address.Postcode,
                        state: address.State,
                        streetAddress: address.StreetAddress,
                        suburb: address.Suburb
                    },
                    cinebuzzCard: userDetails.CinebuzzCard,
                    cinuebuzzId: userDetails.CinebuzzId,
                    cinebuzzPoints: userDetails.CinebuzzPoints,
                    displayname: userDetails.Displayname,
                    email: userDetails.Email,
                    firstname: userDetails.Firstname,
                    gender: userDetails.Gender,
                    homePhoneNumber: userDetails.HomePhoneNumber,
                    lastname: userDetails.Lastname,
                    memberStatus: userDetails.MemberStatus,
                    memberType: userDetails.MemberType,
                    mobilePhoneNumber: userDetails.MobilePhoneNumber,
                    optInForMarketing: userDetails.OptInForMarketing,
                    preferredCinemaId: userDetails.PreferredCinemaId,
                    preferredCinemaName: userDetails.PreferredCinemaName,
                    username: userDetails.Username
                };
            }

            return result;
        }

    },

    parseMovieSummaries: function (data, isNowShowing) {
        var _isNowShowing = false;
        if (isNowShowing != null) {
            _isNowShowing = isNowShowing;
        }
        var movies = data.d.Movies;
        var result = [];

        if (movies != null) {
            for (var ctr = 0; ctr < movies.length; ctr++) {
                var movie = movies[ctr];
                var dmovie = {
                    id: movie.Id,
                    movieId: movie.Id,
                    title: movie.Title,
                    rating: movie.Rating,
                    releaseDate: FORMAT.date.parseJsonDate(movie.ReleaseDate),
                    is3D: movie.Is3D,
                    hasVmaxSessions: movie.HasVmaxSessions,
                    hasGoldClassSessions: movie.HasGoldClassSessions,
                    moviePosterImageThumbnail: movie.MoviePosterImageThumbnail,
                    moviePosterImage: movie.MoviePosterImage,
                    hasAdvancedTicketing: movie.HasAdvancedTicketing,
                    isNowShowing: _isNowShowing
                };
                result.push(dmovie);
            }
        }
        return result;
    },

    parseMovie: function (data) {
        var movie = data.d.Movie;

        var dmovie = {
            director: movie.Director,
            mainCast: movie.MainCast,
            distributor: movie.Distributor,
            miniSynopsis: movie.MiniSynopsis,
            synopsis: movie.Synopsis,
            url: movie.Url,
            runningTime: movie.RunningTime,
            policy: movie.Policy,
            extrasJson: JSON.stringify(movie.Extras),
            galleryJson: JSON.stringify(movie.Gallery),
            firstAvailableSession: FORMAT.date.parseJsonDate(movie.FirstAvailableSession),
            movieId: movie.Id,
            title: movie.Title,
            rating: movie.Rating,
            releaseDate: movie.ReleaseDate,
            is3D: movie.Is3D,
            hasVmaxSessions: movie.HasVmaxSessions,
            hasGoldClassSessions: movie.HasGoldClassSessions,
            moviePosterImageThumbnail: movie.MoviePosterImageThumbnail,
            moviePosterImage: movie.MoviePosterImage,
            hasAdvancedTicketing: movie.HasAdvancedTicketing
        };
        return dmovie;
    },

    parseCinemaClosest: function (data) {
        //DEBUG.log("data");
        //DEBUG.log(data);
        var cinemas = data.d.Cinemas;
        var result = [];

        if (cinemas != null) {
            for (var cinemaCtr = 0; cinemaCtr < cinemas.length; cinemaCtr++) {
                var cinema = cinemas[cinemaCtr];
                var _cinema = {
                    cinemaId: cinema.Id,
                    name: cinema.Name,
                    has3D: cinema.Has3D,
                    distanceFromMe: cinema.DistanceFromMe,
                    distanceFromMeText: FORMAT.int.formatDistance(cinema.DistanceFromMe),
                    hasGoldClass: cinema.HasGoldClass,
                    hasVMax: cinema.HasVMax,
                    latitude: cinema.Latitude,
                    longitude: cinema.Longitude
                };
                result.push(_cinema);
            }
        }
        return result;
    },

    parseCinemasFull: function (data) {
        var results = [];
        var cinemas = data.d.CinemasFull;
        if (cinemas != null) {
            for (var ctr = 0; ctr < cinemas.length; ctr++) {
                var cinema = cinemas[ctr];
                var address = cinema.Address;
                var dcinema = {
                    streetAddress: address.StreetAddress,
                    suburb: address.Suburb,
                    postcode: address.Postcode,
                    country: address.Country,
                    introText: cinema.IntroText,
                    tradingHours: cinema.TradingHours,
                    goldClassPhoneNumber: cinema.GoldClassPhoneNumber,
                    parkingInfo: cinema.ParkingInfo,
                    busInfo: cinema.BusInfo,
                    taxiInfo: cinema.TaxiInfo,
                    trainInfo: cinema.TrainInfo,
                    ferryInfo: cinema.FerryInfo,
                    brand: cinema.Brand,
                    localTimeZone: cinema.LocalTimeZone,
                    name: cinema.Name,
                    distanceFromMe: cinema.DistanceFromMe,
                    longitude: cinema.Longitude,
                    latitude: cinema.Latitude,
                    hasGoldClass: cinema.HasGoldClass,
                    hasVMax: cinema.HasVMax,
                    has3D: cinema.Has3D,
                    state: cinema.State,
                    cinemaId: cinema.Id
                };
                results.push(dcinema);
            }
        }
        return results;
    },

    parseSessionResponse: function(data){
        var result = [];
        var movies = data.d.Movies;
        if (movies != null) {
            for (var movieCtr = 0; movieCtr < movies.length; movieCtr++) {
                var movie = movies[movieCtr];
                var _movie = {
                    movieId: movie.Id,
                    title: movie.Title,
                    titleDisplay: FORMAT.string.trimChars(movie.Title, 30),
                    ratingId: movie.Rating,
                    ratingCode: "",
                    ratingString: "",
                    releaseDate: FORMAT.date.parseJsonDate(movie.ReleaseDate),
                    is3D: movie.Is3D,
                    hasVmaxSessions: movie.HasVmaxSessions,
                    hasGoldClassSessions: movie.HasGoldClassSessions,
                    moviePosterImageThumbnail: movie.MoviePosterImageThumbnail,
                    moviePosterImage: movie.MoviePosterImage,
                    hasAdvancedTicketing: movie.HasAdvancedTicketing,
                    screens: "",
                    sessions: []
                };
                _movie.ratingCode = EC_DB.ratings.getCodeById(_movie.ratingId);
                _movie.ratingString = EC_DB.ratings.getStringById(_movie.ratingId);
                var screens = "";
                if (_movie.is3D) {
                    screens += "3D"
                }

                if (_movie.hasVmaxSessions) {
                    if (screens != "") {
                        screens += ", ";
                    }
                    screens += "VMax"
                }

                if (_movie.hasGoldClassSessions) {
                    if (screens != "") {
                        screens += " & ";
                    }
                    screens += "Gold Class"
                }
                _movie.screens = screens;
                for (var sessionCtr = 0; sessionCtr < movie.Sessions.length; sessionCtr++) {
                    var session = movie.Sessions[sessionCtr];
                    var _session = {
                        sessionId: session.Id,
                        movieId: session.MovieId,
                        cinemaId: session.CinemaId,
                        startDate: FORMAT.date.parseJsonDate(session.StartDate),
                        screen: session.Screen,
                        runningTimeInMinutes: session.RunningTimeInMinutes,
                        screenNumber: session.ScreenNumber,
                        seatsLeft: session.SeatsLeft,
                        startTime: FORMAT.date.formatHH_MM(FORMAT.date.parseJsonDate(session.StartDate)),
                        is3D: EC_DB.sessions.isThreeD(session.Screen),
                        isVMax: EC_DB.sessions.isVMax(session.Screen),
                        isGoldClass: EC_DB.sessions.isGoldClass(session.Screen)
                    };
                    _movie.sessions.push(_session);
                }

                result.push(_movie);
            }
        }
        return result;
    },

    parseSessionCinemas: function (data) {
        var result = [];
        var cinemas = data.d.Cinemas;

        if (cinemas != null) {
            for (var cinemaCtr = 0; cinemaCtr < cinemas.length; cinemaCtr++) {
                var cinema = cinemas[cinemaCtr];
                var _cinema = {
                    cinemaId: cinema.Id,
                    name: cinema.Name,
                    distanceFromMe: cinema.DistanceFromMe,
                    longitude: cinema.Longitude,
                    latitude: cinema.Latitude,
                    hasGoldClass: cinema.HasGoldClass,
                    hasVMax: cinema.HasVMax,
                    has3D: cinema.Has3D,
                    state: cinema.State,
                    movies: []
                };
                var movies = cinema.Movies;
                for (var movieCtr = 0; movieCtr < movies.length; movieCtr++) {
                    var movie = movies[movieCtr];
                    var _movie = {
                        movieId: movie.Id,
                        title: movie.Title,
                        rating: movie.Rating,
                        releaseDate: FORMAT.date.parseJsonDate(movie.ReleaseDate),
                        is3D: movie.Is3D,
                        hasVmaxSessions: movie.HasVmaxSessions,
                        hasGoldClassSessions: movie.HasGoldClassSessions,
                        moviePosterImageThumbnail: movie.MoviePosterImageThumbnail,
                        moviePosterImage: movie.MoviePosterImage,
                        hasAdvancedTicketing: movie.HasAdvancedTicketing,
                        sessions: []
                    };
                    var sessions = movie.Sessions;
                    for (var sessionCtr = 0; sessionCtr < sessions.length; sessionCtr++) {
                        var session = sessions[sessionCtr];
                        var _session = {
                            sessionId: session.Id,
                            movieId: session.MovieId,
                            cinemaId: session.CinemaId,
                            startDate: FORMAT.date.parseJsonDate(session.StartDate),
                            screen: session.Screen,
                            runningTimeInMinutes: session.RunningTimeInMinutes,
                            screenNumber: session.ScreenNumber,
                            seatsLeft: session.SeatsLeft
                        };
                        _session.startTime = FORMAT.date.formatHH_MM(_session.startDate);
                        _movie.sessions.push(_session);
                    }
                    _cinema.movies.push(_movie);
                }
                result.push(_cinema);
            }
        }
        return result;
    },

    get: function (url, callback, errorCallback) {
        DEBUG.log("url: " + url);
        var response = $.ajax({
            type: "GET",
            url: url,
            success: function (data) {
                DEBUG.log("response: " + data);
                if (callback != null) {
                    callback(data);
                }
            },
            error: function () {
                if (errorCallback != null) {
                    errorCallback();
                }

                UTILS.showAlert("Error:", "There is an error with communicating with the server.");
            }
        });
        return;
    },

    post: function (url, data, callback, errorCallback) {
        DEBUG.log("url: " + url);
        DEBUG.log(data);
        var response = $.ajax({
            type: "POST",
            url: url,
            data: JSON.stringify(data),
            contentType: "application/json",
            success: function (data) {
                DEBUG.log("response: " + data);
                if (callback != null) {
                    callback(data);
                }
            },
            error: function () {
                if (errorCallback != null) {
                    errorCallback();
                }

                UTILS.showAlert("Error:", "There is an error with communicating with the server.");
            }
        });
        return;
    }
};