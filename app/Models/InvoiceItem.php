<?php namespace Sdcn\Models;

class InvoiceItem extends AbstractModel
{
	protected $fillable = [
		'invoice_id',
		'item',
		'amount',
		'add_vat',
	];

    protected $appends = [ 'vat_amount', 'total' ];

    public function getVatAmountAttribute()
    {
        return (bool)$this->add_vat ? number_format((float)($this->amount * 0.2), 2, '.', '') : number_format((float)0, 2, '.', '');
    }

    public function getTotalAttribute()
    {
        return (bool)$this->add_vat ? number_format((float)($this->amount * 1.2), 2, '.', '') : $this->amount;
    }
}
