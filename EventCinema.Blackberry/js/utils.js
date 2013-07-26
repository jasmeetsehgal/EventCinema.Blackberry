var UTILS = {

    pushPage: function (page, data) {
        var paramObject = {};
        paramObject.page = page;
        paramObject.data = data;
        var random = Math.random();
        bb.pushScreen(page.htmlFile+"?"+random, page.id, paramObject);
    },
    replaceScreen: function (page, data) {
        bb.popScreen();
        setTimeout(function () {
            UTILS.showLoader(false);
            if (data == undefined) {
                UTILS.pushPage(page);
            }
            else {
                UTILS.pushPage(page, data);
            }
        }, 600);
    },
    popPage: function (callback) {
        bb.popScreen();
        setTimeout(function () {
            if (callback != null)
            {
                callback();
            }
        }, 1000);
    },
    checkDuplicatePage: function (page, callback) {
        var numItems = bb.screens.length;
        if (numItems > 1) {
            // Retrieve our new screen
            console.log(bb.screens);
            var display = bb.screens[numItems - 1];
            if (display.id != page.id) {
                UTILS.pushPage(page);
            }
        }
        if (callback != null) {
            callback();
        }
    },
    showAlert: function (title, message, okcallback) {
        var messageAlert = $('#message-pop');

        messageAlert.find('h1').html(title);
        messageAlert.find('.mess').html(message);
        messageAlert.off('click', "#message-pop-btn-ok");
        messageAlert.on('click', "#message-pop-btn-ok", function () {
            messageAlert.overlay().close();

            if (okcallback != null) {
                okcallback();
            }
        });

        messageAlert.overlay().load();
    },
    showConfirmAlert: function (title, message, yescallback, nocallback) {
        var confirmAlert = $('#confirm-alert');

        confirmAlert.find('h1').html(title);
        confirmAlert.find('.mess').html(message);
        
        confirmAlert.off('click', "#confirm-alert-btn-ok");
        confirmAlert.on('click', "#confirm-alert-btn-ok", function () {

            if (yescallback != null) {
                yescallback();
            }
            confirmAlert.overlay().close();
        });

        confirmAlert.off('click', "#confirm-alert-btn-cancel");
        confirmAlert.on('click', "#confirm-alert-btn-cancel", function () {

            if (nocallback != null) {
                nocallback();
            }
            confirmAlert.overlay().close();
        });

        confirmAlert.overlay().load();
    },
    getFromLocalStoreOrUrl: function (localStoreKey, duration, url, process) {
        var result = null;
        var needAjax = true;
        var localStoreJson = localStorage.getItem(localStoreKey);

        if (localStoreJson != null) {
            // found data in local store, parse it from Json
            var localStoreItem = $.parseJSON(localStoreJson);
            // calculate age of stored data
            var dataAge = (new Date()).getTime() - localStoreItem.timestamp;
            UTILS.showAlert('in localstore, data age = ' + dataAge + ' milliseconds');
            result = localStoreItem.data;
            // if age is no more than the allowed duration, process it, no need for ajax request
            if (dataAge <= duration) {
                needAjax = false;
                process(result);
            }
        }

        if (needAjax) {
            // Perform ajax request
            var jqxhr = $.ajax(url)
                .done(function (data) {
                    UTILS.showAlert('ajax success');
                    result = data;
                    // store data and current timestamp to html5 local storage
                    localStorage.setItem(localStoreKey, JSON.stringify({
                        data: data,
                        timestamp: (new Date()).getTime()
                    }));
                })
                .fail(function () {
                    UTILS.showAlert('ajax error');
                })
                .always(function () {
                    UTILS.showAlert('ajax complete');
                    // always call process - if we had stale data in local storage and then ajax call failed, we can still use the old data
                    process(result);
                })
            ;
        }
    },
    trimChars: function (str, chars) {
        if (str != null) {
            if (str.length > chars) {
                var newstr = str.substring(0, chars - 4) + " ...";
                return (newstr);
            } else {
                return (str);
            }
        } else {
            return "";
        }

    },
    titlePillButtons_showList: function (list) {
        document.getElementById(list[0]).style.display = 'inline';
        for (var i = 1; i < list.length; i++) {
            document.getElementById(list[i]).style.display = 'none';
        }
    },
    resize_Init: function (element) {
        window.addEventListener('resize', UTILS._HandleResize, false);
        UTILS._HandleResize(element);

    },
    resize_UnInit: function () {
        window.removeEventListener('resize', UTILS._HandleResize, false);
    },
    _HandleResize: function (element) {
        //custom header here
        var actionBarHeight = bb.device.isPlayBook ? 73 : 140,
            headerHeight = bb.device.isPlayBook ? 64 : $('.header', element).height(),
            scrollerHeight = 0,
            scroller = element ? element.getElementById('scroller-content') : document.getElementById('scroller-content');
        // Calculate the height of the scroller

        scrollerHeight = window.innerHeight - headerHeight - actionBarHeight - $('.bottom-buttoms', element).outerHeight();
        //console.log(window.innerHeight , headerHeight , actionBarHeight , $('.bottom-buttoms', element).outerHeight());
        scroller.style.height = scrollerHeight + 'px';
        if (!element) {
            scroller.refresh();
        }
    },
    initAccordion: function (element) {
        $(element).off('click', '.accordion-head');
        $(element).on('click', '.accordion-head', function (e) {
            
            if ($(this, element).hasClass('active')) {
                $(this, element).removeClass('active').next('.accordion-items').slideUp();
                return;
            }
            $('.accordion-items', element).slideUp();
            $('.accordion-head', element).removeClass('active');
            $(this, element).addClass('active').next('.accordion-items').slideDown();
        });
    },
    initLoader:function(){ 
        $("#loading-div").overlay({
            color: '#ccc',
            top: 50,
            mask: {
                color: '#000',
                loadSpeed: 0,
                opacity: 0.5
            },
            closeOnClick: false,
            closeOnEsc:false
        });
        $("#message-pop,#confirm-alert").overlay({
            color: '#ccc',
            top: 50,
            mask: {
                color: '#000',
                loadSpeed: 0,
                opacity: 0.5
            },
            load:false
        });
    },
    showLoader: function (val) {
        if ($("#loading-div").overlay().isOpened()) {
            $("#loading-div").overlay().close();
        }
        if (val) {
            $("#loading-div").overlay().load();
        } else {
            $("#loading-div").overlay().close();
        }
    },
    initializeMap: function (mapOptions) {
        var map = new google.maps.Map(document.getElementById("map_canvas"),
            mapOptions);
        marker = new google.maps.Marker({
            map: map,
            draggable: true,
            animation: google.maps.Animation.DROP,
            position: mapOptions.center
        });
        google.maps.event.addListener(marker, 'click', function(){
            //alert("driving directions");
        });
    }
};
