<?php namespace Sdcn\Models;

class Invoice extends AbstractModel {

    protected $fillable = [
        'job_id',
        'invoice_date',
        'manual',
        'amount',
        'notes',
        'cc',
        'invoice_number',
        'external_number',
        'paid',
        'to_company',
        'to_address_line_1',
        'to_address_line_2',
        'to_town',
        'to_county',
        'to_postal_code',
        'from_logo',
        'from_company',
        'from_address_line_1',
        'from_address_line_2',
        'from_town',
        'from_county',
        'from_postal_code',
        'from_email',
        'from_phone',
        'add_vat',
        'invoice_footer',
        'vat_number',
        'pickup_point',
        'destination_point',
        'customer_job_reference_number',
        'pickup_formatted_address',
        'destination_formatted_address'
    ];

    protected $appends = ['invoice_items', 'amount_vat', 'amount_total', 'sub_total', 'vat_amount', 'total'];

    protected $with = ['job', 'job.user', 'job.user.team'];

    public function job()
    {
        return $this->belongsTo('Sdcn\Models\Job');
    }

    public function getManualAttribute()
    {
        return (bool)$this->attributes['manual'];
    }

    public function setManualAttribute($value)
    {
        $this->attributes['manual'] = (bool)$value;
    }

    public function invoiceItems()
    {
        return $this->hasMany('Sdcn\Models\InvoiceItem');
    }

    public function getInvoiceItemsAttribute()
    {
        return $this->invoiceItems()->get()->toArray();
    }

    public function setInvoiceItemsAttribute($invoice_items)
    {
        $total = count($invoice_items);

        $cnt = 0;

        foreach ($this->invoiceItems()->get() as $item)
        {
            if ($total && $cnt < $total)
            {
                $item->item = $invoice_items[$cnt]['item'];

                $item->amount = $invoice_items[$cnt]['amount'];

                $item->add_vat = $invoice_items[$cnt]['add_vat'];

                $item->save();
            } else
            {
                $item->delete();
            }
            $cnt++;
        }
        for ($i = $cnt; $i < $total; $i++)
        {
            $this->invoiceItems()->save(new InvoiceItem($invoice_items[$i]));
        }
    }

    public function setPaidAttribute($value)
    {
        return $this->attributes['paid'] = (bool)$value;
    }

    public function getAmountVatAttribute()
    {
        return (bool)$this->add_vat ? number_format((float)($this->amount * 0.2), 2, '.', '') : number_format((float)0, 2, '.', '');
    }

    public function getAmountTotalAttribute()
    {
        return (bool)$this->add_vat ? number_format((float)($this->amount * 1.2), 2, '.', '') : $this->amount;
    }

    public function getSubTotalAttribute()
    {
        $subtotal = $this->amount;
        $items = $this->getInvoiceItemsAttribute();

        if (!empty($items))
        {
            foreach ($items as $item)
            {
                $subtotal += $item['amount'];
            }
        }

        return number_format((float)$subtotal, 2, '.', '');
    }

    public function getVatAmountAttribute()
    {
        $vat_amount = (bool)$this->add_vat ? ($this->amount * 0.2) : 0;
        $items = $this->getInvoiceItemsAttribute();

        if (!empty($items))
        {
            foreach ($items as $item)
            {
                $vat_amount += $item['vat_amount'];
            }
        }

        return number_format((float)$vat_amount, 2, '.', '');
    }

    public function getTotalAttribute()
    {
        $total = (bool)$this->add_vat ? ($this->amount * 1.2) : $this->amount;
        $items = $this->getInvoiceItemsAttribute();

        if (!empty($items))
        {
            foreach ($items as $item)
            {
                $total += $item['total'];
            }
        }

        return number_format((float)$total, 2, '.', '');
    }
}
