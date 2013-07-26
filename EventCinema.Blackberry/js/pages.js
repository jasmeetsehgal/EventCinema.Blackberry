/// <reference path="SERVICE/cinemas.js" />
/// <reference path="SERVICE/cinemasClosest.js" />
/// <reference path="SERVICE/creditCardTypes.js" />
/// <reference path="SERVICE/helpers.js" />
/// <reference path="SERVICE/movies.js" />
/// <reference path="SERVICE/movieSummaries.js" />
/// <reference path="SERVICE/ratings.js" />
/// <reference path="SERVICE/sessions.js" />
/// <reference path="SERVICE/settings.js" />
/// <reference path="SERVICE/states.js" />
/// <reference path="SERVICE/users.js" />

var PAGES = {
    HomePage : {
        htmlFile: 'page/homepage.htm',
        id: 'homepage',
        onScreenReady: function (element, id, params) {
            
        },
        onDomReady: function (element, id, params) {
            $('#cinemas-link', element).bind('click', function () {
                UTILS.pushPage(PAGES.CinemaList);
                return false;
            });

            $('#times-link', element).bind('click', function () {
                UTILS.pushPage(PAGES.MoviesAndTimes);
                return false;
            });

            $('#clear-cache', element).bind('click', function () {
                localStorage.clear();
                return false;
            });
        }
    },
    allPagesLinks: {
        htmlFile: 'page/allPagesLinks.htm',
        id: 'allPagesLinks',
        onScreenReady: function (element, id, params) {
        }
    },
    Home: {
        htmlFile: 'page/Home.htm',
        id: 'Home',
        vars: {
            loadCinemasDone: false,
            loadMoviesDone: false,
            loadCinemaClosestDone: false
        },
        helpers: {
            checkLoadingDone: function(callback){
                if(PAGES.Home.vars.loadCinemasDone == true && 
                    PAGES.Home.vars.loadMoviesDone == true &&
                    PAGES.Home.vars.loadCinemaClosestDone == true) {
                    UTILS.showLoader(false);
                    //UTILS.pushPage(PAGES.CinebuzzMyCreditCardsList);
                    //UTILS.pushPage(PAGES.BuyTicket, { sessionId: 3455587 });
                    //UTILS.pushPage(PAGES.CinebuzzHome);

                    if (callback != null) {
                        callback();
                    }
                }
            },
            populateDb: function (callback) {
                //Show loading
                
                //Set up database
                EC_DB.init(function (isNew) {
                    //console.log("isNew: " + isNew);
                    if (isNew) {
                        UTILS.showLoader(true);
                    }

                    SERVICE.cinemas.populate(isNew, function () {
                        PAGES.Home.vars.loadCinemasDone = true;
                        PAGES.Home.helpers.checkLoadingDone(callback);
                    });
                    SERVICE.movieSummaries.populate(isNew, function () {
                        PAGES.Home.vars.loadMoviesDone = true;
                        PAGES.Home.helpers.checkLoadingDone(callback);
                    });
                    SERVICE.cinemasClosest.populate(isNew, function () {
                        PAGES.Home.vars.loadCinemaClosestDone = true;
                        PAGES.Home.helpers.checkLoadingDone(callback);
                    });
                });
            }
        },
        onScreenReady: function (element, id, params) {
            
        },
        onDomReady: function (element, id, params) {
            PAGES.Home.helpers.populateDb(function () {
            });

            $('#home-btn-login', element).bind('click', function () {
                SERVICE.settings.getUserToken(function (userToken) {
                    //console.log(userToken);
                    if (userToken == null || userToken == "") {
                        UTILS.pushPage(PAGES.CinebuzzLogin);
                    } else {
                        UTILS.pushPage(PAGES.CinebuzzHome);
                    }
                });

                return false;
            });

            $('#home-btn-sign-up', element).bind('click', function () {
                UTILS.pushPage(PAGES.CinebuzzRegister);
                return false;
            });
        }
    },
    BuyTicket: {
        htmlFile: 'page/BuyTicket.htm',
        id: 'BuyTicket',
        vars: {
            memberToken: "",
            sessionId: 0,
            element: null
        },
        helper: {
            loadIframe: function (element) {
                var url = SERVICE.sessions.getBuyTiketUrl(
                    PAGES.BuyTicket.vars.sessionId,
                    PAGES.BuyTicket.vars.memberToken);
                //console.log(url);
                var $buyTicketIframe = $("#buyTicketIframe", element);
                $buyTicketIframe.attr("src", url);
                $buyTicketIframe.attr("url", url);
                //console.log($buyTicketIframe);
            }
        },
        onScreenReady: function (element, id, params) {
        },
        onDomReady: function (element, id, params) {
            PAGES.BuyTicket.vars.sessionId = params.sessionId;
            PAGES.BuyTicket.vars.element = element;
            //Show loading
            //UTILS.showLoader(true);
            PAGES.BuyTicket.helper.loadIframe();
            //UTILS.showLoader(false);
        }
    },
    CinemaListing: {
        htmlFile: 'page/CinemaListing.htm',
        id: 'CinemaListing',
        vars: {
            getClosestCinemaDone: false,
            populatePreferredCinemaDone: false,
            populateCinemasDone: false,
            preferredCinemaId: 0,
            element: null
        },
        helpers: {
            checkLoadingDone: function () {
                if (PAGES.CinemaListing.vars.getClosestCinemaDone == true &&
                    PAGES.CinemaListing.vars.populatePreferredCinemaDone == true && 
                    PAGES.CinemaListing.vars.populateCinemasDone == true) {
                    UTILS.showLoader(false);
                }
            },
            getClosestCinema: function (callback) {
                
                SERVICE.cinemasClosest.getAll(function (cinemas) {
                    console.log(cinemas);
                    var nearby = $("#nearby", PAGES.CinemaListing.vars.element);
                    var tmpl = $("#cinema-listing-item").html();
                    var html = "";
                    for (var ctr = 0; ctr < cinemas.length ; ctr++) {
                        var cinema = cinemas[ctr];
                        var htmlItem = Mustache.to_html(tmpl, cinema);
                        html += htmlItem;
                    }
                    console.log(nearby);
                    nearby.html(html);

                    nearby.on("click", "li a.icon-info", function (e) {
                        e.preventDefault();
                        //e.stopPropagation();
                        var $li = $(this).parent();
                        var cinemaId = $li.data("cinema-id");
                        UTILS.pushPage(PAGES.CinemaDetails, { cinemaId: cinemaId });
                    });
                    nearby.on("click", "li .cinema-name, li .cinema-distance", function (e) {
                        e.preventDefault();
                        var $li = $(this).parent();
                        var cinemaId = $li.data("cinema-id");
                        UTILS.pushPage(PAGES.MovieListingByCinema, { cinemaId: cinemaId });
                    });

                    if (callback != null) {
                        callback();
                    }
                });

            },
            populatePreferredCinema: function (callback) {
                SERVICE.settings.getPreferredCinema(function (cinemaId) {
                    //console.log(cinemaId);
                    SERVICE.cinemas.getByCinemaId(cinemaId, function (cinema) {
                        var cinemaName = "Preferred Cinema";
                        //console.log(cinema);

                        if (cinema == null) {
                            $(".header .star-icon img", PAGES.CinemaListing.vars.element).attr('src', 'img/btn-star-icon_normal.png');
                            PAGES.CinemaListing.vars.preferredCinemaId = 0;
                        } else {
                            cinemaName = cinema.name();
                            PAGES.CinemaListing.vars.preferredCinemaId = cinemaId;
                        }                        
                        //$(".header .title-txt", PAGES.CinemaListing.vars.element).html(cinemaName);
                        $('#cinema-listing-btn-cinema', PAGES.CinemaListing.vars.element).html(cinemaName);
                        if (callback != null) {
                            callback();
                        }
                    });
                });
            },
            populateCinemas: function (callback) {
                var allCinemas = $("#allCinemas", PAGES.CinemaListing.vars.element);
                /*create and populate elemets on screen*/
                for (var stateCtr = 0; stateCtr < SERVICE.states.statesList.length ; stateCtr++) {
                    var state = SERVICE.states.statesList[stateCtr];
                    SERVICE.cinemas.getAllByState(state.id, function (stateId, cinemas) {
                        if (cinemas.length == 0) {
                        } else {
                            var tmpl = $("#all-cinema-listing-item").html();
                            var cinemaList = [];
                            cinemas.forEach(function (cinema) {
                                cinemaList.push({ name: cinema.name(), id: cinema.cinemaId() });
                            });
                            var cinemaObj = {
                                state: SERVICE.states.getStateById(stateId),
                                cinemalist: cinemaList
                            };
                            var htmlItem = Mustache.to_html(tmpl, cinemaObj);
                            allCinemas.append(htmlItem);
                        }
                    });
                }

                allCinemas.on("click", "li a.icon-info", function (e) {
                    e.preventDefault();
                    //e.stopPropagation();
                    var $li = $(this).parent();
                    var cinemaId = $li.data("id");
                    UTILS.pushPage(PAGES.CinemaDetails, { cinemaId: cinemaId });
                });
                allCinemas.on("click", "li .cinema-name, li .cinema-distance", function (e) {
                    e.preventDefault();
                    var $li = $(this).parent();
                    var cinemaId = $li.data("id");
                    UTILS.pushPage(PAGES.MovieListingByCinema, { cinemaId: cinemaId });
                });

                UTILS.initAccordion(PAGES.CinemaListing.vars.element);

                if (callback != null) {
                    callback();
                }
            }
        },
        onScreenReady: function (element, id, params) {
           
            
        },
        onDomReady: function (element, id, params) {
            UTILS.resize_Init(element);

            //UTILS.showLoader(true);
            PAGES.CinemaListing.vars.element = element;


            PAGES.CinemaListing.helpers.getClosestCinema(function () {
                PAGES.CinemaListing.vars.getClosestCinemaDone = true;
                PAGES.CinemaListingByMovie.helpers.checkLoadingDone();
            });


            PAGES.CinemaListing.helpers.populatePreferredCinema(function () {
                PAGES.CinemaListing.vars.populatePreferredCinemaDone = true;
                PAGES.CinemaListing.helpers.checkLoadingDone();
            });

            PAGES.CinemaListing.helpers.populateCinemas(function () {
                PAGES.CinemaListing.vars.populateCinemasDone = true;
                PAGES.CinemaListing.helpers.checkLoadingDone();
            });

            $('#cinema-listing-btn-star', element).on('click', function (e) {
                e.preventDefault();
                //e.stopPropagation();
                //alert("star button clicked");

                //UTILS.showLoader(true);
                if (PAGES.CinemaListing.vars.preferredCinemaId > 0) {
                    $('#cinema-listing-btn-star', element).find('img').attr('src', 'img/btn-star-icon_normal.png');
                    $('#cinema-listing-btn-cinema', element).html("Preferred Cinema");
                   
                    SERVICE.settings.setPreferredCinema(0, function () {
                        PAGES.CinemaListing.vars.preferredCinemaId = 0;
                        UTILS.showLoader(false);
                    });
                } else {
                    UTILS.pushPage(PAGES.PreferredCinema);
                }
            });


            $('#cinema-listing-btn-cinema', element).on('click', function (e) {
                e.preventDefault();
                //e.stopPropagation();

                if (PAGES.CinemaListing.vars.preferredCinemaId > 0) {
                    UTILS.pushPage(PAGES.MovieListingByCinema, { cinemaId: PAGES.CinemaListing.vars.preferredCinemaId });
                } else {
                    UTILS.pushPage(PAGES.PreferredCinema);
                }
            });

            
            $('#pill-nearby', element).on('click', function (e) {
                e.preventDefault();
                //UTILS.titlePillButtons_showList(['nearby', 'allCinemas']);
                $("#nearby", element).show();
                $("#allCinemas", element).hide();
                document.getElementById('scroller-content').scrollTo(0, 0);
                return false;
            });
            $('#pill-cinemas', element).on('click', function (e) {
                e.preventDefault();
                //UTILS.titlePillButtons_showList(['allCinemas', 'nearby']);
                $("#nearby", element).hide();
                $("#allCinemas", element).show();
                document.getElementById('scroller-content').scrollTo(0, 0);
            });
        }
    },

    MovieListingByCinema: {
        htmlFile: 'page/MovieListingByCinema.htm',
        id: 'MovieListingByCinema',
        vars: {
            cinemaId: null,
            selectedDate: null,
            movies: null,
            element: null,
            getAllMoviesDone: false,
            get3DMoviesDone: false,
            getVmaxMoviesDone: false,
            getGoldClassMoviesDone: false,
            cinemaAllMovies: "#cinema-all-movies",
            cinema3DMovies: "#cinema-3d-movies",
            cinemaVmaxMovies: "#cinema-vmax-movies",
            cinemaGoldClassMovies: "#cinema-goldclass-movies"
        },
        helpers: {
            getMovie: function (movie, screenType) {
                var tmpl = $("#session-listing-item-by-cinema").html();
                var sessions = movie.sessions;

                var newSessions = [];

                for (var sessionCtr = 0, sessionsLength = sessions.length;
                    sessionCtr < sessionsLength;
                    sessionCtr++) {

                    var session = sessions[sessionCtr];
                    session.is3D = movie.is3D;
                    session.isGoldClass = SERVICE.sessions.isGoldClass(session.screen);
                    session.isVMax = SERVICE.sessions.isVMax(session.screen);

                    if (FORMAT.date.checkSessionDate(session.startDate, PAGES.MovieListingByCinema.vars.selectedDate)) {

                        if (screenType == PAGES.MovieListingByCinema.vars.cinemaAllMovies) {
                            newSessions.push(session);
                        }

                        if (screenType == PAGES.MovieListingByCinema.vars.cinema3DMovies) {
                            if (session.is3D) {
                                newSessions.push(session);
                            }
                        }
                        if (screenType == PAGES.MovieListingByCinema.vars.cinemaVmaxMovies) {
                            if (session.isVMax) {
                                newSessions.push(session);
                            }
                        }
                        if (screenType == PAGES.MovieListingByCinema.vars.cinemaGoldClassMovies) {
                            if (session.isGoldClass) {
                                newSessions.push(session);
                            }
                        }
                    }
                }

                if (newSessions.length > 0) {
                    movie.newSessions = newSessions;
                    return Mustache.to_html(tmpl, movie);

                } else {
                    return "";
                }
            },
            generateHtml: function (movies, screenType) {
                var html = "";

                if (movies.length > 0) {
                    for (var ctr = 0, moviesLength = movies.length; ctr < moviesLength; ctr++) {
                        var movie = movies[ctr];

                        if (screenType == PAGES.MovieListingByCinema.vars.cinemaAllMovies)
                        {
                            html += PAGES.MovieListingByCinema.helpers.getMovie(movie, screenType);
                        }
                        else if (screenType == PAGES.MovieListingByCinema.vars.cinema3DMovies)
                        {
                            if (movie.is3D) {
                                html += PAGES.MovieListingByCinema.helpers.getMovie(movie, screenType);
                            }
                        }
                        else if (screenType == PAGES.MovieListingByCinema.vars.cinemaVmaxMovies)
                        {
                            if (movie.hasVmaxSessions) {
                                html += PAGES.MovieListingByCinema.helpers.getMovie(movie, screenType);
                            }
                        }
                        else if (screenType == PAGES.MovieListingByCinema.vars.cinemaGoldClassMovies)
                        {
                            if (movie.hasGoldClassSessions) {
                                html += PAGES.MovieListingByCinema.helpers.getMovie(movie, screenType);
                            }
                        }
                    }

                    if (html != "") {
                        return html;
                    } else {
                        return "<div style='font-size: 26px;text-align: center;'>No sessions available.</div>";
                    }
                }
                else {
                    return "<div style='font-size: 26px;text-align: center;'>No sessions available.</div>";
                }
            },
            checkLoadingDone: function () {
                if (PAGES.MovieListingByCinema.vars.getAllMoviesDone == true &&
                    PAGES.MovieListingByCinema.vars.get3DMoviesDone == true &&
                    PAGES.MovieListingByCinema.vars.getVmaxMoviesDone == true && 
                    PAGES.MovieListingByCinema.vars.getGoldClassMoviesDone == true) {
                    UTILS.showLoader(false);
                }
            },
            getAllTabs: function (movies, screenType, callback) {

                var html = PAGES.MovieListingByCinema.helpers.generateHtml(movies, screenType);
                $(screenType, PAGES.MovieListingByCinema.vars.element).html(html);

                $(screenType, PAGES.MovieListingByCinema.vars.element).on("click", '.buy-tickets', function () {
                    var sessionId = $(this).data("session-id");
                    UTILS.pushPage(PAGES.BuyTicket, { sessionId: sessionId });
                });

                $(screenType, PAGES.MovieListingByCinema.vars.element).on('click', '.accordion-head .thumb', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    UTILS.pushPage(PAGES.MovieDetails, { movieId: $(this).data('movie-id'), showCinemasAndTimes: true });
                });

                if (callback != null) {
                    callback();
                }
            },
            getAllMovies: function (callback) {
                SERVICE.sessions.getByCinemaIdScreenTypeDate(
                    PAGES.MovieListingByCinema.vars.cinemaId,
                    SERVICE.sessions.SCREENTYPES.ALL,
                    PAGES.MovieListingByCinema.vars.selectedDate,
                    function (movies) {
                        console.log(movies);

                        //PAGES.MovieListingByCinema.vars.movies = movies;
                        //var html = PAGES.MovieListingByCinema.helpers.generateHtml(movies);

                        PAGES.MovieListingByCinema.helpers.getAllTabs(movies, PAGES.MovieListingByCinema.vars.cinemaAllMovies, function () {
                            PAGES.MovieListingByCinema.vars.getAllMoviesDone = true;
                            PAGES.MovieListingByCinema.helpers.checkLoadingDone();
                        });

                        PAGES.MovieListingByCinema.helpers.getAllTabs(movies, PAGES.MovieListingByCinema.vars.cinema3DMovies, function () {
                            PAGES.MovieListingByCinema.vars.get3DMoviesDone = true;
                            PAGES.MovieListingByCinema.helpers.checkLoadingDone();
                        });

                        PAGES.MovieListingByCinema.helpers.getAllTabs(movies, PAGES.MovieListingByCinema.vars.cinemaVmaxMovies, function () {
                            PAGES.MovieListingByCinema.vars.getVmaxMoviesDone = true;
                            PAGES.MovieListingByCinema.helpers.checkLoadingDone();
                        });

                        PAGES.MovieListingByCinema.helpers.getAllTabs(movies, PAGES.MovieListingByCinema.vars.cinemaGoldClassMovies, function () {
                            PAGES.MovieListingByCinema.vars.getGoldClassMoviesDone = true;
                            PAGES.MovieListingByCinema.helpers.checkLoadingDone();
                        });

                        if (callback != null) {
                            callback();
                        }
                    }
                );
            },

            populateMovies: function () {
                PAGES.MovieListingByCinema.helpers.getAllMovies(function () {
                });

                
            }
        },
        onScreenReady: function (element, id, params) {
        },
        onDomReady: function (element, id, params) {
            UTILS.resize_Init(element);
            UTILS.initAccordion(element);

            UTILS.showLoader(true);
            PAGES.MovieListingByCinema.vars.getAllMoviesDone = false;
            PAGES.MovieListingByCinema.vars.get3DMoviesDone = false;
            PAGES.MovieListingByCinema.vars.getVmaxMoviesDone = false;
            PAGES.MovieListingByCinema.vars.getGoldClassMoviesDone = false;

            var cinemaId = params.cinemaId;
            PAGES.MovieListingByCinema.vars.element = element;
            PAGES.MovieListingByCinema.vars.cinemaId = cinemaId;
            PAGES.MovieListingByCinema.vars.selectedDate = new Date();

            //Load cinema name
            SERVICE.cinemas.getByCinemaId(cinemaId, function (cinema) {
                if (cinema == null) {
                    DEBUG.log("Cinema not found. CinemaId: " + cinemaId);
                } else {
                    $("#cinema-name", element).text(cinema.name());
                }
            });

            PAGES.MovieListingByCinema.helpers.populateMovies();

            //Load dates
            $(".dayNav .day", element).text(
                FORMAT.date.formatDDDDddMMM(PAGES.MovieListingByCinema.vars.selectedDate)
            );
            $(".dayNav a.prev", element).hide();
            $(".header", element).on('click', 'a.info-icon', function (e) {
                e.preventDefault();
                UTILS.pushPage(PAGES.CinemaDetails, { cinemaId: PAGES.MovieListingByCinema.vars.cinemaId });
            });

            $(".dayNav", element).on('click', 'a.prev, a.next', function (e) {
                e.preventDefault();
                UTILS.showLoader(true);

                $(PAGES.MovieListingByCinema.vars.cinemaAllMovies, element).html("");
                $(PAGES.MovieListingByCinema.vars.cinema3DMovies, element).html("");
                $(PAGES.MovieListingByCinema.vars.cinemaVmaxMovies, element).html("");
                $(PAGES.MovieListingByCinema.vars.cinemaGoldClassMovies, element).html("");

                if ($(this).hasClass('next')) {
                    PAGES.MovieListingByCinema.vars.selectedDate.setDate(PAGES.MovieListingByCinema.vars.selectedDate.getDate() + 1);
                } else {
                    PAGES.MovieListingByCinema.vars.selectedDate.setDate(PAGES.MovieListingByCinema.vars.selectedDate.getDate() - 1);
                }

                $(".dayNav .day", element).text(FORMAT.date.formatDDDDddMMM(PAGES.MovieListingByCinema.vars.selectedDate));
                $("#myPillButtons .bb-bb10-pill-button-selected-hires-dark", element).click();

                if (Number(PAGES.MovieListingByCinema.vars.selectedDate.getTime()) < Number(new Date())) {
                    $(".dayNav a.prev", element).hide();
                } else {
                    $(".dayNav a.prev", element).show();
                }

                PAGES.MovieListingByCinema.helpers.populateMovies();
            });


            $("#cinema-all", element).bind('click', function (e) {

                $(PAGES.MovieListingByCinema.vars.cinemaAllMovies, element).show();
                $(PAGES.MovieListingByCinema.vars.cinema3DMovies, element).hide();
                $(PAGES.MovieListingByCinema.vars.cinemaVmaxMovies, element).hide();
                $(PAGES.MovieListingByCinema.vars.cinemaGoldClassMovies, element).hide();
            });

            $("#cinema-3d", element).bind('click', function (e) {

                $(PAGES.MovieListingByCinema.vars.cinemaAllMovies, element).hide();
                $(PAGES.MovieListingByCinema.vars.cinema3DMovies, element).show();
                $(PAGES.MovieListingByCinema.vars.cinemaVmaxMovies, element).hide();
                $(PAGES.MovieListingByCinema.vars.cinemaGoldClassMovies, element).hide();
            });

            $("#cinema-vmax", element).bind('click', function (e) {

                $(PAGES.MovieListingByCinema.vars.cinemaAllMovies, element).hide();
                $(PAGES.MovieListingByCinema.vars.cinema3DMovies, element).hide();
                $(PAGES.MovieListingByCinema.vars.cinemaVmaxMovies, element).show();
                $(PAGES.MovieListingByCinema.vars.cinemaGoldClassMovies, element).hide();
            });

            $("#cinema-goldclass", element).bind('click', function (e) {

                $(PAGES.MovieListingByCinema.vars.cinemaAllMovies, element).hide();
                $(PAGES.MovieListingByCinema.vars.cinema3DMovies, element).hide();
                $(PAGES.MovieListingByCinema.vars.cinemaVmaxMovies, element).hide();
                $(PAGES.MovieListingByCinema.vars.cinemaGoldClassMovies, element).show();
            });

            //$("#myPillButtons", element).on('click', '#cinema-all,#cinema-3d,#cinema-vmax,#cinema-goldclass', function (e) {

            //    var filterby = $(this).data("filter").toLowerCase();

            //    alert(filterby);
            //    /* filtering li items*/
            //    if(filterby == ""){
            //        $('.accordion-items li', element).show();
            //    } else {
            //        $('.accordion-items li', element).hide();

            //        if (filterby.indexOf('vmax') > -1) {
            //            $('.accordion-items li[data-filter-vmax="true"]', element).show();
            //        }

            //        if (filterby.indexOf('3d') > -1) {
            //            $('.accordion-items li[data-filter-3d="true"]', element).show();
            //        }

            //        if (filterby.indexOf('gold class') > -1) {
            //            $('.accordion-items li[data-filter-gc="true"]', element).show();
            //        }
            //    }
            //    /*  */
            //    $('.accordion-head', element).parent().hide().filter(function () {                   
            //        var filters = $(this).find('.description').data("filters").toLowerCase();
            //        if (filters.indexOf(filterby) > -1) {
            //            return true;
            //          }else { 
            //            return false;
            //        }                   
            //    }).show();
            //});
        }
    },

    PreferredCinema: {
        htmlFile: 'page/PreferredCinema.htm',
        id: 'PreferredCinema',
        helpers: {
            populateCinemas: function (element) {
                //UTILS.showLoader(true);
                SERVICE.settings.getPreferredCinema(function (preferredCinemaId) {
                    SERVICE.cinemas.getAll(function (cinemas) {
                        //DEBUG.log(cinemas);
                        var tempObj ={cinemas:[]};
                        for (var cinemaCtr = 0; cinemaCtr < cinemas.length; cinemaCtr++) {
                            var cinema = cinemas[cinemaCtr];
                            tempObj.cinemas.push({ id: cinema.cinemaId(), name: cinema.name() });
                            if (cinema.cinemaId() == preferredCinemaId) {
                                /*todo: selected*/
                            }
                        }
                        var tmpl = $("#temp-preferred-cinema").html();
                        var html = Mustache.to_html(tmpl, tempObj);                           
                        $("#preferredCinemas", element).html(html);
                        UTILS.showLoader(false);
                    });
                });
            }
        },
        onScreenReady: function (element, id, params) {
            
        },
        onDomReady: function (element, id, params) {
            PAGES.PreferredCinema.helpers.populateCinemas(element);

            $('#preferredCinemas', element).on("click", "li", function () {
                UTILS.showLoader(true);
                var $this = $(this);
                var cinemaId = $this.data("cinema-id");
                SERVICE.settings.setPreferredCinema(cinemaId, function () {
                    SERVICE.cinemas.getByCinemaId(cinemaId, function (cinema) {
                        UTILS.showLoader(false);

                        setTimeout(function () {
                            if (cinema != null) {
                                UTILS.showAlert("Preferred Cinema", "Your preferred cinema has been set to " + cinema.name(), function () {
                                    UTILS.popPage(function () {
                                    });

                                });
                            }
                        }, 500);
                    });
                });
            });
        }
    },
    SessionListing: {
        htmlFile: 'page/SessionListing.htm',
        id: 'SessionListing',
        onScreenReady: function (element, id, params) {
           
        },
        onDomReady: function (element, id, params) {
            UTILS.resize_Init(element);
            UTILS.initAccordion(element);
        }
    },
    CinemaListingByMovie: {
        htmlFile: 'page/CinemaListingByMovie.htm',
        id: 'CinemaListingByMovie',
        vars: {
            movieId: null,
            selectedDate: null,
            cinemas: null,
            element: null,
            stateId: null,
            getNearByCinemasDone: false,
            getAllStatesDone: false,
            MAX_SESSION_TIMES_HEADER: 5
        },
        helpers: {
            generateHtml: function (cinemas) {
                var tmpl = $("#session-listing-item-by-movie").html();
                var html = "";

                if (cinemas.length > 0)
                {
                    for (var ctr = 0, cinemasLength = cinemas.length; ctr < cinemasLength; ctr++) {
                        var cinema = cinemas[ctr];
                        var movie = cinema.movies[0];
                        var movieSessions = movie.sessions;
                        var sessionsStartTime = "";

                        for (var k = 0, maxMovieSessionsLength = movieSessions.length;
                            k < maxMovieSessionsLength && k < PAGES.CinemaListingByMovie.vars.MAX_SESSION_TIMES_HEADER;
                            k++) {
                            if (k == (movieSessions.length - 1)) {
                                sessionsStartTime += movieSessions[k].startTime;
                            }
                            else {
                                sessionsStartTime += movieSessions[k].startTime + ", ";
                            }
                        }

                        for (var k = 0, maxMovieSessionsLength = movieSessions.length;
                            k < maxMovieSessionsLength;
                            k++) {
                            var movieSession = movieSessions[k];
                            movieSession.isVMax = SERVICE.sessions.isVMax(movieSession.screen);
                            movieSession.is3D = movie.is3D;
                            movieSession.isGoldClass = SERVICE.sessions.isGoldClass(movieSession.screen);
                        }

                        if (movieSessions.length > PAGES.CinemaListingByMovie.vars.MAX_SESSION_TIMES_HEADER) {
                            sessionsStartTime += " ...";
                        }

                        movie.cinemaName = cinema.name;
                        movie.sessionsStartTime = sessionsStartTime;

                        //DEBUG.log(movie);

                        var htmlItem = Mustache.to_html(tmpl, movie);
                        html += htmlItem;
                    }
                    return html;
                } else {
                    return "<div style='font-size: 26px;text-align: center;'>No sessions available. Please try another day, or cinema type.</div>";
                }
            },
            checkLoadingDone: function () {
                if (PAGES.CinemaListingByMovie.vars.getNearByCinemasDone == true &&
                    PAGES.CinemaListingByMovie.vars.getAllStatesDone == true) {
                    UTILS.showLoader(false);
                }
            },
            getNearByCinemas: function (callback) {
                SERVICE.sessions.getByNearByCinemasMovieId(
                    PAGES.CinemaListingByMovie.vars.movieId,
                    PAGES.CinemaListingByMovie.vars.selectedDate,
                    function (cinemas) {
                        //DEBUG.log(cinemas);

                        PAGES.CinemaListingByMovie.vars.cinemas = cinemas;
                        var scrollerContent = $("#nearby", PAGES.CinemaListingByMovie.vars.element);

                        var html = PAGES.CinemaListingByMovie.helpers.generateHtml(cinemas);
                        
                        //console.log(html);
                        scrollerContent.html(html);
                        if (callback != null) {
                            callback();
                        }

                        scrollerContent.on("click", '.buy-tickets', function () {
                            var sessionId = $(this).data("session-id");
                            UTILS.pushPage(PAGES.BuyTicket, { sessionId: sessionId });
                        });
                    }
                );
            },
            getAllStates: function (callback) {
                var allStates = $("#allStates", PAGES.CinemaListingByMovie.vars.element);
                /*create and populate elemets on screen*/
                for (var stateCtr = 0; stateCtr < SERVICE.states.statesList.length ; stateCtr++) {
                    var state = SERVICE.states.statesList[stateCtr];
                    SERVICE.cinemas.getAllByState(state.id, function (stateId, cinemas) {
                        if (cinemas.length == 0) {
                        } else {
                            var tmpl = $("#all-states-listing-item").html();
                            var cinemaObj = {
                                state: SERVICE.states.getStateById(stateId),
                                stateId: stateId
                            };
                            var htmlItem = Mustache.to_html(tmpl, cinemaObj);
                            allStates.append(htmlItem);
                            if (callback != null) {
                                callback();
                            }
                        }
                    });
                }
            },
            getAllCinemas: function (callback) {
                
                SERVICE.sessions.getByStatesCinemasMovieId(
                    PAGES.CinemaListingByMovie.vars.movieId,
                    PAGES.CinemaListingByMovie.vars.stateId,
                    PAGES.CinemaListingByMovie.vars.selectedDate,
                    function (cinemas) {
                        
                        PAGES.CinemaListingByMovie.vars.cinemas = cinemas;
                        var scrollerContent = $("#allCinemas", PAGES.CinemaListingByMovie.vars.element);

                        var html = PAGES.CinemaListingByMovie.helpers.generateHtml(cinemas);

                        scrollerContent.html(html);

                        if (callback != null) {
                            callback();
                        }

                        scrollerContent.on("click", '.buy-tickets', function () {
                            var sessionId = $(this).data("session-id");
                            UTILS.pushPage(PAGES.BuyTicket, { sessionId: sessionId });
                        });
                    }
                );
                UTILS.initAccordion(element);
            }
        },
        onScreenReady: function (element, id, params) {
            
        },
        onDomReady: function (element, id, params) {
            UTILS.resize_Init(element);
            UTILS.initAccordion(element);


            UTILS.showLoader(true);
            PAGES.CinemaListingByMovie.vars.getAllStatesDone = false;
            PAGES.CinemaListingByMovie.vars.getNearByCinemasDone = false;
            var movieId = params.movieId;


            var selectedDate = new Date(params.selectedDate);
            PAGES.CinemaListingByMovie.vars.element = element;
            PAGES.CinemaListingByMovie.vars.movieId = movieId;
            PAGES.CinemaListingByMovie.vars.selectedDate = selectedDate;
            //Load movie name
            SERVICE.movieSummaries.getByMovieId(movieId, function (movie) {
                // console.log(movie);
                if (movie == null) {
                    DEBUG.log("Movie not found. MovieId: " + movieId);
                } else {
                    $("#movie-name", element).text(FORMAT.string.trimChars(movie.title(), 30));
                }
            });

            PAGES.CinemaListingByMovie.helpers.getAllStates(function () {
                PAGES.CinemaListingByMovie.vars.getAllStatesDone = true;
                PAGES.CinemaListingByMovie.helpers.checkLoadingDone();
            });

            PAGES.CinemaListingByMovie.helpers.getNearByCinemas(function () {
                PAGES.CinemaListingByMovie.vars.getNearByCinemasDone = true;
                PAGES.CinemaListingByMovie.helpers.checkLoadingDone();
            });

            //Load dates
            $(".dayNav .day").text(
                FORMAT.date.formatDDDDddMMM(PAGES.CinemaListingByMovie.vars.selectedDate)
            );

            $(".dayNav a.prev", element).hide();
            $(".header", element).on('click', 'a.info-icon', function (e) {
                e.preventDefault();
                UTILS.pushPage(PAGES.MovieDetails, { movieId: PAGES.CinemaListingByMovie.vars.movieId, showCinemasAndTimes: true });
            });

            $(".dayNav", element).on('click', 'a.prev, a.next', function (e) {
                e.preventDefault();
                UTILS.showLoader(true);
                $("#nearby", element).html("");
                if ($(this).hasClass('next')) {
                    PAGES.CinemaListingByMovie.vars.selectedDate.setDate(PAGES.CinemaListingByMovie.vars.selectedDate.getDate() + 1);
                } else {
                    PAGES.CinemaListingByMovie.vars.selectedDate.setDate(PAGES.CinemaListingByMovie.vars.selectedDate.getDate() - 1);
                }
                PAGES.CinemaListingByMovie.helpers.getNearByCinemas(function () {
                    $(".dayNav .day", element).text(
                        FORMAT.date.formatDDDDddMMM(PAGES.CinemaListingByMovie.vars.selectedDate)
                    );
                    UTILS.showLoader(false);
                    $("#myPillButtons .bb-bb10-pill-button-selected-hires-dark", element).click();
                });

                if (Number(PAGES.CinemaListingByMovie.vars.selectedDate.getTime()) < Number(new Date())) {
                    $(".dayNav a.prev", element).hide();
                } else {
                    $(".dayNav a.prev", element).show();
                }
            });

            $('#allStates', element).on('click','li',function (e) {
                UTILS.showLoader(true);
                e.preventDefault();
                PAGES.CinemaListingByMovie.vars.stateId = $(this).data("state-id");

                $('#nearby', element).hide();
                $('#allStates', element).hide();
                $('#allCinemas', element).show();

                PAGES.CinemaListingByMovie.helpers.getAllCinemas(function () {
                    UTILS.showLoader(false);
                });
            });

            $('#pill-nearby',element).on('click', function (e) {
                e.preventDefault();

                $('#nearby', element).show();
                $('#allStates', element).hide();
                $('#allCinemas', element).hide();
                return false;
            });
            $('#pill-cinemas',element).on('click', function (e) {
                e.preventDefault();

                $('#nearby', element).hide();
                $('#allStates', element).show();
                $('#allCinemas', element).hide();
                return false;
            });
        }
    },
    MovieListing: {
        htmlFile: 'page/MovieListing.htm',
        id: 'MovieListing',
        vars: {
            getNowShowingDone: false,
            getAdvancedTicketDone: false,
            getComingSoonDone: false,
            element: null,
            nowShowing: 1,
            advancedTickets: 2,
            comingSoon: 3
        },
        helpers: {
            checkLoadingDone: function () {
                if (PAGES.MovieListing.vars.getNowShowingDone == true &&
                    PAGES.MovieListing.vars.getAdvancedTicketDone == true && 
                    PAGES.MovieListing.vars.getComingSoonDone == true) {
                    UTILS.showLoader(false);
                }
            },
            populateMovieDetails: function (parent, movies, showReleaseDate, tab) {

                //console.log(movies);

                var tmpl = $("#movie-listing-item").html();
                var html = "";
                for (var ctr = 0; ctr < movies.length ; ctr++) {
                    var movie = movies[ctr];
                    if (movie.moviePosterImageThumbnail() == null) {
                        movie.moviePosterImageThumbnailCDN = "img/thumb_noimage.jpg";
                    }else{
                        var img = movie.moviePosterImageThumbnail();
                        movie.moviePosterImageThumbnailCDN = SERVICE.helpers.getThumnailImage(img);
                    }

                    movie.movieTitle = FORMAT.string.trimChars(movie.title(), 30);

                    movie.ratingText = SERVICE.ratings.getById(movie.rating()).string;

                    if (showReleaseDate) {
                        movie.releaseDateDDMM = FORMAT.date.formatDD_MM(movie.releaseDate());
                    } else {
                        movie.releaseDateDDMM = "";
                    }

                    var htmlItem = Mustache.to_html(tmpl, movie);
                    html += htmlItem;
                }
                parent.html(html);


                parent.on("click", 'li .thumb', function (e) {
                    e.preventDefault();
                    var $li = $(this).parent();
                    var movieId = $li.data("movie-id");

                    if (tab == PAGES.MovieListing.vars.comingSoon) {
                        UTILS.pushPage(PAGES.MovieDetails, { movieId: movieId, showCinemasAndTimes: false });
                    } else {
                        UTILS.pushPage(PAGES.MovieDetails, { movieId: movieId, showCinemasAndTimes: true });
                    }
                });

                parent.on("click", 'li .detail', function () {
                    var $li = $(this).parent();
                    var movieId = $li.data("movie-id");

                    if (tab == PAGES.MovieListing.vars.comingSoon) {
                        UTILS.pushPage(PAGES.MovieDetails, { movieId: movieId, showCinemasAndTimes: false });
                    } else {
                        
                        var selectedDate = new Date;
                        if (tab == PAGES.MovieListing.vars.advancedTickets)
                        {
                            selectedDate = $li.data("release-date");
                        }
                        UTILS.pushPage(PAGES.CinemaListingByMovie, { movieId: movieId, selectedDate: selectedDate });
                    }
                });
            },
            getNowShowingThisWeek: function (element) {
                var parent = $("#movie-listing-this-week-movies", element);

                SERVICE.movieSummaries.getNowShowingThisWeek(function (movies) {
                    PAGES.MovieListing.helpers.populateMovieDetails(parent, movies, false, PAGES.MovieListing.vars.nowShowing);
                });
            },
            getNowShowingLastWeek: function (element) {
                var parent = $("#movie-listing-last-week-movies", element);

                SERVICE.movieSummaries.getNowShowingLastWeek(function (movies) {
                    PAGES.MovieListing.helpers.populateMovieDetails(parent, movies, false, PAGES.MovieListing.vars.nowShowing);
                });
            },
            getNowShowingAZ: function (element) {
                var parent = $("#movie-listing-all-movies", element);
                SERVICE.movieSummaries.getNowShowingAZ(function (movies) {
                    PAGES.MovieListing.helpers.populateMovieDetails(parent, movies, false, PAGES.MovieListing.vars.nowShowing);
                });
            },
            getNowShowing: function (callback) {
                //Show loading
                //UTILS.showLoader(true);
                
                PAGES.MovieListing.helpers.getNowShowingThisWeek(PAGES.MovieListing.vars.element);
                PAGES.MovieListing.helpers.getNowShowingLastWeek(PAGES.MovieListing.vars.element);
                PAGES.MovieListing.helpers.getNowShowingAZ(PAGES.MovieListing.vars.element);

                if (callback != null) {
                    callback();
                }
                //UTILS.showLoader(false);
            },
            getAdvancedTicket: function (callback) {

                var parent = $("#movie-listing-advanced-tickets", PAGES.MovieListing.vars.element);

                SERVICE.movieSummaries.getAdvancedTicket(function (movies) {
                    //console.log(movies);
                    PAGES.MovieListing.helpers.populateMovieDetails(parent, movies, true, PAGES.MovieListing.vars.advancedTickets);
                });

                if (callback != null) {
                    callback();
                }
            },
            getComingSoon: function (callback) {
                
                var parent = $("#movie-listing-comming-soon", PAGES.MovieListing.vars.element);

                SERVICE.movieSummaries.getComingSoon(function (movies) {
                    console.log(movies);
                    PAGES.MovieListing.helpers.populateMovieDetails(parent, movies, true, PAGES.MovieListing.vars.comingSoon);
                });

                if (callback != null) {
                    callback();
                }
            }
        },
        onScreenReady: function (element, id, params) {
        },
        onDomReady:function(element, id, params){
            UTILS.resize_Init(element);

            //UTILS.showLoader(true);
            // UTILS.resize_Init(element);        
            PAGES.MovieListing.vars.element = element;
            PAGES.MovieListing.vars.getNowShowingDone = false;
            PAGES.MovieListing.vars.getAdvancedTicketDone = false;
            PAGES.MovieListing.vars.getComingSoonDone = false;

            PAGES.MovieListing.helpers.getNowShowing(function () {
                PAGES.MovieListing.vars.getNowShowingDone = true;
                PAGES.MovieListing.helpers.checkLoadingDone();
            });
            PAGES.MovieListing.helpers.getAdvancedTicket(function () {
                PAGES.MovieListing.vars.getAdvancedTicketDone = true;
                PAGES.MovieListing.helpers.checkLoadingDone();
            });
            PAGES.MovieListing.helpers.getComingSoon(function () {
                PAGES.MovieListing.vars.getComingSoonDone = true;
                PAGES.MovieListing.helpers.checkLoadingDone();
            });

            $("#movie-listing-now-showing", element).show();
            $("#movie-listing-advanced-tickets", element).hide();
            $("#movie-listing-comming-soon", element).hide();

            $('#movie-listing-btn-now-showing', element).on('click', function (e) {
                $("#movie-listing-now-showing", element).show();
                $("#movie-listing-advanced-tickets", element).hide();
                $("#movie-listing-comming-soon", element).hide();
                document.getElementById('scroller-content').scrollTo(0, 0);
                return false;
            });

            $('#movie-listing-btn-advanced-tickets', element).on('click', function (e) {
                $("#movie-listing-now-showing", element).hide();
                $("#movie-listing-advanced-tickets", element).show();
                $("#movie-listing-comming-soon", element).hide();
                document.getElementById('scroller-content').scrollTo(0, 0);
                return false;
            });

            $('#movie-listing-btn-coming-soon', element).on('click', function (e) {
                $("#movie-listing-now-showing", element).hide();
                $("#movie-listing-advanced-tickets", element).hide();
                $("#movie-listing-comming-soon", element).show();
                document.getElementById('scroller-content').scrollTo(0, 0);
                return false;
            });
        }
    },
    MovieDetails: {
        htmlFile: 'page/MovieDetails.htm',
        id: 'MovieDetails',
        movieId: null,
        showCinemasAndTimes: false,
        helpers: {
            showMovieDetail: function (value, title, detail) {
                if (value != null) {
                    title.show();
                    detail.html(value);
                } else {
                    title.hide();
                    detail.html("");
                }
            }
        },
        onScreenReady: function (element, id, params) {
            
        },
        onDomReady: function (element, id, params) {
            //Show loading
            //UTILS.showLoader(true);
            PAGES.MovieDetails.movieId = params.movieId;
            PAGES.MovieDetails.showCinemasAndTimes = params.showCinemasAndTimes;
            var itemsDiv = $('.list-items', element);

            if (PAGES.MovieDetails.showCinemasAndTimes) {
                $('#movie-details-btn-view-cinemas-times', element).show();
            } else {
                $('#movie-details-btn-view-cinemas-times', element).hide();
            }

            SERVICE.movies.getByMovieId(PAGES.MovieDetails.movieId, function (movie) {

                //console.log(movie);

                itemsDiv.find('li.heading.title').html(movie.title);

                var extras = jQuery.parseJSON(movie.extrasJson);

                for (var k = 0; k < extras.length; k++) {
                    if (extras[k].Title == "Trailer") {
                        console.log(extras[k]);
                        //add HTML5 video player
                        //itemsDiv.find('li.no-border.video-cont').html("<video width=\"100%\" height=\"260px\" poster=\"" + extras[k].Thumbnail + "\" controls autobuffer style=\"background-color: black;\">" +
                        //                                                    "<!-- safari / chrome / ie9 -->" +
                        //                                                    "<source type=\"video/mp4\" src=\"" + extras[k].Url + "\">" +
                        //                                                    "Your browser does not support the video tag.</video>");

                        var thumbImage = "img/noimage_video.png";

                        if (extras[k].Thumbnail != null)
                        {
                            thumbImage = extras[k].Thumbnail;
                        }

                        itemsDiv.find('li.no-border.video-cont').html("<a width=\"100%\" height=\"260px\" href='" + extras[k].Url + "' target='_black'>" +
                            "<img src='" + thumbImage + "'/><img src=\"img/play_btn.png\" alt=\"PLAY\" class=\"play-btn\" /></a>");
                    }
                }

                if (movie.moviePosterImage == null) {
                    movie.moviePosterImage = "img/detailThumb_noimage.jpg";
                }
                var thumnailImage = SERVICE.helpers.getThumnailImage(movie.moviePosterImage, 184, 268);
                itemsDiv.find('li.no-border .thumb').html("<img src=\"" + thumnailImage + "\" />");
                itemsDiv.find('li.no-border .detail .title').html(movie.title);

                var ratingTitle = itemsDiv.find('li.no-border .detail .description .rating-title');
                var rating = itemsDiv.find('li.no-border .detail .description .rating');
                PAGES.MovieDetails.helpers.showMovieDetail(SERVICE.ratings.getById(movie.rating).string, ratingTitle, rating);

                var runningTimetitle = itemsDiv.find('li.no-border .detail .description .running-time-title');
                var runningTime = itemsDiv.find('li.no-border .detail .description .running-time');
                PAGES.MovieDetails.helpers.showMovieDetail(movie.runningTime, runningTimetitle, runningTime);

                var mainCastTitle = itemsDiv.find('li.no-border .detail .description .main-cast-title');
                var mainCast = itemsDiv.find('li.no-border .detail .description .main-cast');
                PAGES.MovieDetails.helpers.showMovieDetail(movie.mainCast, mainCastTitle, mainCast);

                itemsDiv.find('li.no-border .synopsis').html(movie.miniSynopsis);
                //console.log(movie);

                UTILS.showLoader(false);
            });

            $('#movie-details-btn-view-cinemas-times', element).on('click', function (e) {
                var selectedDate = new Date;
                UTILS.pushPage(PAGES.CinemaListingByMovie, { movieId: PAGES.MovieDetails.movieId, selectedDate: selectedDate });
            });
        }
    },
    CinemaDetails: {
        htmlFile: 'page/CinemaDetails.htm',
        id: 'CinemaDetails',
        cinemaId:null,
        onScreenReady: function (element, id, params) {
        },
        onDomReady: function (element, id, params) {
            //UTILS.showLoader(true);
            PAGES.CinemaDetails.cinemaId = params.cinemaId;
            var itemsDiv = $('.list-items', element)
            SERVICE.cinemas.getByCinemaId(PAGES.CinemaDetails.cinemaId, function (data) {

                var mapOptions = {
                    center: new google.maps.LatLng(parseFloat(data.latitude()), parseFloat(data.longitude())),
                    zoom: 13,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };
                var address = "<span class=\"colorBlack\">Address:</span> " + data.streetAddress() + ", " + data.suburb() + ", " + data.postcode() + "<br><br>";
                if (data.parkingInfo()) {
                    address += "<span class=\"colorBlack\">Parking:</span> " + data.parkingInfo();
                }
                if (!data.has3D()) {
                    $('img.logo-3d').hide();
                }
                if (!data.hasVMax()) {
                    $('img.logo-vmax').hide();
                }
                if (!data.hasGoldClass()) {
                    $('img.logo-goldclass').hide();
                }
                itemsDiv.find('li.heading').html(data.name());
                itemsDiv.find('.text-desc').html(address);
                SERVICE.settings.getPreferredCinema(function (preferredCinemaId) {
                    if (PAGES.CinemaDetails.cinemaId == preferredCinemaId) {
                        itemsDiv.find('#wrap-set-prefered').removeClass('inactive')
                    }
                });
                UTILS.initializeMap(mapOptions);
                UTILS.showLoader(false);
            });

            $('.list-items', element).on('click', '#view-cinema', function (e) {
                UTILS.pushPage(PAGES.MovieListingByCinema, { cinemaId: PAGES.CinemaDetails.cinemaId });
            });
            $('.list-items', element).on('click', '#set-prefered', function (e) {
                SERVICE.settings.setPreferredCinema(PAGES.CinemaDetails.cinemaId);
                $('#wrap-set-prefered', element).removeClass('inactive');
            });
        }
    },
    CinebuzzLogin: {
        htmlFile: 'page/CinebuzzLogin.htm',
        id: 'CinebuzzLogin',
        onScreenReady: function (element, id, params) {
        },
        onDomReady:function(element, id, params){
            UTILS.resize_Init(element);

            $('#cinebuzz-login-btn-forgot-details', element).bind('click', function () {
                UTILS.replaceScreen(PAGES.CinebuzzForgotPassword);
            });
            $('#cinebuzz-login-btn-join-now', element).bind('click', function () {
                UTILS.replaceScreen(PAGES.CinebuzzRegister);
            });

            $('#cinebuzz-login-btn-login', element).bind('click', function () {
                //check username and password
                UTILS.showLoader(true);
                var username = $('#cinebuzz-login-username', element).val();
                var password = $('#cinebuzz-login-password', element).val();

                SERVICE.users.login(username, password, function (data) {
                    //console.log(data);
                    if (data.isValid) {
                        //alert("Success");
                        SERVICE.users.getUserDetails(function (user) {
                            //console.log(user);
                            UTILS.replaceScreen(PAGES.CinebuzzHome);
                        });
                    }
                    else {
                        UTILS.showLoader(false);
                        setTimeout(function () {
                            UTILS.showAlert("Login", data.statusDescription, function () { });
                        }, 500);
                    }
                });
            });
        }
    },
    
    CinebuzzHome: {
        htmlFile: 'page/CinebuzzHome.htm',
        id: 'CinebuzzHome',
        showCinebuzzWelcome: true,
        helpers: {
            pushPage: function (page) {
                SERVICE.settings.getUserToken(function (userToken) {
                    if (userToken == null || userToken == "") {
                        UTILS.pushPage(PAGES.CinebuzzLogin);
                    } else {
                        UTILS.pushPage(page);
                    }
                });
            }
        },
        onScreenReady: function (element, id, params) {
            
        },
        onDomReady: function (element, id, params) {
            UTILS.resize_Init(element);

            SERVICE.settings.getUserDetails(function (user) {
                //UTILS.showLoader(true);
                var userDetails = jQuery.parseJSON(user);
                $(".user-info .user-name", element).html("Welcome back, " + userDetails.username);
                $("#cinebuzz-home-points-earned", element).html(userDetails.cinebuzzPoints);
                //UTILS.showLoader(false);
            });

            $('#cinebuzz-home-btn-logout', element).bind('click', function () {
                SERVICE.users.logout(function () {
                    UTILS.replaceScreen(PAGES.CinebuzzLogin);
                });
            });

            $('#cinebuzz-home-btn-edit-details', element).bind('click', function () {
                PAGES.CinebuzzHome.helpers.pushPage(PAGES.CinebuzzEditDetails);
            });

            $('#cinebuzz-home-btn-view-orders', element).bind('click', function () {
                PAGES.CinebuzzHome.helpers.pushPage(PAGES.CinebuzzOrders);
            });

            $('#cinebuzz-home-btn-preferred-cinema', element).bind('click', function () {
                PAGES.CinebuzzHome.helpers.pushPage(PAGES.PreferredCinema);
            });

            $('#cinebuzz-home-btn-my-digital-card', element).bind('click', function () {
                PAGES.CinebuzzHome.helpers.pushPage(PAGES.CinebuzzMyDigitalCard);
            });

            $('#cinebuzz-home-btn-my-credit-cards', element).bind('click', function () {
                PAGES.CinebuzzHome.helpers.pushPage(PAGES.CinebuzzMyCreditCardsList);
            });

            $('#cinebuzz-home-btn-view-offers', element).bind('click', function () {
                PAGES.CinebuzzHome.helpers.pushPage(PAGES.CinebuzzOffers);
            });
        }
    },
    CinebuzzEditDetails: {
        htmlFile: 'page/CinebuzzEditDetails.htm',
        id: 'CinebuzzEditDetails',
        vars: {
            preferredCinemaId: 0,
            accountPassword: "",
            newPassword: "",
            confirmNewPassword: "",
            accountUsername: "",
            confirmNewUsername: "",
            digitPin: "",
            confirmNewPin: "",
            genderId: "",
            preferredCinema: "",
            accountEmail: "",
            confirmNewEmail: "",
            mob: "",
            street: "",
            suburb: "",
            stateId: "",
            postcode: "",
            subscribe: "",
            prePopulateEntries: false
        },
        helpers: {
            showErrorMessage: function (message) {
                var title = "Invalid Edit User Details";
                UTILS.showAlert(title, message, function () { });
            },
            getGender: function(genderId) {
                var gender = "Male";

                if (genderId == 1) {
                    gender = "Female";
                }
                return gender;
            },
            getUserDetails: function (element) {
                SERVICE.users.getUserDetails(function () {
                    SERVICE.settings.getUserDetails(function (dataStr) {
                        //console.log(dataStr);
                        var data = JSON.parse(dataStr);
                    
                        $('#cinebuzz-edit-details-username', element).val(data.username);

                        element.getElementById('cinebuzz-edit-details-gender').setSelectedText(PAGES.CinebuzzEditDetails.helpers.getGender(data.gender));

                        $('#cinebuzz-edit-details-preferred-cinema', element).val(data.preferredCinemaName);
                        $('#cinebuzz-edit-details-email', element).val(data.email);
                        $('#cinebuzz-edit-details-mob', element).val(data.mobilePhoneNumber.replace(/\D/g,''));
                        $('#cinebuzz-edit-details-street', element).val(data.address.streetAddress);
                        $('#cinebuzz-edit-details-suburb', element).val(data.address.suburb);
                        document.getElementById('cinebuzz-edit-details-state').setSelectedText(SERVICE.states.getStateById(data.address.state));
                        //$('#cinebuzz-edit-details-state', element).val(data.address.state).attr('selected', true);
                        $('#cinebuzz-edit-details-postcode', element).val(data.address.postcode);
                    });
                });
            },
            populateStates: function (element) {
                var allStates = $('#cinebuzz-edit-details-state', element);
                allStates.append(new Option(" ", ""));

                /*create and populate elemets on screen*/
                for (var stateCtr = 0; stateCtr < SERVICE.states.statesList.length ; stateCtr++) {
                    var state = SERVICE.states.statesList[stateCtr];
                    allStates.append(new Option(state.text, state.id));
                }
            },
            populatePreferredCinema: function (element) {
                SERVICE.settings.getPreferredCinema(function (cinemaId) {
                    //console.log(cinemaId);
                    SERVICE.cinemas.getByCinemaId(cinemaId, function (cinema) {
                        //console.log(cinema);

                        if (cinema != null) {
                            $('#cinebuzz-edit-details-preferred-cinema', element).val(cinema.name())
                            PAGES.CinebuzzEditDetails.vars.preferredCinemaId = cinemaId;
                        }
                    });
                });
            },
            populateEntries: function (element) {
                $('#cinebuzz-edit-details-account-password', element).val(PAGES.CinebuzzEditDetails.vars.accountPassword);
                $('#cinebuzz-edit-details-new-password', element).val(PAGES.CinebuzzEditDetails.vars.newPassword);
                $('#cinebuzz-edit-details-confirm-new-password', element).val(PAGES.CinebuzzEditDetails.vars.confirmNewPassword);
                $('#cinebuzz-edit-details-username', element).val(PAGES.CinebuzzEditDetails.vars.accountUsername);
                $('#cinebuzz-edit-details-confirm-new-username', element).val(PAGES.CinebuzzEditDetails.vars.confirmNewUsername);
                $('#cinebuzz-edit-details-digit-pin', element).val(PAGES.CinebuzzEditDetails.vars.digitPin);
                $('#cinebuzz-edit-details-confirm-new-pin', element).val(PAGES.CinebuzzEditDetails.vars.confirmNewPin);
                document.getElementById('cinebuzz-edit-details-gender').setSelectedText(PAGES.CinebuzzEditDetails.helpers.getGender(PAGES.CinebuzzEditDetails.vars.genderId));
                $('#cinebuzz-edit-details-email', element).val(PAGES.CinebuzzEditDetails.vars.accountEmail);
                $('#cinebuzz-edit-details-confirm-email', element).val(PAGES.CinebuzzEditDetails.vars.confirmNewEmail);
                $('#cinebuzz-edit-details-mob', element).val(PAGES.CinebuzzEditDetails.vars.mob);
                $('#cinebuzz-edit-details-street', element).val(PAGES.CinebuzzEditDetails.vars.street);
                $('#cinebuzz-edit-details-suburb', element).val(PAGES.CinebuzzEditDetails.vars.suburb);
                document.getElementById('cinebuzz-edit-details-state').setSelectedText(SERVICE.states.getStateById(PAGES.CinebuzzEditDetails.vars.stateId));
                $('#cinebuzz-edit-details-postcode', element).val(PAGES.CinebuzzEditDetails.vars.postcode);
                document.getElementById('cinebuzz-edit-details-subscribe').setChecked(PAGES.CinebuzzEditDetails.vars.subscribe);
                PAGES.CinebuzzEditDetails.vars.prePopulateEntries = false;
            }
        },
        onScreenReady: function (element, id, params) {
            PAGES.CinebuzzEditDetails.helpers.populateStates(element);
        },
        onDomReady: function (element, id, params) {
            UTILS.resize_Init(element);

            //UTILS.showLoader(true);

            
            PAGES.CinebuzzEditDetails.helpers.populatePreferredCinema(element);

            if (PAGES.CinebuzzEditDetails.vars.prePopulateEntries) {
                PAGES.CinebuzzEditDetails.helpers.populateEntries(element);
            }
            else {
                PAGES.CinebuzzEditDetails.helpers.getUserDetails(element);
            }
            UTILS.showLoader(false);
            
            $('#cinebuzz-edit-details-preferred-cinema', element).bind('click', function () {

                PAGES.CinebuzzEditDetails.vars.accountPassword = $('#cinebuzz-edit-details-account-password', element).val();
                PAGES.CinebuzzEditDetails.vars.newPassword = $('#cinebuzz-edit-details-new-password', element).val();
                PAGES.CinebuzzEditDetails.vars.confirmNewPassword = $('#cinebuzz-edit-details-confirm-new-password', element).val();
                PAGES.CinebuzzEditDetails.vars.accountUsername = $('#cinebuzz-edit-details-username', element).val();
                PAGES.CinebuzzEditDetails.vars.confirmNewUsername = $('#cinebuzz-edit-details-confirm-new-username', element).val();
                PAGES.CinebuzzEditDetails.vars.digitPin = $('#cinebuzz-edit-details-digit-pin', element).val();
                PAGES.CinebuzzEditDetails.vars.confirmNewPin = $('#cinebuzz-edit-details-confirm-new-pin', element).val();
                PAGES.CinebuzzEditDetails.vars.genderId = $('#cinebuzz-edit-details-gender', element).find(':selected').val();
                PAGES.CinebuzzEditDetails.vars.preferredCinema = $('#cinebuzz-edit-details-preferred-cinema', element).val();
                PAGES.CinebuzzEditDetails.vars.accountEmail = $('#cinebuzz-edit-details-email', element).val();
                PAGES.CinebuzzEditDetails.vars.confirmNewEmail = $('#cinebuzz-edit-details-confirm-email', element).val();
                PAGES.CinebuzzEditDetails.vars.mob = $('#cinebuzz-edit-details-mob', element).val();
                PAGES.CinebuzzEditDetails.vars.street = $('#cinebuzz-edit-details-street', element).val();
                PAGES.CinebuzzEditDetails.vars.suburb = $('#cinebuzz-edit-details-suburb', element).val();
                PAGES.CinebuzzEditDetails.vars.stateId = $('#cinebuzz-edit-details-state', element).find(':selected').val();
                PAGES.CinebuzzEditDetails.vars.postcode = $('#cinebuzz-edit-details-postcode', element).val();
                PAGES.CinebuzzEditDetails.vars.subscribe = $('#cinebuzz-edit-details-subscribe', element).is(':checked');
                PAGES.CinebuzzEditDetails.vars.prePopulateEntries = true;

                UTILS.pushPage(PAGES.PreferredCinema);

            });

            $('#cinebuzz-edit-details-digit-pin', element).keyup(function () {
                var txtVal = $(this).val();
                $(this).val(FORMAT.string.substringValue(txtVal, 4));
            });

            $('#cinebuzz-edit-details-confirm-new-pin', element).keyup(function () {
                var txtVal = $(this).val();
                $(this).val(FORMAT.string.substringValue(txtVal, 4));
            });

            $('#cinebuzz-edit-details-postcode', element).keyup(function () {
                var txtVal = $(this).val();
                $(this).val(FORMAT.string.substringValue(txtVal, 4));
            });

            $('#cinebuzz-edit-details-mob', element).keyup(function () {
                var txtVal = $(this).val();
                $(this).val(FORMAT.string.substringValue(txtVal, 10));
            });

            $('#cinebuzz-edit-details-btn-save', element).bind('click', function () {

                var password = "";
                var username = "";
                var pin = "";
                var email = "";

                var accountPassword = $('#cinebuzz-edit-details-account-password', element).val();
                var newPassword = $('#cinebuzz-edit-details-new-password', element).val();
                var confirmNewPassword = $('#cinebuzz-edit-details-confirm-new-password', element).val();
                var accountUsername = $('#cinebuzz-edit-details-username', element).val();
                var confirmNewUsername = $('#cinebuzz-edit-details-confirm-new-username', element).val();
                var digitPin = $('#cinebuzz-edit-details-digit-pin', element).val();
                var confirmNewPin = $('#cinebuzz-edit-details-confirm-new-pin', element).val();
                var genderId = $('#cinebuzz-edit-details-gender', element).find(':selected').val();
                var preferredCinema = $('#cinebuzz-edit-details-preferred-cinema', element).val();
                var accountEmail = $('#cinebuzz-edit-details-email', element).val();
                var confirmNewEmail = $('#cinebuzz-edit-details-confirm-email', element).val();
                var mob = $('#cinebuzz-edit-details-mob', element).val();
                var street = $('#cinebuzz-edit-details-street', element).val();
                var suburb = $('#cinebuzz-edit-details-suburb', element).val();
                var stateId = $('#cinebuzz-edit-details-state', element).find(':selected').val();
                var postcode = $('#cinebuzz-edit-details-postcode', element).val();
                var subscribe = $('#cinebuzz-edit-details-subscribe', element).is(':checked');

                if (accountPassword == "") {
                    PAGES.CinebuzzEditDetails.helpers.showErrorMessage("Please enter your password.");
                    return false;
                }

                if (newPassword != "" && newPassword != confirmNewPassword)
                {
                    PAGES.CinebuzzEditDetails.helpers.showErrorMessage("Confirm New Password must be the same as New Password.");
                    return false;
                }

                if (accountUsername == "") {
                    PAGES.CinebuzzEditDetails.helpers.showErrorMessage("Please enter a valid username.");
                    return false;
                }

                //check new username from DB

                if (digitPin != "") { 
                    if (digitPin.length != 4)
                    {
                        PAGES.CinebuzzEditDetails.helpers.showErrorMessage("PIN must be 4 digit number.");
                        return false;
                    }
                    else {
                        if (digitPin != confirmNewPin)
                        {
                            PAGES.CinebuzzEditDetails.helpers.showErrorMessage("Confirm New PIN must be the same as 4-digit PIN.");
                            return false;
                        }
                    }
                }
                               
                if (genderId == "") {
                    PAGES.CinebuzzEditDetails.helpers.showErrorMessage("Please enter your gender.");
                    return false;
                }

                if (preferredCinema == "") {
                    PAGES.CinebuzzEditDetails.helpers.showErrorMessage("Please set your preferred cinema.");
                    return false;
                }

                var pattern = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if (!pattern.test(accountEmail)) {
                    PAGES.CinebuzzEditDetails.helpers.showErrorMessage("Please enter a valid email address.");
                    return false;
                }

                if (confirmNewEmail != "")
                {
                    if (!pattern.test(confirmNewEmail) || accountEmail != confirmNewEmail) {
                        PAGES.CinebuzzEditDetails.helpers.showErrorMessage("Confirm Email must be the same as Email.");
                        return false;
                    }
                }

                if (mob.match(/[^\d]/) || mob.length < 10) {
                    PAGES.CinebuzzEditDetails.helpers.showErrorMessage("Mobile phone number invalid. Must be at least 10 digits long.");
                    return false;
                }

                if (street == "") {
                    PAGES.CinebuzzEditDetails.helpers.showErrorMessage("Please enter a valid street address.");
                    return false;
                }

                if (suburb == "") {
                    PAGES.CinebuzzEditDetails.helpers.showErrorMessage("Please insert a valid suburb.");
                    return false;
                }

                if (stateId == "") {
                    PAGES.CinebuzzEditDetails.helpers.showErrorMessage("Please select a state.");
                    return false;
                }

                if (postcode == "" || postcode.length != 4) {
                    PAGES.CinebuzzEditDetails.helpers.showErrorMessage("Postcode must be 4 digit number.");
                    return false;
                }

                if (newPassword != "") {
                    password = newPassword;
                }
                else {
                    password = accountPassword;
                }

                if (confirmNewUsername != "") {
                    username = confirmNewUsername;
                }
                else {
                    username = accountUsername;
                }

                if (digitPin != "") {
                    pin = digitPin;
                } else {
                    pin = "";
                }

                if (confirmNewEmail != "") {
                    email = confirmNewEmail;
                } else {
                    email = accountEmail;
                }

                UTILS.showLoader(true);
                //homephone is empty string.
                SERVICE.users.edit(
                     accountPassword,
                     username,
                     email,
                     PAGES.CinebuzzEditDetails.vars.preferredCinemaId,
                     password,
                     pin,
                     EC_API.users.vars.memberType,
                     genderId,
                     "",
                     mob,
                     street,
                     suburb,
                     stateId,
                     postcode,
                     subscribe,
                     function (data) {
                         //console.log(data);
                        
                         if (data.isValid) {
                             SERVICE.users.getUserDetails(function () {
                                 UTILS.showLoader(false);
                                 UTILS.popPage(function () { });
                             });
                         } else {
                             UTILS.showLoader(false);
                             setTimeout(function () {
                                 UTILS.showAlert("Edit User Details", data.statusDescription, function () {
                                     if (data.statusCode == 6) {
                                         UTILS.pushPage(PAGES.CinebuzzLogin);
                                     }
                                 });
                             }, 500);
                         }
                     });
                
            });
        }
    },
    CinebuzzOrders: {
        htmlFile: 'page/CinebuzzOrders.htm',
        id: 'CinebuzzOrders',
        onScreenReady: function (element, id, params) {
        },
        onDomReady: function (element, id, params) {
            UTILS.resize_Init(element);

            //UTILS.showLoader(true);

            SERVICE.users.getOrderHistory(function (data) {
                console.log(data);
                var orders = data.orders;

                if (orders.length == 0) {
                    UTILS.showAlert("My Orders", "Nothing available right now.", function () { });
                }

                //var orderListing = $("#order-listing", element);
                //var tmpl = $("#order-listing-item").html();
                //var html = "";
                //for (var ctr = 0; ctr < orders.length ; ctr++) {
                //    var order = orders[ctr];
                //    var htmlItem = Mustache.to_html(tmpl, order);
                //    html += htmlItem;
                //}
                //orderListing.html(html);

                UTILS.showLoader(false);
            });
        }
    },
    CinebuzzOffers: {
        htmlFile: 'page/CinebuzzOffers.htm',
        id: 'CinebuzzOffers',
        onScreenReady: function (element, id, params) {
        },
        onDomReady: function (element, id, params) {
            UTILS.resize_Init(element);

            //UTILS.showLoader(true);
            SERVICE.users.getOffers(function (data) {
                //console.log(data);
                var offers = data.offers;

                if (offers.length == 0) {
                    UTILS.showAlert("My Offers", "Nothing available right now.", function () { });
                }
                else {
                    var offerListing = $("#offer-listing", element);
                    var tmpl = $("#offer-listing-item").html();
                    var html = "";
                    for (var ctr = 0; ctr < offers.length ; ctr++) {
                        var offer = offers[ctr];
                        offer.expiryDate = FORMAT.date.formatDD_MMM_YYYY(offer.expiryDate);
                        var htmlItem = Mustache.to_html(tmpl, offer);
                        html += htmlItem;
                    }
                    offerListing.html(html);
                }

                UTILS.showLoader(false);
            });

        }
    },
    CinebuzzMyDigitalCard: {
        htmlFile: 'page/CinebuzzMyDigitalCard.htm',
        id: 'CinebuzzMyDigitalCard',
        onScreenReady: function (element, id, params) {
        },
        onDomReady: function (element, id, params) {
            UTILS.resize_Init(element);

            //UTILS.showLoader(true);
            SERVICE.settings.getUserDetails(function (dataStr) {
                if (dataStr != null && dataStr != "") {
                    var data = JSON.parse(dataStr);
                    var cinebuzzCard = data.cinebuzzCard;
                    $('#cinebuzz-my-digital-card-number', element).html(cinebuzzCard);

                    SERVICE.users.getBarcodeUrl(cinebuzzCard, 300, function (barcodUrl) {
                        $('#cinebuzz-my-digital-barcode', element).attr('src', barcodUrl)
                        UTILS.showLoader(false);
                    });
                }
            });
        }
    },
    CinebuzzMyCreditCards: {
        htmlFile: 'page/CinebuzzMyCreditCards.htm',
        id: 'CinebuzzMyCreditCards',
        cardType: 0,
        helper: {
            showErrorMessage: function (message) {
                var title = "Invalid Credit Card";
                UTILS.showAlert(title, message, function () { });
            }
        },
        onScreenReady: function (element, id, params) {
        },
        onDomReady: function (element, id, params) {
            UTILS.resize_Init(element);

            $('#cinebuzz-my-credit-cards-card-expiry-month', element).keyup(function () {
                var txtVal = $(this).val();
                $(this).val(FORMAT.string.substringValue(txtVal, 2));
            });

            $('#cinebuzz-my-credit-cards-card-expiry-year', element).keyup(function () {
                var txtVal = $(this).val();
                $(this).val(FORMAT.string.substringValue(txtVal, 2));
            });

            $('#cinebuzz-my-credit-cards-btn-add-card', element).bind('click', function () {
                UTILS.showLoader(true);
                var cardNumber = $('#cinebuzz-my-credit-cards-card-number', element).val();
                var cardExpiryMonth = $('#cinebuzz-my-credit-cards-card-expiry-month', element).val();
                var cardExpiryYear = $('#cinebuzz-my-credit-cards-card-expiry-year', element).val();

                if (cardNumber == "" || cardNumber.length != 16) {
                    PAGES.CinebuzzMyCreditCards.helper.showErrorMessage("Please enter a valid credit card number.");
                    return false;
                }

                if (cardExpiryMonth == "" || cardExpiryMonth.length != 2 || parseInt(cardExpiryMonth) > 12 || parseInt(cardExpiryMonth) == 0) {
                    PAGES.CinebuzzMyCreditCards.helper.showErrorMessage("Please enter a valid credit card expiration month.");
                    return false;
                }

                if (cardExpiryYear == "" || cardExpiryYear.length != 2 || parseInt(cardExpiryYear) > 99 || parseInt(cardExpiryYear) < 0) {
                    PAGES.CinebuzzMyCreditCards.helper.showErrorMessage("Please enter a valid credit card expiration year.");
                    return false;
                }
                SERVICE.users.addCreditCard(PAGES.CinebuzzMyCreditCards.cardType, cardNumber, cardExpiryMonth + cardExpiryYear, function (data) {
                    UTILS.showLoader(false);
                    console.log(data);

                    setTimeout(function () {
                        if (data.isValid) {
                            UTILS.showAlert("Credit Card", "Success", function () {
                                UTILS.popPage();
                            });
                        }
                        else {
                            PAGES.CinebuzzMyCreditCards.helper.showErrorMessage(data.statusDescription);
                        }
                    }, 500);
                });
            });

            $('#cinebuzz-my-credit-cards-btn-visa', element).bind('click', function () {
                PAGES.CinebuzzMyCreditCards.cardType = 0;
            });

            $('#cinebuzz-my-credit-cards-btn-master', element).bind('click', function () {
                PAGES.CinebuzzMyCreditCards.cardType = 1;
            });

            $('#cinebuzz-my-credit-cards-btn-american', element).bind('click', function () {
                PAGES.CinebuzzMyCreditCards.cardType = 2;
            });

            $('#cinebuzz-my-credit-cards-btn-diners', element).bind('click', function () {
                PAGES.CinebuzzMyCreditCards.cardType = 3;
            });
        }
    },
    CinebuzzMyCreditCardsList: {
        htmlFile: 'page/CinebuzzMyCreditCardsList.htm',
        id: 'CinebuzzMyCreditCardsList',
        creditCards: null,
        helpers: {
            getCreditCards: function (element) {
                //UTILS.showLoader(true);
                SERVICE.users.getCreditCards(function (data) {
                    console.log(data);
                    PAGES.CinebuzzMyCreditCardsList.creditCards = data.creditCards;

                    
                    if (PAGES.CinebuzzMyCreditCardsList.creditCards.length > 0) {
                        $('#cinebuzz-my-credit-cards-list-heading', element).show();
                        $('#cinebuzz-my-credit-cards-list-note', element).hide();
                        $('#cinebuzz-my-credit-cards-btn-remove-card', element).removeAttr('disabled');

                        var creditCardListing = $("#credit-card-listing", element);
                        var tmpl = $("#credit-card-listing-item").html();
                        var html = "";

                        for (var ctr = 0; ctr < PAGES.CinebuzzMyCreditCardsList.creditCards.length ; ctr++) {
                            var creditCard = PAGES.CinebuzzMyCreditCardsList.creditCards[ctr];
                            var expiryDate = creditCard.expiryDate;

                            creditCard.cardType = SERVICE.creditCardTypes.getById(creditCard.creditCardType);
                            creditCard.cardExpiryDate = expiryDate.replace(expiryDate.substring(2), '') + "/" + expiryDate.substring(2);

                            var htmlItem = Mustache.to_html(tmpl, creditCard);
                            html += htmlItem;
                        }
                        creditCardListing.html(html);
                    }
                    else {
                        $('#cinebuzz-my-credit-cards-list-heading', element).hide();
                        $('#cinebuzz-my-credit-cards-list-note', element).show();
                        $('#cinebuzz-my-credit-cards-btn-remove-card', element).attr('disabled', 'true');
                    }

                    UTILS.showLoader(false);
                });
            }
        },
        onScreenReady: function (element, id, params) {
           
        },
        onDomReady: function (element, id, params) {
            UTILS.resize_Init(element);
            PAGES.CinebuzzMyCreditCardsList.creditCards = null;
            PAGES.CinebuzzMyCreditCardsList.helpers.getCreditCards(element);
            document.getElementById('scroller-content').refresh();


            $('#cinebuzz-my-credit-cards-btn-remove-card', element).bind('click', function () {

                if (!($('#cinebuzz-my-credit-cards-btn-remove-card', element).attr('disabled') == "disabled")) {

                    UTILS.showConfirmAlert("Remove Credit Card(s)", "Are you sure you want to remove selected credit card(s)?",
                        function () {
                            //console.log("yes");
                            UTILS.showLoader(true);
                            if (PAGES.CinebuzzMyCreditCardsList.creditCards.length > 0) {
                                var totalRowsToRemove = 0;

                                for (var ctr = 0; ctr < PAGES.CinebuzzMyCreditCardsList.creditCards.length ; ctr++) {
                                    var creditCard = PAGES.CinebuzzMyCreditCardsList.creditCards[ctr];

                                    if ($("#" + creditCard.cardId).is(':checked')) {
                                        totalRowsToRemove = totalRowsToRemove + 1;
                                    }
                                }
                                var totalrowsToRemoved = 0;

                                if (totalRowsToRemove > 0) {
                                    for (var ctr = 0; ctr < PAGES.CinebuzzMyCreditCardsList.creditCards.length ; ctr++) {
                                        var creditCard = PAGES.CinebuzzMyCreditCardsList.creditCards[ctr];

                                        if ($("#" + creditCard.cardId).is(':checked')) {
                                            SERVICE.users.deleteCreditCard(creditCard.cardId, function (data) {
                                                totalrowsToRemoved = totalrowsToRemoved + 1;
                                                if (data.isValid) {
                                                    if (totalRowsToRemove == totalrowsToRemoved) {
                                                        var creditCardListing = $("#credit-card-listing", element);
                                                        creditCardListing.html("");

                                                        PAGES.CinebuzzMyCreditCardsList.helpers.getCreditCards(element);
                                                    }
                                                }
                                                else {

                                                    //do to check callback
                                                    UTILS.showAlert("Remove Credit Card(s)", data.statusDescription, function () {
                                                        if (data.statusCode == 6) {
                                                            UTILS.pushPage(PAGES.CinebuzzLogin);
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    }
                                } else {
                                    UTILS.showLoader(false);
                                }
                            } else {
                                UTILS.showLoader(false);
                            }
                        },
                        function () {
                            //console.log("no");
                        });
                }
            });

            $('#cinebuzz-my-credit-cards-btn-add-new-card', element).bind('click', function () {
                UTILS.pushPage(PAGES.CinebuzzMyCreditCards);
            });
        }
    },
    CinebuzzForgotPassword: {
        htmlFile: 'page/CinebuzzForgotPassword.htm',
        id: 'CinebuzzForgotPassword',
        onScreenReady: function (element, id, params) {
        },
        onDomReady: function (element, id, params) {
            UTILS.resize_Init(element);

            $('#cinebuzz-forgot-password-btn-cancel', element).bind('click', function () {
                UTILS.popPage(function () { });
                //alert("clicked");
            });
            $('#cinebuzz-forgot-password-btn-send', element).bind('click', function () {
                UTILS.showLoader(true);
                //check username and password
                var firstName = $('#cinebuzz-forgot-password-first-name', element).val();
                var email = $('#cinebuzz-forgot-password-email', element).val();

                SERVICE.users.forgotPassword(firstName, email, function (data) {
                    //console.log(data);
                    UTILS.showLoader(false);

                    setTimeout(function () {
                        if (data.isValid && data.userExists) {
                            UTILS.showAlert("Fortgot Password", "Success", function () {
                                UTILS.popPage();
                            });
                        }
                        else {
                            UTILS.showAlert("Fortgot Password", data.statusDescription, function () { });
                        }
                    }, 500);
                });
            });
        }
    },
    CinebuzzRegister: {
        htmlFile: 'page/CinebuzzRegister.htm',
        id: 'CinebuzzRegister',
        vars: {
            username: "",
            firstName: "",
            lastName: "",
            gender: "",
            dob: "",
            email: "",
            showCinebuzzWelcome: true,
            populateEntries: false
        },
        helpers: {
            showErrorMessage: function (message) {
                var title = "Invalid Sign up";
                UTILS.showAlert(title, message, function () { });
            },
            populateEntries: function (element) {

                $('#cinebuzz-register-username', element).val(PAGES.CinebuzzResidentialAddress.vars.username);
                $('#cinebuzz-register-first-name', element).val(PAGES.CinebuzzResidentialAddress.vars.firstName);
                $('#cinebuzz-register-last-name', element).val(PAGES.CinebuzzResidentialAddress.vars.lastName);
                document.getElementById('cinebuzz-register-gender').setSelectedText(PAGES.CinebuzzResidentialAddress.vars.gender);
                //$('#cinebuzz-register-gender', element).val(PAGES.CinebuzzResidentialAddress.vars.gender).attr('selected', true);
                $('#cinebuzz-register-dob', element).val(PAGES.CinebuzzResidentialAddress.vars.dob);
                $('#cinebuzz-register-email', element).val(PAGES.CinebuzzResidentialAddress.vars.email);
                $('#cinebuzz-register-confirm-email', element).val(PAGES.CinebuzzResidentialAddress.vars.confirmEmail);
            }
        },
        onScreenReady: function (element, id, params) {
           
        },
        onDomReady: function (element, id, params) {
            UTILS.resize_Init(element);
          
            if (PAGES.CinebuzzRegister.vars.showCinebuzzWelcome)
            {
                PAGES.CinebuzzRegister.vars.showCinebuzzWelcome = false;
                $('#cinebuzz-welcome').overlay().load();
            }

            if (PAGES.CinebuzzRegister.vars.populateEntries) {
                PAGES.CinebuzzRegister.helpers.populateEntries(element);
            }

            $('#cinebuzz-register-btn-next', element).bind('click', function () {
                PAGES.CinebuzzResidentialAddress.vars.username = $('#cinebuzz-register-username', element).val();
                PAGES.CinebuzzResidentialAddress.vars.firstName = $('#cinebuzz-register-first-name', element).val();
                PAGES.CinebuzzResidentialAddress.vars.lastName = $('#cinebuzz-register-last-name', element).val();
                PAGES.CinebuzzResidentialAddress.vars.gender = ($('#cinebuzz-register-gender', element).find(':selected')).val();
                //alert(PAGES.CinebuzzResidentialAddress.vars.gender);

                PAGES.CinebuzzResidentialAddress.vars.dob = $('#cinebuzz-register-dob', element).val();
                PAGES.CinebuzzResidentialAddress.vars.email = $('#cinebuzz-register-email', element).val();
                PAGES.CinebuzzResidentialAddress.vars.confirmEmail = $('#cinebuzz-register-confirm-email', element).val();

                if (PAGES.CinebuzzResidentialAddress.vars.username == "")
                {
                    PAGES.CinebuzzRegister.helpers.showErrorMessage("Please enter a valid username.");
                    return false;
                }

                if (PAGES.CinebuzzResidentialAddress.vars.firstName == "")
                {
                    PAGES.CinebuzzRegister.helpers.showErrorMessage("Please enter a valid first name.");
                    return false;
                }

                if (PAGES.CinebuzzResidentialAddress.vars.lastName == "")
                {
                    PAGES.CinebuzzRegister.helpers.showErrorMessage("Please enter a valid last name.");
                    return false;
                }

                if (PAGES.CinebuzzResidentialAddress.vars.gender == "")
                {
                    PAGES.CinebuzzRegister.helpers.showErrorMessage("Please enter your gender.");
                    return false;
                }

                if (PAGES.CinebuzzResidentialAddress.vars.dob == "")
                {
                    PAGES.CinebuzzRegister.helpers.showErrorMessage("Please enter your date of birth.");
                    return false;
                }

                var pattern = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if (!pattern.test(PAGES.CinebuzzResidentialAddress.vars.email)) {
                    PAGES.CinebuzzRegister.helpers.showErrorMessage("Please enter a valid email address.");
                    return false;
                }

                if (!pattern.test(PAGES.CinebuzzResidentialAddress.vars.confirmEmail) || PAGES.CinebuzzResidentialAddress.vars.email != PAGES.CinebuzzResidentialAddress.vars.confirmEmail)
                {
                    PAGES.CinebuzzRegister.helpers.showErrorMessage("Confirm Email must be the same as Email.");
                    return false;
                }

                PAGES.CinebuzzRegister.vars.populateEntries = true;

                UTILS.pushPage(PAGES.CinebuzzResidentialAddress, {
                    username: PAGES.CinebuzzResidentialAddress.vars.username,
                    firstName: PAGES.CinebuzzResidentialAddress.vars.firstName,
                    lastName: PAGES.CinebuzzResidentialAddress.vars.lastName,
                    gender: PAGES.CinebuzzResidentialAddress.vars.gender,
                    dob: PAGES.CinebuzzResidentialAddress.vars.dob,
                    email: PAGES.CinebuzzResidentialAddress.vars.email
                });

            });
        }
    },
    CinebuzzResidentialAddress: {
        htmlFile: 'page/CinebuzzResidentialAddress.htm',
        id: 'CinebuzzResidentialAddress',
        vars: {
            username: "",
            firstName: "",
            lastName: "",
            gender: "",
            dob: "",
            email: "",
            streetNumber: "",
            streetAddress: "",
            suburb: "",
            stateId: "",
            postcode: "",
            mob: "",
            populateEntries: false
        },
        helpers: {
            showErrorMessage: function (message) {
                var title = "Invalid Sign up";
                UTILS.showAlert(title, message, function () { });
            },
            populateStates: function (element) {
                var allStates = $('#cinebuzz-address-state', element);
                allStates.append(new Option(" ", ""));

                /*create and populate elemets on screen*/
                for (var stateCtr = 0; stateCtr < SERVICE.states.statesList.length ; stateCtr++) {
                    var state = SERVICE.states.statesList[stateCtr];
                    allStates.append(new Option(state.text, state.id));
                }
            },
            populateEntries: function (element) {
                $('#cinebuzz-address-number', element).val(PAGES.CinebuzzResidentialAddress.vars.streetNumber);
                $('#cinebuzz-address-street', element).val(PAGES.CinebuzzResidentialAddress.vars.streetAddress);
                $('#cinebuzz-address-suburb', element).val(PAGES.CinebuzzResidentialAddress.vars.suburb);
                document.getElementById('cinebuzz-address-state').setSelectedText(SERVICE.states.getStateById(PAGES.CinebuzzResidentialAddress.vars.stateId));
                //$('#cinebuzz-address-state', element).val(PAGES.CinebuzzResidentialAddress.vars.stateId).attr('selected', true);
                $('#cinebuzz-address-postcode', element).val(PAGES.CinebuzzResidentialAddress.vars.postcode);
                $('#cinebuzz-address-mob', element).val(PAGES.CinebuzzResidentialAddress.vars.mob);
            }

        },
        onScreenReady: function (element, id, params) {
            PAGES.CinebuzzResidentialAddress.helpers.populateStates(element);
        },
        onDomReady: function (element, id, params) {
            UTILS.resize_Init(element);

            UTILS.showLoader(true);
            PAGES.CinebuzzResidentialAddress.vars.username = params.username;
            PAGES.CinebuzzResidentialAddress.vars.firstName = params.firstName;
            PAGES.CinebuzzResidentialAddress.vars.lastName = params.lastName;
            PAGES.CinebuzzResidentialAddress.vars.gender = params.gender;
            PAGES.CinebuzzResidentialAddress.vars.dob = params.dob;
            PAGES.CinebuzzResidentialAddress.vars.email = params.email;

            if (PAGES.CinebuzzResidentialAddress.vars.populateEntries) {
                PAGES.CinebuzzResidentialAddress.helpers.populateEntries(element);
            }

            UTILS.showLoader(false);

            $('#cinebuzz-address-postcode', element).keyup(function () {
                var txtVal = $(this).val();
                $(this).val(FORMAT.string.substringValue(txtVal, 4));
            });

            $('#cinebuzz-address-mob', element).keyup(function () {
                var txtVal = $(this).val();
                $(this).val(FORMAT.string.substringValue(txtVal, 10));
            });

            $('#cinebuzz-address-btn-next', element).bind('click', function () {
                PAGES.CinebuzzResidentialAddress.vars.streetNumber = $('#cinebuzz-address-number', element).val();
                PAGES.CinebuzzResidentialAddress.vars.streetAddress = $('#cinebuzz-address-street', element).val();
                PAGES.CinebuzzResidentialAddress.vars.suburb = $('#cinebuzz-address-suburb', element).val();
                PAGES.CinebuzzResidentialAddress.vars.stateId = ($('#cinebuzz-address-state', element).find(':selected')).val();
                PAGES.CinebuzzResidentialAddress.vars.postcode = $('#cinebuzz-address-postcode', element).val();
                PAGES.CinebuzzResidentialAddress.vars.mob = $('#cinebuzz-address-mob', element).val();

                if (PAGES.CinebuzzResidentialAddress.vars.streetNumber == "") {
                    PAGES.CinebuzzResidentialAddress.helpers.showErrorMessage("Please enter a valid street number.");
                    return false;
                }

                if (PAGES.CinebuzzResidentialAddress.vars.streetAddress == "")
                {
                    PAGES.CinebuzzResidentialAddress.helpers.showErrorMessage("Please enter a valid street address.");
                    return false;
                }

                if (PAGES.CinebuzzResidentialAddress.vars.suburb == "")
                {
                    PAGES.CinebuzzResidentialAddress.helpers.showErrorMessage("Please insert a valid suburb.");
                    return false;
                }

                if (PAGES.CinebuzzResidentialAddress.vars.stateId == "")
                {
                    PAGES.CinebuzzResidentialAddress.helpers.showErrorMessage("Please select a state.");
                    return false;
                }

                if (PAGES.CinebuzzResidentialAddress.vars.postcode == "" || PAGES.CinebuzzResidentialAddress.vars.postcode.length != 4)
                {
                    PAGES.CinebuzzResidentialAddress.helpers.showErrorMessage("Postcode must be 4 digit number.");
                    return false;
                }

                if (PAGES.CinebuzzResidentialAddress.vars.mob.match(/[^\d]/) || PAGES.CinebuzzResidentialAddress.vars.mob.length < 10)
                {
                    PAGES.CinebuzzResidentialAddress.helpers.showErrorMessage("Mobile phone number invalid. Must be at least 10 digits long.");
                    return false;
                }

                PAGES.CinebuzzResidentialAddress.vars.populateEntries = true;

                UTILS.pushPage(PAGES.CinebuzzAccountDetails, {
                    username: PAGES.CinebuzzResidentialAddress.vars.username,
                    firstName: PAGES.CinebuzzResidentialAddress.vars.firstName,
                    lastName: PAGES.CinebuzzResidentialAddress.vars.lastName,
                    gender: PAGES.CinebuzzResidentialAddress.vars.gender,
                    dob: PAGES.CinebuzzResidentialAddress.vars.dob,
                    email: PAGES.CinebuzzResidentialAddress.vars.email,
                    streetNumber: PAGES.CinebuzzResidentialAddress.vars.streetNumber,
                    streetAddress: PAGES.CinebuzzResidentialAddress.vars.streetAddress,
                    suburb: PAGES.CinebuzzResidentialAddress.vars.suburb,
                    stateId: PAGES.CinebuzzResidentialAddress.vars.stateId,
                    postcode: PAGES.CinebuzzResidentialAddress.vars.postcode,
                    mob: PAGES.CinebuzzResidentialAddress.vars.mob
                });
            });
        }
    },
    CinebuzzAccountDetails: {
        htmlFile: 'page/CinebuzzAccountDetails.htm',
        id: 'CinebuzzAccountDetails',
        vars: {
            username: "",
            firstName: "",
            lastName: "",
            gender: "",
            dob: "",
            email: "",
            streetNumber: "",
            streetAddress: "",
            suburb: "",
            stateId: "",
            postcode: "",
            mob: "",
            preferredCinemaId: 0,
            password: "",
            confirmPassword: "",
            digitPin: "",
            cardNumber: "",
            terms: false,
            populateEntries: false
        },
        helpers: {
            showErrorMessage: function (message) {
                var title = "Invalid Sign up";
                UTILS.showAlert(title, message, function () { });
            },
            populatePreferredCinema: function (element) {
                SERVICE.settings.getPreferredCinema(function (cinemaId) {
                    //console.log(cinemaId);
                    SERVICE.cinemas.getByCinemaId(cinemaId, function (cinema) {
                        //console.log(cinema);

                        if (cinema != null) {
                            $('#cinebuzz-account-preferred-cinema', element).val(cinema.name())
                            PAGES.CinebuzzAccountDetails.vars.preferredCinemaId = cinemaId;
                        }
                    });
                });
            },
            populateEntries: function (element) {
                $('#cinebuzz-account-password', element).val(PAGES.CinebuzzAccountDetails.vars.password);
                $('#cinebuzz-account-confirm-password', element).val(PAGES.CinebuzzAccountDetails.vars.confirmPassword);
                $('#cinebuzz-account-digit-pin', element).val(PAGES.CinebuzzAccountDetails.vars.digitPin);
                $('#cinebuzz-account-card-number', element).val(PAGES.CinebuzzAccountDetails.vars.cardNumber);
                //$('#cinebuzz-account-terms', element).attr('checked', PAGES.CinebuzzAccountDetails.vars.terms);
                document.getElementById('cinebuzz-account-terms').setChecked(PAGES.CinebuzzAccountDetails.vars.terms);
           }
        },
        onScreenReady: function (element, id, params) {

        },
        onDomReady: function (element, id, params) {
            UTILS.resize_Init(element);

            UTILS.showLoader(true);
            PAGES.CinebuzzAccountDetails.vars.username = params.username;
            PAGES.CinebuzzAccountDetails.vars.firstName = params.firstName;
            PAGES.CinebuzzAccountDetails.vars.lastName = params.lastName;
            PAGES.CinebuzzAccountDetails.vars.gender = params.gender;
            PAGES.CinebuzzAccountDetails.vars.dob = params.dob;
            PAGES.CinebuzzAccountDetails.vars.email = params.email;
            PAGES.CinebuzzAccountDetails.vars.streetNumber = params.streetNumber;
            PAGES.CinebuzzAccountDetails.vars.streetAddress = params.streetAddress;
            PAGES.CinebuzzAccountDetails.vars.suburb = params.suburb;
            PAGES.CinebuzzAccountDetails.vars.stateId = params.stateId;
            PAGES.CinebuzzAccountDetails.vars.postcode = params.postcode;
            PAGES.CinebuzzAccountDetails.vars.mob = params.mob;

            PAGES.CinebuzzAccountDetails.helpers.populatePreferredCinema(element);

            if (PAGES.CinebuzzAccountDetails.vars.populateEntries) {
                PAGES.CinebuzzAccountDetails.helpers.populateEntries(element);
            }
            UTILS.showLoader(false);

            $('#cinebuzz-account-preferred-cinema', element).bind('click', function () {
                PAGES.CinebuzzAccountDetails.vars.password = $('#cinebuzz-account-password', element).val();
                PAGES.CinebuzzAccountDetails.vars.confirmPassword = $('#cinebuzz-account-confirm-password', element).val();
                PAGES.CinebuzzAccountDetails.vars.digitPin = $('#cinebuzz-account-digit-pin', element).val();
                PAGES.CinebuzzAccountDetails.vars.cardNumber = $('#cinebuzz-account-card-number', element).val();
                PAGES.CinebuzzAccountDetails.vars.terms = $('#cinebuzz-account-terms', element).is(':checked');
                PAGES.CinebuzzAccountDetails.vars.populateEntries = true;

                UTILS.pushPage(PAGES.PreferredCinema);
            });

            $('#cinebuzz-account-digit-pin', element).keyup(function () {
                var txtVal = $(this).val();
                $(this).val(FORMAT.string.substringValue(txtVal, 4));
            });

            $('#cinebuzz-account-btn-join', element).bind('click', function () {
                var password = $('#cinebuzz-account-password', element).val();
                var confirmPassword = $('#cinebuzz-account-confirm-password', element).val();
                var digitPin = $('#cinebuzz-account-digit-pin', element).val();
                var cardNumber = $('#cinebuzz-account-card-number', element).val();
                var preferredCinema = $('#cinebuzz-account-preferred-cinema', element).val();
                var terms = $('#cinebuzz-account-terms', element).is(':checked');

                if (password == "") {
                    PAGES.CinebuzzAccountDetails.helpers.showErrorMessage("Please enter a valid password.");
                    return false;
                }

                if (confirmPassword == "" || password != confirmPassword) {
                    PAGES.CinebuzzAccountDetails.helpers.showErrorMessage("Confirm Password must be the same as Password.");
                    return false;
                }

                if (digitPin == "" || digitPin.length != 4) {
                    PAGES.CinebuzzAccountDetails.helpers.showErrorMessage("PIN must be 4 digit number.");
                    return false;
                }

                if (cardNumber == "")
                {
                    cardNumber = 0;
                }

                if (preferredCinema == "") {
                    PAGES.CinebuzzAccountDetails.helpers.showErrorMessage("Please set your preferred cinema.");
                    return false;
                }

                if (!terms) {
                    PAGES.CinebuzzAccountDetails.helpers.showErrorMessage("Please agree to terms and conditions.");
                    return false;
                }

                //homephone is empty string.
                SERVICE.users.register(
                     PAGES.CinebuzzAccountDetails.vars.username,
                     PAGES.CinebuzzAccountDetails.vars.firstName,
                     PAGES.CinebuzzAccountDetails.vars.lastName,
                     PAGES.CinebuzzAccountDetails.vars.email,
                     password,
                     digitPin,
                     terms,
                     PAGES.CinebuzzAccountDetails.vars.preferredCinemaId,
                     cardNumber, 
                     PAGES.CinebuzzAccountDetails.vars.gender,
                     "", 
                     PAGES.CinebuzzAccountDetails.vars.mob,
                     PAGES.CinebuzzAccountDetails.vars.streetNumber + " " +
                     PAGES.CinebuzzAccountDetails.vars.streetAddress,
                     PAGES.CinebuzzAccountDetails.vars.suburb,
                     parseInt(PAGES.CinebuzzAccountDetails.vars.stateId), 
                     PAGES.CinebuzzAccountDetails.vars.postcode,
                     EC_API.users.vars.memberType, 
                     PAGES.CinebuzzAccountDetails.vars.dob,
                     function (data) {
                         //console.log(data);
                         if (data.isValid) {
                             UTILS.showAlert("User Register", "Success", function () {
                                 SERVICE.users.logout(function () {
                                     PAGES.CinebuzzRegister.vars.populateEntries = false;
                                     PAGES.CinebuzzResidentialAddress.vars.populateEntries = false;
                                     PAGES.CinebuzzAccountDetails.vars.populateEntries = false;
                                     UTILS.pushPage(PAGES.CinebuzzLogin);
                                 });
                             });
                         } else {
                             UTILS.showAlert("User Register", data.statusDescription, function () { });
                         }
                     });
            });
        }
    },
    Settings: {
        htmlFile: 'page/Settings.htm',
        id: 'Settings',
        onScreenReady: function (element, id, params) {

            
        },
        onDomReady: function (element, id, params) {
            UTILS.resize_Init(element);

            //$('#settings-btn-share-this-app', element).bind('click', function () {
            //});

            $('#settings-btn-terms', element).bind('click', function () {
                UTILS.pushPage(PAGES.TermsAndConditions);
            });
            $('#settings-btn-feedback', element).bind('click', function () {
                UTILS.pushPage(PAGES.Feedback);
            });
        }
    },
    TermsAndConditions: {
        htmlFile: 'page/TermsAndConditions.htm',
        id: 'TermsAndConditions',
        helper: {
            loadIframe: function (element) {
                var url = SERVICE.users.getTnCUrl();
                console.log(url);
                var termsAndConditionsIframe = $("#terms-and-cnditions-iframe", element);
                termsAndConditionsIframe.attr("src", url);
                termsAndConditionsIframe.attr("url", url);
            }
        },
        onScreenReady: function (element, id, params) {
        },
        onDomReady: function (element, id, params) {
            UTILS.resize_Init(element);

            //Show loading
            UTILS.showLoader(true);
            PAGES.TermsAndConditions.helper.loadIframe(element);
            UTILS.showLoader(false);
        }
    },
    Feedback: {
        htmlFile: 'page/Feedback.htm',
        id: 'Feedback',
        helper: {
            showErrorMessage: function (message) {
                var title = "Invalid Feedback";
                UTILS.showAlert(title, message, function () { });
            }
        },
        onScreenReady: function (element, id, params) {
        },
        onDomReady: function (element, id, params) {
            UTILS.resize_Init(element);

            $('#feedback-btn-submit', element).bind('click', function () {
                
                var firstName = $('#feedback-first-name', element).val();
                var surname = $('#feedback-surname', element).val();
                var email = $('#feedback-email', element).val();
                var message = $('#feedback-message', element).val();

                if (firstName == "")
                {
                    PAGES.Feedback.helper.showErrorMessage("Please enter a valid first name.");
                    return false;
                }

                if (surname == "")
                {
                    PAGES.Feedback.helper.showErrorMessage("Please enter a valid surname.");
                    return false;
                }

                var pattern = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if (!pattern.test(email)) {
                    PAGES.Feedback.helper.showErrorMessage("Please enter a valid email address.");
                    return false;
                }

                if (message == "")
                {
                    PAGES.Feedback.helper.showErrorMessage("Please enter a valid message.");
                    return false;
                }

                message = message + "\nVersion: " + APP_CONSTANT.VERSION;

                UTILS.showLoader(true);
                SERVICE.users.sendFeedback(firstName + " " + surname + " <" + email + ">", message, function (data) {
                    console.log(data);
                    UTILS.showLoader(false);

                    setTimeout(function () {
                        if (data.isValid) {
                            UTILS.showAlert("Feedback", "Thank you!", function () {
                                UTILS.popPage(function () { });
                            });
                        } else {
                            PAGES.Feedback.helper.showErrorMessage(data.statusDescription);
                        }
                    }, 500);
                });
            });
        }
    },
    commonInit: function (element) {
        if ($("#bottom-nav", element).length > 0) {
            var data = $.ajax({
                    type: "GET",
                    url: "/page/common/bottom-nav.html",
                    async: false,
                }).responseText;
            $("#bottom-nav", element).html(data);
            $("#bottom-nav-btn-cinemas", element).bind('click', function () {
                UTILS.pushPage(PAGES.CinemaListing);
                return false;
            });
            $("#bottom-nav-btn-movies", element).bind('click', function () {
                UTILS.pushPage(PAGES.MovieListing);
                return false;
            });
            $("#bottom-nav-btn-my-account", element).bind('click', function () {
                SERVICE.settings.getUserToken(function (userToken) {
                    
                    if (userToken == null || userToken == "") {
                        UTILS.pushPage(PAGES.CinebuzzLogin);
                    } else {
                        UTILS.pushPage(PAGES.CinebuzzHome);
                    }
                });
                return false;
            });
            $("#bottom-nav-btn-setting", element).bind('click', function () {
                UTILS.pushPage(PAGES.Settings);
                return false;
            });
        }
        if ($("#side-nav", element).length > 0) {
            var data = $.ajax({
                    type: "GET",
                    url: "/page/common/side-nav.html",
                    async: false,
                }).responseText;
            $("#side-nav", element).html(data);
            $("#side-nav-btn-cinemas", element).bind('click', function () {
                UTILS.checkDuplicatePage(PAGES.CinemaListing, function () { });
                return false;
            });
            $("#side-nav-btn-movies", element).bind('click', function () {
                UTILS.checkDuplicatePage(PAGES.MovieListing, function () { });
                return false;
            });
            $("#side-nav-btn-my-account", element).bind('click', function () {
                SERVICE.settings.getUserToken(function (userToken) {
                    if (userToken == null || userToken == "") {
                        UTILS.checkDuplicatePage(PAGES.CinebuzzLogin, function () { });
                    } else {
                        UTILS.checkDuplicatePage(PAGES.CinebuzzHome, function () { });
                    }
                });
                return false;
            });
            $("#side-nav-btn-setting", element).bind('click', function () {
                UTILS.checkDuplicatePage(PAGES.Settings, function () { });
                return false;
            });
        }
        $(".overlay", element).overlay({
            color: '#ccc',
            top: 50,
            mask: {
            color: '#000',
            loadSpeed: 200,
            opacity: 0.5
            }
        });
       
    }
};