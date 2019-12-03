(function (window, $, undefined) {

    var Application = {
        config: {
            liveFormWait: false, // 500
            checkCalendarToday: true,
            enableCalendar: true,
            playSounds: false,
            debug: false
        },

        onApplicationEvent: function() {
            var event;

            if ( typeof window.CustomEvent !== "function" ) {
                // IE 11
                event = document.createEvent("CustomEvent");
                event.initCustomEvent('onApplication', false, false, {
                    application: Application
                });

            } else {
                // modern browser
                // Create the event
                event = new CustomEvent("onApplication", {"detail": {application: Application},});
            }

            // Trigger onApplication event
            document.dispatchEvent(event);
        },

        init: function (config) {
            $.extend(this.config, config);

            this.initAlertFade();
            this.initSelectDecorate();
            this.bindSmoothScroll();

            this.initCheckedForm();
            if (this.config.checkCalendarToday) this.checkCalendarToday();

            this.browserDetect.init();
            $(this.selectorApp).addClass(this.browserDetect.browser + " " + this.browserDetect.browser + "-" + this.browserDetect.version);

            LiveForm.setOptions({
                messageErrorPrefix: '',
                wait: this.config['liveFormWait']
            });

            if (this.config['debug']) console.log("jQuery version " + jQuery.fn.jquery);
            if (!window.Nette) {
                $.nette.init();
            }
        },

        initAlertFade: function () {
            $(".alert").fadeTo(6000, 500).slideUp(500, function () {
                $(this).slideUp(500);
                $(this).alert('close');
            });
        },

        initSelectDecorate: function () {
            var self = this;

            $(this.selectorApp).find('select').select2({
                placeholder: function () {
                    return "";
                }
                //allowClear: true
            });

            $.nette.ext('select', {
                success: function (payload) {
                    $(self.selectorApp).find('select').select2({
                        placeholder: function () {
                            return "";
                        }
                        //allowClear: true
                    });
                }
            });
        },

        bindSmoothScroll: function () {
            // $('article a.cta').smoothScroll();

            $(document).on('click', 'section a.nx-btn-cta', function (e) {
                e.preventDefault();
                $.smoothScroll({ scrollTarget: '.main-wrapper' });
            });
        },

        initCheckedForm: function() {
            if (!$('#questionSelect input').is(':checked')) {
                $("#identity input").attr('disabled','disabled');
            }

            $('#questionSelect input').change(function() {
                if($(this).is(":checked")) {
                    $("#identity input").removeAttr('disabled');
                } else {
                    $("#identity input").attr('disabled','disabled');
                }
            });
        },

        invalidCacheFormPage: function () {
            // var formUrl = $('.main-wrapper').data('form-page');
            // Page.invalidPage(formUrl);
        },

        show: function () {
            $(this.selectorApp).addClass('in');
            this.resize();
        },

        resize: function () {
            /*
            var width = $(window).width();
            if (width > 800){
                if ($('#teasers.slick-slider').length > 0) {
                    $("#teasers").slick('unslick');
                }

            } else {
                if ($('#teasers.slick-slider').length == 0) {
                    $("#teasers").slick({
                        dots: true,
                        adaptiveHeight: true,
                        arrows: false
                    });
                }
            }
            */
        },

        checkCalendarToday: function() {

            var checkedTimer;
            var iterator = 3;
            var self = this;

            checkToday = function () {
                var n = new Date().getDate();

                // n= 2;
                //if (n > 24) n = 24;
                //n = Math.floor(Math.random() * 24) + 1;

                if (n <= 24 || iterator <= 0) {
                    if (iterator === 0) n = 1;

                    if ($('.calendar-content').find('.active').length) {
                        var selectDay = $('.calendar-content').find('.active').data('dayIndex');

                        if (selectDay != n) {
                            console.log("selected " + selectDay + " dnes je " + n);
                            $('.calendar-content').find('.active').removeClass('active').parent().find('.day-'+n).addClass('active');

                            // var proxyBaseUrl = $(Application.selectorApp).data('pf-proxy-base-url');
                            // var appBaseUrl = $(Application.selectorApp).data('appBaseUrl');
                            // var baseUrl = proxyBaseUrl ? proxyBaseUrl + '/' : appBaseUrl;

                            // redirect to default page
                            // var formUrl = baseUrl + "formular/";

                            // console.log(formUrl);
                            // window.location.href = formUrl;
                            window.location.href = window.location.href;
                        }

                    } else {
                        n= 1;
                        $('.calendar-content').find('.day-'+n).addClass('active');
                    }

                } else {
                    if (self.config.enableCalendar === false) $('.calendar-content').find('.active').removeClass('active');

                    //console.log(iterator);
                    //iter--;
                    //clearInterval(checkedTimer);
                }
            };

            checkedTimer = setInterval(checkToday, 2000);
            if ($('.calendar-content').find('.active').length) {
            }
        },

        browserDetect: {
            init: function () {
                this.browser = this.searchString(this.dataBrowser) || "Other";
                this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "Unknown";
            },
            searchString: function (data) {
                for (var i = 0; i < data.length; i++) {
                    var dataString = data[i].string;
                    this.versionSearchString = data[i].subString;

                    if (dataString.indexOf(data[i].subString) !== -1) {
                        return data[i].identity;
                    }
                }
            },
            searchVersion: function (dataString) {
                var index = dataString.indexOf(this.versionSearchString);
                if (index === -1) {
                    return;
                }

                var rv = dataString.indexOf("rv:");
                if (this.versionSearchString === "Trident" && rv !== -1) {
                    return parseFloat(dataString.substring(rv + 3));
                } else {
                    return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
                }
            },

            dataBrowser: [
                {string: navigator.userAgent, subString: "Edge", identity: "MS-Edge"},
                {string: navigator.userAgent, subString: "MSIE", identity: "Explorer"},
                {string: navigator.userAgent, subString: "Trident", identity: "Explorer"},
                {string: navigator.userAgent, subString: "Firefox", identity: "Firefox"},
                {string: navigator.userAgent, subString: "Opera", identity: "Opera"},
                {string: navigator.userAgent, subString: "OPR", identity: "Opera"},

                {string: navigator.userAgent, subString: "Chrome", identity: "Chrome"},
                {string: navigator.userAgent, subString: "Safari", identity: "Safari"}
            ]

        },

        selectorAnimationEnd: 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
        selectorApp: '.main-wrapper',
        allowSelect: true
    };

    window.Application = Application;
    Application.init();


    // bind callbacks after page load
    Page.callbacksAfterPageLoad.push(function () {
        $.smoothScroll({ scrollTarget: '.main-wrapper' });
        Application.initCheckedForm();
        Application.resize();
    });



    /**
     * application load
     */
    $(window).on('load', function () {
        Application.show();
        $.smoothScroll({ scrollTarget: '.main-wrapper' });
        // $('[data-toggle="tooltip"]').tooltip();

        /*
        $(".vertical-center-4").slick({
            infinite: true,
            dots: true,
            arrows: false,

            //centerMode: true,
            //variableWidth: true,
            //fade: true,
            //adaptiveHeight: true,
            //cssEase: 'linear',

            slidesToShow: 1,
            slidesToScroll: 1
        });
        */

    });


    /**
     * jQuery responsive
     */
    $(window).resize(function () {
        Application.resize();
    });


    /**
     * back button
     */
    $(window).on('popstate', function() {
        if (Application.config.debug) console.log('Back button was pressed.');
        Application.invalidCacheFormPage();
        window.location.href = window.location.href;
    });



    /*
     * CALENDAR
     */
    getProxyUrl= function (url) {
        var proxy = $(Application.selectorApp).data('pf-proxy-url');
        return proxy ? proxy + "-" + url : url;
    };

    // desktop calendar click ↓
    $(document).on('click', '#calendar-menu .grid.active', function (e) {
        //e.preventDefault();

        $(this).find('.day').addClass('animated tada');

        var selectorAnimationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        var selectorAnimationStart = 'webkitAnimationStart mozAnimationStart MSAnimationStart oanimationend animationstart';

        $('form#frm-registrationForm input[name="privacy"]').prop('checked', false);
        $('form#frm-registrationForm input[name="privacy2"]').prop('checked', false);
        $('form#frm-registrationForm input[name="newsletter"]').prop('checked', false);


        animStart = function (el) {
            if ($(el).not('.start')) {
                if ($(el).is('.start')) return;

                if (Application.config.playSounds) {
                    var sound = $(el).data('anim-sound');
                    if (sound) {
                        var bleep = new Audio();
                        bleep.src = getProxyUrl(sound);

                        bleep.play();
                    }
                }

                $(el).addClass('start');
            }
        };


        $("#calendar-menu").addClass('animated bounceOutDown').one(selectorAnimationEnd, function() {
            $(this).removeClass('animated bounceOutDown').addClass('hidden');
            $('#calendar-menu-mobile').addClass('hidden');

            $('#calendar').removeClass('active').addClass('animated bounceIn')
                .one(selectorAnimationEnd, function () {
                    $(this).removeClass('animated bounceIn');
                    $(this).removeClass('start');
                });

            $("#identity").addClass('animated slide-in-elliptic-bottom-bck').css("animation-delay", "0.1s")
                .one(selectorAnimationStart, function (e) {
                    animStart(this);
                })
                .one(selectorAnimationEnd, function () {
                    $(this).removeClass('animated slide-in-elliptic-bottom-bck');
                    $(this).removeClass('start');
                });
            $("#accepts").addClass('animated slide-in-elliptic-top-bck').css("animation-delay", "0.4s")
                .one(selectorAnimationStart, function (e) {
                    animStart(this);
                })
                .one(selectorAnimationEnd, function () {
                    $(this).removeClass('start');
                    $(this).removeClass('animated slide-in-elliptic-top-bck');
                });
            $("#send").addClass('animated slide-in-elliptic-top-bck').css("animation-delay", "0.6s")
                .one(selectorAnimationStart, function (e) {
                    animStart(this);
                })
                .one(selectorAnimationEnd, function () {
                    $(this).removeClass('start');
                    $(this).removeClass('animated slide-in-elliptic-top-bck');
                });
            $("#questions").addClass('animated slit-in-horizontal').css("animation-delay", "0.7s")
                .one(selectorAnimationStart, function (e) {
                    animStart(this);
                })
                .one(selectorAnimationEnd, function () {
                    $(this).removeClass('start');
                    $(this).removeClass('animated slit-in-horizontal');
                    $('.winner-box').addClass('animated bounceIn');
                    $('.today-win-txt').addClass('animated pulse animation-delay-500ms');
                });
            $(".question").addClass('animated slide-in-elliptic-top-fwd').css("animation-delay", "0.8s")
                .one(selectorAnimationStart, function (e) {
                    animStart(this);
                })
                .one(selectorAnimationEnd, function () {
                    $(this).removeClass('start');
                    $(this).removeClass('animated slide-in-elliptic-top-fwd');
                });

        });
    });


    // mobile calendar click ↓
    $(document).on('click', '#today-select', function (e) {
        var selectorAnimationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        $('#calendar-menu-mobile').addClass('animated bounceOut').one(selectorAnimationEnd, function() {
            $(this).removeClass('animated bounceOut').addClass('hidden');
            $('#calendar-menu').addClass('hidden');

            $('#calendar').removeClass('active').addClass('animated fadeInUp').one(selectorAnimationEnd, function() {
                $(this).removeClass('animated zoomIn');
                $('.winner-box').addClass('animated pulse');
            });

        });
    });




    /*
     * CALENDAR
     */
    // set interval
    if (Application.config.playSounds) {
        var tid = setTimeout(bellCode, 60000);
    }
    function bellCode() {

        if ($("#calendar-menu").is(":visible")) {
            $('[data-inactive-sound]').each(function(index, value) {

                var sound = $(this).data('inactive-sound');
                var bleep = new Audio();
                bleep.src = getProxyUrl(sound);
                bleep.play();
            });
            tid = setTimeout(bellCode, 60000)
        }

    }

    function abortTimer() { // to be called when you want to stop the timer
        clearInterval(tid);
    }




    /*
    if (Modernizr.touchevents) {
        $(Application.selectorCards).click(function(e){
            var counter = ($(this).data('select') || 0) + 1;

            if (Application.allowSelect && counter == 1) {
                $(this).data('select', counter);
                Application.cardsClick(this);
            }
        });

    } else {
        $(document).on('click', '.allow-click .card-container:not(.select):not(.selected)', function (e) {
            Application.cardsClick(this);
        });
    }
    */

    // Leak Application namespace
    window.Application = Application;
    Application.onApplicationEvent();

})(window, jQuery);