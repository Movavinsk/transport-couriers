angular
    .module('app.components')
    .factory('$guard', function($restAuth, $state, $auth, $notifier, $rootScope) {

        var interval;
        var kicked;

        return {
            timeout: 5000,

            watch: function() {
                this.schedule();
                this.listen();
                this.listenRelogged();
            },

            tick: function() {
                if(interval) clearTimeout(interval);
                this.schedule();
            },

            listen: function() {
                var $guard = this;
                $rootScope.$on('guard.out', function(event, message) {
                    $guard.out(message);
                });
            },

            listenRelogged: function() {
                $rootScope.$on('auth.login', function(event, user) {
                    kicked = false;
                });
            },

            schedule: function()
            {
                interval = setTimeout(this.check.bind(this), this.timeout);
            },

            out: function(reason) {
                if(!kicked) {
                    kicked = true;
                    $auth.toGuest();
                    $state.transitionTo('login');
                    $notifier.warning(reason);
                }
            },

            check: function() {
                if($auth.isGuest()) {
                    this.tick();
                    return;
                }

                var $guard = this;
                $restAuth.one('guard').get().then(function(data) {
                    if(data.out) {
                        $guard.out(data.message);
                    }

                    $guard.tick();
                });
            }
        }
    });


