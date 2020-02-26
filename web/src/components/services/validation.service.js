'use strict';

/**
 * This helper has nothing to do with angular, the only thing that make it to be here it's the application structure,
 * which seems to not support non-angular things.
 */
angular
    .module('app.components')
    .factory('$validation', function($notifier) {
        function handle(validation_messages) {
            clear();

            for (var key in validation_messages) {
                if (validation_messages.hasOwnProperty(key)) {
                    // jQuery is evil and we've been aware of that
                    var input = $('[name="'+key+'"], [ng-model$="'+key+'"], [data-ng-model$="'+key+'"]');
                    input.closest('.form-group').addClass('has-error validation-error');
                    var message = validation_messages[key].join('<br/>');
                    input.after('<div class="validation-message">'+message+'</div>');
                }
            }

            $notifier.error("You have some validation errros.");
        }

        function clear()
        {
            $('.validation-message').remove();
            $('.validation-error').removeClass('has-error validation-error');
        }

        return {
            handle: handle,
            clear: clear,
            performFromResponse: function(response) {
                handle(response.data);
            }
        }
    });


