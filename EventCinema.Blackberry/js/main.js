//GLOBAL variables
var EVENT_CINEMA_DEBUG = true; /*todo: set this to false when deployment*/

function mainWebWorksReady(e) {
    bb.init({
        actionBarDark: true,
        controlsDark: true,
        listsDark: true,
        bb10ForPlayBook: true,
        // Fires "before" styling is applied and "before" the screen is inserted in the DOM
        onscreenready: function (element, id, params) {
            // removes resize event 
            UTILS.resize_UnInit();
            if (params != null && params.page != null && params.page.onScreenReady != null) {
                params.page.onScreenReady(element, id, params.data);
                PAGES.commonInit(element);
            }
        },
        ondomready: function (element, id, params) {
            if (params != null && params.page != null && params.page.onDomReady != null) {
                params.page.onDomReady(element, id, params.data);
            }
        }
    });
    // Open our first screen
    //UTILS.pushPage(PAGES.CinebuzzRegister);
    //UTILS.pushPage(PAGES.CinebuzzLogin);
    //UTILS.pushPage(PAGES.MovieDetails);
    //UTILS.pushPage(PAGES.SessionListing);
    //UTILS.pushPage(PAGES.CinemaListingByMovie);
   // UTILS.pushPage(PAGES.PreferredCinema);
    //UTILS.pushPage(PAGES.CinemaListing);
    UTILS.pushPage(PAGES.Home);
    //UTILS.pushPage(PAGES.CinebuzzMyCreditCardsList);
    //UTILS.pushPage(PAGES.Home);
    //EC_DB.init(function (isNew) {
    //    DEBUG.log("isNew: " + isNew);
       
    //    //Hide loading
    //    UTILS.pushPage(PAGES.MovieListingByCinema, { cinemaId: 15 });
    //    //UTILS.pushPage(PAGES.PreferredCinema);
    //});
    //UTILS.pushPage(PAGES.allPagesLinks);
}

$(function () {
    UTILS.initLoader();
});



