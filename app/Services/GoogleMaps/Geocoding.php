<?php

namespace Sdcn\Services\GoogleMaps;

use GuzzleHttp\Client;

class Geocoding
{
    protected $client;

    public function __construct()
    {
        $this->client = new Client([
            'base_uri' => config('services.google_maps.geocode_base'),
        ]);
    }
    public function getAddressFromCoordinates($lat, $lng)
    {
        $queryString = [
            'latlng' => $this->getCombinedLatLng($lat, $lng),
            'key' => config('services.google_maps.api_key'),
        ];

        $response = $this->client->get('json', [
            'query' => $queryString,
        ]);

        return json_decode($response->getBody());
    }

    private function getCombinedLatLng($lat, $lng)
    {
        return $lat . ',' . $lng;
    }
}