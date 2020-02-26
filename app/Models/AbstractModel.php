<?php namespace Sdcn\Models;

use Illuminate\Database\Eloquent\Model;

abstract class AbstractModel extends Model {

	protected $toCustomArrayFields = array();

	public function newCollection(array $models = array())
	{
		return new \Sdcn\Repositories\Collection($models);
	}

	public function __call($method, $parameters)
	{
		if( substr($method, 0, 2) == 'to' )
		{
			return call_user_func_array(array($this, 'toCustomArray'), [ $method ]);
		}

		return parent::__call($method, $parameters);
	}

    public static function __callStatic($method, $parameters)
    {
        if (preg_match('/^findBy(.*?)$/', $method, $matches)) {
            $column = snake_case($matches[1]);

            return call_user_func_array('static::where', array_merge([$column], $parameters))->first();
        }

        return parent::__callStatic($method, $parameters);
    }

	public function toCustomArray($method)
	{
		$type = strtolower(substr($method, 2));

		if(array_key_exists($type, $this->toCustomArrayFields))
		{
			$attributes = $this->toCustomArrayFields[$type];
		}
		else
		{
			throw new \RuntimeException('`' . $type . '` attributes missing from $to');
		}
		$result = [];

		foreach($attributes as $attribute)
		{
			$result[$attribute] = $this->{$attribute};
		}
		return $result;
	}
}