<?php namespace Sdcn\Repositories;

use Sdcn\Models\DocumentType;
use Sdcn\Repositories\Contracts\DocumentTypeRepositoryInterface;

class DocumentTypeRepository extends AbstractRepository implements DocumentTypeRepositoryInterface {

    public function __construct(DocumentType $model)
    {
        $this->model = $model;
    }
}