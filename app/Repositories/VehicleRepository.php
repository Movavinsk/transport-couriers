<?php

namespace Sdcn\Repositories;

use Illuminate\Support\Facades\Storage;
use Sdcn\Models\Vehicle;
use Sdcn\Repositories\Contracts\VehicleRepositoryInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Class VehicleRepository
 * @package Sdcn\Repositories
 */
class VehicleRepository extends AbstractRepository implements VehicleRepositoryInterface
{
	protected $sorters = [
		'name' => [],
		'size' => [],
		'sort_no' => []
	];

	protected $filters = [
		'id' => ['id = ?', ':value'],
		'name' => ['name LIKE ?', '%:value%'],
		'search' => ['name LIKE ?', '%:value%'],
	];

	public function __construct(Vehicle $model)
	{
		$this->model = $model;
	}

	public function create($attributes)
	{
		// Laravel provides a array for overriding default values
		// Unfortunately the sort_no field is calculated from DB
		// Alternately, We can use Vehicle creating observer for setting this
		if (!array_key_exists('sort_no', $attributes) || ! $attributes['sort_no']) {
			$attributes['sort_no'] = $this->model->count() + 1;
		}

		$vehicle = $this->model->create($attributes);

		if ($vehicle && array_key_exists('file', $attributes) && $attributes['file']->isValid()) {
			$this->storeIconFiles($vehicle, $attributes['file']);
		}

		return $vehicle;
	}

	public function update($id, $attributes)
	{
		$vehicle = $this->model->findOrFail($id);

		$vehicle->update($attributes);

		if (array_key_exists('file', $attributes) && $attributes['file']->isValid()) {
			$this->deleteIconFiles($vehicle);
			$this->storeIconFiles($vehicle, $attributes['file']);
		}

		return $vehicle;
	}

	public function delete($id)
	{
		$vehicle = $this->model->findOrFail($id);

		$this->deleteIconFiles($vehicle);

		return $this->model->destroy($id);
	}

	/**
	 * Stores icon files for instances of $vehicle.
	 *
	 * @param Vehicle $vehicle
	 * @param UploadedFile $file
	 *
	 * @return void
	 */
	private function storeIconFiles(Vehicle $vehicle, UploadedFile $file)
	{
		$filePath = config('info.upload_path.vehicle_icon') . md5(str_random(60));
		$svgPath = "$filePath.svg";

		Storage::disk('public')->put($svgPath, file_get_contents($file));

		$png = new \IMagick();
		$png->setBackgroundColor(new \ImagickPixel('transparent'));
		$png->readImageBlob(file_get_contents($file));
		$png->setImageFormat('png32');

		$pngPath = "$filePath.png";
		Storage::disk('public')->put($pngPath, $png);

		$vehicle->icon = $svgPath;
		$vehicle->png_icon = $pngPath;

		$vehicle->save();
	}

	/**
	 * Deletes icon files from instances of $vehicle.
	 *
	 * @param Vehicle $vehicle
	 *
	 * @return void
	 */
	private function deleteIconFiles(Vehicle $vehicle)
	{
		$files = array_filter([$vehicle->icon, $vehicle->png_icon], function ($file) {
			return $file && Storage::disk('public')->exists($file);
		});

		if (!empty($files)) {
			Storage::disk('public')->delete($files);
		}
	}
}
