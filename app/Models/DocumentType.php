<?php namespace Sdcn\Models;

class DocumentType extends AbstractModel {

    protected $fillable = ['name', 'expiry_required', 'amount_required'];

}