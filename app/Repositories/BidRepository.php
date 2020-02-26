<?php namespace Sdcn\Repositories;

use Sdcn\Models\Bid;
use Sdcn\Models\User;
use Sdcn\Repositories\Contracts\BidRepositoryInterface;

/**
 * Class BidRepository
 * @package Sdcn\Repositories
 */
class BidRepository extends AbstractRepository implements BidRepositoryInterface
{
    protected $sorters = [
        'id' => [],
        'bid_date' => [],
        'amount' => [],
    ];

    protected $filters = [
        'id' => ['id = ?', ':value'],
        'job_id' => ['job_id = ?', ':value'],
        'user_id' => ['user_id = ?', ':value'],
        'details' => ['details LIKE ?', '%:value%'],
        'search' => ['details LIKE ?', '%:value%'],
    ];

    protected $with = ['user.feedbacks'];

    /**
     * @param Bid $model
     */
    public function __construct(Bid $model)
    {
        $this->model = $model;
    }

    public function retract(Bid $bid, User $user)
    {
        $bid->delete();
    }
}
