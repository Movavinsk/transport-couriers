<?php namespace Sdcn\Repositories;

abstract class AbstractChildRepository extends AbstractRepository {

	protected $parentId = null;

	protected $parent = null;

	protected $childRelation = null;

	/**
	 * parentId is public function
	 * Controller must be able to set parentId on repo
	 *
	 * @param $id
	 */
	public function parentId($id)
	{
		$this->parentId = $id;
	}

	public function make()
	{
		if(!is_null($this->parentId) && !is_null($this->parent) && !is_null($this->childRelation))
		{
			$this->query = $this->parent->findOrFail($this->parentId)->{$this->childRelation}()->with($this->with);
		}
		else
		{
			$this->query = $this->model->with($this->with);
		}
		return $this->query;
	}
}
