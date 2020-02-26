<?php namespace Sdcn\Repositories;

use Illuminate\Support\Facades\DB;
use Sdcn\Repositories\Contracts\AbstractRepositoryInterface;

/**
 * Class AbstractRepository
 * AbstractRepository implements generic repo functionality
 * All model repositories need to extend from this class
 * Repository constructor will get an injected model object or the related model class
 * @package Sdcn\Repositories
 */
abstract class AbstractRepository implements AbstractRepositoryInterface
{
	// Model object received in the constructor
	protected $model = null;

	// Some repositories may involve relationships
	protected $with = [];

	// Temporary query (Eloquent Builder) object created by make method
	public $query = null;

	// Array of filter configs, for example see Repository classes
	protected $filters = [];

	// Array of sorter configs, for example see Repository classes
	protected $sorters = [];

	// No of rows demanded per page in a paginated query
	protected $perPage = null;

	// Page number demanded in a paginated query
	protected $currentPage = null;

	// Filters demanded to apply, override to add defaults
	protected $filterBy = [];

	// Sorters demanded to apply, override to add defaults
	protected $sortBy = [];

	public $selectKeyName = 'id';

	public $selectValueName = 'name';

    public $callableFilters = [];

    /**
     * @param  callable $filter
     * @return $this
     */
    public function addCallableFilter(callable $filter)
    {
        $this->callableFilters[] = $filter;
        return $this;
    }

	public function all()
	{
		return $this->model->all();
	}

	public function with(array $with)
	{
		$this->with = array_merge($this->with, $with);

		return $this;
	}

	public function make()
	{
		$this->query = $this->model->with($this->with);

		return $this->query;
	}

	public function find($id)
	{
		$query = $this->make();

		return $query->findOrFail($id);
	}

	public function findFirstBy($key, $value, $operator = '=')
	{
		$query = $this->make();

		return $query->where($key, $operator, $value)->first();
	}

	public function findAllBy($key, $value, $operator = '=')
	{
		$query = $this->make();

		return $query->where($key, $operator, $value)->get();
	}

	public function firstByAttributes($attributes)
	{
		return $this->model->where($attributes)->first();
	}

	public function firstOrCreate(array $attributes)
	{
		return $this->model->firstOrCreate($attributes);
	}

	public function has($relation)
	{
		$query = $this->make();

		return $query->has($relation)->get();
	}

	public function create($attributes)
	{
		return $this->model->create($attributes);
	}

	public function update($id, $attributes)
	{
		$item = $this->model->findOrFail($id);

		return $item->update($attributes);
	}

	public function delete($id)
	{
		return $this->model->destroy($id);
	}

	public function paginate($perPage, $currentPage = 1)
	{
		$this->perPage = $perPage;

		$this->currentPage = $currentPage;

		return $this;
	}

	// By default filterBy will append provided filters
	public function filterBy(array $filters, $append = true)
	{
		if($append)
		{
			$this->filterBy = array_merge($filters, $this->filterBy);
		}
		else
		{
			$this->filterBy = $filters;
		}
		return $this;
	}

	public function getFilterBy()
	{
		return $this->filterBy;
	}

	// By default sortBy will override provided sorters
	public function sortBy(array $sorters, $append = false)
	{
		if($append)
		{
			$this->sortBy = array_merge($sorters, $this->sortBy);
		}
		else
		{
			$this->sortBy = $sorters;
		}
		return $this;
	}

	public function getSortBy()
	{
		return $this->sortBy;
	}

    public function applyCallableFilters()
    {
        foreach($this->callableFilters as $filter) {
            $filter($this);
        }
    }

	protected function applyFilters()
	{
		if( is_array($this->filterBy) )
		{
			foreach($this->filterBy as $key => $value)
			{
				if(strlen($key) > 0 && strlen($value) > 0)
				{
					if(array_key_exists($key, $this->filters))
					{
						if(is_array($this->filters[$key]))
						{
							$count = count($this->filters[$key]);
							if($count)
							{
								$where = $this->filters[$key][0];
								$params = [];
								for($i=1; $i < count($this->filters[$key]); $i++)
								{
									$params[] = str_replace(':value', $value, $this->filters[$key][$i]);
								}
								$this->query = $this->query->whereRaw($where, $params);
							}
						}
					}
				}
			}
		}
	}

	protected function applySorters()
	{
		if( is_array($this->sortBy) )
		{
			foreach($this->sortBy as $key => $value)
			{
				if(strlen($key) > 0 && strlen($value) > 0)
				{
					if( array_key_exists($key, $this->sorters) )
					{
						if(array_key_exists($value, $this->sorters[$key]))
						{
							$this->query = $this->query->orderByRaw($this->sorters[$key][$value][0] . ' ' . $this->sorters[$key][$value][1]);
						}
						else
						{
							$this->query = $this->query->orderBy($key, $value);
						}
					}
				}
			}
		}
	}

	public function get()
	{
		if( is_null($this->query) ) $this->make();

		$this->applyFilters();

        $this->applyCallableFilters();

		$this->applySorters();


		if( is_null($this->perPage) )
		{
			return $this->query->get();
		}
		else
		{
			$perPage = $this->perPage == -1 ? 99999 : ((int) $this->perPage ?: 10);

			$currentPage = $this->currentPage ?: 1;

			$count = data_get(with(clone $this->query->getQuery())->addSelect(DB::raw('COUNT(*) as aggregate'))->first(), 'aggregate');

			$items = $this->query->skip(($currentPage - 1) * $perPage)->limit($perPage)->get();

            return new LengthAwarePaginator($items, $count, $this->perPage);
		}
	}

	public function clearQuery()
	{
		$this->query = null;

		return $this;
	}

	public function getFilterByItem($filter, $default = null)
	{
		if (isset($this->filterBy[$filter])) {
			return $this->filterBy[$filter];
		}

		return $default;
	}
}

