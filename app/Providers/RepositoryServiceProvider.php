<?php namespace Sdcn\Providers;

use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
	public function register()
	{
		$models = [
			'Bid',
			'File',
			'Invoice',
			'Job',
			'Location',
			'Pod',
			'User',
			'UserDetail',
			'Vehicle',
			'Document',
            'DocumentType',
			'Event',
            'Statistic',
			'Feedback',
            'Team',
            'TeamMember',
            'UserVehicles',
            'UserSettings',
            'TeamFeedback',
            'TeamDocuments',
            'TeamLocations',
            'Partner',
            'Benefit',
            'TeamVehicles'
		];

		foreach ($models as $model) {
			$this->app->bind(
				'Sdcn\\Repositories\\Contracts\\' . $model . 'RepositoryInterface',
				'Sdcn\\Repositories\\' . $model . 'Repository'
			);
		}

	}
}
