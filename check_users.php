<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::where('email', 'admin@example.com')->first();
if ($user) {
    echo "User found! Role: " . $user->role . "\n";
} else {
    echo "User NOT found!\n";
}
