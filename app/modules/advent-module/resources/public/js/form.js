/**
 * Created by pavel on 24.2.17.
 */


(function ($, window, app, page) {

    var Form = {
        config: {
            liveFormWait: false, // 500
            sendForm: true,
            debug: false
        },

        init: function (config) {
            $.extend(this.config, config);

            this.bindFormsSubmit();
            this.initAfterPageLoad();

        },

        initAfterPageLoad: function () {
            // this.bindFormsSubmit();
        },

        bindFormsSubmit: function () {
            var self = this;

            $(document).on('submit', this.selectorForm, function (event) {
                event.preventDefault();

                var form = $(this);
                var url = form.attr('action');
                var historyUrl = $(this).data('form-href');

                if (Nette.validateForm(form.get(0))) {

                    var btn = $(this).find('[type="submit"]');
                    $(btn).prop('disabled', true);
                    // .text('Loading...');

                    /*
                     * analytics
                     */
                    /*
                    var QVal = form.find('[name=_q]').val();
                    var QKey = "Q" + QVal;
                    var rate = parseInt(form.find('[name^="questions"]:checked').val()) + 1;
                    dataLayer.push({ ga_event: 'click', eventCategory: 'button', pageview: '/advent-calendar-form', eventAction: 'send', eventLabel: 'form_send', eventValue: QKey + "=" + rate});
                    */


                    // window.location.href = "thank-you/";
                    // return;

                    if (self.config.sendForm) {
                        $.ajax({
                            type: "POST",
                            url: url,
                            data: form.serialize(), // serializes the form's elements.
                            success: function (payload) {

                                var html = payload.html ? payload.html : null;

                                if (url && historyUrl && html) {
                                    Page.updatePage(url, historyUrl, payload.html);
                                    // console.log(Page.payloads);
                                }

                                Page.switchPage(self.selectorForm, event);

                            },
                            fail: function (payload) {
                                console.log(payload);
                            }
                        });

                    } else {
                        Page.switchPage(self.selectorForm, event);
                    }

                    // console.log(Page.payloads);
                }
            });
        },


        selectorApp: app.selectorApp,
        selectorForm: "form.ajax-form"

    };

    $(function() {

        page.callbacksAfterPageLoad.push(function (e) {
            Form.initAfterPageLoad();
        });

        Form.init();
    });

    window.Form = Form;

})(jQuery, window, Application, Page);