<?php namespace Sdcn\Http\Controllers\Helpers;

use Illuminate\Support\Facades\Response;
use Illuminate\Http\Response as IlluminateResponse;
use Illuminate\Support\MessageBag;
use Illuminate\Pagination\LengthAwarePaginator as Paginator;

/**
 * trait ApiResponseHelper
 */

trait ApiResponseHelper {

	/**
	 * @var int
	 */
	protected $statusCode = IlluminateResponse::HTTP_OK;

    /**
     * @var array
     */
    protected $properties = [];

	/**
	 * @param int $statusCode
	 * @return $this
	 */
	protected function statusCode($statusCode) {
		$this->statusCode = $statusCode;
		return $this;
	}

	/**
	 * @return $this
	 */
	protected function statusOk() {
		$this->statusCode = IlluminateResponse::HTTP_OK;
		return $this;
	}

	/**
	 * @return $this
	 */
	protected function statusNotFound() {
		$this->statusCode = IlluminateResponse::HTTP_NOT_FOUND;
		return $this;
	}

	/**
	 * @return $this
	 */
	protected function statusBadRequest() {
		$this->statusCode = IlluminateResponse::HTTP_BAD_REQUEST;
		return $this;
	}

	/**
	 * @return $this
	 */
	protected function statusUnauthorized() {
		$this->statusCode = IlluminateResponse::HTTP_UNAUTHORIZED;
		return $this;
	}

	protected function statusForbidden()
	{
		$this->statusCode = IlluminateResponse::HTTP_FORBIDDEN;
		return $this;
	}

	/**
	 * @return $this
	 */
	protected function statusInternalError() {
		$this->statusCode = IlluminateResponse::HTTP_INTERNAL_SERVER_ERROR;
		return $this;
	}

	/**
	 * @return $this
	 */
	protected function statusCreated() {
		$this->statusCode = IlluminateResponse::HTTP_CREATED;
		return $this;
	}

	/**
	 * @return $this
	 */
	protected function statusUpdated() {
		$this->statusCode = IlluminateResponse::HTTP_RESET_CONTENT;
		return $this;
	}

	/**
	 * @return $this
	 */
	protected function statusDeleted() {
		$this->statusCode = IlluminateResponse::HTTP_NO_CONTENT;
		return $this;
	}

	/**
	 * @var MessageBag
	 */
	protected $messages;

	/**
	 * Add message in MessageBag
	 *
	 * @return $this
	 */
	protected function messages() {
		if(empty($this->messages)) $this->messages = new MessageBag;
		if(func_num_args()===1) {
			$bag = func_get_arg(0);
			$this->messages->merge($bag);
		} elseif(func_num_args()===2) {
			$key = func_get_arg(0);
			$message = func_get_arg(1);
			$this->messages->add($key, $message);
		}
		return $this;
	}

	/**
	 * @var array
	 */
	protected $data;

	/**
	 * @param array $data
	 * @return $this
	 */
	protected function data(array $data) {
		$this->data = $data;
		return $this;
	}

	/**
	 * @var Paginator
	 */
	protected $paginator;

	/**
	 * @param Paginator $paginator
	 * @return $this
	 */
	protected function paginator(Paginator $paginator) {
		$this->paginator = $paginator;
		return $this;
	}

    public function property($k, $v)
    {
        $this->properties[$k] = $v;
        return $this;
    }

	/**
	 * @param array $headers
	 * @return mixed
	 */
	protected function respond($headers = []) {
		return Response::make(array_merge(

			empty($this->messages) ? [] : ( $this->messages->count()>0 ? ['messages' => $this->messages->all(':message')] : [] ),
			empty($this->data) ? ['data' => []] : ['data' => $this->data],
			empty($this->paginator) ? [] : ['paginator' => [
				'total' => $this->paginator->total(),
				'count' => $this->paginator->perPage(),
				'page' => $this->paginator->currentPage(),
			]],
            ['properties' => $this->properties]
		), $this->statusCode, $headers);
	}

}
