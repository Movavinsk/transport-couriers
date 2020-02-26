<?php namespace Sdcn\Repositories\Contracts;

/**
 * Interface AbstractRepositoryInterface
 * Used to resolve repositories in Laravel container
 * @package Sdcn\Repositories
 */
interface AbstractRepositoryInterface
{

    /**
     * @param  callable $filter
     * @return $this
     */
    public function addCallableFilter(callable $filter);

	public function all();

	public function with(array $with);

	// Find operations

	public function find($id);

	public function findFirstBy($key, $value, $operator = '=');

	public function findAllBy($key, $value, $operator = '=');

	public function firstByAttributes($attributes);

	public function firstOrCreate(array $attributes);

	public function has($relation);

	// CRUD operations

	public function create($attributes);

	public function update($id, $attributes);

	public function delete($id);

	// Misc operations

	public function paginate($perPage, $currentPage = 1);

	public function filterBy(array $filters, $append = true);

	public function getFilterBy();

	public function sortBy(array $sorters, $append = false);

	public function getSortBy();

	public function get();

	public function clearQuery();
}
