<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::first();
if (!$user) { echo "No user\n"; exit; }
\Illuminate\Support\Facades\Auth::login($user);

$request = \Illuminate\Http\Request::create('/my-journal', 'GET', ['search' => 'test']);
$controller = new \App\Http\Controllers\NoteController();
try {
    $response = $controller->index($request);
    echo "SUCCESS\n";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
