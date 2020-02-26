'use strict';

angular.module('app')
  .controller('DashboardController', function ($rootScope, $scope, $err, $restAdmin, $app, ngTableParams, $location, $window) {

    $scope.loading = false;

    // Monthly stat of jobs
    $scope.jobMonthlyStat = [{ data: [], label: "All jobs", color: $app.color.secondary}];
    $scope.jobMonthlyChartOptions =  {
      colors: [$app.color.primary],
      xaxis:{ font: { color: '#a1a7ac' }, mode: "time", timeformat: "%d/%m", minTickSize: [1, "day"] },
      yaxis:{ font: { color: '#a1a7ac' }, tickDecimals:0 },
      grid: { hoverable: true, clickable: true, borderWidth: 0, color: '#dce5ec' },
      bars: { show: true, fill: true, barWidth: 20*60*60*1000},
      tooltip: true,
      tooltipOpts: { content: '<div class="job-stat-tooltip">%y new jobs on %x</div>', xDateFormat: "%d %b %Y", defaultTheme: false, shifts: { x: 10, y: -25 } }
    };

    $err.tryPromise($restAdmin.one('statistics/jobs').get()).then(function (result) {
      $scope.jobMonthlyStat[0].data = result.job_monthly_stat;
    });

    // Main Members listing
    $scope.expiring_members = new ngTableParams({
        page: 1,
        count: 10,
        sorting: {
          expire_at: 'asc',
          company_name: ''
        },
        filter: {
          expires_in: '7'
        }
      }, {
      total: 0,
      getData: function ($defer, params) {
        $scope.loading = true;
        $err.tryPromise($restAdmin.one('statistics/expiring', $scope.expiring_members.expires_in).get(params.url()))
          .then(function(response) {
            $scope.expiring_members.settings({total: response.paginator.total});
            $defer.resolve(response);
            $scope.loading = false;
          });
      }
    });

    $scope.expiring_insurances = new ngTableParams({
        page: 1,
        count: 10,
        sorting: {
          expire_at: 'asc',
          company_name: ''
        },
        filter: {
          expires_in: '7'
        }
      }, {
      total: 0,
      getData: function ($defer, params) {
        $scope.loading = true;
        $err.tryPromise($restAdmin.one('statistics/expiring_insurances', $scope.expiring_insurances.expires_in).get(params.url()))
          .then(function(response) {
            $scope.expiring_insurances.settings({total: response.paginator.total});
            $defer.resolve(response);
            $scope.loading = false;
          });
      }
    });


  });