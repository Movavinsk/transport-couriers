<?php namespace Sdcn\Repositories;

use Sdcn\Models\Invoice;
use Sdcn\Models\Job;
use Illuminate\Support\Facades\Auth;
use Sdcn\Repositories\Contracts\InvoiceRepositoryInterface;

/**
 * Class InvoiceRepository
 * @package Sdcn\Repositories
 */
class InvoiceRepository extends AbstractRepository implements InvoiceRepositoryInterface
{
    protected $sorters = [
        'id' => [],
        'invoice_date' => [],
        'manual' => [],
        'amount' => [],
        'invoice_number' => [],
    ];

    protected $filters = [
        'id' => ['id = ?', ':value'],
        'job_id' => ['job_id = ?', ':value'],
	    'manual' => ['manual = ?', ':value'],
	    'invoice_number' => ['invoice_number LIKE ?', '%:value%'],
	    'notes' => ['notes LIKE ?', '%:value%'],
	    'invoice_date_date_begin' => ['DATE(invoice_date_date) >= ?', ':value'],
	    'invoice_date_date_end' => ['DATE(invoice_date_date) <= ?', ':value'],
	    'search' => ['invoice_number LIKE ? OR notes LIKE ?', '%:value%', '%:value%'],
    ];

    /**
     * @param Invoice $model
     */
    public function __construct(Invoice $model)
    {
        $this->model = $model;
    }

    public function create($attributes)
    {
        $count = Job::where(function ($query) {$query->where('status','invoice')->orWhere('status', 'complete');})->where('bid_user_id',Auth::user()->id)->count();

        \DB::beginTransaction();

        try
        {
            $item = $this->model->create($attributes);

            if( array_key_exists('invoice_items', $attributes) )
            {
                $item->invoice_items = $attributes['invoice_items'];

                $item->save();
            }

            $item->invoice_number = 'SDN-' . Auth::user()->team->id . "-" . ($count + 1);

            $item->save();
        }
        catch(\Exception $e)
        {
            \DB::rollback();

            throw $e;
        }
        \DB::commit();

        return $item;
    }

    public function update($id, $attributes)
    {
        $item = $this->model->findOrFail($id);

        \DB::beginTransaction();

        try
        {
            $item->update($attributes);

            if( array_key_exists('invoice_items', $attributes) )
            {
                $item->invoice_items = $attributes['invoice_items'];

                $item->save();
            }
        }
        catch(\Exception $e)
        {
            \DB::rollback();

            throw $e;
        }
        \DB::commit();

        return $item;
    }
}
