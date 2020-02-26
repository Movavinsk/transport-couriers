"use strict";

var isDefined = angular.isDefined, isUndefined = angular.isUndefined, isFunction = angular.isFunction, isString = angular.isString, isObject = angular.isObject, isArray = angular.isArray, forEach = angular.forEach, extend = angular.extend, copy = angular.copy, equals = angular.equals, noop = angular.noop, identity = angular.identity, isDate = angular.isDate;

function tryDecodeURIComponent(value) {
    try {
        return decodeURIComponent(value);
    } catch (e) {}
}

function encodeUriQuery(val, pctEncodeSpaces) {
    return encodeURIComponent(val).replace(/%40/gi, "@").replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, pctEncodeSpaces ? "%20" : "+");
}

function encodeUriSegment(val) {
    return encodeUriQuery(val, true).replace(/%26/gi, "&").replace(/%3D/gi, "=").replace(/%2B/gi, "+");
}

function parseKeyValue(keyValue) {
    var obj = {}, key_value, key;
    forEach((keyValue || "").split("&"), function(keyValue) {
        if (keyValue) {
            key_value = keyValue.replace(/\+/g, "%20").split("=");
            key = tryDecodeURIComponent(key_value[0]);
            if (isDefined(key)) {
                var val = isDefined(key_value[1]) ? tryDecodeURIComponent(key_value[1]) : true;
                if (!hasOwnProperty.call(obj, key)) {
                    obj[key] = val;
                } else if (isArray(obj[key])) {
                    obj[key].push(val);
                } else {
                    obj[key] = [ obj[key], val ];
                }
            }
        }
    });
    return obj;
}

function toKeyValue(obj) {
    var parts = [];
    forEach(obj, function(value, key) {
        if (isArray(value)) {
            forEach(value, function(arrayValue) {
                parts.push(encodeUriQuery(key, true) + (arrayValue === true ? "" : "=" + encodeUriQuery(arrayValue, true)));
            });
        } else {
            parts.push(encodeUriQuery(key, true) + (value === true ? "" : "=" + encodeUriQuery(value, true)));
        }
    });
    return parts.length ? parts.join("&") : "";
}

function flattenParams(params) {
    var parts = {};
    for (var key in params) {
        if (params.hasOwnProperty(key)) {
            var item = params[key], name = encodeURIComponent(key);
            if (typeof item === "object") {
                for (var subkey in item) {
                    if (!isUndefined(item[subkey]) && item[subkey] !== "") {
                        var pname = name + "[" + encodeURIComponent(subkey) + "]";
                        parts[pname] = item[subkey];
                    }
                }
            } else if (!isFunction(item) && !isUndefined(item) && item !== "") {
                parts[name] = +encodeURIComponent(item);
            }
        }
    }
    return parts;
}

function chunk(arr, size) {
    var newArr = [];
    for (var i = 0; i < arr.length; i += size) {
        newArr.push(arr.slice(i, i + size));
    }
    return newArr;
}

function getMiles(i) {
    return (i * .000621371192).toFixed(2);
}

function getMeters(i) {
    return parseInt(i * 1609.344);
}

"use strict";

angular.module("app", [ "ngCookies", "ngSanitize", "ngAnimate", "ui.bootstrap", "ui.router", "ui.router.menus", "ui.select", "ui.utils", "restangular", "ngTable", "ngTableExport", "satellizer", "dialogs.main", "dialogs.default-translations", "ngStorage", "app.components", "app.components.models", "angularFileUpload", "ui.bootstrap-slider", "ui-rangeSlider", "uiGmapgoogle-maps", "ngImgCrop", "angular-flot", "angularMoment" ]).config([ "$locationProvider", "$urlRouterProvider", "$compileProvider", function($locationProvider, $urlRouterProvider, $compileProvider) {
    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise("/login");
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|tel):/);
} ]).run([ "$rootScope", "$app", "$state", "$auth", function($rootScope, $app, $state, $auth) {
    $rootScope.$app = $app;
    $rootScope.$state = $state;
    $rootScope._ = _;
    $rootScope.$auth = $auth;
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("admin", {
        abstract: true,
        url: "/admin",
        templateUrl: "src/admin/admin.html"
    });
} ]);

"use strict";

angular.module("app").controller("DashboardController", [ "$rootScope", "$scope", "$err", "$restAdmin", "$app", "ngTableParams", "$location", "$window", function($rootScope, $scope, $err, $restAdmin, $app, ngTableParams, $location, $window) {
    $scope.loading = false;
    $scope.jobMonthlyStat = [ {
        data: [],
        label: "All jobs",
        color: $app.color.secondary
    } ];
    $scope.jobMonthlyChartOptions = {
        colors: [ $app.color.primary ],
        xaxis: {
            font: {
                color: "#a1a7ac"
            },
            mode: "time",
            timeformat: "%d/%m",
            minTickSize: [ 1, "day" ]
        },
        yaxis: {
            font: {
                color: "#a1a7ac"
            },
            tickDecimals: 0
        },
        grid: {
            hoverable: true,
            clickable: true,
            borderWidth: 0,
            color: "#dce5ec"
        },
        bars: {
            show: true,
            fill: true,
            barWidth: 20 * 60 * 60 * 1e3
        },
        tooltip: true,
        tooltipOpts: {
            content: '<div class="job-stat-tooltip">%y new jobs on %x</div>',
            xDateFormat: "%d %b %Y",
            defaultTheme: false,
            shifts: {
                x: 10,
                y: -25
            }
        }
    };
    $err.tryPromise($restAdmin.one("statistics/jobs").get()).then(function(result) {
        $scope.jobMonthlyStat[0].data = result.job_monthly_stat;
    });
    $scope.expiring_members = new ngTableParams({
        page: 1,
        count: 10,
        sorting: {
            expire_at: "asc",
            company_name: ""
        },
        filter: {
            expires_in: "7"
        }
    }, {
        total: 0,
        getData: function($defer, params) {
            $scope.loading = true;
            $err.tryPromise($restAdmin.one("statistics/expiring", $scope.expiring_members.expires_in).get(params.url())).then(function(response) {
                $scope.expiring_members.settings({
                    total: response.paginator.total
                });
                $defer.resolve(response);
                $scope.loading = false;
            });
        }
    });
    $scope.expiring_insurances = new ngTableParams({
        page: 1,
        count: 10,
        sorting: {
            expire_at: "asc",
            company_name: ""
        },
        filter: {
            expires_in: "7"
        }
    }, {
        total: 0,
        getData: function($defer, params) {
            $scope.loading = true;
            $err.tryPromise($restAdmin.one("statistics/expiring_insurances", $scope.expiring_insurances.expires_in).get(params.url())).then(function(response) {
                $scope.expiring_insurances.settings({
                    total: response.paginator.total
                });
                $defer.resolve(response);
                $scope.loading = false;
            });
        }
    });
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("admin.dashboard", {
        url: "/dashboard",
        page: {
            title: "Dashboard",
            subTitle: "Temporary"
        },
        controller: "DashboardController",
        templateUrl: "src/admin/dashboard/dashboard.html",
        menu: {
            name: "Dashboard",
            class: "icon-home",
            tag: "admin",
            priority: 10
        }
    });
} ]);

"use strict";

angular.module("app").controller("AdminDocumentTypesEditController", [ "$q", "$scope", "$state", "$stateParams", "$restAdmin", "$notifier", "$app", "$err", function($q, $scope, $state, $stateParams, $restAdmin, $notifier, $app, $err) {
    $scope.mode = "Loading...";
    $scope.doctypeCreated = false;
    $scope.id = $stateParams.id || null;
    $scope.data = {};
    $scope.isAdd = function() {
        return $scope.id === null;
    };
    $scope.isEdit = function() {
        return $scope.id !== null;
    };
    if ($scope.isAdd()) {
        $scope.mode = "Add";
    } else {
        $err.tryPromise($restAdmin.one("doctypes", $scope.id).get()).then(function(data) {
            $scope.mode = "Edit";
            $scope.data = data;
        });
    }
    $scope.store = function() {
        $scope.doctypeCreated = true;
        $err.tryPromise($restAdmin.all("doctypes").post($scope.data)).then(function() {
            $app.goTo("admin.doctypes");
        }, function(error) {
            $scope.doctypeCreated = false;
        });
    };
    $scope.update = function() {
        $err.tryPromise($scope.data.put()).then(function() {
            $app.goTo("admin.doctypes");
        });
    };
    $scope.destroy = function() {
        $err.tryPromise($scope.data.remove()).then(function() {
            $app.goTo("admin.doctypes");
        });
    };
    $scope.cancel = function() {
        $app.skipTo("admin.doctypes");
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("admin.doctypes.add", {
        url: "/new",
        page: {
            title: "DocumentTypes",
            class: "icon-doc",
            description: "Manage the document types"
        },
        controller: "AdminDocumentTypesEditController",
        templateUrl: "src/admin/doctypes/edit/edit.html",
        menu: {
            name: "Document Type",
            class: "icon-doc",
            tag: "action"
        }
    }).state("admin.doctypes.edit", {
        url: "/edit/{id}",
        page: {
            title: "DocumentTypes",
            class: "icon-doc",
            description: "Manage the document types"
        },
        controller: "AdminDocumentTypesEditController",
        templateUrl: "src/admin/doctypes/edit/edit.html"
    });
} ]);

"use strict";

angular.module("app").controller("AdminDocumentTypesController", [ "$rootScope", "$state", "$scope", "$q", "$location", "$filter", "$err", "ngTableParams", "$restAdmin", "$notifier", function($rootScope, $state, $scope, $q, $location, $filter, $err, ngTableParams, $restAdmin, $notifier) {
    $scope.tableParams = new ngTableParams(angular.extend({
        page: 1,
        count: 10,
        sorting: {
            created_at: "desc"
        }
    }, $location.search()), {
        total: 0,
        getData: function($defer, params) {
            $location.search(params.url());
            $err.tryPromise($restAdmin.all("doctypes").getList(params.url())).then(function(result) {
                $scope.tableParams.settings({
                    total: result.paginator.total
                });
                $defer.resolve(result);
            });
        }
    });
    $scope.remove = function(doctype) {
        doctype.remove();
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("admin.doctypes", {
        url: "/doctypes",
        preserveQueryParams: true,
        page: {
            title: "Document Types",
            class: "icon-doc",
            description: "Manage the document types"
        },
        controller: "AdminDocumentTypesController",
        templateUrl: "src/admin/doctypes/list.html",
        menu: {
            name: "Document Types",
            class: "icon-doc",
            tag: "admin",
            priority: 3
        }
    });
} ]);

"use strict";

angular.module("app").controller("AdminFeedbackController", [ "$scope", "$location", "$err", "$restAdmin", "ngTableParams", function($scope, $location, $err, $restAdmin, ngTableParams) {
    $scope.tableParams = new ngTableParams(angular.extend({
        page: 1,
        count: 10,
        sorting: {
            created_at: "desc"
        }
    }, $location.search()), {
        total: 0,
        getData: function($defer, params) {
            $location.search(params.url());
            $err.tryPromise($restAdmin.all("feedbacks").getList(params.url())).then(function(result) {
                $scope.tableParams.settings({
                    total: result.paginator.total
                });
                $defer.resolve(result);
            });
        }
    });
    $scope.delete = function(feedback) {
        if (confirm("Are you sure?")) {
            feedback.remove().then(function() {
                $scope.tableParams.reload();
            });
        }
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("admin.feedbacks", {
        url: "/feedback",
        page: {
            title: "Feedbacks",
            class: "icon-layers"
        },
        controller: "AdminFeedbackController",
        templateUrl: "src/admin/feedback/feedback.html",
        menu: {
            name: "Feedbacks",
            class: "icon-star",
            tag: "admin",
            priority: 9
        }
    });
} ]);

"use strict";

angular.module("app").controller("AdminJobsBidsEditController", [ "$q", "$scope", "$state", "modalParams", "$restAdmin", "$restApp", "$notifier", "$app", "$err", "$moment", function($q, $scope, $state, modalParams, $restAdmin, $restApp, $notifier, $app, $err, $moment) {
    $scope.job_id = modalParams.job_id || null;
    $scope.bid_id = modalParams.bid_id || null;
    $scope.mode = "Loading...";
    $scope.isAdd = function() {
        return $scope.bid_id === null;
    };
    $scope.isEdit = function() {
        return $scope.bid_id !== null;
    };
    $scope.data = {
        job_id: $scope.job_id
    };
    if ($scope.isAdd()) {
        $scope.mode = "Add";
        $scope.data.bid_date = $moment().toDate();
    } else {
        $err.tryPromise($restAdmin.one("bids", $scope.bid_id).get()).then(function(data) {
            $scope.mode = "Edit";
            $scope.data = data;
            $scope.data.amount = parseFloat(data.amount);
        });
    }
    $scope.store = function() {
        $err.tryPromise($restAdmin.all("bids").post($scope.data)).then(function() {
            $scope.$close(true);
        });
    };
    $scope.update = function() {
        $err.tryPromise($scope.data.put()).then(function() {
            $scope.$close(true);
        });
    };
    $scope.destroy = function() {
        $err.tryPromise($scope.data.remove()).then(function() {
            $scope.$close(true);
        });
    };
    $scope.cancel = function() {
        $scope.$dismiss();
    };
    $scope.$watch("data.user_id", function(newValue) {
        $err.tryPromise($restAdmin.one("users", newValue).get()).then(function(data) {
            $scope.user = data;
        });
    });
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("admin.jobs.bids.add", {
        url: "/new/{job_id}",
        page: {
            title: "Job Bids",
            class: "icon-layers",
            description: "Manage all bids for job"
        },
        modal: "lg",
        controller: "AdminJobsBidsEditController",
        templateUrl: "src/admin/jobs/bids/edit/edit.html"
    }).state("admin.jobs.bids.edit", {
        url: "/edit/{bid_id}",
        page: {
            title: "Job Bids",
            class: "icon-layers",
            description: "Manage all bids for job"
        },
        modal: "lg",
        controller: "AdminJobsBidsEditController",
        templateUrl: "src/admin/jobs/bids/edit/edit.html"
    });
} ]);

"use strict";

angular.module("app").controller("AdminJobBidsController", [ "$rootScope", "$state", "$stateParams", "$scope", "$q", "$location", "$filter", "$err", "ngTableParams", "$restAdmin", "$notifier", function($rootScope, $state, $stateParams, $scope, $q, $location, $filter, $err, ngTableParams, $restAdmin, $notifier) {
    if (!$stateParams.id) return;
    $scope.job_id = $stateParams.id || null;
    $scope.tableParams = new ngTableParams(angular.extend({
        page: 1,
        count: 10,
        sorting: {
            bid_date: "desc"
        },
        filter: {
            job_id: $scope.job_id
        }
    }), {
        total: 0,
        getData: function($defer, params) {
            $location.search(params.url());
            $err.tryPromise($restAdmin.all("bids").getList(params.url())).then(function(result) {
                $scope.tableParams.settings({
                    total: result.paginator.total
                });
                $defer.resolve(result);
            });
        }
    });
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("admin.jobs.bids", {
        url: "/{id}/bids",
        preserveQueryParams: true,
        page: {
            title: "Job Bids",
            class: "icon-layers",
            description: "Manage all bids for job"
        },
        controller: "AdminJobBidsController",
        templateUrl: "src/admin/jobs/bids/list.html"
    });
} ]);

"use strict";

angular.module("app").controller("AdminJobsEditController", [ "$q", "$scope", "$filter", "$state", "$stateParams", "$restUser", "$restApp", "$auth", "$notifier", "$app", "$err", "$geo", "$moment", "uiGmapGoogleMapApi", "uiGmapIsReady", function($q, $scope, $filter, $state, $stateParams, $restUser, $restApp, $auth, $notifier, $app, $err, $geo, $moment, uiGmapGoogleMapApi, uiGmapIsReady) {
    $scope.mode = "Loading...";
    $scope.type = function() {
        if ($stateParams.repost_job != null) {
            return "repost";
        }
        if ($stateParams.edit_job != null) {
            return "edit";
        }
        return "new";
    };
    function getDefaultDate(plus, reset) {
        var time = $moment();
        if (reset) {
            time.hour(8).minute(0).second(0);
        }
        time.add(plus, "d");
        return time.toDate();
    }
    var dateFormat = "YYYY-MM-DD HH:mm:ss";
    $scope.formSubmited = false;
    $scope.minDate = $moment().toDate();
    $scope.data = {
        user_id: "",
        priority: 3,
        pickup_date: getDefaultDate(0),
        destination_date: getDefaultDate(1, true),
        expiry_time: $moment().add(1, "d").toDate(),
        additional_options: [],
        way_points: [],
        pickup_postcode_prefix: "",
        pickup_town: "",
        destination_postcode_prefix: "",
        destination_town: ""
    };
    const getAddressComponents = function(newVal, town, postcode, address) {
        if (!newVal) return;
        newVal.address_components.forEach(function(address_component) {
            address_component.types.forEach(function(type) {
                if (type == "postal_town") {
                    $scope.data[town] = address_component.long_name;
                }
                if (type == "postal_code") {
                    $scope.data[postcode] = address_component.long_name.split(" ")[0];
                }
                if ($scope.data.pickup_town == "" && type == "locality") {
                    $scope.data[town] = address_component.long_name;
                }
            });
        });
        $scope.data[address] = newVal.formatted_address;
    };
    $scope.$watch("data.pickup_details", function(newVal) {
        getAddressComponents(newVal, "pickup_town", "pickup_postcode_prefix", "pickup_formatted_address");
    });
    $scope.$watch("data.destination_details", function(newVal) {
        getAddressComponents(newVal, "destination_town", "destination_postcode_prefix", "destination_formatted_address");
    });
    $err.tryPromise($restApp.all("options").getList()).then(function(data) {
        $scope.vehicle_options = data;
    });
    $scope.toggleSelection = function(option) {
        var idx = $scope.data.additional_options.indexOf(option);
        if (idx > -1) {
            $scope.data.additional_options.splice(idx, 1);
        } else {
            $scope.data.additional_options.push(option);
        }
    };
    $err.tryPromise($restApp.all("vehicles").getList({
        "sorting[size]": "asc",
        count: -1
    })).then(function(data) {
        $scope.vehicles = data;
    });
    $scope.user = $auth.user();
    $scope.addToWayPoints = function() {
        $scope.data.way_points.push({
            way_point: null,
            stopoff_date: new Date()
        });
    };
    $scope.removeFromWayPoints = function(wayPoint) {
        var i = $scope.data.way_points.indexOf(wayPoint);
        if (i != -1) {
            $scope.data.way_points.splice(i, 1);
        }
    };
    $scope.store = function() {
        var pickup_date = $scope.data.pickup_date;
        var destination_date = $scope.data.destination_date;
        var expiry_time = $scope.data.expiry_time;
        var pickup_date_end = $scope.data.pickup_date_end;
        var destination_date_end = $scope.data.destination_date_end;
        if ($scope.data.pickup_latitude == undefined || $scope.data.destination_latitude == undefined) {
            $notifier.error("Location not registered. Please select locations from the dropdown.");
            return;
        }
        $scope.data.pickup_date = $moment($scope.data.pickup_date).format(dateFormat);
        $scope.data.destination_date = $moment($scope.data.destination_date).format(dateFormat);
        $scope.data.expiry_time = $moment($scope.data.expiry_time).format(dateFormat);
        $scope.data.pickup_date_end = $moment($scope.data.pickup_date_end).isValid() ? $moment($scope.data.pickup_date_end).format(dateFormat) : null;
        $scope.data.destination_date_end = $moment($scope.data.destination_date_end).isValid() ? $moment($scope.data.destination_date_end).format(dateFormat) : null;
        $scope.formSubmited = true;
        if ($scope.type() == "new" || $scope.type() == "repost") {
            $err.tryPromise($restUser.all("jobs").post($scope.data)).then(function() {
                $notifier.success("Job posted successfully");
                $app.goTo("admin.jobs");
            }, function(error) {
                $scope.data.pickup_date = pickup_date;
                $scope.data.destination_date = destination_date;
                $scope.data.expiry_time = expiry_time;
                $scope.data.pickup_date_end = pickup_date_end;
                $scope.data.destination_date_end = destination_date_end;
                $scope.formSubmited = false;
            });
        }
        if ($scope.type() == "edit") {
            $err.tryPromise($restUser.one("jobs", $scope.data.id).patch($scope.data)).then(function() {
                $notifier.success("Job edited successfully");
                $app.goTo("admin.jobs");
            }, function(error) {
                $scope.data.pickup_date = pickup_date;
                $scope.data.destination_date = destination_date;
                $scope.data.expiry_time = expiry_time;
                $scope.data.pickup_date_end = pickup_date_end;
                $scope.data.destination_date_end = destination_date_end;
                $scope.formSubmited = false;
            });
        }
    };
    $scope.cancel = function() {
        $app.goTo("admin.jobs");
    };
    $scope.destroy = function() {
        $err.tryPromise($restUser.one("jobs", $scope.data.id).remove()).then(function() {
            $notifier.success("Job deleted successfully");
            $app.goTo("admin.jobs");
        });
    };
    $scope.$watch("data.flexible_pickup", function(newVal) {
        if (newVal) {
            $scope.data.pickup_date_end = $scope.data.pickup_date;
        }
    });
    $scope.$watch("data.flexible_destination", function(newVal) {
        if (newVal) {
            $scope.data.destination_date_end = $scope.data.destination_date;
        }
    });
    $scope.directionsService = new google.maps.DirectionsService();
    $scope.directionsDisplay = new google.maps.DirectionsRenderer();
    $scope.map = {
        center: {
            latitude: 51.5073509,
            longitude: -.12775829999998223
        },
        zoom: 10,
        bounds: {},
        polyLines: []
    };
    $scope.mapOptions = {
        scrollwheel: false
    };
    $scope.$watch("data.pickup_latitude", function(newVal) {
        if (newVal && $scope.data.destination_latitude) {
            $scope.setMapDirections();
        }
    });
    $scope.$watch("data.destination_latitude", function(newVal) {
        if (newVal && $scope.data.pickup_latitude) {
            $scope.setMapDirections();
        }
    });
    $scope.setUserId = function($item, $model) {
        $scope.data.user_id = $item.id;
        $scope.data.user_info = $item;
    };
    $scope.getUsers = function(value) {
        return $restUser.all("user").getList(flattenParams({
            filters: {
                search: value,
                inactivated: 0
            }
        })).then(function(result) {
            return result.plain();
        });
    };
    $scope.setMapDirections = function() {
        uiGmapIsReady.promise().then(function(instances) {
            var instanceMap = instances[0].map;
            $scope.directionsDisplay.setMap(instanceMap);
            var directionsServiceRequest = {
                origin: new google.maps.LatLng($scope.data.pickup_latitude, $scope.data.pickup_longitude),
                destination: new google.maps.LatLng($scope.data.destination_latitude, $scope.data.destination_longitude),
                travelMode: google.maps.TravelMode["DRIVING"],
                optimizeWaypoints: true
            };
            $scope.directionsService.route(directionsServiceRequest, function(response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    $scope.directionsDisplay.setDirections(response);
                    $scope.data.distance = response.routes[0].legs[0].distance.value;
                    $scope.data.duration = response.routes[0].legs[0].duration.text;
                    $scope.drivingDistance = getMiles(response.routes[0].legs[0].distance.value);
                }
            });
        });
    };
    if ($stateParams.repost_job != null) {
        setTimeout(function() {
            $stateParams.repost_job.user_id = $stateParams.repost_job.user_info.id;
            $scope.data = $stateParams.repost_job;
            $scope.data.pickup_date = getDefaultDate(0);
            $scope.data.destination_date = getDefaultDate(1, true);
            $scope.data.expiry_time = $moment().add(1, "d").toDate();
            delete $scope.data.status;
        }, 150);
    }
    if ($stateParams.edit_job != null) {
        setTimeout(function() {
            $stateParams.edit_job.user_id = $stateParams.edit_job.user_info.id;
            $scope.data = $stateParams.edit_job;
        }, 150);
    }
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("admin.jobs.add", {
        url: "/new",
        page: {
            title: "Jobs",
            class: "icon-layers",
            description: "Manage all jobs"
        },
        controller: "AdminJobsEditController",
        templateUrl: "src/admin/jobs/edit/edit.html",
        menu: {
            name: "Job",
            class: "icon-layers",
            tag: "action"
        },
        params: {
            repost_job: null
        }
    }).state("admin.jobs.edit", {
        url: "/edit/{id}",
        page: {
            title: "Jobs",
            class: "icon-layers",
            description: "Manage all jobs"
        },
        controller: "AdminJobsEditController",
        templateUrl: "src/admin/jobs/edit/edit.html",
        params: {
            edit_job: null
        }
    });
} ]);

"use strict";

angular.module("app").controller("AdminJobsController", [ "$rootScope", "$state", "$scope", "$q", "$location", "$filter", "$err", "ngTableParams", "$restAdmin", "$notifier", function($rootScope, $state, $scope, $q, $location, $filter, $err, ngTableParams, $restAdmin, $notifier) {
    $scope.tableParams = new ngTableParams(angular.extend({
        page: 1,
        count: 10,
        sorting: {
            created_at: "desc"
        }
    }, $location.search()), {
        total: 0,
        getData: function($defer, params) {
            $location.search(params.url());
            $err.tryPromise($restAdmin.all("jobs").getList(params.url())).then(function(result) {
                $scope.tableParams.settings({
                    total: result.paginator.total
                });
                $defer.resolve(result);
            });
        }
    });
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("admin.jobs", {
        url: "/jobs",
        preserveQueryParams: true,
        page: {
            title: "Jobs",
            class: "icon-layers",
            description: "Manage all jobs"
        },
        controller: "AdminJobsController",
        templateUrl: "src/admin/jobs/list.html",
        menu: {
            name: "Jobs",
            class: "icon-layers",
            tag: "admin",
            priority: 9
        }
    });
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("admin.partners.edit.benefits", {
        url: "/benefits",
        preserveQueryParams: true,
        page: {
            title: "Benefits",
            class: "fa fa-heart",
            description: "Manage Benefits"
        }
    });
} ]);

"use strict";

angular.module("app").controller("AdminPartnerBenefitController", AdminPartnerBenefitController);

AdminPartnerBenefitController.$inject = [ "$scope", "modalParams", "$restAdmin", "$err", "$notifier", "$app" ];

function AdminPartnerBenefitController($scope, modalParams, $restAdmin, $err, $notifier, $app) {
    if (!modalParams.partner_id) return;
    $scope.partner_id = modalParams.partner_id || null;
    $scope.benefit_id = modalParams.benefit_id || null;
    if ($scope.benefit_id) {
        $scope.mode = "edit";
    } else {
        $scope.mode = "add";
    }
    if ($scope.mode === "add") {
        $scope.benefit = {
            url: "http://"
        };
    } else {
        $err.tryPromise($restAdmin.one("partners", $scope.partner_id).one("benefits", $scope.benefit_id).get()).then(function(result) {
            $scope.benefit = result;
        });
    }
    $scope.store = function() {
        if (!/^http/.test($scope.benefit.url)) {
            $scope.benefit.url = $scope.benefit.url.replace(/^/, "http://");
        }
        if ($scope.mode === "add") {
            $err.tryPromise($restAdmin.one("partners", $scope.partner_id).post("benefits", $scope.benefit)).then(function(result) {
                $scope.$dismiss();
                $notifier.success("Benefit added.");
                $app.goTo("admin.partners");
            });
        } else {
            $err.tryPromise($scope.benefit.put()).then(function(result) {
                $scope.$dismiss();
                $notifier.success("Benefit updated.");
                $app.goTo("admin.partners");
            });
        }
    };
}

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("admin.partners.edit.benefits.edit", {
        url: "/{benefit_id}/edit",
        preserveQueryParams: true,
        page: {
            title: "Add/Edit Benefit",
            class: "fa fa-plus",
            description: "Add/Edit Benefits"
        },
        modal: "md",
        controller: "AdminPartnerBenefitController",
        templateUrl: "src/admin/partners/benefits/edit/edit.html"
    }).state("admin.partners.edit.benefits.add", {
        url: "/add",
        preserveQueryParams: true,
        page: {
            title: "Add Benefit",
            class: "fa fa-plus",
            description: "Edit Benefit"
        },
        modal: "md",
        controller: "AdminPartnerBenefitController",
        templateUrl: "src/admin/partners/benefits/edit/edit.html"
    });
} ]);

"use strict";

angular.module("app").controller("AdminPartnersEditController", AdminPartnersEditController);

AdminPartnersEditController.$inject = [ "$scope", "$restAdmin", "$stateParams", "$err", "ngTableParams", "$notifier", "$app" ];

function AdminPartnersEditController($scope, $restAdmin, $stateParams, $err, ngTableParams, $notifier, $app) {
    $scope.partner_id = $stateParams.partner_id || null;
    $scope.isAdd = function() {
        return $scope.partner_id === null;
    };
    $scope.isEdit = function() {
        return !!$scope.partner_id;
    };
    if ($scope.isAdd()) {
        $scope.mode = "Add";
        $scope.data = {};
    } else {
        $scope.mode = "Edit";
        $err.tryPromise($restAdmin.one("partners", $scope.partner_id).get()).then(function(data) {
            $scope.data = data;
            $scope.benefits = new ngTableParams(angular.extend({
                page: 1,
                count: 10,
                sorting: {
                    name: "asc"
                }
            }), {
                total: 0,
                getData: function($defer, params) {
                    $defer.resolve($scope.data.benefits);
                }
            });
        });
    }
    $scope.update = function() {
        $err.tryPromise($scope.data.put()).then(function() {
            $notifier.success("Partner details updated.");
            $app.goTo("admin.partners");
        });
    };
    $scope.store = function() {
        $err.tryPromise($restAdmin.all("partners").post($scope.data)).then(function(response) {
            $notifier.success("Partner details updated.");
            $app.goTo("admin.partners");
        }).catch(function(err) {
            $notifier.error("Errors while saving new Partner.");
        });
    };
    $scope.deactivate = function(benefit) {
        $scope.data.active = false;
        $scope.update();
    };
}

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("admin.partners.add", {
        url: "/new",
        page: {
            title: "Att a Partner",
            class: "fa fa-user",
            description: "Manage Partners"
        },
        controller: "AdminPartnersEditController",
        templateUrl: "src/admin/partners/edit/edit.html",
        menu: {
            name: "Partner",
            class: "fa fa-user",
            tag: "action"
        }
    }).state("admin.partners.edit", {
        url: "/edit/{partner_id}",
        page: {
            title: "Edit Partner",
            class: "fa fa-user",
            description: "Manage Partners"
        },
        controller: "AdminPartnersEditController",
        templateUrl: "src/admin/partners/edit/edit.html"
    });
} ]);

"use strict";

angular.module("app").controller("PartnerLogoController", PartnerLogoController);

PartnerLogoController.$inject = [ "$q", "$scope", "$state", "modalParams", "$restUser", "$notifier", "$app", "$err", "FileUploader", "$auth", "$restAdmin" ];

function PartnerLogoController($q, $scope, $state, modalParams, $restUser, $notifier, $app, $err, FileUploader, $auth, $restAdmin) {
    $scope.uploader = new FileUploader();
    $scope.partner_id = modalParams.partner_id || null;
    $scope.data = {
        partner_id: $scope.partner_id
    };
    $scope.myImage = "";
    $scope.store = function() {
        if ($scope.uploader.queue.length > 0) {
            var item = $scope.uploader.queue[0];
            item.url = $restAdmin.one("partners", $scope.partner_id).all("logo").getRestangularUrl();
            item.formData.push($scope.data);
            $scope.uploader.uploadItem(item);
        }
    };
    $scope.uploader.onAfterAddingFile = function(fileItem) {
        $scope.status = "loading";
        var file = fileItem._file;
        var reader = new FileReader();
        reader.onload = function(evt) {
            $scope.status = "loaded";
            $scope.$apply(function($scope) {
                $scope.myImage = evt.target.result;
            });
        };
        reader.readAsDataURL(file);
    };
    $scope.uploader.onBeforeUploadItem = function(item) {
        var blob = dataURItoBlob($scope.myImage);
        item._file = blob;
    };
    var dataURItoBlob = function(dataURI) {
        var binary = atob(dataURI.split(",")[1]);
        var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
        var array = [];
        for (var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        return new Blob([ new Uint8Array(array) ], {
            type: mimeString
        });
    };
    $scope.uploader.onProgressItem = function(fileItem, progress) {
        $scope.progress = progress;
    };
    $scope.uploader.onSuccessItem = function(fileItem, response, status, headers) {
        $notifier.success("Logo uploaded successfully");
        $scope.uploader.removeFromQueue(fileItem);
        $scope.$close(true);
    };
    $scope.uploader.onErrorItem = function() {
        $notifier.error("Something went wrong!");
    };
}

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("admin.partners.edit.logo", {
        url: "/logo",
        page: {
            title: "Manage Partner Logo",
            class: "icon-envelope",
            description: "Add/Edit Partner Logo"
        },
        modal: "lg",
        controller: "PartnerLogoController",
        templateUrl: "src/admin/partners/edit/logo/logo.html"
    });
} ]);

"use strict";

angular.module("app").controller("AdminPartnersController", AdminPartnersController);

AdminPartnersController.$inject = [ "$scope", "ngTableParams", "$restAdmin", "$location", "$err" ];

function AdminPartnersController($scope, ngTableParams, $restAdmin, $location, $err) {
    $scope.tableParams = new ngTableParams(angular.extend({
        page: 1,
        count: 10,
        sorting: {
            created_at: "desc"
        }
    }, $location.search()), {
        total: 0,
        getData: function($defer, params) {
            $location.search(params.url());
            $restAdmin.all("partners").getList(params.url()).then(function(result) {
                $scope.tableParams.settings({
                    total: result.paginator.total
                });
                $defer.resolve(result);
            });
        }
    });
}

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("admin.partners", {
        url: "/partners",
        preserveQueryParams: true,
        page: {
            title: "Partners",
            class: "fa fa-user",
            description: "Manage Partners"
        },
        controller: "AdminPartnersController",
        templateUrl: "src/admin/partners/partners.html",
        menu: {
            name: "Partners",
            class: "fa fa-user",
            tag: "admin",
            priority: 4
        }
    });
} ]);

"use strict";

angular.module("app").controller("AdminSettingsEmailController", [ "$scope", "$restAdmin", "$err", "$app", "$notifier", function($scope, $restAdmin, $err, $app, $notifier) {
    $scope.data = {};
    $err.tryPromise($restAdmin.one("settings", "mail").get()).then(function(data) {
        $scope.data = data;
    });
    $scope.store = function() {
        $err.tryPromise($restAdmin.all("settings").post($scope.data)).then(function() {
            $notifier.success("Settings updated");
        });
    };
    $scope.cancel = function() {
        $app.reload();
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("admin.settings.email", {
        url: "/email",
        page: {
            title: "Email settings",
            class: "icon-envelope",
            description: "Update your outbound email settings like smtp server, username, password, etc"
        },
        controller: "AdminSettingsEmailController",
        templateUrl: "src/admin/settings/email/email.html"
    });
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("admin.settings", {
        abstract: true,
        url: "/settings",
        template: "<div data-ui-view></div>"
    });
} ]);

"use strict";

angular.module("app").controller("AdminAddTeamDocumentController", [ "$q", "$scope", "$state", "modalParams", "$restUser", "$restApp", "$notifier", "$app", "$err", "FileUploader", "$moment", "$restAdmin", function($q, $scope, $state, modalParams, $restUser, $restApp, $notifier, $app, $err, FileUploader, $moment, $restAdmin) {
    if (!modalParams.id) return;
    $scope.mode = "add";
    $scope.team_id = modalParams.id || null;
    if (modalParams.document_id) {
        $scope.mode = "edit";
        $scope.document_id = modalParams.document_id;
    }
    $scope.uploader = new FileUploader();
    $scope.formSubmitted = false;
    var dateFormat = "YYYY-MM-DD HH:mm:ss";
    $scope.minDate = $moment().toDate();
    $scope.data = {
        team_id: $scope.team_id,
        user_id: undefined,
        type_id: 0,
        status: "pending"
    };
    $restUser.all("doctypes").getList().then(function(result) {
        $scope.doctypes = result;
        if ($scope.mode === "edit") {
            $restAdmin.one("teams", $scope.team_id).one("documents", $scope.document_id).get().then(function(data) {
                $scope.data = data;
                if (data.expiry === "0000-00-00") {
                    data.expiry = new $moment(new Date()).format(dateFormat);
                }
                $scope.data.selected_type = $scope.doctypes.filter(function(doctype) {
                    return doctype.id == $scope.data.type_id;
                })[0];
                $scope.file = {
                    name: data.upload
                };
            });
        }
    });
    $restUser.one("team", $scope.team_id).get().then(function(result) {
        $scope.team = result;
    });
    $scope.store = function() {
        $scope.formSubmitted = true;
        if ($scope.data.selected_type.expiry_required === 0) {
            $scope.data.expiry = "0000-00-00";
        } else {
            if ($scope.mode === "add") {
                $scope.data.expiry = $moment($scope.data.expiry).format(dateFormat);
            }
        }
        if ($scope.mode === "add") {
            if ($scope.uploader.queue.length > 0) {
                var item = $scope.uploader.queue[0];
                item.url = $restAdmin.one("teams", $scope.team_id).all("documents").getRestangularUrl();
                item.formData.push($scope.data);
                $scope.uploader.uploadItem(item);
            }
        } else {
            $scope.data.put().then(function() {
                $scope.formSubmitted = false;
                $notifier.success("Document successfully updated");
                $app.goTo("admin.teams.edit", {
                    id: $scope.team_id
                });
                $scope.$close(true);
            });
        }
    };
    $scope.uploader.onAfterAddingFile = function(fileItem) {
        $scope.file = {
            name: fileItem.file.name,
            size: fileItem.file.size
        };
    };
    $scope.uploader.onProgressItem = function(fileItem, progress) {
        $scope.progress = progress;
    };
    $scope.uploader.onSuccessItem = function(item, response, status, header) {
        $scope.formSubmitted = false;
        $notifier.success("Document uploaded successfully");
        $scope.uploader.removeFromQueue(item);
        $app.goTo("admin.users.add");
        $scope.$close(true);
    };
    $scope.uploader.onErrorItem = function() {
        $scope.formSubmitted = false;
        $notifier.error("Something went wrong!");
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("admin.teams.edit.adddocument", {
        url: "/documents/add",
        page: {
            title: "Add Document",
            class: "icon-envelope",
            description: "Upload document"
        },
        modal: "md",
        controller: "AdminAddTeamDocumentController",
        templateUrl: "src/admin/teams/edit/document/document.html"
    }).state("admin.teams.edit.editdocument", {
        url: "/edit/{document_id}",
        page: {
            title: "Edit Document",
            class: "icon-pencil",
            description: "Edit Document"
        },
        modal: "md",
        controller: "AdminAddTeamDocumentController",
        templateUrl: "src/admin/teams/edit/document/document.html"
    });
} ]);

"use strict";

angular.module("app").controller("AdminTeamsEditController", [ "$q", "$scope", "$state", "$stateParams", "$restAdmin", "$notifier", "$app", "$err", "$moment", "ngTableParams", "$timeout", function($q, $scope, $state, $stateParams, $restAdmin, $notifier, $app, $err, $moment, ngTableParams, $timeout) {
    $scope.mode = "Loading...";
    $scope.teamCreated = false;
    $scope.id = $stateParams.id || null;
    $scope.data = {};
    $scope.user = {
        roles_ids: [ 2 ]
    };
    $scope.isAdd = function() {
        return $scope.id === null;
    };
    $scope.isEdit = function() {
        return $scope.id !== null;
    };
    if ($scope.isAdd()) {
        $scope.mode = "Add";
        $scope.data.expire_at = $moment().add(1, "M").toDate();
    } else {
        $err.tryPromise($restAdmin.one("teams", $scope.id).get()).then(function(data) {
            $scope.mode = "Edit";
            $scope.data = $scope.team = data;
        });
        $scope.teamMembers = new ngTableParams(angular.extend({
            page: 1,
            count: 10,
            sorting: {
                name: "asc"
            }
        }), {
            total: 0,
            getData: function($defer, params) {
                $err.tryPromise($restAdmin.one("teams", $scope.id).all("members").getList(params.url())).then(function(result) {
                    $scope.teamMembers.settings({
                        total: result.paginator.total
                    });
                    $defer.resolve(result);
                });
            }
        });
        $scope.teamDocuments = new ngTableParams(angular.extend({
            page: 1,
            count: 10,
            sorting: {
                name: "asc"
            }
        }), {
            total: 0,
            getData: function($defer, params) {
                $err.tryPromise($restAdmin.one("teams", $scope.id).all("documents").getList(params.url())).then(function(result) {
                    $scope.teamDocuments.settings({
                        total: result.paginator.total
                    });
                    $defer.resolve(result);
                });
            }
        });
        $scope.teamLocations = new ngTableParams(angular.extend({
            page: 1,
            count: 10,
            sorting: {
                name: "asc"
            }
        }), {
            total: 0,
            getData: function($defer, params) {
                $err.tryPromise($restAdmin.one("teams", $scope.id).all("locations").getList(params.url())).then(function(result) {
                    $scope.teamLocations.settings({
                        total: result.paginator.total
                    });
                    $defer.resolve(result);
                });
            }
        });
        $scope.feedback = [];
        $err.tryPromise($restAdmin.one("teams", $scope.id).all("feedback").getList()).then(function(result) {
            $scope.feedback = result;
        });
        $scope.notes = new ngTableParams(angular.extend({
            page: 1,
            count: 10,
            sorting: {
                name: "asc"
            }
        }), {
            total: 0,
            getData: function($defer, params) {
                $err.tryPromise($restAdmin.one("teams", $scope.id).all("notes").getList(params.url())).then(function(result) {
                    $scope.notes.settings({
                        total: result.paginator.total
                    });
                    $defer.resolve(result);
                });
            }
        });
    }
    $scope.store = function() {
        $scope.teamCreated = true;
        $scope.data.expire_at = $moment($scope.data.expire_at).format();
        if ($scope.data.use_company_address) {
            $scope.data.invoice_address_line_1 = $scope.data.address_line_1;
            $scope.data.invoice_address_line_2 = $scope.data.address_line_2;
            $scope.data.invoice_town = $scope.data.town;
            $scope.data.invoice_county = $scope.data.county;
            $scope.data.invoice_postal_code = $scope.data.postal_code;
        }
        geocode($scope.data.address_line_1 + " " + $scope.data.town + " " + $scope.data.postal_code).then(function(location) {
            if (null != location) {
                $scope.data.lat = location.geometry.location.lat();
                $scope.data.lng = location.geometry.location.lng();
            }
            storeTeam();
        }).catch(function() {
            storeTeam();
        });
    };
    function storeTeam() {
        $err.tryPromise($restAdmin.all("teams").post($scope.data)).then(function(response) {
            $notifier.success("Team created.");
            $scope.user.team_id = response[0].id;
            $err.tryPromise($restAdmin.all("users").post($scope.user)).then(function() {
                $notifier.success("Primary Member created.");
                $timeout(function() {
                    $app.goTo("admin.teams");
                }, 400);
            }, function(error) {
                $notifier.error("Error while creating Primary Member.");
                $scope.userCreated = false;
            });
        }, function(error) {
            $scope.teamCreated = false;
        });
    }
    $scope.update = function() {
        $scope.data.expire_at = $moment($scope.data.expire_at).format();
        if ($scope.data.use_company_address) {
            $scope.data.invoice_address_line_1 = $scope.data.address_line_1;
            $scope.data.invoice_address_line_2 = $scope.data.address_line_2;
            $scope.data.invoice_town = $scope.data.town;
            $scope.data.invoice_county = $scope.data.county;
            $scope.data.invoice_postal_code = $scope.data.postal_code;
        }
        geocode($scope.data.address_line_1 + " " + $scope.data.town + " " + $scope.data.postal_code).then(function(location) {
            if (null != location) {
                $scope.data.lat = location.geometry.location.lat();
                $scope.data.lng = location.geometry.location.lng();
            }
            $err.tryPromise($scope.data.put()).then(function() {
                $notifier.success("Team updated successfully.");
                $timeout(function() {
                    $app.goTo("admin.teams");
                }, 400);
            });
        }).catch(function() {
            $err.tryPromise($scope.data.put()).then(function() {
                $notifier.success("Team updated successfully.");
                $timeout(function() {
                    $app.goTo("admin.teams");
                }, 400);
            });
        });
    };
    function geocode(address) {
        var geocoder = new google.maps.Geocoder(), defer = $q.defer();
        if ($scope.data.lat > 0 || $scope.data.lng > 0) {
            console.log("won't geocode");
            defer.resolve(null);
        }
        geocoder.geocode({
            address: address,
            region: "uk"
        }, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                defer.resolve(results[0]);
            } else {
                $notifier.error("Errors while Geolocating address: " + status);
                defer.reject();
            }
        });
        return defer.promise;
    }
    $scope.destroy = function() {
        $err.tryPromise($scope.data.remove()).then(function() {
            $app.goTo("admin.teams");
        });
    };
    $scope.cancel = function() {
        $app.skipTo("admin.teams");
    };
    $scope.updateExpiry = function() {
        if ($scope.data.billing_frequency == "") {
            $scope.data.expire_at = $moment().add(1, "M").toDate();
        }
        if ($scope.data.billing_frequency == "30") {
            $scope.data.expire_at = $moment().add(1, "M").toDate();
        }
        if ($scope.data.billing_frequency == "90") {
            $scope.data.expire_at = $moment().add(3, "M").toDate();
        }
        if ($scope.data.billing_frequency == "180") {
            $scope.data.expire_at = $moment().add(6, "M").toDate();
        }
        if ($scope.data.billing_frequency == "365") {
            $scope.data.expire_at = $moment().add(12, "M").toDate();
        }
    };
    $scope.approveDocument = function(document) {
        document.status = "approved";
        $err.tryPromise(document.put()).then(function() {
            $notifier.success("Document approved successfully");
            $scope.teamDocuments.reload().then(function() {
                $notifier.success("Document has been approved.");
            });
        });
    };
    $scope.destroyDocument = function(document) {
        $err.tryPromise(document.remove()).then(function() {
            $notifier.success("Document removed successfully");
            $scope.teamDocuments.reload();
        });
    };
    $scope.destroyLocation = function(location) {
        $err.tryPromise(location.remove()).then(function() {
            $notifier.success("Location removed successfully");
            $scope.teamLocations.reload();
        });
    };
    $scope.transferPrimaryUser = function(user) {
        $restAdmin.one("team", $scope.id).one("members", user.id).one("mark-as-primary").put().then(function() {
            $scope.teamMembers.reload().then(function() {
                $notifier.success("The primary user role was transferred.");
            });
        });
    };
    $scope.createDate = function(date) {
        return new Date(date);
    };
    $scope.destroyNote = function(note) {
        $err.tryPromise(note.remove()).then(function() {
            $notifier.success("Note removed successfully");
            $scope.notes.reload();
        });
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("admin.teams.add", {
        url: "/new",
        page: {
            title: "Members",
            class: "icon-user",
            description: "Manage all members"
        },
        controller: "AdminTeamsEditController",
        templateUrl: "src/admin/teams/edit/edit.html",
        menu: {
            name: "Members",
            class: "icon-users",
            tag: "action"
        }
    }).state("admin.teams.edit", {
        url: "/edit/{id}",
        page: {
            title: "Members",
            class: "icon-user",
            description: "Manage all members"
        },
        controller: "AdminTeamsEditController",
        templateUrl: "src/admin/teams/edit/edit.html"
    });
} ]);

"use strict";

angular.module("app").controller("AdminTeamLocationsEditController", [ "$q", "$auth", "$scope", "$state", "modalParams", "$restUser", "$notifier", "$app", "$err", "$location", "uiGmapIsReady", function($q, $auth, $scope, $state, modalParams, $restUser, $notifier, $app, $err, $location, uiGmapIsReady) {
    $scope.location_id = modalParams.location_id || null;
    $scope.team_id = modalParams.id || null;
    $scope.user_id = $location.search().user_id ? $location.search().user_id : $auth.user().id;
    $scope.formSubmitted = false;
    $scope.miles = [ {
        id: 5,
        name: "5 miles",
        zoom: 11
    }, {
        id: 10,
        name: "10 miles",
        zoom: 10
    }, {
        id: 20,
        name: "20 miles",
        zoom: 9
    }, {
        id: 50,
        name: "50 miles",
        zoom: 8
    } ];
    $scope.map = {
        control: {},
        center: {
            latitude: 51.5073509,
            longitude: -.12775829999998223
        },
        zoom: 10,
        options: {
            scrollwheel: false
        },
        circles: [ {
            id: 1
        } ],
        refresh: function(center) {
            $scope.map.control.refresh(center);
        }
    };
    $scope.$watch("data.latitude", function(newVal, oldVal) {
        if (newVal !== oldVal) {
            $scope.map.circles[0].center = {
                latitude: $scope.data.latitude,
                longitude: $scope.data.longitude
            };
            $scope.map.circles[0].radius = $scope.data.miles * 1609.344;
            $scope.map.refresh({
                latitude: $scope.data.latitude,
                longitude: $scope.data.longitude
            });
        }
    });
    $scope.$watch("data.miles", function(newVal, oldVal) {
        if (newVal !== oldVal) {
            var selected = $.grep($scope.miles, function(e) {
                return e.id == $scope.data.miles;
            });
            $scope.map.circles[0].radius = newVal * 1609.344;
            $scope.map.zoom = selected[0].zoom;
            $scope.map.refresh({
                latitude: $scope.data.latitude,
                longitude: $scope.data.longitude
            });
        }
    });
    $scope.isAdd = function() {
        return $scope.location_id === null;
    };
    $scope.isEdit = function() {
        return $scope.location_id !== null;
    };
    $restUser.one("team", $scope.team_id).get().then(function(team) {
        $scope.team = team;
    });
    if ($scope.isAdd()) {
        $scope.mode = "Add";
        $scope.data = {
            miles: 10
        };
    } else {
        $err.tryPromise($restUser.one("profile", $scope.user_id).one("locations", $scope.location_id).get()).then(function(data) {
            $scope.mode = "Edit";
            $scope.data = data;
            $scope.map.circles = [ {
                id: 1,
                center: {
                    latitude: data.latitude,
                    longitude: data.longitude
                },
                radius: $scope.data.miles * 1609.344
            } ];
            $scope.map.refresh({
                latitude: data.latitude,
                longitude: data.longitude
            });
        });
    }
    uiGmapIsReady.promise(1).then(function(instances) {
        $scope.map.refresh({
            latitude: 51.5073509,
            longitude: -.12775829999998223
        });
    });
    $scope.store = function() {
        $scope.formSubmitted = true;
        $scope.data.user_id = $scope.data.user_id || $scope.user_id;
        $err.tryPromise($restUser.one("profile", $scope.data.user_id).all("locations").post($scope.data)).then(function() {
            $notifier.success("Location added successfully");
            $app.goTo("user.account.profile.locations");
            $scope.$close(true);
            $scope.formSubmitted = false;
        });
    };
    $scope.update = function() {
        $scope.formSubmitted = true;
        $err.tryPromise($scope.data.put()).then(function() {
            $notifier.success("Location updated successfully");
            $app.goTo("user.account.profile.locations");
            $scope.$close(true);
            $scope.formSubmitted = false;
        });
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("admin.teams.edit.addlocation", {
        url: "/new",
        page: {
            title: "Add location",
            class: "icon-envelope",
            description: "Add new location"
        },
        modal: "md",
        controller: "AdminTeamLocationsEditController",
        templateUrl: "src/user/account/team/locations/edit/edit.html"
    }).state("admin.teams.edit.editlocation", {
        url: "/edit/{location_id}",
        page: {
            title: "Edit location",
            class: "icon-envelope",
            description: "Edit location"
        },
        modal: "md",
        controller: "AdminTeamLocationsEditController",
        templateUrl: "src/user/account/team/locations/edit/edit.html"
    });
} ]);

"use strict";

angular.module("app").controller("TeamLogoController", TeamLogoController);

TeamLogoController.$inject = [ "$q", "$scope", "$state", "modalParams", "$restUser", "$notifier", "$app", "$err", "FileUploader", "$auth", "$restAdmin" ];

function TeamLogoController($q, $scope, $state, modalParams, $restUser, $notifier, $app, $err, FileUploader, $auth, $restAdmin) {
    $scope.uploader = new FileUploader();
    $scope.team_id = modalParams.team_id || null;
    $scope.data = {
        team_id: $scope.team_id
    };
    $scope.myImage = "";
    $scope.store = function() {
        if ($scope.uploader.queue.length > 0) {
            var item = $scope.uploader.queue[0];
            item.url = $restAdmin.one("teams", $scope.team_id).all("logo").getRestangularUrl();
            item.formData.push($scope.data);
            $scope.uploader.uploadItem(item);
        }
    };
    $scope.uploader.onAfterAddingFile = function(fileItem) {
        $scope.status = "loading";
        var file = fileItem._file;
        var reader = new FileReader();
        reader.onload = function(evt) {
            $scope.status = "loaded";
            $scope.$apply(function($scope) {
                $scope.myImage = evt.target.result;
            });
        };
        reader.readAsDataURL(file);
    };
    $scope.uploader.onBeforeUploadItem = function(item) {
        var blob = dataURItoBlob($scope.myImage);
        item._file = blob;
    };
    var dataURItoBlob = function(dataURI) {
        var binary = atob(dataURI.split(",")[1]);
        var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
        var array = [];
        for (var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        return new Blob([ new Uint8Array(array) ], {
            type: mimeString
        });
    };
    $scope.uploader.onProgressItem = function(fileItem, progress) {
        $scope.progress = progress;
    };
    $scope.uploader.onSuccessItem = function(fileItem, response, status, headers) {
        $notifier.success("Avatar uploaded successfully");
        $scope.uploader.removeFromQueue(fileItem);
        if ($scope.user_id == $auth.user().id) {
            $auth.user().avatar_url = response.data.avatar + "?decache=" + Math.random();
        }
        $app.goTo("user.account.profile");
        $scope.$close(true);
    };
    $scope.uploader.onErrorItem = function() {
        $notifier.error("Something went wrong!");
    };
}

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("admin.teams.edit.logo", {
        url: "/{team_id}/logo",
        page: {
            title: "Manage Company Logo",
            class: "icon-envelope",
            description: "Add/Edit Logo"
        },
        modal: "lg",
        controller: "TeamLogoController",
        templateUrl: "src/admin/teams/edit/logo/logo.html"
    });
} ]);

"use strict";

angular.module("app").controller("AdminTeamNotesEditController", [ "$q", "$auth", "$scope", "$state", "modalParams", "$restUser", "$restAdmin", "$notifier", "$app", "$err", "$restApp", function($q, $auth, $scope, $state, modalParams, $restUser, $restAdmin, $notifier, $app, $err, $restApp) {
    $scope.team_id = modalParams.id || null;
    $scope.user_id = $auth.user().id;
    $scope.data = {
        user_id: $scope.user_id,
        team_id: $scope.team_id
    };
    $scope.formSubmitted = false;
    if (!modalParams.id) return;
    $scope.mode = "add";
    if (modalParams.note_id) {
        $scope.mode = "edit";
        $scope.note_id = modalParams.note_id;
        $err.tryPromise($restAdmin.one("teams", $scope.team_id).one("notes", $scope.note_id).get()).then(function(data) {
            $scope.data.content = data.content;
        });
    }
    $scope.store = function() {
        $scope.formSubmitted = true;
        if ($scope.mode === "add") {
            $restAdmin.one("teams", $scope.team_id).all("notes").post($scope.data).then(function() {
                $notifier.success("Notes added successfully");
                $scope.$close(true);
                $scope.formSubmitted = false;
            }, function(error) {
                $notifier.error("Something went wrong");
                if (typeof error.data === "object") {
                    return $scope.errors = _(error.data).values().flatten().value();
                }
            });
        } else {
            $restAdmin.one("teams", $scope.team_id).one("notes", $scope.note_id).put($scope.data).then(function() {
                $notifier.success("Notes updated successfully");
                $app.goTo("admin.teams.edit", {
                    id: $scope.team_id
                });
                $scope.$close(true);
                $scope.formSubmitted = false;
            }, function(error) {
                $notifier.error("Something went wrong");
                if (typeof error.data === "object") {
                    return $scope.errors = _(error.data).values().flatten().value();
                }
            });
        }
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("admin.teams.edit.addnote", {
        url: "/notes",
        page: {
            title: "Add note",
            class: "icon-envelope",
            description: "Add note"
        },
        modal: "md",
        controller: "AdminTeamNotesEditController",
        templateUrl: "src/admin/teams/edit/notes/edit.html"
    }).state("admin.teams.edit.editnote", {
        url: "/notes/edit/{note_id}",
        page: {
            title: "Edit note",
            class: "icon-envelope",
            description: "Edit note"
        },
        modal: "md",
        controller: "AdminTeamNotesEditController",
        templateUrl: "src/admin/teams/edit/notes/edit.html"
    });
} ]);

"use strict";

angular.module("app").controller("AdminTeamsController", [ "$rootScope", "$state", "$scope", "$q", "$location", "$filter", "$err", "ngTableParams", "$restAdmin", "$moment", function($rootScope, $state, $scope, $q, $location, $filter, $err, ngTableParams, $restAdmin, $moment) {
    $scope.tableParams = new ngTableParams(angular.extend({
        page: 1,
        count: 10,
        sorting: {
            name: "asc"
        }
    }, $location.search()), {
        total: 0,
        getData: function($defer, params) {
            $location.search(params.url());
            $err.tryPromise($restAdmin.all("teams").getList(params.url())).then(function(result) {
                $scope.tableParams.settings({
                    total: result.paginator.total
                });
                $defer.resolve(result);
            });
        }
    });
    $scope.deactivate = function(team) {
        team.is_expired = !team.is_expired;
        if (team.is_expired) {
            team.deactivated_at = $moment();
        } else {
            team.deactivated_at = null;
        }
        team.save();
    };
    $scope.toggleBidding = function(team) {
        team.can_bid = !!team.can_bid;
        team.save();
    };
    $scope.createDate = function(date) {
        return new Date(date);
    };
    $scope.updateType = function(team) {
        team.save();
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("admin.teams", {
        url: "/teams",
        preserveQueryParams: true,
        page: {
            title: "Members",
            class: "icon-user",
            description: "Manage all members"
        },
        controller: "AdminTeamsController",
        templateUrl: "src/admin/teams/list.html",
        menu: {
            name: "Members",
            class: "icon-users",
            tag: "admin",
            priority: 3
        }
    });
} ]);

"use strict";

angular.module("app").controller("AdminAddDocumentController", [ "$q", "$scope", "$state", "modalParams", "$restUser", "$restApp", "$notifier", "$app", "$err", "FileUploader", "$moment", "$restAdmin", function($q, $scope, $state, modalParams, $restUser, $restApp, $notifier, $app, $err, FileUploader, $moment, $restAdmin) {
    if (!modalParams.id) return;
    $scope.mode = "add";
    if (modalParams.document_id) {
        $scope.mode = "edit";
        $scope.document_id = modalParams.document_id;
    }
    $scope.user_id = modalParams.id || null;
    $scope.uploader = new FileUploader();
    $scope.formSubmitted = false;
    var dateFormat = "YYYY-MM-DD HH:mm:ss";
    $scope.data = {
        user_id: $scope.user_id,
        type_id: 0,
        status: "pending"
    };
    $restUser.all("doctypes").getList().then(function(result) {
        $scope.doctypes = result;
        if ($scope.mode === "edit") {
            $err.tryPromise($restAdmin.one("users", $scope.user_id).one("documents", $scope.document_id).get()).then(function(data) {
                $scope.data = data;
                $scope.data.selected_type = $scope.doctypes.filter(function(doctype) {
                    return doctype.id === $scope.data.type_id;
                })[0];
                $scope.file = {
                    name: data.upload
                };
            });
        }
    });
    $scope.store = function() {
        $scope.formSubmitted = true;
        if ($scope.data.selected_type.expiry_required === 0) {
            $scope.data.expiry = "0000-00-00 00:00:00";
        } else {
            $scope.data.expiry = $moment($scope.data.expiry).format(dateFormat);
        }
        if ($scope.mode === "add") {
            if ($scope.uploader.queue.length > 0) {
                var item = $scope.uploader.queue[0];
                item.url = $restUser.one("profile", $scope.user_id).all("documents").getRestangularUrl();
                item.formData.push($scope.data);
                $scope.uploader.uploadItem(item);
            }
        } else {
            $scope.data.put().then(function() {
                $scope.formSubmitted = false;
                $notifier.success("Document successfully updated");
                $app.goTo("admin.teams.edit", {
                    id: $scope.team_id
                });
                $scope.$close(true);
            });
        }
    };
    $scope.uploader.onAfterAddingFile = function(fileItem) {
        $scope.file = {
            name: fileItem.file.name,
            size: fileItem.file.size
        };
    };
    $scope.uploader.onProgressItem = function(fileItem, progress) {
        $scope.progress = progress;
    };
    $scope.uploader.onSuccessItem = function(item, response, status, header) {
        $scope.formSubmitted = false;
        $notifier.success("Document uploaded successfully");
        $scope.uploader.removeFromQueue(item);
        $app.goTo("admin.users.add");
        $scope.$close(true);
    };
    $scope.uploader.onErrorItem = function() {
        $scope.formSubmitted = false;
        $notifier.error("Something went wrong!");
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("admin.users.edit.adddocument", {
        url: "/documents/add",
        page: {
            title: "Add Document",
            class: "icon-envelope",
            description: "Upload document"
        },
        modal: "md",
        controller: "AdminAddDocumentController",
        templateUrl: "src/admin/users/edit/document/document.html"
    }).state("admin.users.edit.editdocument", {
        url: "/edit/{document_id}",
        page: {
            title: "Edit Document",
            class: "icon-pencil",
            description: "Edit Document"
        },
        modal: "md",
        controller: "AdminAddDocumentController",
        templateUrl: "src/admin/users/edit/document/document.html"
    });
} ]);

"use strict";

angular.module("app").controller("AdminUsersEditController", [ "$q", "$scope", "$state", "$stateParams", "$restAdmin", "$notifier", "$app", "$err", "ngTableParams", "$restApp", "$restUser", "$moment", function($q, $scope, $state, $stateParams, $restAdmin, $notifier, $app, $err, ngTableParams, $restApp, $restUser, $moment) {
    $scope.mode = "Loading...";
    $scope.userCreated = false;
    $scope.id = $stateParams.id || null;
    $scope.data = {
        roles_ids: []
    };
    $scope.settings = {
        vehicle_type: [ {
            label: "All Vehicles Sizes",
            value: "all"
        }, {
            label: "My vehicles only",
            value: "vehicle_only"
        }, {
            label: "Custom scale",
            value: "custom"
        } ],
        location: [ {
            label: "My Locations Only",
            value: "location_only"
        }, {
            label: "All Locations",
            value: "all"
        } ]
    };
    $err.tryPromise($restApp.all("vehicles").getList({
        "sorting[size]": "asc"
    })).then(function(vehicles) {
        $scope.min = vehicles[0].size;
        $scope.max = vehicles[vehicles.length - 1].size;
        $scope.vehiclesList = vehicles;
        $scope.vehiclesList = vehicles;
    });
    $scope.roles = [];
    $restAdmin.all("roles").getList().then(function(roles) {
        $scope.roles = roles;
        $scope.rolesIds = _.pluck(roles.plain(), "id");
        $scope.rolesIndexed = _.indexBy(roles.plain(), "id");
    });
    $scope.teams = [];
    var params = {
        page: "1",
        count: "-1",
        "sorting[company_name]": "asc"
    };
    $restAdmin.all("teamlist").getList(flattenParams(params)).then(function(teams) {
        $scope.teams = teams;
    });
    $scope.isAdd = function() {
        return $scope.id === null;
    };
    $scope.isEdit = function() {
        return $scope.id !== null;
    };
    if ($scope.isAdd()) {
        $scope.mode = "Add";
    } else {
        $err.tryPromise($restAdmin.one("users", $scope.id).get()).then(function(data) {
            $scope.mode = "Edit";
            $scope.data = data;
            $scope.can_use_client_api = data.can_use_client_api;
            if (data.team_id && data.team_id > 0) {
                $err.tryPromise($restAdmin.one("teams", data.team_id).get()).then(function(data) {
                    if ($scope.teams.length === 0) {
                        $scope.teams.push(data);
                    }
                });
            }
            $scope.data.settings.custom_max = data.settings.custom_max ? data.settings.custom_max : $scope.vehiclesList[$scope.vehiclesList.length - 1].size;
            $scope.data.settings.custom_min = data.settings.custom_min ? data.settings.custom_min : $scope.vehiclesList[0].size;
        });
        $scope.documents = new ngTableParams({
            page: 1,
            count: 5,
            sorting: {
                created_at: "desc"
            }
        }, {
            total: 0,
            getData: function($defer, params) {
                $err.tryPromise($restAdmin.one("users", $scope.id).all("documents").getList(params.url())).then(function(result) {
                    $scope.documents.settings({
                        total: result.paginator.total
                    });
                    $defer.resolve(result);
                });
            }
        });
        $scope.locations = new ngTableParams({
            page: 1,
            count: 5,
            sorting: {
                created_at: "desc"
            }
        }, {
            total: 0,
            getData: function($defer, params) {
                $err.tryPromise($restAdmin.one("users", $scope.id).all("locations").getList(params.url())).then(function(result) {
                    $scope.locations.settings({
                        total: result.paginator.total
                    });
                    $defer.resolve(result);
                });
            }
        });
        $scope.vehicles = new ngTableParams({
            page: 1,
            count: 5,
            sorting: {
                created_at: "desc"
            }
        }, {
            total: 0,
            getData: function($defer, params) {
                $err.tryPromise($restUser.one("profile", $scope.id).all("vehicles").getList()).then(function(owned) {
                    $scope.vehiclesOwned = owned;
                    $defer.resolve($scope.vehiclesList);
                });
            }
        });
        $scope.feedback = [];
        $err.tryPromise($restAdmin.one("users", $scope.id).all("feedback").getList()).then(function(result) {
            $scope.feedback = result;
        });
        $scope.api = [];
        $err.tryPromise($restAdmin.one("api-details", $scope.id).get()).then(function(result) {
            $scope.api = result;
        });
    }
    $scope.store = function() {
        $scope.userCreated = true;
        $err.tryPromise($restAdmin.all("users").post($scope.data)).then(function() {
            $app.goTo("admin.users");
        }, function(error) {
            $scope.userCreated = false;
        });
    };
    $scope.update = function() {
        $err.tryPromise($scope.data.patch()).then(function() {
            $app.goTo("admin.users");
        });
    };
    $scope.destroy = function() {
        $err.tryPromise($scope.data.remove()).then(function() {
            $app.goTo("admin.users");
        });
    };
    $scope.cancel = function() {
        $app.skipTo("admin.users");
    };
    $scope.toggleBidding = function() {
        var bidding = $scope.roles.byName("driver");
        if ($scope.data.hasRole("driver")) {
            $scope.data.detachRole(bidding);
        } else {
            $scope.data.attachRole(bidding);
        }
    };
    $scope.toggleAdmin = function() {
        var admin = $scope.roles.byName("admin");
        if ($scope.data.hasRole("admin")) {
            $scope.data.detachRole(admin);
        } else {
            $scope.data.attachRole(admin);
        }
    };
    $scope.destroyDocument = function(document) {
        $err.tryPromise(document.remove()).then(function() {
            $notifier.success("Document removed successfully");
            $scope.documents.reload();
        });
    };
    $scope.approveDocument = function(document) {
        document.status = "approved";
        $err.tryPromise(document.put()).then(function() {
            $notifier.success("Document approved successfully");
            $scope.documents.reload();
        });
    };
    $scope.destroyLocation = function(location) {
        $err.tryPromise(location.remove()).then(function() {
            $notifier.success("Location removed successfully");
            $scope.locations.reload();
        });
    };
    $scope.toggleVehicle = function(vehicle) {
        var index = _.findIndex($scope.vehiclesOwned, function(owned) {
            return owned.id == vehicle.id;
        });
        if (index > -1) {
            $scope.vehiclesOwned.splice(index, 1);
        } else {
            $scope.vehiclesOwned.push(vehicle);
        }
        $err.tryPromise($restAdmin.one("users", $scope.id).all("vehicles").post($scope.vehiclesOwned)).then(function(response) {
            $scope.vehiclesOwned = response[0];
        });
    };
    $scope.owns = function checkIfVehicleIsOwned(id) {
        return _.find($scope.vehiclesOwned, function(vehicle, index) {
            return vehicle.id === id;
        });
    };
    $scope.createDate = function(date) {
        return new Date(date);
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("admin.users.add", {
        url: "/new",
        page: {
            title: "Users",
            class: "icon-user",
            description: "Manage all users"
        },
        controller: "AdminUsersEditController",
        templateUrl: "src/admin/users/edit/edit.html",
        menu: {
            name: "User",
            class: "icon-user",
            tag: "action"
        }
    }).state("admin.users.edit", {
        url: "/edit/{id}",
        page: {
            title: "Users",
            class: "icon-user",
            description: "Manage all users"
        },
        controller: "AdminUsersEditController",
        templateUrl: "src/admin/users/edit/edit.html"
    });
} ]);

"use strict";

angular.module("app").controller("AdminUserLocationsEditController", [ "$q", "$auth", "$scope", "$state", "modalParams", "$restUser", "$notifier", "$app", "$err", "$location", "uiGmapIsReady", function($q, $auth, $scope, $state, modalParams, $restUser, $notifier, $app, $err, $location, uiGmapIsReady) {
    $scope.id = modalParams.id || null;
    $scope.location_id = modalParams.location_id || null;
    $scope.user_id = $scope.id;
    $scope.formSubmitted = false;
    $scope.miles = [ {
        id: 5,
        name: "5 miles",
        zoom: 11
    }, {
        id: 10,
        name: "10 miles",
        zoom: 10
    }, {
        id: 20,
        name: "20 miles",
        zoom: 9
    }, {
        id: 50,
        name: "50 miles",
        zoom: 8
    } ];
    $scope.map = {
        control: {},
        center: {
            latitude: 51.5073509,
            longitude: -.12775829999998223
        },
        zoom: 10,
        options: {
            scrollwheel: false
        },
        circles: [ {
            id: 1
        } ],
        refresh: function(center) {
            $scope.map.control.refresh(center);
        }
    };
    $scope.$watch("data.latitude", function(newVal, oldVal) {
        if (newVal !== oldVal) {
            $scope.map.circles[0].center = {
                latitude: $scope.data.latitude,
                longitude: $scope.data.longitude
            };
            $scope.map.circles[0].radius = $scope.data.miles * 1609.344;
            $scope.map.refresh({
                latitude: $scope.data.latitude,
                longitude: $scope.data.longitude
            });
        }
    });
    $scope.$watch("data.miles", function(newVal, oldVal) {
        if (newVal !== oldVal) {
            var selected = $.grep($scope.miles, function(e) {
                return e.id == $scope.data.miles;
            });
            $scope.map.circles[0].radius = newVal * 1609.344;
            $scope.map.zoom = selected[0].zoom;
            $scope.map.refresh({
                latitude: $scope.data.latitude,
                longitude: $scope.data.longitude
            });
        }
    });
    $scope.isAdd = function() {
        return $scope.location_id === null;
    };
    $scope.isEdit = function() {
        return $scope.location_id !== null;
    };
    if ($scope.isAdd()) {
        $scope.mode = "Add";
        $scope.data = {
            miles: 10
        };
    } else {
        $err.tryPromise($restUser.one("profile", $scope.user_id).one("locations", $scope.location_id).get()).then(function(data) {
            $scope.mode = "Edit";
            $scope.data = data;
            $scope.map.circles = [ {
                id: 1,
                center: {
                    latitude: data.latitude,
                    longitude: data.longitude
                },
                radius: $scope.data.miles * 1609.344
            } ];
            $scope.map.refresh({
                latitude: data.latitude,
                longitude: data.longitude
            });
        });
    }
    uiGmapIsReady.promise(1).then(function(instances) {
        $scope.map.refresh({
            latitude: 51.5073509,
            longitude: -.12775829999998223
        });
    });
    $scope.store = function() {
        $scope.formSubmitted = true;
        $scope.data.user_id = $scope.user_id;
        $err.tryPromise($restUser.one("profile", $scope.user_id).all("locations").post($scope.data)).then(function() {
            $notifier.success("Location added successfully");
            $app.goTo("admin.users.edit");
            $scope.$close(true);
            $scope.formSubmitted = false;
        });
    };
    $scope.update = function() {
        $scope.formSubmitted = true;
        $err.tryPromise($scope.data.put()).then(function() {
            $notifier.success("Location updated successfully");
            $app.goTo("admin.users.edit");
            $scope.$close(true);
            $scope.formSubmitted = false;
        });
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("admin.users.edit.addlocation", {
        url: "/locations/add",
        page: {
            title: "Add location",
            class: "icon-envelope",
            description: "Add new location"
        },
        modal: "md",
        controller: "AdminUserLocationsEditController",
        templateUrl: "src/admin/users/edit/location/location.html"
    }).state("admin.users.edit.editlocation", {
        url: "/locations/edit/{location_id}",
        page: {
            title: "Edit location",
            class: "icon-envelope",
            description: "Edit location"
        },
        modal: "md",
        controller: "AdminUserLocationsEditController",
        templateUrl: "src/admin/users/edit/location/location.html"
    });
} ]);

"use strict";

angular.module("app").controller("AdminUsersController", [ "$rootScope", "$state", "$scope", "$q", "$location", "$filter", "$err", "ngTableParams", "$restAdmin", "$notifier", function($rootScope, $state, $scope, $q, $location, $filter, $err, ngTableParams, $restAdmin, $notifier) {
    $restAdmin.all("roles").getList().then(function(roles) {
        $scope.roles = roles;
    });
    $scope.tableParams = new ngTableParams(angular.extend({
        page: 1,
        count: 10,
        sorting: {
            name: "asc"
        }
    }, $location.search()), {
        total: 0,
        getData: function($defer, params) {
            $location.search(params.url());
            $err.tryPromise($restAdmin.all("users").getList(params.url())).then(function(result) {
                $scope.tableParams.settings({
                    total: result.paginator.total
                });
                $defer.resolve(result);
            });
        }
    });
    $scope.inactivate = function(user) {
        user.inactivated = !user.inactivated;
        user.save();
    };
    $scope.createDate = function(date) {
        return new Date(date);
    };
    $scope.capitalizeFirstLetter = function(word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("admin.users", {
        url: "/users",
        preserveQueryParams: true,
        page: {
            title: "Users",
            class: "icon-user",
            description: "Manage all users"
        },
        controller: "AdminUsersController",
        templateUrl: "src/admin/users/list.html",
        menu: {
            name: "Users",
            class: "icon-user",
            tag: "admin",
            priority: 5
        }
    });
} ]);

"use strict";

angular.module("app").controller("AdminVehiclesEditController", [ "$q", "$scope", "$state", "$stateParams", "$restAdmin", "$notifier", "$app", "$err", "FileUploader", function($q, $scope, $state, $stateParams, $restAdmin, $notifier, $app, $err, FileUploader) {
    $scope.uploader = new FileUploader();
    $scope.mode = "Loading...";
    $scope.id = $stateParams.id || null;
    $scope.isAdd = function() {
        return $scope.id === null;
    };
    $scope.isEdit = function() {
        return $scope.id !== null;
    };
    if ($scope.isAdd()) {
        $scope.mode = "Add";
    } else {
        $err.tryPromise($restAdmin.one("vehicles", $scope.id).get()).then(function(data) {
            $scope.mode = "Edit";
            $scope.data = data;
        });
    }
    $scope.store = function() {
        if ($scope.uploader.queue.length > 0) {
            var item = $scope.uploader.queue[0];
            item.url = $restAdmin.all("vehicles").getRestangularUrl();
            item.formData.push($scope.data);
            $scope.uploader.uploadItem(item);
        } else {
            $err.tryPromise($restAdmin.all("vehicles").post($scope.data)).then(function() {
                $app.goTo("admin.vehicles");
            });
        }
    };
    $scope.update = function() {
        if ($scope.uploader.queue.length > 0) {
            var item = $scope.uploader.queue[0];
            item.url = $scope.data.getRestangularUrl() + "?_method=PUT";
            item.formData.push($scope.data);
            $scope.uploader.uploadItem(item);
        } else {
            $err.tryPromise($scope.data.put()).then(function() {
                $app.goTo("admin.vehicles");
            });
        }
    };
    $scope.destroy = function() {
        $err.tryPromise($scope.data.remove()).then(function() {
            $app.goTo("admin.vehicles");
        });
    };
    $scope.cancel = function() {
        $app.skipTo("admin.vehicles");
    };
    $scope.uploader.onSuccessItem = function(item, response, status, header) {
        $scope.uploader.removeFromQueue(item);
        $app.goTo("admin.vehicles");
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("admin.vehicles.add", {
        url: "/new",
        page: {
            title: "Vehicles",
            class: "fa fa-car",
            description: "Manage all vehicles"
        },
        controller: "AdminVehiclesEditController",
        templateUrl: "src/admin/vehicles/edit/edit.html",
        menu: {
            name: "Vehicle",
            class: "fa fa-car",
            tag: "action"
        }
    }).state("admin.vehicles.edit", {
        url: "/edit/{id}",
        page: {
            title: "Vehicles",
            class: "fa fa-car",
            description: "Manage all vehicles"
        },
        controller: "AdminVehiclesEditController",
        templateUrl: "src/admin/vehicles/edit/edit.html"
    });
} ]);

"use strict";

angular.module("app").controller("AdminVehiclesController", [ "$rootScope", "$state", "$scope", "$q", "$location", "$filter", "$err", "ngTableParams", "$restAdmin", "$notifier", function($rootScope, $state, $scope, $q, $location, $filter, $err, ngTableParams, $restAdmin, $notifier) {
    $scope.tableParams = new ngTableParams(angular.extend({
        page: 1,
        count: 10,
        sorting: {
            sort_no: "asc"
        }
    }, $location.search()), {
        total: 0,
        getData: function($defer, params) {
            $location.search(params.url());
            $err.tryPromise($restAdmin.all("vehicles").getList(params.url())).then(function(result) {
                $scope.tableParams.settings({
                    total: result.paginator.total
                });
                $defer.resolve(result);
            });
        }
    });
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("admin.vehicles", {
        url: "/vehicles",
        preserveQueryParams: true,
        page: {
            title: "Vehicles",
            class: "fa fa-car",
            description: "Manage all users"
        },
        controller: "AdminVehiclesController",
        templateUrl: "src/admin/vehicles/list.html",
        menu: {
            name: "Vehicles",
            class: "fa fa-car",
            tag: "admin",
            priority: 3
        }
    });
} ]);

"use strict";

angular.module("app").controller("AppController", [ "$scope", "$app", "$window", "$moment", function($scope, $app, $window, $moment) {
    function isSmartDevice($window) {
        var ua = $window["navigator"]["userAgent"] || $window["navigator"]["vendor"] || $window["opera"];
        return /iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/.test(ua);
    }
    var isIE = !!navigator.userAgent.match(/MSIE/i);
    isIE && angular.element($window.document.body).addClass("ie");
    isSmartDevice($window) && angular.element($window.document.body).addClass("smart");
    $app.name = "SDCN";
    $app.version = "0.0.1";
    $app.year = $moment().format("YYYY");
    $app.color = {
        primary: "#063f60",
        secondary: "#1298e6",
        info: "#23b7e5",
        success: "#27c24c",
        warning: "#fad733",
        danger: "#f05050",
        light: "#e8eff0",
        dark: "#3a3f51",
        black: "#1c2b36"
    };
    $app.settings = {
        themeID: 1,
        navbarHeaderColor: "bg-primary",
        navbarCollapseColor: "bg-white-only",
        asideColor: "bg-primary",
        headerFixed: false,
        asideFixed: false,
        asideFolded: false,
        asideDock: false,
        container: false
    };
    $app.isSmartDevice = isSmartDevice($window);
} ]);

"use strict";

angular.module("app").run([ "$rootScope", "$state", "$auth", "$notifier", "$guard", function($rootScope, $state, $auth, $notifier, $guard) {
    $guard.watch();
    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
        function process() {
            if ($auth.isGuest() && (toState.name.match("^admin.") || toState.name.match("^user."))) {
                event.preventDefault();
                $state.transitionTo("login");
            } else if ($auth.isUser() && toState.name == "login") {
                event.preventDefault();
                if ($auth.isAdmin()) {
                    $state.transitionTo("admin.dashboard");
                } else {
                    $state.transitionTo("user.dashboard");
                }
            } else if (!$auth.isAdmin() && toState.name.match("^admin.")) {
                event.preventDefault();
                $auth.logout().then(function() {
                    $notifier.error("Restricted area, you must login as Admin");
                    $state.transitionTo("login");
                });
            }
        }
        if (!$auth.bootstrapped()) {
            $auth.check().then(function() {
                process();
            }, function() {
                process();
            });
        } else {
            process();
        }
    });
} ]);

angular.module("app.components", []);

"use strict";

angular.module("app.components").directive("confirmDelete", [ "$modal", function($modal) {
    return {
        restrict: "A",
        scope: {
            confirmDelete: "&"
        },
        link: function(scope, element, attrs) {
            var modalInstance = undefined;
            var modalTemplate = "src/theme/modals/confirm-delete.html";
            var modalController = function($scope) {
                $scope.ok = function() {
                    scope.confirmDelete();
                    modalInstance.dismiss();
                };
                $scope.cancel = function() {
                    modalInstance.dismiss();
                };
            };
            modalController.$inject = [ "$scope" ];
            element.on("click", function() {
                modalInstance = $modal.open({
                    templateUrl: modalTemplate,
                    controller: modalController
                });
            });
        }
    };
} ]);

"use strict";

angular.module("app.components").directive("confirmModal", [ "$modal", function($modal) {
    return {
        restrict: "A",
        scope: {
            confirmModal: "&"
        },
        link: function(scope, element, attrs) {
            var modalInstance = undefined;
            var modalTemplate = "src/theme/modals/confirm-modal.html";
            var modalController = function($scope) {
                $scope.ok = function() {
                    scope.confirmModal();
                    modalInstance.dismiss();
                };
                $scope.cancel = function() {
                    modalInstance.dismiss();
                };
            };
            modalController.$inject = [ "$scope" ];
            element.on("click", function() {
                modalInstance = $modal.open({
                    templateUrl: modalTemplate,
                    controller: modalController
                });
            });
        }
    };
} ]);

angular.module("app.components").directive("googleplace", function() {
    return {
        restrict: "AE",
        require: "ngModel",
        scope: {
            ngModel: "=",
            details: "=?",
            lat: "=?",
            lng: "=?"
        },
        replace: true,
        link: function(scope, element, attrs, model) {
            var options = {
                types: []
            };
            var autocomplete = new google.maps.places.Autocomplete(element[0], options);
            google.maps.event.addListener(autocomplete, "place_changed", function() {
                var place = autocomplete.getPlace();
                if (place && place.geometry) {
                    scope.details = place;
                    model.$setViewValue(element.val());
                    scope.lat = place.geometry.location.lat();
                    scope.lng = place.geometry.location.lng();
                    element.trigger("blur");
                    scope.$apply();
                } else {
                    var geocoder = new google.maps.Geocoder();
                    var address = element.val() + ", UK";
                    geocoder.geocode({
                        address: address
                    }, function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            place = results[0];
                            scope.details = place;
                            model.$setViewValue(element.val());
                            scope.lat = place.geometry.location.lat();
                            scope.lng = place.geometry.location.lng();
                            element.trigger("blur");
                            scope.$apply();
                        } else {
                            alert("Autocomplete's returned place contains no geometry");
                            return;
                        }
                    });
                }
            });
            element.on("keydown change", function() {
                element.closest(".form-group").removeClass("has-error").find(".label-danger").remove();
            });
        }
    };
});

"use strict";

angular.module("app.components").constant("iDtpConfig", {
    format: "MMM D, YYYY H:mm",
    minDate: null,
    maxDate: null,
    controls: true
}).directive("iDtp", [ "iDtpConfig", "$document", "$position", "$moment", function(iDtpConfig, $document, $position, $moment) {
    return {
        restrict: "EA",
        templateUrl: "src/components/directives/iDtp/iDtp.template.html",
        replace: true,
        require: "ngModel",
        scope: {
            modelValue: "=ngModel",
            icon: "@",
            placeholder: "@",
            controls: "=?",
            isOpen: "=?",
            minDate: "=",
            maxDate: "="
        },
        controller: [ "$scope", function($scope) {
            $scope.controls = angular.isDefined($scope.controls) ? $scope.controls : true;
        } ],
        link: function(scope, element, attrs, ngModel) {
            var inputEl = element.find("input").eq(0);
            var value, format = iDtpConfig.format, controls = iDtpConfig.controls;
            function refresh() {
                scope.viewValue = value ? $moment(value).format(format) : "";
            }
            scope.$watch("modelValue", function(newValue) {
                value = newValue ? isDate(newValue) ? newValue : isString(newValue) ? $moment(newValue).toDate() : null : null;
                refresh();
            });
            attrs.$observe("format", function(newValue) {
                format = scope.$parent.$eval(newValue);
                refresh();
            });
            var keydown = function(evt) {
                if (evt.which === 27) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    scope.isOpen = false;
                    inputEl.focus();
                } else if (evt.which === 40 && !scope.isOpen) {
                    scope.isOpen = true;
                }
            };
            element.bind("keydown keypress", keydown);
            inputEl.bind("blur", function(e) {
                ngModel.$setViewValue($moment(inputEl.val(), format).toDate());
            });
            var documentClickBind = function(event) {
                if (scope.isOpen && event.target !== element[0]) {
                    scope.$apply(function() {
                        scope.isOpen = false;
                    });
                }
            };
            element.bind("click", function(event) {
                event.preventDefault();
                event.stopPropagation();
            });
            scope.$watch("isOpen", function(value) {
                if (value) {
                    scope.position = $position.position(element);
                    $document.bind("click", documentClickBind);
                } else {
                    $document.unbind("click", documentClickBind);
                }
            });
            scope.clickToggle = function(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                scope.isOpen = !scope.isOpen;
                inputEl.focus();
            };
            scope.select = function(dt) {
                if (dt === "now") {
                    scope.modelValue = $moment($moment().format(format), format).toDate();
                } else if (isDate(dt)) {
                    scope.modelValue = dt;
                } else if (isString(dt)) {
                    scope.modelValue = $moment(dt, format).toDate();
                } else {
                    scope.modelValue = null;
                }
                scope.isOpen = false;
                inputEl.focus();
            };
            scope.close = function(evt) {
                scope.isOpen = false;
                inputEl.focus();
            };
            scope.$on("$destroy", function() {
                element.unbind("keydown keypress", keydown);
                $document.unbind("click", documentClickBind);
            });
        }
    };
} ]);

"use strict";

angular.module("app.components").directive("matchTo", [ "$parse", function($parse) {
    return {
        require: "?ngModel",
        restrict: "A",
        link: function(scope, elem, attrs, ctrl) {
            if (!ctrl) {
                if (console && console.warn) {
                    console.warn("`matchTo` validation requires ngModel to be on the element");
                }
                return;
            }
            var matchToGetter = $parse(attrs.matchTo);
            scope.$watch(getMatchToValue, function() {
                ctrl.$$parseAndValidate();
            });
            ctrl.$validators.matchTo = function() {
                return ctrl.$viewValue === getMatchToValue();
            };
            function getMatchToValue() {
                var matchTo = matchToGetter(scope);
                if (angular.isObject(matchTo) && matchTo.hasOwnProperty("$viewValue")) {
                    matchTo = matchTo.$viewValue;
                }
                return matchTo;
            }
        }
    };
} ]);

angular.module("app.components").directive("offcanvasToggle", [ "$http", function($http) {
    return {
        restrict: "A",
        scope: {},
        link: function(scope, element) {
            element.on("click", function() {
                $(".row-offcanvas").toggleClass("active");
            });
        }
    };
} ]);

angular.module("app.components").directive("sdcnLoader", [ "$http", function($http) {
    return {
        restrict: "EA",
        templateUrl: "src/components/directives/sdcn.loader.html",
        replace: true,
        scope: {
            size: "@"
        }
    };
} ]);

angular.module("app.components").directive("svgImage", [ "$http", function($http) {
    return {
        restrict: "AE",
        scope: {
            ngSrc: "=?"
        },
        link: function(scope, element) {
            var imgURL = scope.ngSrc;
            var request = $http.get(imgURL, {
                "Content-Type": "application/xml"
            });
            scope.manipulateImgNode = function(data, elem) {
                var $svg = angular.element(data)[4];
                var imgClass = elem.attr("class");
                if (typeof imgClass !== "undefined") {
                    $svg.setAttribute("class", imgClass);
                }
                $svg.removeAttribute("xmlns:a");
                return $svg;
            };
            request.success(function(data) {
                element.replaceWith(scope.manipulateImgNode(data, element));
            });
        }
    };
} ]);

angular.module("app.components").directive("validFile", function() {
    return {
        require: "ngModel",
        link: function(scope, el, attrs, ngModel) {
            el.bind("change", function() {
                scope.$apply(function() {
                    ngModel.$setViewValue(el.val());
                    ngModel.$render();
                });
            });
        }
    };
});

"use strict";

angular.module("app.components").directive("verifyAddress", [ "$geo", function($geo) {
    return {
        restrict: "A",
        require: "ngModel",
        link: function(scope, element, attributes, ngModel) {
            ngModel.$asyncValidators.verifyAddress = function(modelValue) {
                return $geo.codeAddress(modelValue);
            };
        }
    };
} ]);

"use strict";

angular.module("app.components").filter("bytes", function() {
    return function(bytes, precision) {
        if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return "-";
        if (typeof precision === "undefined") precision = 1;
        var units = [ "bytes", "kB", "MB", "GB", "TB", "PB" ], number = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + " " + units[number];
    };
});

"use strict";

angular.module("app.components").filter("checkmark", function() {
    return function(input) {
        return input ? "✓" : "✘";
    };
});

"use strict";

angular.module("app.components").filter("range", function() {
    return function(input, total) {
        total = parseInt(total);
        for (var i = 0; i < total; i++) input.push(i);
        return input;
    };
});

angular.module("app.components").filter("split", function() {
    return function(input, splitChar, splitIndex) {
        if (!input) return;
        if (splitIndex == "last") {
            var splitText = input.split(splitChar);
            return splitText[splitText.length - 1];
        } else {
            return input.split(splitChar)[splitIndex];
        }
    };
});

angular.module("app.components").filter("propsFilter", function() {
    return function(items, props) {
        var out = [];
        if (angular.isArray(items)) {
            items.forEach(function(item) {
                var itemMatches = false;
                var keys = Object.keys(props);
                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                        itemMatches = true;
                        break;
                    }
                }
                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            out = items;
        }
        return out;
    };
});

angular.module("app.components.models", [ "restangular" ]);

"use strict";

angular.module("app.components.models").run([ "Restangular", function(Restangular) {
    Restangular.extendCollection("roles", function(collection) {
        collection.byName = function(name) {
            return collection.filter(function(role) {
                return role.name == name;
            })[0];
        };
        return collection;
    });
} ]);

"use strict";

angular.module("app.components.models").run([ "Restangular", function(Restangular) {
    var extension = function(team) {
        team.deactivateMember = function(member) {
            member.inactivated = !member.inactivated ? 1 : 0;
            team.one("members", member.id).put({
                inactivated: member.inactivated
            });
        };
        return team;
    };
    Restangular.extendModel("team", extension);
    Restangular.extendModel("teams", extension);
} ]);

"use strict";

angular.module("app.components.models").run([ "Restangular", function(Restangular) {
    var extension = function(model) {
        model.can = function(checkedPermission) {
            for (var i = 0; i < this.roles.length; i++) {
                var has = this.roles[i].perms.filter(function(perm) {
                    return perm.name == checkedPermission;
                });
                if (has.length) {
                    return true;
                }
            }
            return false;
        };
        model.hasRole = function(checkedRole) {
            return this.filterRolesByName(checkedRole).length;
        };
        model.filterRolesByName = function(checkedName) {
            return this.roles.filter(function(role) {
                return role.name == checkedName;
            });
        };
        model.attachRole = function(role) {
            model.roles.push(role);
            model.roles_ids.push(role.id);
        };
        model.detachRole = function(role) {
            this.roles.splice(_.findIndex(this.roles, {
                id: role.id
            }), 1);
            this.roles_ids.splice(this.roles_ids.indexOf(role.id), 1);
        };
        model.getAvatar = function() {
            return this.avatar_url;
        };
        return model;
    };
    Restangular.extendModel("current", extension);
    Restangular.extendModel("users", extension);
} ]);

"use strict";

angular.module("app.components").factory("$app", [ "$rootScope", "$location", "$state", "$stateParams", function($rootScope, $location, $state, $stateParams) {
    function isMode(mode) {
        return !!$location.url().match("^/" + mode);
    }
    return {
        reload: function() {
            $state.transitionTo($state.current, $stateParams, {
                reload: true,
                inherit: false,
                notify: true
            });
        },
        goTo: function(newState) {
            $state.transitionTo(newState, $stateParams, {
                reload: newState,
                inherit: false,
                notify: true
            });
        },
        skipTo: function(newState) {
            $state.transitionTo(newState, $stateParams);
        },
        mode: function() {
            if (isMode("login")) {
                return "login";
            } else if (isMode("admin")) {
                return "admin";
            } else if (isMode("user")) {
                return "user";
            } else {
                return null;
            }
        },
        redirectUser: function(registration_progress) {
            switch (registration_progress) {
              case "company_location":
                $location.path("/register/company/location");
                break;

              case "invoice":
                $location.path("/register/invoice");
                break;

              case "recipient_details":
                $location.path("/register/invoice/recipient");
                break;

              case "invoice_footer_details":
                $location.path("/register/invoice/footer");
                break;

              case "documents":
                $location.path("/register/documents");
                break;

              default:
                $location.path("register/company");
            }
        }
    };
} ]);

angular.module("app.components").factory("$auth", [ "$rootScope", "$window", "$q", "$restAuth", "$restApp", "$app", function($rootScope, $window, $q, $restAuth, $restApp, $app) {
    var cleanUser = {
        id: null,
        name_first: "Guest",
        name_last: null,
        email: null,
        is_admin: false,
        name_full: "Guest",
        ratings_count: 0,
        score: 0
    };
    var guest = $.extend(true, {}, cleanUser);
    var user = {};
    extend(user, guest);
    var bootstrap = false;
    return {
        user: function() {
            return user;
        },
        assure: function(callback) {
            if (bootstrap) {
                callback();
            } else {
                $rootScope.$on("auth.bootstrap", callback);
            }
        },
        bootstrapped: function() {
            return bootstrap;
        },
        toGuest: function() {
            user = this.createGuest();
        },
        createGuest: function() {
            return {
                id: null,
                name_first: "Guest",
                name_last: null,
                email: null,
                is_admin: false,
                name_full: "Guest"
            };
        },
        check: function() {
            var deferred = $q.defer();
            $restAuth.all("user").one("current").get().then(function(data) {
                extend(user, guest, data);
                if (!bootstrap) $rootScope.$broadcast("auth.bootstrap");
                bootstrap = true;
                deferred.resolve(user);
            }, function() {
                if (!bootstrap) $rootScope.$broadcast("auth.bootstrap");
                bootstrap = true;
                deferred.reject();
            });
            return deferred.promise;
        },
        login: function(email, password) {
            var deferred = $q.defer();
            $restAuth.all("user").one("login").post(null, {
                email: email,
                password: password
            }).then(function(data) {
                $restAuth.all("user").one("current").get().then(function(data) {
                    extend(user, guest, data);
                    if (!bootstrap) $rootScope.$broadcast("auth.bootstrap");
                    bootstrap = true;
                    deferred.resolve(user);
                }, function() {
                    if (!bootstrap) $rootScope.$broadcast("auth.bootstrap");
                    bootstrap = true;
                    deferred.reject();
                });
            }, function() {
                deferred.reject();
            });
            return deferred.promise;
        },
        logout: function() {
            var deferred = $q.defer();
            $restAuth.all("user").one("logout").get().then(function() {
                extend(user, guest);
                $rootScope.$broadcast("auth.logout", user);
                deferred.resolve(user);
            }, function() {
                deferred.reject();
            });
            return deferred.promise;
        },
        recover: function(email) {
            var deferred = $q.defer();
            $restAuth.all("password").customPOST({
                email: email
            }, "recover").then(function(result) {
                deferred.resolve(result);
            }, function(data) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
        reset: function(password, password_confirmation, token) {
            var deferred = $q.defer();
            $restAuth.all("password").customPOST({
                password: password,
                password_confirmation: password_confirmation,
                token: token
            }, "reset").then(function(result) {
                deferred.resolve(result);
            }, function(data) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
        register: function(user) {
            var deferred = $q.defer();
            $restAuth.all("users").post(user).then(function(result) {
                deferred.resolve(result);
            }, function(data) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
        isGuest: function() {
            return !user.id;
        },
        isUser: function() {
            return !!user.id;
        },
        isAdmin: function() {
            return !!user.is_admin;
        },
        isRegistered: function() {
            var deferred = $q.defer();
            $restApp.all("register").one("check").get().then(function(data) {
                $rootScope.userRegistration = data;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }
    };
} ]);

"use strict";

angular.module("app.components").factory("$err", [ "$q", "$notifier", function($q, $notifier) {
    var lastError = null;
    var errors = [];
    return {
        error: function(source, description, data) {
            lastError = {
                source: source,
                description: description,
                data: data
            };
            errors.push(lastError);
        },
        lastError: function() {
            return lastError;
        },
        errors: function() {
            return errors;
        },
        clearLast: function() {
            lastError = null;
        },
        clearAll: function() {
            errors.length = 0;
        },
        tryFn: function(fn, options) {
            var notify = isDefined(options) && isDefined(options.notify) ? options.notify : true;
            fn();
            if (lastError !== null) {
                notify && $notifier.error(lastError.description);
                lastError = null;
            }
        },
        tryPromise: function(promise, options) {
            var notify = isDefined(options) && isDefined(options.notify) ? options.notify : true;
            var notifyFormatter = isDefined(options) && isDefined(options.notifyFormatter) ? options.notifyFormatter : function(error) {
                return isDefined(error.description) && isArray(error.description) ? error.description.join("<br/>") : error.description;
            };
            var deferred = $q.defer();
            promise.then(function(data) {
                deferred.resolve(data);
                if (lastError !== null) {
                    notify && $notifier.error(notifyFormatter(lastError));
                    lastError = null;
                }
            }, function(data) {
                deferred.reject(data);
                if (lastError !== null) {
                    notify && $notifier.error(notifyFormatter(lastError));
                    lastError = null;
                }
            });
            return deferred.promise;
        }
    };
} ]);

"use strict";

angular.module("app.components").factory("$geo", [ "$q", "$geocoder", function($q, $geocoder) {
    return {
        codeAddress: function(address) {
            var deferred = $q.defer();
            if (!$geocoder) {
                deferred.reject("Geocode was not successful for the following reason: Google maps geocoder API not included");
            } else {
                $geocoder.geocode({
                    address: address
                }, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        deferred.resolve(results);
                    } else {
                        deferred.reject("Geocode was not successful for the following reason: " + status);
                    }
                });
            }
            return deferred.promise;
        }
    };
} ]);

angular.module("app.components").factory("$guard", [ "$restAuth", "$state", "$auth", "$notifier", "$rootScope", function($restAuth, $state, $auth, $notifier, $rootScope) {
    var interval;
    var kicked;
    return {
        timeout: 5e3,
        watch: function() {
            this.schedule();
            this.listen();
            this.listenRelogged();
        },
        tick: function() {
            if (interval) clearTimeout(interval);
            this.schedule();
        },
        listen: function() {
            var $guard = this;
            $rootScope.$on("guard.out", function(event, message) {
                $guard.out(message);
            });
        },
        listenRelogged: function() {
            $rootScope.$on("auth.login", function(event, user) {
                kicked = false;
            });
        },
        schedule: function() {
            interval = setTimeout(this.check.bind(this), this.timeout);
        },
        out: function(reason) {
            if (!kicked) {
                kicked = true;
                $auth.toGuest();
                $state.transitionTo("login");
                $notifier.warning(reason);
            }
        },
        check: function() {
            if ($auth.isGuest()) {
                this.tick();
                return;
            }
            var $guard = this;
            $restAuth.one("guard").get().then(function(data) {
                if (data.out) {
                    $guard.out(data.message);
                }
                $guard.tick();
            });
        }
    };
} ]);

"use strict";

angular.module("app.components").factory("ModalService", [ "$modal", function($modal) {
    return {
        openEdit: function(templateUrl, controller, modalParams, size) {
            return $modal.open({
                templateUrl: templateUrl,
                controller: controller,
                size: size,
                resolve: {
                    modalParams: function() {
                        return modalParams;
                    }
                }
            });
        }
    };
} ]);

"use strict";

angular.module("app.components").value("$toastr", toastr);

angular.module("app.components").factory("$notifier", [ "$toastr", function($toastr) {
    function init(type) {
        return function(msg, options) {
            type = type || "success";
            $toastr.options = angular.extend({
                positionClass: "toast-bottom-right"
            }, options);
            $toastr[type](msg);
        };
    }
    return {
        info: init("info"),
        success: init("success"),
        warning: init("warning"),
        error: init("error")
    };
} ]);

"use strict";

angular.module("app.components").factory("$validation", [ "$notifier", function($notifier) {
    function handle(validation_messages) {
        clear();
        for (var key in validation_messages) {
            if (validation_messages.hasOwnProperty(key)) {
                var input = $('[name="' + key + '"], [ng-model$="' + key + '"], [data-ng-model$="' + key + '"]');
                input.closest(".form-group").addClass("has-error validation-error");
                var message = validation_messages[key].join("<br/>");
                input.after('<div class="validation-message">' + message + "</div>");
            }
        }
        $notifier.error("You have some validation errros.");
    }
    function clear() {
        $(".validation-message").remove();
        $(".validation-error").removeClass("has-error validation-error");
    }
    return {
        handle: handle,
        clear: clear,
        performFromResponse: function(response) {
            handle(response.data);
        }
    };
} ]);

"use strict";

angular.module("app.components").value("$geocoder", new google.maps.Geocoder());

"use strict";

angular.module("app.components").value("$moment", moment);

"use strict";

angular.module("app").controller("LoginController", [ "$scope", "$app", "$state", "$err", "$auth", function($scope, $app, $state, $err, $auth) {
    $scope.auth = $auth;
    $scope.login = function(email, password) {
        $err.tryPromise($auth.login(email, password)).then(function(data) {
            if (data.registration_status == "complete" || data.registration_status == "backend") {
                $scope.email = "";
                $scope.password = "";
                $app.goTo(($auth.isAdmin() ? "admin" : "user") + ".dashboard");
            } else {
                switch (data.registration_progress) {
                  case "company_location":
                    $app.goTo("register.company.location");
                    break;

                  case "invoice":
                    $app.goTo("register.invoice");
                    break;

                  case "recipient_details":
                    $app.goTo("register.invoice.recipient");
                    break;

                  case "invoice_footer_details":
                    $app.goTo("register.invoice.footer");
                    break;

                  case "documents":
                    $app.goTo("register.documents");
                    break;

                  default:
                    $app.goTo("register.company");
                }
            }
        });
    };
    $scope.logout = function() {
        $err.tryPromise($auth.logout()).then(function() {
            $app.goTo("login");
        });
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("login", {
        url: "/login",
        page: {
            title: "Login"
        },
        templateUrl: "src/login/login.html"
    });
} ]);

"use strict";

angular.module("app").controller("RecoverController", [ "$scope", "$app", "$state", "$err", "$auth", "$notifier", function($scope, $app, $state, $err, $auth, $notifier) {
    $scope.recover = function(email) {
        $err.tryPromise($auth.recover(email)).then(function() {
            $notifier.success("Reset password email has been sent.");
            $app.goTo("login");
        });
    };
    $scope.cancel = function() {
        $app.skipTo("login");
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("login.recover", {
        url: "/recover",
        page: {
            title: "Recover Password"
        },
        templateUrl: "src/login/recover/recover.html",
        controller: "RecoverController"
    });
} ]);

"use strict";

angular.module("app").controller("ResetController", [ "$scope", "$app", "$state", "$stateParams", "$err", "$auth", "$notifier", "$location", function($scope, $app, $state, $stateParams, $err, $auth, $notifier, $location) {
    $scope.reset = function() {
        $err.tryPromise($auth.reset($scope.password, $scope.password_confirmation, $stateParams.token)).then(function(response) {
            $notifier.success("Updated successfully.");
            if (!response.inactivated) {
                $auth.check().then(function() {
                    $app.goTo("login");
                });
            } else if (response.inactivated && response.registration_complete) {
                $app.goTo("login");
            } else if (response.inactivated && !response.registration_complete) {
                switch (response.registration_progress) {
                  case "company_location":
                    $app.goTo("register.company.location");
                    break;

                  case "invoice":
                    $app.goTo("register.invoice");
                    break;

                  case "recipient_details":
                    $app.goTo("register.invoice.recipient");
                    break;

                  case "invoice_footer_details":
                    $app.goTo("register.invoice.footer");
                    break;

                  case "documents":
                    $app.goTo("register.documents");
                    break;

                  default:
                    $app.goTo("register.company");
                }
            }
        });
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("login.reset", {
        url: "/reset/{token}",
        page: {
            title: "Reset password"
        },
        templateUrl: "src/login/reset/reset.html",
        controller: "ResetController"
    });
} ]);

"use strict";

angular.module("app").run([ "$rootScope", "$state", "$app", "ModalService", function($rootScope, $state, $app, ModalService) {
    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
        if (isDefined(toState.modal) && toState.modal) {
            event.preventDefault();
            ModalService.openEdit(toState.templateUrl, toState.controller, toParams, isString(toState.modal) ? toState.modal : "sm").result.then(function() {
                $app.reload();
            });
        }
    });
} ]);

"use strict";

angular.module("app").run([ "$rootScope", "$location", function($rootScope, $location) {
    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
        if (fromState.preserveQueryParams) {
            fromState.queryParams = angular.copy($location.search());
        }
    });
    $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
        if (!!toState.preserveQueryParams && angular.isDefined(toState.queryParams)) {
            $location.search(toState.queryParams);
            delete toState.queryParams;
        }
    });
} ]);

"use strict";

angular.module("app").controller("CompanyController", [ "$rootScope", "$scope", "$app", "$state", "$notifier", "$location", "$restApp", function($rootScope, $scope, $app, $state, $notifier, $location, $restApp) {
    $scope.errors = null;
    $scope.teams = [];
    $scope.ctype = null;
    $scope.checked = false;
    $scope.disableCompanyNumber = false;
    $scope.formData = {
        team_id: "",
        company_name: "",
        company_number: "",
        vat_number: ""
    };
    $scope.address = function() {
        $scope.errors = null;
        if ($scope.ctype === "Sole Trader") {
            $scope.formData.company_number = $scope.ctype;
        }
        $scope.formData.registration_progress = "company_location";
        $restApp.all("register/teams").post($scope.formData).then(function(data) {
            $notifier.success("Company details updated successfully");
            $restApp.all("register/update-progress").patch($scope.formData);
            $location.path("/register/company/location");
        }, function(error) {
            if ($scope.ctype === "Sole Trader") {
                $scope.formData.company_number = "";
            }
            $notifier.error("Something went wrong");
            if (typeof error.data === "object") {
                return $scope.errors = _(error.data).values().flatten().value();
            }
        });
    };
    $scope.companyType = function(data) {
        $scope.ctype = data;
        if ($scope.ctype === "Sole Trader") {
            $scope.formData.company_number = "";
        }
    };
    $scope.isChecked = function(data) {
        if ($scope.ctype === data) {
            return true;
        }
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("register.company", {
        url: "/company",
        page: {
            title: "Company"
        },
        templateUrl: "src/register/company/company.html",
        controller: "CompanyController",
        resolve: {
            userRegistration: [ "$auth", function resolveAuthentication($auth) {
                return $auth.isRegistered();
            } ]
        }
    });
} ]);

"use strict";

angular.module("app").controller("LocationController", [ "$rootScope", "$scope", "$auth", "$app", "$state", "$notifier", "$location", "$restApp", "$window", function($rootScope, $scope, $auth, $app, $state, $notifier, $location, $restApp, $window) {
    $scope.formData = {
        team_id: $rootScope.userRegistration.team_id,
        postal_code: "",
        address_line_1: "",
        address_line_2: "",
        town: "",
        county: ""
    };
    $scope.data = {
        location: "",
        address: ""
    };
    $scope.enterManually = false;
    $scope.errors = null;
    $scope.$on("$stateChangeStart", function() {
        $restApp.all("register").one("check").get().then(function(data) {
            $app.redirectUser(data.registration_progress);
        });
    });
    $scope.$watch("enterManually", function(newVal) {
        if (newVal == false) {
            $scope.data.location = "";
            $scope.formData = {
                team_id: $rootScope.userRegistration.team_id,
                postal_code: "",
                address_line_1: "",
                address_line_2: "",
                town: "",
                county: ""
            };
        }
    });
    $scope.$watch("data.address", function(newVal) {
        var address1 = "";
        if (newVal) {
            newVal.address_components.forEach(function(address_component) {
                address_component.types.forEach(function(type) {
                    if (type == "street_number") {
                        address1 = address_component.long_name;
                    }
                });
                address_component.types.forEach(function(type) {
                    if (type == "subpremise") {
                        var space = address1 == "" ? "" : ", ";
                        address1 = address1.concat(space, address_component.long_name);
                    }
                });
                address_component.types.forEach(function(type) {
                    if (type == "premise") {
                        var space = address1 == "" ? "" : ", ";
                        address1 = address1.concat(space, address_component.long_name);
                    }
                });
                address_component.types.forEach(function(type) {
                    if (type == "route") {
                        $scope.formData.address_line_2 = address_component.long_name;
                    }
                });
                address_component.types.forEach(function(type) {
                    if (type == "postal_town") {
                        $scope.formData.town = address_component.long_name;
                    }
                });
                if ($scope.formData.town == "") {
                    address_component.types.forEach(function(type) {
                        if (type == "locality") {
                            $scope.formData.town = address_component.long_name;
                        }
                    });
                }
                address_component.types.forEach(function(type) {
                    if (type == "postal_code") {
                        $scope.formData.postal_code = address_component.long_name;
                    }
                });
                address_component.types.forEach(function(type) {
                    if (type == "administrative_area_level_2") {
                        $scope.formData.county = address_component.long_name;
                    }
                });
            });
            $scope.formData.address_line_1 = address1;
            $scope.enterManually = true;
        }
    });
    $scope.location = function() {
        $scope.errors = null;
        $scope.formData.registration_progress = "invoice";
        $restApp.all("register/teams").patch($scope.formData).then(function() {
            $notifier.success("Location details updated successfully");
            $location.path("/register/invoice");
        }, function(response) {
            $scope.errors = response.data;
            $notifier.error("Something went wrong");
        });
    };
    $scope.isEnterManually = function() {
        $scope.enterManually = !$scope.enterManually;
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("register.company.location", {
        url: "/location",
        page: {
            title: "Location"
        },
        templateUrl: "src/register/company/location/location.html",
        controller: "LocationController",
        resolve: {
            userRegistration: [ "$auth", function resolveAuthentication($auth) {
                return $auth.isRegistered();
            } ]
        }
    });
} ]);

"use strict";

angular.module("app").controller("DocumentController", [ "$rootScope", "$scope", "$app", "$state", "$notifier", "$location", "$restApp", "FileUploader", "$moment", function($rootScope, $scope, $app, $state, $notifier, $location, $restApp, FileUploader, $moment) {
    $scope.uploader = new FileUploader();
    $scope.team_id = $rootScope.userRegistration.team_id;
    $scope.formSubmitted = false;
    var dateFormat = "YYYY-MM-DD HH:mm:ss";
    $scope.data = {
        team_id: $scope.team_id,
        user_id: $rootScope.userRegistration.user_id,
        type_id: 0,
        status: "pending"
    };
    $scope.defaultDocuments = [ {
        type_id: 4,
        title: "Public Liability Insurance",
        isUploaded: false
    }, {
        type_id: 5,
        title: "Drivers License",
        isUploaded: false
    }, {
        type_id: 6,
        title: "Posting Only Declaration",
        isUploaded: false
    }, {
        type_id: 8,
        title: "Insurance Policy Statement",
        isUploaded: false
    }, {
        type_id: 9,
        title: "ADR Certificate",
        isUploaded: false
    }, {
        type_id: 11,
        title: "Employers Liability",
        isUploaded: false
    } ];
    $scope.formData = {
        registration_progress: ""
    };
    $restApp.all("user/doctypes").getList().then(function(result) {
        $scope.doctypes = result;
    });
    $restApp.all("register/profile/documents").getList().then(function(result) {
        $scope.list = result;
        result.forEach(function(element) {
            _.findIndex($scope.defaultDocuments, function(doc) {
                if (doc.type_id == element.type_id) {
                    return doc.isUploaded = true;
                }
            });
        });
    });
    $scope.allDocuments = function() {
        $restApp.all("register/profile/documents").getList().then(function(result) {
            $scope.list = result;
            result.forEach(function(element) {
                _.findIndex($scope.defaultDocuments, function(doc) {
                    if (doc.type_id == element.type_id) {
                        return doc.isUploaded = true;
                    }
                });
            });
        });
    };
    $scope.delete = function(id, type_id) {
        var url = "register/profile/" + $scope.data.user_id + "/documents/" + id;
        $restApp.all(url).post({}).then(function() {
            _.findIndex($scope.defaultDocuments, function(doc) {
                if (doc.type_id == type_id) {
                    return doc.isUploaded = false;
                }
            });
            $scope.allDocuments();
            $notifier.success("Deleted successfully");
        }, function(response) {
            $scope.errors = response.data;
            $notifier.error("Something went wrong");
        });
    };
    $scope.store = function() {
        $scope.formSubmitted = true;
        if ($scope.data.selected_type.expiry_required === 0) {
            $scope.data.expiry = "0000-00-00";
        } else {
            $scope.data.expiry = $moment($scope.data.expiry).format(dateFormat);
        }
        if ($scope.uploader.queue.length > 0) {
            var item = $scope.uploader.queue[0];
            if (undefined !== $scope.data.user_id) {
                item.url = $restApp.one("register/profile", $scope.data.user_id).all("documents").getRestangularUrl();
                item.formData.push($scope.data);
                $scope.uploader.uploadItem(item);
            }
        }
    };
    $scope.uploader.onAfterAddingFile = function(fileItem) {
        $scope.file = {
            name: fileItem.file.name,
            size: fileItem.file.size
        };
    };
    $scope.uploader.onProgressItem = function(fileItem, progress) {
        $scope.progress = progress;
    };
    $scope.uploader.onSuccessItem = function(item) {
        $scope.formSubmitted = false;
        $notifier.success("Document uploaded successfully");
        $scope.uploader.removeFromQueue(item);
        $scope.allDocuments();
        $scope.closeModal();
    };
    $scope.uploader.onErrorItem = function() {
        $scope.formSubmitted = false;
        $notifier.error("Something went wrong!");
    };
    $scope.openModal = function(type_id) {
        if (type_id) {
            $scope.data.selected_type = $scope.doctypes.filter(function(doctype) {
                return doctype.id === type_id;
            })[0];
            $scope.data.type_id = type_id;
        }
        $("#upload-doc").modal();
    };
    $scope.closeModal = function() {
        $scope.clear();
        $("#upload-doc").modal("hide");
    };
    $scope.submit = function() {
        $scope.formData.registration_progress = "complete";
        $restApp.all("register/update-progress").patch($scope.formData).then(function() {
            $location.path("/register/success");
        }, function(error) {
            $notifier.error("Something went wrong");
            if (typeof error.data === "object") {
                return $scope.errors = _(error.data).values().flatten().value();
            }
        });
    };
    $scope.nextStep = function() {
        this.submit();
    };
    $scope.clear = function() {
        $scope.file = null;
        $scope.upload = undefined;
        $scope.data = {
            team_id: $scope.team_id,
            user_id: $rootScope.userRegistration.user_id,
            type_id: 0,
            status: "pending"
        };
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("register.documents", {
        url: "/documents",
        page: {
            title: "Documents"
        },
        templateUrl: "src/register/documents/documents.html",
        controller: "DocumentController",
        resolve: {
            userRegistration: [ "$auth", function resolveAuthentication($auth) {
                return $auth.isRegistered();
            } ]
        }
    });
} ]);

"use strict";

angular.module("app").controller("FooterController", [ "$rootScope", "$scope", "$app", "$state", "$notifier", "$location", "$restApp", "FileUploader", function($rootScope, $scope, $app, $state, $notifier, $location, $restApp, FileUploader) {
    $scope.errors = null;
    $scope.uploader = new FileUploader();
    $scope.myImage = "";
    $scope.formData = {
        team_id: $rootScope.userRegistration.team_id,
        invoice_footer_text: "",
        invoice_including_vat: false
    };
    $scope.data = {
        team_id: $rootScope.userRegistration.team_id
    };
    $scope.nextStep = function() {
        $location.path("/register/documents");
    };
    $scope.openFileBrowser = function(event) {
        event.preventDefault();
        setTimeout(function() {
            var element = document.getElementById("invoice-logo");
            element.click();
        });
    };
    $scope.uploader.onAfterAddingFile = function(fileItem) {
        $scope.status = "loading";
        var file = fileItem._file;
        var reader = new FileReader();
        reader.onload = function(evt) {
            $scope.status = "loaded";
            $scope.$apply(function($scope) {
                $scope.myImage = evt.target.result;
            });
        };
        reader.readAsDataURL(file);
    };
    $scope.uploader.onSuccessItem = function(fileItem, response, status, headers) {
        $notifier.success("Invoice logo uploaded successfully");
        $scope.uploader.removeFromQueue(fileItem);
    };
    $scope.uploader.onErrorItem = function() {
        $notifier.error("Something went wrong!");
    };
    $scope.submit = function() {
        if ($scope.uploader.queue.length > 0) {
            var item = $scope.uploader.queue[0];
            item.url = $restApp.one("register/teams", $rootScope.userRegistration.team_id).all("logo").getRestangularUrl();
            item.formData.push($scope.data);
            $scope.uploader.uploadItem(item);
        }
        $scope.formData.registration_progress = "documents";
        $restApp.all("register/teams").patch($scope.formData).then(function() {
            $notifier.success("Invoice footer text updated successfully");
            $location.path("/register/documents");
        }, function(error) {
            $notifier.error("Something went wrong");
            if (typeof error.data === "object") {
                return $scope.errors = _(error.data).values().flatten().value();
            }
        });
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("register.invoice.footer", {
        url: "/footer",
        page: {
            title: "Invoice footer text"
        },
        templateUrl: "src/register/invoice/footer/footer.html",
        controller: "FooterController",
        resolve: {
            userRegistration: [ "$auth", function resolveAuthentication($auth) {
                return $auth.isRegistered();
            } ]
        }
    });
} ]);

"use strict";

angular.module("app").controller("InvoiceController", [ "$rootScope", "$scope", "$app", "$state", "$notifier", "$location", "$restApp", function($rootScope, $scope, $app, $state, $notifier, $location, $restApp) {
    $scope.errors = null;
    $scope.addressDisabled = true;
    $scope.formData = {
        team_id: "",
        invoice_address_line_1: "",
        invoice_address_line_2: "",
        invoice_town: "",
        invoice_county: "",
        invoice_postal_code: "",
        use_company_address: true
    };
    $scope.submit = function() {
        $scope.errors = null;
        $scope.formData.team_id = $rootScope.userRegistration.team_id;
        $scope.formData.registration_progress = "recipient_details";
        $restApp.all("register/teams").patch($scope.formData).then(function() {
            $notifier.success("Invoice details updated successfully");
            $location.path("/register/invoice/recipient");
        }, function(error) {
            $notifier.error("Something went wrong");
            if (typeof error.data === "object") {
                return $scope.errors = _(error.data).values().flatten().value();
            }
        });
    };
    $scope.isSameAsCompanyAddress = function() {
        $scope.addressDisabled = !$scope.addressDisabled;
    };
    $scope.nextStep = function() {
        $location.path("/register/invoice/recipient");
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("register.invoice", {
        url: "/invoice",
        page: {
            title: "Invoice Details"
        },
        templateUrl: "src/register/invoice/invoice.html",
        controller: "InvoiceController",
        resolve: {
            userRegistration: [ "$auth", function resolveAuthentication($auth) {
                return $auth.isRegistered();
            } ]
        }
    });
} ]);

"use strict";

angular.module("app").controller("RecipientController", [ "$rootScope", "$scope", "$app", "$state", "$notifier", "$location", "$restApp", function($rootScope, $scope, $app, $state, $notifier, $location, $restApp) {
    $scope.errors = null;
    $scope.formData = {
        team_id: "",
        invoice_recipient_name: "",
        invoice_recipient_email: "",
        invoice_recipient_phone: ""
    };
    $scope.submit = function() {
        $scope.errors = null;
        $scope.formData.team_id = $rootScope.userRegistration.team_id;
        $scope.formData.registration_progress = "invoice_footer_details";
        $restApp.all("register/teams").patch($scope.formData).then(function() {
            $notifier.success("Recipient details updated successfully");
            $location.path("/register/invoice/footer");
        }, function(error) {
            $notifier.error("Something went wrong");
            if (typeof error.data === "object") {
                return $scope.errors = _(error.data).values().flatten().value();
            }
        });
    };
    $scope.nextStep = function() {
        $location.path("register/invoice/footer");
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("register.invoice.recipient", {
        url: "/recipient",
        page: {
            title: "Recipient details"
        },
        templateUrl: "src/register/invoice/recipient/recipient.html",
        controller: "RecipientController",
        resolve: {
            userRegistration: [ "$auth", function resolveAuthentication($auth) {
                return $auth.isRegistered();
            } ]
        }
    });
} ]);

"use strict";

angular.module("app").controller("NavController", [ "$scope", "$location", function($scope, $location) {
    $scope.isActive = function(path) {
        if (path === "/register/company") {
            var active = path === $location.path() || $location.path() === "/register/company/location";
        } else if (path === "/register/invoice") {
            var active = path === $location.path() || $location.path() === "/register/invoice/footer" || $location.path() === "/register/invoice/recipient";
        } else if (path === "/register/documents") {
            var active = path === $location.path() || $location.path() === "/register/success";
        } else {
            var active = path === $location.path();
        }
        return active;
    };
} ]);

"use strict";

angular.module("app").controller("ProgressController", [ "$scope", "$location", function($scope, $location) {
    $scope.init = function() {
        setTimeout(function() {
            var elm = $("#navbar .active");
            var x = elm.offset();
            if (x) {
                var ratio = elm.width() / 2;
                var progressBar = ratio + x.left + "px";
                if ($location.path() === "/register/success") {
                    progressBar = "100%";
                }
                $("#status").css("width", progressBar);
            }
        }, 500);
    };
} ]);

"use strict";

angular.module("app").controller("RegisterController", [ "$scope", "$app", "$state", "$err", "$notifier", "$location", "$restApp", function($scope, $app, $state, $err, $notifier, $location, $restApp) {
    $scope.formData = {
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        subscribe: false,
        agreeTermsConditions: false
    };
    $scope.errors = null;
    $scope.success = false;
    $scope.register = function() {
        $scope.errors = null;
        $scope.success = false;
        $restApp.all("register").post($scope.formData).then(function() {
            $scope.success = true;
            $notifier.success("Registration was successful");
        }, function(error) {
            $notifier.error("Something went wrong");
            if (typeof error.data === "object") {
                return $scope.errors = _(error.data).values().flatten().value();
            }
        });
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("register", {
        url: "/register",
        page: {
            title: "Registration"
        },
        templateUrl: "src/register/register.html"
    });
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("register.success", {
        url: "/success",
        page: {
            title: "Registration Completed"
        },
        templateUrl: "src/register/success/success.html",
        controller: "SuccessController",
        resolve: {
            userRegistration: [ "$auth", function resolveAuthentication($auth) {
                return $auth.isRegistered();
            } ]
        }
    });
} ]);

"use strict";

angular.module("app").controller("SuccessController", [ "$scope", "$auth", "$location", function($scope, $auth, $location) {
    $("body,html").animate({
        scrollTop: 0
    }, 500);
    $scope.goToDashboard = function() {
        $auth.check();
        $location.path("user/dashboard");
    };
    $scope.getYear = function() {
        var currentdate = new Date();
        return currentdate.getFullYear();
    };
} ]);

"use strict";

angular.module("app").factory("restErrorInterceptor", function() {
    function isLaravelValidation(response) {
        var l5validation = false;
        if (typeof response.data === "string") {
            return false;
        }
        $.each(response.data, function(index) {
            if (typeof response.data[index] == "object") {
                l5validation = true;
            }
            return false;
        });
        return l5validation;
    }
    function extractMessage(response) {
        return $.map(response.data, function(messages) {
            return messages.join("<br/>");
        }).join("<br/>");
    }
    function pushNormalError($err, lastRequest, response) {
        if (!isDefined(response.data.messages) && isLaravelValidation(response)) {
            var message = extractMessage(response);
        } else {
            var message = isDefined(response.data.messages) ? response.data.messages : response.statusText;
        }
        $err.error(lastRequest, message, response);
    }
    return {
        intercept: function(lastRequest, $err, $rootScope, response) {
            if (response.status == 422) {
                $err.error(lastRequest, isDefined(response.data) ? JSON.stringify(response.data) : response.statusText, response);
            } else {
                pushNormalError($err, lastRequest, response);
            }
        },
        userIntercept: function(lastRequest, $err, $rootScope, response) {
            if (response.status == 401) {
                $rootScope.$broadcast("guard.out", extractMessage(response));
            } else {
                this.intercept.apply(this, arguments);
            }
        }
    };
}).config([ "RestangularProvider", function(RestangularProvider) {
    RestangularProvider.setDefaultHeaders({
        "X-Requested-With": "XMLHttpRequest"
    });
    RestangularProvider.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
        var extractedData;
        extractedData = isDefined(data.data) ? data.data : [];
        extractedData.paginator = isDefined(data.paginator) ? data.paginator : [];
        extractedData.messages = isDefined(data.messages) ? data.messages : [];
        extractedData.properties = isDefined(data.properties) ? data.properties : [];
        return extractedData;
    });
} ]).factory("$restAuth", [ "Restangular", "$err", "restErrorInterceptor", "$rootScope", function(Restangular, $err, restErrorInterceptor, $rootScope) {
    return Restangular.withConfig(function(RestangularConfigurer) {
        RestangularConfigurer.setBaseUrl("/api/auth");
        var lastRequest = null;
        RestangularConfigurer.addRequestInterceptor(function(element, operation, what, url) {
            lastRequest = operation + " | " + url;
            $err.clearLast();
            return element;
        });
        RestangularConfigurer.setErrorInterceptor(restErrorInterceptor.intercept.bind(restErrorInterceptor, lastRequest, $err, $rootScope));
    });
} ]).factory("$restAdmin", [ "Restangular", "$err", "restErrorInterceptor", "$rootScope", function(Restangular, $err, restErrorInterceptor, $rootScope) {
    return Restangular.withConfig(function(RestangularConfigurer) {
        RestangularConfigurer.setBaseUrl("/api/admin");
        var lastRequest = null;
        RestangularConfigurer.addRequestInterceptor(function(element, operation, what, url) {
            lastRequest = operation + " | " + url;
            $err.clearLast();
            return element;
        });
        RestangularConfigurer.setErrorInterceptor(restErrorInterceptor.userIntercept.bind(restErrorInterceptor, lastRequest, $err, $rootScope));
    });
} ]).factory("$restUser", [ "Restangular", "$err", "$rootScope", "restErrorInterceptor", function(Restangular, $err, $rootScope, restErrorInterceptor) {
    return Restangular.withConfig(function(RestangularConfigurer) {
        RestangularConfigurer.setBaseUrl("/api/user");
        var lastRequest = null;
        RestangularConfigurer.addRequestInterceptor(function(element, operation, what, url) {
            lastRequest = operation + " | " + url;
            $err.clearLast();
            return element;
        });
        RestangularConfigurer.setErrorInterceptor(restErrorInterceptor.userIntercept.bind(restErrorInterceptor, lastRequest, $err, $rootScope));
    });
} ]).factory("$restDirectory", [ "Restangular", "$err", "$rootScope", "restErrorInterceptor", function(Restangular, $err, $rootScope, restErrorInterceptor) {
    return Restangular.withConfig(function(RestangularConfigurer) {
        RestangularConfigurer.setBaseUrl("/api/directory");
        var lastRequest = null;
        RestangularConfigurer.addRequestInterceptor(function(element, operation, what, url) {
            lastRequest = operation + " | " + url;
            $err.clearLast();
            return element;
        });
        RestangularConfigurer.setErrorInterceptor(restErrorInterceptor.userIntercept.bind(restErrorInterceptor, lastRequest, $err, $rootScope));
    });
} ]).factory("$restApp", [ "Restangular", "$err", "$rootScope", "restErrorInterceptor", function(Restangular, $err, $rootScope, restErrorInterceptor) {
    return Restangular.withConfig(function(RestangularConfigurer) {
        RestangularConfigurer.setBaseUrl("/api");
        var lastRequest = null;
        RestangularConfigurer.addRequestInterceptor(function(element, operation, what, url) {
            lastRequest = operation + " | " + url;
            return element;
        });
        RestangularConfigurer.setErrorInterceptor(restErrorInterceptor.userIntercept.bind(restErrorInterceptor, lastRequest, $err, $rootScope));
    });
} ]);

angular.module("app").directive("setNgAnimate", [ "$animate", function($animate) {
    return {
        link: function($scope, $element, $attrs) {
            $scope.$watch(function() {
                return $scope.$eval($attrs.setNgAnimate, $scope);
            }, function(valnew, valold) {
                $animate.enabled(!!valnew, $element);
            });
        }
    };
} ]);

angular.module("app").directive("uiButterbar", [ "$rootScope", "$anchorScroll", function($rootScope, $anchorScroll) {
    return {
        restrict: "AC",
        template: '<span class="bar"></span>',
        link: function(scope, el, attrs) {
            el.addClass("butterbar hide");
            scope.$on("$stateChangeStart", function(event) {
                $anchorScroll();
                el.removeClass("hide").addClass("active");
            });
            scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState) {
                event.targetScope.$watch("$viewContentLoaded", function() {
                    el.addClass("hide").removeClass("active");
                });
            });
        }
    };
} ]);

angular.module("app").directive("uiFocus", [ "$timeout", "$parse", function($timeout, $parse) {
    return {
        link: function(scope, element, attr) {
            var model = $parse(attr.uiFocus);
            scope.$watch(model, function(value) {
                if (value === true) {
                    $timeout(function() {
                        element[0].focus();
                    });
                }
            });
            element.bind("blur", function() {
                scope.$apply(model.assign(scope, false));
            });
        }
    };
} ]);

angular.module("app").directive("uiNav", [ "$timeout", function($timeout) {
    return {
        restrict: "AC",
        link: function(scope, el, attr) {
            var _window = $(window), _mb = 768, wrap = $(".app-aside"), next, backdrop = ".dropdown-backdrop";
            el.on("click", "a", function(e) {
                next && next.trigger("mouseleave.nav");
                var _this = $(this);
                _this.parent().siblings(".active").toggleClass("active");
                _this.next().is("ul") && _this.parent().toggleClass("active") && e.preventDefault();
                _this.next().is("ul") || _window.width() < _mb && $(".app-aside").removeClass("show off-screen");
            });
            el.on("mouseenter", "a", function(e) {
                next && next.trigger("mouseleave.nav");
                $("> .nav", wrap).remove();
                if (!$(".app-aside-fixed.app-aside-folded").length || _window.width() < _mb || $(".app-aside-dock").length) return;
                var _this = $(e.target), top, w_h = $(window).height(), offset = 50, min = 150;
                !_this.is("a") && (_this = _this.closest("a"));
                if (_this.next().is("ul")) {
                    next = _this.next();
                } else {
                    return;
                }
                _this.parent().addClass("active");
                top = _this.parent().position().top + offset;
                next.css("top", top);
                if (top + next.height() > w_h) {
                    next.css("bottom", 0);
                }
                if (top + min > w_h) {
                    next.css("bottom", w_h - top - offset).css("top", "auto");
                }
                next.appendTo(wrap);
                next.on("mouseleave.nav", function(e) {
                    $(backdrop).remove();
                    next.appendTo(_this.parent());
                    next.off("mouseleave.nav").css("top", "auto").css("bottom", "auto");
                    _this.parent().removeClass("active");
                });
                $(".smart").length && $('<div class="dropdown-backdrop"/>').insertAfter(".app-aside").on("click", function(next) {
                    next && next.trigger("mouseleave.nav");
                });
            });
            wrap.on("mouseleave", function(e) {
                next && next.trigger("mouseleave.nav");
                $("> .nav", wrap).remove();
            });
        }
    };
} ]);

angular.module("app").directive("uiScrollTo", [ "$location", "$anchorScroll", function($location, $anchorScroll) {
    return {
        restrict: "AC",
        link: function(scope, el, attr) {
            el.on("click", function(e) {
                $location.hash(attr.uiScrollTo);
                $anchorScroll();
            });
        }
    };
} ]);

angular.module("app").directive("uiShift", [ "$timeout", function($timeout) {
    return {
        restrict: "A",
        link: function(scope, el, attr) {
            var _el = $(el), _window = $(window), prev = _el.prev(), parent, width = _window.width();
            !prev.length && (parent = _el.parent());
            function sm() {
                $timeout(function() {
                    var method = attr.uiShift;
                    var target = attr.target;
                    _el.hasClass("in") || _el[method](target).addClass("in");
                });
            }
            function md() {
                parent && parent["prepend"](el);
                !parent && _el["insertAfter"](prev);
                _el.removeClass("in");
            }
            width < 768 && sm() || md();
            _window.resize(function() {
                if (width !== _window.width()) {
                    $timeout(function() {
                        _window.width() < 768 && sm() || md();
                        width = _window.width();
                    });
                }
            });
        }
    };
} ]);

angular.module("app").directive("uiToggleClass", [ "$timeout", "$document", function($timeout, $document) {
    return {
        restrict: "AC",
        link: function(scope, el, attr) {
            el.on("click", function(e) {
                e.preventDefault();
                var classes = attr.uiToggleClass.split(","), targets = attr.target && attr.target.split(",") || Array(el), key = 0;
                angular.forEach(classes, function(_class) {
                    var target = targets[targets.length && key];
                    _class.indexOf("*") !== -1 && magic(_class, target);
                    $(target).toggleClass(_class);
                    key++;
                });
                $(el).toggleClass("active");
                function magic(_class, target) {
                    var patt = new RegExp("\\s" + _class.replace(/\*/g, "[A-Za-z0-9-_]+").split(" ").join("\\s|\\s") + "\\s", "g");
                    var cn = " " + $(target)[0].className + " ";
                    while (patt.test(cn)) {
                        cn = cn.replace(patt, " ");
                    }
                    $(target)[0].className = $.trim(cn);
                }
            });
        }
    };
} ]);

"use strict";

angular.module("app").filter("fromNow", function() {
    return function(date) {
        return moment(date).fromNow();
    };
});

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.account", {
        abstract: true,
        url: "/my",
        template: "<div data-ui-view></div>"
    });
} ]);

"use strict";

angular.module("app").controller("UserFeedbackAddController", [ "modalParams", "$scope", "$restUser", "$err", "$notifier", "$state", function(modalParams, $scope, $restUser, $err, $notifier, $state) {
    if (!modalParams.job_id) {
        return;
    }
    $scope.job_id = modalParams.job_id || null;
    $scope.formSubmitted = false;
    $err.tryPromise($restUser.one("jobs", $scope.job_id).get()).then(function(job) {
        $scope.job = job;
    });
    $scope.create = function() {
        $scope.formSubmitted = true;
        $scope.job.post("feedback", {
            rating: $scope.feedback.rating,
            comment: $scope.feedback.comment,
            bid_id: modalParams.bid_id
        }).then(function() {
            $scope.$dismiss();
            $notifier.success("Feedback sent successfully");
            $scope.formSubmitted = false;
            $state.reload();
        });
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.account.feedback.add", {
        url: "/feedback/add/{job_id}/{bid_id}",
        page: {
            title: "Add feedback",
            class: "icon-layers",
            description: "Add feedback"
        },
        modal: "md",
        controller: "UserFeedbackAddController",
        templateUrl: "src/user/account/feedback/add/add.html"
    });
} ]);

"use strict";

angular.module("app").controller("UserFeedbackController", [ "$scope", "$location", "$err", "$restUser", "ngTableParams", function($scope, $location, $err, $restUser, ngTableParams) {
    $scope.tableParams = new ngTableParams(angular.extend({
        page: 1,
        count: 10,
        sorting: {
            created_at: "desc"
        }
    }, $location.search()), {
        total: 0,
        getData: function($defer, params) {
            $location.search(params.url());
            $err.tryPromise($restUser.all("feedbacks").getList(params.url())).then(function(result) {
                $scope.tableParams.settings({
                    total: result.paginator.total
                });
                $defer.resolve(result);
                $scope.loading = false;
            });
        }
    });
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.account.feedback", {
        url: "/feedback",
        page: {
            title: "My feedback",
            class: "icon-layers",
            description: "My feedback"
        },
        controller: "UserFeedbackController",
        templateUrl: "src/user/account/feedback/feedback.html"
    });
} ]);

"use strict";

angular.module("app").controller("UserJobsBidsController", [ "$q", "$scope", "$state", "modalParams", "ngTableParams", "$restUser", "$restApp", "$notifier", "$app", "$err", function($q, $scope, $state, modalParams, ngTableParams, $restUser, $restApp, $notifier, $app, $err) {
    if (!modalParams.job_id) return;
    $scope.loading = true;
    $scope.job_id = modalParams.job_id || null;
    $err.tryPromise($restUser.one("jobs", $scope.job_id).get()).then(function(data) {
        $scope.job = data;
    });
    $scope.tableParams = new ngTableParams({
        page: 1,
        count: 10,
        sorting: {
            bid_date: "desc"
        },
        filter: {
            job_id: $scope.job_id
        }
    }, {
        total: 0,
        getData: function($defer, params) {
            $err.tryPromise($restUser.all("bids").getList(params.url())).then(function(result) {
                $scope.loading = false;
                $scope.tableParams.settings({
                    total: result.paginator.total
                });
                $defer.resolve(result);
            });
        }
    });
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.account.jobs.bids", {
        url: "/{job_id}/bids",
        page: {
            title: "My Jobs",
            class: "icon-layers",
            description: "My jobs"
        },
        modal: "lg",
        controller: "UserJobsBidsController",
        templateUrl: "src/user/account/jobs/bids/bids.html"
    });
} ]);

"use strict";

angular.module("app").controller("UserJobsBidsConfirmController", [ "$q", "$scope", "$state", "modalParams", "$restUser", "$restApp", "$notifier", "$app", "$err", "$moment", function($q, $scope, $state, modalParams, $restUser, $restApp, $notifier, $app, $err, $moment) {
    $scope.formSubmitted = false;
    if (!modalParams.job_id) return;
    if (!modalParams.bid_id) return;
    $scope.job_id = modalParams.job_id || null;
    $scope.bid_id = modalParams.bid_id || null;
    $err.tryPromise($restUser.one("jobs", $scope.job_id).get()).then(function(data) {
        $scope.job = data;
    });
    var query = {
        filter: {
            job_id: $scope.job_id,
            id: $scope.bid_id
        }
    };
    $err.tryPromise($restUser.all("bids").getList(flattenParams(query))).then(function(data) {
        $scope.bid = data[0];
    });
    $scope.confirmBid = function() {
        $scope.formSubmitted = true;
        $scope.job.status = "progress";
        $scope.job.status_date = $moment().format();
        $scope.job.bid_id = $scope.bid_id;
        $scope.job.bid_user_id = $scope.bid.user_id;
        $scope.job.bid_amount = $scope.bid.amount;
        $scope.job.bid_details = $scope.details;
        $err.tryPromise($scope.job.put()).then(function() {
            $notifier.success("Bid accepted successfully");
            $scope.$close(true);
        }, function(error) {
            $scope.formSubmitted = false;
        });
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.account.jobs.bids.confirm", {
        url: "/{bid_id}/confirm",
        page: {
            title: "My Jobs",
            class: "icon-layers",
            description: "My jobs"
        },
        modal: "lg",
        controller: "UserJobsBidsConfirmController",
        templateUrl: "src/user/account/jobs/bids/confirm/confirm.html"
    });
} ]);

"use strict";

angular.module("app").controller("UserBidFeedbackController", UserBidFeedbackController);

UserBidFeedbackController.$inject = [ "$restUser", "ngTableParams", "$scope", "modalParams", "$err" ];

function UserBidFeedbackController($restUser, ngTableParams, $scope, modalParams, $err) {
    if (!modalParams.team_id || !modalParams.job_id) return;
    $scope.team_id = modalParams.team_id;
    $scope.job_id = modalParams.job_id;
    $scope.tableParams = new ngTableParams({
        page: 1,
        count: 10,
        sorting: {
            created_at: "desc"
        }
    }, {
        total: 0,
        getData: function($defer, params) {
            $restUser.one("team-feedback", $scope.team_id).get().then(function(result) {
                $scope.team = result;
                $scope.tableParams.settings({
                    total: result.feedback.length
                });
                $defer.resolve(result.feedback);
            });
        }
    });
}

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.account.jobs.bids.feedback", {
        url: "{team_id}/feedback",
        page: {
            title: "User Feedback",
            class: "icon-user",
            description: "User Feedback"
        },
        modal: "lg",
        controller: "UserBidFeedbackController",
        templateUrl: "src/user/account/jobs/bids/feedback/feedback.html"
    });
} ]);

"use strict";

angular.module("app").controller("UserJobsCancelController", [ "$q", "$scope", "$state", "modalParams", "$restUser", "$restApp", "$notifier", "$app", "$err", "$moment", function($q, $scope, $state, modalParams, $restUser, $restApp, $notifier, $app, $err, $moment) {
    if (!modalParams.job_id) return;
    $scope.job_id = modalParams.job_id || null;
    $scope.formSubmitted = false;
    $err.tryPromise($restUser.one("jobs", $scope.job_id).get()).then(function(data) {
        $scope.job = data;
    });
    $scope.cancelJob = function() {
        $scope.formSubmitted = true;
        $scope.job.status = "cancel";
        $scope.job.status_date = $moment().format();
        $err.tryPromise($scope.job.put()).then(function() {
            $scope.formSubmitted = false;
            $scope.$close(true);
            $notifier.success("Job cancelled successfully");
        });
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.account.jobs.cancel", {
        url: "/{job_id}/cancel",
        page: {
            title: "My Jobs",
            class: "icon-layers",
            description: "My jobs"
        },
        modal: "lg",
        controller: "UserJobsCancelController",
        templateUrl: "src/user/account/jobs/cancel/cancel.html"
    });
} ]);

"use strict";

angular.module("app").controller("UserJobsFeedbackController", [ "$scope", "$err", "modalParams", "$restUser", function($scope, $err, modalParams, $restUser) {
    if (!modalParams.job_id) return;
    $scope.loading = true;
    $scope.job_id = modalParams.job_id || null;
    $err.tryPromise($restUser.one("jobs", $scope.job_id).get()).then(function(data) {
        $scope.loading = false;
        $scope.data = data;
    });
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.account.jobs.feedback", {
        url: "/{job_id}/feedback",
        page: {
            title: "Read Feedback",
            class: "icon-layers",
            description: "Read feedback"
        },
        modal: "md",
        controller: "UserJobsFeedbackController",
        templateUrl: "src/user/account/jobs/feedback/feedback.html"
    });
} ]);

"use strict";

angular.module("app").controller("UserJobsInvoiceController", [ "$q", "$scope", "$state", "modalParams", "$restUser", "$restApp", "$notifier", "$app", "$err", "$moment", "$auth", function($q, $scope, $state, modalParams, $restUser, $restApp, $notifier, $app, $err, $moment, $auth) {
    if (!modalParams.job_id) return;
    $scope.job_id = modalParams.job_id || null;
    $scope.loading = true;
    $scope.date = $moment().format();
    var query = {
        filter: {
            job_id: $scope.job_id
        }
    };
    $err.tryPromise($restUser.one("invoices").get(flattenParams(query))).then(function(data) {
        $scope.loading = false;
        var invoice = data[0];
        if (invoice.job.bid.user.team_info.id === $auth.user().team_id || invoice.job.user_info.team_info.id == $auth.user().team_id) {
            $scope.data = invoice;
        } else {
            $scope.data = null;
        }
    });
    $err.tryPromise($restUser.one("invoices").get(flattenParams({
        filter: {
            id: query.filter.job_id
        }
    }))).then(function(data) {
        var job = data[0];
        $scope.details = job.details;
    });
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.account.jobs.invoice", {
        url: "/{job_id}/invoice",
        page: {
            title: "My Jobs",
            class: "icon-layers",
            description: "My jobs"
        },
        modal: "lg",
        controller: "UserJobsInvoiceController",
        templateUrl: "src/user/account/jobs/invoice/invoice.html"
    });
} ]);

"use strict";

angular.module("app").controller("UserJobsController", [ "$scope", "$moment", "$notifier", "$location", "$err", "ngTableParams", "$restUser", function($scope, $moment, $notifier, $location, $err, ngTableParams, $restUser) {
    $scope.loading = true;
    $scope.statuses = {
        active: {
            name: "Active",
            description: "Waiting for bids"
        },
        progress: {
            name: "In Progress",
            description: "Out for delivery"
        },
        delivered: {
            name: "Delivered",
            description: "Out for delivery"
        },
        invoice: {
            name: "Invoiced",
            description: "Invoice received"
        },
        complete: {
            name: "Completed",
            description: "Job completed"
        },
        cancel: {
            name: "Cancelled",
            description: "Job cancelled"
        },
        expire: {
            name: "Expired",
            description: "Job expired"
        }
    };
    $scope.richStatuses = {};
    $scope.tableParams = new ngTableParams(angular.extend({
        page: 1,
        count: 10,
        sorting: {
            created_at: "desc"
        }
    }, $location.search()), {
        total: 0,
        getData: function($defer, params) {
            $location.search(params.url());
            $err.tryPromise($restUser.all("jobs").getList(params.url())).then(function(result) {
                $scope.richStatuses = result.properties.statuses;
                $scope.tableParams.settings({
                    total: result.paginator.total
                });
                $defer.resolve(result);
                $scope.loading = false;
            });
        }
    });
    $scope.getJobStatus = function(job) {
        if (job.status == "invoice" && job.payment_received) {
            return "Paid";
        }
        return $scope.statuses[job.status].name;
    };
    $scope.getJobInfo = function(job) {
        if (job.status == "active" && job.bids_count > 0) {
            return "You have received bids";
        }
        if (job.status == "progress" && job.bid_manual) {
            return "Job allocated manually";
        }
        if (job.status == "invoice" && !job.payment_received) {
            return "You have unpaid invoices";
        }
        if (job.status == "invoice" && job.payment_received) {
            return "Your payment has been received";
        }
        return $scope.statuses[job.status].description;
    };
    $scope.formSubmitted = false;
    $scope.complete = function(job) {
        $scope.formSubmitted = true;
        $err.tryPromise($restUser.one("jobs", job.id).get()).then(function(result) {
            result.completed = true;
            result.status = "complete";
            result.status_date = $moment().format();
            $err.tryPromise(result.put()).then(function() {
                job.completed = true;
                job.status = "complete";
                $notifier.success("Job completed successfully");
            });
        });
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.account.jobs", {
        url: "/jobs",
        preserveQueryParams: true,
        page: {
            title: "My Jobs",
            description: "My jobs"
        },
        controller: "UserJobsController",
        templateUrl: "src/user/account/jobs/jobs.html"
    });
} ]);

"use strict";

angular.module("app").controller("UserJobsManualController", [ "$err", "$scope", "modalParams", "$restUser", "$notifier", "$moment", function($err, $scope, modalParams, $restUser, $notifier, $moment) {
    if (!modalParams.job_id) return;
    $scope.job_id = modalParams.job_id || null;
    $scope.loading = true;
    $scope.formSubmitted = false;
    $scope.job = {};
    $err.tryPromise($restUser.one("jobs", $scope.job_id).get()).then(function(data) {
        $scope.loading = false;
        $scope.job = data;
    });
    $scope.setUserId = function($item, $model) {
        $scope.job.bid_user_id = $model.id;
        $scope.job.bid_add_vat = $model.team.invoice_details.invoice_including_vat;
    };
    $scope.getUsers = function(value) {
        return $restUser.all("user").getList(flattenParams({
            filters: {
                search: value,
                inactivated: 0
            }
        })).then(function(result) {
            return result.plain();
        });
    };
    $scope.store = function() {
        $scope.formSubmitted = true;
        $scope.job.bid_manual = 1;
        $scope.job.status = "progress";
        $scope.job.status_date = $moment().format();
        $err.tryPromise($scope.job.put()).then(function() {
            $notifier.success("Job allocated successfully");
            $scope.$close(true);
        }, function() {
            $notifier.error("Job allocation error");
            $scope.formSubmitted = false;
        });
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.account.jobs.manual", {
        url: "/{job_id}/manual",
        page: {
            title: "My Jobs",
            class: "icon-layers",
            description: "My jobs"
        },
        modal: "lg",
        controller: "UserJobsManualController",
        templateUrl: "src/user/account/jobs/manual/manual.html"
    });
} ]);

"use strict";

angular.module("app").controller("UserJobsNotesController", [ "$q", "$scope", "$state", "modalParams", "$restUser", "$restApp", "$notifier", "$app", "$err", "$moment", "$auth", "$stateParams", function($q, $scope, $state, modalParams, $restUser, $restApp, $notifier, $app, $err, $moment, $auth, $stateParams) {
    if (!modalParams.job_id) return;
    $scope.job_id = modalParams.job_id || null;
    $scope.notes = modalParams.notes || "No notes available";
    $scope.bid_details = modalParams.bid_details || "No job details available";
    $scope.loading = false;
    $scope.date = $moment().format();
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.account.jobs.notes", {
        url: "/{job_id}/notes",
        page: {
            title: "My Jobs",
            class: "icon-layers",
            description: "My jobs"
        },
        params: {
            job_id: null,
            notes: null,
            bid_details: null
        },
        modal: "lg",
        controller: "UserJobsNotesController",
        templateUrl: "src/user/account/jobs/notes/notes.html"
    });
} ]);

"use strict";

angular.module("app").controller("UserJobsPodController", [ "$scope", "modalParams", "$restUser", "$err", "$auth", function($scope, modalParams, $restUser, $err, $auth) {
    if (!modalParams.job_id) return;
    $scope.job_id = modalParams.job_id || null;
    $err.tryPromise($restUser.all("pods").getList({
        "filter[job_id]": $scope.job_id
    })).then(function(data) {
        $restUser.one("team", $auth.user().team_id).get().then(function(team) {
            if (team.id !== $auth.user().team.id) {
                return;
            } else {
                $scope.pod = data[0];
            }
        });
    });
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.account.jobs.pod", {
        url: "/{job_id}/pod",
        page: {
            title: "My Work",
            class: "icon-layers",
            description: "My Work"
        },
        modal: "lg",
        controller: "UserJobsPodController",
        templateUrl: "src/user/account/jobs/pod/pod.html"
    });
} ]);

"use strict";

angular.module("app").controller("UserAvatarController", [ "$q", "$scope", "$state", "modalParams", "$restUser", "$notifier", "$app", "$err", "FileUploader", "$auth", function($q, $scope, $state, modalParams, $restUser, $notifier, $app, $err, FileUploader, $auth) {
    $scope.uploader = new FileUploader();
    $scope.user_id = modalParams.user_id || null;
    $scope.data = {
        user_id: $scope.user_id
    };
    $scope.myImage = "";
    $scope.myCroppedImage = "";
    $scope.store = function() {
        if ($scope.uploader.queue.length > 0) {
            var item = $scope.uploader.queue[0];
            item.url = $restUser.all("avatar").getRestangularUrl();
            item.formData.push($scope.data);
            $scope.uploader.uploadItem(item);
        }
    };
    $scope.uploader.onAfterAddingFile = function(fileItem) {
        $scope.status = "loading";
        var file = fileItem._file;
        var reader = new FileReader();
        reader.onload = function(evt) {
            $scope.status = "loaded";
            $scope.$apply(function($scope) {
                $scope.myImage = evt.target.result;
            });
        };
        reader.readAsDataURL(file);
    };
    $scope.uploader.onBeforeUploadItem = function(item) {
        var blob = dataURItoBlob($scope.myCroppedImage);
        item._file = blob;
    };
    var dataURItoBlob = function(dataURI) {
        var binary = atob(dataURI.split(",")[1]);
        var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
        var array = [];
        for (var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        return new Blob([ new Uint8Array(array) ], {
            type: mimeString
        });
    };
    $scope.uploader.onProgressItem = function(fileItem, progress) {
        $scope.progress = progress;
    };
    $scope.uploader.onSuccessItem = function(fileItem, response, status, headers) {
        $notifier.success("Avatar uploaded successfully");
        $scope.uploader.removeFromQueue(fileItem);
        if ($scope.user_id == $auth.user().id) {
            $auth.user().avatar_url = response.data.avatar + "?decache=" + Math.random();
        }
        $app.goTo("user.account.profile");
        $scope.$close(true);
    };
    $scope.uploader.onErrorItem = function() {
        $notifier.error("Something went wrong!");
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.account.profile.avatar", {
        url: "/{user_id}/avatar",
        page: {
            title: "Manage Avatar",
            class: "icon-envelope",
            description: "Add/Edit avatar image"
        },
        modal: "lg",
        controller: "UserAvatarController",
        templateUrl: "src/user/account/profile/avatar/avatar.html"
    });
} ]);

"use strict";

angular.module("app").controller("UserProfileDocumentController", [ "$q", "$scope", "$state", "modalParams", "$restUser", "$restApp", "$notifier", "$app", "$err", "FileUploader", "$moment", function($q, $scope, $state, modalParams, $restUser, $restApp, $notifier, $app, $err, FileUploader, $moment) {
    if (!modalParams.user_id) return;
    $scope.user_id = modalParams.user_id || null;
    $scope.uploader = new FileUploader();
    $scope.uploader.filters.push({
        name: "typeFilter",
        fn: function(item, options) {
            var type = "|" + item.type.slice(item.type.lastIndexOf("/") + 1) + "|";
            return "|jpg|png|jpeg|pdf|doc|docx|zip|".indexOf(type) !== -1;
        }
    });
    $scope.uploader.filters.push({
        name: "sizeFilter",
        fn: function(item, options) {
            return item.size < 2e7;
        }
    });
    var dateFormat = "YYYY-MM-DD HH:mm:ss";
    $scope.formSubmitted = false;
    $scope.data = {
        user_id: $scope.user_id,
        type_id: 0,
        status: "pending"
    };
    $restUser.all("doctypes").getList().then(function(result) {
        $scope.doctypes = result;
    });
    $scope.minDate = $moment().toDate();
    $scope.store = function() {
        if ($scope.data.selected_type.expiry_required === 0) {
            $scope.data.expiry = "0000-00-00";
        } else {
            $scope.data.expiry = $moment($scope.data.expiry).format(dateFormat);
        }
        $scope.formSubmitted = true;
        $scope.data.expiry = $moment($scope.data.expiry).format(dateFormat);
        if ($scope.uploader.queue.length > 0) {
            var item = $scope.uploader.queue[0];
            item.url = $restUser.one("profile", $scope.user_id).all("documents").getRestangularUrl();
            item.formData.push($scope.data);
            $scope.uploader.uploadItem(item);
        }
    };
    $scope.uploader.onAfterAddingFile = function(fileItem) {
        $scope.file = {
            name: fileItem.file.name,
            size: fileItem.file.size
        };
    };
    $scope.uploader.onProgressItem = function(fileItem, progress) {
        $scope.progress = progress;
    };
    $scope.uploader.onSuccessItem = function(item, response, status, header) {
        $scope.formSubmitted = false;
        $notifier.success("Document uploaded successfully");
        $scope.uploader.removeFromQueue(item);
        $app.goTo("user.account.profile.documents");
        $scope.$close(true);
    };
    $scope.uploader.onWhenAddingFileFailed = function(item, filter, options) {
        $scope.formSubmitted = false;
        if (filter.name === "typeFilter") {
            $notifier.error("Cannot add " + item.name + " as it is not an allowed file type");
        }
        if (filter.name === "sizeFilter") {
            $notifier.error(item.name + " is too large, please select a smaller file");
        }
    };
    $scope.uploader.onErrorItem = function() {
        $scope.formSubmitted = false;
        $notifier.error("Something went wrong!");
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.account.profile.documents.add", {
        url: "/{user_id}/add",
        page: {
            title: "Add Document",
            class: "icon-envelope",
            description: "Upload document"
        },
        modal: "md",
        controller: "UserProfileDocumentController",
        templateUrl: "src/user/account/profile/documents/add/add.html"
    });
} ]);

"use strict";

angular.module("app").controller("UserProfileDocumentsController", UserProfileDocumentsController);

UserProfileDocumentsController.$inject = [ "$q", "$location", "$scope", "$auth", "$restUser", "$notifier", "$err", "ngTableParams", "$moment" ];

function UserProfileDocumentsController($q, $location, $scope, $auth, $restUser, $notifier, $err, ngTableParams, $moment) {
    $auth.assure(function() {
        $scope.user_id = $scope.id = $location.search().user_id ? $location.search().user_id : $auth.user().id;
        $scope.tableParams = new ngTableParams(angular.extend({
            page: 1,
            count: 10,
            sorting: {
                title: "asc"
            }
        }, $location.search()), {
            total: 0,
            getData: function($defer, params) {
                $location.search(params.url());
                $err.tryPromise($restUser.one("profile", $scope.user_id).all("documents").getList(params.url())).then(function(result) {
                    $scope.tableParams.settings({
                        total: result.paginator.total
                    });
                    $defer.resolve(result);
                });
            }
        });
    });
    $scope.destroy = function(document) {
        $err.tryPromise(document.remove()).then(function() {
            $notifier.success("Document removed successfully");
            $scope.tableParams.reload();
        });
    };
}

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.account.profile.documents", {
        url: "/documents",
        page: {
            title: "Documents",
            class: "icon-layers",
            description: "Documents"
        },
        controller: "UserProfileDocumentsController",
        templateUrl: "src/user/account/profile/documents/documents.html"
    });
} ]);

"use strict";

angular.module("app").controller("UserProfileLocationsEditController", [ "$q", "$auth", "$scope", "$state", "modalParams", "$restUser", "$notifier", "$app", "$err", "$location", "uiGmapIsReady", function($q, $auth, $scope, $state, modalParams, $restUser, $notifier, $app, $err, $location, uiGmapIsReady) {
    $scope.id = modalParams.id || null;
    $scope.user_id = $location.search().user_id ? $location.search().user_id : $auth.user().id;
    $scope.formSubmitted = false;
    $scope.miles = [ {
        id: 5,
        name: "5 miles",
        zoom: 11
    }, {
        id: 10,
        name: "10 miles",
        zoom: 10
    }, {
        id: 20,
        name: "20 miles",
        zoom: 9
    }, {
        id: 50,
        name: "50 miles",
        zoom: 8
    } ];
    $scope.map = {
        control: {},
        center: {
            latitude: 51.5073509,
            longitude: -.12775829999998223
        },
        zoom: 10,
        options: {
            scrollwheel: false
        },
        circles: [ {
            id: 1
        } ],
        refresh: function(center) {
            $scope.map.control.refresh(center);
        }
    };
    $scope.$watch("data.latitude", function(newVal, oldVal) {
        if (newVal !== oldVal) {
            $scope.map.circles[0].center = {
                latitude: $scope.data.latitude,
                longitude: $scope.data.longitude
            };
            $scope.map.circles[0].radius = $scope.data.miles * 1609.344;
            $scope.map.refresh({
                latitude: $scope.data.latitude,
                longitude: $scope.data.longitude
            });
        }
    });
    $scope.$watch("data.miles", function(newVal, oldVal) {
        if (newVal !== oldVal) {
            var selected = $.grep($scope.miles, function(e) {
                return e.id == $scope.data.miles;
            });
            $scope.map.circles[0].radius = newVal * 1609.344;
            $scope.map.zoom = selected[0].zoom;
            $scope.map.refresh({
                latitude: $scope.data.latitude,
                longitude: $scope.data.longitude
            });
        }
    });
    $scope.isAdd = function() {
        return $scope.id === null;
    };
    $scope.isEdit = function() {
        return $scope.id !== null;
    };
    if ($scope.isAdd()) {
        $scope.mode = "Add";
        $scope.data = {
            miles: 10
        };
    } else {
        $err.tryPromise($restUser.one("profile", $scope.user_id).one("locations", $scope.id).get()).then(function(data) {
            $scope.mode = "Edit";
            $scope.data = data;
            $scope.map.circles = [ {
                id: 1,
                center: {
                    latitude: data.latitude,
                    longitude: data.longitude
                },
                radius: $scope.data.miles * 1609.344
            } ];
            $scope.map.refresh({
                latitude: data.latitude,
                longitude: data.longitude
            });
        });
    }
    uiGmapIsReady.promise(1).then(function(instances) {
        $scope.map.refresh({
            latitude: 51.5073509,
            longitude: -.12775829999998223
        });
    });
    $scope.store = function() {
        $scope.formSubmitted = true;
        $scope.data.user_id = $scope.user_id;
        $err.tryPromise($restUser.one("profile", $scope.user_id).all("locations").post($scope.data)).then(function() {
            $notifier.success("Location added successfully");
            $app.goTo("user.account.profile.locations");
            $scope.$close(true);
            $scope.formSubmitted = false;
        });
    };
    $scope.update = function() {
        $scope.formSubmitted = true;
        $err.tryPromise($scope.data.put()).then(function() {
            $notifier.success("Location updated successfully");
            $app.goTo("user.account.profile.locations");
            $scope.$close(true);
            $scope.formSubmitted = false;
        });
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.account.profile.locations.add", {
        url: "/new",
        page: {
            title: "Add location",
            class: "icon-envelope",
            description: "Add new location"
        },
        modal: "md",
        controller: "UserProfileLocationsEditController",
        templateUrl: "src/user/account/profile/locations/edit/edit.html"
    }).state("user.account.profile.locations.edit", {
        url: "/edit/{id}",
        page: {
            title: "Edit location",
            class: "icon-envelope",
            description: "Edit location"
        },
        modal: "md",
        controller: "UserProfileLocationsEditController",
        templateUrl: "src/user/account/profile/locations/edit/edit.html"
    });
} ]);

"use strict";

angular.module("app").controller("UserProfileLocationsController", [ "$q", "$location", "$scope", "$state", "$stateParams", "$auth", "$restUser", "$notifier", "$app", "$err", "ngTableParams", function($q, $location, $scope, $state, $stateParams, $auth, $restUser, $notifier, $app, $err, ngTableParams) {
    $auth.assure(function() {
        $scope.user_id = $location.search().user_id ? $location.search().user_id : $auth.user().id;
        $scope.tableParams = new ngTableParams(angular.extend({
            page: 1,
            count: 10,
            sorting: {
                created_at: "desc"
            }
        }, $location.search()), {
            total: 0,
            getData: function($defer, params) {
                $location.search(params.url());
                $err.tryPromise($restUser.one("profile", $scope.user_id).all("locations").getList(params.url())).then(function(result) {
                    $scope.tableParams.settings({
                        total: result.paginator.total
                    });
                    $defer.resolve(result);
                });
            }
        });
    });
    $scope.destroy = function(location) {
        $err.tryPromise(location.remove()).then(function() {
            $notifier.success("Location removed successfully");
            $scope.tableParams.reload();
        });
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", "$urlRouterProvider", "$authProvider", function($stateProvider, $urlRouterProvider, $authProvider) {
    $stateProvider.state("user.account.profile.locations", {
        url: "/locations",
        page: {
            title: "Locations",
            class: "icon-layers",
            description: "Locations"
        },
        controller: "UserProfileLocationsController",
        templateUrl: "src/user/account/profile/locations/locations.html"
    });
} ]);

"use strict";

angular.module("app").controller("UserProfileController", [ "$scope", "FileUploader", "$location", "$q", "$state", "$stateParams", "$auth", "$restUser", "$notifier", "$app", "$err", "$geo", function($scope, FileUploader, $location, $q, $state, $stateParams, $auth, $restUser, $notifier, $app, $err, $geo) {
    $scope.uploader = new FileUploader();
    $scope.formSubmitted = false;
    $scope.rand = Math.random();
    $auth.assure(function() {
        $scope.user_id = $scope.id = $auth.user().id;
        $restUser.one("profile", $scope.user_id).get().then(function(data) {
            $scope.data = data;
        });
    });
    $scope.update = function() {
        $scope.formSubmitted = true;
        if ($scope.uploader.queue.length > 0) {
            var item = $scope.uploader.queue[0];
            item.url = $restUser.one("profile", $scope.data.id).getRestangularUrl() + "?_method=PUT";
            item.formData.push($scope.data);
            $scope.uploader.uploadItem(item);
        } else {
            $err.tryPromise($scope.data.put()).then(function() {
                $auth.check().then(function() {
                    $scope.formSubmitted = false;
                    $notifier.success("Profile saved successfully!");
                });
            });
        }
    };
    $scope.uploader.onAfterAddingFile = function(fileItem) {
        $scope.file = {
            name: fileItem.file.name,
            size: fileItem.file.size
        };
    };
    $scope.uploader.onProgressItem = function(fileItem, progress) {
        $scope.progress = progress;
    };
    $scope.uploader.onSuccessItem = function(fileItem, response, status, headers) {
        $auth.check().then(function() {
            $scope.rand = Math.random();
            $scope.uploader.removeFromQueue(fileItem);
            delete $scope.file;
            delete $scope.progress;
            $scope.formSubmitted = false;
            $notifier.success("Profile saved successfully!");
        });
    };
    $scope.uploader.onErrorItem = function() {
        $scope.formSubmitted = false;
        $notifier.error("Something went wrong!");
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.account.profile", {
        url: "/profile?user_id",
        page: {
            title: "Profile settings",
            description: "Update your profile informations"
        },
        controller: "UserProfileController",
        templateUrl: "src/user/account/profile/profile.html"
    });
} ]);

"use strict";

angular.module("app").controller("UserProfileSettingsController", SettingsController);

SettingsController.$inject = [ "$location", "$scope", "$auth", "$restUser", "$err", "$notifier", "$restApp" ];

function SettingsController($location, $scope, $auth, $restUser, $err, $notifier, $restApp) {
    $scope.settings = {
        vehicle_type: [ {
            label: "All Vehicles Sizes",
            value: "all"
        }, {
            label: "My vehicles only",
            value: "vehicle_only"
        }, {
            label: "Custom scale",
            value: "custom"
        } ],
        location: [ {
            label: "My Locations Only",
            value: "location_only"
        }, {
            label: "All Locations",
            value: "all"
        } ]
    };
    $err.tryPromise($restApp.all("vehicles").getList({
        "sorting[size]": "asc"
    })).then(function(vehicles) {
        $scope.min = vehicles[0].size;
        $scope.max = vehicles[vehicles.length - 1].size;
        $scope.vehicles = vehicles;
    });
    $auth.assure(function() {
        $scope.user_id = $auth.user().id;
        $err.tryPromise($restUser.one("profile", $scope.user_id).get()).then(function(data) {
            if (!data.settings.custom_min) data.settings.custom_min = 0;
            if (!data.settings.custom_max) {
                data.settings.custom_max = $scope.vehicles.length * 100;
            }
            $scope.data = data;
        });
    });
    $scope.update = function() {
        $scope.formSubmitted = true;
        $err.tryPromise($scope.data.put()).then(function(response) {
            $scope.formSubmitted = false;
            $auth.check().then(function() {
                $notifier.success("Settings updated correctly.");
            });
        }).catch(function(response) {
            $scope.formSubmitted = false;
            $notifier.error("There were problems updating your settings.");
        });
    };
}

"use strict";

angular.module("app").config([ "$stateProvider", "$urlRouterProvider", "$authProvider", function($stateProvider, $urlRouterProvider, $authProvider) {
    $stateProvider.state("user.account.profile.notifications", {
        url: "/notifications",
        page: {
            title: "Notifications",
            class: "icon-layers",
            description: "Vehicles"
        },
        controller: "UserProfileSettingsController",
        templateUrl: "src/user/account/profile/settings/settings.html"
    });
} ]);

"use strict";

angular.module("app").controller("UserProfileVehiclesController", VehiclesController);

VehiclesController.$inject = [ "$location", "$scope", "$auth", "$restUser", "$err", "ngTableParams", "$restApp" ];

function VehiclesController($location, $scope, $auth, $restUser, $err, ngTableParams, $restApp) {
    $auth.assure(function() {
        $scope.user_id = $location.search().user_id ? $location.search().user_id : $auth.user().id;
        $scope.tableParams = new ngTableParams(angular.extend({
            page: 1,
            count: 10,
            sorting: {
                size: "asc"
            }
        }, $location.search()), {
            total: 0,
            getData: function($defer, params) {
                $location.search(params.url());
                $err.tryPromise($restUser.one("profile", $scope.user_id).all("vehicles").getList()).then(function(vehiclesOwned) {
                    $scope.vehiclesOwned = vehiclesOwned;
                    return $err.tryPromise($restApp.all("vehicles").getList({
                        "sorting[sort_no]": "asc"
                    }));
                }).then(function(vehicles) {
                    $scope.vehicles = vehicles;
                    $defer.resolve($scope.vehicles);
                });
            }
        });
        $scope.owns = function checkIfVehicleIsOwned(id) {
            return _.find($scope.vehiclesOwned, function(vehicle, index) {
                return vehicle.id === id;
            });
        };
        $scope.toggleVehicle = function(vehicle) {
            var index = _.findIndex($scope.vehiclesOwned, function(owned) {
                return owned.id == vehicle.id;
            });
            if (index > -1) {
                $scope.vehiclesOwned.splice(index, 1);
            } else {
                $scope.vehiclesOwned.push(vehicle);
            }
            $err.tryPromise($restUser.one("profile", $scope.user_id).all("vehicles").post($scope.vehiclesOwned)).then(function(response) {
                $scope.vehiclesOwned = response[0];
            });
        };
    });
}

"use strict";

angular.module("app").config([ "$stateProvider", "$urlRouterProvider", "$authProvider", function($stateProvider, $urlRouterProvider, $authProvider) {
    $stateProvider.state("user.account.profile.vehicles", {
        url: "/vehicles",
        page: {
            title: "My Vehicles",
            class: "icon-layers",
            description: "Vehicles"
        },
        controller: "UserProfileVehiclesController",
        templateUrl: "src/user/account/profile/vehicles/vehicles.html"
    });
} ]);

"use strict";

angular.module("app").controller("TeamDocumentAddController", [ "$q", "$scope", "$state", "modalParams", "$restUser", "$restApp", "$notifier", "$app", "$err", "FileUploader", "$moment", "$auth", function($q, $scope, $state, modalParams, $restUser, $restApp, $notifier, $app, $err, FileUploader, $moment, $auth) {
    if (!modalParams.team_id) return;
    $scope.team_id = modalParams.team_id || null;
    $scope.uploader = new FileUploader();
    $scope.formSubmitted = false;
    $scope.data = {
        team_id: $scope.team_id,
        user_id: undefined,
        type_id: 0,
        status: "pending"
    };
    $restUser.all("doctypes").getList().then(function(result) {
        $scope.doctypes = result;
    });
    $restUser.one("team", $auth.user().team_id).get().then(function(team) {
        $scope.team = team;
    });
    $scope.store = function() {
        $scope.formSubmitted = true;
        if ($scope.data.selected_type.expiry_required === 0) {
            $scope.data.expiry = "0000-00-00";
        } else {
            if ($scope.mode === "add") {
                $scope.data.expiry = $moment($scope.data.expiry).format(dateFormat);
            }
        }
        if ($scope.uploader.queue.length > 0) {
            var item = $scope.uploader.queue[0];
            if (undefined !== $scope.data.user_id) {
                item.url = $restUser.one("profile", $scope.data.user_id).all("documents").getRestangularUrl();
                item.formData.push($scope.data);
                $scope.uploader.uploadItem(item);
            }
        }
    };
    $scope.uploader.onAfterAddingFile = function(fileItem) {
        $scope.file = {
            name: fileItem.file.name,
            size: fileItem.file.size
        };
    };
    $scope.uploader.onProgressItem = function(fileItem, progress) {
        $scope.progress = progress;
    };
    $scope.uploader.onSuccessItem = function(item, response, status, header) {
        $scope.formSubmitted = false;
        $notifier.success("Document uploaded successfully");
        $scope.uploader.removeFromQueue(item);
        $app.goTo("user.account.team.documents");
        $scope.$close(true);
    };
    $scope.uploader.onErrorItem = function() {
        $scope.formSubmitted = false;
        $notifier.error("Something went wrong!");
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.account.team.documents.add", {
        url: "/{team_id}/add",
        page: {
            title: "Add Document",
            class: "icon-envelope",
            description: "Upload document"
        },
        modal: "md",
        controller: "TeamDocumentAddController",
        templateUrl: "src/user/account/team/documents/add/add.html"
    });
} ]);

"use strict";

angular.module("app").controller("TeamDocumentController", [ "$q", "$location", "$scope", "$state", "$stateParams", "$auth", "$restUser", "$notifier", "$app", "$err", "ngTableParams", function($q, $location, $scope, $state, $stateParams, $auth, $restUser, $notifier, $app, $err, ngTableParams) {
    $auth.assure(function() {
        $scope.user_id = $scope.id = $location.search().user_id ? $location.search().user_id : $auth.user().id;
        $scope.team_id = $scope.team = $location.search().team_id ? $location.search().team_id : $auth.user().team_id;
        $scope.tableParams = new ngTableParams(angular.extend({
            page: 1,
            count: 10,
            sorting: {
                title: "asc"
            }
        }, $location.search()), {
            total: 0,
            getData: function($defer, params) {
                $location.search(params.url());
                $err.tryPromise($restUser.one("teams", $auth.user().team_id).all("documents").getList(params.url())).then(function(result) {
                    $scope.tableParams.settings({
                        total: result.paginator.total
                    });
                    $defer.resolve(result);
                });
            }
        });
    });
    $scope.destroy = function(document) {
        $err.tryPromise(document.remove()).then(function() {
            $notifier.success("Document removed successfully");
            $scope.tableParams.reload();
        });
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.account.team.documents", {
        url: "/documents",
        page: {
            title: "Add Document",
            class: "icon-envelope",
            description: ""
        },
        controller: "TeamDocumentController",
        templateUrl: "src/user/account/team/documents/document.html"
    });
} ]);

"use strict";

angular.module("app").controller("UserTeamEditController", [ "$rootScope", "$auth", "$scope", "$validation", "$restUser", "$notifier", "FileUploader", function($rootScope, $auth, $scope, $validation, $restUser, $notifier, FileUploader) {
    $scope.team = {};
    $scope.formSubmitted = false;
    FileUploader.prototype.onCompleteItem = function(item, response, status, headers) {
        if (status == 422) {
            $validation.handle(response);
        } else if (status >= 200 && status < 300) {
            loadTeam();
        }
    };
    $scope.uploader = new FileUploader();
    function loadTeam() {
        $restUser.one("team", $auth.user().team_id).get().then(function(team) {
            $scope.team = team;
        });
    }
    $auth.assure(loadTeam);
    $scope.update = function() {
        $scope.formSubmitted = true;
        if ($scope.team.use_company_address) {
            $scope.team.invoice_address_line_1 = $scope.team.address_line_1;
            $scope.team.invoice_address_line_2 = $scope.team.address_line_2;
            $scope.team.invoice_town = $scope.team.town;
            $scope.team.invoice_county = $scope.team.county;
            $scope.team.invoice_postal_code = $scope.team.postal_code;
        }
        if ($scope.uploader.queue.length > 0) {
            var item = $scope.uploader.queue[0];
            item.url = $scope.team.getRestangularUrl() + "?_method=PUT&wantsJson=1";
            $scope.team.deactivated_at = 0;
            item.formData.push($scope.team.plain());
            $scope.uploader.uploadItem(item);
        } else {
            $scope.team.save().then(function() {
                $validation.clear();
                $scope.formSubmitted = false;
                $notifier.success("The team was successfully updated!");
            }, function(error) {
                $scope.formSubmitted = false;
                $validation.performFromResponse;
            });
        }
    };
    $scope.uploader.onAfterAddingFile = function(fileItem) {
        $scope.file = {
            name: fileItem.file.name,
            size: fileItem.file.size
        };
    };
    $scope.uploader.onProgressItem = function(fileItem, progress) {
        $scope.progress = progress;
    };
    $scope.uploader.onSuccessItem = function(fileItem, response, status, headers) {
        $auth.check().then(function() {
            $scope.rand = Math.random();
            $scope.uploader.removeFromQueue(fileItem);
            delete $scope.file;
            delete $scope.progress;
            $scope.formSubmitted = false;
            $notifier.success("Profile saved successfully!");
        });
    };
    $scope.uploader.onErrorItem = function() {
        $scope.formSubmitted = false;
        $notifier.error("Something went wrong!");
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.account.team.edit", {
        url: "/edit",
        preserveQueryParams: true,
        page: {
            title: "Edit Team",
            class: "icon-layers",
            description: "Edit Team"
        },
        controller: "UserTeamEditController",
        templateUrl: "src/user/account/team/edit/edit.html",
        primaryTeamMember: true
    });
} ]);

"use strict";

angular.module("app").controller("UserFeedbackAddController", [ "modalParams", "$scope", "$restUser", "$err", "$notifier", "$state", function(modalParams, $scope, $restUser, $err, $notifier, $state) {
    if (!modalParams.job_id) {
        return;
    }
    $scope.job_id = modalParams.job_id || null;
    $scope.formSubmitted = false;
    $err.tryPromise($restUser.one("jobs", $scope.job_id).get()).then(function(job) {
        $scope.job = job;
    });
    $scope.create = function() {
        $scope.formSubmitted = true;
        $scope.job.post("feedback", {
            rating: $scope.feedback.rating,
            comment: $scope.feedback.comment,
            bid_id: modalParams.bid_id
        }).then(function() {
            $scope.$dismiss();
            $notifier.success("Feedback sent successfully");
            $scope.formSubmitted = false;
            $state.reload();
        });
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.account.team.feedback.add", {
        url: "/feedback/add/{job_id}/{bid_id}",
        page: {
            title: "Add feedback",
            class: "icon-layers",
            description: "Add feedback"
        },
        modal: "md",
        controller: "UserFeedbackAddController",
        templateUrl: "src/user/account/team/feedback/add/add.html"
    });
} ]);

"use strict";

angular.module("app").controller("TeamFeedbackController", [ "$scope", "$location", "$err", "$auth", "$restUser", "ngTableParams", function($scope, $location, $err, $auth, $restUser, ngTableParams) {
    $scope.tableParams = new ngTableParams(angular.extend({
        page: 1,
        count: 10,
        sorting: {
            created_at: "desc"
        }
    }, $location.search()), {
        total: 0,
        getData: function($defer, params) {
            $location.search(params.url());
            $err.tryPromise($restUser.one("teams", $auth.user().team_id).all("feedback").getList(params.url())).then(function(result) {
                $scope.tableParams.settings({
                    total: result.paginator.total
                });
                $defer.resolve(result);
                $scope.loading = false;
            });
        }
    });
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.account.team.feedback", {
        url: "/feedback",
        page: {
            title: "My feedback",
            class: "icon-layers",
            description: "My feedback"
        },
        controller: "TeamFeedbackController",
        templateUrl: "src/user/account/team/feedback/feedback.html"
    });
} ]);

"use strict";

angular.module("app").controller("UserTeamJobsController", [ "$scope", "$moment", "$notifier", "$location", "$err", "$auth", "ngTableParams", "$restUser", function($scope, $moment, $notifier, $location, $err, $auth, ngTableParams, $restUser) {
    $scope.loading = true;
    $scope.statuses = {
        active: {
            name: "Active",
            description: "Waiting for bids"
        },
        progress: {
            name: "In Progress",
            description: "Out for delivery"
        },
        delivered: {
            name: "Delivered",
            description: "Out for delivery"
        },
        invoice: {
            name: "Invoiced",
            description: "Invoice received"
        },
        complete: {
            name: "Completed",
            description: "Job completed"
        },
        cancel: {
            name: "Cancelled",
            description: "Job cancelled"
        },
        expire: {
            name: "Expired",
            description: "Job expired"
        }
    };
    $scope.richStatuses = {};
    $auth.assure(function() {
        $scope.tableParams = new ngTableParams(angular.extend({
            page: 1,
            count: 10,
            sorting: {
                created_at: "desc"
            }
        }, $location.search()), {
            total: 0,
            getData: function($defer, params) {
                $location.search(params.url());
                $err.tryPromise($restUser.one("teams", $auth.user().team_id).all("jobs").getList(params.url())).then(function(result) {
                    $scope.richStatuses = result.properties.statuses;
                    $scope.tableParams.settings({
                        total: result.paginator.total
                    });
                    $defer.resolve(result);
                    $scope.loading = false;
                });
            }
        });
    });
    $scope.getJobStatus = function(job) {
        if (job.status == "invoice" && job.payment_received) {
            return "Paid";
        }
        return $scope.statuses[job.status].name;
    };
    $scope.getJobInfo = function(job) {
        if (job.status == "active" && job.bids_count > 0) {
            return "You have received bids";
        }
        if (job.status == "progress" && job.bid_manual) {
            return "Job allocated manually";
        }
        if (job.status == "invoice" && !job.payment_received) {
            return "You have unpaid invoices";
        }
        if (job.status == "invoice" && job.payment_received) {
            return "Your payment has been received";
        }
        return $scope.statuses[job.status].description;
    };
    $scope.formSubmitted = false;
    $scope.complete = function(job) {
        $scope.formSubmitted = true;
        $err.tryPromise($restUser.one("jobs", job.id).get()).then(function(result) {
            result.completed = true;
            result.status = "complete";
            result.status_date = $moment().format();
            $err.tryPromise(result.put()).then(function() {
                job.completed = true;
                job.status = "complete";
                $notifier.success("Job completed successfully");
            });
        });
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.account.team.jobs", {
        url: "/jobs",
        preserveQueryParams: true,
        page: {
            title: "Our jobs"
        },
        controller: "UserTeamJobsController",
        templateUrl: "src/user/account/team/jobs/jobs.html"
    });
} ]);

"use strict";

angular.module("app").controller("TeamLocationsEditController", [ "$q", "$auth", "$scope", "$state", "modalParams", "$restUser", "$notifier", "$app", "$err", "$location", "uiGmapIsReady", function($q, $auth, $scope, $state, modalParams, $restUser, $notifier, $app, $err, $location, uiGmapIsReady) {
    $scope.id = modalParams.id || null;
    $scope.user_id = $location.search().user_id ? $location.search().user_id : $auth.user().id;
    $scope.formSubmitted = false;
    $scope.miles = [ {
        id: 5,
        name: "5 miles",
        zoom: 11
    }, {
        id: 10,
        name: "10 miles",
        zoom: 10
    }, {
        id: 20,
        name: "20 miles",
        zoom: 9
    }, {
        id: 50,
        name: "50 miles",
        zoom: 8
    } ];
    $scope.map = {
        control: {},
        center: {
            latitude: 51.5073509,
            longitude: -.12775829999998223
        },
        zoom: 10,
        options: {
            scrollwheel: false
        },
        circles: [ {
            id: 1
        } ],
        refresh: function(center) {
            $scope.map.control.refresh(center);
        }
    };
    $scope.$watch("data.latitude", function(newVal, oldVal) {
        if (newVal !== oldVal) {
            $scope.map.circles[0].center = {
                latitude: $scope.data.latitude,
                longitude: $scope.data.longitude
            };
            $scope.map.circles[0].radius = $scope.data.miles * 1609.344;
            $scope.map.refresh({
                latitude: $scope.data.latitude,
                longitude: $scope.data.longitude
            });
        }
    });
    $scope.$watch("data.miles", function(newVal, oldVal) {
        if (newVal !== oldVal) {
            var selected = $.grep($scope.miles, function(e) {
                return e.id == $scope.data.miles;
            });
            $scope.map.circles[0].radius = newVal * 1609.344;
            $scope.map.zoom = selected[0].zoom;
            $scope.map.refresh({
                latitude: $scope.data.latitude,
                longitude: $scope.data.longitude
            });
        }
    });
    $scope.isAdd = function() {
        return $scope.id === null;
    };
    $scope.isEdit = function() {
        return $scope.id !== null;
    };
    $restUser.one("team", $auth.user().team_id).get().then(function(team) {
        $scope.team = team;
    });
    if ($scope.isAdd()) {
        $scope.mode = "Add";
        $scope.data = {
            miles: 10
        };
    } else {
        $err.tryPromise($restUser.one("profile", $scope.user_id).one("locations", $scope.id).get()).then(function(data) {
            $scope.mode = "Edit";
            $scope.data = data;
            $scope.map.circles = [ {
                id: 1,
                center: {
                    latitude: data.latitude,
                    longitude: data.longitude
                },
                radius: $scope.data.miles * 1609.344
            } ];
            $scope.map.refresh({
                latitude: data.latitude,
                longitude: data.longitude
            });
        });
    }
    uiGmapIsReady.promise(1).then(function(instances) {
        $scope.map.refresh({
            latitude: 51.5073509,
            longitude: -.12775829999998223
        });
    });
    $scope.store = function() {
        $scope.formSubmitted = true;
        $scope.data.user_id = $scope.data.user_id || $scope.user_id;
        $err.tryPromise($restUser.one("profile", $scope.data.user_id).all("locations").post($scope.data)).then(function() {
            $notifier.success("Location added successfully");
            $app.goTo("user.account.profile.locations");
            $scope.$close(true);
            $scope.formSubmitted = false;
        });
    };
    $scope.update = function() {
        $scope.formSubmitted = true;
        $err.tryPromise($scope.data.put()).then(function() {
            $notifier.success("Location updated successfully");
            $app.goTo("user.account.profile.locations");
            $scope.$close(true);
            $scope.formSubmitted = false;
        });
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.account.team.locations.add", {
        url: "/new",
        page: {
            title: "Add location",
            class: "icon-envelope",
            description: "Add new location"
        },
        modal: "md",
        controller: "TeamLocationsEditController",
        templateUrl: "src/user/account/team/locations/edit/edit.html"
    }).state("user.account.team.locations.edit", {
        url: "/edit/{id}",
        page: {
            title: "Edit location",
            class: "icon-envelope",
            description: "Edit location"
        },
        modal: "md",
        controller: "TeamLocationsEditController",
        templateUrl: "src/user/account/team/locations/edit/edit.html"
    });
} ]);

"use strict";

angular.module("app").controller("TeamLocationsController", [ "$q", "$location", "$scope", "$state", "$stateParams", "$auth", "$restUser", "$notifier", "$app", "$err", "ngTableParams", function($q, $location, $scope, $state, $stateParams, $auth, $restUser, $notifier, $app, $err, ngTableParams) {
    $auth.assure(function() {
        $scope.user_id = $location.search().user_id ? $location.search().user_id : $auth.user().id;
        $scope.tableParams = new ngTableParams(angular.extend({
            page: 1,
            count: 10,
            sorting: {
                created_at: "desc"
            }
        }, $location.search()), {
            total: 0,
            getData: function($defer, params) {
                $location.search(params.url());
                $err.tryPromise($restUser.one("teams", $auth.user().team_id).all("locations").getList(params.url())).then(function(result) {
                    $scope.tableParams.settings({
                        total: result.paginator.total
                    });
                    $defer.resolve(result);
                });
            }
        });
    });
    $scope.destroy = function(location) {
        $err.tryPromise(location.remove()).then(function() {
            $notifier.success("Location removed successfully");
            $scope.tableParams.reload();
        });
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.account.team.locations", {
        url: "/locations",
        page: {
            title: "Locations",
            class: "icon-layers",
            description: "Locations"
        },
        controller: "TeamLocationsController",
        templateUrl: "src/user/account/team/locations/locations.html"
    });
} ]);

"use strict";

angular.module("app").controller("UserTeamEditMemberController", [ "$err", "$rootScope", "$notifier", "$scope", "modalParams", "$restUser", "$validation", function($err, $rootScope, $notifier, $scope, modalParams, $restUser, $validation) {
    $scope.user_id = modalParams.user_id || null;
    $scope.team_id = modalParams.team_id || null;
    $scope.formSubmitted = false;
    $scope.data = {};
    if (!$scope.user_id && !$scope.team_id) return;
    $scope.isAdd = function() {
        return $scope.user_id === null;
    };
    $scope.isEdit = function() {
        return $scope.team_id === null;
    };
    if ($scope.isAdd()) {
        $scope.mode = "Add";
        $restUser.one("team", $scope.team_id).get().then(function(team) {
            $scope.team = team;
        });
        $scope.data = {
            team_id: $scope.team_id
        };
    } else {
        $err.tryPromise($restUser.one("profile", $scope.user_id).get()).then(function(data) {
            $scope.mode = "Edit";
            $scope.data = data;
        });
    }
    $scope.store = function() {
        $scope.formSubmitted = true;
        $scope.team.all("members").post($scope.data).then(function() {
            $notifier.success("The member was successfully added.");
            $scope.$close(true);
        }, function(response) {
            $scope.formSubmitted = false;
            $validation.handle(response.data);
        });
    };
    $scope.update = function() {
        $scope.formSubmitted = true;
        $err.tryPromise($scope.data.put()).then(function() {
            $notifier.success("The member was successfully updated.");
            $scope.$close(true);
        });
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.account.team.adduser", {
        url: "/{team_id}/add",
        preserveQueryParams: true,
        page: {
            title: "Add User",
            class: "icon-layers",
            description: "Add User"
        },
        modal: "lg",
        controller: "UserTeamEditMemberController",
        templateUrl: "src/user/account/team/manage/edit.html",
        primaryTeamMember: true
    }).state("user.account.team.edituser", {
        url: "/edit/{user_id}",
        page: {
            title: "Members",
            class: "icon-user",
            description: "Manage all members"
        },
        modal: "lg",
        controller: "UserTeamEditMemberController",
        templateUrl: "src/user/account/team/manage/edit.html",
        primaryTeamMember: true
    });
} ]);

"use strict";

angular.module("app").controller("UserTeamManageController", [ "$rootScope", "$auth", "$notifier", "$state", "$scope", "$q", "$location", "$filter", "$err", "ngTableParams", "$restUser", function($rootScope, $auth, $notifier, $state, $scope, $q, $location, $filter, $err, ngTableParams, $restUser) {
    $scope.loading = true;
    $scope.new_primary = {
        confirm: false,
        user: null
    };
    $scope.refreshTeam = function() {
        $restUser.one("team", $auth.user().team_id).get().then(function(team) {
            $scope.loading = false;
            $scope.team = team;
        });
    };
    $auth.assure(function() {
        $scope.refreshTeam();
    });
    $scope.transferPrimaryUser = function() {
        $restUser.one("team", $auth.user().team_id).one("members", $scope.new_primary.user.id).one("mark-as-primary").put().then(function() {
            $notifier.success("The primary user role was transferred.");
            $auth.check();
            $location.path("user/dashboard");
        });
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.account.team", {
        url: "/team?team_id",
        preserveQueryParams: true,
        page: {
            title: "My Users",
            description: "My Users"
        },
        controller: "UserTeamManageController",
        templateUrl: "src/user/account/team/team.html"
    });
} ]);

"use strict";

angular.module("app").controller("UserTeamWorkController", [ "$rootScope", "$notifier", "$state", "$scope", "$q", "$location", "$moment", "$filter", "$err", "ngTableParams", "$restUser", function($rootScope, $notifier, $state, $scope, $q, $location, $moment, $filter, $err, ngTableParams, $restUser) {
    $scope.loading = true;
    $scope.formSubmitted = false;
    $scope.statuses = {
        active: {
            name: "Active",
            description: "Waiting for bids"
        },
        progress: {
            name: "In Progress",
            description: "Out for delivery"
        },
        delivered: {
            name: "Delivered",
            description: "Out for delivery"
        },
        invoice: {
            name: "Invoiced",
            description: "Invoice received"
        },
        complete: {
            name: "Completed",
            description: "Job completed"
        },
        cancel: {
            name: "Cancelled",
            description: "Job cancelled"
        },
        expire: {
            name: "Expired",
            description: "Job expired"
        }
    };
    $scope.tableParams = new ngTableParams(angular.extend({
        page: 1,
        count: 10,
        sorting: {
            created_at: "desc"
        }
    }, $location.search()), {
        total: 0,
        getData: function($defer, params) {
            $location.search(params.url());
            $err.tryPromise($restUser.one("team").all("work").getList(params.url())).then(function(result) {
                $scope.tableParams.settings({
                    total: result.paginator.total
                });
                $defer.resolve(result);
                $scope.loading = false;
            });
        }
    });
    $scope.getJobStatus = function(job) {
        if (job.status == "invoice" && job.payment_received) {
            return "Paid";
        }
        return $scope.statuses[job.status].name;
    };
    $scope.getJobInfo = function(job) {
        if (job.status == "active" && job.team_bid) {
            return "Bid pending";
        }
        if (job.status == "progress" && job.bid_manual) {
            return "Job allocated manually";
        }
        if (job.status == "invoice" && !job.payment_received) {
            return "You have unpaid invoices";
        }
        if (job.status == "invoice" && job.payment_received) {
            return "Payment has been received";
        }
        return $scope.statuses[job.status].description;
    };
    $scope.complete = function(job) {
        job.completed = true;
        $err.tryPromise($restUser.one("jobs", job.id).get()).then(function(data) {
            data.status = "complete";
            data.status_date = $moment().format();
            $err.tryPromise(data.put()).then(function() {
                $notifier.success("Job completed successfully");
                job.status = "complete";
                job.status_date = data.status_date;
            });
        });
    };
    $scope.paid = function(job) {
        $err.tryPromise($restUser.one("jobs", job.id).get()).then(function(result) {
            job.payment_received = true;
            result.payment_received = true;
            result.put();
        });
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.account.team.work", {
        url: "/work",
        preserveQueryParams: true,
        page: {
            title: "Our Work",
            class: "icon-layers",
            description: "Our Work"
        },
        controller: "UserTeamWorkController",
        templateUrl: "src/user/account/team/work/work.html"
    });
} ]);

"use strict";

angular.module("app").controller("UserWorkInvoiceController", [ "$q", "$scope", "$state", "modalParams", "$moment", "$restUser", "$restApp", "$notifier", "$app", "$err", "$auth", function($q, $scope, $state, modalParams, $moment, $restUser, $restApp, $notifier, $app, $err, $auth) {
    if (!modalParams.job_id) return;
    $scope.formSubmitted = false;
    $scope.job_id = modalParams.job_id || null;
    $scope.invoiceType = "system";
    $err.tryPromise($restUser.one("jobs", $scope.job_id).get()).then(function(data) {
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
    $scope.addToInvoiceItems = function() {
        $scope.data.invoice_items.push({
            item: null,
            add_vat: false
        });
    };
    $scope.removeFromInvoiceItems = function(invoiceItem) {
        var i = $scope.data.invoice_items.indexOf(invoiceItem);
        if (i != -1) {
            $scope.data.invoice_items.splice(i, 1);
        }
    };
    $scope.store = function() {
        $scope.formSubmitted = true;
        $scope.data.manual = $scope.invoiceType == "manual";
        $err.tryPromise($restUser.all("invoices").post($scope.data)).then(function() {
            $scope.job.status = "invoice";
            $scope.job.status_date = $moment().format();
            $err.tryPromise($scope.job.put()).then(function() {
                $notifier.success("Invoice raised successfully");
                $scope.$close(true);
            }, function(error) {
                $scope.formSubmitted = false;
            });
        });
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.account.work.invoice", {
        url: "/{job_id}/invoice",
        page: {
            title: "My Work",
            class: "icon-layers",
            description: "My Work"
        },
        modal: "lg",
        controller: "UserWorkInvoiceController",
        templateUrl: "src/user/account/work/invoice/invoice.html"
    });
} ]);

"use strict";

angular.module("app").controller("UserWorkPodController", [ "$q", "$scope", "$state", "modalParams", "$restUser", "$restApp", "$notifier", "$app", "$err", "FileUploader", "$moment", "$auth", function($q, $scope, $state, modalParams, $restUser, $restApp, $notifier, $app, $err, FileUploader, $moment, $auth) {
    if (!modalParams.job_id) return;
    $scope.formSubmitted = false;
    $scope.job_id = modalParams.job_id || null;
    $scope.uploader = new FileUploader();
    $err.tryPromise($restUser.one("jobs", $scope.job_id).get()).then(function(job) {
        if ($auth.user().id === job.user_id || $auth.user().id === job.bid_user_id) {
            $scope.job = job;
            $scope.data = {
                job_id: $scope.job.id,
                delivery_date: $moment($scope.job.destination_date).format()
            };
            $scope.minDate = $moment($scope.job.pickup_date).toDate();
        }
    });
    $scope.store = function() {
        $scope.formSubmitted = true;
        $scope.data.delivery_date = $moment($scope.data.delivery_date).format();
        if ($scope.uploader.queue.length > 0) {
            var item = $scope.uploader.queue[0];
            item.url = $restUser.all("pods").getRestangularUrl();
            item.formData.push($scope.data);
            $scope.uploader.uploadItem(item);
        } else {
            $err.tryPromise($restUser.all("pods").post($scope.data)).then(function() {
                $scope.job.status = "delivered";
                $scope.job.status_date = $moment().format();
                $err.tryPromise($scope.job.put()).then(function() {
                    $notifier.success("POD sent successfully");
                    $scope.$close(true);
                }, function(error) {
                    $scope.formSubmitted = false;
                });
            });
        }
    };
    $scope.uploader.onAfterAddingFile = function(fileItem) {
        $scope.file = {
            name: fileItem.file.name,
            size: fileItem.file.size
        };
    };
    $scope.uploader.onProgressItem = function(fileItem, progress) {
        $scope.progress = progress;
    };
    $scope.uploader.onSuccessItem = function(fileItem, response, status, header) {
        $scope.job.status = "delivered";
        $scope.job.status_date = $moment().format();
        $scope.uploader.removeFromQueue(fileItem);
        $err.tryPromise($scope.job.put()).then(function() {
            $notifier.success("POD sent successfully");
            $scope.$close(true);
        });
    };
    $scope.uploader.onErrorItem = function() {
        $notifier.error("Something went wrong!");
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.account.work.pod", {
        url: "/{job_id}/pod",
        page: {
            title: "My Work",
            class: "icon-layers",
            description: "My Work"
        },
        modal: "lg",
        controller: "UserWorkPodController",
        templateUrl: "src/user/account/work/pod/pod.html"
    });
} ]);

"use strict";

angular.module("app").controller("UserWorkRetractController", [ "$q", "$scope", "$state", "modalParams", "$restUser", "$restApp", "$notifier", "$app", "$err", function($q, $scope, $state, modalParams, $restUser, $restApp, $notifier, $app, $err) {
    if (!modalParams.bid_id) return;
    $scope.bid_id = modalParams.bid_id || null;
    $scope.formSubmitted = false;
    $err.tryPromise($restUser.one("bids", $scope.bid_id).get()).then(function(data) {
        $scope.data = data;
    });
    $scope.retractBid = function(job, bid) {
        $scope.formSubmitted = true;
        $restUser.one("team").one("work", $scope.data.job_id).one("bid", $scope.data.id).post("retract").then(function() {
            $scope.formSubmitted = false;
            $scope.$close(true);
            $notifier.success("Bid successfully retracted!");
        });
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.account.work.retract", {
        url: "/{bid_id}/retract",
        page: {
            title: "Retract Bid",
            class: "icon-layers",
            description: "Retract Bid"
        },
        modal: "md",
        controller: "UserWorkRetractController",
        templateUrl: "src/user/account/work/retract/retract.html"
    });
} ]);

"use strict";

angular.module("app").controller("UserWorkController", [ "$rootScope", "$state", "$scope", "$notifier", "$q", "$location", "$filter", "$err", "ngTableParams", "$restUser", function($rootScope, $state, $scope, $notifier, $q, $location, $filter, $err, ngTableParams, $restUser) {
    $scope.loading = true;
    $scope.formSubmitted = false;
    $scope.statuses = {
        active: {
            name: "Active",
            description: "Waiting for bids"
        },
        progress: {
            name: "In Progress",
            description: "Out for delivery"
        },
        delivered: {
            name: "Delivered",
            description: "Out for delivery"
        },
        invoice: {
            name: "Invoiced",
            description: "Invoice received"
        },
        complete: {
            name: "Completed",
            description: "Job completed"
        },
        cancel: {
            name: "Cancelled",
            description: "Job cancelled"
        },
        expire: {
            name: "Expired",
            description: "Job expired"
        }
    };
    $scope.richStatuses = {};
    $scope.tableParams = new ngTableParams(angular.extend({
        page: 1,
        count: 10,
        sorting: {
            created_at: "desc"
        }
    }, $location.search()), {
        total: 0,
        getData: function($defer, params) {
            $location.search(params.url());
            $err.tryPromise($restUser.all("jobs").all("work").getList(params.url())).then(function(result) {
                $scope.richStatuses = result.properties.statuses;
                $scope.tableParams.settings({
                    total: result.paginator.total
                });
                $defer.resolve(result);
                $scope.loading = false;
                $scope.formSubmitted = false;
            });
        }
    });
    $scope.getJobStatus = function(job) {
        if (job.status == "invoice" && job.payment_received) {
            return "Paid";
        }
        return $scope.statuses[job.status].name;
    };
    $scope.getJobInfo = function(job) {
        if (job.status == "active" && job.team_bid) {
            return "Bid pending";
        }
        if (job.status == "progress" && job.bid_manual) {
            return "Job allocated manually";
        }
        if (job.status == "invoice" && !job.payment_received) {
            return "You have unpaid invoices";
        }
        if (job.status == "invoice" && job.payment_received) {
            return "Payment has been received";
        }
        return $scope.statuses[job.status].description;
    };
    $scope.paid = function(job) {
        $err.tryPromise($restUser.one("jobs", job.id).get()).then(function(result) {
            job.payment_received = true;
            result.payment_received = true;
            result.put();
        });
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.account.work", {
        url: "/work",
        page: {
            title: "My Work",
            class: "icon-layers",
            description: "My Work"
        },
        controller: "UserWorkController",
        templateUrl: "src/user/account/work/work.html"
    });
} ]);

"use strct";

angular.module("app").controller("UserBenefitsController", UserBenefitsController);

UserBenefitsController.$inject = [ "$scope", "$restUser", "$location", "$err", "ngTableParams" ];

function UserBenefitsController($scope, $restUser, $location, $err, ngTableParams) {
    $scope.benefits = undefined;
    $restUser.all("benefits").getList().then(function(result) {
        $scope.benefits = result;
    });
}

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.benefits", {
        url: "/benefits",
        preserveQueryParams: true,
        page: {
            title: "SDCN User Benefits",
            name: "doo",
            description: "SDCN User Benefits"
        },
        controller: "UserBenefitsController",
        templateUrl: "src/user/benefits/benefits.html"
    });
} ]);

"use strict";

angular.module("app").controller("UserDashboardController", [ "$rootScope", "$scope", "$restUser", "$restApp", "$auth", "$notifier", "$app", "$err", function($rootScope, $scope, $restUser, $restApp, $auth, $notifier, $app, $err) {
    var params = {
        page: "1",
        count: "4",
        "sorting[pickup_date]": "desc"
    };
    function refresh() {
        $err.tryPromise($restUser.one("profile", $auth.user().id).all("events").getList(flattenParams({
            count: 6,
            sorting: {
                created_at: "desc"
            }
        }))).then(function(result) {
            $scope.myEvents = result;
        });
        $restUser.one("profile", $auth.user().id).get().then(function(data) {
            $scope.ratings = data.ratings_count;
            $scope.rating = data.score;
            $scope.client_api = data.can_use_client_api;
            $scope.oauth_client = data.oauth_client;
        });
    }
    if (!$auth.bootstrapped()) {
        $scope.$on("auth.bootstrap", function() {
            refresh();
        });
    } else {
        refresh();
    }
    $scope.toggleEventStatus = function(event) {
        event.status = event.status == "read" ? "new" : "read";
        event.save();
    };
    $err.tryPromise($restUser.all("jobs").getList(params)).then(function(result) {
        $scope.myJobs = result;
    });
    $err.tryPromise($restUser.all("jobs").all("work").getList(params)).then(function(result) {
        $scope.myBids = result;
    });
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.dashboard", {
        url: "/dashboard",
        page: {
            title: "Dashboard",
            subTitle: "User dashboard"
        },
        controller: "UserDashboardController",
        templateUrl: "src/user/dashboard/dashboard.html"
    });
} ]);

"use strict";

angular.module("app").controller("UserDashboardDetailsController", [ "$q", "$scope", "$state", "modalParams", "$restUser", "$restApp", "$notifier", "$app", "$err", "uiGmapIsReady", function($q, $scope, $state, modalParams, $restUser, $restApp, $notifier, $app, $err, uiGmapIsReady) {
    if (!modalParams.job_id) return;
    $scope.loading = true;
    $scope.job_id = modalParams.job_id || null;
    $scope.formSubmitted = false;
    $err.tryPromise($restUser.one("jobs", $scope.job_id).get()).then(function(data) {
        $scope.loading = false;
        $scope.data = data;
        $scope.map = {
            center: {
                latitude: $scope.data.pickup_latitude,
                longitude: $scope.data.pickup_longitude
            },
            zoom: 9,
            bounds: {},
            polyLines: [],
            control: {},
            options: {
                scrollwheel: false
            }
        };
        $scope.setMapDirections(data);
    });
    $scope.directionsService = new google.maps.DirectionsService();
    $scope.directionsDisplay = new google.maps.DirectionsRenderer();
    $scope.setMapDirections = function(job) {
        uiGmapIsReady.promise(1).then(function(instances) {
            var instanceMap = instances[0].map;
            $scope.directionsDisplay.setMap(instanceMap);
            var directionsServiceRequest = {
                origin: new google.maps.LatLng(job.pickup_latitude, job.pickup_longitude),
                destination: new google.maps.LatLng(job.destination_latitude, job.destination_longitude),
                travelMode: google.maps.TravelMode["DRIVING"],
                optimizeWaypoints: true
            };
            $scope.directionsService.route(directionsServiceRequest, function(response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    $scope.directionsDisplay.setDirections(response);
                    job.distance = response.routes[0].legs[0].distance.value;
                    job.duration = response.routes[0].legs[0].duration.text;
                    var drivingDistance = getMiles(response.routes[0].legs[0].distance.value);
                }
            });
        });
    };
    $scope.$destroy = function() {
        delete $scope.directionsDisplay;
        delete $scope.directionsService;
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.dashboard.details", {
        url: "/job-details/{job_id}",
        page: {
            title: "Job Details",
            class: "icon-layers",
            description: "Job Details"
        },
        modal: "lg",
        controller: "UserDashboardDetailsController",
        templateUrl: "src/user/dashboard/details/details.html"
    });
} ]);

"use strict";

angular.module("app").controller("UserMembersDirectoryController", UserMembersDirectoryController);

UserMembersDirectoryController.$inject = [ "$scope", "$restUser", "$location", "$err", "ngTableParams", "$q", "$restDirectory", "$restApp", "uiGmapGoogleMapApi", "uiGmapIsReady", "$timeout" ];

function UserMembersDirectoryController($scope, $restUser, $location, $err, ngTableParams, $q, $restDirectory, $restApp, uiGmapGoogleMapApi, uiGmapIsReady, $timeout) {
    $scope.filters = {};
    $scope.filterByLocation = "filter[member_address]" in $location.$$search ? true : false;
    $scope.filterByVehicle = "filter[vehicle_min]" in $location.$$search ? true : false;
    $scope.filters.member_miles = "filter[member_miles]" in $location.$$search ? parseInt($location.$$search["filter[member_miles]"]) : 0;
    $scope.tableParams = new ngTableParams(angular.extend({
        page: 1,
        count: 10,
        sorting: {
            created_at: "desc"
        }
    }, $location.search()), {
        total: 0,
        getData: function($defer, params) {
            $location.search(params.url());
            $scope.loading = true;
            $err.tryPromise($restDirectory.all("teams").getList(params.url())).then(function(response) {
                response.forEach(function(item) {
                    item.isCollapsed = true;
                });
                $scope.tableParams.settings({
                    total: response.paginator.total
                });
                $defer.resolve(response);
                $timeout(function() {
                    $scope.loading = false;
                }, 500);
            });
        }
    });
    $scope.blockMember = function(id) {
        $restApp.all("user/team/block").post({
            blocked_team_id: id
        }).then(function() {
            $scope.tableParams.reload();
        });
    };
    $scope.unBlockMember = function(id) {
        $restApp.all("user/team/unblock").post({
            blocked_team_id: id
        }).then(function() {
            $scope.tableParams.reload();
        });
    };
    $scope.getFeedback = function(team) {
        if (team.feedback) {
            return team.feedback;
        }
        team.feedback = new ngTableParams({
            page: 1,
            count: 10,
            sorting: {
                created_at: "desc"
            }
        }, {
            total: 0,
            counts: [],
            getData: function($defer, params) {
                $restDirectory.one("teams", team.id).all("feedback").getList(params.url()).then(function(result) {
                    team.feedback.settings({
                        total: result.paginator.total
                    });
                    $defer.resolve(result);
                });
            }
        });
    };
    $scope.getDocuments = function(team) {
        if (team.documents) {
            return team.documents;
        }
        team.documents = new ngTableParams({
            page: 1,
            count: 5,
            sorting: {
                created_at: "desc"
            }
        }, {
            total: 0,
            getData: function($defer, params) {
                $restDirectory.one("teams", team.id).all("documents").getList(params.url()).then(function(result) {
                    team.documents.settings({
                        total: result.paginator.total
                    });
                    $defer.resolve(result);
                });
            }
        });
    };
    $scope.getLocations = function(team) {
        if (team.locations) {
            return team.locations;
        }
        team.locations = new ngTableParams({
            page: 1,
            count: 5,
            sorting: {
                created_at: "desc"
            }
        }, {
            total: 0,
            getData: function($defer, params) {
                $restDirectory.one("teams", team.id).all("locations").getList(params.url()).then(function(result) {
                    team.locations.settings({
                        total: result.paginator.total
                    });
                    $defer.resolve(result);
                });
            }
        });
    };
    $scope.getVehicles = function(team) {
        if (team.vehicles) {
            return team.vehicles;
        }
        team.vehicles = new ngTableParams({
            page: 1,
            count: 5,
            sorting: {
                created_at: "desc"
            }
        }, {
            total: 0,
            getData: function($defer, params) {
                $restDirectory.one("teams", team.id).all("vehicles").getList(params.url()).then(function(result) {
                    team.vehicles.settings({
                        total: result.paginator.total
                    });
                    $defer.resolve(result);
                });
            }
        });
    };
    $scope.map = {
        center: {
            latitude: 51.5073509,
            longitude: -.12775829999998223
        },
        zoom: 10,
        bounds: {},
        polyLines: []
    };
    $scope.setLocation = function(data) {
        $scope.map.center.latitude = data.latitude;
        $scope.map.center.longitude = data.longitude;
    };
    $scope.$watch("filterByVehicle", function(value) {
        if (!value) {
            delete $scope.tableParams.filter()["vehicle_min"];
            delete $scope.tableParams.filter()["vehicle_max"];
        }
    });
    $scope.$watch("filterByLocation", function(value) {
        if (!value) {
            delete $scope.tableParams.filter()["member_miles"];
            delete $scope.tableParams.filter()["member_address"];
            delete $scope.tableParams.filter()["member_latitude"];
            delete $scope.tableParams.filter()["member_longitude"];
        }
    });
    $scope.$watch("filters.member_miles", function(value) {
        if (value > 0) {
            $scope.tableParams.filter()["member_miles"] = value;
        } else {
            delete $scope.tableParams.filter()["member_miles"];
        }
    });
    $scope.$watch("filterByBlockedMembers", function(value) {
        if (value) {
            $scope.tableParams.filter({
                filter_by_blocked_teams: "true"
            });
        } else {
            delete $scope.tableParams.filter()["filter_by_blocked_teams"];
        }
    });
    $err.tryPromise($restApp.all("vehicles").getList({
        "sorting[size]": "asc"
    })).then(function(vehicles) {
        $scope.min = vehicles[0].size;
        $scope.max = vehicles[vehicles.length - 1].size;
        $scope.vehicles = vehicles;
        if ($scope.filterByVehicle) {
            var min = parseInt($location.$$search["filter[vehicle_min]"]);
            var max = parseInt($location.$$search["filter[vehicle_max]"]);
            $scope.filters.vehicle_min = min;
            $scope.filters.vehicle_max = max;
        } else {
            $scope.filters.vehicle_min = 100;
            $scope.filters.vehicle_max = $scope.vehicles.length * 100;
        }
        $scope.$watchGroup([ "filters.vehicle_min", "filters.vehicle_max" ], function(val, old) {
            if (_.isEqual(val, old)) return;
            $scope.tableParams.filter()["vehicle_min"] = val[0];
            $scope.tableParams.filter()["vehicle_max"] = val[1];
        });
    });
}

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.directory", {
        url: "/directory",
        preserveQueryParams: true,
        page: {
            title: "Members Directory",
            description: "SDCN Members Directory"
        },
        controller: "UserMembersDirectoryController",
        templateUrl: "src/user/directory/directory.html"
    });
} ]);

"use strict";

angular.module("app").controller("DirectoryLocationController", DirectoryLocationController);

DirectoryLocationController.$inject = [ "$scope", "$location", "modalParams", "uiGmapIsReady", "uiGmapGoogleMapApi", "$timeout" ];

function DirectoryLocationController($scope, $location, modalParams, uiGmapIsReady, uiGmapGoogleMapApi, $timeout) {
    if (!modalParams.lat || !modalParams.lng || !modalParams.radius) {
        return;
    }
    $scope.map = {
        zoom: 10,
        center: {
            latitude: modalParams.lat,
            longitude: modalParams.lng
        },
        bounds: {},
        control: {},
        marker: {
            key: 1
        },
        circle: {
            id: 1,
            events: {
                dragend: function(circle, eventName, scope) {
                    console.log("dragend");
                    circle.getMap().fitBounds(circle.getBounds());
                },
                radius_changed: function(circle, eventName, scope) {
                    console.log("radius changed");
                    circle.getMap().fitBounds(circle.getBounds());
                }
            }
        },
        polyLines: []
    };
    $scope.$displayMap = false;
    $timeout(function() {
        $scope.map.center = {
            latitude: modalParams.lat,
            longitude: modalParams.lng
        };
        $scope.map.circle.radius = modalParams.radius * 1609.344;
        $scope.map.circle.center = $scope.map.center;
        $scope.$displayMap = true;
    });
    $scope.$destroy = function() {
        $scope.displayMap = false;
    };
    $scope.mapOptions = {
        scrollWheel: false
    };
}

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.directory.map", {
        url: "/map/:lat/:lng/:radius",
        page: {
            title: "User Location",
            class: "icon-envelope",
            description: "User Location"
        },
        modal: "lg",
        controller: "DirectoryLocationController",
        templateUrl: "src/user/directory/map/map.html"
    });
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.help", {
        url: "/help",
        page: {
            title: "Help",
            subTitle: "Help page description"
        },
        templateUrl: "src/user/help/help.html"
    });
} ]);

"use strict";

angular.module("app").controller("UserJobsAllocateController", [ "$q", "$scope", "$filter", "$state", "$stateParams", "$restUser", "$restApp", "$auth", "$notifier", "$app", "$err", "$geo", "$moment", "uiGmapGoogleMapApi", "uiGmapIsReady", function($q, $scope, $filter, $state, $stateParams, $restUser, $restApp, $auth, $notifier, $app, $err, $geo, $moment, uiGmapGoogleMapApi, uiGmapIsReady) {
    function getDefaultDate(plus, reset) {
        var time = $moment();
        if (reset) {
            time.hour(8).minute(0).second(0);
        }
        time.add(plus, "d");
        return time.toDate();
    }
    var dateFormat = "YYYY-MM-DD HH:mm:ss";
    $scope.formSubmited = false;
    $scope.minDate = $moment().toDate();
    $scope.data = {
        user_id: $auth.user().id,
        priority: 3,
        pickup_date: getDefaultDate(0),
        destination_date: getDefaultDate(1, true),
        expiry_time: $moment().add(1, "d").toDate(),
        additional_options: [],
        way_points: [],
        pickup_postcode_prefix: "",
        pickup_town: "",
        destination_postcode_prefix: "",
        destination_town: "",
        allocate_manually: false,
        bid_manual: 1,
        bid_user_id: $auth.user().id,
        bid_amount: 0,
        bid_add_vat: 0
    };
    $scope.$watch("data.pickup_details", function(newVal) {
        if (newVal) {
            newVal.address_components.forEach(function(address_component) {
                address_component.types.forEach(function(type) {
                    if (type == "postal_town") {
                        $scope.data.pickup_town = address_component.long_name;
                    }
                });
                if ($scope.data.pickup_town == "") {
                    address_component.types.forEach(function(type) {
                        if (type == "locality") {
                            $scope.data.pickup_town = address_component.long_name;
                        }
                    });
                }
            });
            newVal.address_components.forEach(function(address_component) {
                address_component.types.forEach(function(type) {
                    if (type == "postal_code") {
                        $scope.data.pickup_postcode_prefix = address_component.long_name.split(" ")[0];
                    }
                });
            });
            $scope.data.pickup_formatted_address = newVal.formatted_address;
        }
    });
    $scope.$watch("data.destination_details", function(newVal) {
        if (newVal) {
            newVal.address_components.forEach(function(address_component) {
                address_component.types.forEach(function(type) {
                    if (type == "postal_town") {
                        $scope.data.destination_town = address_component.long_name;
                    }
                });
                if ($scope.data.destination_town == "") {
                    address_component.types.forEach(function(type) {
                        if (type == "locality") {
                            $scope.data.destination_town = address_component.long_name;
                        }
                    });
                }
            });
            newVal.address_components.forEach(function(address_component) {
                address_component.types.forEach(function(type) {
                    if (type == "postal_code") {
                        $scope.data.destination_postcode_prefix = address_component.long_name.split(" ")[0];
                    }
                });
            });
            $scope.data.destination_formatted_address = newVal.formatted_address;
        }
    });
    $scope.setUserId = function($item, $model) {
        $scope.data.bid_user_id = $model.id;
        $scope.data.bid_add_vat = $model.team.invoice_details.invoice_including_vat;
    };
    $scope.getUsers = function(value) {
        return $restUser.all("user").getList(flattenParams({
            filters: {
                search: value,
                inactivated: 0
            }
        })).then(function(result) {
            return result.plain();
        });
    };
    $scope.$watch(function() {
        return $auth.user().id;
    }, function(newVal) {
        $scope.data.user_id = newVal;
    });
    $err.tryPromise($restApp.all("options").getList()).then(function(data) {
        $scope.vehicle_options = data;
    });
    $scope.toggleSelection = function(option) {
        var idx = $scope.data.additional_options.indexOf(option);
        if (idx > -1) {
            $scope.data.additional_options.splice(idx, 1);
        } else {
            $scope.data.additional_options.push(option);
        }
    };
    $err.tryPromise($restApp.all("vehicles").getList({
        "sorting[size]": "asc",
        count: -1
    })).then(function(data) {
        $scope.vehicles = data;
    });
    $scope.user = $auth.user();
    $scope.addToWayPoints = function() {
        $scope.data.way_points.push({
            way_point: null,
            stopoff_date: new Date()
        });
    };
    $scope.removeFromWayPoints = function(wayPoint) {
        var i = $scope.data.way_points.indexOf(wayPoint);
        if (i != -1) {
            $scope.data.way_points.splice(i, 1);
        }
    };
    $scope.store = function() {
        if ($scope.data.pickup_latitude == undefined || $scope.data.destination_latitude == undefined) {
            $notifier.error("Location not registered. Please select locations from the dropdown.");
            return;
        }
        var pickup_date = $scope.data.pickup_date;
        var destination_date = $scope.data.destination_date;
        var expiry_time = $scope.data.expiry_time;
        var pickup_date_end = $scope.data.pickup_date_end;
        var destination_date_end = $scope.data.destination_date_end;
        $scope.data.pickup_date = $moment($scope.data.pickup_date).format(dateFormat);
        $scope.data.destination_date = $moment($scope.data.destination_date).format(dateFormat);
        $scope.data.expiry_time = $moment($scope.data.expiry_time).format(dateFormat);
        $scope.data.pickup_date_end = $moment($scope.data.pickup_date_end).isValid() ? $moment($scope.data.pickup_date_end).format(dateFormat) : null;
        $scope.data.destination_date_end = $moment($scope.data.destination_date_end).isValid() ? $moment($scope.data.destination_date_end).format(dateFormat) : null;
        $scope.formSubmited = true;
        $scope.data.status = "progress";
        $scope.data.status_date = getDefaultDate();
        $err.tryPromise($restUser.all("jobs").post($scope.data)).then(function() {
            $notifier.success("Job posted successfully");
            $app.goTo("user.account.jobs");
        }, function(error) {
            $scope.data.pickup_date = pickup_date;
            $scope.data.destination_date = destination_date;
            $scope.data.expiry_time = expiry_time;
            $scope.data.pickup_date_end = pickup_date_end;
            $scope.data.destination_date_end = destination_date_end;
            $scope.formSubmited = false;
        });
    };
    $scope.cancel = function() {
        $app.reload();
    };
    $scope.$watch("data.accept_phone", function(newVal) {
        if (newVal) $scope.data.phone = $scope.user.phone;
        if (!newVal) delete $scope.data.phone;
    });
    $scope.$watch("data.accept_email", function(newVal) {
        if (newVal) $scope.data.email = $scope.user.email;
        if (!newVal) delete $scope.data.email;
    });
    $scope.$watch("data.flexible_pickup", function(newVal) {
        if (newVal) {
            $scope.data.pickup_date_end = $scope.data.pickup_date;
        }
    });
    $scope.$watch("data.flexible_destination", function(newVal) {
        if (newVal) {
            $scope.data.destination_date_end = $scope.data.destination_date;
        }
    });
    $scope.directionsService = new google.maps.DirectionsService();
    $scope.directionsDisplay = new google.maps.DirectionsRenderer();
    $scope.map = {
        center: {
            latitude: 51.5073509,
            longitude: -.12775829999998223
        },
        zoom: 10,
        bounds: {},
        polyLines: []
    };
    $scope.mapOptions = {
        scrollwheel: false
    };
    $scope.$watch("data.pickup_latitude", function(newVal) {
        if (newVal && $scope.data.destination_latitude) {
            $scope.setMapDirections();
        }
    });
    $scope.$watch("data.destination_latitude", function(newVal) {
        if (newVal && $scope.data.pickup_latitude) {
            $scope.setMapDirections();
        }
    });
    $scope.setMapDirections = function() {
        uiGmapIsReady.promise().then(function(instances) {
            var instanceMap = instances[0].map;
            $scope.directionsDisplay.setMap(instanceMap);
            var directionsServiceRequest = {
                origin: new google.maps.LatLng($scope.data.pickup_latitude, $scope.data.pickup_longitude),
                destination: new google.maps.LatLng($scope.data.destination_latitude, $scope.data.destination_longitude),
                travelMode: google.maps.TravelMode["DRIVING"],
                optimizeWaypoints: true
            };
            $scope.directionsService.route(directionsServiceRequest, function(response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    $scope.directionsDisplay.setDirections(response);
                    $scope.data.distance = response.routes[0].legs[0].distance.value;
                    $scope.data.duration = response.routes[0].legs[0].duration.text;
                    $scope.drivingDistance = getMiles(response.routes[0].legs[0].distance.value);
                }
            });
        });
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.jobs.allocate", {
        url: "/allocate",
        page: {
            title: "Allocate a Job",
            class: "icon-doc",
            description: "Allocate a new Job"
        },
        controller: "UserJobsAllocateController",
        templateUrl: "src/user/jobs/allocate/allocate.html"
    });
} ]);

"use strict";

angular.module("app").controller("UserJobsBrowseController", [ "$rootScope", "$state", "$scope", "$q", "$location", "$filter", "$err", "ngTableParams", "$restApp", "$restUser", "$modal", "$log", "$geo", "uiGmapIsReady", "$auth", function($rootScope, $state, $scope, $q, $location, $filter, $err, ngTableParams, $restApp, $restUser, $modal, $log, $geo, uiGmapIsReady, $auth) {
    $scope.loading = true;
    $scope.filters = {};
    $scope.user = $auth.user();
    $scope.filterByPickup = "filter[pickup_address]" in $location.$$search ? true : false;
    $scope.filterByDest = "filter[destination_address]" in $location.$$search ? true : false;
    $scope.filters.pickup_miles = "filter[pickup_miles]" in $location.$$search ? parseInt($location.$$search["filter[pickup_miles]"]) : 0;
    $scope.filters.destination_miles = "filter[destination_miles]" in $location.$$search ? parseInt($location.$$search["filter[destination_miles]"]) : 0;
    $scope.vehicles = $restApp.all("vehicles").customGETLIST("select").$object;
    $scope.tableParams = new ngTableParams(angular.extend({
        page: 1,
        count: 10,
        sorting: {
            created_at: "desc"
        }
    }, $location.search()), {
        total: 0,
        getData: function($defer, params) {
            $location.search(params.url());
            $err.tryPromise($restUser.all("jobs").all("browse").getList(params.url())).then(function(result) {
                $scope.tableParams.settings({
                    total: result.paginator.total
                });
                $scope.loading = false;
                $defer.resolve(result);
            }, function(result) {
                if (result.status == 403) {
                    $scope.error = {
                        status: 403,
                        message: "Please check that your documents are correct and in date before searching for jobs."
                    };
                }
                $scope.loading = false;
            });
        }
    });
    $scope.$watch("filterByPickup", function(newVal) {
        if (!newVal) {
            $scope.filters.pickup_miles = 0;
            delete $scope.tableParams.filter()["pickup_address"];
            delete $scope.tableParams.filter()["pickup_longitude"];
            delete $scope.tableParams.filter()["pickup_latitude"];
        }
    });
    $scope.setMapDirections = function(job) {
        uiGmapIsReady.promise(1).then(function(instances) {
            var instanceMap = instances[0].map;
            job.map.directionsDisplay.setMap(instanceMap);
            var directionsServiceRequest = {
                origin: new google.maps.LatLng(job.pickup_latitude, job.pickup_longitude),
                destination: new google.maps.LatLng(job.destination_latitude, job.destination_longitude),
                travelMode: google.maps.TravelMode["DRIVING"],
                optimizeWaypoints: true
            };
            job.map.directionsService.route(directionsServiceRequest, function(response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    job.map.directionsDisplay.setDirections(response);
                    job.distance = response.routes[0].legs[0].distance.value;
                    job.duration = response.routes[0].legs[0].duration.text;
                    var drivingDistance = getMiles(response.routes[0].legs[0].distance.value);
                }
            });
        });
    };
    $scope.maps = new Array();
    $scope.initMap = function(job) {
        $scope.tableParams.data.forEach(function(item) {
            if (item.isCollapsed === false && item.id !== job.id) {
                item.isCollapsed = true;
            }
        });
        job.map = {
            center: {
                latitude: job.pickup_latitude,
                longitude: job.pickup_longitude
            },
            zoom: 7,
            bounds: {},
            polyLines: [],
            control: {},
            options: {
                scrollwheel: false
            }
        };
        job.map.directionsService = new google.maps.DirectionsService();
        job.map.directionsDisplay = new google.maps.DirectionsRenderer({
            suppressMarkers: true,
            polylineOptions: {
                strokeColor: "#FF0000",
                strokeOpacity: .6
            }
        });
        $scope.maps[job.id] = job.map;
        setTimeout(function() {
            var pickup_latlng = new google.maps.LatLng(job.pickup_latitude, job.pickup_longitude);
            var destination_latlng = new google.maps.LatLng(job.destination_latitude, job.destination_longitude);
            var bounds = new google.maps.LatLngBounds();
            var map = $scope.maps[job.id].control.getGMap();
            var Marker_A = new google.maps.Marker({
                position: pickup_latlng,
                label: "A",
                map: map,
                opacity: 0
            });
            var Marker_B = new google.maps.Marker({
                position: destination_latlng,
                label: "B",
                map: map,
                opacity: 0
            });
            bounds.extend(Marker_A.getPosition());
            bounds.extend(Marker_B.getPosition());
            map.fitBounds(bounds);
            var Circle_A = new google.maps.Circle({
                strokeColor: "#FF0000",
                strokeOpacity: .8,
                strokeWeight: 1,
                fillColor: "#FF0000",
                fillOpacity: 1,
                map: map,
                center: pickup_latlng,
                radius: 1e3
            });
            var Circle_B = new google.maps.Circle({
                strokeColor: "#FF0000",
                strokeOpacity: .8,
                strokeWeight: 1,
                fillColor: "#FF0000",
                fillOpacity: 1,
                map: map,
                center: destination_latlng,
                radius: 1e3
            });
            $scope.maps[job.id].control.refresh();
        }, 100);
        $scope.setMapDirections(job);
    };
    $scope.$watch("filterByDest", function(newVal) {
        if (!newVal) {
            $scope.filters.destination_miles = 0;
            delete $scope.tableParams.filter()["destination_address"];
            delete $scope.tableParams.filter()["destination_longitude"];
            delete $scope.tableParams.filter()["destination_latitude"];
        }
    });
    $scope.$watch("filters.pickup_miles", function(value) {
        if (value > 0) $scope.tableParams.filter()["pickup_miles"] = value; else delete $scope.tableParams.filter()["pickup_miles"];
    });
    $scope.$watch("filters.destination_miles", function(value) {
        if (value > 0) $scope.tableParams.filter()["destination_miles"] = value; else delete $scope.tableParams.filter()["destination_miles"];
    });
    $scope.getDistance = function(job) {
        if (job.distance) {
            return getMiles(job.distance);
        } else {
            return getMiles(google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(job.pickup_latitude, job.pickup_longitude), new google.maps.LatLng(job.destination_latitude, job.destination_longitude)));
        }
    };
    $scope.getDate = function(date) {
        return window.moment(date).format("YYYY/MM/DD h:mma");
    };
    $scope.call = function(data) {
        window.location.href = "tel://" + data;
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.jobs.browse", {
        url: "/browse",
        preserveQueryParams: true,
        page: {
            title: "Browse Jobs",
            class: "icon-magnifier",
            description: "Browse all jobs"
        },
        controller: "UserJobsBrowseController",
        templateUrl: "src/user/jobs/browse/browse.html"
    });
} ]);

"use strict";

angular.module("app").controller("UserJobsBrowseSubmitController", [ "$q", "$moment", "$scope", "$state", "modalParams", "$restUser", "$restApp", "$notifier", "$app", "$err", "$auth", function($q, $moment, $scope, $state, modalParams, $restUser, $restApp, $notifier, $app, $err, $auth) {
    if (!modalParams.job_id) return;
    $scope.formSubmited = false;
    $scope.loading = true;
    $scope.data = {};
    $scope.job_id = modalParams.job_id || null;
    $err.tryPromise($restUser.one("jobs", $scope.job_id).get()).then(function(data) {
        $scope.job = data;
        $scope.job.avg_miles = $scope.getDistance(data);
        $auth.assure(function() {
            $scope.loading = false;
            $scope.data = {
                user_id: $auth.user().id,
                add_vat: $auth.user().team.invoice_details.invoice_including_vat,
                job_id: $scope.job_id,
                bid_date: $moment().format()
            };
        });
    });
    var query = {
        filter: {
            job_id: $scope.job_id,
            user_id: $auth.user().id
        }
    };
    $err.tryPromise($restUser.all("bids").getList(flattenParams(query))).then(function(data) {
        if (data.length) {
            $notifier.error("Already submitted bid");
            $scope.$dismiss();
        }
    });
    $scope.store = function() {
        $scope.formSubmited = true;
        $err.tryPromise($restUser.all("bids").post($scope.data)).then(function() {
            $notifier.success("Bid submitted successfully");
            $app.goTo("user.account.work");
            $scope.$dismiss();
        }, function(error) {
            $scope.formSubmited = false;
        });
    };
    $scope.getDistance = function(job) {
        if (job) {
            if (job.distance) {
                return getMiles(job.distance);
            } else {
                return getMiles(google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(job.pickup_latitude, job.pickup_longitude), new google.maps.LatLng(job.destination_latitude, job.destination_longitude)));
            }
        }
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.jobs.browse.submit", {
        url: "/{job_id}/submit",
        page: {
            title: "Browse Jobs",
            class: "icon-magnifier",
            description: "Browse all jobs"
        },
        modal: "lg",
        controller: "UserJobsBrowseSubmitController",
        templateUrl: "src/user/jobs/browse/submit/submit.html"
    });
} ]);

"use strict";

angular.module("app").controller("UserJobsEditController", [ "$q", "$scope", "$filter", "$state", "$stateParams", "$restUser", "$restApp", "$auth", "$notifier", "$app", "$err", "$geo", "$moment", "uiGmapGoogleMapApi", "uiGmapIsReady", function($q, $scope, $filter, $state, $stateParams, $restUser, $restApp, $auth, $notifier, $app, $err, $geo, $moment, uiGmapGoogleMapApi, uiGmapIsReady) {
    $scope.data = $stateParams.job;
    if ($stateParams.job.additional_options == null) {
        $scope.data.additional_options = [];
    }
    $scope.user = $auth.user();
    var dateFormat = "YYYY-MM-DD HH:mm:ss";
    function getDefaultDate(plus, reset) {
        var time = $moment();
        if (reset) {
            time.hour(8).minute(0).second(0);
        }
        time.add(plus, "d");
        return time.toDate();
    }
    $scope.minDate = $moment().toDate();
    $scope.toggleSelection = function(option) {
        var idx = $scope.data.additional_options.indexOf(option);
        if (idx > -1) {
            $scope.data.additional_options.splice(idx, 1);
        } else {
            $scope.data.additional_options.push(option);
        }
    };
    $scope.addToWayPoints = function() {
        $scope.data.way_points.push({
            way_point: null,
            stopoff_date: new Date()
        });
    };
    $scope.removeFromWayPoints = function(wayPoint) {
        var i = $scope.data.way_points.indexOf(wayPoint);
        if (i != -1) {
            $scope.data.way_points.splice(i, 1);
        }
    };
    $scope.cancel = function() {
        $app.reload();
    };
    $scope.$watch("data.accept_phone", function(newVal) {
        if (newVal) $scope.data.phone = $scope.user.phone;
        if (!newVal) delete $scope.data.phone;
    });
    $scope.$watch("data.accept_email", function(newVal) {
        if (newVal) $scope.data.email = $scope.user.email;
        if (!newVal) delete $scope.data.email;
    });
    $scope.$watch("data.flexible_pickup", function(newVal) {
        if (newVal) {
            $scope.data.pickup_date_end = $scope.data.pickup_date;
        }
    });
    $scope.$watch("data.flexible_destination", function(newVal) {
        if (newVal) {
            $scope.data.destination_date_end = $scope.data.destination_date;
        }
    });
    $scope.directionsService = new google.maps.DirectionsService();
    $scope.directionsDisplay = new google.maps.DirectionsRenderer();
    $scope.map = {
        center: {
            latitude: 51.5073509,
            longitude: -.12775829999998223
        },
        zoom: 10,
        bounds: {},
        polyLines: []
    };
    $scope.mapOptions = {
        scrollwheel: false
    };
    $scope.$watch("data.pickup_latitude", function(newVal) {
        if (newVal && $scope.data.destination_latitude) {
            $scope.setMapDirections();
        }
    });
    $scope.$watch("data.destination_latitude", function(newVal) {
        if (newVal && $scope.data.pickup_latitude) {
            $scope.setMapDirections();
        }
    });
    $scope.setMapDirections = function() {
        uiGmapIsReady.promise().then(function(instances) {
            var instanceMap = instances[0].map;
            $scope.directionsDisplay.setMap(instanceMap);
            var directionsServiceRequest = {
                origin: new google.maps.LatLng($scope.data.pickup_latitude, $scope.data.pickup_longitude),
                destination: new google.maps.LatLng($scope.data.destination_latitude, $scope.data.destination_longitude),
                travelMode: google.maps.TravelMode["DRIVING"],
                optimizeWaypoints: true
            };
            $scope.directionsService.route(directionsServiceRequest, function(response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    $scope.directionsDisplay.setDirections(response);
                    $scope.data.distance = response.routes[0].legs[0].distance.value;
                    $scope.data.duration = response.routes[0].legs[0].duration.text;
                    $scope.drivingDistance = getMiles(response.routes[0].legs[0].distance.value);
                }
            });
        });
    };
    $err.tryPromise($restApp.all("options").getList()).then(function(data) {
        $scope.vehicle_options = data;
    });
    $err.tryPromise($restApp.all("vehicles").getList({
        "sorting[size]": "asc",
        count: -1
    })).then(function(data) {
        $scope.vehicles = data;
    });
    $scope.update = function() {
        $scope.data.pickup_date = $moment($scope.data.pickup_date).format(dateFormat);
        $scope.data.destination_date = $moment($scope.data.destination_date).format(dateFormat);
        $scope.data.expiry_time = $moment($scope.data.expiry_time).format(dateFormat);
        $scope.data.pickup_date_end = $moment($scope.data.pickup_date_end).isValid() ? $moment($scope.data.pickup_date_end).format(dateFormat) : null;
        $scope.data.destination_date_end = $moment($scope.data.destination_date_end).isValid() ? $moment($scope.data.destination_date_end).format(dateFormat) : null;
        $scope.formSubmited = true;
        $err.tryPromise($restUser.one("jobs", $scope.data.id).patch($scope.data)).then(function() {
            $notifier.success("Job updated successfully");
            $app.goTo("user.account.jobs");
        }, function(error) {
            $scope.formSubmited = false;
        });
    };
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.jobs.edit", {
        url: "/edit/{job_id}",
        page: {
            title: "Post A Job",
            class: "icon-doc",
            description: "Post a new Job"
        },
        controller: "UserJobsEditController",
        templateUrl: "src/user/jobs/edit/edit.html",
        params: {
            job: null,
            job_id: null
        }
    });
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.jobs", {
        abstract: true,
        url: "/jobs",
        template: "<div data-ui-view></div>"
    });
} ]);

"use strict";

angular.module("app").controller("UserJobsPostController", [ "$q", "$scope", "$filter", "$state", "$stateParams", "$restUser", "$restApp", "$auth", "$notifier", "$app", "$err", "$geo", "$moment", "uiGmapGoogleMapApi", "uiGmapIsReady", function($q, $scope, $filter, $state, $stateParams, $restUser, $restApp, $auth, $notifier, $app, $err, $geo, $moment, uiGmapGoogleMapApi, uiGmapIsReady) {
    function getDefaultDate(plus, reset) {
        var time = $moment();
        if (reset) {
            time.hour(8).minute(0).second(0);
        }
        time.add(plus, "d");
        return time.toDate();
    }
    var dateFormat = "YYYY-MM-DD HH:mm:ss";
    $scope.formSubmited = false;
    $scope.minDate = $moment().toDate();
    $scope.data = {
        user_id: $auth.user().id,
        priority: 3,
        pickup_date: getDefaultDate(0),
        destination_date: getDefaultDate(1, true),
        expiry_time: $moment().add(1, "d").toDate(),
        additional_options: [],
        way_points: [],
        pickup_postcode_prefix: "",
        pickup_town: "",
        destination_postcode_prefix: "",
        destination_town: "",
        accept_phone: 1,
        accept_online: 1
    };
    $scope.$watch("data.pickup_details", function(newVal) {
        if (newVal) {
            newVal.address_components.forEach(function(address_component) {
                address_component.types.forEach(function(type) {
                    if (type == "postal_town") {
                        $scope.data.pickup_town = address_component.long_name;
                    }
                });
                if ($scope.data.pickup_town == "") {
                    address_component.types.forEach(function(type) {
                        if (type == "locality") {
                            $scope.data.pickup_town = address_component.long_name;
                        }
                    });
                }
            });
            newVal.address_components.forEach(function(address_component) {
                address_component.types.forEach(function(type) {
                    if (type == "postal_code") {
                        $scope.data.pickup_postcode_prefix = address_component.long_name.split(" ")[0];
                    }
                });
            });
            $scope.data.pickup_formatted_address = newVal.formatted_address;
        }
    });
    $scope.$watch("data.destination_details", function(newVal) {
        if (newVal) {
            newVal.address_components.forEach(function(address_component) {
                address_component.types.forEach(function(type) {
                    if (type == "postal_town") {
                        $scope.data.destination_town = address_component.long_name;
                    }
                });
                if ($scope.data.destination_town == "") {
                    address_component.types.forEach(function(type) {
                        if (type == "locality") {
                            $scope.data.destination_town = address_component.long_name;
                        }
                    });
                }
            });
            newVal.address_components.forEach(function(address_component) {
                address_component.types.forEach(function(type) {
                    if (type == "postal_code") {
                        $scope.data.destination_postcode_prefix = address_component.long_name.split(" ")[0];
                    }
                });
            });
            $scope.data.destination_formatted_address = newVal.formatted_address;
        }
    });
    $scope.$watch(function() {
        return $auth.user().id;
    }, function(newVal) {
        $scope.data.user_id = newVal;
    });
    $err.tryPromise($restApp.all("options").getList()).then(function(data) {
        $scope.vehicle_options = data;
    });
    var filterArray = function(label) {
        return $scope.data.additional_options.filter(function(obj) {
            return obj.label == label;
        });
    };
    $scope.toggleSelection = function(item) {
        $scope.data.additional_options.forEach(function(obj, index) {
            if (obj.label == item.label) {
                $scope.data.additional_options.splice(index, 1);
            }
        });
        if (filterArray().length == 0) {
            $scope.data.additional_options.push(item);
        }
    };
    $scope.filterOptions = function(label) {
        return filterArray(label).length > 0;
    };
    $err.tryPromise($restApp.all("vehicles").getList({
        "sorting[size]": "asc",
        count: -1
    })).then(function(data) {
        $scope.vehicles = data;
    });
    $scope.user = $auth.user();
    $scope.addToWayPoints = function() {
        $scope.data.way_points.push({
            way_point: null,
            stopoff_date: new Date()
        });
    };
    $scope.removeFromWayPoints = function(wayPoint) {
        var i = $scope.data.way_points.indexOf(wayPoint);
        if (i != -1) {
            $scope.data.way_points.splice(i, 1);
        }
    };
    $scope.store = function() {
        var pickup_date = $scope.data.pickup_date;
        var destination_date = $scope.data.destination_date;
        var expiry_time = $scope.data.expiry_time;
        var pickup_date_end = $scope.data.pickup_date_end;
        var destination_date_end = $scope.data.destination_date_end;
        if ($scope.data.pickup_latitude == undefined || $scope.data.destination_latitude == undefined) {
            $notifier.error("Location not registered. Please select locations from the dropdown.");
            return;
        }
        $scope.data.pickup_date = $moment($scope.data.pickup_date).format(dateFormat);
        $scope.data.destination_date = $moment($scope.data.destination_date).format(dateFormat);
        $scope.data.expiry_time = $moment($scope.data.expiry_time).format(dateFormat);
        $scope.data.pickup_date_end = $moment($scope.data.pickup_date_end).isValid() ? $moment($scope.data.pickup_date_end).format(dateFormat) : null;
        $scope.data.destination_date_end = $moment($scope.data.destination_date_end).isValid() ? $moment($scope.data.destination_date_end).format(dateFormat) : null;
        $scope.formSubmited = true;
        $err.tryPromise($restUser.all("jobs").post($scope.data)).then(function() {
            $notifier.success("Job posted successfully");
            $app.goTo("user.account.jobs");
        }, function(error) {
            $scope.data.pickup_date = pickup_date;
            $scope.data.destination_date = destination_date;
            $scope.data.expiry_time = expiry_time;
            $scope.data.pickup_date_end = pickup_date_end;
            $scope.data.destination_date_end = destination_date_end;
            $scope.formSubmited = false;
        });
    };
    $scope.cancel = function() {
        $app.reload();
    };
    $scope.$watch("data.accept_phone", function(newVal) {
        if (newVal) $scope.data.phone = $scope.user.phone;
        if (!newVal) delete $scope.data.phone;
    });
    $scope.$watch("data.accept_email", function(newVal) {
        if (newVal) $scope.data.email = $scope.user.email;
        if (!newVal) delete $scope.data.email;
    });
    $scope.$watch("data.flexible_pickup", function(newVal) {
        if (newVal) {
            $scope.data.pickup_date_end = $scope.data.pickup_date;
        }
    });
    $scope.$watch("data.flexible_destination", function(newVal) {
        if (newVal) {
            $scope.data.destination_date_end = $scope.data.destination_date;
        }
    });
    $scope.directionsService = new google.maps.DirectionsService();
    $scope.directionsDisplay = new google.maps.DirectionsRenderer();
    $scope.map = {
        center: {
            latitude: 51.5073509,
            longitude: -.12775829999998223
        },
        zoom: 10,
        bounds: {},
        polyLines: []
    };
    $scope.mapOptions = {
        scrollwheel: false
    };
    $scope.$watch("data.pickup_latitude", function(newVal) {
        if (newVal && $scope.data.destination_latitude) {
            $scope.setMapDirections();
        }
    });
    $scope.$watch("data.destination_latitude", function(newVal) {
        if (newVal && $scope.data.pickup_latitude) {
            $scope.setMapDirections();
        }
    });
    $scope.setMapDirections = function() {
        uiGmapIsReady.promise().then(function(instances) {
            var instanceMap = instances[0].map;
            $scope.directionsDisplay.setMap(instanceMap);
            var directionsServiceRequest = {
                origin: new google.maps.LatLng($scope.data.pickup_latitude, $scope.data.pickup_longitude),
                destination: new google.maps.LatLng($scope.data.destination_latitude, $scope.data.destination_longitude),
                travelMode: google.maps.TravelMode["DRIVING"],
                optimizeWaypoints: true
            };
            $scope.directionsService.route(directionsServiceRequest, function(response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    $scope.directionsDisplay.setDirections(response);
                    $scope.data.distance = response.routes[0].legs[0].distance.value;
                    $scope.data.duration = response.routes[0].legs[0].duration.text;
                    $scope.drivingDistance = getMiles(response.routes[0].legs[0].distance.value);
                }
            });
        });
    };
    if ($stateParams.repost_job != null) {
        var query = {
            filter: {
                id: $stateParams.repost_job.id
            }
        };
        $err.tryPromise($restUser.one("jobs").get(flattenParams(query))).then(function(data) {
            var job = data[0];
            $scope.data.pickup_latitude = job.pickup_latitude;
            $scope.data.pickup_longitude = job.pickup_longitude;
            $scope.data.pickup_point = job.pickup_point;
            $scope.data.destination_latitude = job.destination_latitude;
            $scope.data.destination_longitude = job.destination_longitude;
            $scope.data.destination_point = job.destination_point;
            $scope.data.vehicle_id = job.vehicle_id;
            $scope.data.details = job.details;
            $scope.data.accept_phone = job.accept_phone;
            $scope.data.accept_online = job.accept_online;
            $scope.data.phone = job.phone;
            $scope.data.accept_email = job.accept_email;
            $scope.data.email = job.email;
            $scope.data.pickup_asap = job.pickup_asap;
            $scope.data.destination_asap = job.destination_asap;
            $scope.data.flexible_pickup = job.flexible_pickup;
            $scope.data.flexible_destination = job.flexible_destination;
            $scope.data.additional_options = job.additional_options;
            $scope.data.pickup_town = job.pickup_town;
            $scope.data.pickup_postcode_prefix = job.pickup_postcode_prefix;
            $scope.data.destination_town = job.destination_town;
            $scope.data.destination_postcode_prefix = job.destination_postcode_prefix;
        });
    }
} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user.jobs.post", {
        url: "/post",
        page: {
            title: "Post A Job",
            class: "icon-doc",
            description: "Post a new Job"
        },
        controller: "UserJobsPostController",
        templateUrl: "src/user/jobs/post/post.html",
        params: {
            repost_job: null
        }
    });
} ]);

"use strict";

angular.module("app").controller("LatestJobsController", [ "$rootScope", "$scope", "$auth", "$err", "$restUser", function($rootScope, $scope, $auth, $err, $restUser) {
    $auth.assure(function() {
        var params = {
            count: 4,
            sorting: {
                created_at: "desc"
            },
            filter: {
                pickup_miles: 50,
                in_areas: $auth.user().id
            }
        };
        $err.tryPromise($restUser.all("jobs").all("browse").getList(flattenParams(params))).then(function(result) {
            $scope.data = result;
        });
    });
} ]);

"use strict";

angular.module("app").controller("UsefulLinksController", [ "$rootScope", "$scope", function($rootScope, $scope) {} ]);

"use strict";

angular.module("app").config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("user", {
        abstract: true,
        url: "/user",
        templateUrl: "src/user/user.html"
    });
} ]);

angular.module("app").run([ "$templateCache", function($templateCache) {
    "use strict";
    $templateCache.put("src/admin/admin.html", '<div class="app app-admin" ng-class="{\n' + "\t'app-header-fixed': $app.settings.headerFixed,\n" + "\t'app-aside-fixed' : $app.settings.asideFixed,\n" + "\t'app-aside-folded': $app.settings.asideFolded,\n" + "\t'app-aside-dock'  : $app.settings.asideDock,\n" + "\t'container'       : $app.settings.container\n" + '}">\x3c!-- navbar --\x3e<div data-ng-include=" \'src/admin/layout/header.html\' " class="app-header navbar"></div>\x3c!-- / navbar --\x3e\x3c!-- menu --\x3e<div data-ng-include=" \'src/admin/layout/aside.html\' " class="app-aside hidden-xs {{$app.settings.asideColor}}"></div>\x3c!-- / menu --\x3e\x3c!-- content --\x3e<div class=app-content><a href class="off-screen-toggle hide" data-ui-toggle-class=off-screen data-target=.app-aside></a><div class="app-content-body fade-in-up" data-ui-view></div></div>\x3c!-- /content --\x3e\x3c!-- footer --\x3e<div data-ng-include=" \'src/admin/layout/footer.html\' " class="settings panel panel-default"></div>\x3c!-- / footer --\x3e</div>');
    $templateCache.put("src/admin/dashboard/dashboard.html", '<div class="hbox hbox-auto-xs hbox-auto-sm" ng-init="\n' + "    $app.settings.asideFolded = false;\n" + "    $app.settings.asideDock = false;\n" + '  ">\x3c!-- main --\x3e<div class=col>\x3c!-- main header --\x3e<div class="bg-light lter b-b wrapper-md"><h1 class="m-n font-light h3"><i class=icon-home></i> Dashboard</h1></div>\x3c!-- / main header --\x3e<div class=wrapper-md>\x3c!-- service --\x3e<div class="panel hbox hbox-auto-xs no-border"><div class="col wrapper"><i class="fa fa-circle-o text-info m-r-sm pull-right"></i><h4 class="font-light m-t-none m-b-none text-primary-lt">SDCN Jobs</h4><span class="m-b block text-sm text-muted">Jobs report of the last 30 days</span><flot dataset=jobMonthlyStat options=jobMonthlyChartOptions width=100% height=240px></flot></div><div class="col wrapper-lg w-lg bg-light dk r-r hidden"><h4 class="font-thin m-t-none m-b">Reports</h4><div><div><span class="pull-right text-primary">60%</span> <span>Consulting</span></div><progressbar value=60 class="progress-xs m-t-sm bg-white" animate=true type=primary></progressbar><div><span class="pull-right text-info">35%</span> <span>Online tutorials</span></div><progressbar value=35 class="progress-xs m-t-sm bg-white" animate=true type=info></progressbar><div><span class="pull-right text-warning">25%</span> <span>EDU management</span></div><progressbar value=25 class="progress-xs m-t-sm bg-white" animate=true type=warning></progressbar></div><p class=text-muted>Dales nisi nec adipiscing elit. Morbi id neque quam. Aliquam sollicitudin venenatis</p></div></div>\x3c!-- / service --\x3e<div class=row><div class=col-lg-6><div class="panel hbox hbox-auto-xs no-border col-lg-6"><div class=wrapper><h4 class="font-light m-t-none m-b-none text-primary-lt">SDCN Expiring Members</h4><span class="m-b block text-sm text-muted">Members expirations</span><div class="row wrapper b-t b-light"><div class=col-sm-3>Members expiring in:</div><div class="col-sm-9 text-right"><div class=btn-group ng-init="radioModel = \'Male\'"><label class="btn btn-xs btn-white" ng-class="{active: expiring_members.filter()[\'expires_in\'] === \'2\'}" ng-click="expiring_members.filter()[\'expires_in\'] = \'2\'">Day</label><label class="btn btn-xs btn-white" ng-class="{active: expiring_members.filter()[\'expires_in\'] === \'7\'}" ng-click="expiring_members.filter()[\'expires_in\'] = \'7\'">Week</label><label class="btn btn-xs btn-white" ng-class="{active: expiring_members.filter()[\'expires_in\'] === \'30\'}" ng-click="expiring_members.filter()[\'expires_in\'] = \'30\'">Month</label><label class="btn btn-xs btn-white" ng-class="{active: expiring_members.filter()[\'expires_in\'] === \'120\'}" ng-click="expiring_members.filter()[\'expires_in\'] = \'120\'">Quarter</label><label class="btn btn-xs btn-white" ng-class="{active: expiring_members.filter()[\'expires_in\'] === \'365\'}" ng-click="expiring_members.filter()[\'expires_in\'] = \'365\'">Year</label></div></div></div><div class="table-responsive job-list job-list-md"><table class="table table-striped b-t b-light text-left" data-ng-table=expiring_members template-pagination=src/user/layout/elements/tfoot.html><tbody><tr data-ng-repeat="data in $data"><td data-title="\'Member Name\'" data-sortable="\'company_name\'"><a ui-sref="admin.teams.edit({id: data.id})">{{ data.company_name }}</a></td><td data-title="\'Expiring In\'" data-sortable="\'expire_at\'">{{ data.expire_in_days }} days</td></tr></tbody></table></div></div></div></div><div class=col-lg-6><div class="panel hbox hbox-auto-xs no-border col-lg-6"><div class=wrapper><h4 class="font-light m-t-none m-b-none text-primary-lt">SDCN Expiring Insurances</h4><span class="m-b block text-sm text-muted">SDCN Members Expiring Insurances</span><div class="row wrapper b-t b-light"><div class=col-sm-3>Insurances expiring in:</div><div class="col-sm-9 text-right"><div class=btn-group><label class="btn btn-xs btn-white" ng-class="{active: expiring_insurances.filter()[\'expires_in\'] === \'2\'}" ng-click="expiring_insurances.filter()[\'expires_in\'] = \'2\'">Day</label><label class="btn btn-xs btn-white" ng-class="{active: expiring_insurances.filter()[\'expires_in\'] === \'7\'}" ng-click="expiring_insurances.filter()[\'expires_in\'] = \'7\'">Week</label><label class="btn btn-xs btn-white" ng-class="{active: expiring_insurances.filter()[\'expires_in\'] === \'30\'}" ng-click="expiring_insurances.filter()[\'expires_in\'] = \'30\'">Month</label><label class="btn btn-xs btn-white" ng-class="{active: expiring_insurances.filter()[\'expires_in\'] === \'120\'}" ng-click="expiring_insurances.filter()[\'expires_in\'] = \'120\'">Quarter</label><label class="btn btn-xs btn-white" ng-class="{active: expiring_insurances.filter()[\'expires_in\'] === \'365\'}" ng-click="expiring_insurances.filter()[\'expires_in\'] = \'365\'">Year</label></div></div></div><div class="table-responsive job-list job-list-md"><table class="table table-striped b-t b-light text-left" data-ng-table=expiring_insurances template-pagination=src/user/layout/elements/tfoot.html><tbody><tr data-ng-repeat="data in $data"><td data-title="\'Member Name\'" data-sortable="\'teams.company_name\'"><a ui-sref="admin.teams.edit({id: data.id})">{{ data.company_name }}</a></td><td data-title="\'Expiring Documents\'">{{ data.expiring_amount }}</td></tr></tbody></table></div></div></div></div></div>\x3c!--  / row --\x3e</div>\x3c!-- / main --\x3e</div>\x3c!-- / right col --\x3e</div>');
    $templateCache.put("src/admin/doctypes/edit/edit.html", '<form class="form-horizontal form-validation" name=form><div class="panel panel-default"><div class=panel-heading><h3 class=panel-title>{{mode}} Document Type</h3></div><div class=panel-body><div class=form-group><label class="col-sm-3 control-label">Name *</label><div class=col-sm-9><input class=form-control placeholder=Name ng-model=data.name required></div></div><div class=form-group><label class="col-sm-3 control-label">Expiry Required</label><div class=col-sm-9><input type=checkbox data-ng-true-value=1 data-ng-false-value=0 data-ng-model="data.expiry_required"> <i></i></div></div><div class=form-group><label class="col-sm-3 control-label">Amount Required</label><div class=col-sm-9><input type=checkbox data-ng-true-value=1 data-ng-false-value=0 data-ng-model="data.amount_required"> <i></i></div></div></div><footer class="panel-footer text-right"><button type=button class="btn btn-sm btn-default" ng-click=cancel()>Cancel</button> <button type=button class="btn btn-sm btn-primary" ng-click=store() ng-if=isAdd() ng-disabled="form.$invalid || userCreated">Save</button> <button type=button class="btn btn-sm btn-danger" confirm-delete=destroy() ng-if=isEdit()>Delete</button> <button type=button class="btn btn-sm btn-primary" ng-click=update() ng-if=isEdit() ng-disabled=form.$invalid>Save</button></footer></div></form>');
    $templateCache.put("src/admin/doctypes/list.html", '<div class="bg-light lter b-b wrapper-md"><h1 class="m-n font-light h3"><i class=icon-doc></i> Document types</h1></div><div class=wrapper-md data-ui-view><div class="panel panel-default"><div class=panel-heading><h3 class=panel-title>Document types</h3></div><div class="panel-body no-padder"><div class="row wrapper"><div class=col-sm-4><div class="form-group m-b-none"><input class="form-control input-sm" type=search placeholder=Search... ng-model="tableParams.filter()[\'search\']"></div></div><div class="col-sm-8 text-right"><a class="btn btn-secondary btn-sm" data-ui-sref=.add><i class=icon-plus></i> Add</a> <a class="btn btn-success btn-sm" data-ng-click=tableParams.reload()><i class=icon-refresh></i> Refresh</a> <a class="btn btn-warning btn-sm" data-ng-click="tableParams.sorting({name: \'asc\'})">Clear sorting</a> <a class="btn btn-danger btn-sm" data-ng-click=tableParams.filter({})>Clear filter</a> <a class="btn btn-primary btn-sm" ng-mousedown=csv.generate() ng-href="{{ csv.link() }}" download=jobs.csv><i class=icon-arrow-down></i> Export to CSV</a></div></div><div class=table-responsive><table class="table table-striped b-t b-light text-left" data-ng-table=tableParams export-csv=csv template-pagination=src/admin/layout/pagination.html><tbody><tr class="odd gradeX" data-ng-repeat="data in $data"><td data-title="\'#\'" data-sortable="\'id\'">{{data.id}}</td><td data-title="\'Name\'">{{data.name}}</td><td class=text-right width=180><a class="btn btn-primary btn-sm" data-ui-sref=.edit({id:data.id})><i class="fa fa-edit"></i> Edit</a> <a class="btn btn-danger btn-sm" confirm-delete=remove(data)><i class="fa fa-edit"></i> Delete</a></td></tr></tbody></table></div></div></div></div>');
    $templateCache.put("src/admin/feedback/feedback.html", '<div class="bg-light lter b-b wrapper-md"><h1 class="m-n font-light h3"><i class=icon-star></i> Feedbacks</h1></div><div class=wrapper-md data-ui-view><div class="panel panel-default"><div class=panel-heading><h3 class=panel-title>List of feedbacks</h3></div><div class="panel-body no-padder"><div class="row wrapper"><div class="col-sm-12 text-right"><a class="btn btn-success btn-sm" data-ng-click=tableParams.reload()><i class=icon-refresh></i> Refresh</a> <a class="btn btn-warning btn-sm" data-ng-click="tableParams.sorting({name: \'asc\'})"><i class="fa fa-eraser"></i> Clear sorting</a> <a class="btn btn-danger btn-sm" data-ng-click=tableParams.filter({})><i class="fa fa-eraser"></i> Clear filter</a> <a class="btn btn-primary btn-sm" ng-mousedown=csv.generate() ng-href="{{ csv.link() }}" download=jobs.csv><i class=icon-arrow-down></i> Export to CSV</a></div></div><div class=table-responsive><table class="table table-striped b-t b-light text-left" data-ng-table=tableParams export-csv=csv template-pagination=src/admin/layout/pagination.html><tbody><tr class="odd gradeX" data-ng-repeat="data in $data"><td data-title="\'#\'" data-sortable="\'id\'">{{data.id}}</td><td data-title="\'From\'">{{data.sender.team_info.company_name}}</td><td data-title="\'To\'">{{data.owner.team_info.company_name}}</td><td data-title="\'Rating\'"><rating class=rating ng-model=data.rating max=5 state-on="\'glyphicon glyphicon-star text-info\'" state-off="\'glyphicon glyphicon-star-empty text-info\'" readonly></rating></td><td data-title="\'Comment\'">{{data.comment}}</td><td class=text-right width=180><a class="btn btn-danger btn-sm" confirm-delete=delete(data)><i class="fa fa-eraser"></i> Delete</a></td></tr></tbody></table></div></div></div></div>');
    $templateCache.put("src/admin/jobs/bids/edit/edit.html", '<div class=modal-header><h3 class="modal-title pull-left">{{mode}} Bid</h3><div class=pull-right><button class="btn btn-default btn-sm" data-ng-click=$dismiss()>Cancel</button></div><div class=clearfix></div></div><form class="form-horizontal form-validation" name=form><div class=modal-body><div class=form-group data-ng-show=data.bid_date><label class="col-sm-2 control-label font-bold">Bid Date/Time:</label><div class=col-sm-10><p class=form-control-static>{{data.bid_date | date:\'MMM d, y H:mm\'}}</p></div></div><div class=form-group><label class="col-sm-2 control-label font-bold">Details:</label><div class=col-sm-10><textarea class=form-control rows=3 ng-model=data.details></textarea></div></div><div class=form-group data-ng-class="{\n' + "            'has-error': form.amount.$error.number,\n" + "            'has-success': form.amount.$valid,\n" + "            'has-feedback': form.amount.$valid || form.amount.$error.number\n" + '        }"><label class="col-sm-2 control-label font-bold">Amount:</label><div class=col-sm-4><div class=input-group><span class=input-group-addon id=currency>£</span> <input type=number name=amount id=amount class=form-control data-ng-model=data.amount min=0 aria-describedby=currency placeholder=0 required></div><span class="fa fa-check-circle form-control-feedback" aria-hidden=true data-ng-if=form.amount.$valid></span> <span class="fa fa-times-circle form-control-feedback" aria-hidden=true data-ng-if=form.amount.$error.number></span> <span class="label label-danger" data-ng-if=form.amount.$error.number>Numbers Only!</span></div></div><h4 class=page-header>User details:</h4><div class=form-group ng-show=isAdd()><label class="col-sm-2 control-label font-bold">User ID #</label><div class=col-sm-10><input class=form-control placeholder="User ID #" ng-model="data.user_id"></div></div><div class=form-group data-ng-show=user.name_full><label class="col-sm-2 control-label font-bold">Name:</label><div class=col-sm-10><p class=form-control-static>{{ user.name_full }}</p></div></div><div class=form-group data-ng-show=user.team_info.company_name><label class="col-sm-2 control-label font-bold">Company Name:</label><div class=col-sm-10><p class=form-control-static>{{ user.team_info.company_name }}</p></div></div></div><div class="modal-footer text-right"><button type=button class="btn btn-sm btn-danger m-r-none" confirm-delete=destroy() ng-if=isEdit()>Delete</button> <button type=button class="btn btn-sm btn-primary m-r-none" ng-click=store() ng-if=isAdd() ng-disabled=form.$invalid>Save</button> <button type=button class="btn btn-sm btn-primary m-r-none" ng-click=update() ng-if=isEdit() ng-disabled=form.$invalid>Save</button></div></form>');
    $templateCache.put("src/admin/jobs/bids/list.html", '<div data-ui-view><div class="panel panel-default"><div class=panel-heading>List of bids for Job #{{job_id}}</div><div class="pane-body no-padder"><div class="row wrapper"><div class=col-sm-4><div class="form-group m-l-none m-r-none m-b-none"><input class="form-control input-sm" type=search placeholder=Search... ng-model="tableParams.filter()[\'search\']"></div></div><div class="col-sm-8 text-right"><a class="btn btn-secondary btn-sm" data-ui-sref=.add({job_id:job_id})><i class=icon-plus></i> Add</a> <a class="btn btn-success btn-sm" data-ng-click=tableParams.reload()><i class=icon-refresh></i> Refresh</a> <a class="btn btn-warning btn-sm" data-ng-click="tableParams.sorting({bid_date: \'desc\'})"><i class="fa fa-eraser"></i> Clear sorting</a> <a class="btn btn-danger btn-sm" data-ng-click="tableParams.filter({job_id: job_id})"><i class="fa fa-eraser"></i> Clear filter</a></div></div><div class=table-responsive><table class="table table-striped b-t b-light text-left" data-ng-table=tableParams template-pagination=src/admin/layout/pagination.html><tbody><tr class="odd gradeX" data-ng-repeat="data in $data"><td data-title="\'Date\'">{{data.bid_date | date:short}}</td><td data-title="\'Amount\'">{{data.amount | currency:\'£\'}}</td><td data-title="\'Driver\'">{{data.user.name_full}}</td><td data-title="\'Email\'">{{data.user.email}}</td><td data-title="\'Phone\'">{{data.user.phone}}</td><td class=text-right><a class="btn btn-primary btn-sm" data-ui-sref=.edit({bid_id:data.id})><i class="fa fa-edit"></i> Edit</a></td></tr></tbody></table></div></div></div></div>');
    $templateCache.put("src/admin/jobs/edit/edit.html", '<form class="form-horizontal form-validation" name=form><div class="panel panel-default"><div class="panel-heading font-bold"><h3 class=panel-title>{{mode}} Job</h3></div><div class=panel-body><div class=form-group><label class="col-sm-2 control-label">Pickup Point *</label><div class=col-sm-10><input class=form-control placeholder="Pickup point" ng-model=data.pickup_point details=data.pickup_details lng=data.pickup_longitude lat=data.pickup_latitude googleplace required></div></div><div class=form-group ng-if="! data.pickup_asap"><label class="col-sm-2 control-label">Pickup Date/Time</label><div class=col-sm-10><i-dtp ng-model=data.pickup_date icon="calendar"></div></div><div class=form-group ng-if="! data.flexible_pickup"><div class="col-sm-10 col-sm-offset-2"><div class="checkbox checkbox-primary"><label class=pull-left><input class=pull-right type=checkbox ng-true-value=1 ng-false-value=0 ng-model=data.pickup_asap> <i></i> Pickup ASAP</label></div></div></div><div class=form-group ng-if="! data.pickup_asap"><div class="col-sm-10 col-sm-offset-2"><div class="checkbox checkbox-primary"><label><input type=checkbox ng-true-value=1 ng-false-value=0 ng-model=data.flexible_pickup> <i></i> Flexible Pickup</label></div></div></div><div class=form-group ng-if=data.flexible_pickup><label class="col-sm-2 control-label">Pickup Date/Time End</label><div class=col-sm-10><i-dtp ng-model=data.pickup_date_end icon="calendar"></div></div><div class=form-group><label class="col-sm-2 control-label">Destination Point *</label><div class=col-sm-10><input class=form-control placeholder="Final destination" ng-model=data.destination_point details=data.destination_details lng=data.destination_longitude lat=data.destination_latitude googleplace required></div></div><div class=form-group ng-if="! data.destination_asap"><label class="col-sm-2 control-label">Destination Date/Time</label><div class=col-sm-10><i-dtp ng-model=data.destination_date icon="calendar"></div></div><div class=form-group ng-if="! data.flexible_destination"><div class="col-sm-10 col-sm-offset-2"><div class="checkbox checkbox-primary"><label class=pull-left><input class=pull-right type=checkbox ng-true-value=1 ng-false-value=0 ng-model=data.destination_asap> <span><i></i> Deliver ASAP</span></label></div></div></div><div class=form-group ng-if="! data.destination_asap"><div class="col-sm-10 col-sm-offset-2"><div class="checkbox checkbox-primary"><label ng-if="! data.destination_asap"><input type=checkbox ng-true-value=1 ng-false-value=0 ng-model="data.flexible_destination"> Flexible Delivery <i></i></label></div></div></div><div class=form-group ng-if=data.flexible_destination><label class="col-sm-2 control-label">Destination Date/Time End</label><div class=col-sm-10><i-dtp ng-model=data.destination_date_end icon="calendar"></div></div><div class="form-group hidden"><div class="col-lg-offset-2 col-sm-10"><table class="table table-striped b-t b-light"><thead><tr class=headingTr><th align=middle><a href=# ng-click=addToWayPoints()><span class="fa fa-plus"></span></a></th><th align=middle>Way point</th><th align=middle>Stopoff Date</th></tr></thead><tbody><tr ng-repeat="item in data.way_points"><td align=middle><a href=# ng-click=removeFromWayPoints(item)><span class="fa fa-minus"></span></a></td><td align=middle><input class=form-control ng-model="item.way_point"></td><td align=middle><i-dtp ng-model=item.stopoff_date icon="calendar"></td></tr></tbody></table></div></div><div class=form-group><label class="col-sm-2 control-label">Vehicle *</label><div class=col-sm-10><ui-select ng-required=true data-ng-model=data.vehicle_id theme=bootstrap data-search-enabled=false style="width: 100%"><ui-select-match placeholder="Select a vehicle...">{{$select.selected.name}}</ui-select-match><ui-select-choices repeat="value.id as value in vehicles"><div ng-bind-html=value.name></div></ui-select-choices></ui-select></div></div><div class=form-group><label class="col-sm-2 control-label">Details</label><div class=col-sm-10><textarea class=form-control rows=3 ng-model=data.details></textarea></div></div><div class=form-group><label class="col-sm-2 control-label">Expiry Time</label><div class=col-sm-10><i-dtp ng-model=data.expiry_time icon=calendar placeholder="Expiry Time" required></div></div><div class=form-group><div class="col-sm-10 col-sm-offset-2"><div class="checkbox checkbox-primary"><label><input type=checkbox ng-true-value=1 ng-false-value=0 ng-model="data.accept_email"> Accept Email <i></i></label></div></div></div><div class=form-group data-ng-show=data.accept_email><label class="col-sm-2 control-label">Email</label><div class=col-sm-10><input type=email class=form-control placeholder=Email ng-model="data.email"></div></div><div class=form-group><div class="col-sm-10 col-sm-offset-2"><div class="checkbox checkbox-primary"><label><input type=checkbox ng-true-value=1 ng-false-value=0 ng-model="data.accept_phone"> Accept Phone <i></i></label></div></div></div><div class=form-group ng-show=data.accept_phone><label class="col-sm-2 control-label">Phone</label><div class=col-sm-10><input class=form-control placeholder=Phone ng-model="data.phone"></div></div><div class=form-group><label class="col-sm-2 control-label">User ID # *</label><div class=col-sm-10><input ng-model=data.user_id placeholder="Type name or email" typeahead="user as user.name_full for user in getUsers($viewValue) | filter:{name_full:$viewValue}" typeahead-loading=loadingUsers typeahead-template-url=src/user/layout/elements/user-autocomplete.html typeahead-wait-ms=300 typeahead-on-select="setUserId($item, $model, $label)" class=form-control> <span class=form-control-feedback aria-hidden=true data-ng-show=loadingUsers><i class="fa fa-spin fa-circle-o-notch"></i></span></div></div><h4 class="page-header m-t-none m-t-none">Job details</h4><div class=form-group><label class="col-sm-2 control-label">User</label><div class=col-sm-10><p class=form-control-static>{{ data.user_info.name_full }} ({{ data.user_info.email }})</p></div></div><div class=form-group data-ng-if=drivingDistance><label class="col-sm-2 control-label">Distance</label><div class=col-sm-10><p class=form-control-static>{{drivingDistance}} miles</p></div></div><div class=form-group data-ng-if=data.duration><label class="col-sm-2 control-label">Duration</label><div class=col-sm-10><p class=form-control-static>{{data.duration}}</p></div></div><div class=form-group><label class="col-sm-2 control-label">Map</label><div class=col-sm-10><ui-gmap-google-map class=map-md id=map-canvas center=map.center zoom=map.zoom options=mapOptions bounds=map.bounds></ui-gmap-google-map></div></div></div><footer class="panel-footer text-right"><button type=button class="btn btn-sm btn-default" ng-click=cancel()>Cancel</button> <button type=button class="btn btn-sm btn-danger" confirm-delete=destroy() ng-if="type() == \'edit\'">Delete</button> <button type=button class="btn btn-sm btn-primary" ng-click=store()>Save</button></footer></div></form>');
    $templateCache.put("src/admin/jobs/list.html", '<div class="bg-light lter b-b wrapper-md"><h1 class="m-n font-light h3"><i class=icon-layers></i> Jobs</h1></div><div class=wrapper-md data-ui-view><div class="panel panel-default"><div class=panel-heading><h3 class=panel-title>List of jobs</h3></div><div class="panel-body no-padder"><div class="row wrapper"><div class=col-sm-4><div class="form-group m-b-none"><input class="form-control input-sm" type=search placeholder=Search... ng-model="tableParams.filter()[\'search\']"></div></div><div class="col-sm-8 text-right"><a class="btn btn-secondary btn-sm" data-ui-sref=.add><i class=icon-plus></i> Add</a> <a class="btn btn-success btn-sm" data-ng-click=tableParams.reload()><i class=icon-refresh></i> Refresh</a> <a class="btn btn-warning btn-sm" data-ng-click="tableParams.sorting({name: \'asc\'})"><i class="fa fa-eraser"></i> Clear sorting</a> <a class="btn btn-danger btn-sm" data-ng-click=tableParams.filter({})><i class="fa fa-eraser"></i> Clear filter</a> <a class="btn btn-primary btn-sm" ng-mousedown=csv.generate() ng-href="{{ csv.link() }}" download=jobs.csv><i class=icon-arrow-down></i> Export to CSV</a></div></div><div class=table-responsive><table class="table table-striped b-t b-light text-left" data-ng-table=tableParams export-csv=csv template-pagination=src/admin/layout/pagination.html><tbody><tr class="odd gradeX" data-ng-repeat="data in $data"><td data-title="\'#\'" data-sortable="\'id\'">{{data.id}}</td><td class=point data-title="\'From\'"><span ng-if="data.pickup_formatted_address == null || data.pickup_formatted_address == \'\'">{{data.pickup_point}}</span> <span ng-if="data.pickup_formatted_address != null && data.pickup_formatted_address != \'\'">{{data.pickup_formatted_address}}</span></td><td class=point data-title="\'To\'"><span ng-if="data.destination_formatted_address == null || data.destination_formatted_address == \'\'">{{data.destination_point}}</span> <span ng-if="data.destination_formatted_address != null && data.destination_formatted_address != \'\'">{{data.destination_formatted_address}}</span></td><td data-title="\'Requester\'">{{ data.team.company_name }}</td><td data-title="\'Status\'">{{data.status}}</td><td class="text-right table-buttons" width=250><a class="btn btn-primary btn-sm" data-ui-sref=".edit({id:data.id, edit_job: data})"><i class="fa fa-edit"></i> Edit</a> <a class="btn btn-primary btn-sm" data-ui-sref=.bids({id:data.id})><i class="fa fa-list"></i> Bids</a> <a class="btn btn-primary btn-sm" data-ui-sref=".add({id:data.id, repost_job: data})"><i class="fa fa-repeat"></i> Repost</a></td></tr></tbody></table></div></div></div></div>');
    $templateCache.put("src/admin/layout/aside.html", "<div class=aside-wrap>\x3c!-- if you want to use a custom scroll when aside fixed, use the slimScroll\n" + '    <div class="navi-wrap" ui-jq="slimScroll" ui-options="{height:\'100%\', size:\'8px\'}">\n' + '  --\x3e<div class=navi-wrap data-ng-controller=LoginController>\x3c!-- user --\x3e<div class="clearfix hidden-xs text-center hide" id=aside-user><div class="dropdown wrapper" dropdown><a ui-sref={{$app.mode()}}.profile><span class="thumb-lg w-auto-folded avatar m-t-sm"><img data-ng-src={{$auth.user().getAvatar()}} class=img-full alt=...></span></a> <a href class="dropdown-toggle hidden-folded" dropdown-toggle><span class=clear><span class="block m-t-sm"><strong class="font-bold text-lt">{{auth.user().name_full}}</strong> <b class=caret></b></span></span></a>\x3c!-- dropdown --\x3e<ul class="dropdown-menu animated fadeInRight w hidden-folded"><li><a ng-if="$app.mode()==\'user\'" data-ui-sref=user.profile>Profile</a></li><li ng-if="$app.mode()==\'user\'" class=divider></li><li><a ng-click=logout()>Logout</a></li></ul>\x3c!-- / dropdown --\x3e</div><div class="line dk hidden-folded"></div></div>\x3c!-- / user --\x3e\x3c!-- nav --\x3e<nav ui-nav class="navi clearfix" ng-include="\'src/admin/layout/nav.html\'"></nav>\x3c!-- nav --\x3e\x3c!-- aside footer --\x3e<div class="wrapper m-t"></div>\x3c!-- / aside footer --\x3e</div></div>');
    $templateCache.put("src/admin/layout/footer.html", '<div class="app-footer wrapper b-t bg-light"><span class=pull-right><a href data-ui-scroll-to=app class="m-l-sm text-muted"><i class="fa fa-long-arrow-up"></i></a></span> &copy; 2015 Copyright {{$app.name}}.</div>');
    $templateCache.put("src/admin/layout/header.html", '\x3c!-- navbar header --\x3e<div class="navbar-header {{$app.settings.navbarHeaderColor}}"><button class="pull-right visible-xs dk" ui-toggle-class=show data-target=.navbar-collapse><i class="glyphicon glyphicon-cog"></i></button> <button class="pull-right visible-xs" ui-toggle-class=off-screen data-target=.app-aside ui-scroll-to=app><i class="glyphicon glyphicon-align-justify"></i></button>\x3c!-- brand --\x3e <a href="#/" class="navbar-brand text-lt"><img src=/assets/img/sdcn-logo.png></a>\x3c!-- / brand --\x3e</div>\x3c!-- / navbar header --\x3e\x3c!-- navbar collapse --\x3e<div class="collapse pos-rlt navbar-collapse box-shadow {{$app.settings.navbarCollapseColor}}">\x3c!-- buttons --\x3e<div class="nav navbar-nav hidden-xs"><a href class="btn no-shadow navbar-btn" ng-click="$app.settings.asideFolded = !$app.settings.asideFolded"><i class="fa {{$app.settings.asideFolded ? \'fa-indent\' : \'fa-dedent\'}} fa-fw"></i></a> <a href class="btn no-shadow navbar-btn" ui-toggle-class=show target=#aside-user><i class="icon-user fa-fw"></i></a></div>\x3c!-- / buttons --\x3e\x3c!-- link and dropdown --\x3e<ul class="nav navbar-nav hidden-sm"><li class=dropdown dropdown><a href class=dropdown-toggle dropdown-toggle><i class="fa fa-fw fa-plus visible-xs-inline-block"></i> <span>New</span> <span class=caret></span></a><ul class=dropdown-menu role=menu data-menus=menuActions data-tag=action><li data-ng-repeat="menu in menuActions | orderBy: \'-priority\'"><a data-ui-sref={{menu.state.name}}><i class={{menu.class}}></i> {{menu.name}}</a></li></ul></li></ul>\x3c!-- / link and dropdown --\x3e\x3c!-- nabar right --\x3e<ul class="nav navbar-nav navbar-right"><li class=dropdown dropdown data-ng-controller=LoginController><a href class="dropdown-toggle clear" dropdown-toggle><span class="thumb-sm avatar pull-right m-t-n-sm m-b-n-sm m-l-sm"><img data-ng-src={{$auth.user().getAvatar()}} alt=...> <i class="on md b-white bottom"></i></span> <span class="hidden-sm hidden-md">{{auth.user().name_full}}</span> <b class=caret></b></a>\x3c!-- dropdown --\x3e<ul class="dropdown-menu animated fadeInRight w"><li><a ng-if="$app.mode()==\'user\'" data-ui-sref=user.profile>Profile</a></li><li ng-if="$app.mode()==\'user\'" class=divider></li><li><a ng-click=logout()>Logout</a></li></ul>\x3c!-- / dropdown --\x3e</li></ul>\x3c!-- / navbar right --\x3e</div>\x3c!-- / navbar collapse --\x3e');
    $templateCache.put("src/admin/layout/nav.html", '\x3c!-- list --\x3e<ul class=nav data-menus=menuItems data-type=tree data-tag=admin><li class="hidden-folded padder m-t m-b-sm text-muted text-xs"><span>Admin Area</span></li><li data-ng-repeat="menu in menuItems | orderBy: \'-priority\'" data-ui-sref-active=active><a href class=auto data-ng-if=menu.hasChild><span class="pull-right text-muted"><i class="fa fa-fw fa-angle-right text"></i> <i class="fa fa-fw fa-angle-down text-active"></i></span> <i class="{{menu.class}} icon text-primary-dker"></i> <span class=font-bold>{{ menu.name }}</span></a><ul class="nav nav-sub dk" data-ng-if=menu.hasChild><li data-ng-repeat="child in menu.children | orderBy: \'-priority\'" data-ui-sref-active-eq=active><a data-ui-sref="{{ child.state.name }}"><span>{{ child.name }}</span></a></li></ul><a data-ui-sref={{menu.state.name}} data-ng-if=!menu.hasChild><i class="{{menu.class}} icon text-info-dker"></i> <span class=font-bold>{{menu.name}}</span></a></li><li class="line dk"></li><li class="hidden-folded padder m-t m-b-sm text-muted text-xs"><span>User Area</span></li><li><a data-ui-sref=user.dashboard><i class="icon-home icon text-info-dker"></i> <span class=font-bold>User Dashboard</span></a></li></ul>\x3c!-- / list --\x3e');
    $templateCache.put("src/admin/layout/pagination.html", '<footer class=panel-footer><div class=row><div class="col-sm-4 text-left text-center-xs"><div class="btn-group btn-group-sm"><button type=button ng-class="{\'active\':params.count() == 10}" ng-click=params.count(10) class="btn btn-default">10</button> <button type=button ng-class="{\'active\':params.count() == 25}" ng-click=params.count(25) class="btn btn-default">25</button> <button type=button ng-class="{\'active\':params.count() == 50}" ng-click=params.count(50) class="btn btn-default">50</button> <button type=button ng-class="{\'active\':params.count() == 100}" ng-click=params.count(100) class="btn btn-default">100</button></div></div><div class="col-sm-4 text-center"><small class="text-muted inline m-t-sm m-b-sm">Showing {{ ((params.$params.page * params.count()) - params.count() + 1) }}-{{ (params.$params.page * params.count()) > params.total() ? params.total() : (params.$params.page * params.count()) }} of {{ params.total() }} results</small></div><div class="col-sm-4 text-right text-center-xs"><pagination total-items=params.total() ng-model=params.$params.page items-per-page=params.count() max-size=4 class="pagination-sm pagination-default m-t-xs m-b-none" boundary-links=false previous-text=&lsaquo; next-text=&rsaquo; rotate=false></pagination></div></div></footer>');
    $templateCache.put("src/admin/layout/settings.html", '\x3c!-- settings --\x3e <button class="btn btn-default no-shadow pos-abt" ui-toggle-class=active target=.settings><i class="fa fa-spin fa-gear"></i></button><div class=panel-heading>Settings</div><div class=panel-body><div class=m-b-sm><label class="i-switch bg-info pull-right"><input type=checkbox ng-model=$app.settings.headerFixed> <i></i></label>Fixed header</div><div class=m-b-sm><label class="i-switch bg-info pull-right"><input type=checkbox ng-model=$app.settings.asideFixed> <i></i></label>Fixed aside</div><div class=m-b-sm><label class="i-switch bg-info pull-right"><input type=checkbox ng-model=$app.settings.asideFolded> <i></i></label>Folded aside</div><div class=m-b-sm><label class="i-switch bg-info pull-right"><input type=checkbox ng-model=$app.settings.asideDock> <i></i></label>Dock aside</div><div><label class="i-switch bg-info pull-right"><input type=checkbox ng-model=$app.settings.container> <i></i></label>Boxed layout</div></div><div class="wrapper b-t b-light bg-light lter r-b"><div class="row row-sm"><div class=col-xs-6><label class="i-checks block m-b" ng-click="\n' + "          $app.settings.navbarHeaderColor='bg-black';\n" + "          $app.settings.navbarCollapseColor='bg-white-only';\n" + "          $app.settings.asideColor='bg-black';\n" + '         "><input type=radio name=a ng-model=$app.settings.themeID value=1> <span class="block bg-light clearfix pos-rlt"><span class="active pos-abt w-full h-full bg-black-opacity text-center"><i class="glyphicon glyphicon-ok text-white m-t-xs"></i></span> <b class="bg-black header"></b> <b class="bg-white header"></b> <b class=bg-black></b></span></label><label class="i-checks block m-b" ng-click="\n' + "          $app.settings.navbarHeaderColor='bg-dark';\n" + "          $app.settings.navbarCollapseColor='bg-white-only';\n" + "          $app.settings.asideColor='bg-dark';\n" + '         "><input type=radio name=a ng-model=$app.settings.themeID value=13> <span class="block bg-light clearfix pos-rlt"><span class="active pos-abt w-full h-full bg-black-opacity text-center"><i class="glyphicon glyphicon-ok text-white m-t-xs"></i></span> <b class="bg-dark header"></b> <b class="bg-white header"></b> <b class=bg-dark></b></span></label><label class="i-checks block m-b" ng-click="\n' + "          $app.settings.navbarHeaderColor='bg-white-only';\n" + "          $app.settings.navbarCollapseColor='bg-white-only';\n" + "          $app.settings.asideColor='bg-black';\n" + '         "><input type=radio ng-model=$app.settings.themeID value=2> <span class="block bg-light clearfix pos-rlt"><span class="active pos-abt w-full h-full bg-black-opacity text-center"><i class="glyphicon glyphicon-ok text-white m-t-xs"></i></span> <b class="bg-white header"></b> <b class="bg-white header"></b> <b class=bg-black></b></span></label><label class="i-checks block m-b" ng-click="\n' + "          $app.settings.navbarHeaderColor='bg-primary';\n" + "          $app.settings.navbarCollapseColor='bg-white-only';\n" + "          $app.settings.asideColor='bg-dark';\n" + '         "><input type=radio ng-model=$app.settings.themeID value=3> <span class="block bg-light clearfix pos-rlt"><span class="active pos-abt w-full h-full bg-black-opacity text-center"><i class="glyphicon glyphicon-ok text-white m-t-xs"></i></span> <b class="bg-primary header"></b> <b class="bg-white header"></b> <b class=bg-dark></b></span></label><label class="i-checks block m-b" ng-click="\n' + "          $app.settings.navbarHeaderColor='bg-info';\n" + "          $app.settings.navbarCollapseColor='bg-white-only';\n" + "          $app.settings.asideColor='bg-black';\n" + '         "><input type=radio ng-model=$app.settings.themeID value=4> <span class="block bg-light clearfix pos-rlt"><span class="active pos-abt w-full h-full bg-black-opacity text-center"><i class="glyphicon glyphicon-ok text-white m-t-xs"></i></span> <b class="bg-info header"></b> <b class="bg-white header"></b> <b class=bg-black></b></span></label><label class="i-checks block m-b" ng-click="\n' + "          $app.settings.navbarHeaderColor='bg-success';\n" + "          $app.settings.navbarCollapseColor='bg-white-only';\n" + "          $app.settings.asideColor='bg-dark';\n" + '         "><input type=radio ng-model=$app.settings.themeID value=5> <span class="block bg-light clearfix pos-rlt"><span class="active pos-abt w-full h-full bg-black-opacity text-center"><i class="glyphicon glyphicon-ok text-white m-t-xs"></i></span> <b class="bg-success header"></b> <b class="bg-white header"></b> <b class=bg-dark></b></span></label><label class="i-checks block" ng-click="\n' + "          $app.settings.navbarHeaderColor='bg-danger';\n" + "          $app.settings.navbarCollapseColor='bg-white-only';\n" + "          $app.settings.asideColor='bg-dark';\n" + '         "><input type=radio ng-model=$app.settings.themeID value=6> <span class="block bg-light clearfix pos-rlt"><span class="active pos-abt w-full h-full bg-black-opacity text-center"><i class="glyphicon glyphicon-ok text-white m-t-xs"></i></span> <b class="bg-danger header"></b> <b class="bg-white header"></b> <b class=bg-dark></b></span></label></div><div class=col-xs-6><label class="i-checks block m-b" ng-click="\n' + "          $app.settings.navbarHeaderColor='bg-black';\n" + "          $app.settings.navbarCollapseColor='bg-black';\n" + "          $app.settings.asideColor='bg-white b-r';\n" + '         "><input type=radio ng-model=$app.settings.themeID value=7> <span class="block bg-light clearfix pos-rlt"><span class="active pos-abt w-full h-full bg-black-opacity text-center"><i class="glyphicon glyphicon-ok text-white m-t-xs"></i></span> <b class="bg-black header"></b> <b class="bg-black header"></b> <b class=bg-white></b></span></label><label class="i-checks block m-b" ng-click="\n' + "          $app.settings.navbarHeaderColor='bg-dark';\n" + "          $app.settings.navbarCollapseColor='bg-dark';\n" + "          $app.settings.asideColor='bg-light';\n" + '         "><input type=radio name=a ng-model=$app.settings.themeID value=14> <span class="block bg-light clearfix pos-rlt"><span class="active pos-abt w-full h-full bg-black-opacity text-center"><i class="glyphicon glyphicon-ok text-white m-t-xs"></i></span> <b class="bg-dark header"></b> <b class="bg-dark header"></b> <b class=bg-light></b></span></label><label class="i-checks block m-b" ng-click="\n' + "          $app.settings.navbarHeaderColor='bg-info dker';\n" + "          $app.settings.navbarCollapseColor='bg-info dker';\n" + "          $app.settings.asideColor='bg-light dker b-r';\n" + '         "><input type=radio ng-model=$app.settings.themeID value=8> <span class="block bg-light clearfix pos-rlt"><span class="active pos-abt w-full h-full bg-black-opacity text-center"><i class="glyphicon glyphicon-ok text-white m-t-xs"></i></span> <b class="bg-info dker header"></b> <b class="bg-info dker header"></b> <b class="bg-light dker"></b></span></label><label class="i-checks block m-b" ng-click="\n' + "          $app.settings.navbarHeaderColor='bg-primary';\n" + "          $app.settings.navbarCollapseColor='bg-primary';\n" + "          $app.settings.asideColor='bg-dark';\n" + '         "><input type=radio ng-model=$app.settings.themeID value=9> <span class="block bg-light clearfix pos-rlt"><span class="active pos-abt w-full h-full bg-black-opacity text-center"><i class="glyphicon glyphicon-ok text-white m-t-xs"></i></span> <b class="bg-primary header"></b> <b class="bg-primary header"></b> <b class=bg-dark></b></span></label><label class="i-checks block m-b" ng-click="\n' + "          $app.settings.navbarHeaderColor='bg-info dker';\n" + "          $app.settings.navbarCollapseColor='bg-info dk';\n" + "          $app.settings.asideColor='bg-black';\n" + '         "><input type=radio ng-model=$app.settings.themeID value=10> <span class="block bg-light clearfix pos-rlt"><span class="active pos-abt w-full h-full bg-black-opacity text-center"><i class="glyphicon glyphicon-ok text-white m-t-xs"></i></span> <b class="bg-info dker header"></b> <b class="bg-info dk header"></b> <b class=bg-black></b></span></label><label class="i-checks block m-b" ng-click="\n' + "          $app.settings.navbarHeaderColor='bg-success';\n" + "          $app.settings.navbarCollapseColor='bg-success';\n" + "          $app.settings.asideColor='bg-dark';\n" + '          "><input type=radio ng-model=$app.settings.themeID value=11> <span class="block bg-light clearfix pos-rlt"><span class="active pos-abt w-full h-full bg-black-opacity text-center"><i class="glyphicon glyphicon-ok text-white m-t-xs"></i></span> <b class="bg-success header"></b> <b class="bg-success header"></b> <b class=bg-dark></b></span></label><label class="i-checks block" ng-click="\n' + "          $app.settings.navbarHeaderColor='bg-danger dker bg-gd';\n" + "          $app.settings.navbarCollapseColor='bg-danger dker bg-gd';\n" + "          $app.settings.asideColor='bg-dark';\n" + '         "><input type=radio ng-model=$app.settings.themeID value=12> <span class="block bg-light clearfix pos-rlt"><span class="active pos-abt w-full h-full bg-black-opacity text-center"><i class="glyphicon glyphicon-ok text-white m-t-xs"></i></span> <b class="bg-danger dker header"></b> <b class="bg-danger dker header"></b> <b class=bg-dark></b></span></label></div></div></div>\x3c!-- /settings --\x3e');
    $templateCache.put("src/admin/partners/benefits/edit/edit.html", '<div class=modal-header><h3 class="modal-title pull-left">Edit Benefit</h3><div class=pull-right><button class="btn btn-default btn-sm" ng-click=$dismiss()>Cancel</button></div><div class=clearfix></div></div><div class=modal-body><form class=form-horizontal><h4 class=page-header>Benefit Details</h4><div class=form-group><label class="col-sm-2 control-label font-bold">Benefit Description:</label><div class=col-sm-10><textarea class=form-control ng-model=benefit.description></textarea></div></div><div class=form-group><label class="col-sm-2 control-label font-bold">Url:</label><div class=col-sm-10><input class=form-control data-ng-model=benefit.url placeholder="http://" value="http://"></div></div><div class=form-group><div class="col-sm-offset-2 col-sm-10"><div class="checkbox checkbox-success"><label><input type=checkbox ng-true-value=1 ng-false-value=0 data-ng-model="benefit.active"> Active <i></i></label></div></div></div></form></div><div class="modal-footer text-right"><button type=button class="btn btn-lg btn-success" ng-click=store() ng-disabled=formSubmitted><span ng-if=!formSubmitted>Save</span> <span ng-if=formSubmitted><i class="fa fa-spin fa-circle-o-notch"></i> Save</span></button></div>');
    $templateCache.put("src/admin/partners/edit/edit.html", '<div class="panel panel-default"><div class=panel-heading><h3 class=panel-title>{{mode}} Partner</h3></div><tabset><tab heading="Partner Details"><form class="form-horizontal form-validation" name=form><div class=wrapper><h4 class=page-header>Partner Details:</h4><div class=form-group><label class="col-sm-2 control-label">Company Name <em>*</em></label><div class=col-sm-10><input class=form-control placeholder="Company Name" ng-model=data.name required></div></div><div class=form-group><label class="col-sm-2 control-label">Company Description <em>*</em></label><div class=col-sm-10><textarea type=text class=form-control placeholder="Company Description" ng-model=data.description required>\n' + '                            </textarea></div></div><div class=form-group data-ng-if=isEdit()><div class="col-sm-9 col-sm-offset-2"><img ng-src="{{ data.logo }}" ng-if=data.logo style="max-width: 250px"><br><a class="btn btn-secondary" href data-ui-sref=.logo title="Add Profile Picture" role=button data-ng-show="! data.logo">Add Company Logo</a> <a class="btn btn-secondary" href data-ui-sref=.logo title="Edit Profile Picture" role=button data-ng-show=data.logo>Edit Company Logo</a></div></div></div><footer class="panel-footer text-right"><button type=button class="btn btn-sm btn-default" ng-click=cancel()>Cancel</button> <button type=button class="btn btn-sm btn-primary" ng-click=store() ng-if=isAdd() ng-disabled="form.$invalid || userCreated">Save</button>\x3c!--<button type="button" class="btn btn-sm btn-danger" confirm-delete="destroy()" ng-if="isEdit()">--\x3e\x3c!--Delete--\x3e\x3c!--</button>--\x3e <button type=button class="btn btn-sm btn-primary" ng-click=update() ng-if=isEdit() ng-disabled=form.$invalid>Save</button></footer></form></tab><tab heading=Benefits ng-if=isEdit()><div class=wrapper><h4 class=page-header>Benefits: <a href class="btn btn-secondary btn-xs pull-right" data-ui-sref=.benefits.edit><span><i class="fa fa-plus"></i> Add Benefit</span></a></h4><div class=table-responsive><table class="table table-striped text-left" data-ng-table=benefits><tbody><tr ng-repeat="benefit in $data"><td data-title="\'Description\'">{{ benefit.description }}</td><td data-title="\'Url\'">{{ benefit.url }}</td><td data-title="\'Actions\'" class=text-right><a class="btn btn-primary btn-sm" data-ui-sref=".benefits.edit({partner_id: partner_id, benefit_id:benefit.id})"><i class="fa fa-edit"></i> Edit</a>\x3c!-- <a class="btn btn-sm" data-ng-click="deactivate(benefit)" data-ng-class="{\'btn-danger\': !data.deactivated_at, \'btn-success\': data.deactivated_at}"><i class="fa fa-trash-o"></i> {{data.deactivated_at ? \'Activate\' : \'Deactivate\'}}</a> --\x3e</td></tr></tbody></table></div></div>\x3c!-- /wrapper  --\x3e</tab></tabset></div>');
    $templateCache.put("src/admin/partners/edit/logo/logo.html", '<div class=modal-header><h3 class="modal-title pull-left">Upload Profile Picture</h3><div class=pull-right><button class="btn btn-default btn-sm" data-ng-click=$dismiss()>Cancel</button></div><div class=clearfix></div></div><form class="form form-horizontal" role=form name=form><div class=modal-body><div class=form-group data-ng-show=!noFile><label class="col-sm-2 control-label font-bold">Select An Image:</label><div class=col-sm-10><span class="btn btn-secondary btn-file"><span>Select image from your computer</span> <input type=file class=form-control id=logo-upload name=logo-upload data-ng-model=upload nv-file-select="" uploader=uploader valid-file required></span></div></div><div class=form-group data-ng-show="status == \'loaded\'"><label class="col-sm-2 control-label font-bold">Your Logo:</label><div class=col-sm-10><img ng-src="{{ myImage }}" style="max-width: 100%; max-height: 100%"></div></div><div class=form-group data-ng-show=progress><label class="col-sm-2 control-label font-bold">Progress:</label><div class=col-sm-10><p class=form-control-static><progressbar value=progress class="progress-xs m-t" type=info ng-show=progress></progressbar></p></div></div></div><div class="modal-footer text-right"><button type=button class="btn btn-lg btn-primary" ng-click=store() ng-disabled=form.$invalid>Save</button></div></form>');
    $templateCache.put("src/admin/partners/partners.html", '<div class="bg-light lter b-b wrapper-md"><h1 class="m-n font-light h3"><i class=icon-layers></i> Partners</h1></div><div class=wrapper-md data-ui-view><div class="panel panel-default"><div class=panel-heading><h3 class=panel-title>SDCN Partners</h3></div><div class="panel-body no-padder"><div class="row wrapper"><div class=col-sm-4><div class="form-group m-b-none"><input class="form-control input-sm" type=search placeholder=Search... ng-model="tableParams.filter()[\'search\']"></div></div><div class="col-sm-8 text-right"><a class="btn btn-secondary btn-sm" data-ui-sref=.add><i class=icon-plus></i> Add</a> <a class="btn btn-success btn-sm" data-ng-click=tableParams.reload()><i class=icon-refresh></i> Refresh</a> <a class="btn btn-warning btn-sm" data-ng-click="tableParams.sorting({name: \'asc\'})"><i class="fa fa-eraser"></i> Clear sorting</a> <a class="btn btn-danger btn-sm" data-ng-click=tableParams.filter({})><i class="fa fa-eraser"></i> Clear filter</a></div></div><div class=table-responsive><table class="table table-striped b-t b-light text-left" data-ng-table=tableParams template-pagination=src/admin/layout/pagination.html><tr ng-repeat="data in $data"><td data-title="\'Partner\'" data-sortable="\'name\'">{{ data.name }}</td><td data-title="\'Date Added\'" data-sortable="\'created_at\'">{{ data.created_at }}</td>\x3c!--                         <td data-title="\'Perks Active\'">\n' + '                            <label class="i-switch">\n' + '                                <input type="checkbox" data-ng-model="data.can_bid" data-ng-change="toggleBidding(data)">\n' + "                                <i></i>\n" + "                            </label>\n" + "                        </td>\n" + ' --\x3e<td data-title="\'Active Benefits\'" data-sortable="\'benefits_count\'">{{ data.benefits_count }}</td><td data-title="\'Actions\'" class=text-right><a class="btn btn-primary btn-sm" data-ui-sref=".edit({ partner_id:data.id })"><i class="fa fa-edit"></i> Edit</a></td></tr></table></div></div></div></div>');
    $templateCache.put("src/admin/settings/email/email.html", '<div class="bg-light lter b-b wrapper-md"><h1 class="m-n font-light h3"><i class=icon-envelope></i> Email settings</h1></div><div class=wrapper-md><form class="form-horizontal form-validation" name=form><div class="panel panel-default"><div class="panel-heading font-bold"><h3 class=panel-title>Email settings</h3></div><div class=panel-body><div class=form-group><label class="col-sm-2 control-label">From Name</label><div class=col-sm-10><input class=form-control ng-model="data.mail_from_name"></div></div><div class=form-group><label class="col-sm-2 control-label">From Email</label><div class=col-sm-10><input class=form-control ng-model="data.mail_from_email"></div></div><div class=form-group><label class="col-sm-2 control-label">Mail Driver</label><div class=col-sm-10><input class=form-control ng-model="data.mail_driver"></div></div><div class=form-group><label class="col-sm-2 control-label">SMTP Host</label><div class=col-sm-10><input class=form-control ng-model="data.mail_smtp_host"></div></div><div class=form-group><label class="col-sm-2 control-label">SMTP Port</label><div class=col-sm-10><input class=form-control ng-model="data.mail_smtp_port"></div></div><div class=form-group><label class="col-sm-2 control-label">SMTP Encryption</label><div class=col-sm-10><select class=form-control ng-model=data.mail_smtp_encryption><option value="">None</option><option value=tls>TLS</option><option value=ssl>SSL (deprecated)</option></select></div></div><div class=form-group><label class="col-sm-2 control-label">SMTP Username</label><div class=col-sm-10><input class=form-control ng-model="data.mail_smtp_username"></div></div><div class=form-group><label class="col-sm-2 control-label">SMTP Password</label><div class=col-sm-10><input type=password class=form-control ng-model="data.mail_smtp_password"></div></div><div class=form-group><div class="col-sm-10 col-sm-offset-2"><div class="checkbox checkbox-primary"><label><input type=checkbox ng-true-value="\'1\'" ng-false-value="\'0\'" ng-model="data.mail_smtp_pretend"> Pretend email <i></i></label></div></div></div><div class=form-group><label class="col-sm-2 control-label">Admin email</label><div class=col-sm-10><input type=email class=form-control ng-model="data.mail_admin_email"></div></div></div><footer class="panel-footer text-right"><button type=button class="btn btn-sm btn-default" ng-click=cancel()>Cancel</button> <button type=button class="btn btn-sm btn-primary" ng-click=store()>Save</button></footer></div></form></div>');
    $templateCache.put("src/admin/teams/edit/document/document.html", '<div class=modal-header><h3 class="modal-title pull-left">Upload Document</h3><div class=pull-right><button class="btn btn-default btn-sm" data-ng-click=$dismiss()>Cancel</button></div><div class=clearfix></div></div><form class="form form-horizontal" role=form name=form><div class=modal-body><div class=form-group><label class="col-sm-2 control-label font-bold">Type:</label><div class=col-sm-10><ui-select ng-model=data.selected_type on-select="data.type_id = data.selected_type.id" theme=bootstrap data-search-enabled=false style=width:100%><ui-select-match allow-clear=true placeholder="Select the document type">{{$select.selected.name}}</ui-select-match><ui-select-choices repeat="value as value in doctypes"><div ng-bind-html=value.name></div></ui-select-choices></ui-select></div></div><div class=form-group ng-if=data.selected_type.expiry_required><label class="col-sm-2 control-label font-bold">Expiry Date:</label><div class=col-sm-10><i-dtp ng-model=data.expiry icon=calendar placeholder="Expiration Date" min-date=minDate ng-required="data.selected_type.expiry_required"></div></div><div class=form-group ng-if=data.selected_type.amount_required><label class="col-sm-2 control-label font-bold">Amount Insured:</label><div class=col-sm-10><div class=input-group><span class=input-group-btn><button type=button class="btn btn-default" ng-click=clickToggle($event)><i class="fa fa-gbp"></i></button></span> <input ng-model=data.insured_amount class=form-control ng-required=data.selected_type.amount_required placeholder="Insured amount in pounds, eg. 10000"></div></div></div><div class=form-group><label for="" class="col-sm-2 control-label font-bold">User:</label><div class=col-sm-10><ui-select ng-model=data.user_id theme=bootstrap data-search-enabled=false style=width:100%><ui-select-match allow-clear=true placeholder="Select user to assign the document to.">{{$select.selected.name_full}}</ui-select-match><ui-select-choices repeat="value.id as value in team.members"><div ng-bind-html=value.name_full></div></ui-select-choices></ui-select></div></div><div class=form-group data-ng-show="mode != \'edit\'"><label class="col-sm-2 control-label font-bold">Select Document:</label><div class=col-sm-10><div class=form-control-static><div class="btn btn-secondary btn-file"><span>Select file from your computer</span> <input type=file class=form-control id=doc-upload name=doc-upload data-ng-model=upload nv-file-select="" uploader=uploader valid-file ng-required="mode == \'add\'"></div></div></div></div><div class=form-group data-ng-show=file><label class="col-sm-2 control-label font-bold">Selected file:</label><div class=col-sm-10><p class=form-control-static ng-if="mode == \'add\'">{{file.name}} - {{file.size | bytes}}</p><p class=form-control-static ng-if="mode == \'edit\'">{{file.name}}</p></div></div><div class=form-group data-ng-show=progress><label class="col-sm-2 control-label font-bold">Progress:</label><div class=col-sm-10><p class=form-control-static><progressbar value=progress class=progress-xs type=info ng-show=progress></progressbar></p></div></div></div><div class="modal-footer text-right"><button type=button class="btn btn-lg btn-secondary" ng-click=store() ng-disabled="form.$invalid || formSubmitted" ng-if="mode ==\'add\'"><span data-ng-show=!formSubmitted>Upload Document</span> <span data-ng-show=formSubmitted><i class="fa fa-spin fa-circle-o-notch"></i> Upload Document</span></button> <button type=button class="btn btn-lg btn-secondary" ng-click=store() ng-disabled=formSubmitted ng-if="mode ==\'edit\'"><span data-ng-show=!formSubmitted>Update Document</span> <span data-ng-show=formSubmitted><i class="fa fa-spin fa-circle-o-notch"></i> Update Document</span></button></div></form>');
    $templateCache.put("src/admin/teams/edit/edit.html", '<div class="panel panel-default"><div class=panel-heading><h3 class=panel-title>{{mode}} Company</h3></div><tabset><tab heading="Company Details"><form class="form-horizontal form-validation" name=form><div class=wrapper><h4 class=page-header>Company Details:</h4><div class=form-group><label class="col-sm-2 control-label">Company Name <em>*</em></label><div class=col-sm-10><input class=form-control placeholder="Company Name" ng-model=data.company_name required></div></div><div class=form-group><label class="col-sm-2 control-label">Company Number <em>*</em></label><div class=col-sm-10><input class=form-control placeholder="Company Number" ng-model=data.company_number required></div></div><div class=form-group><label class="col-sm-2 control-label">VAT Number</label><div class=col-sm-10><input class=form-control placeholder="VAT Number" ng-model="data.vat_number"></div></div><div class=form-group><label class="col-sm-2 control-label">Address Line 1 <em>*</em></label><div class=col-sm-10><input class=form-control placeholder="Address Line 1" ng-model=data.address_line_1 required></div></div><div class=form-group><label class="col-sm-2 control-label">Address Line 2</label><div class=col-sm-10><input class=form-control placeholder="Address Line 2" ng-model="data.address_line_2"></div></div><div class=form-group><label class="col-sm-2 control-label">Town <em>*</em></label><div class=col-sm-10><input class=form-control placeholder=Town ng-model=data.town required></div></div><div class=form-group><label class="col-sm-2 control-label">County <em>*</em></label><div class=col-sm-10><input class=form-control placeholder=County ng-model=data.county required></div></div><div class=form-group><label class="col-sm-2 control-label">Postal Code <em>*</em></label><div class=col-sm-10><input class=form-control placeholder="Postal Code" ng-model=data.postal_code required></div></div><div class=form-group><label class="col-sm-2 control-label">Lat/Lng <em>*</em></label><div class=col-sm-5><input class=form-control ng-model=data.lat></div><div class=col-sm-5><input class=form-control ng-model=data.lng></div></div></div><div class=wrapper><h4 class="page-header m-t-none m-t-none">Billing Details:</h4><div class=form-group><label class="col-sm-2 control-label">Subscription amount <em>*</em></label><div class=col-sm-10><div class=input-group><span class=input-group-addon id=currency>£</span> <input class=form-control placeholder="Subscription amount" ng-model=data.subscription_amount required></div></div></div><div class=form-group><label class="col-sm-2 control-label">Payment Method</label><div class=col-sm-10><select data-ng-model=data.payment_method class=form-control><option value="">Choose a payment method</option><option value=bacs>BACS</option><option value=credit_card>Credit Card</option><option value=direct_debit>Direct Debit</option></select></div></div><div class=form-group><label class="col-sm-2 control-label">Billing frequency</label><div class=col-sm-10><select data-ng-model=data.billing_frequency class=form-control ng-change=updateExpiry()><option value="">Choose the frequency</option><option value=30>Monthly</option><option value=90>Quarterly</option><option value=180>Biannually</option><option value=365>Annually</option></select></div></div><div class=form-group><label class="col-sm-2 control-label">Expire at <em>*</em></label><div class=col-sm-10><i-dtp ng-model=data.expire_at icon=calendar placeholder="Expire at"></div></div></div><div class=wrapper><h4 class="page-header m-t-none m-t-none">Invoice Details:</h4><div class=form-group><div class="col-sm-10 col-sm-offset-2"><div class="checkbox checkbox-primary"><label><input type=checkbox data-ng-true-value=1 data-ng-false-value=0 data-ng-model="data.use_company_address"> Use company address <i></i></label></div></div></div><div class=form-group data-ng-show=!data.use_company_address><label class="col-sm-2 control-label">Address Line 1 <em>*</em></label><div class=col-sm-10><input class=form-control placeholder="Address Line 1" ng-model=data.invoice_address_line_1 data-ng-required="!data.use_company_address"></div></div><div class=form-group data-ng-show=!data.use_company_address><label class="col-sm-2 control-label">Address Line 2</label><div class=col-sm-10><input class=form-control placeholder="Address Line 2" ng-model="data.invoice_address_line_2"></div></div><div class=form-group data-ng-show=!data.use_company_address><label class="col-sm-2 control-label">Town <em>*</em></label><div class=col-sm-10><input class=form-control placeholder=Town ng-model=data.invoice_town data-ng-required="!data.use_company_address"></div></div><div class=form-group data-ng-show=!data.use_company_address><label class="col-sm-2 control-label">County <em>*</em></label><div class=col-sm-10><input class=form-control placeholder=County ng-model=data.invoice_county data-ng-required="!data.use_company_address"></div></div><div class=form-group data-ng-show=!data.use_company_address><label class="col-sm-2 control-label">Postal Code <em>*</em></label><div class=col-sm-10><input class=form-control placeholder="Postal Code" ng-model=data.invoice_postal_code data-ng-required="!data.use_company_address"></div></div><div class=form-group><label class="col-sm-2 control-label">Invoice footer text</label><div class=col-sm-10><textarea class=form-control ng-model=data.invoice_footer_text placeholder="Invoice footer text"></textarea></div></div><div class=form-group data-ng-if=isEdit() data-ng-show=!data.external_invoice_recipient><label class="col-sm-2 control-label">Invoice recipient</label><div class=col-sm-10><select class=form-control ng-model=team.invoice_recipient_id ng-options="recipient.id as recipient.name_full for recipient in team.members"><option value="">Select a team member</option></select></div></div><div class=form-group data-ng-show=isEdit()><div class="col-sm-10 col-sm-offset-2"><div class="checkbox checkbox-primary"><label><input type=checkbox ng-true-value=1 ng-false-value=0 ng-model="data.external_invoice_recipient"> External invoice recipient <i></i></label></div></div></div><div class=form-group data-ng-if=isEdit() data-ng-show=data.external_invoice_recipient><label class="col-sm-2 control-label">Invoice Recipient Name</label><div class=col-sm-10><input class=form-control placeholder="Invoice Recipient Name" ng-model=data.invoice_recipient_name data-ng-required="data.external_invoice_recipient"></div></div><div class=form-group data-ng-if=isEdit() data-ng-show=data.external_invoice_recipient><label class="col-sm-2 control-label">Invoice Recipient Email</label><div class=col-sm-10><input class=form-control placeholder="Invoice Recipient Email" ng-model=data.invoice_recipient_email data-ng-required="data.external_invoice_recipient"></div></div><div class=form-group data-ng-if=isEdit() data-ng-show=data.external_invoice_recipient><label class="col-sm-2 control-label">Invoice Recipient Phone</label><div class=col-sm-10><input class=form-control placeholder="Invoice Recipient Phone" ng-model=data.invoice_recipient_phone data-ng-required="data.external_invoice_recipient"></div></div><div class=form-group><div class="col-sm-10 col-sm-offset-2"><div class="checkbox checkbox-primary"><label><input type=checkbox ng-true-value=1 ng-false-value=0 ng-model="data.invoice_including_vat"> Add VAT by default to invoices <i></i></label></div></div></div><h4 class=page-header data-ng-if=isAdd()>Primary team member:</h4><div class=form-group data-ng-if=isAdd()><label class="col-sm-3 control-label">First Name *</label><div class=col-sm-9><input class=form-control placeholder="First Name" ng-model=user.name_first required></div></div><div class=form-group data-ng-if=isAdd()><label class="col-sm-3 control-label">Last Name</label><div class=col-sm-9><input class=form-control placeholder="Last Name" ng-model="user.name_last"></div></div><div class=form-group data-ng-if=isAdd()><label class="col-sm-3 control-label">Email *</label><div class=col-sm-9><input type=email class=form-control placeholder=Email ng-model="user.email"></div></div><div class=form-group data-ng-if=isAdd()><label class="col-sm-3 control-label">Phone *</label><div class=col-sm-9><input class=form-control placeholder=Phone ng-model=user.phone required></div></div></div><div class=wrapper ng-if=isEdit()><h4 class="page-header m-t-none m-t-none">Company Logo:</h4><div class=form-group data-ng-if=isEdit()><div class="col-sm-9 col-sm-offset-2"><img ng-src="{{ data.logo }}" ng-if=data.logo style="max-width: 250px"><br><a class="btn btn-secondary" href data-ui-sref=.logo({team_id:data.id}) title="Add Profile Picture" role=button data-ng-show="! data.logo">Add Company Logo</a> <a class="btn btn-secondary" href data-ui-sref=.logo({team_id:data.id}) title="Edit Profile Picture" role=button data-ng-show=data.logo>Edit Company Logo</a></div></div></div><footer class="panel-footer text-right"><button type=button class="btn btn-sm btn-default" ng-click=cancel()>Cancel</button> <button type=button class="btn btn-sm btn-primary" ng-click=store() ng-if=isAdd() ng-disabled="form.$invalid || userCreated">Save</button>\x3c!--<button type="button" class="btn btn-sm btn-danger" confirm-delete="destroy()" ng-if="isEdit()">--\x3e\x3c!--Delete--\x3e\x3c!--</button>--\x3e <button type=button class="btn btn-sm btn-primary" ng-click=update() ng-if=isEdit() ng-disabled=form.$invalid>Save</button></footer></form></tab><tab heading=Users><div class=panel-body data-ng-if=team.members><h4 class=page-header>Users</h4><div class=table-responsive><table class="table table-striped team-members text-left" data-ng-table=teamMembers><tbody><tr ng-repeat="member in $data"><td><img class=avatar data-ng-src="{{member.avatar ? member.avatar : member.avatar_url}}" width=50></td><td data-title="\'Name\'">{{member.name_full}}</td><td data-title="\'Email\'">{{member.email}}</td><td class=text-u-f><i data-ng-show="member.team_role == \'primary\'">({{member.team_role}} User)</i></td><td class=text-right><a ui-sref="admin.users.edit({id: member.id})" class="btn btn-sm btn-primary">Edit</a> <a data-ng-click=transferPrimaryUser(member) class="btn btn-sm btn-secondary" data-ng-show="member.team_role != \'primary\'">Set as Primary</a> <a ng-hide="member.id == $auth.user().id" data-ng-class="{\'btn-danger\': !member.inactivated, \'btn-success\': member.inactivated}" ng-click=team.deactivateMember(member) class="btn btn-sm">{{member.inactivated ? \'Activate\' : \'Deactivate\'}}</a></td></tr></tbody></table></div></div></tab><tab heading=Documents><div class=wrapper><h4 class=page-header>Documents: <a class="btn btn-secondary btn-sm pull-right" href data-ui-sref=.adddocument><span class="fa fa-plus"></span> Add Document</a></h4><div class=table-responsive><table class="table table-striped team-documents text-left" data-ng-table=teamDocuments><tr ng-repeat="document in $data"><form name="document{{ document.id }}"></form><td data-title="\'Type\'">{{ document.type.name }}</td><td data-title="\'Status\'">{{ document.status }}</td><td data-title="\'User\'">{{ document.user.name_full }}</td><td data-title="\'Expiry\'"><span ng-if="document.expiry != \'0000-00-00\' && document.type.expiry_required">{{createDate(document.expiry) | date: \'dd/MM/yyyy\'}}</span> <span ng-if="document.expiry == \'0000-00-00\'">N/A</span></td><td data-title="\'Insured Amount\'"><span ng-if=document.type.amount_required>{{ document.insured_amount | currency : \'GBP\' }}</span> <span ng-if=!document.type.amount_required>N/A</span></td><td data-title="" class=text-right><a class="btn btn-sm btn-success" href="" data-ng-click=approveDocument(document) data-ng-show="document.status != \'approved\'"><span class="fa fa-check">Approve</span></a> <a class="btn btn-sm btn-secondary" href="{{ document.upload }}" download="{{ document.upload | split:\'/\':\'last\' }}" target=_self><span class="fa fa-download">Download</span></a> <a class="btn btn-sm btn-primary" data-ui-sref=".editdocument({ document_id: document.id })"><span class="fa fa-pencil"></span> Edit</a> <a class="btn btn-sm btn-danger" href confirm-delete=destroyDocument(document)><span class="fa fa-trash"></span> Delete</a></td></tr></table></div></div></tab><tab heading=Locations><div class=wrapper><h4 class=page-header>Locations: <a class="btn btn-secondary btn-sm pull-right" data-ui-sref=.addlocation><span class="fa fa-plus"></span> Add Location</a></h4><div class=table-responsive><table class="table table-striped team-documents text-left" data-ng-table=teamLocations><tr ng-repeat="location in $data"><form name="location{{ location.id }}"></form><td data-title="\'Location\'">{{ location.location }}</td><td data-title="\'Miles\'">{{ location.miles }}</td><td data-title="\'User\'">{{ location.user.name_full }}</td><td data-title="" class=text-right><a class="btn btn-sm btn-primary" href data-ui-sref=".editlocation({location_id: location.id})"><span class="fa fa-pencil">Edit</span></a> <a class="btn btn-sm btn-danger" href confirm-delete=destroyLocation(location)><span class="fa fa-trash">Delete</span></a></td></tr></table></div></div></tab><tab heading=Feedback><div class=wrapper><h4 class=page-header>Feedback:</h4><div data-ng-repeat="fb in feedback"><div class="pull-left thumb-sm avatar m-l-n-sm m-t"><img data-ng-src={{fb.sender.avatar_url}} alt={{fb.sender.name_full}}></div><div class="m-l-xl m-b-lg panel b-a bg-light pos-rlt"><span class="arrow arrow-light left"></span><div class=panel-body data-ng-if=fb><div class=m-b><i>“{{fb.comment}}”</i></div><rating class="rating read-only" ng-model=fb.rating max=5 state-on="\'glyphicon glyphicon-star text-info\'" state-off="\'glyphicon glyphicon-star-empty text-info\'" data-readonly=true></rating><small class=text-muted>- {{fb.sender.name_full}} ({{fb.sender.team_info.company_name}}) - <i>{{fb.created_at | amDateFormat:\'DD/MM/YYYY HH:mm\'}}</i></small></div></div></div></div></tab><tab heading=Notes><div class=wrapper><h4 class=page-header>Notes: <a class="btn btn-secondary btn-sm pull-right" href data-ui-sref=.addnote><span class="fa fa-plus"></span> Add Note</a></h4><div class=table-responsive><table class="table table-striped team-notes text-left" data-ng-table=notes><tr ng-repeat="note in $data"><form name="note{{ note.id }}"><td data-title="\'User\'">{{ note.user.name_full }}</td><td data-title="\'Content\'">{{ note.content }}</td><td data-title="\'Created\'"><span>{{ createDate(note.created_at) | date: \'dd/MM/yyyy H:mm\' }}</span></td><td data-title="" class=text-right><a class="btn btn-sm btn-primary" data-ui-sref=".editnote({ note_id: note.id })"><span class="fa fa-pencil"></span> Edit</a> <a class="btn btn-sm btn-danger" href confirm-delete=destroyNote(note)><span class="fa fa-trash"></span> Delete</a></td></form></tr></table></div></div></tab><tab heading=Settings><div class=wrapper><h4 class=page-header>Settings:</h4><form class="form-horizontal form-validation" name=form><div class=form-group><div class="col-sm-10 col-sm-offset-2"><div class="checkbox checkbox-primary"><label><input type=checkbox data-ng-true-value=0 data-ng-false-value=1 data-ng-model="data.members_directory"> Exclude from Members Directory <i></i></label></div></div></div><footer class="panel-footer text-right"><button type=button class="btn btn-sm btn-default" ng-click=cancel()>Cancel</button> <button type=button class="btn btn-sm btn-primary" ng-click=store() ng-if=isAdd() ng-disabled="form.$invalid || userCreated">Save</button> <button type=button class="btn btn-sm btn-primary" ng-click=update() ng-if=isEdit() ng-disabled=form.$invalid>Save</button></footer></form></div></tab></tabset></div>');
    $templateCache.put("src/admin/teams/edit/location/edit.html", '<div class=modal-header><h3 class="modal-title pull-left">{{mode}} locations</h3><div class=pull-right><button class="btn btn-default btn-sm" data-ng-click=$dismiss(true)>Cancel</button></div><div class=clearfix></div></div><form class="form form-horizontal" role=form name=form><div class=modal-body><div class=form-group><label for="" class="col-sm-3 control-label font-bold">User:</label><div class=col-sm-9><ui-select ng-model=data.user_id theme=bootstrap data-search-enabled=false style=width:100%><ui-select-match allow-clear=true placeholder="Select user to assign the location to.">{{$select.selected.name_full}}</ui-select-match><ui-select-choices repeat="value.id as value in team.members"><div ng-bind-html=value.name_full></div></ui-select-choices></ui-select></div></div><div class=form-group><label class="col-sm-3 control-label font-bold">Location:</label><div class=col-sm-9><input class=form-control placeholder=Location details=details ng-model=data.location lng=data.longitude lat=data.latitude googleplace required></div></div><div class=form-group><label class="col-sm-3 control-label font-bold">Accept job within:</label><div class=col-sm-9><ui-select ng-model=data.miles theme=bootstrap data-search-enabled=false style="width: 100%"><ui-select-match allow-clear=false placeholder="Select miles...">{{$select.selected.name}}</ui-select-match><ui-select-choices repeat="value.id as value in miles"><div ng-bind-html=value.name></div></ui-select-choices></ui-select></div></div><div class=form-group><label class="col-sm-3 control-label font-bold">Map preview:</label><div class=col-sm-9><div class="map map-md map-full m-t"><ui-gmap-google-map id=map-canvas center=map.center zoom=map.zoom options=map.options control=map.control fit=true><ui-gmap-marker coords="{latitude: data.latitude, longitude: data.longitude}" idkey=0 ng-if="data.latitude && data.longitude"></ui-gmap-marker><ui-gmap-circle ng-repeat="c in map.circles" center=c.center fill="{color: \'#063f60\', opacity: 0.3}" stroke="{color: \'#063f60\', weight: 1, opacity: 1}" radius=c.radius clickable=false draggable=false editable=false visible ng-if=c.center></ui-gmap-circle></ui-gmap-google-map></div></div></div></div><div class="modal-footer text-right"><button type=button class="btn btn-lg btn-primary" data-ng-click=store() data-ng-disabled="form.$invalid || formSubmitted" data-ng-if=isAdd()><span data-ng-show=!formSubmitted>Add location</span> <span data-ng-show=formSubmitted><i class="fa fa-spin fa-circle-o-notch"></i> Add location</span></button> <button type=button class="btn btn-lg btn-primary" data-ng-click=update() data-ng-disabled="form.$invalid || formSubmitted" data-ng-if=isEdit()><span data-ng-show=!formSubmitted>Update location</span> <span data-ng-show=formSubmitted><i class="fa fa-spin fa-circle-o-notch"></i> Update location</span></button></div></form>');
    $templateCache.put("src/admin/teams/edit/logo/logo.html", '<div class=modal-header><h3 class="modal-title pull-left">Upload Profile Picture</h3><div class=pull-right><button class="btn btn-default btn-sm" data-ng-click=$dismiss()>Cancel</button></div><div class=clearfix></div></div><form class="form form-horizontal" role=form name=form><div class=modal-body><div class=form-group data-ng-show=!noFile><label class="col-sm-2 control-label font-bold">Select An Image:</label><div class=col-sm-10><span class="btn btn-secondary btn-file"><span>Select image from your computer</span> <input type=file class=form-control id=logo-upload name=logo-upload data-ng-model=upload nv-file-select="" uploader=uploader valid-file required></span></div></div><div class=form-group data-ng-show="status == \'loaded\'"><label class="col-sm-2 control-label font-bold">Your Logo:</label><div class=col-sm-10><img ng-src="{{ myImage }}" style="max-width: 100%; max-height: 100%"></div></div><div class=form-group data-ng-show=progress><label class="col-sm-2 control-label font-bold">Progress:</label><div class=col-sm-10><p class=form-control-static><progressbar value=progress class="progress-xs m-t" type=info ng-show=progress></progressbar></p></div></div></div><div class="modal-footer text-right"><button type=button class="btn btn-lg btn-primary" ng-click=store() ng-disabled=form.$invalid>Save</button></div></form>');
    $templateCache.put("src/admin/teams/edit/notes/edit.html", '<div class=modal-header><h3 class="modal-title pull-left text-capitalize">{{ mode }} notes</h3><div class=pull-right><button class="btn btn-default btn-sm" data-ng-click=$dismiss()>Cancel</button></div><div class=clearfix></div></div><form class="form form-horizontal" role=form name=form><div class=modal-body><div class=form-group><label class="col-sm-3 control-label font-bold">Note:</label><div class=col-sm-9><textarea required class=form-control placeholder=Note ng-model=data.content>\n' + '                </textarea></div></div></div><div class="modal-footer text-right"><button type=button class="btn btn-lg btn-secondary" ng-click=store() ng-disabled="form.$invalid || formSubmitted" ng-if="mode ==\'add\'"><span data-ng-show=!formSubmitted>Add note</span> <span data-ng-show=formSubmitted><i class="fa fa-spin fa-circle-o-notch"></i> Add note</span></button> <button type=button class="btn btn-lg btn-secondary" ng-click=store() ng-disabled="form.$invalid || formSubmitted" ng-if="mode ==\'edit\'"><span data-ng-show=!formSubmitted>Update note</span> <span data-ng-show=formSubmitted><i class="fa fa-spin fa-circle-o-notch"></i> Update note</span></button></div></form>');
    $templateCache.put("src/admin/teams/list.html", '<div class="bg-light lter b-b wrapper-md"><h1 class="m-n font-light h3"><i class=icon-users></i> Members</h1></div><div class=wrapper-md data-ui-view><div class="panel panel-default"><div class=panel-heading><h3 class=panel-title>List of members</h3></div><div class="panel-body no-padder"><div class="row wrapper"><div class=col-sm-4><div class="form-group m-b-none"><input class="form-control input-sm" type=search placeholder=Search... ng-model="tableParams.filter()[\'search\']"></div></div><div class="col-sm-8 text-right"><a class="btn btn-secondary btn-sm" data-ui-sref=.add><i class=icon-plus></i> Add</a> <a class="btn btn-success btn-sm" data-ng-click=tableParams.reload()><i class=icon-refresh></i> Refresh</a> <a class="btn btn-warning btn-sm" data-ng-click="tableParams.sorting({name: \'asc\'})"><i class="fa fa-eraser"></i> Clear sorting</a> <a class="btn btn-danger btn-sm" data-ng-click=tableParams.filter({})><i class="fa fa-eraser"></i> Clear filter</a> <a class="btn btn-primary btn-sm" ng-mousedown=csv.generate() ng-href="{{ csv.link() }}" download=teams.csv><i class=icon-arrow-down></i> Export to CSV</a></div></div><div class="row wrapper b-t b-light"><div class=col-sm-3>Members expiring in:</div><div class="col-sm-9 text-right"><div class=btn-group ng-init="radioModel = \'Male\'"><label class="btn btn-xs btn-white" ng-class="{active: tableParams.filter()[\'expires_in\'] === \'day\'}" ng-click="tableParams.filter()[\'expires_in\'] = \'day\'">Day</label><label class="btn btn-xs btn-white" ng-class="{active: tableParams.filter()[\'expires_in\'] === \'week\'}" ng-click="tableParams.filter()[\'expires_in\'] = \'week\'">Week</label><label class="btn btn-xs btn-white" ng-class="{active: tableParams.filter()[\'expires_in\'] === \'month\'}" ng-click="tableParams.filter()[\'expires_in\'] = \'month\'">Month</label><label class="btn btn-xs btn-white" ng-class="{active: tableParams.filter()[\'expires_in\'] === \'quarter\'}" ng-click="tableParams.filter()[\'expires_in\'] = \'quarter\'">Quarter</label><label class="btn btn-xs btn-white" ng-class="{active: tableParams.filter()[\'expires_in\'] === \'year\'}" ng-click="tableParams.filter()[\'expires_in\'] = \'year\'">Year</label></div></div></div><div class=table-responsive><table class="table table-striped b-t b-light text-left" data-ng-table=tableParams export-csv=csv template-pagination=src/admin/layout/pagination.html><tbody><tr class="odd gradeX" data-ng-repeat="data in $data"><td data-title="\'Company Name\'" data-sortable="\'company_name\'">{{data.company_name}}</td><td data-title="\'Primary Member\'">{{data.primary_member.name_full}}</td><td data-title="\'Expiry date\'" data-sortable="\'expire_at\'">{{createDate(data.expire_at) | date: \'dd/MM/yyyy\'}}</td><td data-title="\'Allow Bidding\'"><label class=i-switch><input type=checkbox data-ng-model=data.can_bid data-ng-change=toggleBidding(data)> <i></i></label></td><td data-title="\'Town\'" data-sortable="\'city\'">{{data.town}}</td><td data-title="\'Postal Code\'" data-sortable="\'city\'">{{data.postal_code}}</td><td data-title="\'Type\'" data-sortable="\'type\'"><select data-ng-model=data.type class=form-control data-ng-change=updateType(data)><option value=poster>Poster</option><option value=taker>Taker</option><option value=both>Both</option></select></td><td data-title="\'Created at\'" data-sortable="\'created_at\'">{{ createDate(data.created_at) | date: \'dd/MM/yyyy\' }}</td><td data-title="\'Actions\'" class=text-right><a class="btn btn-primary btn-sm" data-ui-sref=.edit({id:data.id})><i class="fa fa-edit"></i> Edit</a> <a class="btn btn-sm" confirm-modal=deactivate(data) data-ng-class="{\'btn-danger\': !data.is_expired, \'btn-success\': data.is_expired}"><i class="fa fa-trash-o"></i> {{data.is_expired ? \'Activate\' : \'Deactivate\'}}</a></td></tr></tbody></table></div></div></div></div>');
    $templateCache.put("src/admin/users/edit/document/document.html", '<div class=modal-header><h3 class="modal-title pull-left">Upload Document</h3><div class=pull-right><button class="btn btn-default btn-sm" data-ng-click=$dismiss()>Cancel</button></div><div class=clearfix></div></div><form class="form form-horizontal" role=form name=form><div class=modal-body><div class=form-group><label class="col-sm-2 control-label font-bold">Type:</label><div class=col-sm-10><ui-select ng-model=data.selected_type on-select="data.type_id = data.selected_type.id" theme=bootstrap data-search-enabled=false style=width:100%><ui-select-match allow-clear=true placeholder="Select the document type">{{$select.selected.name}}</ui-select-match><ui-select-choices repeat="value as value in doctypes"><div ng-bind-html=value.name></div></ui-select-choices></ui-select></div></div><div class=form-group ng-if=data.selected_type.expiry_required><label class="col-sm-2 control-label font-bold">Expiry Date:</label><div class=col-sm-10><i-dtp ng-model=data.expiry icon=calendar placeholder="Expiration Date" min-date=minDate ng-required="data.selected_type.expiry_required"></div></div><div class=form-group ng-if=data.selected_type.amount_required><label class="col-sm-2 control-label font-bold">Amount Insured:</label><div class=col-sm-10><div class=input-group><span class=input-group-btn><button type=button class="btn btn-default" ng-click=clickToggle($event)><i class="fa fa-gbp"></i></button></span> <input ng-model=data.insured_amount class=form-control ng-required=data.selected_type.amount_required placeholder="Insured amount in pounds, eg. 10000"></div></div></div><div class=form-group ng-if="mode != \'edit\' && !noFile"><label class="col-sm-2 control-label font-bold">Select Document:</label><div class=col-sm-10><div class=form-control-static><div class="btn btn-secondary btn-file"><span>Select file from your computer</span> <input type=file class=form-control id=doc-upload name=doc-upload data-ng-model=upload nv-file-select="" uploader=uploader valid-file required></div></div></div></div><div class=form-group data-ng-show=file><label class="col-sm-2 control-label font-bold">Selected file:</label><div class=col-sm-10><p class=form-control-static>{{file.name}}</p></div></div><div class=form-group data-ng-show=progress><label class="col-sm-2 control-label font-bold">Progress:</label><div class=col-sm-10><p class=form-control-static><progressbar value=progress class=progress-xs type=info ng-show=progress></progressbar></p></div></div></div><div class="modal-footer text-right"><button type=button class="btn btn-lg btn-secondary" ng-click=store() ng-disabled="form.$invalid || formSubmitted" ng-if="mode ==\'add\'"><span data-ng-show=!formSubmitted>Upload Document</span> <span data-ng-show=formSubmitted><i class="fa fa-spin fa-circle-o-notch"></i> Upload Document</span></button> <button type=button class="btn btn-lg btn-secondary" ng-click=store() ng-disabled=formSubmitted ng-if="mode ==\'edit\'"><span data-ng-show=!formSubmitted>Update Document</span> <span data-ng-show=formSubmitted><i class="fa fa-spin fa-circle-o-notch"></i> Update Document</span></button></div></form>');
    $templateCache.put("src/admin/users/edit/edit.html", '<form class="form-horizontal form-validation" name=form><div class="panel panel-default"><div class=panel-heading><h3 class=panel-title>{{mode}} User</h3></div><div class=panel-body><div class=form-group data-ng-if=isEdit()><div class=col-sm-12><label class="pull-left m-t-xs">Feedback rating:</label><div class="ratings pull-left m-t-xs m-l-xs"><rating class="rating read-only" ng-model=data.score max=5 state-on="\'glyphicon glyphicon-star text-info\'" state-off="\'glyphicon glyphicon-star-empty text-info\'" data-readonly=true></rating></div><label class="pull-left m-t-xs m-l-xs text-muted"><small><i>({{data.score}}) from {{data.ratings_count}} reviews</i></small></label><label class="i-switch m-t-xs m-l pull-right"><input type=checkbox data-ng-model=data.is_driver data-ng-change=toggleBidding()> <i></i></label><label class="pull-right m-t-xs">Ability to bid on jobs</label><span class="spacer pull-right">&nbsp;&nbsp;&nbsp;</span><label class="i-switch m-t-xs m-l pull-right"><input type=checkbox data-ng-model=data.can_use_client_api> <i></i></label><label class="pull-right m-t-xs">Ability to use Client API</label></div></div><tabset>\x3c!--User details--\x3e<tab heading="User details"><div class="wrapper no-padder-h"><h4 class="page-header m-t-none m-t-none">User details</h4><div class=form-group ng-if=isEdit()><label class="col-sm-3 control-label">User ID</label><div class=col-sm-9><input class=form-control placeholder="User ID" ng-model=data.id disabled required></div></div><div class=form-group><label class="col-sm-3 control-label">First Name *</label><div class=col-sm-9><input class=form-control placeholder="First Name" ng-model=data.name_first required></div></div><div class=form-group><label class="col-sm-3 control-label">Last Name</label><div class=col-sm-9><input class=form-control placeholder="Last Name" ng-model="data.name_last"></div></div><div class=form-group><label class="col-sm-3 control-label">Email *</label><div class=col-sm-9><input type=email class=form-control placeholder=Email ng-model="data.email"></div></div><div class=form-group><label class="col-sm-3 control-label">Phone *</label><div class=col-sm-9><input class=form-control placeholder=Phone ng-model=data.phone required></div></div><div class=form-group data-ng-show=isEdit()><div class="col-sm-9 col-sm-offset-3"><div class="checkbox checkbox-primary"><label><input type=checkbox data-ng-model="changePass"> Change password <i></i></label></div></div></div><div class=form-group data-ng-if=isEdit() data-ng-show=changePass ng-class="{\n' + "                                        'has-error': form.$error.minlength,\n" + "                                        'has-success': form.password.$valid,\n" + "                                        'has-feedback': form.password.$valid || form.$error.minlength\n" + '                                    }"><label class="col-sm-3 control-label">Password:</label><div class="col-sm-9 col-md-5"><input type=password placeholder=Password class=form-control data-ng-minlength=6 ng-model=data.password name=password data-ng-required=changePass> <span class="fa fa-check-circle form-control-feedback" aria-hidden=true data-ng-show=form.password.$valid></span> <span class="fa fa-times-circle form-control-feedback" aria-hidden=true data-ng-show=form.$error.minlength></span> <span class="label label-danger" data-ng-show=form.$error.minlength>Passwords must be a minimum of 6 characters</span></div></div><div class=form-group data-ng-if=isEdit() data-ng-show=changePass ng-class="{\n' + "                                        'has-error': form.password_confirmation.$error.matchTo,\n" + "                                        'has-success': form.password_confirmation.$valid,\n" + "                                        'has-feedback': form.password_confirmation.$valid || form.password_confirmation.$error.matchTo,\n" + '                                    }"><label class="col-sm-3 control-label">Retype password:</label><div class="col-sm-9 col-md-5"><input type=password placeholder="Retype password" class=form-control ng-model=data.password_confirmation name=password_confirmation data-match-to=form.password data-ng-required=changePass> <span class="fa fa-check-circle form-control-feedback" aria-hidden=true data-ng-show=form.password_confirmation.$valid></span> <span class="fa fa-times-circle form-control-feedback" aria-hidden=true data-ng-show=form.password_confirmation.$error.matchTo></span> <span class="label label-danger" data-ng-show=form.password_confirmation.$error.matchTo>Passwords do not match.</span></div></div><h4 class=page-header>Company details</h4><div class=form-group><label class="col-sm-3 control-label">Company name*</label><div class="col-sm-9 col-md-5"><ui-select ng-disabled="data.hasRole(\'team.member.primary\')" ng-model=data.team_id data-search-enabled=true style="width: 100%" required><ui-select-match allow-clear=false placeholder="Select a team...">{{$select.selected.company_name}}</ui-select-match><ui-select-choices repeat="value.id as value in teams | propsFilter: {company_name: $select.search}" ui-disable-choice="_.where(value.members, {inactivated: 0}).length >= 10"><div ng-bind-html=value.company_name></div></ui-select-choices></ui-select><p ng-if="data.hasRole(\'team.member.primary\')" class="help-block text-danger">This user is the Primary Member of his team and can\'t be currently transferred.</p></div></div></div></tab>\x3c!--User Documents--\x3e<tab heading=Documents data-disable=isAdd()><div class="wrapper no-padder-h"><h4 class="page-header m-t-none">User documents <a class="btn btn-secondary btn-xs pull-right" href data-ui-sref=.adddocument><span class="fa fa-plus"></span> Add Document</a><div class=clearfix></div></h4><div class=table-responsive><table class="table table-striped text-left" data-ng-table=documents template-pagination=src/user/layout/elements/tfoot.html><tbody><tr class="odd gradeX" data-ng-repeat="data in $data"><form name=document{{document.id}}><td data-title="\'Type\'">{{data.type.name}}</td><td class=text-u-f data-title="\'Status\'">{{data.status}}</td><td data-title="\'Expiry\'"><span ng-if="data.expiry != \'0000-00-00\' && data.type.expiry_required">{{createDate(data.expiry) | date: \'dd/MM/yyyy\'}}</span> <span ng-if="data.expiry == \'0000-00-00\'">N/A</span></td><td data-title="\'Insured Amount\'"><span ng-if=data.type.amount_required>{{ data.insured_amount | currency : \'GBP\' }}</span> <span ng-if=!data.type.amount_required>N/A</span></td><td data-title="" class=text-right><a class="btn btn-sm btn-success" href data-ng-click=approveDocument(data) data-ng-show="data.status != \'approved\'"><span class="fa fa-check"></span> Approve</a> <a class="btn btn-sm btn-secondary" href={{data.upload}} download="{{data.upload | split:\'/\':\'last\'}}" target=_self><span class="fa fa-download"></span> Download</a> <a class="btn btn-sm btn-primary" ui-sref="admin.users.edit.editdocument({ id: data.user_id, document_id: data.id })">\x3c!-- ui-sref="admin.teams.edit.editdocument({ id: data.team_id, document_id: data.id })" --\x3e<span class="fa fa-download"></span> Edit</a> <a class="btn btn-sm btn-danger" href confirm-delete=destroyDocument(data)><span class="fa fa-trash"></span> Delete</a></td></form></tr></tbody></table></div></div></tab>\x3c!--User Locations--\x3e<tab heading=Locations data-disable=isAdd()><div class="wrapper no-padder-h"><h4 class="page-header m-t-none">User locations <a class="btn btn-secondary btn-xs pull-right" href data-ui-sref=.addlocation><span class="fa fa-plus"></span> Add Location</a><div class=clearfix></div></h4><table class="table table-striped text-left" data-ng-table=locations template-pagination=src/user/layout/elements/tfoot.html><tbody><tr class="odd gradeX" data-ng-repeat="data in $data"><td data-title="\'Location\'">{{data.location}}</td><td data-title="\'Accept jobs within\'">{{data.miles}} miles</td><td data-title="\'\'" class=text-right><a class="btn btn-sm btn-primary" href data-ui-sref=".editlocation({location_id: data.id})"><span class="fa fa-pencil"></span> Edit</a> <a class="btn btn-sm btn-danger" href confirm-delete=destroyLocation(data)><span class="fa fa-trash"></span> Delete</a></td></tr></tbody></table></div></tab>\x3c!--User Feedback--\x3e<tab heading=Feedback data-disable=isAdd()><div class="wrapper no-padder-h"><h4 class="page-header m-t-none">User feedback</h4><div class="streamline b-l b-default m-l-lg m-b padder-v"><div data-ng-repeat="fb in feedback"><div class="pull-left thumb-sm avatar m-l-n-md m-t"><img data-ng-src={{fb.sender.avatar_url}} alt={{fb.sender.name_full}}></div><div class="m-l-lg m-b-lg panel b-a bg-light pos-rlt"><span class="arrow arrow-light left"></span><div class=panel-body data-ng-if=fb><div class=m-b><i>“{{fb.comment}}”</i></div><rating class="rating read-only" ng-model=fb.rating max=5 state-on="\'glyphicon glyphicon-star text-info\'" state-off="\'glyphicon glyphicon-star-empty text-info\'" data-readonly=true></rating><small class=text-muted>- {{fb.sender.name_full}} ({{fb.sender.team_info.company_name}}) - <i>{{fb.created_at | amDateFormat:\'DD/MM/YYYY HH:mm\'}}</i></small></div></div></div></div></div></tab>\x3c!--User capabilities--\x3e<tab heading=Capabilities data-disable=isAdd()><div class="wrapper no-padder-h"><h4 class="page-header m-t-none">User capabilities</h4>\x3c!--                         <div class="form-group" data-ng-if="isEdit()">\n' + '                            <label class="col-sm-3 control-label">Ability to bid on jobs</label>\n' + "\n" + '                            <div class="col-sm-9">\n' + '                                <label class="i-switch m-t-xs m-r">\n' + '                                    <input type="checkbox" data-ng-model="data.is_driver" data-ng-change="toggleBidding()">\n' + "                                    <i></i>\n" + "                                </label>\n" + "                            </div>\n" + "                        </div>\n" + ' --\x3e<div class=form-group data-ng-if=isEdit()><label class="col-sm-3 control-label">Administrator</label><div class=col-sm-9><label class="i-switch m-t-xs m-r"><input type=checkbox data-ng-model=data.is_admin data-ng-change=toggleAdmin()> <i></i></label></div></div></div></tab>\x3c!--Settings --\x3e<tab heading=Notifications data-disable=isAdd()><div class="wrapper no-padder-h"><h4 class="page-header m-t-none">New Job Notifications</h4><div class=form-group><label class="col-sm-3 control-label">Job Vehicle</label><div class=col-sm-9><select class=form-control ng-options="setting.value as setting.label for setting in settings.vehicle_type" ng-model=data.settings.vehicle_type></select></div><div class="col-sm-12 form-group" ng-if="data.settings.vehicle_type === \'custom\'"><div><label class=col-sm-3>Custom Range</label></div><div class=col-sm-9><div class=col-sm-12 style="margin-top: 0.6rem"><div class=col-sm-6><strong>From</strong> {{ vehiclesList[(data.settings.custom_min/100) - 1].name }} <strong>To</strong> {{ vehiclesList[(data.settings.custom_max/100) - 1].name }}</div></div><div class=col-sm-12 range-slider min=min max=max model-min=data.settings.custom_min model-max=data.settings.custom_max step=100></div></div></div></div><div class=form-group><label class="col-sm-3 control-label">Job Location</label><div class=col-sm-9><select class=form-control ng-options="setting.value as setting.label for setting in settings.location" ng-model=data.settings.location></select></div></div></div></tab>\x3c!-- Vehicles --\x3e<tab heading=Vehicles data-disable=isAdd()><div class="wrapper no-padder-h"><h4 class="page-header m-t-none">Vehicles</h4><div class=form-group data-ng-if=isEdit()><div class=col-sm-12><table class="table table-striped text-left" data-ng-table=vehicles template-pagination=src/admin/layout/pagination.html><tbody><tr class="odd gradeX" data-ng-repeat="data in $data"><td data-title="\'Type\'"><svg-image class=vehicle data-ng-src=data.icon title="{{ data.name }}"></svg-image></td><td class=text-u-f data-title="\'Status\'">{{ data.name }}</td><td data-title="\'\'" class=text-right><a ng-if=owns(data.id) ng-click=toggleVehicle(data) href class="btn btn-sm btn-success">In Fleet</a> <a ng-if="! owns(data.id)" ng-click=toggleVehicle(data) href class="btn btn-sm btn-primary">Add to Fleet</a></td></tr></tbody></table></div></div></div></tab>\x3c!--API details--\x3e<tab heading=API data-disable=isAdd() data-ng-show=can_use_client_api><div class="wrapper no-padder-h"><h3>Client ID</h3><pre>{{ api.id }}</pre><h3>API Key</h3><pre>{{ api.secret }}</pre></div></tab></tabset></div><footer class="panel-footer text-right"><button type=button class="btn btn-sm btn-default" ng-click=cancel()>Cancel</button> <button type=button class="btn btn-sm btn-primary" ng-click=store() ng-if=isAdd() ng-disabled="form.$invalid || userCreated">Save</button>\x3c!--<button type="button" class="btn btn-sm btn-danger" confirm-delete="destroy()" ng-if="isEdit()">--\x3e\x3c!--Delete--\x3e\x3c!--</button>--\x3e <button type=button class="btn btn-sm btn-primary" ng-click=update() ng-if=isEdit() ng-disabled=form.$invalid>Save</button></footer></div></form>');
    $templateCache.put("src/admin/users/edit/location/location.html", '<div class=modal-header><h3 class="modal-title pull-left">{{mode}} location</h3><div class=pull-right><button class="btn btn-default btn-sm" data-ng-click=$dismiss(true)>Cancel</button></div><div class=clearfix></div></div><form class="form form-horizontal" role=form name=form><div class=modal-body><div class=form-group><label class="col-sm-3 control-label font-bold">Location:</label><div class=col-sm-9><input class=form-control placeholder=Location details=details ng-model=data.location lng=data.longitude lat=data.latitude googleplace required></div></div><div class=form-group><label class="col-sm-3 control-label font-bold">Accept job within:</label><div class=col-sm-9><ui-select ng-model=data.miles theme=bootstrap data-search-enabled=false style="width: 100%"><ui-select-match allow-clear=false placeholder="Select miles...">{{$select.selected.name}}</ui-select-match><ui-select-choices repeat="value.id as value in miles"><div ng-bind-html=value.name></div></ui-select-choices></ui-select></div></div><div class=form-group><label class="col-sm-3 control-label font-bold">Map preview:</label><div class=col-sm-9><div class="map map-md map-full m-t"><ui-gmap-google-map id=map-canvas center=map.center zoom=map.zoom options=map.options control=map.control fit=true><ui-gmap-marker coords="{latitude: data.latitude, longitude: data.longitude}" idkey=0 ng-if="data.latitude && data.longitude"></ui-gmap-marker><ui-gmap-circle ng-repeat="c in map.circles" center=c.center fill="{color: \'#063f60\', opacity: 0.3}" stroke="{color: \'#063f60\', weight: 1, opacity: 1}" radius=c.radius clickable=false draggable=false editable=false visible ng-if=c.center></ui-gmap-circle></ui-gmap-google-map></div></div></div></div><div class="modal-footer text-right"><button type=button class="btn btn-lg btn-primary" data-ng-click=store() data-ng-disabled="form.$invalid || formSubmitted" data-ng-if=isAdd()><span data-ng-show=!formSubmitted>Add location</span> <span data-ng-show=formSubmitted><i class="fa fa-spin fa-circle-o-notch"></i> Add location</span></button> <button type=button class="btn btn-lg btn-primary" data-ng-click=update() data-ng-disabled="form.$invalid || formSubmitted" data-ng-if=isEdit()><span data-ng-show=!formSubmitted>Update location</span> <span data-ng-show=formSubmitted><i class="fa fa-spin fa-circle-o-notch"></i> Update location</span></button></div></form>');
    $templateCache.put("src/admin/users/list.html", '<div class="bg-light lter b-b wrapper-md"><h1 class="m-n font-light h3"><i class=icon-user></i> Users</h1></div><div class=wrapper-md data-ui-view><div class="panel panel-default"><div class=panel-heading><h3 class=panel-title>List of users</h3></div><div class="panel-body no-padder"><div class="row wrapper"><div class=col-sm-4><div class="form-group m-b-none"><input class="form-control input-sm" type=search placeholder=Search... ng-model="tableParams.filter()[\'search\']"></div></div><div class="col-sm-8 text-right"><a class="btn btn-secondary btn-sm" data-ui-sref=.add><i class=icon-plus></i> Add</a> <a class="btn btn-success btn-sm" data-ng-click=tableParams.reload()><i class=icon-refresh></i> Refresh</a> <a class="btn btn-warning btn-sm" data-ng-click="tableParams.sorting({name: \'asc\'})"><i class="fa fa-eraser"></i> Clear sorting</a> <a class="btn btn-danger btn-sm" data-ng-click=tableParams.filter({})><i class="fa fa-eraser"></i> Clear filter</a> <a class="btn btn-primary btn-sm" ng-mousedown=csv.generate() ng-href="{{ csv.link() }}" download=users.csv><i class=icon-arrow-down></i> Export to CSV</a></div></div><div class="row wrapper b-t b-light"><div class=col-sm-3>Filters:</div><div class="col-sm-9 text-right"><div class=btn-group ng-init="radioModel = \'Male\'"><label class="btn btn-xs btn-white" ng-model="tableParams.filter()[\'pending_documents_approval\']" btn-checkbox>Pending documents approval</label><label class="btn btn-xs btn-white" ng-model="tableParams.filter()[\'no_docs\']" btn-checkbox>No documents uploaded</label></div></div></div><div class=table-responsive><table class="table table-striped b-t b-light text-left" data-ng-table=tableParams export-csv=csv template-pagination=src/admin/layout/pagination.html><tbody><tr class="odd gradeX" data-ng-repeat="data in $data"><td data-title="\'Name\'" data-sortable="\'name\'">{{data.name_full}}</td><td data-title="\'Id\'">{{data.id}}</td><td data-title="\'Email\'" data-sortable="\'email\'"><a href=mailto:{{data.email}}>{{data.email}}</a></td><td data-title="\'Admin\'">{{data.is_admin | checkmark}}</td><td data-title="\'Team\'">{{ data.team_info.company_name }}</td><td data-title="\'Date created\'" data-sortable="\'created_at\'">{{ createDate(data.created_at) | date: \'dd/MM/yyyy\' }}</td><td data-title="\'Registration Progress\'">{{ capitalizeFirstLetter(data.registration_progress ? data.registration_progress : (data.registration_status == \'incomplete\' ? \'Email not verified\' : \'Added by Admin\')) }}</td><td class=text-right><a class="btn btn-sm" confirm-modal=inactivate(data) data-ng-if=!data.team_info.deactivated_at data-ng-class="{\'btn-danger\': !data.inactivated, \'btn-success\': data.inactivated}"><i class="{{data.inactivated ? \'fa fa-unlock\' : \'fa fa-lock\'}}"></i> {{data.inactivated ? \'Activate\' : \'Deactivate\'}}</a> <span class="btn btn-sm btn-warning disabled" data-ng-if=data.team_info.deactivated_at><i class="fa fa-unlock"></i> Activate</span> <a class="btn btn-primary btn-sm" data-ui-sref=.edit({id:data.id})><i class="fa fa-edit"></i> Edit</a></td></tr></tbody></table></div></div></div></div>');
    $templateCache.put("src/admin/vehicles/edit/edit.html", '<form class="form-horizontal form-validation" name=form><div class="panel panel-default"><div class=panel-heading><h3 class=panel-title>{{mode}} Vehicle</h3></div><div class=panel-body><div class=form-group><label class="col-sm-2 control-label">Icon</label><div class=col-sm-10><span class="btn btn-default btn-file"><span>Upload Icon</span> <input type=file class=form-control placeholder=Icon ng-model=data.icon nv-file-select="" uploader="uploader"></span></div></div><div class=form-group data-ng-show=data.icon><label class="col-sm-2 control-label">Preview</label><div class=col-sm-10 data-ng-if=data.icon><svg-image class=vehicle data-ng-src=data.icon title="{{ data.name }}"></svg-image></div></div><div class=form-group><label class="col-sm-2 control-label">Name</label><div class=col-sm-10><input class=form-control placeholder=Name ng-model=data.name required></div></div><div class=form-group><label class="col-sm-2 control-label">Sort No</label><div class=col-sm-10><input class=form-control placeholder="Sort No" ng-model=data.sort_no required></div></div></div><footer class="panel-footer text-right"><button type=button class="btn btn-sm btn-default" ng-click=cancel()>Cancel</button> <button type=button class="btn btn-sm btn-danger" confirm-delete=destroy() ng-if=isEdit()>Delete</button> <button type=button class="btn btn-sm btn-primary" ng-click=store() ng-if=isAdd() ng-disabled=form.$invalid>Save</button> <button type=button class="btn btn-sm btn-primary" ng-click=update() ng-if=isEdit() ng-disabled=form.$invalid>Save</button></footer></div></form>');
    $templateCache.put("src/admin/vehicles/list.html", '<div class="bg-light lter b-b wrapper-md"><h1 class="m-n font-light h3"><i class="fa fa-car"></i> Vehicles</h1></div><div class=wrapper-md data-ui-view><div class="panel panel-default"><div class=panel-heading><h3 class=panel-title>List of vehicles</h3></div><div class="panel-body no-padder"><div class="row wrapper"><div class=col-sm-4><div class="form-group m-b-none"><input class="form-control input-sm" type=search placeholder=Search... ng-model="tableParams.filter()[\'search\']"></div></div><div class="col-sm-8 text-right"><a class="btn btn-secondary btn-sm" data-ui-sref=.add><i class=icon-plus></i> Add</a> <a class="btn btn-success btn-sm" data-ng-click=tableParams.reload()><i class=icon-refresh></i> Refresh</a> <a class="btn btn-warning btn-sm" data-ng-click="tableParams.sorting({name: \'asc\'})"><i class="fa fa-eraser"></i> Clear sorting</a> <a class="btn btn-danger btn-sm" data-ng-click=tableParams.filter({})><i class="fa fa-eraser"></i> Clear filter</a></div></div><div class=table-responsive><table class="table table-striped b-t b-light text-left" data-ng-table=tableParams template-pagination=src/admin/layout/pagination.html><tbody><tr class="odd gradeX" data-ng-repeat="data in $data"><td class=text-middle data-title="\'#\'" data-sortable="\'sort_no\'" width=50>{{data.sort_no}}</td><td class=text-middle data-title="\'Icon\'" width=150 width=80><svg-image class=vehicle data-ng-src=data.icon title="{{ data.name }}"></svg-image></td><td class=text-middle data-title="\'Name\'" data-sortable="\'name\'">{{data.name}}</td><td class="text-middle text-right" data-title="\'Actions\'"><a class="btn btn-primary btn-sm" data-ui-sref=.edit({id:data.id})><i class="fa fa-edit"></i> Edit</a></td></tr></tbody></table></div></div></div></div>');
    $templateCache.put("src/components/directives/iDtp/iDtp.template.html", '<div class=i-dtp><div class=input-group><input class=form-control ng-model=viewValue placeholder="{{placeholder}}"> <span class=input-group-btn><button type=button class="btn btn-default" ng-click=clickToggle($event)><i class="fa fa-{{icon}}"></i></button></span><ul class=dropdown-menu ng-style="{display: (isOpen && \'block\') || \'none\'}" ng-keydown=keydown($event)><li><div class=datepicker datepicker ng-model=modelValue min-date=minDate max-date=maxDate></div></li><li><div class=timepicker timepicker ng-model=modelValue show-meridian=false></div></li><li><div class=i-dtp-footer><span class="btn-group pull-left" data-ng-if=controls><button type=button class="btn btn-sm btn-info" ng-click="select(\'now\')">Now</button> <button type=button class="btn btn-sm btn-warning" ng-click=select(null)>Clear</button></span> <span class="btn-group pull-right"><button type=button class="btn btn-sm btn-primary" ng-click=close()>Save</button></span></div></li></ul></div></div>');
    $templateCache.put("src/components/directives/sdcn.loader.html", '<div class="sdcn-loader sdcn-loader-{{size}}"><span class=hand-sm></span> <span class=hand-md></span> <span class=hand-lg></span> <span class="pc pc-a"></span> <span class="pc pc-b"></span> <span class="pc pc-c"></span> <span class="pc pc-d"></span></div>');
    $templateCache.put("src/login/login.html", '<div class="app app-login" ng-class="{\n' + "\t'app-header-fixed': $app.settings.headerFixed,\n" + "\t'app-aside-fixed' : $app.settings.asideFixed,\n" + "\t'app-aside-folded': $app.settings.asideFolded,\n" + "\t'app-aside-dock'  : $app.settings.asideDock,\n" + "\t'container'       : $app.settings.container\n" + '}"><div class=container ng-controller=LoginController ng-init="$app.settings.container = false;" data-ui-view><a class="brand text-center" data-ui-sref=login title="Same Day Courier Network"><div class=image-wrapper><img src=/assets/img/sdcn-login.png title="Same Day Courier Network" alt="Same Day Courier Network"></div><p class=logo-subtitle>A TRADING PLATFORM FOR COURIERS & HAULIERS</p></a><div class=row><div class=login-form><div class="panel panel-default sign-in"><div class=panel-body><h1 class="m-t-none m-b-sm">Customer Login</h1><p>Login to view, bid and post jobs.</p><form name=form class=m-t-md><div class="text-danger wrapper text-center" ng-show=authError>{{authError}}</div><div class="form-group has-feedback" ng-class="{\n' + "                                    'has-error': form.email.$error.email,\n" + "                                    'has-success': form.email.$valid,\n" + '                                }"><i class="icons8-email-envelope form-control-feedback feedback-left"></i> <input type=email id=email name=email placeholder=Email class=form-control data-ng-model=email required> <span class="fa fa-check-circle form-control-feedback" aria-hidden=true data-ng-if=form.email.$valid></span> <span class="fa fa-times-circle form-control-feedback" aria-hidden=true data-ng-if=form.email.$error.email></span> <span class="label label-danger" data-ng-if=form.email.$error.email>Not valid email!</span></div><div class="form-group has-feedback" ng-class="{\n' + "                                    'has-success': form.password.$valid,\n" + '                                }"><i class="icons8-lock form-control-feedback feedback-left"></i> <input type=password id=password name=password placeholder=Password class=form-control data-ng-model=password required> <span class="fa fa-check-circle form-control-feedback" aria-hidden=true data-ng-if=form.password.$valid></span></div><button type=submit class="btn btn-lg btn-info btn-block" ng-click="login(email, password)" data-ng-disabled=!form.$valid>Log in</button></form></div></div><div class="panel panel-default forgot-password"><div class=panel-body><div><span>Not got an account? <a data-ui-sref=register><strong>Register</strong></a></span> <span><a data-ui-sref=login.recover>Forgotten password?</a></span></div></div></div></div></div></div></div>');
    $templateCache.put("src/login/recover/recover.html", '<div class=recover ng-controller=RecoverController data-ui-view><a class="brand text-center" data-ui-sref=login title="Same Day Courier Network"><img src=/assets/img/login-logo.png title="Same Day Courier Network" alt="Same Day Courier Network"></a><div class="row m-t-lg"><div class="col-sm-6 col-sm-offset-3 col-md-4 col-md-offset-4"><div class="panel panel-default sign-in"><div class=panel-body><h2 class="m-t-none m-b-sm font-light">Forgot your password?</h2><p class=text-info>Enter your email address to recover your account.</p><form name=form><div class=form-group ng-class="{\n' + "                                    'has-error': form.email.$error.email,\n" + "                                    'has-success': form.email.$valid,\n" + "                                    'has-feedback': form.email.$valid || form.email.$error.email,\n" + '                                }"><input type=email name=email id=email placeholder="Email address" class=form-control data-ng-model=email required> <span class="fa fa-check-circle form-control-feedback" aria-hidden=true data-ng-if=form.email.$valid></span> <span class="fa fa-times-circle form-control-feedback" aria-hidden=true data-ng-if=form.email.$error.email></span> <span class="label label-danger" data-ng-if=form.email.$error.email>Not valid email!</span></div><button type=submit class="btn btn-lg btn-info btn-block" data-ng-click=recover(email) data-ng-disabled=form.$invalid>Recover My Password</button></form></div></div><div class="text-center m-t m-b"><a class=text-dark href data-ui-sref=login title=Cancel>Cancel</a></div></div></div></div>');
    $templateCache.put("src/login/reset/reset.html", '<div class="app app-register"><div class=container><div class="row m-t-lg"><div class=register-form><div class="panel panel-default"><div class=panel-body><h2>Create a password</h2><div class="alert alert-danger" data-ng-show=errors><p ng-repeat="(key, error) in errors">*{{ error[0] }}</p></div><form name=form class=m-t-lg><div class="alert alert-warning" ng-show=form.$error.pattern>* Password must be a minimum of 8 characters, at least one uppercase letter, one lowercase letter, one number and one special character(@, $, !, %, *, ?, &).</div><div class="col-md-6 has-feedback" ng-class="{\n' + "                                    'has-error': form.$error.minlength,\n" + "                                    'has-success': form.password.$valid,\n" + '                                }"><i class="icons8-lock form-control-feedback feedback-left" aria-hidden=true></i> <input type=password id=password name=password class="form-control form-field-transparent" autocomplete=off placeholder="Create a password" data-ng-model=password ng-pattern="/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$/" required> <span class="fa fa-check-circle form-control-feedback" aria-hidden=true data-ng-show=form.password.$valid></span> <span class="fa fa-times-circle form-control-feedback" aria-hidden=true data-ng-show=form.$error.pattern></span></div><div class="col-md-6 has-feedback" ng-class="{\n' + "                                    'has-error': form.password_confirmation.$error.matchTo,\n" + "                                    'has-success': form.password_confirmation.$valid,\n" + '                                }"><i class="icons8-lock form-control-feedback feedback-left" aria-hidden=true></i> <input type=password id=password_confirmation name=password_confirmation class="form-control form-field-transparent" autocomplete=off placeholder="Confirm password" data-ng-model=password_confirmation data-match-to=form.password required> <span class="fa fa-check-circle form-control-feedback" aria-hidden=true data-ng-show=form.password_confirmation.$valid></span> <span class="fa fa-times-circle form-control-feedback" aria-hidden=true data-ng-show="form.password_confirmation.$touched && form.password_confirmation.$error.matchTo"></span> <span class="label label-danger" data-ng-show="form.password_confirmation.$touched && form.password_confirmation.$error.matchTo">Passwords do not match.</span></div><div class=col-md-12><button type=submit class="btn btn-lg btn-info btn-block" data-ng-click=reset() data-ng-disabled=form.$invalid>Confirm</button></div></form></div></div></div></div></div></div>');
    $templateCache.put("src/register/company/company.html", '<div class=container ng-controller=CompanyController ui-view><div class="register-form m-t-sm"><div class="panel panel-default"><div class=panel-body><h2>Company</h2><div class="alert alert-danger" ng-show=errors><p ng-repeat="(key, error) in errors">*{{ error }}</p></div><form name=form class=register-company><div class=col-full-width><label class=form-radio ng-class="{ \'checked\' : isChecked(\'Limited Company\') }">LIMITED COMPANY <input type=radio value="Limited Company" ng-model=ctype ng-change="companyType(\'Limited Company\')"> <span class=tab></span></label><label class=form-radio ng-class="{ \'checked\' : isChecked(\'Sole Trader\') }">SOLE TRADER <input type=radio value="Sole Trader" ng-model=ctype ng-change="companyType(\'Sole Trader\')"> <span class=tab></span></label></div><div class=col-half-width><i class="icons8-briefcase form-control-feedback feedback-left" aria-hidden=true></i> <input placeholder="Company name" class="form-control form-field-transparent" ng-model=formData.company_name required></div><div class=col-half-width ng-class="{ \'disabled\': ctype === \'Sole Trader\' }"><i class="icons8-briefcase form-control-feedback feedback-left" aria-hidden=true></i> <input placeholder="Company number" class="form-control form-field-transparent" ng-model=formData.company_number ng-disabled="ctype === \'Sole Trader\'"></div><div class=col-half-width><i class="icons8-tags form-control-feedback feedback-left" aria-hidden=true></i> <input placeholder="VAT number" class="form-control form-field-transparent" ng-model=formData.vat_number></div><div class=col-full-width><button type=submit class="btn btn-lg btn-info btn-block" data-ng-disabled=!form.$valid ng-click=address()>Continue</button></div></form></div></div></div></div>');
    $templateCache.put("src/register/company/location/location.html", '<div class=container ng-controller=LocationController ui-view><div class="register-form m-t-md"><form name=form><div class="panel panel-default"><div class=panel-body><h2 class=m-t-sm>Company Address</h2><div class="alert alert-danger" ng-show=errors><p ng-repeat="(key, error) in errors">*{{ error[0] }}</p></div><div class=row><div class="col-half-width m-t-lg"><i class="icons8-location-marker form-control-feedback feedback-left" aria-hidden=true></i> <input placeholder="Search address" class="form-control form-field-transparent" ng-required=!enterManually details=data.address ng-model=data.location autocomplete=off googleplace></div><div class="col-full-width m-t-sm"><a ng-click=isEnterManually()>Enter address manually</a></div><div class=col-full-width ng-if=!enterManually><button type=button class="btn btn-lg btn-info btn-block" ng-click=location() ng-disabled=!form.$valid>Continue</button></div></div></div></div><div class="panel panel-default block-2" ng-if=enterManually><div class=panel-body><div class=row><div class=col-half-width><i class="icons8-location-marker form-control-feedback feedback-left" aria-hidden=true></i> <input placeholder="Address line 1" class="form-control form-field-transparent" ng-model=formData.address_line_1></div><div class=col-half-width><i class="icons8-location-marker form-control-feedback feedback-left" aria-hidden=true></i> <input placeholder="Address line 2" class="form-control form-field-transparent" ng-model=formData.address_line_2></div><div class=col-half-width><i class="icons8-location-marker form-control-feedback feedback-left" aria-hidden=true></i> <input placeholder=Town/city class="form-control form-field-transparent" ng-model=formData.town></div><div class=col-half-width><i class="icons8-location-marker form-control-feedback feedback-left" aria-hidden=true></i> <input placeholder=County class="form-control form-field-transparent" ng-model=formData.county></div><div class=col-half-width><i class="icons8-location-marker form-control-feedback feedback-left" aria-hidden=true></i> <input placeholder=Postcode class="form-control form-field-transparent" ng-model=formData.postal_code></div><div class=col-full-width><button type=submit class="btn btn-lg btn-info btn-block" ng-click=location() data-ng-disabled=!form.$valid>Continue</button></div></div></div></div></form></div></div>');
    $templateCache.put("src/register/documents/documents.html", '<div class="container register-documents" ng-controller=DocumentController ui-view><div class="register-form m-t-sm"><p class=title>Please add any other of the following documents:</p><div class="panel panel-default m-t-lg"><div class=panel-body><div ng-repeat="data in list"><div class=block><div class=col-left>{{ data.type.name }}</div><div class=col-right><a target=_blank href="{{ data.upload }}"><i class=icons8-pdf></i></a> <a confirm-delete="delete(data.id, data.type_id)"><i class=icons8-close-button></i></a></div></div><hr></div><div ng-repeat="data in defaultDocuments" ng-if="data.isUploaded == false"><div class=block><div class=col-left>{{ data.title }}</div><div class=col-right><a class=add-doc ng-click=openModal(data.type_id)><span>+</span></a></div></div><hr ng-if="!$last"></div></div></div><a class=add ng-click=openModal()><span>+</span> Add another document</a> <button type=submit class="btn btn-lg btn-info btn-block" ng-click=submit()>Continue</button> <a class=skip ng-click=nextStep()>Skip</a></div><div ng-include="\'src/register/documents/upload-modal.html\'"></div></div>');
    $templateCache.put("src/register/documents/upload-modal.html", '<div class="modal fade" id=upload-doc tabindex=-1 role=dialog aria-hidden=true data-backdrop=static data-keyboard=false><div class=modal-dialog role=document><div class=modal-content><div class=modal-body><h2 class="modal-title m-t-md">Upload Document</h2><button type=button class=close ng-click=closeModal() ng-disabled=formSubmitted><i class=icons8-close-button></i></button><form id=form name=form class=m-t-lg><div class=row><div class="form-group has-feedback"><i class="icons8-google-docs form-control-feedback feedback-left" aria-hidden=true></i><ui-select ng-model=data.selected_type on-select="data.type_id = data.selected_type.id" theme=bootstrap data-search-enabled=false required><ui-select-match allow-clear=true placeholder="Select the document type">{{ $select.selected.name }}</ui-select-match><ui-select-choices repeat="value as value in doctypes"><div ng-bind-html=value.name></div></ui-select-choices></ui-select></div><div class="form-group has-feedback" ng-if=data.selected_type.expiry_required><i class="icons8-calendar form-control-feedback feedback-left" aria-hidden=true></i><i-dtp ng-model=data.expiry icon=calendar placeholder="Expiration Date" min-date=minDate ng-required="data.selected_type.expiry_required"></div><div class=form-group ng-if=data.selected_type.amount_required><div class=input-group><span class=input-group-btn><button type=button class="btn btn-default" ng-click=clickToggle($event)><i class="fa fa-gbp"></i></button></span> <input ng-model=data.insured_amount class=form-control ng-required=data.selected_type.amount_required placeholder="Insured amount in pounds, eg. 10000"></div></div><div class=clearfix></div><div class="form-group has-feedback"><div class=btn-file><span>+ Upload Document</span> <input type=file class=form-control id=doc-upload name=docUpload data-ng-model=upload uploader=uploader valid-file nv-file-select multiple required></div></div><div class=form-group data-ng-show=file><p class=form-control-static>{{ file.name }} - {{file.size | bytes}}</p></div><div class=form-group><button type=submit class=btn ng-click=store() ng-disabled="form.$invalid || formSubmitted"><span data-ng-show=!formSubmitted>Save</span> <span data-ng-show=formSubmitted><i class="fa fa-spin fa-circle-o-notch"></i> Save</span></button></div></div></form></div></div></div></div>');
    $templateCache.put("src/register/invoice/footer/footer.html", '<div class=container ng-controller=FooterController ui-view><div class="register-form m-t-md"><form name=form class=register-invoice><div class="panel panel-default"><div class=panel-body><h2 class=m-t-xs>Invoice Footer</h2><p class=m-t-md>Please indicate any text you would like to appear in your invoice footers:</p><div class="alert alert-danger" ng-show=errors><p ng-repeat="(key, error) in errors">*{{ error }}</p></div><div class=row><div class=m-t-sm><i class="icons8-pencil form-control-feedback feedback-left" aria-hidden=true></i> <input placeholder="Footer text" class="form-control form-field-transparent" ng-model=formData.invoice_footer_text></div><div class=m-t-xl><label class=form-checkbox><span class=text>Invoice includes VAT?</span> <input type=checkbox ng-model=formData.invoice_including_vat ng-change=isInvoiceIncluded()> <span class=checkmark></span></label></div></div></div></div><div class="panel panel-default block-2"><div class=panel-body><div class=row><div><div class=invoice-logo-wrapper><img class=img-responsive ng-src="{{ myImage }}"></div><a class=add-image ng-click=openFileBrowser($event)>Add invoice logo +</a> <input type=file class="ng-hide form-control" id=invoice-logo name=invoice-logo data-ng-model=upload accept=image/* nv-file-select="" uploader="uploader"></div><div><button type=submit class="btn btn-lg btn-info btn-block" ng-click=submit()>Continue</button></div></div></div></div></form><a class=skip ng-click=nextStep()>Skip</a></div></div>');
    $templateCache.put("src/register/invoice/invoice.html", '<div class=container ng-controller=InvoiceController ui-view><div class="register-form m-t-lg"><div class="panel panel-default"><div class=panel-body><h3 class=m-t-xs>Invoice Address</h3></div></div><div class="panel panel-default block-2"><div class=panel-body><div class="alert alert-danger" ng-show=errors><p ng-repeat="(key, error) in errors">*{{ error }}</p></div><form name=form><div class=row><div class=col-full-width><label class="form-checkbox m-t-sm"><span class=text>Use company address</span> <input type=checkbox ng-model=formData.use_company_address ng-change=isSameAsCompanyAddress()> <span class=checkmark></span></label></div></div><div class="row m-t-lg"><div class=col-half-width ng-class="{ \'disabled\': addressDisabled }"><i class="icons8-location-marker form-control-feedback feedback-left" aria-hidden=true></i> <input placeholder="Address line 1" class="form-control form-field-transparent" ng-model=formData.invoice_address_line_1 ng-disabled=addressDisabled></div><div class=col-half-width ng-class="{ \'disabled\': addressDisabled }"><i class="icons8-location-marker form-control-feedback feedback-left" aria-hidden=true></i> <input placeholder="Address line 2" class="form-control form-field-transparent" ng-model=formData.invoice_address_line_2 ng-disabled=addressDisabled></div><div class=col-half-width ng-class="{ \'disabled\': addressDisabled }"><i class="icons8-location-marker form-control-feedback feedback-left" aria-hidden=true></i> <input placeholder=Town/city class="form-control form-field-transparent" ng-model=formData.invoice_town ng-disabled=addressDisabled></div><div class=col-half-width ng-class="{ \'disabled\': addressDisabled }"><i class="icons8-location-marker form-control-feedback feedback-left" aria-hidden=true></i> <input placeholder=County class="form-control form-field-transparent" ng-model=formData.invoice_county ng-disabled=addressDisabled></div><div class=col-half-width ng-class="{ \'disabled\': addressDisabled }"><i class="icons8-location-marker form-control-feedback feedback-left" aria-hidden=true></i> <input placeholder=Postcode class="form-control form-field-transparent" ng-model=formData.invoice_postal_code ng-disabled=addressDisabled></div><div class=col-full-width><button type=submit class="btn btn-lg btn-info btn-block" ng-click=submit()>Continue</button></div></div></form></div></div><a class=skip ng-click=nextStep()>Skip</a></div></div>');
    $templateCache.put("src/register/invoice/recipient/recipient.html", '<div class=container ng-controller=RecipientController ui-view><div class="register-form m-t-lg"><div class="panel panel-default"><div class=panel-body><h2 class=m-t-sm>Recipient Details</h2><div class="alert alert-danger" ng-show=errors><p ng-repeat="(key, error) in errors">*{{ error }}</p></div><form name=form><div class="row m-t-lg"><div class=col-half-width><i class="icons8-user form-control-feedback feedback-left" aria-hidden=true></i> <input placeholder="Invoice recipient name" class="form-control form-field-transparent" ng-model=formData.invoice_recipient_name></div><div class=col-half-width><i class="icons8-email-envelope form-control-feedback feedback-left" aria-hidden=true></i> <input type=email name=email placeholder="Recipient email" class="form-control form-field-transparent" ng-model=formData.invoice_recipient_email> <span class="label label-danger" ng-show="form.email.$invalid && form.email.$touched">Invalid email address.</span></div><div class=col-half-width><i class="icons8-call form-control-feedback feedback-left" aria-hidden=true></i> <input placeholder="Recipient phone" class="form-control form-field-transparent" ng-model=formData.invoice_recipient_phone></div><div class=col-full-width><button type=submit class="btn btn-lg btn-info btn-block" data-ng-disabled=!form.$valid ng-click=submit()>Continue</button></div></div></form></div></div><a class=skip ng-click=nextStep()>Skip</a></div></div>');
    $templateCache.put("src/register/layout/nav.html", '<nav class="navbar navbar-primary" role=navigation ng-controller=NavController><div class=container><div class=navbar-header><a class=brand href=/login><img src=/assets/img/logo-sdcn.png title="Same Day Courier Network" alt="Same Day Courier Network"></a></div><div id=navbar><ul class="nav navbar-nav"><li ng-class="{ active: isActive(\'/register\') }"><a>Your Details</a></li><li ng-class="{ active: isActive(\'/register/company\') }"><a>Company</a></li><li ng-class="{ active: isActive(\'/register/invoice\') }"><a>Invoice Details</a></li><li ng-class="{ active: isActive(\'/register/documents\') }"><a>Documents</a></li></ul></div></div></nav>');
    $templateCache.put("src/register/layout/progress.html", '<div class=progress ng-controller=ProgressController>{{ init() }}<div id=status class="progress-bar progress-bar-success" role=progressbar aria-valuemin=0 aria-valuemax=100></div></div>');
    $templateCache.put("src/register/register.html", '<div ng-include="\'src/register/layout/nav.html\'" class=header-registration></div><div class="app app-register"><div data-ng-include=" \'src/register/layout/progress.html\' " class=progress-status></div><div ng-controller=RegisterController data-ui-view><div class=container><div class="register-form m-t-lg"><div class="panel panel-default"><div class="panel-body registration-success" data-ng-show=success><h2><i class=icons8-check-mark-symbol></i> Your registration was successful</h2><p class=m-t-md>Please check your registered email address and click on the link in the email we have just sent you to verify your account. You will be able to choose a password and complete the registration process.</p><p class=m-t-md>The verification email will be sent from noreply@samedaycouriernetwork.com</p><p class=m-t-md>If you do not receive the email please check for it in your Junk/Spam folders in your email client.</p><p class=m-t-md>If you still cannot find it then you can email us for support at <a href=mailto:info@samedaycouriernetwork.com>info@samedaycouriernetwork.com</a> or call us on <a href=tel:01202511559>01202 511 559</a></p></div><div class=panel-body data-ng-show=!success><h2>Your Details</h2><div class="alert alert-danger" data-ng-show=errors><p ng-repeat="(key, error) in errors">*{{ error }}</p></div><form name=form class=m-t-md><div class=row><div class=col-half-width><i class="icons8-user form-control-feedback feedback-left" aria-hidden=true></i> <input placeholder="First name" class="form-control form-field-transparent" data-ng-model=formData.first_name required></div><div class=col-half-width><i class="icons8-user form-control-feedback feedback-left" aria-hidden=true></i> <input placeholder="Last name" class="form-control form-field-transparent" data-ng-model=formData.last_name required></div><div class=col-half-width><i class="icons8-email-envelope form-control-feedback feedback-left" aria-hidden=true></i> <input type=email placeholder="Email address" class="form-control form-field-transparent" data-ng-model=formData.email name=email required> <span class="label label-danger" ng-show="form.email.$invalid && form.email.$touched">Invalid email address.</span></div><div class=col-half-width><i class="icons8-call form-control-feedback feedback-left" aria-hidden=true></i> <input placeholder="Phone number" class="form-control form-field-transparent" data-ng-model=formData.phone required></div><div class=col-full-width><label class="form-checkbox m-t-lg">I agree that I am happy to be contacted by Same Day Courier Network and selected partners <input type=checkbox data-ng-model=formData.subscribe> <span class=checkmark></span></label></div><div class=col-full-width><label class="form-checkbox m-t-md">I Confirm that I have read and agree to the terms & conditions, and that I am over 18 years of age <input type=checkbox data-ng-model=formData.agreeTermsConditions required> <span class=checkmark></span></label></div></div></form></div></div><div class="panel panel-default block-2" data-ng-show=!success><div class=panel-body><p class="m-t-sm m-b-md">SDCN is a subscription based transport trading exchange platform. Membership is just £10 per month including VAT for full access and unlimited use. The SDCN team will be in contact to set up payment schedule upon completion of registration</p><button type=submit class="btn btn-lg btn-info btn-block" ng-click=register() data-ng-disabled=!form.$valid>Sign in</button><div><p class=m-t-md>Already have an account? <a data-ui-sref=login>Sign in</a></p></div></div></div></div></div></div></div>');
    $templateCache.put("src/register/success/success.html", '<div class=registration-success ng-controller=SuccessController ui-view><div class=container><div class="register-form m-t-lg"><div class="panel panel-default"><div class=panel-body><h2><i class=icons8-check-mark-symbol></i> Registration Complete!</h2><p class=m-t-lg>Thank you for registering with the Same Day Courier Network.</p><p class=m-t-md>We will review your account shortly to ensure you have provided all the necessary details & documents required.</p><p class=m-t-md>A member of the Same Day Courier Team will be in contact once your account has been approved to set up your subscription.</p><p class=m-t-md>Many thanks,<br>The SDCN Team</p></div></div></div></div><footer class=content-info role=contentinfo><div class=container><div class=row><div class="col-sm-7 col-sm-push-5"><nav class=footer-nav role=navigation><ul id=menu-footer-navigation class=nav><li class=menu-terms><a title=Terms href="https://samedaycouriernetwork.com/terms/">Terms &nbsp;&nbsp;|</a></li><li class=menu-code-of-conduct><a href="https://samedaycouriernetwork.com/code-of-conduct/">Code Of Conduct &nbsp;&nbsp;|</a></li><li class=menu-privacy><a title=Privacy href="https://samedaycouriernetwork.com/privacy/">Privacy &nbsp;&nbsp;|</a></li><li class=menu-support><a title=FAQs href="https://samedaycouriernetwork.com/support/">Support &nbsp;&nbsp;|</a></li><li class=menu-api><a href="https://samedaycouriernetwork.com/api-documentation/">Api</a></li></ul></nav></div><div class="col-sm-5 col-sm-pull-7"><p class=copy>{{ getYear() }} Same Day Courier Network Ltd. All rights reserved.</p></div></div></div></footer></div>\x3c!-- Event snippet for Registration conversion page --\x3e<script>gtag(\'event\', \'conversion\', {\'send_to\': \'AW-835772786/VUEsCO6b_YoBEPLCw44D\'});<\/script>');
    $templateCache.put("src/theme/modals/confirm-delete.html", '<div class=modal-header><h3 class=modal-title>Confirm Deletion</h3></div><div class=modal-body><p>Are you sure you want to permanently delete this item?</p></div><div class=modal-footer><button class="btn btn-primary" type=button ng-click=ok()>OK</button> <button class="btn btn-warning" type=button ng-click=cancel()>Cancel</button></div>');
    $templateCache.put("src/theme/modals/confirm-modal.html", '<div class=modal-header><h3 class=modal-title>Confirm</h3></div><div class=modal-body><p>Are you sure you want to do this?</p></div><div class=modal-footer><button class="btn btn-primary" type=button ng-click=ok()>OK</button> <button class="btn btn-warning" type=button ng-click=cancel()>Cancel</button></div>');
    $templateCache.put("src/user/account/feedback/add/add.html", '<div class=modal-header><h3 class="modal-title pull-left">Leave feedback</h3><div class=pull-right><button class="btn btn-default btn-sm" data-ng-click=$dismiss()>Cancel</button></div><div class=clearfix></div></div><form class="form form-horizontal" name=form><div class="modal-body job-feedback"><div class=form-group><div class=rating><label class="col-sm-2 control-label font-bold">Your rating:</label><div class=col-sm-10><rating class=rating ng-model=feedback.rating max=5 state-on="\'glyphicon glyphicon-star text-info\'" state-off="\'glyphicon glyphicon-star-empty text-info\'" required></rating></div></div></div><div class=form-group><label class="col-sm-2 control-label font-bold">Your comment:</label><div class=col-sm-10><textarea class=form-control name=comment ng-model=feedback.comment placeholder="Your comment" required></textarea></div></div></div><div class="modal-footer text-right"><button class="btn btn-primary" ng-click=create() data-ng-disabled="form.$invalid || formSubmitted"><span data-ng-show=!formSubmitted>Submit feedback</span> <span data-ng-show=formSubmitted><i class="fa fa-spin fa-circle-o-notch"></i> Submit feedback</span></button></div></form>');
    $templateCache.put("src/user/account/feedback/feedback.html", '<div class="row row-offcanvas row-offcanvas-right"><div class="content col-sm-8"><div class="panel panel-default"><div class="panel-heading buttons"><h3 class=panel-title>My Feedback<div class=panel-heading-buttons><button class="btn btn-default btn-xs btn-offcanvas-toggle" offcanvas-toggle><i class="fa fa-ellipsis-v"></i></button></div></h3></div><div class="panel-body no-padder-v no-padder-h"><div sdcn-loader size=lg data-ng-show=loading></div><div class=not-found data-ng-show="!tableParams.total() && !loading"><h1>0</h1><div class=text>No feedback matching your criteria.</div></div><div class="streamline b-l b-default m-l-lg m-b padder-v" data-ng-show=tableParams.total()><table class=table data-ng-table=tableParams template-pagination=src/user/layout/elements/tfoot.html><tbody><tr data-ng-repeat="data in $data" data-ng-include="\'src/user/layout/elements/feedback.html\'"></tr></tbody></table></div></div></div></div><aside class="sidebar col-sm-4 sidebar-offcanvas" role=complementary><div class="widget widget-account" data-ng-controller=LoginController data-ng-include="\'src/user/layout/widgets/account.html\'"></div></aside></div>');
    $templateCache.put("src/user/account/jobs/bids/bids.html", '<div class=modal-header><h3 class="modal-title pull-left">Bids for Job #{{job.id}}</h3><div class=pull-right><button class="btn btn-secondary btn-sm" data-ng-click=tableParams.reload()><i class=icon-refresh></i> Refresh</button> <button class="btn btn-primary btn-sm" data-ng-click=$dismiss()>Close</button></div></div><div class="modal-body no-padder-h"><div sdcn-loader size=lg data-ng-show=loading></div><div class=not-found data-ng-show="!tableParams.total() && !loading"><h1>0</h1><div class=text>No bids received yet.</div></div><div class=table-responsive data-ng-show="tableParams.total() && !loading"><table class="table table-striped b-t b-light" data-ng-table=tableParams template-pagination=src/user/layout/elements/tfoot.html><tbody><tr class="odd gradeX" data-ng-repeat="data in $data" data-ng-class="{\'success\': data.is_accepted}"><td><section class="row bid-card"><div class="col-md-2 hidden-sm hidden-xs"><img class=pull-right data-ng-src="{{ data.user.avatar_url }}" height=96></div><div class="col-md-2 col-md-push-8 date">{{ data.bid_date | amDateFormat:\'DD/MM/YYYY HH:mm\' }}</div><div class="col-md-8 col-md-pull-2"><h2>{{ data.user.team_info.company_name }}</h2><rating class="rating read-only" ng-model=data.user.team_info.score max=5 state-on="\'glyphicon glyphicon-star text-info\'" state-off="\'glyphicon glyphicon-star-empty text-info\'" data-readonly=true></rating><small class=text-muted>({{ data.user.team_info.score }} from {{ data.user.team_info.ratings_count }} reviews)</small><h5><b>Contact:</b> {{ data.user.name_full }}</h5><button class="btn btn-primary btn-xs btn-warning hidden-md hidden-lg" aria-expanded=false aria-controls=collapseExample role=button data-toggle=collapse data-target=#bidDetails_{{$index}} data-ng-click="data.isCollapsed = true" data-ng-show=!data.isCollapsed data-ng-if=data.details>Details</button> <button type=button class="btn btn-primary btn-xs btn-primary hidden-md hidden-lg ng-hide" data-toggle=collapse data-target=#bidDetails_{{$index}} ng-click="data.isCollapsed = false" data-ng-show=data.isCollapsed data-ng-if=data.details>Close</button><div class="bid_details collapse hidden-md hidden-lg" id=bidDetails_{{$index}} data-ng-if=data.details><div class=panel-body><div class=arrow></div><b>Bid notes</b><br><div>{{ data.details }}</div></div></div><div class="bid_details hidden-sm hidden-xs" data-ng-if=data.details><b>Bid notes</b><br><div class="well m-b-xs">{{ data.details }}</div></div></div><footer><div class="col-md-8 col-md-offset-2 col-xs-6 col-xs-offset-0"><h5><i class="fa fa-phone"></i> {{ data.user.phone }}</h5><h5><i class="fa fa-envelope"></i> {{ data.user.email }}</h5><a class="btn btn-primary btn-sm" data-ng-if="job.status === \'active\'" data-ng-click=$dismiss() data-ui-sref=".bids.feedback({ job_id: job_id, team_id: data.user.team_info.id })">Feedback</a></div><div class="col-md-2 col-xs-6 price-tag"><h2>{{ data.amount | currency:"&pound":2 }}</h2><a class="btn btn-success btn-sm" data-ng-if="job.status === \'active\'" data-ng-click=$dismiss() data-ui-sref=".bids.confirm({job_id: job_id, bid_id: data.id})">Accept Bid</a></div></footer></section></td></tr></tbody></table></div></div>');
    $templateCache.put("src/user/account/jobs/bids/confirm/confirm.html", '<div class=modal-header><h3 class="modal-title pull-left">Accept bid</h3><div class=pull-right><button class="btn btn-primary btn-sm" data-ui-sref=".bids({job_id: job.id})" data-ng-click=$dismiss()>Close</button></div><div class=clearfix></div></div><div class=modal-body><form class=form-horizontal><h4 class=page-header>Job Details</h4><div class=form-group><label class="col-sm-2 control-label font-bold">Job ID:</label><div class=col-sm-10><p class=form-control-static>{{job.id}}</p></div></div><div class=form-group><label class="col-sm-2 control-label font-bold">Pickup Point:</label><div class=col-sm-10><p class=form-control-static>{{job.pickup_point}}</p></div></div><div class=form-group><label class="col-sm-2 control-label font-bold">Destination Point:</label><div class=col-sm-10><p class=form-control-static>{{job.destination_point}}</p></div></div><h4 class=page-header>Bid Details</h4><div class=form-group><label class="col-sm-2 control-label font-bold">Amount:</label><div class=col-sm-10><p class=form-control-static>{{bid.amount | currency:\'£\'}} <span data-ng-if=bid.add_vat>+ VAT</span></p></div></div><div class=form-group><label class="col-sm-2 control-label font-bold">Driver name:</label><div class=col-sm-10><p class=form-control-static>{{bid.user.team_info.company_name}}</p></div></div><div class=form-group data-ng-if=bid.user.email><label class="col-sm-2 control-label font-bold">Driver email:</label><div class=col-sm-10><p class=form-control-static>{{bid.user.email}}</p></div></div><div class=form-group data-ng-if=bid.user.phone><label class="col-sm-2 control-label font-bold">Driver phone:</label><div class=col-sm-10><p class=form-control-static>{{bid.user.phone}}</p></div></div><div class=form-group data-ng-if=bid.details><label class="col-sm-2 control-label font-bold">Notes:</label><div class=col-sm-10><p class=form-control-static>{{bid.details}}</p></div></div><div class=form-group><label class="col-sm-2 control-label font-bold">Details</label><div class=col-sm-10><textarea class=form-control data-ng-model=details placeholder=Details></textarea></div></div><div class=form-group><div class="col-sm-offset-2 col-sm-10"><div class="checkbox checkbox-success"><label><input type=checkbox data-ng-model="confirm"> Confirm bid <i></i></label></div></div></div></form></div><div class="modal-footer text-right"><button type=button class="btn btn-lg btn-success" ng-click=confirmBid() ng-disabled="!confirm || formSubmitted"><span data-ng-show=!formSubmitted>Confirm Bid</span> <span data-ng-show=formSubmitted><i class="fa fa-spin fa-circle-o-notch"></i> Confirm Bid</span></button></div>');
    $templateCache.put("src/user/account/jobs/bids/feedback/feedback.html", '<div class=modal-header><h3 class=modal-title style="display: inline">{{ team.company_name }}</h3><div class=pull-right><button class="btn btn-primary btn-sm" ui-sref=".bids({job_id: job_id})" ng-click=$dismiss()>Back to Bids</button> <button class="btn btn-primary btn-sm" data-ng-click=$dismiss()>Close</button></div></div><div class=modal-body><div class="panel-body no-padder-v no-padder-h"><div class=row><div class=col-sm-10><h3 class="headline-light m-t-none m-b-lg">Feedback</h3></div><div class=col-sm-2><div class="pull-right text-right" style="padding-right: 1rem"><h2>{{ bid.amount | currency:"&pound":2 }}</h2><a class="btn btn-success btn-sm" data-ng-if="job.status === \'active\'" data-ng-click=$dismiss() data-ui-sref=".bids.confirm({job_id: job.id, bid_id: bid.id})">Accept Bid</a></div></div></div><div sdcn-loader size=lg data-ng-show=loading></div><div class=not-found ng-if="!tableParams.total() && !loading"><h1>0</h1><div class=text>Member has received no feedback yet.</div></div><div class="streamline b-l b-default m-l-lg m-b padder-v" data-ng-show="tableParams.total() && ! loading"><table class=table data-ng-table=tableParams template-pagination=src/user/layout/elements/tfoot.html><tbody><tr ng-repeat="data in $data" ng-include="\'src/user/layout/elements/feedback.html\'"></tr></tbody></table></div></div></div>');
    $templateCache.put("src/user/account/jobs/cancel/cancel.html", '<div class=modal-header><h3 class=modal-title>Cancel Job <button class="btn btn-primary btn-sm" data-ng-click=$dismiss()>Close</button></h3></div><div class=modal-body><form class=form-horizontal role=form name=form><div class=form-group><label class="col-sm-2 control-label font-bold">Job ID:</label><div class=col-sm-10><p class=form-control-static>#{{job.id}}</p></div></div><div class=form-group><label class="col-sm-2 control-label font-bold">Pickup Point:</label><div class=col-sm-10><p class=form-control-static>{{job.pickup_point}}</p></div></div><div class=form-group><label class="col-sm-2 control-label font-bold">Destination Point:</label><div class=col-sm-10><p class=form-control-static>{{job.destination_point}}</p></div></div><div class=form-group><div class="col-sm-offset-2 col-sm-10"><div class="checkbox checkbox-danger"><label><input type=checkbox data-ng-model="confirm"> Cancel job <i></i></label></div></div></div></form></div><div class="modal-footer text-right"><button type=button class="btn btn-lg btn-danger" data-ng-click=cancelJob() ng-disabled="!confirm || formSubmitted"><span data-ng-show=!formSubmitted>Cancel Job</span> <span data-ng-show=formSubmitted><i class="fa fa-spin fa-circle-o-notch"></i> Cancel Job</span></button></div>');
    $templateCache.put("src/user/account/jobs/feedback/feedback.html", '<div class=modal-header><h3 class="modal-title pull-left">Feedback</h3><div class=pull-right><button class="btn btn-primary btn-sm" data-ng-click=$dismiss()>Close</button></div><div class=clearfix></div></div><div class=modal-body><div sdcn-loader size=lg data-ng-show=loading></div><div class="streamline b-l b-default m-l-lg m-b padder-v" data-ng-show=!loading><div><div class="pull-left thumb-sm avatar m-l-n-md"><img data-ng-src={{data.user_info.avatar_url}} alt={{data.user_info.name_full}}></div><div class="m-l-lg m-b-lg panel b-a bg-light"><div class="panel-heading pos-rlt b-b"><span class="arrow arrow-light left"></span> <small class=text-muted data-ng-if="data.team_id == $auth.user().team_info.id">Feedback you left:</small> <small class=text-muted data-ng-if="data.team_id != $auth.user().team_info.id">Feedback you received:</small> <span class="text-muted m-l-sm pull-right" data-ng-if=data.bid.feedback><small class=text-muted>{{data.bid.feedback.created_at | amDateFormat:\'DD/MM/YYYY HH:mm\'}}</small></span></div><div class=panel-body data-ng-if=!data.bid.feedback><i>Waiting for {{data.user_info.name_first}} to leave feedback.</i></div><div class=panel-body data-ng-if=data.bid.feedback><div class=m-b><i>“{{data.bid.feedback.comment}}”</i></div><rating class="rating read-only" ng-model=data.bid.feedback.rating max=5 state-on="\'glyphicon glyphicon-star text-info\'" state-off="\'glyphicon glyphicon-star-empty text-info\'" data-readonly=true></rating><small class=text-muted>- {{data.user_info.name_full}} ({{data.user_info.team_info.company_name}})</small></div></div></div><div><a class="pull-left thumb-sm avatar m-l-n-md"><img data-ng-src={{data.bid.user.avatar_url}} alt={{data.bid.user.name_full}}></a><div class="m-l-lg m-b-none panel b-a bg-light"><div class="panel-heading pos-rlt b-b"><span class="arrow arrow-light left"></span> <small class=text-muted data-ng-if="data.team_id != $auth.user().team_info.id">Feedback you left:</small> <small class=text-muted data-ng-if="data.team_id == $auth.user().team_info.id">Feedback you received:</small> <span class="text-muted m-l-sm pull-right" data-ng-if=data.feedback><small class=text-muted>{{data.feedback.created_at | amDateFormat:\'DD/MM/YYYY HH:mm\'}}</small></span></div><div class=panel-body data-ng-if=!data.feedback><i>Waiting for {{data.bid.user.name_first}} to leave feedback.</i></div><div class=panel-body data-ng-if=data.feedback><div class=m-b><i>“{{data.feedback.comment}}”</i></div><rating class="rating read-only" ng-model=data.feedback.rating max=5 state-on="\'glyphicon glyphicon-star text-info\'" state-off="\'glyphicon glyphicon-star-empty text-info\'" data-readonly=true></rating><small class=text-muted>- {{data.bid.user.name_full}} ({{data.bid.user.team_info.company_name}})</small></div></div></div></div></div>');
    $templateCache.put("src/user/account/jobs/invoice/invoice.html", '<div class=modal-header><h3 class="modal-title pull-left">Invoice <span data-ng-if=!data.manual>#{{data.invoice_number}}</span> <span data-ng-if=data.external_number>(#{{data.external_number}})</span></h3><div class=pull-right><button class="btn btn-primary btn-sm" data-ng-click=$dismiss()>Close</button></div><div class=clearfix></div></div><div class=modal-body><div sdcn-loader size=lg data-ng-show=loading></div><div class="manual invoice" data-ng-if="data.manual && !loading"><div class="alert alert-warning">The driver sent the invoice for this job manually. Details of the job are below, but may not exactly reflect the invoice you receive.</div></div><div class=system-invoice><div class=page-header data-ng-if="!data.manual && !loading"><h1>Invoice</h1></div><div class="invoice-details row m-b" data-ng-if="!data.manual && !loading"><div class="col-xs-3 invoice-to"><h3 class=m-t-none>Invoice to:</h3><h4>{{ data.to_company }}</h4><p class=m-b-none>{{ data.to_address_line_1 }}</p><p class=m-b-none>{{ data.to_address_line_2 }}</p><p class=m-b-none>{{ data.to_town }}</p><p class=m-b-none>{{ data.to_county }}</p><p class=m-b-none>{{ data.to_postal_code }}</p></div><div class="col-xs-6 main-details"><div class="well well-sm"><p class=m-b-none><b>SDCN Invoice Number:</b> {{ data.invoice_number }}</p><p class=m-b-none><b>Invoice Date:</b> {{ data.invoice_date }}</p><p class=m-b-none><b>SDCN Reference:</b> #{{ data.job_id }}</p><p class=m-b-none><b>Customer Invoice Number:</b> #{{ data.external_number }}</p><p class=m-b-none><b>Customer Job Number:</b> #{{ data.customer_job_reference_number }}</p></div></div><div class="col-xs-3 text-right"><td class=invoice-issuer><figure class="invoice-logo invoice-logo-inline-block" data-ng-show=data.from_logo><img data-ng-src="{{data.from_logo}}"></figure><h4>{{ data.from_company }}</h4><p class=m-b-none>{{ data.from_address_line_1 }}</p><p class=m-b-none>{{ data.from_address_line_2 }}</p><p class=m-b-none>{{ data.from_town }}</p><p class=m-b-none>{{ data.from_county }}</p><p class=m-b-none>{{ data.from_postal_code }}</p><p class=m-b-none style="word-wrap: break-word">{{ data.from_email }}</p><p class=m-b-none>{{ data.from_phone }}</p></td></div></div><div class="invoice-items m-b" data-ng-show=!loading><table class="table table-striped"><thead><tr><th>Qty</th><th>Description</th><th>Unit cost (£)</th><th>VAT (£)</th><th>Total (£)</th></tr></thead><tbody><tr><td>1</td><td><div>SDCN Job ID: #{{data.job_id}}</div><small><i>(From: {{data.pickup_point}}, To: {{data.destination_point}})</i></small><div data-ng-show=data.job.details>Notes: {{data.job.details}}</div><div data-ng-show=!data.job.details>No notes available.</div></td><td>{{data.amount}}</td><td>{{data.amount_vat}}</td><td>{{data.amount_total}}</td></tr><tr data-ng-repeat="item in data.invoice_items"><td>1</td><td>{{item.item}}</td><td>{{item.amount}}</td><td>{{item.vat_amount}}</td><td>{{item.total}}</td></tr></tbody></table></div><div class="invoice-totals m-b" data-ng-show=!loading><div class=row><div class="col-xs-5 col-xs-offset-7"><table class="table table-striped"><tbody><tr><th>Subtotal (ex VAT):</th><td>£{{data.sub_total}}</td></tr><tr><th>Total VAT:</th><td>£{{data.vat_amount}}</td></tr><tr><th>Total:</th><td>£{{data.total}}</td></tr></tbody></table></div></div></div><div class="notes m-t m-b" data-ng-show=data.notes data-ng-if="!data.manual && !loading"><h4>Notes:</h4><div class="well well-sm">{{data.notes}}</div></div><div class=invoice-footer><i>{{data.invoice_footer}}</i></div><div class="invoice-footer m-b" data-ng-show=data.footer_text data-ng-if="!data.manual && !loading"><i ng-bind-html=data.footer_text></i></div><hr data-ng-if="!data.manual && !loading"><div class=text-center data-ng-if="!data.manual && !loading"><p data-ng-show=data.vat_number><small class=text-center>VAT: {{data.vat_number}}</small></p><small class=text-center>Sameday Courier Network {{date | date:\'yyyy\'}}</small></div></div></div><div class="modal-footer text-right" data-ng-if=!data.manual><a class="btn btn-lg btn-success" target=_blank href=/download/invoices/{{data.id}} title="Download PDF" role=button>Download PDF</a></div>');
    $templateCache.put("src/user/account/jobs/jobs.html", '<div class="row browse row-offcanvas row-offcanvas-right"><div class="content col-sm-8"><div class="panel panel-default"><div class="panel-heading buttons"><h3 class=panel-title>Jobs Posted<div class=panel-heading-buttons><button class="btn btn-default btn-xs" data-ng-click=tableParams.reload()><i class=icon-refresh></i> <span class=hidden-xs>Refresh</span></button> <button class="btn btn-default btn-xs btn-offcanvas-toggle" offcanvas-toggle><i class="fa fa-ellipsis-v"></i></button></div></h3></div><div class="panel-body no-padder-v no-padder-h"><div sdcn-loader size=lg data-ng-show=loading></div><div class=not-found data-ng-show="!tableParams.total() && !loading"><h1>0</h1><div class=text>No jobs matching your criteria.</div></div><div class="job-list job-list-md" data-ng-show=tableParams.total()><table class=table data-ng-table=tableParams template-header=src/user/layout/elements/thead.html template-pagination=src/user/layout/elements/tfoot.html><tbody><tr data-ng-repeat="data in $data" data-ng-init="isCollapsed = true" data-ng-include="\'src/user/layout/elements/job-account.html\'"></tr></tbody></table></div></div></div></div><aside class="sidebar col-sm-4 sidebar-offcanvas" role=complementary><div class="widget widget-account" data-ng-include="\'src/user/layout/widgets/account.html\'"></div></aside></div>');
    $templateCache.put("src/user/account/jobs/manual/manual.html", '<div class=modal-header><h3 class=modal-title>Allocate Manual<div class=pull-right><button class="btn btn-primary btn-sm" data-ng-click=$dismiss()>Close</button></div></h3></div><form class=form-horizontal role=form name=form><div class=modal-body><div class=form-group><label class="col-sm-2 control-label font-bold">Job ID:</label><div class=col-sm-10><p class=form-control-static>#{{job.id}}</p></div></div><div class=form-group><label class="col-sm-2 control-label font-bold">Pickup Point:</label><div class=col-sm-10><p class=form-control-static>{{job.pickup_point}}</p></div></div><div class=form-group><label class="col-sm-2 control-label font-bold">Destination Point:</label><div class=col-sm-10><p class=form-control-static>{{job.destination_point}}</p></div></div><div class=form-group ng-class="{\n' + "        'has-error': form.amount.$error.number,\n" + "        'has-success': form.amount.$valid,\n" + "        'has-feedback': form.amount.$valid || form.amount.$error.number,\n" + '    }"><label class="col-sm-2 control-label font-bold" for=amount>Amount:</label><div class=col-sm-4><div class=input-group><span class=input-group-addon id=currency>£</span> <input type=number name=amount id=amount class=form-control data-ng-model=job.bid_amount min=0 aria-describedby=currency placeholder=0 required></div><span class="fa fa-check-circle form-control-feedback" aria-hidden=true data-ng-if=form.amount.$valid></span> <span class="fa fa-times-circle form-control-feedback" aria-hidden=true data-ng-if=form.amount.$error.number></span> <span class="label label-danger" data-ng-if=form.amount.$error.number>Numbers Only!</span></div></div><div class=form-group data-ng-class="{\'has-feedback\': loadingUsers}"><label class="col-sm-2 control-label font-bold">Driver:</label><div class="col-sm-4 autocomplete"><input ng-model=selectedUser placeholder="Type name or email" typeahead="user as user.name_full for user in getUsers($viewValue) | filter:{name_full:$viewValue}" typeahead-loading=loadingUsers typeahead-template-url=src/user/layout/elements/user-autocomplete.html typeahead-wait-ms=300 typeahead-on-select="setUserId($item, $model, $label)" class=form-control> <span class=form-control-feedback aria-hidden=true data-ng-show=loadingUsers><i class="fa fa-spin fa-circle-o-notch"></i></span></div></div><div class=form-group><label class="col-sm-2 control-label font-bold">Details</label><div class=col-sm-10><textarea class=form-control data-ng-model=job.bid_details placeholder=Details></textarea></div></div><div class=form-group><div class="col-sm-offset-2 col-sm-10"><div class="checkbox checkbox-primary"><label><input type=checkbox data-ng-model="confirm"> Allocate job <i></i></label></div></div></div></div><div class="modal-footer text-right"><button type=button class="btn btn-lg btn-primary" ng-click=store() ng-disabled="form.$invalid || !confirm || !job.bid_user_id || loading || formSubmitted"><span data-ng-show=!formSubmitted>Allocate Job</span> <span data-ng-show=formSubmitted><i class="fa fa-spin fa-circle-o-notch"></i> Allocate Job</span></button></div></form>');
    $templateCache.put("src/user/account/jobs/notes/notes.html", '<div class=modal-wrapper><div class=modal-header><h3 class="modal-title pull-left">Job Notes</h3><div class=pull-right><button class="btn btn-default btn-sm" data-ng-click=$dismiss()>Cancel</button></div></div><div class=modal-body><div sdcn-loader size=lg data-ng-show=loading></div><p class=m-b-md>{{ notes }}</p></div><div class=modal-header><h3 class=modal-title>Job Details</h3></div><div class=modal-body><div sdcn-loader size=lg data-ng-show=loading></div><p class=m-b-md>{{ bid_details }}</p></div></div>');
    $templateCache.put("src/user/account/jobs/pod/pod.html", '<div class=modal-header><h3 class="modal-title pull-left">View POD</h3><div class=pull-right><button class="btn btn-primary btn-sm" data-ng-click=$dismiss()>Close</button></div><div class=clearfix></div></div><form class="form form-horizontal" role=form name=form><div class=modal-body><h4 class=page-header>POD Details</h4><div class=form-group><label class="col-sm-2 control-label font-bold">Recipient:</label><div class=col-sm-10><p class=form-control-static>{{pod.recipient}}</p></div></div><div class=form-group><label class="col-sm-2 control-label font-bold">Delivery Date:</label><div class=col-sm-10><p class=form-control-static>{{pod.delivery_date}}</p></div></div><div class=form-group data-ng-show=pod.no_pod_reason><label class="col-sm-2 control-label font-bold">Missing file reason:</label><div class=col-sm-10><p class=form-control-static>{{pod.no_pod_reason}}</p></div></div></div><div class="modal-footer text-right" data-ng-show=pod.upload><a class="btn btn-lg btn-primary" href={{pod.upload}} download="{{pod.upload | split:\'/\':\'last\'}}" target=_self data-ng-click=$dismiss()>Download POD</a></div></form>');
    $templateCache.put("src/user/account/profile/avatar/avatar.html", '<div class=modal-header><h3 class="modal-title pull-left">Upload Profile Picture</h3><div class=pull-right><button class="btn btn-default btn-sm" data-ng-click=$dismiss()>Cancel</button></div><div class=clearfix></div></div><form class="form form-horizontal" role=form name=form><div class=modal-body><div class=form-group data-ng-show=!noFile><label class="col-sm-2 control-label font-bold">Select An Image:</label><div class=col-sm-10><span class="btn btn-secondary btn-file"><span>Select image from your computer</span> <input type=file class=form-control id=avatar-upload name=avatar-upload data-ng-model=upload nv-file-select="" uploader=uploader valid-file required></span></div></div><div class=form-group data-ng-show=status><label class="col-sm-2 control-label font-bold">Selected Image:</label><div class=col-sm-10><div class=avatar-image-crop-wrap><div class=loading data-ng-show="status == \'loading\'"><h2 class="text-center text-dark">Loading ...</h2></div><div class=avatar-image-crop-content><img-crop image=myImage result-image-size=150 result-image=myCroppedImage></img-crop></div></div></div></div><div class=form-group data-ng-show="status == \'loaded\'"><label class="col-sm-2 control-label font-bold">Your Profile Picture:</label><div class=col-sm-10><div class=avatar-holder><img ng-src="{{myCroppedImage}}"></div></div></div><div class=form-group data-ng-show=progress><label class="col-sm-2 control-label font-bold">Progress:</label><div class=col-sm-10><p class=form-control-static><progressbar value=progress class="progress-xs m-t" type=info ng-show=progress></progressbar></p></div></div></div><div class="modal-footer text-right"><button type=button class="btn btn-lg btn-primary" ng-click=store() ng-disabled=form.$invalid>Save</button></div></form>');
    $templateCache.put("src/user/account/profile/documents/add/add.html", '<div class=modal-header><h3 class="modal-title pull-left">Upload Document</h3><div class=pull-right><button class="btn btn-default btn-sm" data-ng-click=$dismiss()>Cancel</button></div><div class=clearfix></div></div><form class="form form-horizontal" role=form name=form><div class=modal-body><div class=form-group><label class="col-sm-2 control-label font-bold">Type:</label><div class=col-sm-10><ui-select ng-model=data.selected_type on-select="data.type_id = data.selected_type.id" theme=bootstrap data-search-enabled=false style=width:100%><ui-select-match allow-clear=true placeholder="Select the document type">{{$select.selected.name}}</ui-select-match><ui-select-choices repeat="value as value in doctypes"><div ng-bind-html=value.name></div></ui-select-choices></ui-select></div></div><div class=form-group ng-if=data.selected_type.expiry_required><label class="col-sm-2 control-label font-bold">Expiry Date:</label><div class=col-sm-10><i-dtp ng-model=data.expiry icon=calendar placeholder="Expiration Date" min-date=minDate ng-required="data.selected_type.expiry_required"></div></div><div class=form-group ng-if=data.selected_type.amount_required><label class="col-sm-2 control-label font-bold">Amount Insured:</label><div class=col-sm-10><div class=input-group><span class=input-group-btn><button type=button class="btn btn-default" ng-click=clickToggle($event)><i class="fa fa-gbp"></i></button></span> <input ng-model=data.insured_amount class=form-control ng-required=data.selected_type.amount_required placeholder="Insured amount in pounds, eg. 10000"></div></div></div><div class=form-group data-ng-if=!noFile><label class="col-sm-2 control-label font-bold">Select Document:</label><div class=col-sm-10><div class=form-control-static><div class="btn btn-secondary btn-file"><span>Select file from your computer</span> <input type=file class=form-control id=doc-upload name=doc-upload data-ng-model=upload nv-file-select="" uploader=uploader valid-file required></div></div></div></div><div class=form-group data-ng-show=file><label class="col-sm-2 control-label font-bold">Selected file:</label><div class=col-sm-10><p class=form-control-static>{{file.name}} - {{file.size | bytes}}</p></div></div><div class=form-group data-ng-show=progress><label class="col-sm-2 control-label font-bold">Progress:</label><div class=col-sm-10><p class=form-control-static><progressbar value=progress class=progress-xs type=info ng-show=progress></progressbar></p></div></div></div><div class="modal-footer text-right"><button type=button class="btn btn-lg btn-secondary" ng-click=store() ng-disabled="form.$invalid || formSubmitted"><span data-ng-show=!formSubmitted>Upload Document</span> <span data-ng-show=formSubmitted><i class="fa fa-spin fa-circle-o-notch"></i> Upload Document</span></button></div></form>');
    $templateCache.put("src/user/account/profile/documents/documents.html", '<div class="panel-heading buttons"><h3 class=panel-title>{{$state.current.page.title}}<div class=panel-heading-buttons><button class="btn btn-default btn-xs btn-offcanvas-toggle" offcanvas-toggle><i class="fa fa-ellipsis-v"></i></button></div></h3></div><div class=panel-body><div class="text-right m-b"><a class="btn btn-secondary" href data-ui-sref=".add({user_id: user_id})"><span class="fa fa-plus"></span> Add Document</a></div><div class=panel-row><table class="table table-striped b-t b-light text-left" data-ng-table=tableParams template-pagination=src/user/layout/elements/tfoot.html><tbody><tr class="odd gradeX" data-ng-repeat="data in $data" data-ng-class="{\'success\': data.status == \'approved\'}"><form name=document{{document.id}}><td data-title="\'Type\'">{{data.type.name}}</td><td class=text-u-f data-title="\'Status\'">{{data.status}}</td></form></tr></tbody></table></div></div>');
    $templateCache.put("src/user/account/profile/locations/edit/edit.html", '<div class=modal-header><h3 class="modal-title pull-left">{{mode}} location</h3><div class=pull-right><button class="btn btn-default btn-sm" data-ng-click=$dismiss(true)>Cancel</button></div><div class=clearfix></div></div><form class="form form-horizontal" role=form name=form><div class=modal-body><div class=form-group><label class="col-sm-3 control-label font-bold">Location:</label><div class=col-sm-9><input class=form-control placeholder=Location details=details ng-model=data.location lng=data.longitude lat=data.latitude googleplace required></div></div><div class=form-group><label class="col-sm-3 control-label font-bold">Accept job within:</label><div class=col-sm-9><ui-select ng-model=data.miles theme=bootstrap data-search-enabled=false style="width: 100%"><ui-select-match allow-clear=false placeholder="Select miles...">{{$select.selected.name}}</ui-select-match><ui-select-choices repeat="value.id as value in miles"><div ng-bind-html=value.name></div></ui-select-choices></ui-select></div></div><div class=form-group><label class="col-sm-3 control-label font-bold">Map preview:</label><div class=col-sm-9><div class="map map-md map-full m-t"><ui-gmap-google-map id=map-canvas center=map.center zoom=map.zoom options=map.options control=map.control fit=true><ui-gmap-marker coords="{latitude: data.latitude, longitude: data.longitude}" idkey=0 ng-if="data.latitude && data.longitude"></ui-gmap-marker><ui-gmap-circle ng-repeat="c in map.circles" center=c.center fill="{color: \'#063f60\', opacity: 0.3}" stroke="{color: \'#063f60\', weight: 1, opacity: 1}" radius=c.radius clickable=false draggable=false editable=false visible ng-if=c.center></ui-gmap-circle></ui-gmap-google-map></div></div></div></div><div class="modal-footer text-right"><button type=button class="btn btn-lg btn-primary" data-ng-click=store() data-ng-disabled="form.$invalid || formSubmitted" data-ng-if=isAdd()><span data-ng-show=!formSubmitted>Add location</span> <span data-ng-show=formSubmitted><i class="fa fa-spin fa-circle-o-notch"></i> Add location</span></button> <button type=button class="btn btn-lg btn-primary" data-ng-click=update() data-ng-disabled="form.$invalid || formSubmitted" data-ng-if=isEdit()><span data-ng-show=!formSubmitted>Update location</span> <span data-ng-show=formSubmitted><i class="fa fa-spin fa-circle-o-notch"></i> Update location</span></button></div></form>');
    $templateCache.put("src/user/account/profile/locations/locations.html", '<div class="panel-heading buttons"><h3 class=panel-title>{{$state.current.page.title}}<div class=panel-heading-buttons><button class="btn btn-default btn-xs btn-offcanvas-toggle" offcanvas-toggle><i class="fa fa-ellipsis-v"></i></button></div></h3></div><div class=panel-body><div class="text-right m-b"><a class="btn btn-secondary" href data-ui-sref=.add><span class="fa fa-plus"></span> Add Location</a></div><div class=panel-row><table class="table table-striped b-t b-light text-left" data-ng-table=tableParams template-pagination=src/user/layout/elements/tfoot.html><tbody><tr data-ng-repeat="data in $data" data-ng-if=$data><td data-title="\'Location\'">{{data.location}}</td><td data-title="\'Accept jobs within\'">{{data.miles}} miles</td><td data-title="\'\'" class=text-right><a class="btn btn-sm btn-primary" href data-ui-sref=".edit({id: data.id})"><span class="fa fa-pencil"></span> Edit</a> <a class="btn btn-sm btn-danger" href data-ng-click=destroy(data)><span class="fa fa-trash"></span> Delete</a></td></tr></tbody></table></div></div>');
    $templateCache.put("src/user/account/profile/profile.html", '<div class="row row-offcanvas row-offcanvas-right app-profile"><div class="content col-sm-8"><form class=form name=form><div class="panel panel-default" data-ui-view><div class="panel-heading buttons"><h3 class=panel-title>{{data.name_first}}\'s {{$state.current.page.title}}<div class=panel-heading-buttons><button class="btn btn-default btn-xs btn-offcanvas-toggle" offcanvas-toggle><i class="fa fa-ellipsis-v"></i></button></div></h3></div><div class=panel-body><h4 class=page-header>Account Details:</h4><div class=row><div class="form-group col-sm-6"><label class=control-label>First Name *</label><input class=form-control placeholder="First Name *" ng-model=data.name_first required></div><div class="form-group col-sm-6"><label class=control-label>Last Name</label><input class=form-control placeholder="Last Name" ng-model="data.name_last"></div></div><div class=row><div class="form-group col-sm-6"><label class=control-label>Email *</label><input type=email class=form-control placeholder="Email *" ng-model="data.email"></div><div class="form-group col-sm-6"><label class=control-label>Phone *</label><input class=form-control placeholder="Phone *" ng-model=data.phone required></div></div><div class=form-group><div class="checkbox checkbox-secondary"><label><input type=checkbox data-ng-model="changePass"> Change my password <i></i></label></div></div><div class=row data-ng-show=changePass><div class=col-sm-6><div class=form-group ng-class="{\n' + "                                        'has-error': form.$error.minlength,\n" + "                                        'has-success': form.password.$valid,\n" + "                                        'has-feedback': form.password.$valid || form.$error.minlength\n" + '                                    }"><label class=control-label>Password:</label><input type=password placeholder=Password class=form-control data-ng-minlength=6 data-ng-model=data.password name=password data-ng-required=changePass> <span class="fa fa-check-circle form-control-feedback" aria-hidden=true data-ng-show=form.password.$valid></span> <span class="fa fa-times-circle form-control-feedback" aria-hidden=true data-ng-show=form.$error.minlength></span> <span class="label label-danger" data-ng-show=form.$error.minlength>Passwords must be a minimum of 6 characters</span></div></div><div class=col-sm-6><div class=form-group ng-class="{\n' + "                                        'has-error': form.password_confirmation.$error.matchTo,\n" + "                                        'has-success': form.password_confirmation.$valid,\n" + "                                        'has-feedback': form.password_confirmation.$valid || form.password_confirmation.$error.matchTo,\n" + '                                    }"><label class=control-label>Retype password:</label><input type=password placeholder="Retype password" class=form-control ng-model=data.password_confirmation name=password_confirmation data-ng-required=changePass data-match-to=form.password> <span class="fa fa-check-circle form-control-feedback" aria-hidden=true data-ng-show=form.password_confirmation.$valid></span> <span class="fa fa-times-circle form-control-feedback" aria-hidden=true data-ng-show=form.password_confirmation.$error.matchTo></span> <span class="label label-danger" data-ng-show=form.password_confirmation.$error.matchTo>Passwords do not match.</span></div></div></div><div class=form-group><a class="btn btn-secondary" href data-ui-sref=.avatar({user_id:data.id}) title="Add Profile Picture" role=button data-ng-show=!data.avatar>Add Profile Picture</a> <a class="btn btn-secondary" href data-ui-sref=.avatar({user_id:data.id}) title="Edit Profile Picture" role=button data-ng-show=data.avatar>Edit Profile Picture</a></div></div><footer class="panel-footer text-right"><button type=button class="btn btn-lg btn-primary" ng-click=update() ng-disabled="form.$invalid || formSubmitted"><span data-ng-show=!formSubmitted>Save</span> <span data-ng-show=formSubmitted><i class="fa fa-spin fa-circle-o-notch"></i> Save</span></button></footer></div></form></div><aside class="sidebar col-sm-4 sidebar-offcanvas" role=complementary><div class="widget widget-account" data-ng-controller=LoginController data-ng-include="\'src/user/layout/widgets/account.html\'"></div></aside></div>');
    $templateCache.put("src/user/account/profile/settings/settings.html", "<style>.ngrs-range-slider .ngrs-handle {border: 0; background: transparent; }\n" + "    .ngrs-range-slider .ngrs-handle i {border-radius: 20px; background-color: #f4a703; }\n" + '    .ngrs-range-slider .ngrs-handle-min i, .ngrs-range-slider .ngrs-handle-max i {background: #f4a703; }</style><div class="panel-heading buttons"><h3 class=panel-title>{{data.name_first}}\'s Notifications<div class=panel-heading-buttons><button class="btn btn-default btn-xs btn-offcanvas-toggle" offcanvas-toggle><i class="fa fa-ellipsis-v"></i></button></div></h3></div><div class=panel-body><h4 class=page-header>New Job Notifications</h4><div class=panel-row><div class="col-sm-12 form-group"><label class=col-sm-3>Job Vehicle</label><div class=col-sm-9><select class=form-control ng-options="setting.value as setting.label for setting in settings.vehicle_type" ng-model=data.settings.vehicle_type></select></div></div><div class="col-sm-12 form-group" ng-if="data.settings.vehicle_type === \'custom\'"><div><label class=col-sm-3>Custom Range</label></div><div class=col-sm-6><strong>From</strong> {{ vehicles[(data.settings.custom_min/100) - 1].name }} <strong>To</strong> {{ vehicles[(data.settings.custom_max/100) - 1].name }}</div><div class=col-sm-9><div range-slider min=min max=max model-min=data.settings.custom_min model-max=data.settings.custom_max step=100></div></div></div><div class="form-group col-sm-12"><label class=col-sm-3>Job Location</label><div class=col-sm-9><select class=form-control ng-options="setting.value as setting.label for setting in settings.location" ng-model=data.settings.location></select></div></div></div></div><footer class="panel-footer text-right"><button type=button class="btn btn-lg btn-primary" ng-click=update() ng-disabled="form.$invalid || formSubmitted"><span data-ng-show=!formSubmitted>Save</span> <span data-ng-show=formSubmitted><i class="fa fa-spin fa-circle-o-notch"></i> Save</span></button></footer>');
    $templateCache.put("src/user/account/profile/vehicles/vehicles.html", '<div class="panel-heading buttons"><h3 class=panel-title>{{$state.current.page.title}}<div class=panel-heading-buttons><button class="btn btn-default btn-xs btn-offcanvas-toggle" offcanvas-toggle><i class="fa fa-ellipsis-v"></i></button></div></h3></div><div class=panel-body>\x3c!--     <div class="text-right m-b">\n' + '        <a class="btn btn-secondary" href data-ui-sref=".add"><span\n' + '                class="fa fa-plus"></span> Add Location</a>\n' + "    </div>\n" + ' --\x3e<div class=panel-row><table class="table table-striped b-t b-light text-left" data-ng-table=tableParams template-pagination=src/user/layout/elements/tfoot.html><tbody><tr data-ng-repeat="data in $data" data-ng-if=$data><td data-title="\'Icon\'"><svg-image class=vehicle data-ng-src=data.icon title="{{ data.name }}"></svg-image></td><td data-title="\'Vehicle Name\'">{{data.name}}</td><td data-title="\'\'" class=text-right><a ng-if=owns(data.id) ng-click=toggleVehicle(data) href class="btn btn-sm btn-success">In Fleet</a> <a ng-if="! owns(data.id)" ng-click=toggleVehicle(data) href class="btn btn-sm btn-primary">Add to Fleet</a></td></tr></tbody></table></div></div>');
    $templateCache.put("src/user/account/team/documents/add/add.html", '<div class=modal-header><h3 class="modal-title pull-left">Upload Document</h3><div class=pull-right><button class="btn btn-default btn-sm" data-ng-click=$dismiss()>Cancel</button></div><div class=clearfix></div></div><form class="form form-horizontal" role=form name=form><div class=modal-body><div class=form-group><label class="col-sm-2 control-label font-bold">Type:</label><div class=col-sm-10><ui-select ng-model=data.selected_type on-select="data.type_id = data.selected_type.id" theme=bootstrap data-search-enabled=false style=width:100%><ui-select-match allow-clear=true placeholder="Select the document type">{{$select.selected.name}}</ui-select-match><ui-select-choices repeat="value as value in doctypes"><div ng-bind-html=value.name></div></ui-select-choices></ui-select></div></div><div class=form-group ng-if=data.selected_type.expiry_required><label class="col-sm-2 control-label font-bold">Expiry Date:</label><div class=col-sm-10><i-dtp ng-model=data.expiry icon=calendar placeholder="Expiration Date" min-date=minDate ng-required="data.selected_type.expiry_required"></div></div><div class=form-group ng-if=data.selected_type.amount_required><label class="col-sm-2 control-label font-bold">Amount Insured:</label><div class=col-sm-10><div class=input-group><span class=input-group-btn><button type=button class="btn btn-default" ng-click=clickToggle($event)><i class="fa fa-gbp"></i></button></span> <input ng-model=data.insured_amount class=form-control ng-required=data.selected_type.amount_required placeholder="Insured amount in pounds, eg. 10000"></div></div></div><div class=form-group><label for="" class="col-sm-2 control-label font-bold">User:</label><div class=col-sm-10><ui-select ng-model=data.user_id theme=bootstrap data-search-enabled=false style=width:100%><ui-select-match allow-clear=true placeholder="Select user to assign the document to.">{{$select.selected.name_full}}</ui-select-match><ui-select-choices repeat="value.id as value in team.members"><div ng-bind-html=value.name_full></div></ui-select-choices></ui-select></div></div><div class=form-group data-ng-show=!noFile><label class="col-sm-2 control-label font-bold">Select Document:</label><div class=col-sm-10><div class=form-control-static><div class="btn btn-secondary btn-file"><span>Select file from your computer</span> <input type=file class=form-control id=doc-upload name=doc-upload data-ng-model=upload nv-file-select="" uploader=uploader valid-file required></div></div></div></div><div class=form-group data-ng-show=file><label class="col-sm-2 control-label font-bold">Selected file:</label><div class=col-sm-10><p class=form-control-static>{{file.name}} - {{file.size | bytes}}</p></div></div><div class=form-group data-ng-show=progress><label class="col-sm-2 control-label font-bold">Progress:</label><div class=col-sm-10><p class=form-control-static><progressbar value=progress class=progress-xs type=info ng-show=progress></progressbar></p></div></div></div><div class="modal-footer text-right"><button type=button class="btn btn-lg btn-secondary" ng-click=store() ng-disabled="form.$invalid || formSubmitted"><span data-ng-show=!formSubmitted>Upload Document</span> <span data-ng-show=formSubmitted><i class="fa fa-spin fa-circle-o-notch"></i> Upload Document</span></button></div></form>');
    $templateCache.put("src/user/account/team/documents/document.html", '<div class="panel-heading buttons"><h3 class=panel-title>{{$state.current.page.title}}<div class=panel-heading-buttons><button class="btn btn-default btn-xs btn-offcanvas-toggle" offcanvas-toggle><i class="fa fa-ellipsis-v"></i></button></div></h3></div><div class=panel-body><div class="text-right m-b"><a class="btn btn-secondary" href data-ui-sref=".add({team_id: team_id})"><span class="fa fa-plus"></span> Add Document</a></div><div class=panel-row><table class="table table-striped b-t b-light text-left" data-ng-table=tableParams template-pagination=src/user/layout/elements/tfoot.html><tbody><tr class="odd gradeX" data-ng-repeat="data in $data" data-ng-class="{\'success\': data.status == \'approved\'}"><form name=document{{document.id}}><td data-title="\'Type\'">{{data.type.name}}</td><td class=text-u-f data-title="\'Status\'">{{data.status}}</td><td data-title="\'User\'">{{ data.user.name_full }}</td></form></tr></tbody></table></div></div>');
    $templateCache.put("src/user/account/team/edit/edit.html", '<div class="panel-heading buttons"><h3 class=panel-title>{{$state.current.page.title}} {{team.company_name}}<div class=panel-heading-buttons><button class="btn btn-default btn-xs btn-offcanvas-toggle" offcanvas-toggle><i class="fa fa-ellipsis-v"></i></button></div></h3></div><form class=form name=form><div class=panel-body><h4 class="page-header m-t">Company details:</h4><div class=row><div class="form-group col-sm-6"><label class=control-label>Company Name</label><input class=form-control ng-model=team.company_name disabled></div><div class="form-group col-sm-6"><label class=control-label>Company Number</label><input class=form-control ng-model=team.company_number disabled></div></div><div class=row><div class="form-group col-sm-6"><label class=control-label>VAT NUMBER</label><input class=form-control ng-model=team.vat_number disabled></div><div class="form-group col-sm-6"><label class=control-label>Postal code</label><input class=form-control ng-model=team.postal_code disabled></div></div><div class=row><div class="form-group col-sm-6"><label class=control-label>Address Line 1</label><input class=form-control ng-model=team.address_line_1 disabled></div><div class="form-group col-sm-6"><label class=control-label>Address Line 2</label><input class=form-control ng-model=team.address_line_2 disabled></div></div><div class=row><div class="form-group col-sm-6"><label class=control-label>Town</label><input class=form-control ng-model=team.town disabled></div><div class="form-group col-sm-6"><label class=control-label>County</label><input class=form-control ng-model=team.county disabled></div></div><p>If would like to change any of the information above please contact us: <a href=mailto:info@samedaycouriernetwork.com>info@samedaycouriernetwork.com</a></p><h4 class="page-header m-t">Invoice address:</h4><div class=row><div class="form-group col-sm-12"><div class="checkbox checkbox-secondary"><label><input type=checkbox ng-true-value=1 ng-false-value=0 ng-model=team.use_company_address> <i></i> Use company address</label></div></div></div><div class=row data-ng-show=!team.use_company_address><div class="form-group col-sm-6"><label class=control-label>Address Line 1</label><input class=form-control ng-model=team.invoice_address_line_1 data-ng-required="!team.use_company_address"></div><div class="form-group col-sm-6"><label class=control-label>Address Line 2</label><input class=form-control ng-model="team.invoice_address_line_2"></div></div><div class=row data-ng-show=!team.use_company_address><div class="form-group col-sm-4"><label class=control-label>Town</label><input class=form-control ng-model=team.invoice_town data-ng-required="!team.use_company_address"></div><div class="form-group col-sm-4"><label class=control-label>County</label><input class=form-control ng-model=team.invoice_county data-ng-required="!team.use_company_address"></div><div class="form-group col-sm-4"><label class=control-label>Postal code</label><input class=form-control ng-model=team.invoice_postal_code data-ng-required="!team.use_company_address"></div></div><h4 class="page-header m-t">Invoice recipient:</h4><div class=row data-ng-show=!team.external_invoice_recipient><div class="form-group col-sm-12"><label class=control-label>Invoice Recipient</label><select class=form-control ng-model=team.invoice_recipient_id ng-options="recipient.id as recipient.name_full for recipient in team.members"><option value="">Select a team member</option></select></div></div><div class=row><div class="form-group col-sm-12"><div class="checkbox checkbox-secondary"><label><input type=checkbox ng-true-value=1 ng-false-value=0 ng-model=team.external_invoice_recipient> <i></i> External invoice recipient</label></div></div></div><div class=row data-ng-show=team.external_invoice_recipient><div class="form-group col-sm-6"><label class=control-label>Invoice Recipient Name</label><input class=form-control ng-model=team.invoice_recipient_name data-ng-required="team.external_invoice_recipient"></div><div class="form-group col-sm-6"><label class=control-label>Invoice Recipient Phone</label><input class=form-control ng-model="team.invoice_recipient_phone"></div></div><div class=row data-ng-show=team.external_invoice_recipient><div class="form-group col-sm-12"><label class=control-label>Invoice Recipient Email</label><input class=form-control ng-model=team.invoice_recipient_email data-ng-required="team.external_invoice_recipient"></div></div><h4 class="page-header m-t">Invoice details:</h4><div class=row><div class="form-group col-sm-12"><label class=control-label>Invoice footer text</label><textarea class=form-control ng-model=team.invoice_footer_text></textarea></div></div><div class=row><div class="form-group col-sm-12"><div class="checkbox checkbox-secondary"><label><input type=checkbox ng-true-value=1 ng-false-value=0 ng-model=team.invoice_including_vat> <i></i> Invoice including vat</label></div></div></div><div class=form-group data-ng-if=team.invoice_logo><label class=control-label>Invoice logo:</label><div class="thumbnail invoice-logo"><img data-ng-src="{{team.invoice_logo + \'?decache=\' + rand}}" title="{{team.company_name}}"></div></div><div class=form-group><span class="btn btn-sm btn-secondary btn-file"><span data-ng-show=!team.invoice_logo>Upload invoice logo</span> <span data-ng-show=team.invoice_logo>Change invoice logo</span> <input type=file class=form-control id=invoice-upload name=invoice-upload data-ng-model=upload nv-file-select="" uploader="uploader"></span></div><div class=form-group data-ng-show=file><label class=control-label>Selected file: {{file.name}} - {{file.size | bytes}}<progressbar value=progress class="progress-xs m-t-xs" type=info ng-show=progress></progressbar></label></div></div><footer class="panel-footer text-right"><button type=button class="btn btn-lg btn-primary" ng-click=update() ng-disabled="form.$invalid || formSubmitted"><span data-ng-show=!formSubmitted>Save</span> <span data-ng-show=formSubmitted><i class="fa fa-spin fa-circle-o-notch"></i> Save</span></button></footer></form>');
    $templateCache.put("src/user/account/team/feedback/add/add.html", '<div class=modal-header><h3 class="modal-title pull-left">Leave feedback</h3><div class=pull-right><button class="btn btn-default btn-sm" data-ng-click=$dismiss()>Cancel</button></div><div class=clearfix></div></div><form class="form form-horizontal" name=form><div class="modal-body job-feedback"><div class=form-group><div class=rating><label class="col-sm-2 control-label font-bold">Your rating:</label><div class=col-sm-10><rating class=rating ng-model=feedback.rating max=5 state-on="\'glyphicon glyphicon-star text-info\'" state-off="\'glyphicon glyphicon-star-empty text-info\'" required></rating></div></div></div><div class=form-group><label class="col-sm-2 control-label font-bold">Your comment:</label><div class=col-sm-10><textarea class=form-control name=comment ng-model=feedback.comment placeholder="Your comment" required></textarea></div></div></div><div class="modal-footer text-right"><button class="btn btn-primary" ng-click=create() data-ng-disabled="form.$invalid || formSubmitted"><span data-ng-show=!formSubmitted>Submit feedback</span> <span data-ng-show=formSubmitted><i class="fa fa-spin fa-circle-o-notch"></i> Submit feedback</span></button></div></form>');
    $templateCache.put("src/user/account/team/feedback/feedback.html", '<div class="content col-sm-12"><div class="panel panel-default"><div class="panel-heading buttons"><h3 class=panel-title>Our Feedback<div class=panel-heading-buttons><button class="btn btn-default btn-xs btn-offcanvas-toggle" offcanvas-toggle><i class="fa fa-ellipsis-v"></i></button></div></h3></div><div class="panel-body no-padder-v no-padder-h"><div sdcn-loader size=lg data-ng-show=loading></div><div class=not-found data-ng-show="!tableParams.total() && !loading"><h1>0</h1><div class=text>No feedback matching your criteria.</div></div><div class="streamline b-l b-default m-l-lg m-b padder-v" data-ng-show=tableParams.total()><table class=table data-ng-table=tableParams template-pagination=src/user/layout/elements/tfoot.html><tbody><tr data-ng-repeat="data in $data" data-ng-include="\'src/user/layout/elements/feedback.html\'"></tr></tbody></table></div></div></div></div>');
    $templateCache.put("src/user/account/team/jobs/jobs.html", '<div class="panel panel-default"><div class="panel-heading buttons"><h3 class=panel-title>Our Jobs Posted<div class=panel-heading-buttons><button class="btn btn-default btn-xs" data-ng-click=tableParams.reload()><i class=icon-refresh></i> <span class=hidden-xs>Refresh</span></button> <button class="btn btn-default btn-xs btn-offcanvas-toggle" offcanvas-toggle><i class="fa fa-ellipsis-v"></i></button></div></h3></div><div class="panel-body no-padder-v no-padder-h"><div sdcn-loader size=lg data-ng-show=loading></div><div class=not-found data-ng-show="!tableParams.total() && !loading"><h1>0</h1><div class=text>No jobs matching your criteria.</div></div><div class="job-list job-list-md" data-ng-show=tableParams.total()><table class=table data-ng-table=tableParams template-header=src/user/layout/elements/thead.html template-pagination=src/user/layout/elements/tfoot.html><tbody><tr data-ng-repeat="data in $data" data-ng-init="isCollapsed = true" data-ng-include="\'src/user/layout/elements/job-team-posted.html\'"></tr></tbody></table></div></div></div>');
    $templateCache.put("src/user/account/team/locations/edit/edit.html", '<div class=modal-header><h3 class="modal-title pull-left">{{mode}} locations</h3><div class=pull-right><button class="btn btn-default btn-sm" data-ng-click=$dismiss(true)>Cancel</button></div><div class=clearfix></div></div><form class="form form-horizontal" role=form name=form><div class=modal-body><div class=form-group><label for="" class="col-sm-3 control-label font-bold">User:</label><div class=col-sm-9><ui-select ng-model=data.user_id theme=bootstrap data-search-enabled=false style=width:100%><ui-select-match allow-clear=true placeholder="Select user to assign the location to.">{{$select.selected.name_full}}</ui-select-match><ui-select-choices repeat="value.id as value in team.members"><div ng-bind-html=value.name_full></div></ui-select-choices></ui-select></div></div><div class=form-group><label class="col-sm-3 control-label font-bold">Location:</label><div class=col-sm-9><input class=form-control placeholder=Location details=details ng-model=data.location lng=data.longitude lat=data.latitude googleplace required></div></div><div class=form-group><label class="col-sm-3 control-label font-bold">Accept job within:</label><div class=col-sm-9><ui-select ng-model=data.miles theme=bootstrap data-search-enabled=false style="width: 100%"><ui-select-match allow-clear=false placeholder="Select miles...">{{$select.selected.name}}</ui-select-match><ui-select-choices repeat="value.id as value in miles"><div ng-bind-html=value.name></div></ui-select-choices></ui-select></div></div><div class=form-group><label class="col-sm-3 control-label font-bold">Map preview:</label><div class=col-sm-9><div class="map map-md map-full m-t"><ui-gmap-google-map id=map-canvas center=map.center zoom=map.zoom options=map.options control=map.control fit=true><ui-gmap-marker coords="{latitude: data.latitude, longitude: data.longitude}" idkey=0 ng-if="data.latitude && data.longitude"></ui-gmap-marker><ui-gmap-circle ng-repeat="c in map.circles" center=c.center fill="{color: \'#063f60\', opacity: 0.3}" stroke="{color: \'#063f60\', weight: 1, opacity: 1}" radius=c.radius clickable=false draggable=false editable=false visible ng-if=c.center></ui-gmap-circle></ui-gmap-google-map></div></div></div></div><div class="modal-footer text-right"><button type=button class="btn btn-lg btn-primary" data-ng-click=store() data-ng-disabled="form.$invalid || formSubmitted" data-ng-if=isAdd()><span data-ng-show=!formSubmitted>Add location</span> <span data-ng-show=formSubmitted><i class="fa fa-spin fa-circle-o-notch"></i> Add location</span></button> <button type=button class="btn btn-lg btn-primary" data-ng-click=update() data-ng-disabled="form.$invalid || formSubmitted" data-ng-if=isEdit()><span data-ng-show=!formSubmitted>Update location</span> <span data-ng-show=formSubmitted><i class="fa fa-spin fa-circle-o-notch"></i> Update location</span></button></div></form>');
    $templateCache.put("src/user/account/team/locations/locations.html", '<div class="panel-heading buttons"><h3 class=panel-title>{{$state.current.page.title}}<div class=panel-heading-buttons><button class="btn btn-default btn-xs btn-offcanvas-toggle" offcanvas-toggle><i class="fa fa-ellipsis-v"></i></button></div></h3></div><div class=panel-body><div class="text-right m-b"><a class="btn btn-secondary" href data-ui-sref=.add><span class="fa fa-plus"></span> Add Location</a></div><div class=panel-row><table class="table table-striped b-t b-light text-left" data-ng-table=tableParams template-pagination=src/user/layout/elements/tfoot.html><tbody><tr data-ng-repeat="data in $data" data-ng-if=$data><td data-title="\'Location\'">{{data.location}}</td><td data-title="\'Accept jobs within\'">{{data.miles}} miles</td><td data-title="\'User\'">{{ data.user.name_full }}</td><td data-title="\'\'" class=text-right><a class="btn btn-sm btn-primary" href data-ui-sref=".edit({id: data.id})"><span class="fa fa-pencil"></span> Edit</a> <a class="btn btn-sm btn-danger" href data-ng-click=destroy(data)><span class="fa fa-trash"></span> Delete</a></td></tr></tbody></table></div></div>');
    $templateCache.put("src/user/account/team/manage/edit.html", '<div class=modal-header><h3 class="modal-title pull-left">{{mode}} team member</h3><div class=pull-right><button class="btn btn-default btn-sm" data-ng-click=$dismiss()>Cancel</button></div><div class=clearfix></div></div><form class=form role=form name=form><div class=modal-body><div class=row><div class="form-group col-sm-6"><label class=control-label>First Name *</label><input class=form-control placeholder="First Name *" ng-model=data.name_first required></div><div class="form-group col-sm-6"><label class=control-label>Last Name</label><input class=form-control placeholder="Last Name" ng-model="data.name_last"></div></div><div class=row><div class="form-group col-sm-6"><label class=control-label>Email *</label><input type=email class=form-control placeholder="Email *" ng-model=data.email required></div><div class="form-group col-sm-6"><label class=control-label>Phone *</label><input class=form-control placeholder="Phone *" ng-model=data.phone required></div></div><div class=form-group data-ng-show=isEdit()><div class="checkbox checkbox-secondary"><label><input type=checkbox data-ng-model="changePass"> Change password <i></i></label></div></div><div class=row data-ng-if=changePass><div class=col-sm-6><div class=form-group ng-class="{\n' + "                                        'has-error': form.$error.minlength,\n" + "                                        'has-success': form.password.$valid,\n" + "                                        'has-feedback': form.password.$valid || form.$error.minlength\n" + '                                    }"><label class=control-label>Password:</label><input type=password placeholder=Password class=form-control data-ng-minlength=6 data-ng-model=data.password name=password data-ng-required=changePass> <span class="fa fa-check-circle form-control-feedback" aria-hidden=true data-ng-show=form.password.$valid></span> <span class="fa fa-times-circle form-control-feedback" aria-hidden=true data-ng-show=form.$error.minlength></span> <span class="label label-danger" data-ng-show=form.$error.minlength>Passwords must be a minimum of 6 characters</span></div></div><div class=col-sm-6><div class=form-group ng-class="{\n' + "                                        'has-error': form.password_confirmation.$error.matchTo,\n" + "                                        'has-success': form.password_confirmation.$valid,\n" + "                                        'has-feedback': form.password_confirmation.$valid || form.password_confirmation.$error.matchTo,\n" + '                                    }"><label class=control-label>Retype password:</label><input type=password placeholder="Retype password" class=form-control ng-model=data.password_confirmation name=password_confirmation data-ng-required=changePass data-match-to=form.password> <span class="fa fa-check-circle form-control-feedback" aria-hidden=true data-ng-show=form.password_confirmation.$valid></span> <span class="fa fa-times-circle form-control-feedback" aria-hidden=true data-ng-show=form.password_confirmation.$error.matchTo></span> <span class="label label-danger" data-ng-show=form.password_confirmation.$error.matchTo>Passwords do not match.</span></div></div></div></div><div class="modal-footer text-right"><button type=button class="btn btn-lg btn-secondary" data-ng-click=store() data-ng-if=isAdd() ng-disabled="form.$invalid || formSubmitted"><span data-ng-show=!formSubmitted>Add User</span> <span data-ng-show=formSubmitted><i class="fa fa-spin fa-circle-o-notch"></i> Add User</span></button> <button type=button class="btn btn-lg btn-secondary" data-ng-click=update() data-ng-if=isEdit() ng-disabled="form.$invalid || formSubmitted"><span data-ng-show=!formSubmitted>Update User</span> <span data-ng-show=formSubmitted><i class="fa fa-spin fa-circle-o-notch"></i> Update User</span></button></div></form>');
    $templateCache.put("src/user/account/team/team.html", '<div class="row row-offcanvas row-offcanvas-right manage-team"><div class="content col-sm-8"><div class="panel panel-default" data-ui-view><div class="panel-heading buttons"><h3 class=panel-title><span data-ng-show="$auth.user().hasRole(\'team.member.primary\')">Manage</span> Users<div class=panel-heading-buttons><button class="btn btn-secondary btn-xs" data-ui-sref=".adduser({team_id: team.id})" data-ng-if="team.members.length < 10 && $auth.user().hasRole(\'team.member.primary\')"><i class=icon-plus></i> <span class=hidden-xs>Add</span></button> <button class="btn btn-default btn-xs" data-ng-click=tableParams.reload()><i class=icon-refresh></i> <span class=hidden-xs>Refresh</span></button> <button class="btn btn-default btn-xs btn-offcanvas-toggle" offcanvas-toggle><i class="fa fa-ellipsis-v"></i></button></div></h3></div><div class="panel-body no-padder-v"><h4 class=page-header data-ng-if="$auth.user().hasRole(\'team.member.primary\')">Primary User Settings:</h4><form method=post class=form-horizontal data-ng-if="$auth.user().hasRole(\'team.member.primary\')"><div class=form-group><div class="control-label col-sm-4">Transfer Primary User</div><div class=col-sm-8><div class="checkbox checkbox-secondary"><label><input type=checkbox ng-true-value=1 ng-false-value=0 ng-model=new_primary.confirm> <i></i></label></div></div></div><div class=form-group data-ng-show=new_primary.confirm><div class="control-label col-sm-4">New Primary User</div><div class=col-sm-8><ui-select ng-model=new_primary.user theme=bootstrap data-search-enabled=false style=width:100%><ui-select-match allow-clear=true placeholder={{team.primary_member.name_full}}>{{$select.selected.name_full}}</ui-select-match><ui-select-choices ui-disable-choice="value.id == team.primary_member.id" repeat="value as value in team.members"><div ng-bind-html=value.name_full></div></ui-select-choices></ui-select></div></div><button class="btn btn-xs btn-primary pull-right" data-ng-disabled=!new_primary.confirm data-ng-show=new_primary.confirm data-ng-click=transferPrimaryUser()>Save</button><div class=clearfix></div></form><sdcn-loader size=lg data-ng-show=loading></sdcn-loader><div class="job-list job-list-md panel-row" ng-show=!loading><div class=table-responsive><table class="table text-left" data-ng-table=tableParams><tbody><tr data-ng-repeat="member in team.members" class=team-member-row><td class=photo><img class=avatar data-ng-src="{{member.avatar ? member.avatar : member.avatar_url}}"></td><td class=name data-title="\'Name\'">{{member.name_full}}</td><td><i data-ng-show="member.team_role == \'primary\'">({{member.team_role}} User)</i></td><td class="actions text-right"><a class="btn btn-xs btn-primary" data-ng-if="$auth.user().hasRole(\'team.member.primary\')" data-ui-sref=".edituser({user_id: member.id})">Edit</a> <a class="btn btn-xs" data-ng-if="$auth.user().hasRole(\'team.member.primary\')" data-ng-hide="member.id == $auth.user().id" data-ng-class="{\'btn-danger\': !member.inactivated, \'btn-success\': member.inactivated}" data-ng-click="team.deactivateMember(member); ">{{member.inactivated ? \'Activate\' : \'Deactivate\'}}</a></td></tr></tbody></table></div></div></div></div></div><aside class="sidebar col-sm-4 sidebar-offcanvas" role=complementary><div class="widget widget-account" data-ng-controller=LoginController data-ng-include="\'src/user/layout/widgets/account.html\'"></div></aside></div>');
    $templateCache.put("src/user/account/team/work/work.html", '<div class="panel-heading buttons"><h3 class=panel-title>Our Work<div class=panel-heading-buttons><button class="btn btn-default btn-xs" data-ng-click=tableParams.reload()><i class=icon-refresh></i> <span class=hidden-xs>Refresh</span></button> <button class="btn btn-default btn-xs btn-offcanvas-toggle" offcanvas-toggle><i class="fa fa-ellipsis-v"></i></button></div></h3></div><div class="panel-body no-padder-v no-padder-h"><div sdcn-loader size=lg data-ng-show=loading></div><div class=not-found data-ng-show="!tableParams.total() && !loading"><h1>0</h1><div class=text>No jobs matching your criteria.</div></div><div class="table-responsive job-list job-list-md" data-ng-show=tableParams.total()><table class=table data-ng-table=tableParams template-header=src/user/layout/elements/thead.html template-pagination=src/user/layout/elements/tfoot.html><tbody><tr data-ng-repeat="data in $data" data-ng-init="isCollapsed = true" data-ng-include="\'src/user/layout/elements/job-team-work.html\'"></tr></tbody></table></div></div>');
    $templateCache.put("src/user/account/work/invoice/invoice.html", '<div class=modal-header><h3 class="modal-title pull-left">Raise Invoice for Job #{{job.id}}</h3><div class=pull-right><button class="btn btn-primary btn-sm" data-ng-click=$dismiss()>Close</button></div><div class=clearfix></div></div><form class="form form-horizontal" role=form name=form><div class=modal-body><div class=form-group><label class="col-sm-2 control-label font-bold">Job ID:</label><div class=col-sm-10><p class=form-control-static>#{{job.id}}</p></div></div><div class=form-group><label class="col-sm-2 control-label font-bold">Pickup Point:</label><div class=col-sm-10><p class=form-control-static>{{job.pickup_point}}</p></div></div><div class=form-group><label class="col-sm-2 control-label font-bold">Destination Point:</label><div class=col-sm-10><p class=form-control-static>{{job.destination_point}}</p></div></div><div class=form-group><label class="control-label col-sm-2 font-bold">Invoice type:</label><div class=col-sm-10><div class=row><div class=col-xs-6><div class="radio radio-warning"><input type=radio class=form-control data-ng-model=invoiceType value=system id=invoice-system><label for=invoice-system>System Invoice</label></div></div><div class=col-xs-6><div class="radio radio-warning"><input type=radio class=form-control data-ng-model=invoiceType value=manual id=invoice-manual><label for=invoice-manual>Manual Invoice</label></div></div></div></div></div><div ng-if="invoiceType == \'system\'"><h4 class=page-header>System Invoice</h4><div class=form-group><label class="control-label col-sm-2 font-bold">Invoice Amount:</label><div class=col-sm-10><p class=form-control-static>{{data.amount | currency:\'£\'}}</p></div></div><div class=form-group><div class="col-sm-10 col-sm-offset-2"><div class="checkbox checkbox-warning"><label><input type=checkbox class=form-control data-ng-model="isInvoiceNumber"> Add External Invoice Number <i></i></label></div></div></div><div class=form-group data-ng-show=isInvoiceNumber><label class="control-label col-sm-2 font-bold">External Number:</label><div class=col-sm-10><input class=form-control data-ng-model="data.external_number"></div></div><div class=form-group><div class="col-sm-10 col-sm-offset-2"><div class="checkbox checkbox-warning"><label><input type=checkbox class=form-control data-ng-model="isItems"> Add More Rows <i></i></label></div></div></div><div data-ng-show=isItems><div class=form-group ng-repeat="item in data.invoice_items"><label class="col-sm-2 control-label font-bold">Row #{{$index + 1}}</label><div class=col-sm-10><ng-form name=itemForm class=form-inline><div class="form-group m-l-none m-r-none"><input class=form-control placeholder=Description ng-model=item.item required></div><div class="form-group m-l-none m-r-none"><div class=input-group><input type=number name=amount id=amount class=form-control data-ng-model=item.amount min=0 aria-describedby=currency placeholder=0 required> <span class=input-group-addon id=currency>£</span></div><span class="label label-danger" data-ng-if=itemForm.amount.$error.number>Numbers Only!</span></div><div class="form-group m-l-s-md m-r-s-md m-l-none m-r-none"><div class="checkbox checkbox-warning"><label><input type=checkbox class=form-control ng-model="item.add_vat"> Add vat <i></i></label></div></div><a class="btn btn-danger btn-sm" href ng-click=removeFromInvoiceItems(item)><span class=icon-close></span></a></ng-form><hr></div></div><div class=text-right><a class="btn btn-success" href data-ng-click=addToInvoiceItems()><span class=icon-plus></span> Add New Row</a></div></div><div class=form-group><div class="col-sm-10 col-sm-offset-2"><div class="checkbox checkbox-warning"><label><input type=checkbox class=form-control data-ng-model="isNotes"> Add Notes <i></i></label></div></div></div><div class=form-group data-ng-show=isNotes><label class="control-label col-sm-2 font-bold">Notes:</label><div class=col-sm-10><textarea class=form-control data-ng-model=data.notes></textarea></div></div><div class=form-group><div class="col-sm-10 col-sm-offset-2"><div class="checkbox checkbox-warning"><label><input type=checkbox class=form-control data-ng-model="isCC"> Add CC(Email) <i></i></label></div></div></div><div class=form-group ng-class="{\n' + "                                    'has-error': form.email.$error.email,\n" + "                                    'has-success': form.email.$valid,\n" + "                                    'has-feedback': form.email.$valid || form.email.$error.email,\n" + '                                }" data-ng-show=isCC><label class="control-label col-sm-2 font-bold">CC Email:</label><div class=col-sm-10><input type=email id=email name=email placeholder=Email class=form-control data-ng-model=data.cc data-ng-required=isCC> <span class="fa fa-check-circle form-control-feedback" aria-hidden=true data-ng-if=form.email.$valid></span> <span class="fa fa-times-circle form-control-feedback" aria-hidden=true data-ng-if=form.email.$error.email></span> <span class="label label-danger" data-ng-if=form.email.$error.email>Not valid email!</span></div></div></div><div ng-if="invoiceType == \'manual\'"><div class=form-group><label class="control-label col-sm-2 font-bold">Your Invoice Number:</label><div class=col-sm-10><input class=form-control data-ng-model="data.external_number"></div></div></div></div><div class="modal-footer text-right"><button type=button class="btn btn-lg btn-success start" ng-click=store() ng-disabled="form.$invalid || formSubmitted"><span data-ng-show=!formSubmitted>Submit Invoice</span> <span data-ng-show=formSubmitted><i class="fa fa-spin fa-circle-o-notch"></i> Submit Invoice</span></button></div></form>');
    $templateCache.put("src/user/account/work/pod/pod.html", '<div class=modal-header><h3 class="modal-title pull-left">Upload POD</h3><div class=pull-right><button class="btn btn-primary btn-sm" data-ng-click=$dismiss()>Close</button></div><div class=clearfix></div></div><form class="form form-horizontal" role=form name=form><div class=modal-body><h4 class=page-header>Job Details</h4><div class=form-group><label class="col-sm-2 control-label font-bold">Job ID:</label><div class=col-sm-10><p class=form-control-static>{{job.id}}</p></div></div><div class=form-group><label class="col-sm-2 control-label font-bold">Pickup Point:</label><div class=col-sm-10><p class=form-control-static>{{job.pickup_point}}</p></div></div><div class=form-group><label class="col-sm-2 control-label font-bold">Destination Point:</label><div class=col-sm-10><p class=form-control-static>{{job.destination_point}}</p></div></div><div class=form-group><label class="col-sm-2 control-label font-bold">Package recipient:</label><div class=col-sm-10><input class=form-control data-ng-model=data.recipient ng-required=!noFile placeholder="Package recipient"></div></div><div class=form-group><label class="col-sm-2 control-label font-bold">Delivery Date:</label><div class=col-sm-10><i-dtp ng-model=data.delivery_date icon=calendar placeholder="Delivery Date" min-date=minDate required></div></div><div class=form-group data-ng-show=!noFile><label class="col-sm-2 control-label font-bold">Upload POD file:</label><div class=col-sm-10><span class="btn btn-secondary btn-file"><span>Select file from your computer</span> <input type=file class=form-control id=pod-upload name=pod-upload data-ng-model=upload nv-file-select="" uploader=uploader valid-file data-ng-required="!noFile"></span></div></div><div class=form-group data-ng-show=file><label class="col-sm-2 control-label font-bold">Selected file:</label><div class=col-sm-10><p class=form-control-static>{{file.name}} - {{file.size | bytes}}</p></div></div><div class=form-group><div class="col-sm-offset-2 col-sm-10"><div class="checkbox checkbox-secondary"><label><input type=checkbox data-ng-model="noFile"> POD not required/sent manually <i></i></label></div></div></div><div class=form-group data-ng-show=noFile><label class="col-sm-2 control-label font-bold">Reason:</label><div class=col-sm-10><textarea class=form-control data-ng-model=data.no_pod_reason ng-required=noFile></textarea></div></div><div class=form-group data-ng-show=progress><label class="col-sm-2 control-label font-bold">Progress:</label><div class=col-sm-10><p class=form-control-static><progressbar value=progress class="progress-xs m-t" type=info ng-show=progress></progressbar></p></div></div></div><div class="modal-footer text-right"><button type=button class="btn btn-lg btn-secondary" ng-click=store() ng-disabled="form.$invalid || formSubmitted"><span data-ng-show=!formSubmitted>Upload POD</span> <span data-ng-show=formSubmitted><i class="fa fa-spin fa-circle-o-notch"></i> Upload POD</span></button></div></form>');
    $templateCache.put("src/user/account/work/retract/retract.html", '<div class=modal-header><h3 class=modal-title>Retract Bid <button class="btn btn-primary btn-sm" data-ng-click=$dismiss()>Close</button></h3></div><div class=modal-body><form class=form-horizontal role=form name=form><div class=form-group><label class="col-sm-3 control-label font-bold">Job ID:</label><div class=col-sm-9><p class=form-control-static>#{{data.job_id}}</p></div></div><div class=form-group><label class="col-sm-3 control-label font-bold">Bid Amount:</label><div class=col-sm-9><p class=form-control-static>{{data.amount | currency:\'£\'}} <span data-ng-if=data.add_vat>+ VAT</span></p></div></div><div class=form-group><div class="col-sm-offset-2 col-sm-10"><div class="checkbox checkbox-danger"><label><input type=checkbox data-ng-model="confirm"> Retract Bid <i></i></label></div></div></div></form></div><div class="modal-footer text-right"><button type=button class="btn btn-lg btn-danger" ng-click=retractBid() ng-disabled="!confirm || formSubmitted"><span data-ng-show=!formSubmitted>Retract</span> <span data-ng-show=formSubmitted><i class="fa fa-spin fa-circle-o-notch"></i> Retract</span></button></div>');
    $templateCache.put("src/user/account/work/work.html", '<div class="row row-offcanvas row-offcanvas-right"><div class="content col-sm-8"><div class="panel panel-default"><div class="panel-heading buttons"><h3 class=panel-title>My Work<div class=panel-heading-buttons><button class="btn btn-default btn-xs" data-ng-click=tableParams.reload()><i class=icon-refresh></i> <span class=hidden-xs>Refresh</span></button> <button class="btn btn-default btn-xs btn-offcanvas-toggle" offcanvas-toggle><i class="fa fa-ellipsis-v"></i></button></div></h3></div><div class="panel-body no-padder-v no-padder-h"><div sdcn-loader size=lg data-ng-show=loading></div><div class=not-found data-ng-show="!tableParams.total() && !loading"><h1>0</h1><div class=text>No jobs matching your criteria.</div></div><div class="table-responsive job-list job-list-md" data-ng-show=tableParams.total()><table class=table data-ng-table=tableParams template-header=src/user/layout/elements/thead.html template-pagination=src/user/layout/elements/tfoot.html><tbody><tr data-ng-repeat="data in $data" data-ng-init="isCollapsed = true" data-ng-include="\'src/user/layout/elements/job-my-work.html\'"></tr></tbody></table></div></div></div></div><aside class="sidebar col-sm-4 sidebar-offcanvas" role=complementary><div class="widget widget-account" data-ng-include="\'src/user/layout/widgets/account.html\'"></div></aside></div>');
    $templateCache.put("src/user/benefits/benefits.html", '<div class="row row-offcanvas row-offcanvas-right"><div class="content col-xs-12"><div class="alert alert-warning" role=alert data-ng-if="! $auth.isUser()"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden=true></span> <span class=sr-only>Warning:</span> Please note this area is for paying members only. Please contact us. @TODO verbiage for this</div><div class="panel panel-default"><div class="panel-heading buttons"><h3 class=panel-title>SDCN Member Benefits<div class=panel-heading-buttons><button class="btn btn-default btn-xs" data-ng-click=tableParams.reload()><i class=icon-refresh></i> <span class=hidden-xs>Refresh</span></button> <button class="btn btn-default btn-xs btn-offcanvas-toggle" offcanvas-toggle><i class="fa fa-ellipsis-v"></i></button></div></h3></div>\x3c!-- /heading  --\x3e<div class=panel-body><div sdcn-loader size=lg data-ng-show=loading></div><div class=not-found ng-if=!benefits><h1>0</h1><div class=text>Sorry, there are no perks available at the moment.</div></div><div class=row><div class="col-xs-12 member-benefit" ng-repeat="benefit in benefits"><img src="{{ benefit.partner.logo }}" alt="" class="img img-responsive" style="max-width: 75%; margin: 1rem auto; max-height: 10rem"><h5><strong>{{ benefit.partner.name }}</strong></h5><p>{{ benefit.description }}</p><a ng-href="{{ benefit.url }}" class="btn btn-primary btn-sm" target=_new>Visit benefit page</a></div></div></div></div></div></div>');
    $templateCache.put("src/user/dashboard/dashboard.html", '<div class="row row-offcanvas row-offcanvas-right user-dashboard"><div class="content col-sm-8"><div class="panel panel-default control-panel"><div class="panel-heading buttons"><h3 class=panel-title>Recent Activity<div class=panel-heading-buttons><button class="btn btn-default btn-xs btn-offcanvas-toggle" offcanvas-toggle><i class="fa fa-ellipsis-v"></i></button></div></h3></div><div class=panel-body><div class=not-found data-ng-show=!myEvents.length><h1>0</h1><div class=text>It appears that you don\'t have any events at the moment.</div></div><div class="event-list ui relaxed divided list" data-ng-show=myEvents.length><div class="item status-{{event.status}} type-{{event.type}}" data-ng-repeat="event in myEvents"><i class="fa fa-warning icon" data-ng-show="event.type != \'feedback\'"></i> <i class="fa fa-check-circle icon" data-ng-show="event.type == \'feedback\'"></i><div class=content><h5 class=header>{{event.name}} <a class=text-small href data-ng-click=toggleEventStatus(event) data-ng-show="event.status == \'new\'" title="Mark as Read">Mark as Read</a></h5><div class=description>{{event.description.substr(0, 50)}}... <span class=text-small>{{event.pretty_date}}</span></div></div></div></div></div></div><div class="my-rating hidden-xs"><h3>Your current performance</h3><div class="panel panel-default"><div class=panel-body><h5>Your feedback rating is {{rating | number:0}} out of 5. Based on <a data-ui-sref=user.account.feedback title="{{ratings}} reviews">{{ratings}} reviews</a></h5><div class="ratings ratings-lg"><rating class="rating read-only" ng-model=rating max=5 state-on="\'glyphicon glyphicon-star text-info\'" state-off="\'glyphicon glyphicon-star-empty text-info\'" data-readonly=true></rating></div></div></div></div></div><aside class="sidebar col-sm-4 sidebar-offcanvas" role=complementary><div class=api-details data-ng-show=client_api><div class="panel panel-default"><div class=panel-heading><h3 class=panel-title>Client API</h3></div><div class=panel-body><h5>Client ID</h5><pre>{{ oauth_client.id }}</pre><h5>API Key</h5><pre>{{ oauth_client.secret }}</pre></div></div></div>\x3c!--Removing it temporarily --\x3e\x3c!--<div class="widget widget-latest-jobs" data-ng-include="\'src/user/layout/widgets/latest-jobs.html\'"></div>--\x3e<div class="widget widget-useful-links" data-ng-include="\'src/user/layout/widgets/useful-links.html\'"></div></aside></div>');
    $templateCache.put("src/user/dashboard/details/details.html", '<div class=modal-header><h3 class=modal-title>Job <span data-ng-show=!loading>#{{data.id}}</span> details <button class="btn btn-default btn-sm pull-right" data-ng-click=$dismiss()>Cancel</button></h3></div><div class="modal-body job-list job-list-md"><div sdcn-loader size=lg data-ng-show=loading></div><div class="job job-browse" data-ng-show=!loading><div class=media><div class="media-left hidden-xs" data-ng-if=data.vehicle_icon><div class=vehicle><svg-image data-ng-src=data.vehicle_icon title="{{ data.name }}"></svg-image></div></div><div class=media-body><div class=col-sm-6><small class=text-info>Pick Up</small> <span class=point>{{data.pickup_point}}</span> <span ng-if="!data.flexible_pickup && !data.pickup_asap"><span class=date>{{data.pickup_date | amDateFormat:\'DD/MM/YYYY HH:mm\'}}</span></span> <span ng-if="data.flexible_pickup && !data.pickup_asap"><span class=date style="margin: 0"><b>FROM</b> {{data.pickup_date | amDateFormat:\'DD/MM/YYYY HH:mm\'}}</span> <span class=date><b>TO</b> {{data.pickup_date_end | amDateFormat:\'DD/MM/YYYY HH:mm\'}}</span></span> <span ng-if=data.pickup_asap class=date><strong class=text-success>Pickup ASAP</strong></span></div><div class=col-sm-6><small class=text-info>Drop Off</small> <span class=point>{{data.destination_point}}</span> <span ng-if="!data.flexible_destination && !data.destination_asap"><span class=date>{{data.destination_date | amDateFormat:\'DD/MM/YYYY HH:mm\'}}</span></span> <span ng-if="data.flexible_destination && !data.destination_asap"><span class=date style="margin: 0"><b>FROM</b>{{data.destination_date | amDateFormat:\'DD/MM/YYYY HH:mm\'}}</span> <span class=date><b>TO</b>{{data.destination_date | amDateFormat:\'DD/MM/YYYY HH:mm\'}}</span></span> <span class=date ng-if=data.destination_asap><strong class=text-success>Delivery ASAP</strong></span></div><div class=clearfix></div></div></div><div class=panel-body><span class=arrow></span><div class="alert alert-warning m-b-none" role=alert data-ng-show="!$auth.user().can(\'add-bid\')"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden=true></span> <span class=sr-only>Warning:</span> Please upload your insurance documents to your profile by clicking <a href data-ui-sref=user.account.profile.documents title=here>here</a>. We will then fully enable your account so you will be able to bid on jobs.</div><h4 data-ng-if="$auth.user().can(\'add-bid\')">Job Details</h4><div class=row><div class="col-sm-12 col-md-6"><form class=form-horizontal data-ng-if="$auth.user().can(\'add-bid\')"><div class=form-group data-ng-if=data.user_info.team_info.company_name><label class="control-label col-sm-2 font-bold">Company:</label><div class=col-sm-10><p class=form-control-static>{{data.user_info.team_info.company_name}}</p></div></div><div class=form-group data-ng-if=data.expiry_time.date><label class="control-label col-sm-2 font-bold">Expiry time:</label><div class=col-sm-10><p class=form-control-static>{{data.expiry_time.date | amDateFormat:\'DD/MM/YYYY HH:mm\'}}</p></div></div><div class=form-group data-ng-if=data.distance_in_miles><label class="control-label col-sm-2 font-bold">Estimated Distance:</label><div class=col-sm-10><p class=form-control-static>{{ data.distance_in_miles }} miles</p></div></div><div class=form-group data-ng-if=data.duration><label class="control-label col-sm-2 font-bold">Estimated Duration:</label><div class=col-sm-10><p class=form-control-static>{{ data.duration }}</p></div></div><div class=form-group data-ng-if=data.backload><label class="control-label col-sm-2 font-bold">Backload:</label><div class=col-sm-10><p class=form-control-static>Yes</p></div></div><div class=form-group data-ng-if=data.details><label class="control-label col-sm-2 font-bold">Notes:</label><div class=col-sm-10><p class=form-control-static>{{data.details}}</p></div></div></form></div><div class="col-sm-12 col-md-6"><div class="map map-md map-full m-t" stlye="width: 429px; height: 315px"><ui-gmap-google-map id=map-canvas center=map.center zoom=map.zoom options=map.options control=map.control></ui-gmap-google-map></div></div></div><div class=contact-details data-ng-if="$auth.user().can(\'add-bid\')"><div class=pull-left><a data-ng-show=data.phone href=tel:{{data.phone}} title={{data.phone}}>{{data.phone}}</a> <small data-ng-show=!data.phone>No Phone</small></div><div class=pull-right><a data-ng-show=data.email href=mailto:{{data.email}} title={{data.email}}>{{data.email}}</a> <small data-ng-show=!data.email>No Email</small></div><div class=clearfix></div></div></div></div></div><div class="modal-footer text-right" data-ng-if="$auth.user().can(\'add-bid\')" data-ng-show=!loading><a class="btn btn-lg btn-secondary" href data-ui-sref="user.jobs.browse.submit({job_id: data.id})" data-ng-click=$dismiss() data-ng-if="!data.my_bid_id && $auth.user().can(\'add-bid\')">Submit bid online</a> <a class="btn btn-lg btn-secondary disabled" href data-ng-if=data.my_bid_id>Bid Sent</a></div>');
    $templateCache.put("src/user/directory/directory.html", "<style>.ngrs-range-slider { background: transparent; border: 0; }\n" + "    .ngrs-range-slider .ngrs-handle {border: 0; background: transparent; }\n" + "    .ngrs-range-slider .ngrs-handle i {border-radius: 20px; width: 20px; height: 20px; background-color: #f4a703; box-shadow: 0 1px 1px 0 rgba(0,0,0,.4); }\n" + "    .ngrs-range-slider .ngrs-handle-min i, .ngrs-range-slider .ngrs-handle-max i {background: #f4a703; }\n" + '    .ngrs-range-slider .ngrs-join {background: #1298e6; height: 10px;}</style><div class="row row-offcanvas row-offcanvas-right"><div class="content col-sm-8">\x3c!-- <div class="alert alert-warning" role="alert" data-ng-if="!$auth.user().can(\'see-bid\')"> --\x3e<div class="alert alert-warning" role=alert data-ng-if="! $auth.isUser()"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden=true></span> <span class=sr-only>Warning:</span> Please note this area is for paying members only. Please contact us. @TODO verbiage for this</div><div class="panel panel-default"><div class="panel-heading buttons"><h3 class=panel-title>Browse Members Directory<div class=panel-heading-buttons><button class="btn btn-default btn-xs" data-ng-click=tableParams.reload()><i class=icon-refresh></i> <span class=hidden-xs>Refresh</span></button> <button class="btn btn-default btn-xs btn-offcanvas-toggle" offcanvas-toggle><i class="fa fa-ellipsis-v"></i></button></div></h3></div><div class="panel-body no-padder-v no-padder-h"><div sdcn-loader size=lg data-ng-show=loading></div><div class=not-found data-ng-show="!tableParams.total() && !loading"><h1>0</h1><div class=text>Sorry, no teams matching your criteria.</div></div><div class="table-responsive job-list job-list-md" data-ng-show="tableParams.total() && !loading"><table class=table data-ng-table=tableParams template-header=src/user/layout/elements/thead.html template-pagination=src/user/layout/elements/tfoot.html><tbody><tr data-ng-repeat="data in $data" data-ng-include="\'src/user/layout/elements/member-directory-single.html\'"></tr></tbody></table></div></div></div></div><aside class="sidebar col-sm-4 sidebar-offcanvas" role=complementary><div class="widget members-job-filters"><div class="panel panel-primary panel-sm"><div class=panel-heading><h3 class="panel-title toggle" ng-init="isCollapsed = $app.isSmartDevice" ng-click="isCollapsed = !isCollapsed"><span>Filter Results</span> <i class="pull-right fa fa-angle-up" ng-class="{\'fa-angle-down\': isCollapsed, \'fa-angle-up\': !isCollapsed}"></i></h3></div><div collapse=isCollapsed class=panel-collapse><div class=panel-body><form class=form role=form><div class=form-group><label>Search by Name</label><input class=form-control placeholder="Member name" ng-model-options="{ updateOn: \'default blur\', debounce: { \'default\': 200, \'blur\': 0 } }" ng-model="tableParams.filter()[\'search\']" ng-model-options="{ updateOn: \'blur\' }"></div><div class=form-group><div class="checkbox checkbox-secondary"><label class=text-white><input type=checkbox data-ng-model="filterByLocation"> <i></i> Filter by Location</label></div></div><div class=form-group data-ng-show=filterByLocation><label>Member Location <small>(Town/city/post code)</small></label><input class=form-control placeholder="Member Location" ng-model="tableParams.filter()[\'member_address\']" ng-model-options="{ updateOn: \'blur\' }" lng="tableParams.filter()[\'member_longitude\']" lat="tableParams.filter()[\'member_latitude\']" googleplace required></div><div class="form-group slider-horizontal-value" ng-if="tableParams.filter()[\'member_longitude\']"><label>Search Radius <small>({{ filters.member_miles }} miles)</small></label><slider class=slider-primary ng-model=filters.member_miles max=50 step=5></slider><span class=value>{{ filters.member_miles }}</span></div><div class=form-group><div class="checkbox checkbox-secondary"><label class=text-white><input type=checkbox data-ng-model="filterByVehicle"> <i></i> Filter by Vehicle Size</label></div></div><div class=form-group data-ng-show=filterByVehicle><label>Vehicle Size <small>From: {{ vehicles[(filters.vehicle_min/100) - 1].name }} To: {{ vehicles[(filters.vehicle_max/100) - 1].name }}</small></label><div range-slider min=min max=max model-min=filters.vehicle_min model-max=filters.vehicle_max ng-model-options="{ updateOn: \'blur\' }" step=100></div></div><div class=form-group><div class="checkbox checkbox-secondary"><label class=text-white><input type=checkbox data-ng-model="filterByBlockedMembers"> <i></i> Filter by Blocked Members</label></div></div></form></div></div></div></div></aside></div>');
    $templateCache.put("src/user/directory/map/map.html", '<style>.angular-google-map-container { height: 400px; width: 867px; }</style><div class=modal-header><h3 class=modal-title>User Location <button class="btn btn-default btn-sm pull-right" ng-click=$dismiss()>Cancel</button></h3></div><div class=modal-body style="min-height: 410px"><div class=map-canvas ng-if=$displayMap><ui-gmap-google-map id=map-canvas center=map.center zoom=map.zoom options=mapOptions control=map.control><ui-gmap-marker coords=map.center idkey=map.marker.key></ui-gmap-marker><ui-gmap-circle center=map.circle.center fill="{color: \'#063f60\', opacity: 0.3}" stroke="{color: \'#063f60\', weight: 1, opacity: 1}" radius=map.circle.radius clickable=false draggable=false editable=false visible events=map.circle.events fit=true></ui-gmap-circle></ui-gmap-google-map></div></div>');
    $templateCache.put("src/user/help/help.html", '<div class="row help"><div class="content col-sm-8"></div><aside class="sidebar col-sm-4" role=complementary><div class="widget widget-account" data-ng-controller=LoginController data-ng-include="\'src/user/layout/widgets/account.html\'"></div></aside></div>');
    $templateCache.put("src/user/jobs/allocate/allocate.html", '<div class="row row-offcanvas row-offcanvas-right"><div class="content col-sm-8"><form class=form role=form name=form><div class="panel panel-default"><div class="panel-heading buttons"><h3 class=panel-title>Allocate A Job<div class=panel-heading-buttons><button class="btn btn-default btn-xs btn-offcanvas-toggle" offcanvas-toggle><i class="fa fa-ellipsis-v"></i></button></div></h3></div><div class=panel-body><div class=row><div class=col-sm-6><div class=form-group><label>Pickup point *</label><input class=form-control placeholder="Pickup point" ng-model=data.pickup_point details=data.pickup_details lng=data.pickup_longitude lat=data.pickup_latitude googleplace required></div><div class=form-group ng-if="! data.pickup_asap"><label ng-if=!data.flexible_pickup>Pickup time *</label><label ng-if=data.flexible_pickup>Pickup time start *</label><i-dtp ng-model=data.pickup_date icon=calendar placeholder="Pickup time" min-date=minDate required></div><div class="checkbox checkbox-success form-group clearfix"><label class=pull-left ng-if="! data.flexible_pickup"><input class=pull-right type=checkbox ng-true-value=1 ng-false-value=0 ng-model=data.pickup_asap> <i></i> Pickup ASAP</label><label class=pull-right ng-if="! data.pickup_asap"><input class=pull-right type=checkbox ng-true-value=1 ng-false-value=0 ng-model=data.flexible_pickup> <i></i> Flexible Pickup</label></div><div class=form-group ng-if="data.flexible_pickup && ! data.pickup_asap"><label ng-else>Pickup time end *</label><i-dtp ng-model=data.pickup_date_end icon=calendar placeholder="Pickup time end" min-date="minDate"></div></div><div class=col-sm-6><div class=form-group><label>Final destination *</label><input class=form-control placeholder="Final destination" ng-model=data.destination_point details=data.destination_details lng=data.destination_longitude lat=data.destination_latitude googleplace required></div><div class=form-group ng-if="! data.destination_asap"><label ng-if=!data.flexible_destination>Delivery time *</label><label ng-if=data.flexible_destination>Delivery time start *</label><i-dtp ng-model=data.destination_date icon=calendar placeholder="Delivery time" min-date=minDate required></div><div class="checkbox checkbox-success form-group clearfix"><label class=pull-left ng-if="! data.flexible_destination"><input class=pull-right type=checkbox ng-true-value=1 ng-false-value=0 ng-model=data.destination_asap> <i></i> Deliver ASAP</label><label class=pull-right ng-if="! data.destination_asap"><input type=checkbox ng-true-value=1 ng-false-value=0 ng-model=data.flexible_destination> <i></i> Flexible Delivery</label></div><div class=form-group ng-if="data.flexible_destination && ! data.destination_asap"><label ng-else>Delivery time end*</label><i-dtp ng-model=data.destination_date_end icon=calendar placeholder="Delivery time end" min-date="minDate"></div></div><div class=col-sm-12><div class=form-group><label>Customer Job Reference Number (optional)</label><input class=form-control placeholder="Custom job reference number" ng-model="data.customer_job_reference_number"></div></div></div><div class=row><div class="col-sm-12 hidden"><div class=form-group><hr><div class=media><div class="waypoint m-b-sm" ng-repeat="item in data.way_points"><div class=media-body><div class=row><div class=col-sm-6><input class=form-control placeholder=Waypoint ng-model=item.waypoint details=item.pickup_details lng=item.longitude lat=item.latitude googleplace required></div><div class=col-sm-6><i-dtp ng-model=item.stopoff_date icon="calendar"></div></div></div><div class=media-right><a class="btn btn-link" href=# ng-click=removeFromWayPoints(item)><h3 class="text-danger m-t-none m-b-none"><span class=icon-close></span></h3></a></div></div><div class=text-right><a class="btn btn-link btn text-success" href=# ng-click=addToWayPoints()><span class=icon-plus></span> Add a way point</a></div></div></div></div><div class=col-sm-12 data-ng-if=data.distance><div class="well well-lg text-center"><div>Approximate mileage: <b>{{drivingDistance}} miles</b></div><div>Approximate duration: <b>{{data.duration}}</b></div></div></div></div></div></div><div class=ui-google-maps><div class="panel panel-default"><div class=panel-heading><h3 class=panel-title>Map preview</h3></div><div class=panel-body><ui-gmap-google-map id=map-canvas center=map.center zoom=map.zoom options=mapOptions bounds=map.bounds></ui-gmap-google-map></div></div></div><div class="panel panel-default"><div class=panel-heading><h3 class=panel-title>Allocate Manually</h3></div><div class=panel-body><div class=row><div class="col-md-6 col-sm-12"><div class=form-group ng-class="{\n' + "                      'has-error': form.amount.$error.number,\n" + "                      'has-success': form.amount.$valid,\n" + "                      'has-feedback': form.amount.$valid || form.amount.$error.number,\n" + '                    }"><label for=amount>Amount:</label><div class=input-group><span class=input-group-addon id=currency>£</span> <input type=number name=amount id=amount class=form-control data-ng-model=data.bid_amount min=0 aria-describedby=currency placeholder=0 required></div><span class="fa fa-check-circle form-control-feedback" aria-hidden=true data-ng-if=form.amount.$valid></span> <span class="fa fa-times-circle form-control-feedback" aria-hidden=true data-ng-if=form.amount.$error.number></span> <span class="label label-danger" data-ng-if=form.amount.$error.number>Numbers Only!</span></div></div><div class="col-md-6 col-sm-12"><div class=form-group data-ng-class="{\'has-feedback\': loadingUsers}"><label>Driver:</label><div class=autocomplete><input ng-model=selectedUser placeholder="Type name or email" typeahead="user as user.name_full for user in getUsers($viewValue)" typeahead-loading=loadingUsers typeahead-template-url=src/user/layout/elements/user-autocomplete.html typeahead-wait-ms=300 typeahead-on-select="setUserId($item, $model, $label)" class=form-control> <span class=form-control-feedback aria-hidden=true data-ng-show=loadingUsers><i class="fa fa-spin fa-circle-o-notch"></i></span></div></div></div></div></div></div><div class="panel panel-default"><div class=panel-body><div class=form-group><label>Vehicle required *</label><div class=row><div class="radio radio-success col-sm-6 radio-vehicle" data-ng-repeat="vehicle in vehicles"><input id=vehicle-{{vehicle.id}} type=radio name=vehicle-type data-ng-model=data.vehicle_id value={{vehicle.id}} ng-required="!data.vehicle_id"><label for=vehicle-{{vehicle.id}}><span class="vehicle pull-left" data-ng-if=vehicle.icon><svg-image data-ng-src=vehicle.icon></svg-image></span> <span class=pull-left>{{ vehicle.name }}</span><div class=clearfix></div></label></div></div></div><div class=form-group><label>Options</label><div class=row><div class="col-sm-6 checkbox checkbox-success" data-ng-repeat="option in vehicle_options"><label for="v-option-{{ $index }}"><input id="v-option-{{ $index }}" type=checkbox name=vehicle-options[] value="{{ option.id }}" data-ng-checked="data.options.indexOf(option) > -1" data-ng-click=toggleSelection(option)> {{ option.label }} <i></i></label></div><div class="col-sm-6 checkbox checkbox-success"><label><input type=checkbox ng-true-value=1 ng-false-value=0 ng-model=data.backload> <i></i> Back Load</label></div></div></div><div class=form-group><label for=notes>Notes</label><textarea id=notes class=form-control rows=3 data-ng-model=data.details></textarea></div><div class=form-group><label>Expiry Time</label><div class=row><div class=col-sm-6><i-dtp ng-model=data.expiry_time icon=calendar placeholder="Expiry Time" controls required></div></div></div><div class=form-group><label>Accept responses via</label><div class="checkbox checkbox-success"><label><input type=checkbox ng-true-value=1 ng-false-value=0 ng-model="data.accept_phone"> Phone <i></i></label></div></div><div class=form-group data-ng-show="data.accept_phone == 1"><label>Specify phone number if different from {{user.phone}}</label><input class=form-control placeholder=Phone ng-model="data.phone"></div>\x3c!--\n' + '                    <div class="form-group">\n' + '                        <div class="checkbox checkbox-success">\n' + "                            <label>\n" + '                                <input type="checkbox" ng-true-value="1" ng-false-value="0"\n' + '                                       ng-model="data.accept_email"/>\n' + "                                Email\n" + "                                <i></i>\n" + "                            </label>\n" + "                        </div>\n" + "                    </div>\n" + '                    <div class="form-group" data-ng-show="data.accept_email == 1">\n' + "                        <label>Specify email address if different from {{user.email}}</label>\n" + '                        <input type="text" class="form-control" placeholder="Email" ng-model="data.email"/>\n' + '                    </div>--\x3e</div></div><footer class=form-footer><button type=button class="btn btn-lg btn-success pull-right" ng-click=store() ng-disabled="form.$invalid || formSubmited || !selectedUser"><span data-ng-show=!formSubmited>Allocate Job</span> <span data-ng-show=formSubmited><i class="fa fa-spin fa-circle-o-notch"></i> Allocate Job</span></button> <span class=info>Make sure that you’ve filled in all of the key information to get the best response from our couriers...</span><div class=clearfix></div></footer></form></div><aside class="sidebar col-sm-4 sidebar-offcanvas" role=complementary><div class="widget widget-useful-links" data-ng-include="\'src/user/layout/widgets/useful-links.html\'"></div></aside></div>');
    $templateCache.put("src/user/jobs/browse/browse.html", '<div class="row row-offcanvas row-offcanvas-right browse"><div class="content col-sm-8"><div class="alert alert-warning" role=alert data-ng-if="!$auth.user().can(\'add-bid\')"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden=true></span> <span class=sr-only>Warning:</span> Please upload your insurance documents to your profile by clicking <a href data-ui-sref=user.account.profile.documents title=here>here</a>. We will then fully enable your account so you will be able to bid on jobs.</div><div class="panel panel-default"><div class="panel-heading buttons"><h3 class=panel-title>Browse Jobs<div class=panel-heading-buttons><button class="btn btn-default btn-xs" data-ng-click=tableParams.reload()><i class=icon-refresh></i> <span class=hidden-xs>Refresh</span></button> <button class="btn btn-default btn-xs btn-offcanvas-toggle" offcanvas-toggle><i class="fa fa-ellipsis-v"></i></button></div></h3></div><div class="panel-body no-padder-v no-padder-h"><div sdcn-loader size=lg data-ng-show=loading></div><div class=not-found data-ng-show="!tableParams.total() && !loading"><h1 ng-if=!error>0</h1><h1 ng-if=!error>No jobs matching your criteria.</h1><p ng-if=error class="alert alert-danger">{{ error.message }}</p></div><div class="table-responsive job-list job-list-md" data-ng-show="tableParams.total() && !loading"><table class=table data-ng-table=tableParams template-header=src/user/layout/elements/thead.html template-pagination=src/user/layout/elements/tfoot.html><tbody><tr data-ng-repeat="data in $data" data-ng-init="data.isCollapsed = true" data-ng-include="\'src/user/layout/elements/job-browse.html\'"></tr></tbody></table></div></div></div></div><aside class="sidebar col-sm-4 sidebar-offcanvas" role=complementary><div class="widget widget-job-filters"><div class="panel panel-primary panel-sm"><div class=panel-heading><h3 class="panel-title toggle" ng-init="isCollapsed = $app.isSmartDevice" ng-click="isCollapsed = !isCollapsed"><span>Filter Results</span> <i class="pull-right fa fa-angle-up" ng-class="{\'fa-angle-down\': isCollapsed, \'fa-angle-up\': !isCollapsed}"></i></h3></div><div collapse=isCollapsed class=panel-collapse><div class=panel-body><form class=form role=form><div class=form-group data-ng-show=vehicles><label>Vehicle Type</label><ui-select ng-model="tableParams.filter()[\'vehicle_id\']" data-search-enabled=false style="width: 100%"><ui-select-match allow-clear=true placeholder="Select a vehicle...">{{$select.selected.name}}</ui-select-match><ui-select-choices repeat="value.id as value in vehicles"><div ng-bind-html=value.name></div></ui-select-choices></ui-select></div><div class=form-group><div class="checkbox checkbox-secondary" ng-init="rand = Math.random()"><label class=text-white><input type=checkbox data-ng-model="filterByPickup"> <i></i> Filter by pickup point</label></div></div><div class=form-group data-ng-show=filterByPickup><label>Collection point <small>(Town/city/post code)</small></label><input class=form-control placeholder="Pickup point" ng-model="tableParams.filter()[\'pickup_address\']" ng-model-options="{ updateOn: \'blur\' }" lng="tableParams.filter()[\'pickup_longitude\']" lat="tableParams.filter()[\'pickup_latitude\']" googleplace required></div><div class="form-group slider-horizontal-value" data-ng-show="tableParams.filter()[\'pickup_address\']"><label>Distance from pickup point <small>({{ filters.pickup_miles }} miles)</small></label><slider class=slider-primary ng-model=filters.pickup_miles max=50 step=5></slider><span class=value>{{ filters.pickup_miles }}</span></div><div class=form-group><div class="checkbox checkbox-secondary"><label class=text-white><input type=checkbox data-ng-model="filterByDest"> <i></i> Filter by destination point</label></div></div><div class=form-group data-ng-show=filterByDest><label>Delivery point <small>(Town/city/post code)</small></label><input class=form-control placeholder="Delivery point" ng-model="tableParams.filter()[\'destination_address\']" ng-model-options="{ updateOn: \'blur\' }" lng="tableParams.filter()[\'destination_longitude\']" lat="tableParams.filter()[\'destination_latitude\']" googleplace required></div><div class="form-group slider-horizontal-value" data-ng-show="tableParams.filter()[\'destination_address\']"><label>Distance from delivery point <small>({{ filters.destination_miles }} miles)</small></label><slider class=slider-primary ng-model=filters.destination_miles max=50 step=5></slider><span class=value>{{ filters.destination_miles }}</span></div></form></div></div></div></div><div class="widget widget-useful-links" data-ng-include="\'src/user/layout/widgets/useful-links.html\'"></div></aside></div>');
    $templateCache.put("src/user/jobs/browse/submit/submit.html", '<div class=modal-header><h3 class=modal-title>Submit Bid <button class="btn btn-default btn-sm pull-right" data-ng-click=$dismiss()>Cancel</button></h3></div><div class=modal-body><form class=form-horizontal role=form name=form><div class=form-group><label class="col-sm-2 control-label font-bold">Job ID:</label><div class=col-sm-10><p class=form-control-static>#{{job.id}}</p></div></div><div class=form-group><label class="col-sm-2 control-label font-bold">Pickup Point:</label><div class=col-sm-10><p class=form-control-static ng-if="job.pickup_town == null || job.pickup_town == \'\'">{{job.pickup_point}}</p><p class=form-control-static ng-if="job.pickup_town != null && job.pickup_town != \'\'">{{job.pickup_town}}, {{job.pickup_postcode_prefix}}</p></div></div><div class=form-group><label class="col-sm-2 control-label font-bold">Destination Point:</label><div class=col-sm-10><p class=form-control-static ng-if="job.destination_town == null || job.destination_town == \'\'">{{job.destination_point}}</p><p class=form-control-static ng-if="job.destination_town != null && job.destination_town != \'\'">{{job.destination_town}}, {{job.destination_postcode_prefix}}</p></div></div><div class=form-group data-ng-if=getDistance(job)><label class="col-sm-2 control-label font-bold">Estimated distance:</label><div class=col-sm-10><p class=form-control-static>{{getDistance(job)}} miles</p></div></div><div class=form-group data-ng-if=job.duration><label class="col-sm-2 control-label font-bold">Estimated duration:</label><div class=col-sm-10 data-ng-if=getDistance(job)><p class=form-control-static>{{job.duration}}</p></div></div><div class=form-group ng-class="{\n' + "            'has-error': form.amount.$error.number,\n" + "            'has-success': form.amount.$valid,\n" + "            'has-feedback': form.amount.$valid || form.amount.$error.number,\n" + '        }"><label class="col-sm-2 control-label font-bold" for=amount>Amount:</label><div class=col-sm-4><div class=input-group><span class=input-group-addon id=currency>£</span> <input type=number name=amount id=amount class=form-control data-ng-model=data.amount min=0 aria-describedby=currency placeholder=0 required></div><span class="fa fa-check-circle form-control-feedback" aria-hidden=true data-ng-if=form.amount.$valid></span> <span class="fa fa-times-circle form-control-feedback" aria-hidden=true data-ng-if=form.amount.$error.number></span> <span class="label label-danger" data-ng-if=form.amount.$error.number>Numbers Only!</span></div></div><div class=form-group><div class="col-sm-offset-2 col-sm-10"><div class="checkbox checkbox-success"><label><input type=checkbox data-ng-model="notes"> Add note <i></i></label></div></div></div><div class=form-group ng-show=notes><label class="col-sm-2 control-label font-bold">Notes:</label><div class=col-sm-10><textarea class=form-control data-ng-model=data.details></textarea></div></div></form></div><div class="modal-footer text-right"><button type=button class="btn btn-lg btn-success" ng-click=store() ng-disabled="formSubmited || form.$invalid || loading"><span data-ng-show=!formSubmited>Submit Bid</span> <span data-ng-show=formSubmited><i class="fa fa-spin fa-circle-o-notch"></i> Submit Bid</span></button></div>');
    $templateCache.put("src/user/jobs/edit/edit.html", '<div class="row row-offcanvas row-offcanvas-right"><div class="content col-sm-8"><form class=form role=form name=form><div class="panel panel-default"><div class="panel-heading buttons"><h3 class=panel-title>Edit Job<div class=panel-heading-buttons><button class="btn btn-default btn-xs btn-offcanvas-toggle" offcanvas-toggle><i class="fa fa-ellipsis-v"></i></button></div></h3></div><div class=panel-body><div class=row><div class=col-sm-6><div class=form-group><label>Pickup point *</label><input class=form-control placeholder="Pickup point" ng-model=data.pickup_point details=data.pickup_details lng=data.pickup_longitude lat=data.pickup_latitude googleplace required></div><div class=form-group ng-if="! data.pickup_asap"><label ng-if=!data.flexible_pickup>Pickup time *</label><label ng-if=data.flexible_pickup>Pickup time start *</label><i-dtp ng-model=data.pickup_date icon=calendar placeholder="Pickup time" required></div><div class="checkbox checkbox-success form-group clearfix"><label class=pull-left ng-if="! data.flexible_pickup"><input class=pull-right type=checkbox ng-true-value=1 ng-false-value=0 ng-model=data.pickup_asap> <i></i> Pickup ASAP</label><label class=pull-right ng-if="! data.pickup_asap"><input class=pull-right type=checkbox ng-true-value=1 ng-false-value=0 ng-model=data.flexible_pickup> <i></i> Flexible Pickup</label></div><div class=form-group ng-if="data.flexible_pickup && ! data.pickup_asap"><label ng-else>Pickup time end *</label><i-dtp ng-model=data.pickup_date_end icon=calendar placeholder="Pickup time end"></div></div><div class=col-sm-6><div class=form-group><label>Final destination *</label><input class=form-control placeholder="Final destination" ng-model=data.destination_point details=data.destination_details lng=data.destination_longitude lat=data.destination_latitude googleplace required></div><div class=form-group ng-if="! data.destination_asap"><label ng-if=!data.flexible_destination>Delivery time *</label><label ng-if=data.flexible_destination>Delivery time start *</label><i-dtp ng-model=data.destination_date icon=calendar placeholder="Delivery time" required></div><div class="checkbox checkbox-success form-group clearfix"><label class=pull-left ng-if="! data.flexible_destination"><input class=pull-right type=checkbox ng-true-value=1 ng-false-value=0 ng-model=data.destination_asap> <i></i> Deliver ASAP</label><label class=pull-right ng-if="! data.destination_asap"><input type=checkbox ng-true-value=1 ng-false-value=0 ng-model=data.flexible_destination> <i></i> Flexible Delivery</label></div><div class=form-group ng-if="data.flexible_destination && ! data.destination_asap"><label ng-else>Delivery time end*</label><i-dtp ng-model=data.destination_date_end icon=calendar placeholder="Delivery time end"></div></div><div class=col-sm-12><div class=form-group><label>Customer Job Reference Number (optional)</label><input class=form-control placeholder="Custom job reference number" ng-model="data.customer_job_reference_number"></div></div></div><div class=row><div class="col-sm-12 hidden"><div class=form-group><hr><div class=media><div class="waypoint m-b-sm" ng-repeat="item in data.way_points"><div class=media-body><div class=row><div class=col-sm-6><input class=form-control placeholder=Waypoint ng-model=item.waypoint details=item.pickup_details lng=item.longitude lat=item.latitude googleplace required></div><div class=col-sm-6><i-dtp ng-model=item.stopoff_date icon="calendar"></div></div></div><div class=media-right><a class="btn btn-link" href=# ng-click=removeFromWayPoints(item)><h3 class="text-danger m-t-none m-b-none"><span class=icon-close></span></h3></a></div></div><div class=text-right><a class="btn btn-link btn text-success" href=# ng-click=addToWayPoints()><span class=icon-plus></span> Add a way point</a></div></div></div></div><div class=col-sm-12 data-ng-if=data.distance><div class="well well-lg text-center"><div>Approximate mileage: <b>{{drivingDistance}} miles</b></div><div>Approximate duration: <b>{{data.duration}}</b></div></div></div></div></div></div><div class="panel panel-default"><div class=panel-body><div class=form-group><label>Vehicle required *</label><div class=row><div class="radio radio-success col-sm-6 radio-vehicle" data-ng-repeat="vehicle in vehicles"><input id=vehicle-{{vehicle.id}} type=radio name=vehicle-type data-ng-model=data.vehicle_id value={{vehicle.id}} ng-required="!data.vehicle_id"><label for=vehicle-{{vehicle.id}}><span class="vehicle pull-left" data-ng-if=vehicle.icon><svg-image data-ng-src=vehicle.icon></svg-image></span> <span class=pull-left>{{ vehicle.name }}</span><div class=clearfix></div></label></div></div></div><div class=form-group><label>Options</label><div class=row><div class="col-sm-6 checkbox checkbox-success" data-ng-repeat="option in vehicle_options"><label for="v-option-{{ $index }}"><input id="v-option-{{ $index }}" type=checkbox name=additional_options[] value="{{ option.label }}" data-ng-checked="data.additional_options.indexOf(option.label) > -1" data-ng-click=toggleSelection(option.label)> {{ option.label }} <i></i></label></div><div class="col-sm-6 checkbox checkbox-success"><label><input type=checkbox ng-true-value=1 ng-false-value=0 ng-model=data.backload> <i></i> Back Load</label></div></div></div><div class=form-group><label for=notes>Notes</label><textarea id=notes class=form-control rows=3 data-ng-model=data.details></textarea></div><div class=form-group><label>Expiry Time</label><div class=row><div class=col-sm-6><i-dtp ng-model=data.expiry_time icon=calendar placeholder="Expiry Time" controls required></div></div></div><div class=form-group><label>Accept responses via</label><div class=row><div class="col-md-6 checkbox checkbox-success"><label for=accept_phone><input id=accept_phone type=checkbox ng-true-value=1 ng-false-value=0 ng-model="data.accept_phone"> <i></i> Phone</label></div><div class="col-sm-6 checkbox checkbox-success"><label for=accept_online><input type=checkbox ng-true-value=1 ng-false-value=0 ng-model=data.accept_online id=accept_online> <i></i> Online</label></div></div></div><div class=form-group data-ng-show="data.accept_phone == 1"><label>Specify phone number if different from {{user.phone}}</label><input class=form-control placeholder=Phone ng-model="data.phone"></div>\x3c!--\n' + '                    <div class="form-group">\n' + '                        <div class="checkbox checkbox-success">\n' + "                            <label>\n" + '                                <input type="checkbox" ng-true-value="1" ng-false-value="0"\n' + '                                       ng-model="data.accept_email"/>\n' + "                                Email\n" + "                                <i></i>\n" + "                            </label>\n" + "                        </div>\n" + "                    </div>\n" + '                    <div class="form-group" data-ng-show="data.accept_email == 1">\n' + "                        <label>Specify email address if different from {{user.email}}</label>\n" + '                        <input type="text" class="form-control" placeholder="Email" ng-model="data.email"/>\n' + '                    </div>--\x3e</div></div><footer class=form-footer><button type=button class="btn btn-lg btn-success pull-right" ng-click=update() ng-disabled="form.$invalid || formSubmited"><span data-ng-show=!formSubmited>Save</span> <span data-ng-show=formSubmited><i class="fa fa-spin fa-circle-o-notch"></i> Save</span></button> <span class=info>Make sure that you’ve filled in all of the key information to get the best response from our couriers...</span><div class=clearfix></div></footer></form></div><aside class="sidebar col-sm-4 sidebar-offcanvas" role=complementary><div class="widget widget-gmaps"><div class="panel panel-default"><div class=panel-heading><h3 class=panel-title>Map preview</h3></div><div class=panel-body><ui-gmap-google-map id=map-canvas center=map.center zoom=map.zoom options=mapOptions bounds=map.bounds></ui-gmap-google-map></div></div></div><div class="widget widget-useful-links" data-ng-include="\'src/user/layout/widgets/useful-links.html\'"></div></aside></div>');
    $templateCache.put("src/user/jobs/post/post.html", '<div class="row row-offcanvas row-offcanvas-right"><div class="content col-sm-8"><form class=form role=form name=form><div class="panel panel-default"><div class="panel-heading buttons"><h3 class=panel-title>Post A Job<div class=panel-heading-buttons><button class="btn btn-default btn-xs btn-offcanvas-toggle" offcanvas-toggle><i class="fa fa-ellipsis-v"></i></button></div></h3></div><div class=panel-body><div class=row><div class=col-sm-6><div class=form-group><label>Pickup point *</label><input class=form-control placeholder="Pickup point" ng-model=data.pickup_point details=data.pickup_details lng=data.pickup_longitude lat=data.pickup_latitude googleplace required> <input type=hidden id=pickup_town ng-model="data.pickup_town"></div><div class=form-group ng-if="! data.pickup_asap"><label ng-if=!data.flexible_pickup>Pickup time *</label><label ng-if=data.flexible_pickup>Pickup time start *</label><i-dtp ng-model=data.pickup_date icon=calendar placeholder="Pickup time" min-date=minDate required></div><div class="checkbox checkbox-success form-group clearfix"><label class=pull-left ng-if="! data.flexible_pickup"><input class=pull-right type=checkbox ng-true-value=1 ng-false-value=0 ng-model=data.pickup_asap> <i></i> Pickup ASAP</label><label class=pull-right ng-if="! data.pickup_asap"><input class=pull-right type=checkbox ng-true-value=1 ng-false-value=0 ng-model=data.flexible_pickup> <i></i> Flexible Pickup</label></div><div class=form-group ng-if="data.flexible_pickup && ! data.pickup_asap"><label ng-else>Pickup time end *</label><i-dtp ng-model=data.pickup_date_end icon=calendar placeholder="Pickup time end" min-date="minDate"></div></div><div class=col-sm-6><div class=form-group><label>Final destination *</label><input class=form-control placeholder="Final destination" ng-model=data.destination_point details=data.destination_details lng=data.destination_longitude lat=data.destination_latitude googleplace required></div><div class=form-group ng-if="! data.destination_asap"><label ng-if=!data.flexible_destination>Delivery time *</label><label ng-if=data.flexible_destination>Delivery time start *</label><i-dtp ng-model=data.destination_date icon=calendar placeholder="Delivery time" min-date=minDate required></div><div class="checkbox checkbox-success form-group clearfix"><label class=pull-left ng-if="! data.flexible_destination"><input class=pull-right type=checkbox ng-true-value=1 ng-false-value=0 ng-model=data.destination_asap> <i></i> Deliver ASAP</label><label class=pull-right ng-if="! data.destination_asap"><input type=checkbox ng-true-value=1 ng-false-value=0 ng-model=data.flexible_destination> <i></i> Flexible Delivery</label></div><div class=form-group ng-if="data.flexible_destination && ! data.destination_asap"><label ng-else>Delivery time end*</label><i-dtp ng-model=data.destination_date_end icon=calendar placeholder="Delivery time end" min-date="minDate"></div></div><div class=col-sm-12><div class=form-group><label>Customer Job Reference Number (optional)</label><input class=form-control placeholder="Custom job reference number" ng-model="data.customer_job_reference_number"></div></div></div><div class=row><div class="col-sm-12 hidden"><div class=form-group><hr><div class=media><div class="waypoint m-b-sm" ng-repeat="item in data.way_points"><div class=media-body><div class=row><div class=col-sm-6><input class=form-control placeholder=Waypoint ng-model=item.waypoint details=item.pickup_details lng=item.longitude lat=item.latitude googleplace required></div><div class=col-sm-6><i-dtp ng-model=item.stopoff_date icon="calendar"></div></div></div><div class=media-right><a class="btn btn-link" href=# ng-click=removeFromWayPoints(item)><h3 class="text-danger m-t-none m-b-none"><span class=icon-close></span></h3></a></div></div><div class=text-right><a class="btn btn-link btn text-success" href=# ng-click=addToWayPoints()><span class=icon-plus></span> Add a way point</a></div></div></div></div><div class=col-sm-12 data-ng-if=data.distance><div class="well well-lg text-center"><div>Approximate mileage: <b>{{drivingDistance}} miles</b></div><div>Approximate duration: <b>{{data.duration}}</b></div></div></div></div></div></div><div class=ui-google-maps><div class="panel panel-default"><div class=panel-heading><h3 class=panel-title>Map preview</h3></div><div class=panel-body><ui-gmap-google-map id=map-canvas center=map.center zoom=map.zoom options=mapOptions bounds=map.bounds></ui-gmap-google-map></div></div></div><div class="panel panel-default"><div class=panel-body><div class=form-group><label>Vehicle required *</label><div class=row><div class="radio radio-success col-sm-6 radio-vehicle" data-ng-repeat="vehicle in vehicles"><input id=vehicle-{{vehicle.id}} type=radio name=vehicle-type data-ng-model=data.vehicle_id value={{vehicle.id}} ng-required="!data.vehicle_id"><label for=vehicle-{{vehicle.id}}><span class="vehicle pull-left" data-ng-if=vehicle.icon><svg-image data-ng-src=vehicle.icon></svg-image></span> <span class=pull-left>{{ vehicle.name }}</span><div class=clearfix></div></label></div></div></div><div class=form-group><label>Options</label><div class=row><div class="col-sm-6 checkbox checkbox-success" data-ng-repeat="option in vehicle_options"><label for="v-option-{{ $index }}"><input id="v-option-{{ $index }}" type=checkbox name=vehicle-options[] value="{{ option.id }}" data-ng-checked=filterOptions(option.label) data-ng-click=toggleSelection(option)> {{ option.label }} <i></i></label></div><div class="col-sm-6 checkbox checkbox-success"><label><input type=checkbox ng-true-value=1 ng-false-value=0 ng-model=data.backload> <i></i> Back Load</label></div></div></div><div class=form-group><label for=notes>Notes</label><textarea id=notes class=form-control rows=3 data-ng-model=data.details></textarea></div><div class=form-group><label>Expiry Time</label><div class=row><div class=col-sm-6><i-dtp ng-model=data.expiry_time icon=calendar placeholder="Expiry Time" controls required></div></div></div><div class=form-group><label>Accept responses via</label><div class=row><div class="col-md-6 checkbox checkbox-success"><label for=accept_phone><input type=checkbox ng-true-value=1 ng-false-value=0 id=accept_phone ng-model="data.accept_phone"> <i></i> Phone</label></div><div class="col-sm-6 checkbox checkbox-success"><label for=accept_online><input type=checkbox ng-true-value=1 ng-false-value=0 ng-model=data.accept_online id=accept_online> <i></i> Online</label></div></div></div><div class=form-group data-ng-show="data.accept_phone == 1"><label>Specify phone number if different from {{user.phone}}</label><input class=form-control placeholder=Phone ng-model="data.phone"></div>\x3c!--\n' + '                    <div class="form-group">\n' + '                        <div class="checkbox checkbox-success">\n' + "                            <label>\n" + '                                <input type="checkbox" ng-true-value="1" ng-false-value="0"\n' + '                                       ng-model="data.accept_email"/>\n' + "                                Email\n" + "                                <i></i>\n" + "                            </label>\n" + "                        </div>\n" + "                    </div>\n" + '                    <div class="form-group" data-ng-show="data.accept_email == 1">\n' + "                        <label>Specify email address if different from {{user.email}}</label>\n" + '                        <input type="text" class="form-control" placeholder="Email" ng-model="data.email"/>\n' + '                    </div>--\x3e</div></div><footer class=form-footer><button type=button class="btn btn-lg btn-success pull-right" ng-click=store() ng-disabled="form.$invalid || formSubmited"><span data-ng-show=!formSubmited>Post Job</span> <span data-ng-show=formSubmited><i class="fa fa-spin fa-circle-o-notch"></i> Post Job</span></button> <span class=info>Make sure that you’ve filled in all of the key information to get the best response from our couriers...</span><p class="info m-t-sm">Same Day Courier Network cannot guarantee that Members based outside of the UK have the correct insurances and therefore are not liable for any issues that may arise</p><div class=clearfix></div></footer></form></div><aside class="sidebar col-sm-4 sidebar-offcanvas" role=complementary><div class="widget widget-useful-links" data-ng-include="\'src/user/layout/widgets/useful-links.html\'"></div></aside></div>');
    $templateCache.put("src/user/layout/aside.html", "<div class=aside-wrap>\x3c!-- if you want to use a custom scroll when aside fixed, use the slimScroll\n" + '    <div class="navi-wrap" ui-jq="slimScroll" ui-options="{height:\'100%\', size:\'8px\'}">\n' + '  --\x3e<div class=navi-wrap data-ng-controller=LoginController>\x3c!-- user --\x3e<div class="clearfix hidden-xs text-center hide" id=aside-user><div class="dropdown wrapper" dropdown><a ui-sref={{$app.mode()}}.profile><span class="thumb-lg w-auto-folded avatar m-t-sm"><img data-ng-src={{avatar()}} class=img-full alt=...></span></a> <a href class="dropdown-toggle hidden-folded" dropdown-toggle><span class=clear><span class="block m-t-sm"><strong class="font-bold text-lt">{{auth.user().name_full}}</strong> <b class=caret></b></span></span></a>\x3c!-- dropdown --\x3e<ul class="dropdown-menu animated fadeInRight w hidden-folded"><li><a ng-if="$app.mode()==\'user\'" data-ui-sref=user.profile>Profile</a></li><li ng-if="$app.mode()==\'user\'" class=divider></li><li><a ng-click=logout()>Logout</a></li></ul>\x3c!-- / dropdown --\x3e</div><div class="line dk hidden-folded"></div></div>\x3c!-- / user --\x3e\x3c!-- nav --\x3e<nav ui-nav class="navi clearfix" ng-include="\'src/user/layout/nav.html\'"></nav>\x3c!-- nav --\x3e\x3c!-- aside footer --\x3e<div class="wrapper m-t"></div>\x3c!-- / aside footer --\x3e</div></div>');
    $templateCache.put("src/user/layout/elements/feedback.html", '<td class="no-padder-v no-padder-l b-t-none"><div class="pull-left thumb-sm avatar m-l-n-md m-t"><img data-ng-src={{data.sender.avatar_url}} alt={{data.sender.name_full}}></div><div class="m-l-lg m-b-lg panel b-a bg-light pos-rlt"><span class="arrow arrow-light left"></span><div class=panel-body data-ng-if=data><div class=m-b><i>“{{data.comment}}”</i></div><rating class="rating read-only" ng-model=data.rating max=5 state-on="\'glyphicon glyphicon-star text-info\'" state-off="\'glyphicon glyphicon-star-empty text-info\'" data-readonly=true></rating><small class=text-muted>- {{data.sender.name_full}} ({{data.sender.team_info.company_name}}) - <i>{{data.created_at | amDateFormat:\'DD/MM/YYYY HH:mm\'}}</i></small></div></div></td>');
    $templateCache.put("src/user/layout/elements/job-account.html", '<td class="job status-{{data.status}}"><div class=job-header><div class=row><div class=col-sm-6><h3>{{job.bid}} Job ID: #{{data.id}}<div class="btn-group visible-xs pull-right" dropdown is-open=status.isopen data-ng-show="data.status != \'expire\'"><button type=button class="btn btn-sm btn-secondary dropdown-toggle" dropdown-toggle="" ng-disabled=disabled aria-haspopup=true aria-expanded=true>Job Actions <span class=caret></span></button><ul class=dropdown-menu role=menu>\x3c!-- Repost job --\x3e<li><a ui-sref="user.jobs.post({repost_job: data})">Repost Job</a></li>\x3c!--Edit Job--\x3e<li data-ng-if="data.status == \'active\' "><a ui-sref="user.jobs.edit({job: data, job_id: data.id})">Edit</a></li>\x3c!--View Job Notes--\x3e<li><a data-ng-if=" data.details != null " ui-sref="user.account.jobs.notes({job_id: data.id,  notes: data.details})">View Job Notes</a></li>\x3c!--View POD--\x3e<li data-ng-if="data.status == \'delivered\' || data.status == \'invoice\' || data.status == \'complete\' "><a ui-sref="user.account.jobs.pod({job_id: data.id})">View POD</a></li>\x3c!--View Invoice--\x3e<li data-ng-if="data.status == \'invoice\' || data.status == \'complete\'"><a ui-sref="user.account.jobs.invoice({job_id: data.id})">View Invoice</a></li>\x3c!--Cancel job--\x3e<li data-ng-if="data.status == \'active\' || data.status == \'progress\' "><a ui-sref="user.account.jobs.cancel({job_id: data.id})">Cancel</a></li>\x3c!--Allocate the job manually--\x3e<li data-ng-if="data.status == \'active\' "><a ui-sref="user.account.jobs.manual({job_id: data.id})">Allocate Manual</a></li>\x3c!--Add POD--\x3e<li data-ng-if="data.status == \'progress\' "><a ui-sref="user.account.work.pod({job_id: data.id})">Upload POD</a></li>\x3c!--Leave feedback--\x3e<li data-ng-if="(data.status == \'invoice\' || data.status == \'delivered\' || data.status == \'complete\') && !data.bid.feedback"><a ui-sref="user.account.feedback.add({job_id: data.id, bid_id: data.bid.id})">Leave feedback</a></li>\x3c!--Complete the job--\x3e<li data-ng-if=" data.status == \'invoice\' && data.payment_received && data.status != \'completed\' "><a data-ng-click=complete(data)>Complete Job</a></li>\x3c!--Read feedback--\x3e<li data-ng-if="data.feedback || (data.bid && data.bid.feedback)"><a ui-sref="user.account.jobs.feedback({job_id: data.id})">Read feedback</a></li>\x3c!--Review bids--\x3e<li data-ng-if="data.status != \'complete\'"><a ui-sref="user.account.jobs.bids({job_id: data.id})">Review Bids ({{data.bids_count}})</a></li></ul></div></h3></div><div class=col-sm-6><h3 class="text-right-sm text-u-f"><span class="label label-default label-{{data.status}}">Status: {{ getJobStatus(data) }}</span></h3></div></div></div><div class=media><div class="media-left hidden-xs"><div class=vehicle><svg-image data-ng-src=data.vehicle_icon></svg-image></div></div><div class=media-body><div class=row><div class=col-sm-5><div class=pick-up><small class=text-info>Pick Up</small> <span class=point ng-if="data.pickup_formatted_address == null || data.pickup_formatted_address == \'\'">{{data.pickup_point}}</span> <span class=point ng-if="data.pickup_formatted_address != null && data.pickup_formatted_address != \'\'">{{data.pickup_formatted_address}}</span> <span ng-if="!data.flexible_pickup && !data.pickup_asap"><span class=date>{{data.pickup_date | amDateFormat:\'DD/MM/YYYY HH:mm\'}}</span></span> <span ng-if="data.flexible_pickup && !data.pickup_asap"><span class=date style="margin: 0"><b>FROM</b> {{data.pickup_date | amDateFormat:\'DD/MM/YYYY HH:mm\'}}</span> <span class=date><b>TO</b> {{data.pickup_date_end | amDateFormat:\'DD/MM/YYYY HH:mm\'}}</span></span> <span class=date ng-if=data.pickup_asap><strong class=text-success>Pickup ASAP</strong></span></div><div class=drop-off><small class=text-info>Drop Off</small> <span class=point ng-if="data.destination_formatted_address == null || data.destination_formatted_address == \'\'">{{data.destination_point}}</span> <span class=point ng-if="data.destination_formatted_address != null && data.destination_formatted_address != \'\'">{{data.destination_formatted_address}}</span> <span ng-if="!data.flexible_destination && !data.destination_asap"><span class=date>{{data.destination_date | amDateFormat:\'DD/MM/YYYY HH:mm\'}}</span></span> <span ng-if="data.flexible_destination && !data.destination_asap"><span class=date style="margin: 0"><b>FROM</b>{{data.destination_date | amDateFormat:\'DD/MM/YYYY HH:mm\'}}</span> <span class=date><b>TO</b>{{data.destination_date_end | amDateFormat:\'DD/MM/YYYY HH:mm\'}}</span></span> <span class=date ng-if=data.destination_asap><strong class=text-success>Deliver ASAP</strong></span></div></div><div class=col-sm-7><div class=well>\x3c!--Job info--\x3e<h5 class=m-t-none>Job Info</h5><div class="m-t-xs b-t">\x3c!--Progress--\x3e<p class="m-b-none text-muted m-t-xs"><span class=font-bold>Progress:</span> {{ getJobInfo(data) }}</p>\x3c!--Backload--\x3e<p class="m-b-none text-muted m-t-xs" ng-if=data.backload><span class=font-bold>Backload:</span> Yes</p>\x3c!-- Additional Options --\x3e<div class="text-muted m-b-none" ng-if="data.additional_options[0] !== \'\'"><span class=font-bold>Options:</span> <span ng-repeat="option in data.additional_options"><span ng-if="$index !== 0">-</span>{{ option }}</span></div>\x3c!-- Posted by--\x3e<div class="text-muted m-b-none" data-ng-if="$state.$current.name==\'user.account.team.jobs\'"><span class=font-bold>Posted by:</span> {{ data.user_info.name_full }}</div>\x3c!--Expiry time--\x3e<p class="text-muted m-b-none" data-ng-if="data.status == \'active\' || data.status == \'expire\'"><span class=font-bold>Expiry time:</span> {{data.expiry_time | amDateFormat:\'DD/MM/YYYY HH:mm\'}}</p>\x3c!--Payment status--\x3e<p class="text-muted m-b-none" data-ng-if="data.status == \'invoice\' || data.status == \'complete\'"><span class=font-bold>Payment status:</span> {{data.payment_received ? \'Paid\' : \'Unpaid\'}}</p>\x3c!--Member name--\x3e<p class="text-muted m-b-none" data-ng-show=data.bid.user.name_full><span class=font-bold>Member:</span> {{ data.user_info.team_info.company_name }}</p>\x3c!--Accepted price--\x3e<p class="text-muted m-b-none" data-ng-show=data.bid_amount><span class=font-bold>Accepted price:</span> {{data.bid_amount | currency:\'£\'}} <span data-ng-if=data.bid.add_vat>+ VAT</span></p>\x3c!--Feedback--\x3e<div class="ratings ratings-sm" data-ng-if=data.feedback.rating><span class="text-muted font-bold">Feedback:</span><rating class="rating read-only" ng-model=data.feedback.rating max=5 state-on="\'glyphicon glyphicon-star text-info\'" state-off="\'glyphicon glyphicon-star-empty text-info\'" data-readonly=true></rating></div>\x3c!--Bid notes--\x3e<p class="text-muted m-b-none" data-ng-if=data.bid.details><span class=font-bold>Bid notes:</span> {{data.bid.details}}</p></div></div></div></div></div></div><div class="job-actions well well-sm text-right m-b-none hidden-xs" data-ng-show="data.status != \'expire\'">\x3c!-- Repost job --\x3e<a class="btn btn-xs btn-primary" ui-sref="user.jobs.post({repost_job: data})">Repost Job</a>\x3c!--Edit job--\x3e <a class="btn btn-xs btn-primary" data-ng-if=" data.status == \'active\' " ui-sref="user.jobs.edit({job: data, job_id: data.id})">Edit</a>\x3c!--Job notes--\x3e <a class="btn btn-xs btn-primary" data-ng-if=" data.details != null " ui-sref="user.account.jobs.notes({job_id: data.id, notes: data.details, bid_details: data.bid_details })">View Job Notes</a>\x3c!--Cancel job--\x3e <a class="btn btn-xs btn-danger" data-ng-if=" data.status == \'active\' || data.status == \'progress\'" ui-sref="user.account.jobs.cancel({job_id: data.id})">Cancel</a>\x3c!--Allocate the job manually--\x3e <a class="btn btn-xs btn-primary" data-ng-if=" data.status == \'active\' " ui-sref="user.account.jobs.manual({job_id: data.id})">Allocate Manual</a>\x3c!--Review bids--\x3e <a class="btn btn-xs" data-ng-if="data.status != \'complete\'" data-ng-class="{\'btn-info\' : data.status == \'active\', \'btn-primary\' : data.status != \'active\'}" ui-sref="user.account.jobs.bids({job_id: data.id})">Review Bids ({{data.bids_count}})</a>\x3c!--Upload POD--\x3e <a class="btn btn-xs btn-secondary" data-ng-show=" data.status == \'progress\' " ui-sref="user.account.work.pod({job_id: data.id})">Upload POD</a>\x3c!--Read feedback--\x3e <a class="btn btn-xs btn-primary" data-ng-if="data.feedback || (data.bid && data.bid.feedback)" ui-sref="user.account.jobs.feedback({job_id: data.id})">Read feedback</a>\x3c!--View POD--\x3e <a class="btn btn-xs btn-primary" data-ng-if=" data.status == \'delivered\' || data.status == \'invoice\' || data.status == \'complete\' " ui-sref="user.account.jobs.pod({job_id: data.id})">View POD</a>\x3c!--View Invoice--\x3e <a class="btn btn-xs btn-primary" data-ng-if=" data.status == \'invoice\' || data.status == \'complete\'" ui-sref="user.account.jobs.invoice({job_id: data.id})">View Invoice</a>\x3c!--Leave feedback--\x3e <a class="btn btn-xs btn-info" data-ng-if="(data.status == \'invoice\' || data.status == \'delivered\' || data.status == \'complete\') && !data.bid.feedback" ui-sref="user.account.feedback.add({job_id: data.id, bid_id: data.bid.id})">Leave feedback</a>\x3c!--Complete the job--\x3e <a class="btn btn-xs btn-complete" data-ng-click=complete(data) data-ng-disabled=formSubmitted data-ng-if=" data.status == \'invoice\' && data.payment_received && data.status != \'completed\' "><span data-ng-show=!formSubmitted>Complete Job</span> <span data-ng-show=formSubmitted><i class="fa fa-spin fa-circle-o-notch"></i> Complete Job</span></a></div><div class="job-actions well well-sm text-right m-b-none hidden-xs" data-ng-show="data.status == \'expire\'">\x3c!-- Repost job --\x3e<a class="btn btn-xs btn-primary" ui-sref="user.jobs.post({repost_job: data})">Repost Job</a></div></td>');
    $templateCache.put("src/user/layout/elements/job-browse.html", '<td class="job job-browse" data-ng-class="{\'bid-sent\': data.my_bid_id}"><div class=media><div class=media-left data-ng-if=data.vehicle_icon><div class=vehicle><svg-image data-ng-src=data.vehicle_icon title="{{ data.name }}"></svg-image></div><span>{{ data.vehicle_name }}</span></div><div class=media-body><div class=col-sm-6><small class=text-info>Pick Up</small> <span class=point ng-if="data.pickup_town == null || data.pickup_town == \'\'">{{data.pickup_point}}</span> <span class=point ng-if="data.pickup_town != null && data.pickup_town != \'\'">{{data.pickup_town}}, {{data.pickup_postcode_prefix}}</span> <span ng-if="!data.flexible_pickup && !data.pickup_asap"><span class=date>{{data.pickup_date | amDateFormat:\'DD/MM/YYYY HH:mm\'}}</span></span> <span ng-if="data.flexible_pickup && !data.pickup_asap"><span class=date style="margin: 0"><b>FROM</b> {{data.pickup_date | amDateFormat:\'DD/MM/YYYY HH:mm\'}}</span> <span class=date><b>TO</b> {{data.pickup_date_end | amDateFormat:\'DD/MM/YYYY HH:mm\'}}</span></span> <span ng-if=data.pickup_asap class=date><strong class=text-success>Pickup ASAP</strong></span> <span><a href="" class="btn btn-xs btn-danger-darker" ng-if=data.backload style="display: inline-block; margin: 1px">back load</a></span></div><div class=col-sm-6><small class=text-info>Drop Off</small> <span class=point ng-if="data.destination_town == null || data.destination_town == \'\'">{{data.destination_point}}</span> <span class=point ng-if="data.destination_town != null && data.destination_town != \'\'">{{data.destination_town}}, {{data.destination_postcode_prefix}}</span> <span ng-if="!data.flexible_destination && !data.destination_asap"><span class=date>{{data.destination_date | amDateFormat:\'DD/MM/YYYY HH:mm\'}}</span></span> <span ng-if="data.flexible_destination && !data.destination_asap"><span class=date style="margin: 0"><b>FROM</b> {{data.destination_date | amDateFormat:\'DD/MM/YYYY HH:mm\'}}</span> <span class=date><b>TO</b> {{data.destination_date_end | amDateFormat:\'DD/MM/YYYY HH:mm\'}}</span></span> <span class=date ng-if=data.destination_asap><strong class=text-success>Deliver ASAP</strong></span></div><div class=col-sm-12 ng-if="data.additional_options[0] !== \'\'"><span ng-repeat="option in data.additional_options track by $index" style="display: inline-block; margin: 1px"><a href class="btn btn-xs btn-warning">{{ option }}</a></span></div><div class=clearfix></div></div><div class="media-right text-middle text-right"><button type=button class="btn btn-xs btn-warning" data-ng-click="data.isCollapsed = !data.isCollapsed; initMap(data);" data-ng-show=data.isCollapsed>Details</button> <button type=button class="btn btn-xs btn-primary" ng-click="data.isCollapsed = !data.isCollapsed;" data-ng-show=!data.isCollapsed>Close</button></div></div><div collapse=data.isCollapsed class="panel-collapse collapse"><div class=panel-body><span class=arrow></span><p class="alert alert-warning m-b-none" role=alert data-ng-show="!$auth.user().can(\'add-bid\')"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden=true></span> <span class=sr-only>Warning:</span> Please upload your insurance documents to your profile by clicking <a href data-ui-sref=user.account.profile.documents title=here>here</a>. We will then fully enable your account so you will be able to bid on jobs.</p><br data-ng-if="!$auth.user().can(\'add-bid\')"><div class=row><div class=col-xs-6><h4>Job Details</h4></div><div class=col-xs-6><a class="btn btn-xs btn-warning pull-right browse-job-button" href data-ui-sref="user.jobs.browse.submit({job_id: data.id})" data-ng-class="!$auth.user().can(\'add-bid\') ? \'disabled\' : \'\'" data-ng-show=data.accept_online>Submit bid online</a> <a class="btn btn-xs btn-warning pull-right disabled browse-job-button" href data-ng-if=data.my_bid_id>Bid Sent</a> <a data-ng-click=call(data.phone) data-rel=external data-ng-show=data.accept_phone title={{data.phone}} class="btn btn-xs btn-warning pull-right browse-job-button" data-ng-if="$auth.user().can(\'add-bid\')">Submit bid by phone: {{data.phone}}</a> <small data-ng-show=!data.accept_phone class="btn btn-xs btn-warning pull-right browse-job-button" data-ng-if="$auth.user().can(\'add-bid\')">No Phone</small></div></div><div class=row><div class=col-md-6><form class="form m-t" data-ng-if="$auth.user().can(\'add-bid\')"><div class=form-group data-ng-if=data.user_info.team_info.company_name><label class="control-label font-bold m-r-xs">Company:</label>{{data.user_info.team_info.company_name}}</div><div class=form-group data-ng-if=data.duration><label class="control-label font-bold m-r-xs">Time created</label>{{ getDate(data.created_at) }}</div><div class=form-group data-ng-if=data.expiry_time.date><label class="control-label font-bold m-r-xs">Expiry time:</label>{{ getDate(data.expiry_time.date) }}</div><div class=form-group data-ng-if=getDistance(data)><label class="control-label font-bold m-r-xs">Estimated distance:</label>{{ getDistance(data) }} miles</div><div class=form-group data-ng-if=data.duration><label class="control-label font-bold m-r-xs">Estimated duration:</label>{{ data.duration }}</div></form></div><div data-ng-class="!$auth.user().can(\'add-bid\') ? \'col-md-12\' : \'col-md-6\'"><div class="map map-md map-full m-t"><ui-gmap-google-map ng-if=!data.isCollapsed id="map-canvas-{{ data.id }}" center=maps[data.id].center zoom=maps[data.id].zoom options=maps[data.id].options control=maps[data.id].control></ui-gmap-google-map></div></div><div class=col-sm-12><div class="form-group m-b-n-sm" data-ng-if=data.details data-ng-show="$auth.user().can(\'add-bid\')"><label class="control-label font-bold">Notes:</label><p>{{data.details}}</p></div></div></div></div></div></td>');
    $templateCache.put("src/user/layout/elements/job-my-work.html", '<td class="job status-{{data.status}}"><div class=job-header><div class=row><div class=col-sm-6><h3>Job ID: #{{data.id}}<div class="btn-group visible-xs pull-right" dropdown is-open=status.isopen data-ng-show="data.status != \'expire\'"><button type=button class="btn btn-sm btn-secondary dropdown-toggle" dropdown-toggle="" ng-disabled=disabled aria-haspopup=true aria-expanded=true>Job Actions <span class=caret></span></button><ul class=dropdown-menu role=menu>\x3c!--View Job Notes--\x3e<li><a data-ng-if=" data.details != null " ui-sref="user.account.jobs.notes({job_id: data.id,  notes: data.details})">View Job Notes</a></li>\x3c!--Retract bid--\x3e<li data-ng-if="data.status == \'active\' && !data.bid"><a data-ui-sref=".retract({bid_id: data.user_bid.id})">Retract Bid</a></li>\x3c!--Upload POD--\x3e<li data-ng-if="data.status == \'progress\'"><a ui-sref=".pod({job_id: data.id})">Upload POD</a></li>\x3c!--Read feedback--\x3e<li data-ng-if="data.feedback || (data.bid && data.bid.feedback)"><a data-ui-sref="user.account.jobs.feedback({job_id: data.id})">Read feedback</a></li>\x3c!--View POD--\x3e<li data-ng-if="data.status == \'delivered\' || data.status == \'invoice\' || data.status == \'complete\'"><a ui-sref="user.account.jobs.pod({job_id: data.id})">View POD</a></li>\x3c!--Raise Invoice--\x3e<li data-ng-if=" data.status == \'delivered\' "><a ui-sref=".invoice({job_id: data.id})">Raise Invoice</a></li>\x3c!--View Invoice--\x3e<li data-ng-if="data.status == \'invoice\' || data.status == \'complete\'"><a ui-sref="user.account.jobs.invoice({job_id: data.id})">View Invoice</a></li>\x3c!--Leave feedback--\x3e<li data-ng-if="(data.status == \'invoice\' || data.status == \'delivered\' || data.status == \'complete\') && !data.feedback"><a data-ui-sref="user.account.feedback.add({job_id: data.id})">Leave feedback</a></li></ul></div></h3></div><div class=col-sm-6><h3 class="text-right-sm text-u-f"><span class="label label-default label-{{data.status}}">Status: {{ getJobStatus(data) }}</span></h3></div></div></div><div class=media><div class="media-left hidden-xs"><div class=vehicle><svg-image data-ng-src=data.vehicle_icon></svg-image></div></div><div class=media-body><div class=row><div class=col-sm-5><div class=pick-up><small class=text-info>Pick Up</small><div ng-if="data.status == \'active\' || data.status == \'cancel\' || data.status == \'expire\' || data.status == \'progress\'"><span class=point ng-if="data.pickup_town == null">{{data.pickup_point}}</span> <span class=point ng-if="data.pickup_town != null">{{data.pickup_town}}, {{data.pickup_postcode_prefix}}</span></div><div ng-if="data.status != \'active\' && data.status != \'cancel\' && data.status != \'expire\' && data.status != \'progress\'"><span class=point ng-if="data.pickup_formatted_address == null || data.pickup_formatted_address == \'\'">{{data.pickup_point}}</span> <span class=point ng-if="data.pickup_formatted_address != null && data.pickup_formatted_address != \'\'">{{data.pickup_formatted_address}}</span></div><div ng-if="data.status == \'progress\'"><span class=point ng-if="data.pickup_formatted_address == null || data.pickup_formatted_address == \'\'">{{data.pickup_point}}</span> <span class=point ng-if="data.pickup_formatted_address != null && data.pickup_formatted_address != \'\'">{{data.pickup_formatted_address}}</span></div><span ng-if="!data.flexible_pickup && !data.pickup_asap"><span class=date>{{ data.pickup_date | amDateFormat:\'DD/MM/YYYY HH:mm\' }}</span></span> <span ng-if="data.flexible_pickup && !data.pickup_asap"><span class=date><strong>FROM</strong> {{ data.pickup_date | amDateFormat:\'DD/MM/YYYY HH:mm\' }}</span> <span class=date><strong>TO</strong> {{ data.pickup_date_end | amDateFormat:\'DD/MM/YYYY HH:mm\' }}</span></span> <span class=date ng-if=data.pickup_asap><strong class=text-success>Pickup ASAP</strong></span></div><div class=drop-off><small class=text-info>Drop Off</small><div ng-if="data.status == \'active\' || data.status == \'cancel\' || data.status == \'expire\'"><span class=point ng-if="data.destination_town == null || data.destination_town == \'\'">{{data.destination_point}}</span> <span class=point ng-if="data.destination_town != null && data.destination_town != \'\'">{{data.destination_town}}, {{data.destination_postcode_prefix}}</span></div><div ng-if="data.status == \'progress\'"><span class=point ng-if="data.destination_formatted_address == null || data.destination_formatted_address == \'\'">{{data.destination_point}}</span> <span class=point ng-if="data.destination_formatted_address != null && data.destination_formatted_address != \'\'">{{data.destination_formatted_address}}</span></div><div ng-if="data.status != \'active\' && data.status != \'cancel\' && data.status != \'expire\' && data.status != \'progress\'"><span class=point ng-if="data.destination_formatted_address == null || data.destination_formatted_address == \'\'">{{data.destination_point}}</span> <span class=point ng-if="data.destination_formatted_address != null && data.destination_formatted_address != \'\'">{{data.destination_formatted_address}}</span></div><span ng-if="!data.flexible_destination && !data.destination_asap"><span class=date>{{ data.destination_date | amDateFormat:\'DD/MM/YYYY HH:mm\' }}</span></span> <span ng-if="data.flexible_destination && !data.destination_asap"><span class=date><strong>FROM</strong> {{ data.destination_date | amDateFormat:\'DD/MM/YYYY HH:mm\' }}</span> <span class=date><strong>TO</strong> {{ data.destination_date_end | amDateFormat:\'DD/MM/YYYY HH:mm\' }}</span></span> <span class=date ng-if=data.destination_asap><strong class=text-success>Deliver ASAP</strong></span></div></div><div class=col-sm-7><div class=well>\x3c!--Job info--\x3e<h5 class=m-t-none>Job Info</h5><div class="m-t-xs b-t">\x3c!--Progress--\x3e<p class="m-b-none text-muted m-t-xs"><span class=font-bold>Progress:</span> {{ getJobInfo(data) }}</p>\x3c!--Payment status--\x3e<p class="text-muted m-b-none" data-ng-if="data.status == \'invoice\' || data.status == \'complete\'"><span class=font-bold>Payment status:</span> {{data.payment_received ? \'Paid\' : \'Unpaid\'}} <a class="text-success text-small" href data-ng-click=paid(data) role=button data-ng-if="!data.payment_received && (data.status == \'invoice\' || data.status == \'delivered\' || data.status == \'complete\')">Mark as Paid</a></p>\x3c!--Requester name--\x3e<p class="text-muted m-b-none"><span class=font-bold>Requester:</span> {{ data.user_info.team_info.company_name }}</p>\x3c!--Accepted price--\x3e<p class="text-muted m-b-none" data-ng-show=data.bid_amount><span class=font-bold>Accepted price:</span> {{data.bid_amount | currency:\'£\'}} <span data-ng-if=data.bid.add_vat>+ VAT</span></p>\x3c!--Feedback--\x3e<div class="ratings ratings-sm" data-ng-if=data.bid.feedback.rating><span class="text-muted font-bold">Feedback:</span><rating class="rating read-only" ng-model=data.bid.feedback.rating max=5 state-on="\'glyphicon glyphicon-star text-info\'" state-off="\'glyphicon glyphicon-star-empty text-info\'" data-readonly=true></rating></div>\x3c!--Bid notes--\x3e<p class="text-muted m-b-none" data-ng-if=data.bid_details><span class=font-bold>Notes:</span> {{data.bid_details}}</p></div></div></div></div></div></div><div class="job-actions well well-sm text-right m-b-none hidden-xs" data-ng-show="data.status != \'expire\'">\x3c!--Job notes--\x3e<a class="btn btn-xs btn-primary" data-ng-if=" data.details != null " data-ui-sref="user.account.jobs.notes({job_id: data.id, notes: data.details})">View Job Notes</a>\x3c!--Retract bid--\x3e <a class="btn btn-xs btn-danger" data-ng-if="data.status == \'active\' && !data.bid" data-ui-sref=".retract({bid_id: data.user_bid.id})">Retract Bid</a>\x3c!--Upload POD--\x3e <a class="btn btn-xs btn-secondary" data-ng-if="data.status == \'progress\'" ui-sref=".pod({job_id: data.id})">Upload POD</a>\x3c!--Read feedback--\x3e <a class="btn btn-xs btn-primary" data-ng-if="data.feedback || (data.bid && data.bid.feedback)" data-ui-sref="user.account.jobs.feedback({job_id: data.id})">Read feedback</a>\x3c!--View POD--\x3e <a class="btn btn-xs btn-primary" data-ng-if="data.status == \'delivered\' || data.status == \'invoice\' || data.status == \'complete\'" ui-sref="user.account.jobs.pod({job_id: data.id})">View POD</a>\x3c!--Raise Invoice--\x3e <a class="btn btn-xs btn-success" data-ng-if=" data.status == \'delivered\' " ui-sref=".invoice({job_id: data.id})">Raise Invoice</a>\x3c!--View Invoice--\x3e <a class="btn btn-xs btn-primary" data-ng-if="(data.status == \'invoice\' || data.status == \'complete\') && data.bid.user.team_info.id === $auth.user().team_id" ui-sref="user.account.jobs.invoice({job_id: data.id})">View Invoice</a>\x3c!--Leave feedback--\x3e <a class="btn btn-xs btn-info" data-ng-if="(data.status == \'invoice\' || data.status == \'delivered\' || data.status == \'complete\') && !data.feedback" data-ui-sref="user.account.feedback.add({job_id: data.id})">Leave feedback</a></div></td>');
    $templateCache.put("src/user/layout/elements/job-team-posted.html", '<td class="job status-{{data.status}}"><div class=job-header><div class=row><div class=col-sm-6><h3>{{job.bid}} Job ID: #{{data.id}}<div class="btn-group visible-xs pull-right" dropdown is-open=status.isopen data-ng-show="data.status != \'expire\'"><button type=button class="btn btn-sm btn-secondary dropdown-toggle" dropdown-toggle="" ng-disabled=disabled aria-haspopup=true aria-expanded=true>Job Actions <span class=caret></span></button><ul class=dropdown-menu role=menu>\x3c!--View POD--\x3e<li data-ng-if="data.status == \'delivered\' || data.status == \'invoice\' || data.status == \'complete\' "><a ui-sref="user.account.jobs.pod({job_id: data.id})">View POD</a></li>\x3c!--View Invoice--\x3e<li data-ng-if="data.status == \'invoice\' || data.status == \'complete\'"><a ui-sref="user.account.jobs.invoice({job_id: data.id})">View Invoice</a></li>\x3c!--Cancel job--\x3e<li data-ng-if="data.status == \'active\' "><a ui-sref="user.account.jobs.cancel({job_id: data.id})">Cancel</a></li>\x3c!--Allocate the job manually--\x3e<li data-ng-if="data.status == \'active\' "><a ui-sref="user.account.jobs.manual({job_id: data.id})">Allocate Manual</a></li>\x3c!--Add POD--\x3e<li data-ng-if="data.status == \'progress\' "><a ui-sref="user.account.work.pod({job_id: data.id})">Upload POD</a></li>\x3c!--Leave feedback--\x3e<li data-ng-if="(data.status == \'invoice\' || data.status == \'delivered\' || data.status == \'complete\') && !data.bid.feedback"><a ui-sref="user.account.feedback.add({job_id: data.id, bid_id: data.bid.id})">Leave feedback</a></li>\x3c!--Complete the job--\x3e<li data-ng-if=" data.status == \'invoice\' && data.payment_received && data.status != \'completed\' "><a data-ng-click=complete(data)>Complete Job</a></li>\x3c!--Read feedback--\x3e<li data-ng-if="data.feedback || (data.bid && data.bid.feedback)"><a ui-sref="user.account.jobs.feedback({job_id: data.id})">Read feedback</a></li>\x3c!--Review bids--\x3e<li data-ng-if="data.status != \'complete\'"><a ui-sref="user.account.jobs.bids({job_id: data.id})">Review Bids ({{data.bids_count}})</a></li></ul></div></h3></div><div class=col-sm-6><h3 class="text-right-sm text-u-f"><span class="label label-default label-{{data.status}}">Status: {{ getJobStatus(data) }}</span></h3></div></div></div><div class=media><div class="media-left hidden-xs"><div class=vehicle><svg-image data-ng-src=data.vehicle_icon></svg-image></div></div><div class=media-body><div class=row><div class=col-sm-5><div class=pick-up><small class=text-info>Pick Up</small> <span class=point>{{data.pickup_point}}</span> <span ng-if="!data.flexible_pickup && !data.pickup_asap"><span class=date>{{ data.pickup_date | amDateFormat:\'DD/MM/YYYY HH:mm\' }}</span></span> <span ng-if="data.flexible_pickup && !data.pickup_asap"><span class=date><strong>FROM</strong> {{ data.pickup_date | amDateFormat:\'DD/MM/YYYY HH:mm\' }}</span> <span class=date><strong>TO</strong> {{ data.pickup_date_end | amDateFormat:\'DD/MM/YYYY HH:mm\' }}</span></span> <span class=date ng-if=data.pickup_asap><strong class=text-success>Pickup ASAP</strong></span></div><div class=drop-off><small class=text-info>Drop Off</small> <span class=point>{{data.destination_point}}</span> <span ng-if="!data.flexible_destination && !data.destination_asap"><span class=date>{{ data.destination_date | amDateFormat:\'DD/MM/YYYY HH:mm\' }}</span></span> <span ng-if="data.flexible_destination && !data.destination_asap"><span class=date><strong>FROM</strong> {{ data.destination_date | amDateFormat:\'DD/MM/YYYY HH:mm\' }}</span> <span class=date><strong>TO</strong> {{ data.destination_date_end | amDateFormat:\'DD/MM/YYYY HH:mm\' }}</span></span> <span class=date ng-if=data.destination_asap><strong class=text-success>Deliver ASAP</strong></span></div></div><div class=col-sm-7><div class=well>\x3c!--Job info--\x3e<h5 class=m-t-none>Job Info</h5><div class="m-t-xs b-t">\x3c!--Progress--\x3e<p class="m-b-none text-muted m-t-xs"><span class=font-bold>Progress:</span> {{ getJobInfo(data) }}</p>\x3c!-- Posted by--\x3e<div class="text-muted m-b-none" data-ng-if="$state.$current.name==\'user.account.team.jobs\'"><span class=font-bold>Posted by:</span> {{data.user_info.name_full}}</div>\x3c!--Expiry time--\x3e<p class="text-muted m-b-none" data-ng-if="data.status == \'active\' || data.status == \'expire\'"><span class=font-bold>Expiry time:</span> {{data.expiry_time | amDateFormat:\'DD/MM/YYYY HH:mm\'}}</p>\x3c!--Payment status--\x3e<p class="text-muted m-b-none" data-ng-if="data.status == \'invoice\' || data.status == \'complete\'"><span class=font-bold>Payment status:</span> {{data.payment_received ? \'Paid\' : \'Unpaid\'}}</p>\x3c!--Member name--\x3e<p class="text-muted m-b-none" data-ng-show=data.bid.user.name_full><span class=font-bold>Member:</span> {{data.bid.user.name_full}}</p>\x3c!--Accepted price--\x3e<p class="text-muted m-b-none" data-ng-show=data.bid_amount><span class=font-bold>Accepted price:</span> {{data.bid_amount | currency:\'£\'}} <span data-ng-if=data.bid.add_vat>+ VAT</span></p>\x3c!--Feedback--\x3e<div class="ratings ratings-sm" data-ng-if=data.feedback.rating><span class="text-muted font-bold">Feedback:</span><rating class="rating read-only" ng-model=data.feedback.rating max=5 state-on="\'glyphicon glyphicon-star text-info\'" state-off="\'glyphicon glyphicon-star-empty text-info\'" data-readonly=true></rating></div>\x3c!--Bid notes--\x3e<p class="text-muted m-b-none" data-ng-if=data.bid.details><span class=font-bold>Notes:</span> {{data.bid.details}}</p></div></div></div></div></div></div><div class="job-actions well well-sm text-right m-b-none hidden-xs" data-ng-show="data.status != \'expire\'">\x3c!--Cancel job--\x3e<a class="btn btn-xs btn-danger" data-ng-if=" data.status == \'active\' " ui-sref="user.account.jobs.cancel({job_id: data.id})">Cancel</a>\x3c!--Allocate the job manually--\x3e <a class="btn btn-xs btn-primary" data-ng-if=" data.status == \'active\' " ui-sref="user.account.jobs.manual({job_id: data.id})">Allocate Manual</a>\x3c!--Review bids--\x3e <a class="btn btn-xs" data-ng-if="data.status != \'complete\'" data-ng-class="{\'btn-info\' : data.status == \'active\', \'btn-primary\' : data.status != \'active\'}" ui-sref="user.account.jobs.bids({job_id: data.id})">Review Bids ({{data.bids_count}})</a>\x3c!--Upload POD--\x3e <a class="btn btn-xs btn-secondary" data-ng-show=" data.status == \'progress\' " ui-sref="user.account.work.pod({job_id: data.id})">Upload POD</a>\x3c!--Read feedback--\x3e <a class="btn btn-xs btn-primary" data-ng-if="data.feedback || (data.bid && data.bid.feedback)" ui-sref="user.account.jobs.feedback({job_id: data.id})">Read feedback</a>\x3c!--View POD--\x3e <a class="btn btn-xs btn-primary" data-ng-if=" data.status == \'delivered\' || data.status == \'invoice\' || data.status == \'complete\' " ui-sref="user.account.jobs.pod({job_id: data.id})">View POD</a>\x3c!--View Invoice--\x3e <a class="btn btn-xs btn-primary" data-ng-if=" data.status == \'invoice\' || data.status == \'complete\'" ui-sref="user.account.jobs.invoice({job_id: data.id})">View Invoice</a>\x3c!--Leave feedback--\x3e <a class="btn btn-xs btn-info" data-ng-if="(data.status == \'invoice\' || data.status == \'delivered\' || data.status == \'complete\') && !data.bid.feedback" ui-sref="user.account.feedback.add({job_id: data.id, bid_id: data.bid.id})">Leave feedback</a>\x3c!--Complete the job--\x3e <a class="btn btn-xs btn-complete" data-ng-click=complete(data) data-ng-disabled=formSubmitted data-ng-if=" data.status == \'invoice\' && data.payment_received && data.status != \'completed\' "><span data-ng-show=!formSubmitted>Complete Job</span> <span data-ng-show=formSubmitted><i class="fa fa-spin fa-circle-o-notch"></i> Complete Job</span></a></div></td>');
    $templateCache.put("src/user/layout/elements/job-team-work.html", '<td class="team job status-{{data.status}} {{data.bid ? \'awarded\' : \'\'}}"><div class=job-header><div class=row><div class=col-sm-6><h3>Job ID: #{{data.id}}<div class="btn-group visible-xs pull-right" dropdown is-open=status.isopen data-ng-show="data.status != \'expire\'"><button type=button class="btn btn-sm btn-secondary dropdown-toggle" dropdown-toggle="" ng-disabled=disabled aria-haspopup=true aria-expanded=true>Job Actions <span class=caret></span></button><ul class=dropdown-menu role=menu>\x3c!--Retract bid--\x3e<li data-ng-if="data.status == \'active\' && !data.bid"><a data-ui-sref="user.account.work.retract({bid_id: data.team_bid.id})">Retract Bid</a></li>\x3c!--Upload POD--\x3e<li data-ng-if="data.status == \'progress\'"><a ui-sref="user.account.work.pod({job_id: data.id})">Upload POD</a></li>\x3c!--Read feedback--\x3e<li data-ng-if="data.feedback || (data.bid && data.bid.feedback)"><a data-ui-sref="user.account.jobs.feedback({job_id: data.id})">Read feedback</a></li>\x3c!--View POD--\x3e<li data-ng-if="data.status == \'delivered\' || data.status == \'invoice\' || data.status == \'complete\'"><a ui-sref="user.account.jobs.pod({job_id: data.id})">View POD</a></li>\x3c!--Raise Invoice--\x3e<li data-ng-if=" data.status == \'delivered\' "><a ui-sref="user.account.work.invoice({job_id: data.id})">Raise Invoice</a></li>\x3c!--View Invoice--\x3e<li data-ng-if="data.status == \'invoice\' || data.status == \'complete\'"><a ui-sref="user.account.jobs.invoice({job_id: data.id})">View Invoice</a></li>\x3c!--Leave feedback--\x3e<li data-ng-if="(data.status == \'invoice\' || data.status == \'delivered\' || data.status == \'complete\') && !data.feedback"><a data-ui-sref="user.account.feedback.add({job_id: data.id})">Leave feedback</a></li></ul></div></h3></div><div class=col-sm-6><h3 class="text-right-sm text-u-f"><span class="label label-default label-{{data.status}}">Status: {{ getJobStatus(data) }}</span></h3></div></div></div><div class=media><div class="media-left hidden-xs"><img src=/assets/img/default-veh.png title=LWB alt="LWB"></div><div class=media-body><div class=row><div class="col-sm-5 first column"><div><small class=text-info>Pick Up</small> <span class=point>{{data.pickup_point}}</span> <span ng-if="!data.flexible_pickup && !data.pickup_asap"><span class=date>{{ data.pickup_date | amDateFormat:\'DD/MM/YYYY HH:mm\' }}</span></span> <span ng-if="data.flexible_pickup && !data.pickup_asap"><span class=date><strong>FROM</strong> {{ data.pickup_date | amDateFormat:\'DD/MM/YYYY HH:mm\' }}</span> <span class=date><strong>TO</strong> {{ data.pickup_date_end | amDateFormat:\'DD/MM/YYYY HH:mm\' }}</span></span> <span class=date ng-if=data.pickup_asap><strong class=text-success>Pickup ASAP</strong></span></div><div><small class=text-info>Drop Off</small> <span class=point>{{ data.destination_point }}</span> <span ng-if="!data.flexible_destination && !data.destination_asap"><span class=date>{{ data.destination_date | amDateFormat:\'DD/MM/YYYY HH:mm\' }}</span></span> <span ng-if="data.flexible_destination && !data.destination_asap"><span class=date><strong>FROM</strong> {{ data.destination_date | amDateFormat:\'DD/MM/YYYY HH:mm\' }}</span> <span class=date><strong>TO</strong> {{ data.destination_date_end | amDateFormat:\'DD/MM/YYYY HH:mm\' }}</span></span> <span class=date ng-if=data.destination_asap><strong class=text-success>Deliver ASAP</strong></span></div></div><div class="col-sm-7 second column"><div class=well>\x3c!--Job info--\x3e<h5 class=m-t-none>Job Info</h5><div class="m-t-xs b-t">\x3c!--Progress--\x3e<p class="m-b-none text-muted m-t-xs"><span class=font-bold>Progress:</span> {{ getJobInfo(data) }}</p>\x3c!--Payment status--\x3e<p class="text-muted m-b-none" data-ng-if="data.status == \'invoice\' || data.status == \'complete\'"><span class=font-bold>Payment status:</span> {{data.payment_received ? \'Paid\' : \'Unpaid\'}} <a class="text-success text-small" href data-ng-click=paid(data) role=button data-ng-if="!data.payment_received && (data.status == \'invoice\' || data.status == \'delivered\' || data.status == \'complete\')">Mark as Paid</a></p>\x3c!--Requester name--\x3e<p class="text-muted m-b-none"><span class=font-bold>Requester:</span> {{ data.user_info.team_info.company_name }}</p>\x3c!--Accepted price--\x3e<p class="text-muted m-b-none" data-ng-show=data.bid_amount><span class=font-bold>Accepted price:</span> {{data.bid_amount | currency:\'£\'}} <span data-ng-if=data.bid.add_vat>+ VAT</span></p>\x3c!--Feedback--\x3e<div class="ratings ratings-sm" data-ng-if=data.bid.feedback.rating><span class="text-muted font-bold">Feedback:</span><rating class="rating read-only" ng-model=data.bid.feedback.rating max=5 state-on="\'glyphicon glyphicon-star text-info\'" state-off="\'glyphicon glyphicon-star-empty text-info\'" data-readonly=true></rating></div>\x3c!--Bid notes--\x3e<p class="text-muted m-b-none" data-ng-if=data.bid_details><span class=font-bold>Notes:</span> {{data.bid_details}}</p></div></div></div></div></div></div><div class="allocated-to m-b b-t b-b b-light"><p class="pull-left m-r-sm m-t-md m-b-md font-bold">Allocated to:</p><img class="avatar pull-left m-r-sm m-t-xs hidden-xs hidden-sm" data-ng-src={{data.team_bid.user.avatar_url}} width=50><p class="pull-left m-t-md m-b-md"><span class=font-bold>SDN-{{data.team_bid.user.id}} - {{data.team_bid.user.name_full}}</span> <i>({{data.team_bid.user.email}})</i></p><div class=clearfix></div></div><div class="job-actions well well-sm text-right m-b-none hidden-xs" data-ng-show="data.status != \'expire\'">\x3c!--Retract bid--\x3e<a class="btn btn-xs btn-danger" data-ng-if="data.status == \'active\' && !data.bid" data-ui-sref="user.account.work.retract({bid_id: data.team_bid.id})">Retract Bid</a>\x3c!--Upload POD--\x3e <a class="btn btn-xs btn-secondary" data-ng-if="data.status == \'progress\'" ui-sref="user.account.work.pod({job_id: data.id})">Upload POD</a>\x3c!--Read feedback--\x3e <a class="btn btn-xs btn-primary" data-ng-if="data.feedback || (data.bid && data.bid.feedback)" data-ui-sref="user.account.jobs.feedback({job_id: data.id})">Read feedback</a>\x3c!--View POD--\x3e <a class="btn btn-xs btn-primary" data-ng-if="data.status == \'delivered\' || data.status == \'invoice\' || data.status == \'complete\'" ui-sref="user.account.jobs.pod({job_id: data.id})">View POD</a>\x3c!--Raise Invoice--\x3e <a class="btn btn-xs btn-success" data-ng-if=" data.status == \'delivered\' " ui-sref="user.account.work.invoice({job_id: data.id})">Raise Invoice</a>\x3c!--View Invoice--\x3e <a class="btn btn-xs btn-primary" data-ng-if="data.status == \'invoice\' || data.status == \'complete\'" ui-sref="user.account.jobs.invoice({job_id: data.id})">View Invoice</a>\x3c!--Leave feedback--\x3e <a class="btn btn-xs btn-info" data-ng-if="(data.status == \'invoice\' || data.status == \'delivered\' || data.status == \'complete\') && !data.feedback" data-ui-sref="user.account.feedback.add({job_id: data.id})">Leave feedback</a></div></td>');
    $templateCache.put("src/user/layout/elements/member-directory-single.html", '<td class="member member-browse"><div class=row><div class=col-sm-6><strong class=clearfix>{{ data.company_name }}</strong> <img ng-src="{{ data.logo }}" style="max-width: 11vw; max-height: 8vw; margin: 1rem 0">\x3c!-- <p>{{ data.address_line_1 }}, {{ data.address_line_2}} {{ data.town }}, {{ data.postal_code }}</p> --\x3e</div><div class="col-sm-6 text-right"><rating class="rating read-only" ng-model=data.score max=5 state-on="\'glyphicon glyphicon-star text-info\'" state-off="\'glyphicon glyphicon-star-empty text-info\'" data-readonly=true></rating><div class=clearfix></div>(from <a href=# ng-click="data.isCollapsed = false; data.showFeedback = true;">{{ data.ratings_count }} reviews</a>)<div style="margin-top: 1rem" class=clearfix></div>\x3c!-- <h1>{{ data.invoice_recipient_phone }} </h1> --\x3e<button type=button class="btn m-t-xs btn-sm btn-danger" ng-click="data.isCollapsed = true" ng-if="! data.isCollapsed">Close</button> <button type=button class="btn m-t-xs btn-sm btn-primary" ng-click="data.isCollapsed = false" ng-if=data.isCollapsed>View Profile</button> <button type=button class="btn btn-sm m-t-xs btn-warning" ng-if="data.is_blocked == true" ng-click=unBlockMember(data.id)>Unblock</button> <button ng-if="data.is_blocked == false" type=button class="btn btn-sm m-t-xs btn-secondary" ng-click=blockMember(data.id)>Block</button>\x3c!-- <button type="button" class="btn btn-sm btn-primary">Contact</button> --\x3e</div></div><div collapse=data.isCollapsed class="panel-collapse collapse"><tabset><tab heading=Company><div class=wrapper style="padding: 0">\x3c!-- <strong>{{ data.company_name }}</strong> --\x3e<table class="table striped"><tr ng-if=data.primary_member.name_first><td><strong>Primary Contact</strong></td><td>{{ data.primary_member.name_first }} {{ data.primary_member.name_last }}</td></tr><tr ng-if=data.invoice_recipient_phone><td><strong>Phone Number</strong></td><td>{{ data.invoice_recipient_phone }}</td></tr><tr ng-if=data.primary_member.email><td><strong>Email</strong></td><td>{{ data.primary_member.email }}</td></tr><tr><td><strong>Address</strong></td><td><p><span ng-if=data.address_line_1>{{ data.address_line_1 }},<br></span> <span ng-if=data.address_line_2>{{ data.address_line_2 }},<br></span> {{ data.town }}<br>{{ data.postal_code }}</p></td></tr><tr ng-if=data.vat_number><td><strong>Vat Number</strong></td><td>{{ data.vat_number }}</td></tr><tr ng-if=data.company_number><td><strong>Company Registration</strong></td><td>{{ data.company_number }}</td></tr></table></div></tab><tab heading=Locations select=getLocations(data)><div class="m-b padder-v"><table class=table ng-table=data.locations template-pagination=src/user/layout/elements/tfoot.html><tbody><tr ng-repeat="data in data.locations.data"><td data-title="\'Location\'">{{ data.location }}</td><td data-title="\'Range\'">{{ data.miles }}</td><td><a href class="btn btn-xs btn-primary" data-ui-sref=".map({lat: data.latitude, lng: data.longitude, radius: data.miles})">Map</a>\x3c!-- ng-click="setLocation(data)" --\x3e</td></tr></tbody></table></div></tab><tab heading=Documents select=getDocuments(data)><div class="m-b padder-v"><div class="table-responsive documents"><table class=table ng-table=data.documents template-pagination=src/user/layout/elements/tfoot.html><tbody><tr ng-repeat="data in data.documents.data"><td data-title="\'Document\'"><p>{{ data.type.name }}</p><div class=visible-xs><p><strong>Expiry Date:</strong> {{ data.expiry || \'not set\' }}</p><p><strong>Amount Insured:</strong> {{ data.insured_amount | currency:"GBP" }}</p><a target=_blank ng-href="{{ data.upload }}" class="btn btn-primary btn-xs">Download</a></div></td><td data-title="\'Expiry Date\'">{{ data.expiry || \'not set\' }}</td><td data-title="\'Amount Insured\'">{{ data.insured_amount | currency:"GBP" }}</td><td><a target=_blank ng-href="{{ data.upload }}" class="btn btn-primary btn-xs">Download</a></td></tr></tbody></table></div></div></tab><tab heading=Feedback select=getFeedback(data) ng-attr-active=data.showFeedback><div class="streamline b-l b-default m-l-lg m-b padder-v"><table class=table ng-table=data.feedback template-pagination=src/user/layout/elements/tfoot.html><tbody><tr ng-repeat="data in data.feedback.data" ng-include="\'src/user/layout/elements/feedback.html\'"></tr></tbody></table></div></tab><tab heading=Vehicles select=getVehicles(data)><div class="m-b padder-v"><table class=table ng-table=data.vehicles template-pagination=src/user/layout/elements/tfoot.html><tbody><tr ng-repeat="data in data.vehicles.data"><td data-title="\'Icon\'"><svg-image class=vehicle data-ng-src=data.icon title="{{ data.name }}"></svg-image></td><td data-title="\'Vehicle Name\'">{{ data.name }}</td></tr></tbody></table></div></tab></tabset></div></td>');
    $templateCache.put("src/user/layout/elements/tfoot.html", '<footer class="tfoot tfoot-default"><div class="pull-left hidden-xs"><small class="text-muted inline m-t-sm m-b-sm">Showing {{ ((params.$params.page * params.count()) - params.count() + 1) }}-{{ (params.$params.page * params.count()) > params.total() ? params.total() : (params.$params.page * params.count()) }} of {{ params.total() }} results</small></div><div class="pull-right text-right text-center-xs"><pagination total-items=params.total() ng-model=params.$params.page items-per-page=params.count() max-size=4 class="pagination-sm pagination-default m-t-xs m-b-none" boundary-links=false previous-text=&lsaquo; next-text=&rsaquo; rotate=false></pagination></div><div class=clearfix></div></footer>');
    $templateCache.put("src/user/layout/elements/thead.html", '<header class="thead thead-default"><div class="pull-left hidden-xs"><small class="text-muted inline m-t-sm m-b-sm">Showing {{ ((params.$params.page * params.count()) - params.count() + 1) }}-{{ (params.$params.page * params.count()) > params.total() ? params.total() : (params.$params.page * params.count()) }} of {{ params.total() }} results</small></div><div class="pull-right text-right text-center-xs"><pagination total-items=params.total() ng-model=params.$params.page items-per-page=params.count() max-size=4 class="pagination-sm pagination-default m-t-xs m-b-none" boundary-links=false previous-text=&lsaquo; next-text=&rsaquo; rotate=false></pagination></div><div class=clearfix></div></header>');
    $templateCache.put("src/user/layout/elements/user-autocomplete.html", '<a><div class="pull-left thumb-sm avatar m-r"><img data-ng-src="{{match.model.avatar_url}}"></div><p class="m-b-none font-bold" bind-html-unsafe="match.model.name_full | typeaheadHighlight:query"></p><small class=m-b-none bind-html-unsafe="match.model.team.company_name | typeaheadHighlight:query"></small><br><div class="m-b-none m-l m-l-2">User ID: # <small bind-html-unsafe="match.model.id | typeaheadHighlight:query"></small></div><div class=clearfix></div></a>');
    $templateCache.put("src/user/layout/footer.html", '<div class=container><div class=row><div class="col-sm-4 text-center-xs"><nav class="nav-footer hidden"><ul class="nav nav-pills"><li><a href=# title="About Us">About Us</a></li><li><a href=# title=Contact>Contact</a></li></ul></nav><p class=copyright>&copy; {{ $app.year }} Sameday Courier Network Ltd</p></div><div class="col-sm-4 text-center"><ul class="socials list-inline hidden"><li><a class=facebook href=# title=Facebook><span class="fa fa-facebook"></span></a></li><li><a class=twitter href=# title=Twitter><span class="fa fa-twitter"></span></a></li></ul><p class=copyright>158 Richmond Park Road, Bournemouth BH8 8TW</p></div><div class="col-sm-4 text-center text-right-sm"><p class=copyright>Company number: 09338439</p><a class="tcs hidden" href=# title=T&Cs>T&Cs</a></div></div></div>');
    $templateCache.put("src/user/layout/header.html", '\x3c!-- navbar header --\x3e<div class="container pos-rlt" data-ng-init="isNavbarCollapsed = true"><div class=row><div class=col-sm-3><a class=brand data-ui-sref=user.dashboard title="Same Day Courier Network"><img src=/assets/img/sdcn-logo.png title="Same Day Courier Network" alt="Same Day Courier Network"></a></div><div class="col-sm-9 pos-stc text-right-sm"><div class="collapse navbar-collapse pos-rlt" collapse=isNavbarCollapsed><nav class="navbar nav-main" role=navigation><ul class="nav navbar-nav"><li data-ui-sref-active=active><a data-ui-sref=user.dashboard title=Dashboard data-ng-click="isNavbarCollapsed = !isNavbarCollapsed"><i class="glyphicon glyphicon-stats"></i> Dashboard</a></li><li data-ui-sref-active=active><a data-ui-sref=user.jobs.post title="Post a Job" data-ng-click="isNavbarCollapsed = !isNavbarCollapsed"><i class="glyphicon glyphicon-edit"></i> Post a Job</a></li><li data-ui-sref-active=active><a data-ui-sref=user.jobs.allocate title="Allocate a Job" data-ng-click="isNavbarCollapsed = !isNavbarCollapsed"><i class="glyphicon glyphicon-edit"></i> Allocate a Job</a></li><li data-ui-sref-active=active><a data-ui-sref=user.jobs.browse title="Browse Jobs" data-ng-click="isNavbarCollapsed = !isNavbarCollapsed"><i class="glyphicon glyphicon-list"></i> Browse Jobs</a></li><li data-ui-sref-active=active><a data-ui-sref=user.directory title="Members Directory" data-ng-click="isNavbarCollapsed = !isNavbarCollapsed"><i class="glyphicon glyphicon-folder-open"></i> Directory</a></li><li data-ui-sref-active=active><a href=http://samedaycouriernetwork.com/#contact target=_blank title=Help data-ng-click="isNavbarCollapsed = !isNavbarCollapsed"><i class="fa fa-question-circle"></i> Help</a></li><li data-ui-sref-active=active><span class="dropdown pos-stc" dropdown><a class=dropdown-toggle dropdown-toggle title=Account><i class="glyphicon glyphicon-user"></i> Account <i class=fa></i></a><ul class=dropdown-menu role=menu><li data-ui-sref-active=active><a data-ui-sref=user.benefits title="Member Benefits" data-ng-click="isNavbarCollapsed = !isNavbarCollapsed">Member Benefits</a></li><li data-ui-sref-active=active><a data-ui-sref=user.account.jobs title="My Jobs" data-ng-click="isNavbarCollapsed = !isNavbarCollapsed">Jobs Posted</a></li><li data-ui-sref-active=active><a data-ui-sref=user.account.work title="My Work" data-ng-click="isNavbarCollapsed = !isNavbarCollapsed">My Work</a></li><li data-ui-sref-active=active><a data-ui-sref=user.account.team title="My Users" data-ng-click="isNavbarCollapsed = !isNavbarCollapsed">My Users</a></li><li data-ui-sref-active=active><a data-ui-sref=user.account.feedback title=Feedback data-ng-click="isNavbarCollapsed = !isNavbarCollapsed">Feedback</a></li><li data-ui-sref-active=active><a data-ui-sref=user.account.profile title=Profile data-ng-click="isNavbarCollapsed = !isNavbarCollapsed">Profile</a></li><li data-ui-sref-active=active data-ng-if=$auth.isAdmin()><a data-ui-sref=admin.dashboard title="Admin Dashboard" data-ng-click="isNavbarCollapsed = !isNavbarCollapsed">Admin Dashboard</a></li><li data-ng-controller=LoginController><a href ng-click=logout() title=Logout>Logout</a></li></ul></span></li></ul></nav></div><a class="avatar hidden-xs hidden-sm" href=# title="Company Name" data-ng-controller=LoginController><img data-ng-src={{auth.user().getAvatar()}} title={{auth.user().name_full}} alt="{{auth.user().name_full}}"></a><nav class="navbar nav-settings pull-right visible-xs"><ul class="navbar-nav nav"><li><a href=# data-ui-sref=user.help><span class="fa fa-question-circle"></span></a></li><li><a href=# data-ui-sref=user.account.profile><span class="fa fa-user"></span></a></li><li><button type=button class="navbar-toggle collapsed" data-ng-click="isNavbarCollapsed = !isNavbarCollapsed" data-target=#nav-main-collapse><span class=sr-only>Toggle navigation</span> <span class=icon-bars><span class=icon-bar></span> <span class=icon-bar></span> <span class=icon-bar></span></span></button></li></ul></nav></div></div></div>');
    $templateCache.put("src/user/layout/modals/bid.html", '<div class=modal-header><h3 class=modal-title>Submit Your Bid <button class="btn btn-default btn-sm pull-right" ng-click=cancel()>Cancel</button></h3></div><div class=modal-body><h3 class="headline-light m-t-none m-b-lg">Job Details</h3><div class="media job-details"><div class=media-left><img src=/assets/img/default-veh.png title=LWB alt="LWB"></div><div class=media-body><div class=row><div class=col-sm-6><small class=text-info>Pick Up</small> <span class=point>{{job.pickup_town}}, {{job.pickup_postcode_prefix}}</span> <span class=date>{{job.pickup_date | amDateFormat:\'DD/MM/YYYY HH:mm\'}}</span></div><div class=col-sm-6><small class=text-info>Drop Off</small> <span class=point>{{job.destination_town}}, {{job.destination_postcode_prefix}}</span> <span class=date>{{job.destination_date | amDateFormat:\'DD/MM/YYYY HH:mm\'}}</span></div></div></div></div><hr><form class="form form-validation" name=form><h3 class="headline-light m-b-lg">Your Bid</h3><div class=row><div class="col-sm-8 col-md-5"><div class=form-group><label class=label-info>Bid amount</label><div class=input-group><input class=form-control id=amount placeholder="Bid amount" data-ng-model=data.amount required aria-describedby="amount-addon"> <span class=input-group-addon id=amount-addon>£</span></div></div></div></div><div class=form-group><label class=label-info>Your note</label><textarea id=notes class=form-control rows=3 data-ng-model=data.details placeholder="Your note"></textarea></div></form></div><div class=modal-footer><button class="btn btn-warning btn-lg" data-ng-click=ok() data-ng-disabled=form.$invalid>Submit Bid</button></div>');
    $templateCache.put("src/user/layout/nav-main.html", "");
    $templateCache.put("src/user/layout/nav.html", '\x3c!-- list --\x3e<ul class=nav data-menus=menuItems data-type=tree data-tag=user><li class="hidden-folded padder m-t m-b-sm text-muted text-xs"><span>Navigation</span></li><li data-ng-repeat="menu in menuItems | orderBy: \'-priority\'" data-ng-if=menu.hasChild><a href class=auto><span class="pull-right text-muted"><i class="fa fa-fw fa-angle-right text"></i> <i class="fa fa-fw fa-angle-down text-active"></i></span> <i class="{{menu.class}} icon text-primary-dker"></i> <span class=font-bold>{{menu.name}}</span></a><ul class="nav nav-sub dk"><li data-ng-repeat="child in menu.children | orderBy: \'-priority\'" data-ui-sref-active-eq=active><a data-ui-sref={{child.state.name}}><span>{{child.name}}</span></a></li></ul></li><li data-ng-repeat="menu in menuItems | orderBy: \'-priority\'" data-ui-sref-active=active data-ng-if=!menu.hasChild><a data-ui-sref={{menu.state.name}}><i class="{{menu.class}} icon text-info-dker"></i> <span class=font-bold>{{menu.name}}</span></a></li></ul>\x3c!-- / list --\x3e');
    $templateCache.put("src/user/layout/settings.html", '\x3c!-- settings --\x3e <button class="btn btn-default no-shadow pos-abt" ui-toggle-class=active target=.settings><i class="fa fa-spin fa-gear"></i></button><div class=panel-heading>Settings</div><div class=panel-body><div class=m-b-sm><label class="i-switch bg-info pull-right"><input type=checkbox ng-model=$app.settings.headerFixed> <i></i></label>Fixed header</div><div class=m-b-sm><label class="i-switch bg-info pull-right"><input type=checkbox ng-model=$app.settings.asideFixed> <i></i></label>Fixed aside</div><div class=m-b-sm><label class="i-switch bg-info pull-right"><input type=checkbox ng-model=$app.settings.asideFolded> <i></i></label>Folded aside</div><div class=m-b-sm><label class="i-switch bg-info pull-right"><input type=checkbox ng-model=$app.settings.asideDock> <i></i></label>Dock aside</div><div><label class="i-switch bg-info pull-right"><input type=checkbox ng-model=$app.settings.container> <i></i></label>Boxed layout</div></div><div class="wrapper b-t b-light bg-light lter r-b"><div class="row row-sm"><div class=col-xs-6><label class="i-checks block m-b" ng-click="\n' + "          $app.settings.navbarHeaderColor='bg-black'; \n" + "          $app.settings.navbarCollapseColor='bg-white-only'; \n" + "          $app.settings.asideColor='bg-black';\n" + '         "><input type=radio name=a ng-model=$app.settings.themeID value=1> <span class="block bg-light clearfix pos-rlt"><span class="active pos-abt w-full h-full bg-black-opacity text-center"><i class="glyphicon glyphicon-ok text-white m-t-xs"></i></span> <b class="bg-black header"></b> <b class="bg-white header"></b> <b class=bg-black></b></span></label><label class="i-checks block m-b" ng-click="\n' + "          $app.settings.navbarHeaderColor='bg-dark'; \n" + "          $app.settings.navbarCollapseColor='bg-white-only'; \n" + "          $app.settings.asideColor='bg-dark';\n" + '         "><input type=radio name=a ng-model=$app.settings.themeID value=13> <span class="block bg-light clearfix pos-rlt"><span class="active pos-abt w-full h-full bg-black-opacity text-center"><i class="glyphicon glyphicon-ok text-white m-t-xs"></i></span> <b class="bg-dark header"></b> <b class="bg-white header"></b> <b class=bg-dark></b></span></label><label class="i-checks block m-b" ng-click="\n' + "          $app.settings.navbarHeaderColor='bg-white-only'; \n" + "          $app.settings.navbarCollapseColor='bg-white-only'; \n" + "          $app.settings.asideColor='bg-black';\n" + '         "><input type=radio ng-model=$app.settings.themeID value=2> <span class="block bg-light clearfix pos-rlt"><span class="active pos-abt w-full h-full bg-black-opacity text-center"><i class="glyphicon glyphicon-ok text-white m-t-xs"></i></span> <b class="bg-white header"></b> <b class="bg-white header"></b> <b class=bg-black></b></span></label><label class="i-checks block m-b" ng-click="\n' + "          $app.settings.navbarHeaderColor='bg-primary'; \n" + "          $app.settings.navbarCollapseColor='bg-white-only'; \n" + "          $app.settings.asideColor='bg-dark';\n" + '         "><input type=radio ng-model=$app.settings.themeID value=3> <span class="block bg-light clearfix pos-rlt"><span class="active pos-abt w-full h-full bg-black-opacity text-center"><i class="glyphicon glyphicon-ok text-white m-t-xs"></i></span> <b class="bg-primary header"></b> <b class="bg-white header"></b> <b class=bg-dark></b></span></label><label class="i-checks block m-b" ng-click="\n' + "          $app.settings.navbarHeaderColor='bg-info'; \n" + "          $app.settings.navbarCollapseColor='bg-white-only'; \n" + "          $app.settings.asideColor='bg-black';\n" + '         "><input type=radio ng-model=$app.settings.themeID value=4> <span class="block bg-light clearfix pos-rlt"><span class="active pos-abt w-full h-full bg-black-opacity text-center"><i class="glyphicon glyphicon-ok text-white m-t-xs"></i></span> <b class="bg-info header"></b> <b class="bg-white header"></b> <b class=bg-black></b></span></label><label class="i-checks block m-b" ng-click="\n' + "          $app.settings.navbarHeaderColor='bg-success'; \n" + "          $app.settings.navbarCollapseColor='bg-white-only'; \n" + "          $app.settings.asideColor='bg-dark';\n" + '         "><input type=radio ng-model=$app.settings.themeID value=5> <span class="block bg-light clearfix pos-rlt"><span class="active pos-abt w-full h-full bg-black-opacity text-center"><i class="glyphicon glyphicon-ok text-white m-t-xs"></i></span> <b class="bg-success header"></b> <b class="bg-white header"></b> <b class=bg-dark></b></span></label><label class="i-checks block" ng-click="\n' + "          $app.settings.navbarHeaderColor='bg-danger'; \n" + "          $app.settings.navbarCollapseColor='bg-white-only'; \n" + "          $app.settings.asideColor='bg-dark';\n" + '         "><input type=radio ng-model=$app.settings.themeID value=6> <span class="block bg-light clearfix pos-rlt"><span class="active pos-abt w-full h-full bg-black-opacity text-center"><i class="glyphicon glyphicon-ok text-white m-t-xs"></i></span> <b class="bg-danger header"></b> <b class="bg-white header"></b> <b class=bg-dark></b></span></label></div><div class=col-xs-6><label class="i-checks block m-b" ng-click="\n' + "          $app.settings.navbarHeaderColor='bg-black'; \n" + "          $app.settings.navbarCollapseColor='bg-black'; \n" + "          $app.settings.asideColor='bg-white b-r';\n" + '         "><input type=radio ng-model=$app.settings.themeID value=7> <span class="block bg-light clearfix pos-rlt"><span class="active pos-abt w-full h-full bg-black-opacity text-center"><i class="glyphicon glyphicon-ok text-white m-t-xs"></i></span> <b class="bg-black header"></b> <b class="bg-black header"></b> <b class=bg-white></b></span></label><label class="i-checks block m-b" ng-click="\n' + "          $app.settings.navbarHeaderColor='bg-dark'; \n" + "          $app.settings.navbarCollapseColor='bg-dark'; \n" + "          $app.settings.asideColor='bg-light';\n" + '         "><input type=radio name=a ng-model=$app.settings.themeID value=14> <span class="block bg-light clearfix pos-rlt"><span class="active pos-abt w-full h-full bg-black-opacity text-center"><i class="glyphicon glyphicon-ok text-white m-t-xs"></i></span> <b class="bg-dark header"></b> <b class="bg-dark header"></b> <b class=bg-light></b></span></label><label class="i-checks block m-b" ng-click="\n' + "          $app.settings.navbarHeaderColor='bg-info dker'; \n" + "          $app.settings.navbarCollapseColor='bg-info dker'; \n" + "          $app.settings.asideColor='bg-light dker b-r';\n" + '         "><input type=radio ng-model=$app.settings.themeID value=8> <span class="block bg-light clearfix pos-rlt"><span class="active pos-abt w-full h-full bg-black-opacity text-center"><i class="glyphicon glyphicon-ok text-white m-t-xs"></i></span> <b class="bg-info dker header"></b> <b class="bg-info dker header"></b> <b class="bg-light dker"></b></span></label><label class="i-checks block m-b" ng-click="\n' + "          $app.settings.navbarHeaderColor='bg-primary'; \n" + "          $app.settings.navbarCollapseColor='bg-primary'; \n" + "          $app.settings.asideColor='bg-dark';\n" + '         "><input type=radio ng-model=$app.settings.themeID value=9> <span class="block bg-light clearfix pos-rlt"><span class="active pos-abt w-full h-full bg-black-opacity text-center"><i class="glyphicon glyphicon-ok text-white m-t-xs"></i></span> <b class="bg-primary header"></b> <b class="bg-primary header"></b> <b class=bg-dark></b></span></label><label class="i-checks block m-b" ng-click="\n' + "          $app.settings.navbarHeaderColor='bg-info dker'; \n" + "          $app.settings.navbarCollapseColor='bg-info dk'; \n" + "          $app.settings.asideColor='bg-black';\n" + '         "><input type=radio ng-model=$app.settings.themeID value=10> <span class="block bg-light clearfix pos-rlt"><span class="active pos-abt w-full h-full bg-black-opacity text-center"><i class="glyphicon glyphicon-ok text-white m-t-xs"></i></span> <b class="bg-info dker header"></b> <b class="bg-info dk header"></b> <b class=bg-black></b></span></label><label class="i-checks block m-b" ng-click="\n' + "          $app.settings.navbarHeaderColor='bg-success'; \n" + "          $app.settings.navbarCollapseColor='bg-success';\n" + "          $app.settings.asideColor='bg-dark';\n" + '          "><input type=radio ng-model=$app.settings.themeID value=11> <span class="block bg-light clearfix pos-rlt"><span class="active pos-abt w-full h-full bg-black-opacity text-center"><i class="glyphicon glyphicon-ok text-white m-t-xs"></i></span> <b class="bg-success header"></b> <b class="bg-success header"></b> <b class=bg-dark></b></span></label><label class="i-checks block" ng-click="\n' + "          $app.settings.navbarHeaderColor='bg-danger dker bg-gd'; \n" + "          $app.settings.navbarCollapseColor='bg-danger dker bg-gd'; \n" + "          $app.settings.asideColor='bg-dark';\n" + '         "><input type=radio ng-model=$app.settings.themeID value=12> <span class="block bg-light clearfix pos-rlt"><span class="active pos-abt w-full h-full bg-black-opacity text-center"><i class="glyphicon glyphicon-ok text-white m-t-xs"></i></span> <b class="bg-danger dker header"></b> <b class="bg-danger dker header"></b> <b class=bg-dark></b></span></label></div></div></div>\x3c!-- /settings --\x3e');
    $templateCache.put("src/user/layout/upload-pod.html", '<div class=container><form class=form-inline role=form><div class=row><div class=col-sm-6><label for=select-job><h4><span class="glyphicon glyphicon-pushpin"></span> Upload POD for recently completed job</h4></label></div><div class="col-sm-6 text-right"><div class="form-group pos-rlt"><select id=select-job class=form-control placeholder="Please select a job"><option>Please select a job</option><option value=JOB_ID>From - To</option></select><button type=submit class="btn btn-warning-dark">Go</button></div></div></div></form></div>');
    $templateCache.put("src/user/layout/widgets/account.html", '<div class="panel panel-default panel-sm"><div class=panel-heading><h3 class=panel-title><span>My SDCN</span></h3></div><div class=panel-collapse><div class=panel-body><div class="clearfix hidden-xs text-center" id=aside-user><div class=dropdown dropdown><span class="thumb-lg w-auto-folded avatar m-t-sm"><img data-ng-src={{$auth.user().getAvatar()}} class=img-full alt={{$auth.user().name_full}}></span> <span class=clear><span class="block m-t-sm"><p class="font-bold text-lt m-b-none">{{$auth.user().name_first}} - {{$auth.user().team_info.company_name}}</p><p class="font-bold text-lt m-b-none">(Member ID: SDN-{{$auth.user().team_id}})</p></span></span></div></div><ul class="nav nav-pills nav-stacked nav-pills-secondary m-t"><li data-ui-sref-active=active data-ng-controller=LoginController><a ui-sref=user.benefits title="Member Benefits"><span class="glyphicon glyphicon-heart"></span> Member Benefits</a></li><li data-ui-sref-active=active><a href data-ui-sref=user.account.jobs title="My Jobs"><span class="glyphicon glyphicon-folder-open"></span> Jobs Posted</a><ul class=dropdown-menu role=menu><li data-ng-class="{\'active\': !tableParams.filter()[\'status\']}"><a href data-ng-click="tableParams.filter()[\'status\'] = null" title=Active><i class="fa fa-circle text-warning"></i> All</a></li><li data-ng-class="{\'active\': tableParams.filter()[\'status\'] == key}" data-ng-repeat="(key, value) in statuses" data-ng-show="richStatuses[key].count > 0"><a href data-ng-click="tableParams.filter()[\'status\'] = key" title=value.name><i class="fa fa-circle text-{{key}}"></i> {{value.name}} ({{richStatuses[key].count}})</a></li></ul></li><li data-ui-sref-active=active><a href data-ui-sref=user.account.work title="My Work"><span class="glyphicon glyphicon-briefcase"></span> My Work</a><ul class=dropdown-menu role=menu><li data-ng-class="{\'active\': !tableParams.filter()[\'status\']}"><a href data-ng-click="tableParams.filter()[\'status\'] = null" title=Active><i class="fa fa-circle text-warning"></i> All</a></li><li data-ng-class="{\'active\': tableParams.filter()[\'status\'] == key}" data-ng-repeat="(key, value) in statuses" data-ng-show="richStatuses[key].count > 0"><a href data-ng-click="tableParams.filter()[\'status\'] = key" title=value.name><i class="fa fa-circle text-{{key}}"></i> {{value.name}} ({{richStatuses[key].count}})</a></li></ul></li><li class=dropdown data-ui-sref-active=active><a href data-ui-sref=user.account.team title="My Users"><span class="fa fa-users"></span> My Users</a><ul class=dropdown-menu role=menu><li data-ui-sref-active=active><a href data-ui-sref=user.account.team.work title="Our Work">Our Work</a></li><li data-ui-sref-active=active><a href data-ui-sref=user.account.team.jobs title="Our Jobs">Our Jobs Posted</a></li><li data-ui-sref-active=active ng-if="$auth.user().hasRole(\'team.member.primary\')"><a href data-ui-sref=user.account.team.edit title="Edit Team">Company Details</a></li><li data-ui-sref-active=active ng-if="$auth.user().hasRole(\'team.member.primary\')"><a href data-ui-sref=user.account.team.documents title="Our Documents">Our Documents</a></li><li data-ui-sref-active=active ng-if="$auth.user().hasRole(\'team.member.primary\')"><a href data-ui-sref=user.account.team.locations title="Our Locations">Our Locations</a></li><li data-ui-sref-active=active ng-if="$auth.user().hasRole(\'team.member.primary\')"><a href data-ui-sref=user.account.team.feedback title="Our Feedback">Our Feedback</a></li></ul></li><li data-ui-sref-active=active><a href data-ui-sref=user.account.feedback title=Feedback><span class="fa fa-comments"></span> Feedback</a></li><li class=dropdown data-ui-sref-active=active><a href data-ui-sref=user.account.profile title=Profile><span class="glyphicon glyphicon-user"></span> Profile</a><ul class=dropdown-menu role=menu><li data-ui-sref-active=active><a href data-ui-sref=user.account.profile.documents title="My Documents">Documents</a></li><li data-ui-sref-active=active><a href data-ui-sref=user.account.profile.locations title="My Locations">Locations</a></li><li data-ui-sref-active=active><a href data-ui-sref=user.account.profile.vehicles title="My Vehicles">Vehicles</a></li><li data-ui-sref-active=active><a href data-ui-sref=user.account.profile.notifications title=Notifications>Notifications</a></li></ul></li><li data-ui-sref-active=active data-ng-if=$auth.isAdmin()><a href data-ui-sref=admin.dashboard title="Admin Dashboard"><span class="fa fa-gears"></span> Admin Dashboard</a></li><li data-ui-sref-active=active data-ng-controller=LoginController><a href ng-click=logout() title=Logout><span class="glyphicon glyphicon-log-out"></span> Logout</a></li></ul></div></div></div>');
    $templateCache.put("src/user/layout/widgets/latest-jobs.html", '<div class="panel panel-default" data-ng-controller=LatestJobsController><div class=panel-heading><h3 class=panel-title>Latest jobs in your area</h3><h6 class=panel-sub-title>Results based on your location settings. (<a data-ui-sref=user.account.profile.locations title="Edit locations">Edit locations</a>)</h6></div><div class=panel-body><div class="not-found not-found-sm" data-ng-show=!data.length><h1>0</h1><div class=text>It appears there are no jobs near you at the moment.</div></div><ul class="jobs list-unstyled" data-ng-show=data.length><li class=job data-ng-repeat="job in data"><p class=from><span>From</span> {{job.pickup_point}}</p><p class=to><span>To</span> {{job.destination_point}}</p><div class=text-right><a class="btn btn-xs btn-warning" href data-ui-sref="user.dashboard.details({job_id: job.id})" title=Details role=button>Details</a></div></li></ul></div><div class="panel-footer text-right" data-ng-show=data.length><a class="btn btn-xs btn-default" href data-ui-sref=user.jobs.browse title="View All">View All</a></div></div>');
    $templateCache.put("src/user/layout/widgets/useful-links.html", '<div class="panel panel-default panel-sm" data-ng-controller=UsefulLinksController><div class=panel-heading><h3 class="panel-title toggle" ng-init="isCollapsed = $app.isSmartDevice" ng-click="isCollapsed = !isCollapsed"><span>Useful Links</span> <i class="pull-right fa fa-angle-up" ng-class="{\'fa-angle-down\': isCollapsed, \'fa-angle-up\': !isCollapsed}"></i></h3></div><div collapse=isCollapsed class=panel-collapse><div class=panel-body><ul class="links list-unstyled"><li class=link><a href data-ui-sref=user.benefits title="Jobs Posted">Member Benefits</a></li><li class=link><a href data-ui-sref=user.account.jobs title="Jobs Posted">Jobs Posted</a></li><li class=link><a href data-ui-sref=user.account.work title="My Work">My Work</a></li><li class=link><a href data-ui-sref=user.account.team title="My Users">My Users</a></li><li class=link><a href data-ui-sref=user.account.profile title="My Account Details">Profile</a></li></ul></div></div></div>');
    $templateCache.put("src/user/user.html", '<div class="app app-user" ng-class="{\n' + "\t'app-header-fixed': $app.settings.headerFixed,\n" + "\t'app-aside-fixed' : $app.settings.asideFixed,\n" + "\t'app-aside-folded': $app.settings.asideFolded,\n" + "\t'app-aside-dock'  : $app.settings.asideDock,\n" + "\t'container'       : $app.settings.container\n" + '}">\x3c!-- navbar --\x3e<div data-ng-include=" \'src/user/layout/header.html\' " class="app-header user navbar"></div>\x3c!-- / navbar --\x3e<div class="page-header user"><h1 class="page-title visible-xs"><div class=container>{{$state.current.page.title}}</div></h1><div class="upload-pod hidden" data-ng-include="\'src/user/layout/upload-pod.html\'"></div></div>\x3c!-- content --\x3e<div class="app-content user"><div class=container><div class="app-content-body fade-in-up" data-ui-view></div></div></div>\x3c!-- /content --\x3e\x3c!-- footer --\x3e<div data-ng-include=" \'src/user/layout/footer.html\' " class=content-info role=contentinfo></div>\x3c!-- / footer --\x3e</div>');
} ]);