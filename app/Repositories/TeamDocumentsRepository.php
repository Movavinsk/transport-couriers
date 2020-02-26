<?php namespace Sdcn\Repositories;

use Carbon\Carbon;
use Illuminate\Support\Facades\Event;
use Sdcn\Models\Document;
use Sdcn\Models\Team;
use Sdcn\Repositories\AbstractChildRepository;
use Sdcn\Repositories\Contracts\TeamDocumentsRepositoryInterface;

class TeamDocumentsRepository extends AbstractChildRepository implements TeamDocumentsRepositoryInterface
{
    public function __construct(Document $model, Team $parent)
    {
        $this->model = $model;
        $this->parent = $parent;
        $this->childRelation = 'documents';
    }

    public function create($attributes)
    {
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

        $document->expiry = $attributes['expiry'];

        unset($attributes['expiry']);

        $document->update($attributes);

        if (array_key_exists('file', $attributes) && $attributes['file']->isValid()) {
            $file_path = public_path() . $document->upload;

            if (is_file($file_path)) unlink($file_path);

            $file = $attributes['file'];

            $file_name = $attributes['user_id'] . "-" . $document->id . "." . $file->getClientOriginalExtension();

            $file->move(public_path() . config('info.upload_path.document'), $file_name);

            $document->upload = config('info.upload_path.document') . $file_name;

        }

        $document->save();

        return $document;
    }

}
