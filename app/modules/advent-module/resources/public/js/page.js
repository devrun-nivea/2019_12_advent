/**
 * Created by Pavel on 1.12.2017.
 */
(function ($, window) {

    var Page = {
        config: {
            debug: false,
            timePreLoading: 1000,
            playSound: false,
            preload: false,
            useCache: false,
            preloadImages: true,
            preloadSounds: true
        },

        init: function (config) {
            $.extend(this.config, config);
            this.initProxyInfo();
            this.bindAjaxPageLoad();
            this.preLoadingPages();
            this.bindSound();

            this.callbacksAfterPageLoad.push(function () {
                Page.afterLoadInitForms();
                Page.afterLoadPlayPageSound();
                Page.preLoadingPages();
            });

        },

        initProxyInfo: function () {
            var selector = $(this.selectorApp);
            this.proxy = selector.data('pf-proxy-url');
            this.proxyBaseUrl = selector.data('pf-proxy-base-url');
            this.appBaseUrl = selector.data('app-base-url');
        },

        payloads: [{url: "/seznam.cz", history: "www.seznam.cz", payload: null}],

        bindSound: function () {
            var self = this;

            $(document).on('click', this.selectorClickSound, function (e) {
                if (self.config.playSound) {
                    var sound = $(this).data('sound');
                    var bleep = new Audio();
                    bleep.src = self.getProxyUrl(sound);
                    bleep.play();
                }
            });
        },

        /**
         * replace page in cache
         *
         * @param url
         * @param historyUrl
         * @param html
         */
        updatePage: function (url, historyUrl, html) {
            var exist = false;
            var obj = {url: url, history: historyUrl, payload: html};

            $(this.payloads).each(function (index, values) {
                if (values['url'] === url) {
                    exist = index;
                    return false;
                }
            });

            if (exist) {
                this.payloads.splice(exist, 1, obj);

            } else {
                this.payloads.push(obj);
            }

        },

        /**
         * is page in cache?
         *
         * @param url
         * @returns {boolean}
         */
        isPageLoaded: function (url) {
            var exist = false;
            var page = null;

            $(this.payloads).each(function (index, values) {
                if (values['url'] === url) {
                    exist = true;
                    page = values;
                    return true;
                }
            });

            return exist ? page : exist;
        },

        /**
         * clean page in cache
         *
         * @param url
         */
        invalidPage: function (url) {
            var self = this;

            $(this.payloads).each(function (index, values) {
                if (values['url'] === url) {
                    self.payloads.splice(index, 1);
                    return false;
                }
            });
        },


        preLoadingPages: function () {
            if (!this.config.preload) return;
            var self = this;


            var maxPreloading = 10;

            /*
            fnc = function () {
                return $.ajax({
                    url: '',
                    done: function () {
                        console.log("done");

                    },
                    success: function (payload) {
                        console.log("success");
                    }
                });
            }


            var pageList = [];
            var urlList = [];
            $('[data-' + self.selectorDataPreLoading + ']').each(function (index) {
                if ($(this).data(self.selectorDataPreLoading) == true) {
                    var url = $(this).attr('href') ? $(this).attr('href') : $(this).data('href');
                    if (url) {
                        if (!self.isPageLoaded(url) && $.inArray(url, urlList) == -1 ) {
                            urlList.push(url);
                            pageList.push( $().self.isPageLoaded("Asd") );
                        }
                    }
                }
            });

            console.log(urlList);
            console.log(pageList);


            $.when.apply($, pageList).then(function () {

                console.log("a to všechno dohromádky");
            });



            return;
            $.when( fnc(), $.ajax({url: '', success: function () {
                console.log("Ahoj");
            }})  ).then(function () {

                console.log("všechno");

            }, function () {
                console.log("fail");
            });

            return;
            */



            checkLoaded = function () {
                $('[data-' + self.selectorDataPreLoading + ']').each(function (index) {
                    // console.log(index);

                    if ($(this).data(self.selectorDataPreLoading) === true) {
                        var url = $(this).attr('href') ? $(this).attr('href') : $(this).data('href');
                        if (url) {
                            if (!self.isPageLoaded(url)) {
                                // load page
                                if (!self.loading) {
                                    self.load(this, function () {
                                        console.log("preload " + url + " complete");
                                        // tid = setTimeout(checkLoaded, self.config.timePreLoading);
                                        tid = setTimeout(checkLoaded, 100);
                                    })

                                } else {
                                    // if (index < maxPreloading) tid = setTimeout(checkLoaded, 100);
                                }
                            }
                        }
                    }

                });
            };

            tid = setTimeout(checkLoaded, this.config.timePreLoading);
        },


        initAfterPageLoad: function () {
            // this.bindFormSubmit();
        },

        switchPage: function (el, e, delay) {
            var self = this;

            var soundCount = $(this.dataAnimationSound).length;
            var animationCount = $(this.dataAnimation).length;

            // console.log("celkem sounds " + soundCount);
            // console.log("celkem animací " + animationCount);

            if (animationCount > 0) {
                var animated = 0;
                $(this.selectorApp).on(this.selectorAnimationStart, function () {
                    // start global animation

                }).on(self.selectorAnimationEnd, function () {
                    animated++;

                    var animationCount = $('.bound').length;
                    // console.log(animationCount);

                    if (animationCount === 0) {
                        $('.animated').removeClass('animated');

                        $(self.selectorApp).off(self.selectorAnimationEnd);

                        // console.log("START page");
                        // self.nextOLD(el, e);

                        if (!delay) delay = 1;
                        setTimeout(function(){
                            self.next(el, e);

                        }, delay);

                    }
                });


                $(this.dataAnimation).each(function (index, value) {
                    var animation = $(this).data('anim');
                    var delay = $(this).data('anim-delay');

                    if (animation) {
                        $(this).not('.bound')
                            .one(self.selectorAnimationStart, function (e) {
                                if ($(this).not('.start')) {
                                    if ($(this).is('.start')) return;

                                    var sound = $(this).data('anim-sound');
                                    if (sound && self.config.playSound) {
                                        var bleep = new Audio();
                                        bleep.src = self.getProxyUrl(sound);
                                        bleep.play();
                                    }

                                    $(this).addClass('start');
                                }

                            })
                            .addClass("bound animated " + animation)
                            .one(self.selectorAnimationEnd, function () {
                                // $(this).removeClass("bound animated " + animation);
                                $(this).removeClass("bound");
                                // console.log(this);
                            });

                    }
                    if (delay) {
                        $(this).css("animation-delay", delay);
                    }
                });


            } else {
                // self.nextOLD(el, e);
                self.next(el, e);

            }
        },

        bindAjaxPageLoad: function () {
            var self = this;

            $(document).on('click', '.ajax-page', function (e) {
                e.preventDefault();

                if ($(this).is('a')) {
                    $(this).attr('disabled', true);
                    // .text('Loading...');
                }

                self.switchPage(this, e);


            });
        },


        deprecatedBindAjaxPageLoad: function () {
            var blurSupport = Modernizr.cssfilters;

            if (Modernizr.touchevents) {
                $(Application.selectorCalendarDesktop).click(function (e) {
                    var counter = ($(this).data('click') || 0) + 1;

                    if (Application.allowSelect && counter == 1) {
                        $(this).data('click', counter);
                        if (blurSupport) Application.calendarDesktopPage(this, e);
                        else Application.calendarMobilePage(this, e);
                    }
                });

                $(Application.selectorCalendarMobile).click(function (e) {
                    var counter = ($(this).data('click') || 0) + 1;

                    if (Application.allowSelect && counter == 1) {
                        $(this).data('click', counter);
                        if (blurSupport) Application.calendarMobilePage(this, e);
                        else Application.calendarMobilePage(this, e);
                    }
                });

            } else {
                $(document).on('click', Application.selectorCalendarDesktop, function (e) {
                    if (blurSupport) Application.calendarDesktopPage(this, e);
                    else Application.calendarMobilePage(this, e);
                });

                //$(document).on('click', Application.selectorCalendarMobile, function (e) {
                //    if (blurSupport) Application.calendarMobilePage(this, e);
                //    else Application.calendarMobilePage(this, e);
                //});

            }
        },


        getProxyUrl: function (url) {
            var proxy = this.proxy;
            return proxy ? proxy + "-" + url : url;
        },
        getProxyElementUrl: function (el) {
            return this.proxy ? this.proxy + "-" + $(el).data('ajax-url') : $(el).data('ajax-url');
        },
        getProxyBaseUrl: function () {
            return this.proxyBaseUrl ? this.proxyBaseUrl : this.appBaseUrl;
        },
        getHistoryElementUrl: function (el) {
            return $(el).attr('href') ? $(el).attr('href') : $(el).attr('data-href');
        },

        findSnippets: function () {
            var result = [];
            $('[id^="snippet-"]').each(function () {
                var $el = $(this);
                if (!$el.is('[data-history-nocache]')) {
                    result.push({
                        id: $el.attr('id'),
                        html: $el.html()
                    });
                }
            });
            return result;
        },

        afterLoadInitForms: function () {
            for (var i = 0; i < document.forms.length; i++) {
                Nette.initForm(document.forms[i]);
            }
        },

        afterLoadPlayPageSound: function () {
            var soundPage = $(this.dataPageSound);
            if (soundPage) {
                var sound = $(soundPage).data('page-sound');
                if (sound && this.config.playSound) {
                    var bleep = new Audio();
                    bleep.src = this.getProxyUrl(sound);
                    bleep.play();
                }
            }
        },

        next: function (object, e) {
            var self = this;
            // console.log(object, e);

            this.getPage(object, e, function (payload) {
                // console.log(payload);

                if (payload) {
                    var html = payload['payload'];
                    var title = payload['title'];
                    var historyUrl = payload['history'];

                    $('#snippet--content').html(html);
                    if (title) document.title = title;

                    var finished = function () {

                        var cache = true;
                        history.pushState({
                            nette: true,
                            href: historyUrl,
                            title: document.title,
                            ui: cache ? self.findSnippets() : null
                        }, document.title, historyUrl);

                        self.afterLoadInitForms();

                        // after
                        $.each(self.callbacksAfterPageLoad, function (index, callback) {
                            if ($.isFunction(callback)) {
                                callback(payload);
                            }
                        });
                    };

                    finished();
                }

            });

        },


        /**
         * load page from element
         * @param el
         * @param event
         * @param callbackLoaded
         */
        load: function (el, event, callbackLoaded) {

            this.loading = true;
            var self = this;
            var historyUrl = this.getHistoryElementUrl(el);
            var url = this.getProxyElementUrl(el);
            var cache = $(el).data('cache');
            var cacheable = cache !== 'undefined' ? cache === true : true;

            var $data = {
                proxyUrl: this.proxy,
                proxyBaseUrl: this.proxyBaseUrl
            };

            $.ajax({
                type: "get",
                url: url,
                data: $data,
                success: function (payload) {
                    var html = payload.html ? payload.html : payload;
                    var title = payload.title ? payload.title : null;
                    var images = $(html).find('.img-preload img');
                    var sounds = $(html).find(self.dataAnimationSound);
                    var loaded = 0;
                    var soundsLoaded = 0;
                    var newImg;

                    $(images).each(function () {
                        newImg = new Image();
                        newImg.onload = function () {
                            loaded++;
                        };

                        newImg.src = this.src;
                        if (newImg.height === 0) {
                            loaded++;
                        }
                    });


                    $(sounds).each(function () {
                        var newAudio = new Audio();
                        var mp3 = $(this).data('anim-sound');

                        newAudio.onload = function () {
                            soundsLoaded++;
                        };

                        newAudio.src = self.getProxyUrl(mp3);
                    });


                    var finished = function () {
                        var obj = {url: url, history: historyUrl, payload: html, title: title};

                        if (self.config.useCache && cacheable) {
                            self.payloads.push(obj);
                        }

                        if (typeof callbackLoaded == 'function') {
                            callbackLoaded.call(this, obj);
                        }
                    };


                    var syncImages = function () {
                        if (loaded < images.length) {
                            setTimeout(syncImages, 10);
                        } else finished();
                    };
                    var syncSounds = function () {
                        if (loaded < images.length) {
                            setTimeout(syncImages, 10);
                        }
                    };

                    if (loaded < images.length) {
                        setTimeout(syncImages, 10);
                    } else {
                        finished();
                    }


                }
            }).always(function () {
                self.loading = false;
            });

        },

        getPage: function (el, event, callbackLoaded) {
            var $this = this;
            var url = this.getProxyElementUrl(el);
            var isPageLoad = this.isPageLoaded(url);

            var waiting = function () {
                isPageLoad = $this.isPageLoaded(url);

                if (!isPageLoad) {
                    setTimeout(waiting, 100);

                } else {
                    if (typeof callbackLoaded == 'function') {
                        callbackLoaded.call(this, isPageLoad);
                    }
                }

            };

            if (isPageLoad) {
                if (typeof callbackLoaded == 'function') {
                    callbackLoaded.call(this, isPageLoad);
                }

            } else {
                // if not loading yet, start this load
                if (!this.loading) this.load(el, event, callbackLoaded);


                // set timer only if loading start
                else {
                    setTimeout(waiting, 10);
                }
            }
        },

        getPageHtml: function () {

        },

        getPageClass: function () {

        },

        selectorApp: '.main-wrapper',
        selectorNextPage: '#preloadPage',
        selectorPage: 'ajax-page',
        selectorDataPreLoading: 'pre-loading',
        selectorClickSound: "[data-sound]",
        dataAnimation: "[data-anim]",
        dataAnimationSound: "[data-anim-sound]",
        dataPageSound: "[data-page-sound]",
        selectorAnimationStart: 'webkitAnimationStart mozAnimationStart MSAnimationStart oanimationend animationstart',
        selectorAnimationEnd: 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
        loading: false,
        payload: null,
        proxy: null,
        proxyBaseUrl: null,
        appBaseUrl: null,
        callbacksAfterPageLoad: []
    };

    $(function () {
        Page.init();
    });

    window.Page = Page;

})(jQuery, window);
