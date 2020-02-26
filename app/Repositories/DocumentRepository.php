<?php namespace Sdcn\Repositories;

use Carbon\Carbon;
use Sdcn\Models\Document;
use Sdcn\Models\User;
use Sdcn\Repositories\Contracts\DocumentRepositoryInterface;
use Illuminate\Support\Facades\Auth;

/**
 * Class LocationRepository
 * @package Sdcn\Repositories
 */
class DocumentRepository extends AbstractChildRepository implements DocumentRepositoryInterface
{
	protected $sorters = [
		'id' => [],
		'created_at' => []
	];

	public function __construct(Document $model, User $parent)
	{
		$this->model = $model;
		$this->parent = $parent;
		$this->childRelation = 'documents';
	}

    public function create($attributes)
    {
        /*
         * Frontend is passing in invalid timestamp from document upload form,
         * resulting in carbon exception on parsing.
         */
        if (array_key_exists('expiry', $attributes)) {
            try {
                Carbon::parse($attributes['expiry']);
            } catch (\Exception $e) {
                $attributes['expiry'] = null;
            }
        }

        $document = $this->model->create($attributes);

        if ($document && array_key_exists('file', $attributes) && $attributes['file']->isValid()) {

            $file = $attributes['file'];

            $file_name = $attributes['user_id'] . "-" . $document->id . "." . $file->getClientOriginalExtension();

            $file->move(public_path() . config('info.upload_path.document'), $file_name);

            $document->upload = config('info.upload_path.document') . $file_name;
        }

        if ($attributes['expiry']) {

            $document->expiry = $attributes['expiry'];

        }

		$document->save();

		return $document;
	}

	public function update($id, $attributes)
	{
		$document = $this->model->findOrFail($id);

		$initial_status = $document->status;

		$document->expiry = $attributes['expiry'];

		unset($attributes['expiry']);

		$document->update($attributes);

		if( array_key_exists('file', $attributes) && $attributes['file']->isValid() )
		{
			$file_path = public_path() . $document->upload;

			if( is_file($file_path) ) unlink($file_path);

			$file = $attributes['file'];

			$file_name = $attributes['user_id'] . "-". $document->id . "." . $file->getClientOriginalExtension();

			$file->move(public_path() . config('info.upload_path.document'), $file_name);

			$document->upload = config('info.upload_path.document') . $file_name;

		}

		$document->save();

		return $document;
	}


	public function delete($id)
	{
		$document = $this->model->findOrFail($id);

		$file_path = public_path() . $document->upload;

		if( is_file($file_path) ) unlink($file_path);

		return $this->model->destroy($id);
	}


}
