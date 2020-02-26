'use strict';

angular.module('app')
  .controller('AdminTeamsEditController', function ($q, $scope, $state, $stateParams, $restAdmin, $notifier, $app, $err, $moment, ngTableParams, $timeout) {

    $scope.mode = 'Loading...';

    $scope.teamCreated = false;

    $scope.id = $stateParams.id || null;

    $scope.data = {};

    $scope.user = {
      roles_ids: [2]
    }

    $scope.isAdd = function () {
      return $scope.id === null;
    };

    $scope.isEdit = function () {
      return $scope.id !== null;
    };

    if ($scope.isAdd()) {
      $scope.mode = 'Add';
      $scope.data.expire_at = $moment().add(1, "M").toDate()
    }
    else {
      $err.tryPromise($restAdmin.one('teams', $scope.id).get()).then(function (data) {
        $scope.mode = 'Edit';
        $scope.data = $scope.team = data;
      });

      // ----------- MEMBERS
      $scope.teamMembers = new ngTableParams(
        angular.extend(
          {
            page: 1,
            count: 10,
            sorting: {
              name: 'asc'
            }
          }
        ), {
          total: 0,
          getData: function ($defer, params) {
            $err.tryPromise($restAdmin.one('teams', $scope.id).all('members').getList(params.url())).then(function (result) {
              $scope.teamMembers.settings({total: result.paginator.total});
              $defer.resolve(result);
            });
          }
        });

      // ----------- DOCUMENTS
      $scope.teamDocuments = new ngTableParams(
        angular.extend(
          {
            page: 1,
            count: 10,
            sorting: {
              name: 'asc'
            }
          }
        ), {
          total: 0,
          getData: function ($defer, params) {
            $err.tryPromise($restAdmin.one('teams', $scope.id).all('documents').getList(params.url())).then(function (result) {
              $scope.teamDocuments.settings({total: result.paginator.total});
              $defer.resolve(result);
            });
          }
        });

      // ----------- LOCATIONS
      $scope.teamLocations = new ngTableParams(
        angular.extend(
          {
            page: 1,
            count: 10,
            sorting: {
              name: 'asc'
            }
          }
        ), {
          total: 0,
          getData: function ($defer, params) {
            $err.tryPromise($restAdmin.one('teams', $scope.id).all('locations').getList(params.url())).then(function (result) {
              $scope.teamLocations.settings({total: result.paginator.total});
              $defer.resolve(result);
            });
          }
        });

      // ----------- FEEDBACK
      $scope.feedback = [];
      $err.tryPromise($restAdmin.one('teams', $scope.id).all('feedback').getList()).then(function (result) {
        $scope.feedback = result;
      });

      // ----------- NOTES
      $scope.notes = new ngTableParams(
        angular.extend(
            {
                page: 1,
                count: 10,
                sorting: {
                    name: 'asc'
                }
            }
        ), {
        total: 0,
        getData: function ($defer, params) {
            $err.tryPromise($restAdmin.one('teams', $scope.id).all('notes').getList(params.url())).then(function (result) {
                $scope.notes.settings({total: result.paginator.total});
                $defer.resolve(result);
            });
        }
      });

    }

    $scope.store = function () {
      $scope.teamCreated = true;
      $scope.data.expire_at = $moment($scope.data.expire_at).format();
      if ($scope.data.use_company_address) {
        $scope.data.invoice_address_line_1 = $scope.data.address_line_1;
        $scope.data.invoice_address_line_2 = $scope.data.address_line_2;
        $scope.data.invoice_town = $scope.data.town;
        $scope.data.invoice_county = $scope.data.county;
        $scope.data.invoice_postal_code = $scope.data.postal_code;
      }
      geocode($scope.data.address_line_1 + ' ' + $scope.data.town + ' ' + $scope.data.postal_code)
        .then(function(location) {
          if (null != location) {
            $scope.data.lat = location.geometry.location.lat();
            $scope.data.lng = location.geometry.location.lng();
          }
          storeTeam();
        })
        .catch(function() {
          storeTeam();
        })
      }

    function storeTeam() {
      $err.tryPromise($restAdmin.all('teams').post($scope.data)).then(function (response) {
        $notifier.success('Team created.');
        $scope.user.team_id = response[0].id;
        $err.tryPromise($restAdmin.all('users').post($scope.user)).then(function () {
          $notifier.success('Primary Member created.');
          $timeout(function() {
            $app.goTo('admin.teams');
          }, 400);
        }, function (error) {
          $notifier.error('Error while creating Primary Member.');
          $scope.userCreated = false;
        });
      }, function (error) {
        $scope.teamCreated = false;
      });
    }

    $scope.update = function () {
      $scope.data.expire_at = $moment($scope.data.expire_at).format();
      if ($scope.data.use_company_address) {
        $scope.data.invoice_address_line_1 = $scope.data.address_line_1;
        $scope.data.invoice_address_line_2 = $scope.data.address_line_2;
        $scope.data.invoice_town = $scope.data.town;
        $scope.data.invoice_county = $scope.data.county;
        $scope.data.invoice_postal_code = $scope.data.postal_code;
      }
      geocode($scope.data.address_line_1 + ' ' + $scope.data.town + ' ' + $scope.data.postal_code)
        .then(function(location) {
          if (null != location) {
            $scope.data.lat = location.geometry.location.lat();
            $scope.data.lng = location.geometry.location.lng();
          }
          $err.tryPromise($scope.data.put()).then(function () {
            $notifier.success('Team updated successfully.');
            $timeout(function() {
              $app.goTo('admin.teams');
            }, 400);
          });
        })
        .catch(function() {
          $err.tryPromise($scope.data.put()).then(function () {
            $notifier.success('Team updated successfully.');
            $timeout(function() {
              $app.goTo('admin.teams');
            }, 400);
          });
        })
    };

    function geocode(address) {

      var geocoder = new google.maps.Geocoder(),
        defer = $q.defer();

      if ($scope.data.lat > 0 || $scope.data.lng > 0) {
        console.log("won't geocode")
        defer.resolve(null)
      }

      geocoder.geocode({'address': address, 'region':  'uk'}, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          defer.resolve(results[0])
        } else {
          $notifier.error('Errors while Geolocating address: ' + status);
          defer.reject()
        }
      });

      return defer.promise
    }

    $scope.destroy = function () {
      $err.tryPromise($scope.data.remove()).then(function () {
        $app.goTo('admin.teams');
      });
    };

    $scope.cancel = function () {
      $app.skipTo('admin.teams');
    };

    $scope.updateExpiry = function() {
      if($scope.data.billing_frequency == '') {
        $scope.data.expire_at = $moment().add(1, "M").toDate();
      }

      if($scope.data.billing_frequency == '30') {
        $scope.data.expire_at = $moment().add(1, "M").toDate();
      }

      if($scope.data.billing_frequency == '90') {
        $scope.data.expire_at = $moment().add(3, "M").toDate();
      }

      if($scope.data.billing_frequency == '180') {
        $scope.data.expire_at = $moment().add(6, "M").toDate();
      }

      if($scope.data.billing_frequency == '365') {
        $scope.data.expire_at = $moment().add(12, "M").toDate();
      }
    }

    $scope.approveDocument = function (document) {
      document.status = 'approved';
      $err.tryPromise(document.put()).then(function () {
        $notifier.success('Document approved successfully');
        $scope.teamDocuments.reload().then(function() {
          $notifier.success('Document has been approved.');
        });
      });
    };

    $scope.destroyDocument = function (document) {
      $err.tryPromise(document.remove()).then(function () {
        $notifier.success('Document removed successfully');
        $scope.teamDocuments.reload()
      });
    };

    $scope.destroyLocation = function (location) {
      $err.tryPromise(location.remove()).then(function () {
        $notifier.success('Location removed successfully');
        $scope.teamLocations.reload()
      });
    };

    $scope.transferPrimaryUser = function (user) {
      $restAdmin.one('team', $scope.id).one('members', user.id).one('mark-as-primary').put().then(function () {
        $scope.teamMembers.reload().then(function () {
          $notifier.success('The primary user role was transferred.');
        });
      });
    };

    $scope.createDate = function(date) {
      return new Date(date);
    }

    $scope.destroyNote = function (note) {
      $err.tryPromise(note.remove()).then(function () {
          $notifier.success('Note removed successfully');
          $scope.notes.reload();
      });
    };
  });
