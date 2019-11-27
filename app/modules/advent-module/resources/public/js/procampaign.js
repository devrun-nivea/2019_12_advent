/**
 * Created by pavel on 19.3.19.
 */


(function ($, window, app, page) {

    var ProCampaignForm = {
        config: {
            proCampaignApiObjectName: 'ProCampaignApiConsumer',
            sendNewsletterAgain: false,
            newsletter: 'NIVEA_Email',

            source: "from_configuration",
            package: 'Default',

            // api keys
            apiKeyHU: "TklWRUEuSFUgVjd8TlZIVXN0YW5kYXJkcw==", // HU
            apiKeyCZ: "TklWRUEuQ1ogVjd8TlZDWnN0YW5kYXJkcw==", // CZ
            apiKeySK: "TklWRUEuU0sgVjd8TlZTS3N0YW5kYXJkcw==", // SK
            // apiKey: 'Q1hfRGVtby5JTlQgVjd8Q3hBcGlUZXN0X0RlbW9fQ2FtcGFpZ24=',  // demo
            // apiKey: 'TklWRUEuQ1ogVjd8cGl4bWFuLXRlc3Q=',  // pixman

            // gdpr policy
            privacyPolicy_CZ: 'Pro značku NIVEA není důležitá pouze péče o Vaši pokožku a její ochrana. Velkou váhu přikládáme i ochraně Vašich osobních údajů. Respektujeme proto Vaše soukromí a byli bychom rádi, kdybyste nám v tomto ohledu mohli důvěřovat, pokud jde o ochranu údajů, stejně jako když jde o péči o pokožku. Vždy Vás transparentním způsobem informujeme.',
            privacyPolicy_SK: 'Pre značku NIVEA nie je dôležitá len starostlivosť o Vašu pokožku a jej ochrana. Veľkú váhu prikladáme aj ochrane Vašich osobných údajov. Rešpektujeme preto Vaše súkromie a boli by sme radi, aby ste nám v tomto smere mohli dôverovať, pokiaľ ide o ochranu Vašich osobných údajov, rovnako ako keď ide o starostlivosť o pokožku. Vždy Vás transparentným spôsobom informujeme.',
            privacyPolicy_HU: 'A NIVEA számára nem csak a bőrének ápolása és védelme fontos. A személyes adatai védelmének szintén nagy jelentőséget tulajdonítunk. Ezért tiszteletben tartjuk a magánéletét és szeretnénk, ha ugyanannyira meg tudna bízni bennünk az adatvédelmet illetően, mint a bőrápolást illetően. Mindig átlátható módon tájékoztatjuk Önt arról, hogy milyen célból van szükségünk az adataira, valamint arról, hogy tároljuk-e azokat és ha igen, mennyi ideig. Ez lehetővé teszi az Ön számára, hogy eldöntse, milyen célokra használhatjuk az adatait. Annak érdekében, hogy biztosítsuk a lehető legjobb biztonságot, az adatokat mindig titkosított formában továbbítják részünkre. Amennyiben a továbbiakban nem kívánja, hogy használjuk az adatait, kérjük, tájékoztasson minket például e-mailen keresztül.',

            // transactionName: "CxApiTest Contact Message (IN)",
            // transactionName: "pixman-test",
            transactionName: "from_configuration",

            identLong: 1,
            liveFormWait: false, // 500
            sendForm: false,
            sendTransaction: true,
            logUrl: null,
            debug: false
        },

        init: function (config) {
            $.extend(this.config, config);

            this.bindJavaLoginFormSubmit();
            this.bindLogoutBtn();
            this.bindFormSubmit();
            // this.initAfterPageLoad();
            this.initLanguage();
            this.isProCampaignApiReady();

        },

        initAfterPageLoad: function () {
            this.refreshLoginButton();
            // this.bindFormSubmit();
        },

        initLanguage: function () {
            this.apiKey = this.config.apiKeyCZ;
            this.privacyPolicy = this.config.privacyPolicy_CZ;

            this.transactionName = this.config.transactionName;
            this.identLong = this.config.identLong;

            var appPackage = this.config['package'];

            if ($(this.selectorApp).is('.sk')) {
                if (this.config.debug) console.log("api key: SK");

                this.apiKey = this.config.apiKeySK;
                this.privacyPolicy = this.config.privacyPolicy_SK;

            } else if ($(this.selectorApp).is('.hu')) {
                if (this.config.debug) console.log("api key: HU");
                this.apiKey = this.config.apiKeyHU;
                this.privacyPolicy = this.config.privacyPolicy_HU;

            } else {
                if (this.config.debug) console.log("api key: CZ");
            }

        },

        getConsentTextPrivacy_Policy: function () {
            if (!this.consentText_PrivacyPolicy) {
                var privacySelector = "#privacy-label";
                if ($(privacySelector).length === 0) {
                    console.log(privacySelector + " not found!");
                }
                this.consentText_PrivacyPolicy = $.trim($(privacySelector).text());
            }

            return this.consentText_PrivacyPolicy;
        },

        getConsentText_Email: function () {
            if (!this.consentText_Email) {
                var newsletterSelector = "#newsletter-label";
                if ($(newsletterSelector).length === 0) {
                    console.log(newsletterSelector + " not found!");
                }
                this.consentText_Email = $.trim($(newsletterSelector).text());
            }

            return this.consentText_Email;
        },

        isProCampaignApiReady: function() {
            if (!window[this.config.proCampaignApiObjectName]) {
                setTimeout(this.isProCampaignApiReady.bind(this), 10);
                return;
            }

            this.onProCampaignApiReady();
        },

        onProCampaignApiReady : function() {

            if (!ProCampaignApiConsumer.apiKey) ProCampaignApiConsumer.apiKey = this.apiKey;
            if (!this.ProCampaignApi) this.ProCampaignApi = window[this.config.proCampaignApiObjectName];
            if (!this.isLoggedIn) {

                // TODO: wait for ProCampaignApi to exist before continuing here
                if (this.config.debug) console.log('check login status - is there a pc api available?', this.ProCampaignApi);
                if (this.ProCampaignApi) {
                    this.ProCampaignApi.onReady.add(function () {

                        // this.loadUserData();
                        // this.getPrivacy();
                        // this.testApi();


                        var userStatus = this.ProCampaignApi.getUserInfo();
                        // console.log(userStatus);

                        userStatus.done(function (data) {
                            // console.log(data);
                            if (typeof data === 'object' && data.IsLoggedIn) {
                                this.isLoggedIn = true;

                                if (!this.email) {
                                    this.email = data.UserName;
                                }

                                // load user data from procampaign
                                this.loadUserData();

                            } else {
                                this.isLoggedIn = false;
                            }

                            this.refreshLoginButton();


                        }.bind(this));
                    }.bind(this));
                }

            }

        },

        refreshLoginButton: function () {
            // is proxy ?
            if ($('.nx-cp-proxyframe').length > 0) {

            } else {

            }

            // console.log(this.isLoggedIn);

            if (this.isLoggedIn) {
                $('#logged-in').removeClass('hidden');
                $('#logged-out').addClass('hidden');

                $('#register-in').addClass('hidden');

            } else {
                $('#logged-out').removeClass('hidden');
                $('#logged-in').addClass('hidden');

                $('#register-in').removeClass('hidden');
            }

        },




        sendRequest : function($form, successCallback, errorCallback) {
            // Triggered by Form

            if (!this.ProCampaignApi) {
                console.warn('No ProCampaign API available. Mocking thanks page now.');
                // this._updateData($form);
                setTimeout(successCallback, 2000);
                return;
            }

            var Parameters = [];

            var QVal = $form.find('[name=_q]').val();
            var QKey = "Q" + QVal;

            var rate = parseInt($form.find('[name^="answer"]:checked').val());

            Parameters.push({
                name: QKey,
                value: rate
            });

            Parameters.push({
                name: 'Ident_long',
                value: this.identLong
            });

            // console.log(Parameters);
            // console.log(QResult);

            var consumer = {
                Source: this.config.source,
                Attributes: [
                    // {
                    //     name: 'NVZZ_Language',
                    //     value: this.config.language
                    // },
                    // {
                    //     name: 'language',
                    //     value: JSConst.config.proCampaign.language
                    // },
                    {
                        name: 'list:NVZZ190101_Participants',
                        value: '1'
                    },
                    {
                        name: 'Gender',
                        value: ($form.find('[name="createdBy[gender]"]:checked').val() === '0') ? '0' : '1'
                    },
                    {
                        name: 'Firstname',
                        value: $form.find('[name="createdBy[firstName]"]').val()
                    },
                    {
                        name: 'Lastname',
                        value: $form.find('[name="createdBy[lastName]"]').val()
                    },
                    {
                        name: 'Email',
                        value: $form.find('[name="createdBy[email]"]').val()
                    },
                    // {
                    //     name: 'City',
                    //     value: $form.find('[name="createdBy[city]"]').val()
                    // },
                    // {
                    //     name: 'Street1',
                    //     value: $form.find('[name="createdBy[street]"]').val()
                    // },
                    // {
                    //     name: 'Streetnumber',
                    //     value: $form.find('[name="createdBy[strno]"]').val()
                    // },
                    // {
                    //     name: 'ZipCode',
                    //     value: $form.find('[name="createdBy[zip]"]').val()
                    // }
                ],
                Transactions: [
                    {
                        Name: this.transactionName,
                        "parameters": Parameters
                    }
                    // additional transaction will be pushed below
                ],
                apiKey: this.ProCampaignApi.apiKey
            };

            // push list to Attributes
            // and push transaction to Transactions
            // newsletterSend = send again newsletter, if NIVEAEmail was newer sending
            var newsletterSend = this.config.sendNewsletterAgain ? true : (false === this.NIVEAEmail);

            if ($form.find('[name=newsletter]').length > 0 && $form.find('[name=newsletter]').is(':checked') && newsletterSend) {
                consumer.Attributes.push({
                        name: 'NVZZstandards_ConsentText_Email',
                        value: this.getConsentText_Email()
                    }
                );

                consumer.Transactions.push({
                    Name: 'OptIn for list:NIVEA_Email STEP 1',
                    Parameters: [
                        {
                            name: 'Q1',
                            value: '1'
                        }
                    ]
                });

            }
            if ($form.find('[name=privacy]').length > 0 && $form.find('[name=privacy]').is(':checked')) {
                consumer.Attributes.push({
                        name: 'NVZZSweepstake_ConsentText_PrivacyPolicy',
                        value: this.getConsentTextPrivacy_Policy()
                    },
                    {
                        name: 'NVZZstandards_LegalText_PrivacyPolicy',
                        value: this.privacyPolicy
                    }
                );

            }

            // console.log(consumer);
            // return;

            if (this.config.sendTransaction) {
                this.ProCampaignApi.postConsumer({
                    data: consumer,
                    apiKey: this.ProCampaignApi.apiKey
                })
                    .done(function (data) {
                        successCallback(consumer, data);
                        // this._updateData($form);

                    }.bind(this))
                    .fail(function (data) {

                        console.log(data);
                        errorCallback();
                    });

            } else {
                successCallback(true);
            }
        },

        testApi: function () {
            var consumerApiUrl = "https://api.procampaignapi.com/Consumer/";
            // var consumerApiUrl = "https://api.procampaignapi.com/";
            var token = "6jnWbmXy-ldjGoQr9fxKZFIB3oIFzgpD6BK_9_FuCv1nHPhv1gViA_FcQ-7puqxnzt_k2q_ZvalWptfBSFaEt3pv2JHejO-ljsP6SXluw1q9w6vcWFl62TFJ46aRZs4w9tW9YsaCAuSl7YgXxQFMyFO0Y3xTnYcHdDg3cFlnvwm0WJlJ5128Rz4BVY8JPpj7sIgz_iJqLnBGPR2Ma8jm6jlViAKpdULL49IoHlxKdZaV6ZihmHBh9f1t81NhlDCuoDOne7TcxWCDbK2EeQmuuB2dchgRYWfd4bVdhR4MXzaYbnMaw-Df7PXC-M8F7z_Vn_m-UhRbAK4j_opjb6YIbNtMd24RdWVVhmcp7KZuyC41gqz3i0r2x_Px_V090wIyzdWiYQvHqQvYB7aiyXeP5Gwz_jfClTRSoH1yXeKivCdYR956PKmvWv8ShGSkNm7wz2wj6RR6FiCghzCZJ3tewSs0CVTpSXMwrKoH1TiPsDIduAknB8jKo0rxB29vi9iAmBbzQ4VhEdC4Qts3crL5LZcUaDWBoczLkqQpmHFfdvx_pwHSsRK7neKnCIFalpT-zoEY1ubhAh48A6-ZtMz1Mpj_MZlT4R7HoT0lLWPUBjelC-92pFHHzuI0xoK2X1Ve";
            var apiKey = this.apiKey;

            // token = this.ProCampaignApi.token;
            var method = "post";
            var attributes = ['Firstname', 'list:NIVEA_Email'];

            console.log(method);


            var unsubscribed = {
                "Lists": [
                    {
                        "Name": "list:NIVEA_Email",
                        "Value": "1",
                        "Created": "0001-01-01T00:00:00"
                    },
                    {
                        "Name": "list:Community",
                        "Value": "1",
                        "Created": "0001-01-01T00:00:00"
                    }
                ],
                "Email": "pavel.paulik@seznam.cz",
                "Source": "Some unsubscribe form",
                "Reason": "Unsubscribe reason"
            };


            if (method == "get") {
                $.ajax({
                    method: "GET",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    url: consumerApiUrl + "/Consumer/Attributes?attributes=" + attributes,
                    // url: consumerApiUrl + "Consumer/Transactions/?apiKey=" + apiKey + "&transactions=" + ['OptIn for list:NIVEA_Email STEP 1'],
                    // url: consumerApiUrl + "Check/Transaction/2018_12_advent/?apiKey=" + apiKey,
                    // url: consumerApiUrl + "Account/UserInfo/?apiKey=" + apiKey + "&includeToken=" + token,


                    // list:NIVEA_Email
                    xhrFields: {
                        withCredentials: true
                    },
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("CxAuthorization", "Bearer " + token);
                    }
                }).done(function(response) {
                    versions = response.Data.Versions;
                    console.log(response);


                });
            }

            if (method == "post") {

                $.ajax({
                    method: "POST",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    url: consumerApiUrl + "Unsubscribe?apiKey=" + apiKey,
                    data: JSON.stringify(unsubscribed),

                    // list:NIVEA_Email
                    // xhrFields: {
                    //     withCredentials: true
                    // },
                    beforeSend: function (xhr) {
                        // xhr.setRequestHeader("CxAuthorization", "Bearer " + token);
                    }

                }).done(function(response) {
                    console.log(response);
                });
            }



        },


        getPrivacy: function () {
            var consumerApiUrl = "https://api.procampaignapi.com/Consumer/";
            var versions = null;
            var apiKey = this.apiKey;

            $.ajax({
                method: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                url: consumerApiUrl + "Documents/Newsletter/PermissionText?apiKey=" + apiKey,
                xhrFields: {
                    withCredentials: true
                }
            }).done(function(response) {
                versions = response.Data.Versions;
                console.log(response);

                $("#permissionText").html(response.Data.Html);
            });



        },


        login: function(username, password, successCallback, errorCallback) {
            var self = this;

            var userLogin = this.ProCampaignApi.login(
                {
                    'apiKey': this.apiKey,
                    'username': username,
                    'password': password,
                    'remember': true
                }

            );

            userLogin.done(function (data) {
                if (typeof data === 'object' && data.IsSuccessful) {

                    successCallback(data);
                    // self._refreshUserData();
                }
            }.bind(this))
                .fail(function (data) {
                    errorCallback(data);
                });
        },



        logout: function(successCallback, errorCallback) {
            var self = this;
            var userLogin = this.ProCampaignApi.logout( successCallback, errorCallback, {'apiKey': this.apiKey} );
        },



        loadUserData: function() {
            var self = this;
            var userAttributes = this.ProCampaignApi.getConsumerAttributes(
                [
                    'Gender',
                    'Firstname',
                    'Lastname',
                    'Email',
                    'list:NIVEA_Email',
                    'City',
                    'Street1',
                    'Streetnumber',
                    'ZipCode'
                    // 'NVZZstandards_ConsentText_Email',
                    // 'NVZZstandards_LegalText_PrivacyPolicy'
                ]
            );

            userAttributes.done(function (data) {
                if (typeof data === 'object' && data.IsSuccessful) {

                    this.firstname = data.Data.Attributes[2].Value;
                    this.lastname = data.Data.Attributes[4].Value;
                    this.email = data.Data.Attributes[1].Value;
                    this.gender = data.Data.Attributes[3].Value;
                    this.city = data.Data.Attributes[0].Value;
                    this.street = data.Data.Attributes[6].Value;
                    this.streetnumber = data.Data.Attributes[7].Value;
                    this.zipcode = data.Data.Attributes[8].Value;
                    this.NIVEAEmail = data.Data.Attributes[5].Value;

                    self._refreshUserData();
                }
            }.bind(this));
        },

        _refreshUserData: function () {
            this.refreshLoginButton();
            var form = $(this.selectorForm);

            if (this.isLoggedIn) {
                if ($(form).length > 0) {
                    $(form).find('input[name="createdBy[firstName]"]').val(this.firstname);
                    $(form).find('input[name="createdBy[lastName]"]').val(this.lastname);
                    $(form).find('input[name="createdBy[email]"]').val(this.email);
                    $(form).find('input[name="createdBy[city]"]').val(this.city);
                    $(form).find('input[name="createdBy[street]"]').val(this.street);
                    $(form).find('input[name="createdBy[strno]"]').val(this.streetnumber);
                    $(form).find('input[name="createdBy[zip]"]').val(this.zipcode);
                    $(form).find('input[name="createdBy[gender]"]').filter('[value=' + this.gender + ']').prop('checked', true);
                }

            } else {
                if ($(form).length > 0) {
                    $(form).find('input[name="createdBy[firstName]"]').val('');
                    $(form).find('input[name="createdBy[lastName]"]').val('');
                    $(form).find('input[name="createdBy[email]"]').val('');
                    $(form).find('input[name="createdBy[city]"]').val('');
                    $(form).find('input[name="createdBy[street]"]').val('');
                    $(form).find('input[name="createdBy[strno]"]').val('');
                    $(form).find('input[name="createdBy[zip]"]').val('');
                    $(form).find('input[name="createdBy[gender]"]').filter('[value=' + this.gender + ']').prop('checked', true);
                }
            }
        },

        bindLogoutBtn: function() {
            var self = this;
            $(document).on('click', this.selectorLogoutBtn, function (event) {
                event.preventDefault();

                self.logout(function (data) {
                    if (typeof data === 'object' && data.IsSuccessful) {
                        self.isLoggedIn = false;
                        self.email = null;
                    }

                    self._refreshUserData();

                }, function () {

                });
            });

        },

        bindJavaLoginFormSubmit: function () {
            var self = this;
            $(document).on('submit', this.selectorLoginForm, function (event) {
                event.preventDefault();

                var form = $(this);
                var url = form.attr('action');


                if (Nette.validateForm(form.get(0))) {

                    var btn = $(this).find('[type="submit"]');
                    // $(btn).prop('disabled', true);


                    // console.log("success");
                    var username = form.find('[name=username]').val();
                    var password = form.find('[name=password]').val();

                    self.login(username, password, function (data) {
                        $('#errors').addClass('hidden').removeClass('alert alert-danger');

                        // console.log(data);

                        if (typeof data === 'object' && data.IsSuccessful) {
                            self.isLoggedIn = data.Data.IsLoggedIn;
                            self.email = data.Data.UserName;
                            self.token = data.Data.Token;
                            self.userId = data.Data.UserId;
                            self.tokenExpires = data.Data.TokenExpires;
                        }


                        // Page.switchPage(self.selectorLoginForm, event);
                        $('#modalLogin').modal('hide');
                        self.loadUserData();

                        /*
                        $.ajax({
                            type: "POST",
                            url: url,
                            data: form.serialize(), // serializes the form's elements.
                            success: function (data) {
                                // Page.switchPage(self.selectorLoginForm, event);
                                // $('#modalLogin').modal('hide');

                                //console.log(data);
                                // Application.switchToThanks();

                            },
                            fail: function (data) {
                                console.log(data);
                            }
                        });
                        */

                    }, function (d) {
                        $('#errors').removeClass('hidden').addClass('alert alert-danger');

                        // console.log(d);

                    });

                }


            });
        },


        bindFormSubmit: function () {
            var self = this;

            $(document).on('submit', this.selectorForm, function (event) {
                event.preventDefault();

                var form = $(this);
                var url = form.attr('action');
                // console.log(url);
                // console.log(form);

                if (Nette.validateForm(form.get(0))) {

                    var btn = $(this).find('[type="submit"]');
                    $(btn).prop('disabled', true);
                    // .text('Loading...');

                    /*
                     * analytics
                     */
                    // var QVal = form.find('[name=_q]').val();
                    // var QKey = "Q" + QVal;
                    // var rate = parseInt(form.find('[name^="questions"]:checked').val()) + 1;
                    // dataLayer.push({ ga_event: 'click', eventCategory: 'button', pageview: '/advent-calendar-form', eventAction: 'send', eventLabel: 'form_send', eventValue: QKey + "=" + rate});

                    // window.location.href = "thank-you/";
                    // return;

                    if (self.config.sendForm) {
                        $.ajax({
                            type: "POST",
                            url: url,
                            data: form.serialize(), // serializes the form's elements.
                            success: function (data) {

                                //console.log(data);
                                // Application.switchToThanks();

                                /*
                                 Application.register(form, function (result) {
                                 console.log("register " + result);
                                 });
                                 */

                                self.sendRequest(form, function (consumer, data) {
                                    console.log("success");

                                    if (self.config['logUrl']) {
                                        $.ajax({
                                            type: "POST",
                                            url: self.config['logUrl'],
                                            data: {request: JSON.stringify(consumer), response: JSON.stringify(data)},
                                            success: function (result) {
                                                console.log(result);
                                                Page.switchPage(self.selectorForm, event);
                                            }
                                        });
                                    } else {
                                        Page.switchPage(self.selectorForm, event);
                                    }

                                    // return;

                                }, function () {
                                    console.log("fail");
                                });


                            },
                            fail: function (data) {
                                console.log(data);
                            }
                        });

                    } else {
                        self.sendRequest(form, function () {
                            console.log("success");

                            Page.switchPage(self.selectorForm, event);
                            // Page.next("#calendar", event);

                        }, function () {
                            console.log("fail");
                        });
                    }
                }
            });

        },


        selectorApp: app.selectorApp,
        selectorForm: "form#frm-registrationForm",
        selectorLoginBtn: "form#frm-registrationForm #login",
        selectorLogoutBtn: "#logged-in #logout",
        selectorLoginForm: "form#frm-loginForm",
        apiKey: null,
        privacyPolicy: null,
        consentText_Email: null,
        consentText_PrivacyPolicy: null,
        isLoggedIn : false,
        ProCampaignApi: null,
        NIVEAEmail: false,
        identLong: 1,


        'salutation': '',
        'firstname': '',
        'lastname': '',
        'email': '',
        'city': '',
        'street': '',
        'streetnumber': '',
        'zipcode': ''

    };

    $(function() {

        page.callbacksAfterPageLoad.push(function (e) {
            ProCampaignForm.initAfterPageLoad();
            ProCampaignForm._refreshUserData();
        });

    });

    window.ProCampaignForm = ProCampaignForm;

})(jQuery, window, Application, Page);