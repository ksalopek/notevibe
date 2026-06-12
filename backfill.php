<?php

$locations = [
    ['country' => 'United States', 'city' => 'New York', 'lat' => 40.7128, 'lon' => -74.0060],
    ['country' => 'United Kingdom', 'city' => 'London', 'lat' => 51.5074, 'lon' => -0.1278],
    ['country' => 'Japan', 'city' => 'Tokyo', 'lat' => 35.6762, 'lon' => 139.6503],
    ['country' => 'Australia', 'city' => 'Sydney', 'lat' => -33.8688, 'lon' => 151.2093],
    ['country' => 'France', 'city' => 'Paris', 'lat' => 48.8566, 'lon' => 2.3522],
    ['country' => 'Germany', 'city' => 'Berlin', 'lat' => 52.5200, 'lon' => 13.4050],
];

foreach (\App\Models\User::all() as $user) {
    $loc = $locations[array_rand($locations)];
    $latOffset = (mt_rand(-50, 50) / 100);
    $lonOffset = (mt_rand(-50, 50) / 100);
    $user->update([
        'latitude' => $loc['lat'] + $latOffset,
        'longitude' => $loc['lon'] + $lonOffset,
        'country' => $loc['country'],
        'city' => $loc['city']
    ]);
}
echo "Users backfilled!\n";
