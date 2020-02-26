'use strict';

angular.module('app')
  .controller('UserWorkInvoiceController', function ($q, $scope, $state, modalParams, $moment, $restUser, $restApp, $notifier, $app, $err, $auth) {

    if (!modalParams.job_id) return;

    $scope.formSubmitted = false;

    $scope.job_id = modalParams.job_id || null;

    $scope.invoiceType = 'system';

    $err.tryPromise($restUser.one('jobs', $scope.job_id).get()).then(function (data) {
      $scope.job = data;
      $scope.data = {
        job_id: $scope.job.id,
        amount: $scope.job.bid.amount,
        to_company: $scope.job.user_info.team_info.company_name,
        to_address_line_1: $scope.job.user_info.team_info.invoice_details.invoice_address_line_1,
        to_address_line_2: $scope.job.user_info.team_info.invoice_details.invoice_address_line_2,
        to_town: $scope.job.user_info.team_info.invoice_details.invoice_town,
        to_county: $scope.job.user_info.team_info.invoice_details.invoice_county,
        to_postal_code: $scope.job.user_info.team_info.invoice_details.invoice_postal_code,
        from_logo: $scope.job.bid.user.team_info.invoice_details.invoice_logo,
        from_company: $scope.job.bid.user.team_info.company_name,
        from_address_line_1: $scope.job.bid.user.team_info.address_line_1,
        from_address_line_2: $scope.job.bid.user.team_info.address_line_2,
        from_town: $scope.job.bid.user.team_info.town,
        from_county: $scope.job.bid.user.team_info.county,
        from_postal_code: $scope.job.bid.user.team_info.postal_code,
        from_email: $scope.job.bid.user.email,
        from_phone: $scope.job.bid.user.phone,
        add_vat: $scope.job.bid.user.team_info.invoice_details.invoice_including_vat,
        invoice_footer: $scope.job.bid.user.team_info.invoice_details.invoice_footer_text,
        vat_number: $scope.job.bid.user.team_info.vat_number,
        pickup_point: $scope.job.pickup_point,
        destination_point: $scope.job.destination_point,
        invoice_date: $moment().format(),
        invoice_items: [],
        customer_job_reference_number: $scope.job.customer_job_reference_number,
        pickup_formatted_address: $scope.job.pickup_formatted_address,
        destination_formatted_address: $scope.job.destination_formatted_address
      };
    });

    $scope.addToInvoiceItems = function () {
      $scope.data.invoice_items.push({
        item: null,
        add_vat: false
      });
    };

    $scope.removeFromInvoiceItems = function (invoiceItem) {
      var i = $scope.data.invoice_items.indexOf(invoiceItem);
      if (i != -1) {
        $scope.data.invoice_items.splice(i, 1);
      }
    };

    $scope.store = function () {
      $scope.formSubmitted = true;
      $scope.data.manual = $scope.invoiceType == 'manual';
      $err.tryPromise($restUser.all('invoices').post($scope.data)).then(function () {
        $scope.job.status = 'invoice';
        $scope.job.status_date = $moment().format();
        $err.tryPromise($scope.job.put()).then(function () {
          $notifier.success("Invoice raised successfully");
          $scope.$close(true);
        }, function (error) {
          $scope.formSubmitted = false;
        });
      });
    };
  });
