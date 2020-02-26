<?php namespace Sdcn\Repositories;

use Sdcn\Models\Pod;
use Sdcn\Repositories\Contracts\PodRepositoryInterface;

/**
 * Class PodRepository
 * @package Sdcn\Repositories
 */
class PodRepository extends AbstractRepository implements PodRepositoryInterface
{
    protected $sorters = [
        'id' => [],
        'delivery_date' => []
    ];

    protected $filters = [
        'id' => ['id = ?', ':value'],
        'job_id' => ['job_id = ?', ':value'],
        'search' => ['recipient LIKE ?', '%:value%'],
    ];

    /**
     * @param Pod $model
     */
    public function __construct(Pod $model)
    {
        $this->model = $model;
    }

    public function create($attributes)
    {

        $pod = new $this->model($attributes);

        if( $pod && array_key_exists('file', $attributes) && $attributes['file']->isValid() )
        {

            $file = $attributes['file'];

            // $file_name = $pod->id . "." . $file->getClientOriginalExtension();
            $file_name = time() . "." . $file->getClientOriginalExtension();

            $file->move(public_path() . config('info.upload_path.pod'), $file_name);

            $pod->upload = config('info.upload_path.pod') . $file_name;

            $pod->save();

        } else if(array_key_exists('no_pod_reason', $attributes)) {

            $pod = $this->model->create($attributes);

            $pod->no_pod_reason = $attributes['no_pod_reason'];

        } else {

            throw new \Exception('You must either upload a POD file or specify a reason.');

        }

        return $pod->save();

    }
}
