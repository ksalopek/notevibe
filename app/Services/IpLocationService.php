<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class IpLocationService
{
    /**
     * Get location data from an IP address using ip-api.com.
     *
     * @param string|null $ip
     * @return array|null
     */
    public function getLocation(?string $ip): ?array
    {
        if (empty($ip)) {
            return null;
        }

        // Mock for local development
        if ($ip === '127.0.0.1' || $ip === '::1') {
            // Randomly select a few test locations so the heatmap can have varied data
            $testLocations = [
                ['country' => 'United States', 'city' => 'New York', 'lat' => 40.7128, 'lon' => -74.0060],
                ['country' => 'United Kingdom', 'city' => 'London', 'lat' => 51.5074, 'lon' => -0.1278],
                ['country' => 'Japan', 'city' => 'Tokyo', 'lat' => 35.6762, 'lon' => 139.6503],
                ['country' => 'Australia', 'city' => 'Sydney', 'lat' => -33.8688, 'lon' => 151.2093],
            ];
            $mockData = $testLocations[array_rand($testLocations)];
            return [
                'latitude' => $mockData['lat'],
                'longitude' => $mockData['lon'],
                'country' => $mockData['country'],
                'city' => $mockData['city'],
            ];
        }

        try {
            $response = Http::timeout(3)->get("http://ip-api.com/json/{$ip}");

            if ($response->successful() && $response->json('status') === 'success') {
                return [
                    'latitude' => $response->json('lat'),
                    'longitude' => $response->json('lon'),
                    'country' => $response->json('country'),
                    'city' => $response->json('city'),
                ];
            }
        } catch (\Exception $e) {
            Log::error("Failed to fetch location for IP {$ip}: " . $e->getMessage());
        }

        return null;
    }
}
