<!DOCTYPE html>
<html lang="en-US">
<head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="{{public_path()}}/assets/bootstrap/css/bootstrap.min.css">
    <style>
        .well {
            border: 0;
            box-shadow: none;
        }

        .invoice-details {
            padding-bottom: 20px;
        }

        .invoice-details p {
            margin-bottom: 0;
        }

        .invoice-to h4 {
            margin-bottom: 0;
        }

        .main-details .well {
            margin-top: 20px;
        }

        .notes,
        .invoice-totals,
        .invoice-items {
            padding-bottom: 15px;
        }

        .invoice-logo {
            text-align: right;
        }

        .invoice-logo img {
            width: 100px;
            height: auto;
            display: inline-block;
        }

        .invoice-footer {
            padding: 20px 0;
        }

    </style>
</head>
<body>
<div class="container-fluid">
    <div class="page-header">
        <h1>Invoice</h1>
    </div>

    <div class="invoice-details row">
        <div class="col-xs-3 invoice-to">
            <h3>Invoice to:</h3>
            <h4>{{ $to_company }}</h4>

            <p>{{ $to_address_line_1 }}</p>

            <p>{{ $to_address_line_2 }}</p>

            <p>{{ $to_town }}</p>

            <p>{{ $to_county }}</p>

            <p>{{ $to_postal_code }}</p>
        </div>
        <div class="col-xs-6 main-details">
            <div class="well well-sm">
                <p><b>SDCN Invoice Number:</b> {{ $invoice_number }}</p>

                <p><b>Invoice Date:</b> {{ date("d-m-Y", strtotime($invoice_date)) }}</p>

                <p><b>SDCN Reference:</b> #{{ $job_id }}</p>

                @if (isset($external_number))
                    <p><b>Customer Invoice Number:</b> #{{ $external_number }}</p>
                @else
                    <p><b>Customer Invoice Number:</b> Not available.</p>
                @endif
                
                @if (isset($customer_job_reference_number))
                    <p><b>Customer Job Reference Number:</b> #{{ $customer_job_reference_number }}</p>
                @else
                    <p><b>Customer Job Reference Number:</b> Not available.</p>
                @endif
            </div>
        </div>
        <div class="col-xs-3 text-right">
            <td class="invoice-issuer">
                @if ($from_logo != "")
                    <figure class="invoice-logo invoice-logo-inline-block">
                        <img src="{{public_path() . $from_logo}}"/>
                    </figure>
                @endif
                <h4>{{ $from_company }}</h4>

                <p>{{ $from_address_line_1 }}</p>

                <p>{{ $from_address_line_2 }}</p>

                <p>{{ $from_town }}</p>

                <p>{{ $from_county }}</p>

                <p>{{ $from_postal_code }}</p>

                <p style="word-wrap: break-word;">{{ $from_email }}</p>

                <p>{{ $from_phone }}</p>
            </td>
        </div>
    </div>

    <div class="invoice-items">
        <table class="table table-striped">
            <thead>
            <tr>
                <th>Qty</th>
                <th>Description</th>
                <th>Unit cost (£)</th>
                <th>VAT (£)</th>
                <th>Total (£)</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td>1</td>
                <td>
                    <div>SDCN Job ID: #{{$job_id}}</div>
                    <small>
                        <i>
                            (
                            @if ($pickup_formatted_address != null)
                                From: {{$pickup_formatted_address}}
                            @else
                                From: {{$pickup_formatted_address}}
                            @endif
                            ,
                            @if ($destination_formatted_address != null)
                                To: {{$destination_formatted_address}}
                            @else
                                To: {{$destination_formatted_address}}
                            @endif
                            )
                        </i>
                    </small>
                    @if (isset($job['details']) && $job['details'] != "")
                        <div>
                            Notes: {{$job['details']}}
                        </div>
                    @else
                        <div>
                            No notes available.
                        </div>
                    @endif
                </td>
                <td>
                    {{$amount}}
                </td>
                <td>
                    {{$amount_vat}}
                </td>
                <td>
                    {{$amount_total}}
                </td>
            </tr>
            @foreach ($invoice_items as $item)
                <tr>
                    <td>1</td>
                    <td>
                        {{$item["item"]}}
                    </td>
                    <td>
                        {{$item["amount"]}}
                    </td>
                    <td>
                        {{$item["vat_amount"]}}
                    </td>
                    <td>
                        {{$item["total"]}}
                    </td>
                </tr>
            @endforeach
            </tbody>
        </table>
    </div>

    <div class="invoice-totals">
        <div class="row">
            <div class="col-xs-5 col-xs-offset-7">
                <table class="table table-striped">
                    <tbody>
                    <tr>
                        <th>
                            Subtotal (ex VAT):
                        </th>
                        <td>
                            £{{$sub_total}}
                        </td>
                    </tr>
                    <tr>
                        <th>
                            Total VAT:
                        </th>
                        <td>
                            £{{$vat_amount}}
                        </td>
                    </tr>
                    <tr>
                        <th>
                            Total:
                        </th>
                        <td>
                            £{{$total}}
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    @if (isset($notes) && $notes != "")
        <div class="notes">
            <h4>Notes:</h4>
            <div class="well well-sm">
                {{$notes}}
            </div>
        </div>
    @endif

    @if (isset($invoice_footer) && $invoice_footer != "")
        <div class="invoice-footer">
            <i>{!!$invoice_footer!!}</i>
        </div>
    @endif

    <hr>
    <div class="text-center">
        @if (isset($vat_number) && $vat_number != "")
            <p><small class="text-center">VAT: {{$vat_number}}</small></p>
        @endif
        <small class="text-center">Sameday Courier Network {{date("Y")}}</small>
    </div>
</div>
</body>
</html>