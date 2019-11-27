//
// Copyright 2014, Consultix GmbH
//
function ProCampaignApiConsumerClass() {

    var self = this;

    var loginCookiePrefix = "PcLogin_";

    function setLoginCookie(apiKey, data) {
        document.cookie = loginCookiePrefix + encodeURIComponent(apiKey) + '=' + encodeURIComponent(JSON.stringify(data)) + '; path=/;';
    }

    function getCookie(cname) {

        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1);
            if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
        }
        return "";
    }

    return {

        /// <field name="apiDomain" type="String">The url of the api. The default value may be altered for debugging purposes</field>
        apiDomain: "https://consumer.procampaignapi.com",

        authorizeDomain: "https://auth.procampaignapi.com",

        /// <field name="cid" type="String">The unique identifier of the consumer</field>
        cid: "",

        /// <field name="apiKey" type="String">The apiKey taken from the campaign</field>
        apiKey: "",

        /// <field name="token" type="String">The bearer token to identify the user</field>
        token: "",

        /// <field name="antiForgeryToken" type="String">Anti forgery token to prevent CSRF-attacks</field>
        antiForgeryToken: "",

        /// <field name="userInfo" type="String">Contains information about the current user (loginstatus etc.)</field>
        userInfo: "",

        /// <field name="localizationObject" type="Object">Contains the translations for the current language.</field>
        localizationObject: "",

        // Helper var for getLocalization to start the ajax request only once
        getLocalizationAjaxStarted: false,

        api: function (params) {
            /// <summary>
            /// Generic api call. All other calls rely on this function
            /// </summary>            
            /// <param name="path" type="String">The name of the function exclude the domain</param>
            /// <param name="method" type="String">The http verb ("GET", "PUT", "POST" or "DELETE")</param>
            /// <param name="data" type="String">Data which should be send to the server.</param>
            /// <param name="successCallBack" type="String">The callback function which is called if the api call was successful. function(status, data)</param>
            /// <param name="errorCallBack" type="String">The callback function which is called if an error occurred. function(status, statusText, responseText)</param>

            var self = this;
            var dfd = $.Deferred();
            var url = params.url;

            /*
             * async (default: true)
             * Type: Boolean 
             * By default, all requests are sent asynchronously (i.e. this is set to true by default).
             * If you need synchronous requests, set this option to false. 
             */
            var asyncCall = params.async;
            if (asyncCall == null || asyncCall == undefined) {
                asyncCall = true;
            }

            var ajaxOptions = {};

            if (!(/^(http|https):\/\//i.test(url))) {
                url = this.apiDomain + url;
            }

            ajaxOptions = {
                type: params.type,
                url: url,
                async: asyncCall,
                data: (function () {
                    if (params.type != "GET")
                        return JSON.stringify(params.data);
                    else
                        return null;
                }()),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                beforeSend: function (xhr) {
                    if (self.token != null && self.token != "") {
                        // set header
                        xhr.setRequestHeader("CxAuthorization", "Bearer " + self.token);
                    }
                },
                xhrFields: {
                    withCredentials: true
                },
            }

            // Calculate the difference between TokenExpires and now in milliseconds, if the Value is below 1800000 (30 minutes), we have to refresh it before we proceed.
            if (self.userInfo != null && self.userInfo.Token && (new Date(self.userInfo.TokenExpires) - new Date() <= 1800000)) {
                // Token is expired refresh it before using the api.
                if (window.console) {
                    console.warn("TokenExpired");
                }

                self.userInfo = null;
                var self = this;

                this.getUserInfoNoncached(self.includeToken)
                    .done(function (result) {
                        setLoginCookie(self.apiKey, result.Data);
                        self.token = result.Data.Token;
                        self.userInfo = result.Data;
                        self.onLoginStateChanged.fire(result.Data);

                        // make the original api call
                        self.api(params).done(function (res) {
                            dfd.resolve(res);
                        }).fail(function (res) {
                            if (res.responseText)
                                dfd.reject(JSON.parse(res.responseText));
                            else
                                dfd.reject({});
                        });
                    });
            }
            else {
                if (params.requireLogin && !self.userInfo.IsLoggedIn) {
                    self.ensureLogin().done(function () {
                        $.ajax(ajaxOptions)
                        .done(function (res) {
                            dfd.resolve(res);
                        })
                        .fail(function (res) {
                            if (res.responseText)
                                dfd.reject(JSON.parse(res.responseText));
                            else
                                dfd.reject({});
                        });

                    }).fail(function (res) {
                        dfd.reject(res);
                    });
                }
                else {
                    $.ajax(ajaxOptions)
                        .done(function (res) {
                            dfd.resolve(res);
                        })
                        .fail(function (res) {
                            if (res.responseText)
                                dfd.reject(JSON.parse(res.responseText));
                            else
                                dfd.reject({});
                        });
                }
            }
            return dfd.promise();
        },

        ensureLogin: function () {
            // has to return promise  
        },

        socialLoginResult: function (res) {
            // parameters are defined by implementation of popup
        },

        addExternalLogin: function () {
            /// <summary>Adds an external (social) login to account.</summary>
            return this.api({
                type: "POST",
                url: "/Account/ExternalLogin"
            });
        },

        getAllExternalLogins: function () {
            /// <summary>Returns all external (social) logins for account.</summary>
            return this.api({
                type: "GET",
                url: "/Account/ExternalLogins"
            });
        },

        removeExternalLogin: function (provider) {
            /// <summary>Deletes an external (social) login for account.</summary>
            /// <param name="provider">Name of the external login provider.</param>
            return this.api({
                type: "DELETE",
                url: "/Account/ExternalLogin?provider=" + provider
            });
        },

        refreshLogin: function (userInfo) {
            setLoginCookie(this.apiKey, userInfo);
            this.getUserInfo();
            this.onInvalidateSession.fire();
        },

        register: function (params) {
            /// <summary>Registers a user for membership. The consumer data must contain at least the attributes "Username" and "Password".</summary>
            /// <param name="consumer" type="Consumer">An instance of a consumer class containing the data to be stored</param>
            /// <param name="successCallBack" type="String">The callback function which is called if the api call was successful. function(status, data)</param>
            /// <param name="errorCallBack" type="String">The callback function which is called if an error occurred. function(status, statusText, responseText)</param>
            var self = this;

            if (!params.data.apiKey)
                params.data.apiKey = this.apiKey;            

            return this.api({
                  type: "POST",
                  url: "/Account/Register",
                  data: params.data
              }).done(function (res) {
                  if (res.Data.LoggedIn) {
                      self.refreshLogin(res.Data.UserInfo);
                  }
              });
        },

        resetPassword: function (params) {
            /// <summary>Starts the reset password process for a user. The consumer data must contain the "Email".</summary>
            /// <param name="consumer" type="Consumer">An instance of a consumer class containing the data to be stored</param>
            if (!params.data.apiKey)
                params.data.apiKey = this.apiKey;

            return this.api({
                type: "POST",
                url: "/Account/TriggerResetPassword",
                data: params.data
            });
        },

        finalizeResetPassword: function (params) {
            /// <summary>Starts the reset password process for a user. The consumer data must contain the "Email", "Token" and new the "Password".</summary>
            /// <param name="consumer" type="Consumer">An instance of a consumer class containing the data to be stored</param>
            if (!params.data.apiKey)
                params.data.apiKey = this.apiKey;

            return this.api({
                type: "POST",
                url: "/Account/FinalizeResetPassword",
                data: params.data
            });
        },

        changePassword: function (data) {
            /// <summary>Change the password for a user.</summary>
            /// <param name="data" type="Object">Data must contain the "OldPassword" and "NewPassword".</param>

            return this.api({
                type: "POST",
                url: "/Account/ChangePassword",
                data: data
            });
        },

        changeUserName: function (data) {
            /// <summary>Change the username of a user.</summary>
            /// <param name="data" type="Object">Data must contain the "Password" and "NewUserName".</param>
            var self = this;

            return this.api({
                type: "POST",
                url: "/Account/ChangeUserName",
                data: data
            }).done(function () {
                // Userinfo neu abrufen, damit aktuelle Username in ProCampaignApiConsumer.userInfo gespeichert wird.
                self.getUserInfoNoncached(self.includeToken);
            });
        },

        changeEmail: function (data) {
            /// <summary>Change the email address and username of a user.</summary>
            /// <param name="data" type="Object">Data must contain the "Password" and "NewUserName" (Email).</param>

            return this.api({
                type: "POST",
                url: "/Account/ChangeEmail",
                data: data
            });
        },

        login: function (params) {
            /// <summary>Logs in the user. If the login is successful, successCallBack will be called, if not errorCallBack will be called.</summary>
            /// <param name="username" type="String">Username</param>
            /// <param name="password" type="String">Password</param>
            /// <param name="successCallBack" type="String">The callback function which is called if the api call was successful. function(status, data)</param>
            /// <param name="errorCallBack" type="String">The callback function which is called if an error occurred. function(status, statusText, responseText)</param>
            var self = this;
            var url = "/Account/Login?includeToken=" + this.includeToken;

            if (!params.apiKey)
                params.apiKey = this.apiKey;

            var data = {
                apiKey: params.apiKey,
                username: params.username,
                password: params.password,
                remember: params.remember
            };

            return this.api({
                type: "POST",
                url: url,
                data: data
            })
            .done(function (res) {
                // set cookie
                self.refreshLogin(res.Data);
            });
        },

        /// <summary>Gets fired when the ConsumerAPI is Ready to use.</summary>
        onReady: $.Callbacks("memory"),

        onLoginStateChanged: $.Callbacks("memory"),
        onInvalidateSession: $.Callbacks("memory"),

        logout: function (successCallback, errorCallback, params) {
            /// <summary>Logs out the user. If the logout is successful, successCallBack will be called, if not errorCallBack will be called.</summary>
            /// <param name="successCallBack" type="String">The callback function which is called if the api call was successful. function(status, data)</param>
            /// <param name="errorCallBack" type="String">The callback function which is called if an error occurred. function(status, statusText, responseText)</param>
            var self = this;
            var url = "/Account/Logout";
            var apiKey = "";

            if (params && !params.apiKey)
                apiKey = params.apiKey;
            else
                apiKey = this.apiKey;

            var data = {
                apiKey: apiKey
            };

            return this.api({
                type: "POST",
                url: url,
                data: data
            }).done(function (result) {
                self.refreshLogin(null);
                // Legacy
                if (successCallback != null)
                    successCallback(result);
            }).fail(function (result) {
                // Legacy
                if (errorCallback != null)
                    errorCallback(result);
            });

        },

        insertLoginForm: function (divId, templateName, redirectUri) {
            var requestUrl = "/Templates/" + templateName + "/0?apiKey=" + encodeURIComponent(this.apiKey);

            if (typeof redirectUri !== 'undefined')
                requestUrl += "&redirectUri=" + encodeURIComponent(redirectUri);

            return this.api({
                type: "GET",
                url: requestUrl,
            }).done(function (result) {
                var html = result.Data;

                $('#' + divId).html(html);
            });

        },

        getLocalization: function (language, url) {
            var self = this;
            var dfd = $.Deferred();

            if (self.localizationObject == "") {

                if (self.getLocalizationAjaxStarted == false) {
                    self.getLocalizationAjaxStarted = true;
                    var translationUrl = "";

                    if (url == null)
                        translationUrl = "https://" + document.domain + "/rating/nivea/localization/lang_" + language + ".js";
                    else
                        translationUrl = url;

                    var getTranslation = $.get(translationUrl);

                    getTranslation.done(function (translationResult) {
                        var translations = JSON.parse(translationResult);

                        self.localizationObject = {};

                        for (var i = 0, l = translations.length; i < l; i++) {
                            var name = translations[i].Variable;
                            var value = translations[i][language];

                            if (name != "")
                                self.localizationObject[name] = value;
                        }

                        // Trigger ajax call success event for waiting functions.
                        $(document).trigger("CxEvent-translationLoaded");
                        dfd.resolve(self.localizationObject);
                    });
                }
                else {
                    // If the ajax call is already running, we wait for the success event                    
                    $(document).on("CxEvent-translationLoaded", function () {
                        dfd.resolve(self.localizationObject);
                    });
                }
            }
            else {
                dfd.resolve(self.localizationObject);
            }

            return dfd.promise();
        },

        insertTemplate: function (config) {
            /// <summary>
            /// Loads a template from ProCampaign.
            /// </summary>            
            /// <param name="config" type="Object">A template configuration object. Please see template documentation for details.</param>

            var self = this;
            var templateName = config.Template;
            var selector = config.Target;
            var parameters = config.Parameters;
            var language = config.Parameters.Language;
            var translationUrl = config.Parameters.LanguagePath;

            var templateUrl = "/Templates/" + templateName + "/0?apiKey=" + encodeURIComponent(this.apiKey);
            templateUrl += "&FormContainer=" + selector + "&" + $.param(parameters);

            var getTemplate = this.api({
                type: "GET",
                url: templateUrl,
            });

            var getTranslation = self.getLocalization(language, translationUrl);

            $.when(getTemplate, getTranslation).done(function (templateResult, translationResult) {
                var defaultHtml = templateResult.Data;
                var finalHtml = defaultHtml;

                for (var property in translationResult) {
                    var placeholder = "%%%" + property + "%%%";
                    var value = translationResult[property];
                    finalHtml = finalHtml.replace(new RegExp(placeholder, "gi"), value);
                }

                return $('#' + selector).html(finalHtml);
            });
        },

        // 06.08.2014 (MR) Dieses Flag sorgt dafür das die Funktion erstmal wie gewohnt arbeitet.
        // Ruft jemand getUserInfo(includeToken=false) auf, so werden automatische Aufrufe (z.B. aus logout())  entsprechend auch mit diesem Flag versehen
        includeToken: true,

        getUserInfo: function () {
            /// <summary>Get Information about the currently active (eventually logged in) user. This information might be cached</summary>
            var self = this;
            var dfd = $.Deferred();
            var userInfo = null;

            try {
                // Versuchen Userinfo Cookie aufzulösen
                var name = loginCookiePrefix + encodeURIComponent(this.apiKey);
                var c1 = getCookie(name);
                var c2 = decodeURIComponent(c1);
                userInfo = JSON.parse(c2);
                self.token = userInfo.Token;
                self.userInfo = userInfo;
                self.onLoginStateChanged.fire(userInfo);
                dfd.resolve(userInfo);
                return dfd.promise();
            } catch (ex) {
                // Oder Userinfo neu abrufen
                var getUserInfoNoncached = this.getUserInfoNoncached(this.includeToken);

                getUserInfoNoncached.done(function (result) {
                    dfd.resolve(result);
                });

                getUserInfoNoncached.fail(function (result) {
                    dfd.reject(result);
                });

                return dfd.promise();
            }
        },

        getUserInfoNoncached: function (includeToken) {
            /// <summary>Get Information about the currently active (eventually logged in) user. This information is always requested from the api server</summary>
            var self = this;
            var dfd = $.Deferred();

            // If verhindert Skriptabbruch in (alten) Browsern die console.warn() nicht können und sonst JS Error werfen.
            if (window.console)
                console.warn("getUserInfoUncached");

            var url = "/Account/UserInfo?apiKey=" + this.apiKey + "&includeToken=" + includeToken;

            // Dies ist ein nicht asyncroner Aufruf, es muss auf das Ergebnis gewartet werden, damit alle weiteren API-Aufrufen funktionieren.
            var getUserInfoNoncached = this.api({
                type: "GET",
                url: url,
                asyncCall: false
            });

            getUserInfoNoncached.done(function (result) {
                setLoginCookie(self.apiKey, result.Data);
                self.token = result.Data.Token;
                self.userInfo = result.Data;
                self.onLoginStateChanged.fire(result.Data);
                dfd.resolve(result);
            });

            getUserInfoNoncached.fail(function (result) {
                dfd.reject(result);
            });

            return dfd.promise();
        },

        putConsumer: function (params) {
            /// <summary>Stores attributes and transactions of a consumer</summary>
            /// <param name="consumer" type="Consumer">An instance of a consumer class containing the data to be stored</param>
            /// <param name="successCallBack" type="String">The callback function which is called if the api call was successful. function(status, data)</param>
            /// <param name="errorCallBack" type="String">The callback function which is called if an error occurred. function(status, statusText, responseText)</param>
            var url = "/Consumer";

            if (params.apiKey)
                url += "?apiKey=" + encodeURIComponent(params.apiKey);
            else if (!this.token) // wenn kein token vorhanden, übergeben wir den apiKey
                url += "?apiKey=" + encodeURIComponent(this.apiKey);

            if (params.behaviour != null) {
                if (url.indexOf("?") == -1)
                    url += "?behaviour=" + params.behaviour;
                else
                    url += "&behaviour=" + params.behaviour;
            }

            return this.api({
                type: "PUT",
                url: url,
                data: params.data
            });
        },

        postConsumer: function (params) {
            /// <summary>Stores attributes and transactions of a consumer</summary>
            /// <param name="consumer" type="Consumer">An instance of a consumer class containing the data to be stored</param>
            /// <param name="successCallBack" type="String">The callback function which is called if the api call was successful. function(status, data)</param>
            /// <param name="errorCallBack" type="String">The callback function which is called if an error occurred. function(status, statusText, responseText)</param>
            var url = "/Consumer";

            if (params.apiKey)
                url += "?apiKey=" + encodeURIComponent(params.apiKey);
            else if (!this.token) // wenn kein token vorhanden, übergeben wir den apiKey
                url += "?apiKey=" + encodeURIComponent(this.apiKey);

            if (params.behaviour != null) {
                if (url.indexOf("?") == -1)
                    url += "?behaviour=" + params.behaviour;
                else
                    url += "&behaviour=" + params.behaviour;
            }

            return this.api({
                type: "POST",
                url: url,
                data: params.data
            });
        },

        getConsumerAttributes: function (attributes) {
            /// <summary>Stores attributes and transactions of a consumer</summary>
            /// <param name="consumer" type="Consumer">An instance of a consumer class containing the data to be stored</param>
            /// <param name="successCallBack" type="String">The callback function which is called if the api call was successful. function(status, data)</param>
            /// <param name="errorCallBack" type="String">The callback function which is called if an error occurred. function(status, statusText, responseText)</param>

            return this.api({
                type: "GET",
                url: "/Consumer/Attributes?attributes=" + attributes
            });
        },


        getProtocol: function (jobId, successCallBack, errorCallBack) {
            /// <summary>Returns the protocol for a single job</summary>
            /// <param name="jobId" type="String">A valid job id</param>
            /// <param name="successCallBack" type="String">The callback function which is called if the api call was successful. function(status, data)</param>
            /// <param name="errorCallBack" type="String">The callback function which is called if an error occurred. function(status, statusText, responseText)</param>
            this.api("/Jobs/" + jobId, "GET", null, successCallBack, errorCallBack);
        },



        getCompleteSurvey: function (path) {
            /// <summary>Gets a complete survey</summary>
            /// <param name="data" type="Object">Complete path of the survey.</param>

            return this.api({
                type: "GET",
                url: "/Surveys?path=" + path,
            });
        },

        getGoldenQuestions: function (path) {
            /// <summary>Gets a complete survey</summary>
            /// <param name="data" type="Object">Complete path of the survey.</param>

            return this.api({
                type: "GET",
                url: "/Surveys?path=" + path,
            });
        },

        getNextQuestion: function (path) {
            /// <summary>Gets a complete survey</summary>
            /// <param name="data" type="Object">Complete path of the survey.</param>

            return this.api({
                type: "GET",
                url: "/Surveys?path=" + path,
            });
        },



        /// <field name="SurveyTemplate" type="Object">HTML Template for the complete survey.</field>
        SurveyTemplate: "<div class=\"cx-survey\"><form id=\"cx-survey-form\"><input type=\"hidden\" name=\"t_Source\" value=\"{Name}\" /><input type=\"hidden\" name=\"t_Display_Name\" value=\"{ParticipationTransaction}\" /><h1>{Title}</h1><h2>{SubTitle}</h2><p>{Description}</p><div>{Modules}</div><input type=\"submit\" value=\"Send\" /></form></div><script language=\"JavaScript\">$( \"#cx-survey-form\" ).submit(function( event ) { ProCampaignApiConsumer.postSurveyData(event); });</script>",

        /// <field name="ModuleTemplate" type="Object">HTML Template for each module</field>
        ModuleTemplate: "<div class=\"cx-module\"><h3>{Title}</h3><h4>{SubTitle}</h4><p>{Description}</p><div>{Questions}</div></div>",

        /// <field name="TextQuestionTemplate" type="Object">HTML Template fora question of type "text"</field>
        TextQuestionTemplate: "<div class=\"cx-question\"><h5>{Title}</h5><h6>{SubTitle}</h6><p>{Description}</p><input type=\"text\" name=\"{Attribute}\" /></div>",

        /// <field name="NumericQuestionTemplate" type="Object">HTML Template fora question of type "number"</field>
        NumericQuestionTemplate: "<div class=\"cx-question\"><h5>{Title}</h5><h6>{SubTitle}</h6><p>{Description}</p><input type=\"number\" name=\"{Attribute}\" /></div>",

        /// <field name="DateQuestionTemplate" type="Object">HTML Template for a question of type "date"</field>
        DateQuestionTemplate: "<div class=\"cx-question\"><h5>{Title}</h5><h6>{SubTitle}</h6><p>{Description}</p><input type=\"date\" name=\"{Attribute}\" /></div>",

        /// <field name="LookupQuestionTemplate" type="Object"></field>
        LookupQuestionTemplate: "<div class=\"cx-question\"><h5>{Title}</h5><h6>{SubTitle}</h6><p>{Description}</p>{Answers}</div>",

        /// <field name="LookupAnswerTemplate" type="Object"></field>
        LookupAnswerTemplate: "<div><input type=\"radio\" name=\"{Attribute}\" value=\"{Value}\" />{Title}</div>",

        /// <field name="MultipleLookupQuestionTemplate" type="Object"></field>
        MultipleLookupQuestionTemplate: "<div class=\"cx-question\"><h5>{Title}</h5><h6>{SubTitle}</h6><p>{Description}</p>{Answers}</div>",

        /// <field name="MultipleLookupAnswerTemplate" type="Object"></field>
        MultipleLookupAnswerTemplate: "<div><input type=\"checkbox\" name=\"{Attribute}\" value=\"{VALUE}\" />{Title}</div>",

        /// <field name="QuestionSetTemplate" type="Object"></field>
        QuestionSetTemplate: "<div class=\"cx-question\"><h5>{Title}</h5><h6>{SubTitle}</h6><p>{Description}</p><table class=\"cx-matrix\"><thead><tr><td></td>{ColumnHeaders}</tr></thead><tbody>{Questions}</tbody></table></div>",

        /// <field name="QuestionSetColumnHeaderTemplate" type="Object"></field>
        QuestionSetColumnHeaderTemplate: "<td>{Title}</td>",

        /// <field name="QuestionSetQuestionsTemplate" type="Object"></field>
        QuestionSetQuestionsTemplate: "<tr><td>{Title}</td>{Answers}</tr>",

        /// <field name="QuestionSetAnswersTemplate" type="Object"></field>
        QuestionSetAnswersTemplate: "<td><input type=\"radio\" name=\"{Attribute}\" value=\"{Value}\" /></td>",

        getCompleteSurveyHtml: function (survey) {
            /// <summary>Creates standard HTML for a given survey</summary>
            /// <param name="survey" type="Object">Survey Object requested via REST-API</param>

            var surveyHtml = this.SurveyTemplate;

            surveyHtml = surveyHtml.replace("{Title}", survey.Title);
            surveyHtml = surveyHtml.replace("{SubTitle}", survey.SubTitle);
            surveyHtml = surveyHtml.replace("{Description}", survey.Description);
            surveyHtml = surveyHtml.replace("{Modules}", this.getSurveyModulesHtml(survey));
            surveyHtml = surveyHtml.replace("{Name}", survey.Name);
            surveyHtml = surveyHtml.replace("{ParticipationTransaction}", survey.ParticipationTransactionDefinition.Name);

            return surveyHtml;

        },

        getSurveyModulesHtml: function (survey) {
            /// <summary>Generates HTML for the modules of a survey</summary>
            /// <param name="survey" type="Object">Survey Object requested via REST-API</param>

            var modulesHtml = "";
            for (var m = 0; m < survey.Modules.length; ++m) {
                var module = survey.Modules[m];
                modulesHtml += this.getHtmlForModule(module);
            }
            return modulesHtml;
        },

        getHtmlForModule: function (module) {
            /// <summary>Generates HTML for one module</summary>
            /// <param name="module" type="Object">Module Object requested via REST-API</param>

            var moduleHtml = this.ModuleTemplate;
            moduleHtml = moduleHtml.replace("{Title}", module.Title);
            moduleHtml = moduleHtml.replace("{SubTitle}", module.SubTitle);
            moduleHtml = moduleHtml.replace("{Description}", module.Description);

            var questionsHtml = "";

            if (module.Questions != null) {
                for (var q = 0; q < module.Questions.length; ++q) {
                    var question = module.Questions[q];
                    questionsHtml += this.getHtmlForQuestion(question);
                }
            }
            else {
                questionsHtml += "<hr/>"
            }
            moduleHtml = moduleHtml.replace("{Questions}", questionsHtml);
            return moduleHtml;
        },

        getHtmlForQuestion: function (question) {
            /// <summary>Generates the HTML for one question</summary>
            /// <param name="question" type="Object">The question object</param>

            var questionHtml = "";

            if (question.Questions == null || question.Questions.length == 0) {
                switch (question.QuestionType) {
                    case 0: // Text-Frage
                        questionHtml = this.TextQuestionTemplate;
                        break;
                    case 1: // Numerische Frage
                        questionHtml = this.NumericQuestionTemplate;
                        break;
                    case 2: // Datums-Frage
                        questionHtml = this.DateQuestionTemplate;
                        break;
                    case 3: // Lookup-Frage
                        questionHtml = this.getHtmlForLookupQuestion(question, this.LookupQuestionTemplate, this.LookupAnswerTemplate);
                        break;
                    case 4: // Multiple-Lookup-Frage
                        questionHtml = this.getHtmlForLookupQuestion(question, this.MultipleLookupQuestionTemplate, this.MultipleLookupAnswerTemplate);
                        break;
                }

                if (question.Attribute != null)
                    questionHtml = questionHtml.replace("{Attribute}", question.Attribute.Name);

            }
            else {
                // Question Set
                questionHtml = this.getHtmlForQuestionSet(question);

            }
            questionHtml = questionHtml.replace("{Title}", question.Title);
            questionHtml = questionHtml.replace("{SubTitle}", question.SubTitle);
            questionHtml = questionHtml.replace("{Description}", question.Description);
            return questionHtml;
        },

        getHtmlForLookupQuestion: function (question, questionTemplate, answerTemplate) {
            /// <summary>Generates the HTML for a lookup question</summary>
            /// <param name="question" type="Object">The question object</param>
            /// <param name="questionTemplate" type="Object">The HTML template for the question</param>
            /// <param name="answerTemplate" type="Object">The HTML template for each answer.</param>
            var questionHtml = questionTemplate;
            var allAnswers = "";
            for (var a = 0; a < question.Answers.length; ++a) {
                var answer = question.Answers[a];
                var answerHtml = answerTemplate;
                answerHtml = answerHtml.replace("{Attribute}", question.Attribute.Name);
                answerHtml = answerHtml.replace("{Value}", answer.Value);
                answerHtml = answerHtml.replace("{Title}", answer.Title);
                allAnswers += answerHtml;
            }
            questionHtml = questionHtml.replace("{Answers}", allAnswers);
            return questionHtml;
        },

        getHtmlForQuestionSet: function (question) {
            /// <summary>Generates the HTML for a question set (matrix)</summary>
            /// <param name="question" type="Object">The question object</param>
            var html = this.QuestionSetTemplate;
            html = html.replace("{ColumnHeaders}", this.getHtmlForQuestionSetColumnHeaders(question));
            html = html.replace("{Questions}", this.getHtmlForQuestionSetQuestions(question));
            return html;
        },

        getHtmlForQuestionSetColumnHeaders: function (question) {
            /// <summary>Generates the HTML for the column headers. The answers will be extracted from the first question of the set</summary>
            /// <param name="question" type="Object">The question object</param>

            // Die Überschriften nehmen wir aus der ersten Frage
            var answers = question.Questions[0].Answers;
            var html = "";
            for (var a = 0; a < answers.length; ++a) {
                var column = this.QuestionSetColumnHeaderTemplate;
                column = column.replace("{Title}", answers[a].Title);
                html += column;
            }
            return html;
        },

        getHtmlForQuestionSetQuestions: function (question) {
            /// <summary>Generates the HTML for the sub-questions of a question set.</summary>
            /// <param name="question" type="Object">The parent question object</param>
            var rows = "";
            for (var q = 0; q < question.Questions.length; ++q) {
                var row = this.QuestionSetQuestionsTemplate;
                row = row.replace("{Title}", question.Questions[q].Title);
                row = row.replace("{Answers}", this.getHtmlForSingleQuestionSetQuestion(question.Questions[q]));
                rows += row;
            }
            return rows;
        },

        getHtmlForSingleQuestionSetQuestion: function (question) {
            /// <summary>Generates the HTML for one sub-questions of a question set.</summary>
            /// <param name="question" type="Object">The sub-question object</param>
            var columns = "";
            for (var r = 0; r < question.Answers.length; ++r) {
                var col = this.QuestionSetAnswersTemplate;
                col = col.replace("{Attribute}", question.Attribute.Name);
                col = col.replace("{Value}", question.Answers[r].Value);
                columns += col;
            }
            return columns;
        },


        postSurveyData: function (event) {
            /// <summary>Reads the form data and posts it to ProCampaign as a consumer object. 
            /// Then call the call-back function to inform the client code.</summary>
            /// <param name="question" type="Object">The sub-question object</param>
            var data = $("#cx-survey-form").serializeArray();

            var consumer = {
                Source: "Survey REST-API",
                Attributes: [],
                Transactions: []
            };

            // Read form and create attributes and transaction
            for (var i = 0; i < data.length; ++i) {
                var obj = data[i];
                if (obj.name == "t_Source") {
                    consumer.Source = obj.value;
                }
                else if (obj.name == "t_Display_Name") {
                    if (obj.value != "") {
                        consumer.Transactions.push({
                            Name: obj.value
                        });
                    }
                }
                else if (obj.value != "") {
                    // Haben wir das Attribut schon? Zum Beispiel bei einem Multiple-Lookup-Attribut
                    var found = false;
                    for (var j = 0; j < consumer.Attributes.length; ++j) {
                        if (consumer.Attributes[j].Name == obj.name) {
                            found = true;
                            var value = consumer.Attributes[j].Value * 1;
                            value |= obj.value * 1;
                            consumer.Attributes[j].Value = value + "";
                        }
                    }
                    if (!found) {
                        consumer.Attributes.push({
                            "Name": obj.name,
                            "Value": obj.value
                        });
                    }
                }
            }

            // Daten speichern
            ProCampaignApiConsumer.postConsumer({
                data: consumer
            })

            // Aufrufer benachrichtigen, dass die Survey beendet wurde.
            $(document).trigger("CxEvent-SurveyDataStored", consumer);

            // Verhinder, dass der eigentliche POST-Request durchgeführt wird.
            event.preventDefault();
        },

        cancelSubscription: function(params) {
            /// <summary>Executes an newsletter cancellation for a e-mail.</summary>
            var url = "/Unsubscribe";

            if (params.apiKey)
                url += "?apiKey=" + encodeURIComponent(params.apiKey);
            else if (!this.token) // wenn kein token vorhanden, übergeben wir den apiKey
                url += "?apiKey=" + encodeURIComponent(this.apiKey);

            return this.api({
                type: "POST",
                url: url,
                data: params.data
            });
        },

        initialize: function () {
            var cookie = document.cookie["ProCampaignCID"];
            if (cookie != null) {
                this.cid = cookie.cid;
            }
        }
    }
}

if (ProCampaignApiConsumer == undefined) {
    var ProCampaignApiConsumer = new ProCampaignApiConsumerClass();

    $(document).ready(function () {
        ProCampaignApiConsumer.getUserInfo().done(function () {
            ProCampaignApiConsumer.onReady.fire();
        });
    });
}