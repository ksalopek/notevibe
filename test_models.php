<?php
require 'vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$apiKey = env('GEMINI_API_KEY');
$response = Illuminate\Support\Facades\Http::get("https://generativelanguage.googleapis.com/v1beta/models?key={$apiKey}");
$data = json_decode($response->body(), true);

if (isset($data['models'])) {
    foreach ($data['models'] as $model) {
        if (strpos($model['name'], 'gemini') !== false && in_array('generateContent', $model['supportedGenerationMethods'])) {
            echo $model['name'] . "\n";
        }
    }
} else {
    echo "Error fetching models: " . $response->body() . "\n";
}
