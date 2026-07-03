<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('login_histories', function (Blueprint $table) {
            $table->string('device_type')->nullable(); // Desktop, Mobile, Tablet, Robot, etc.
            $table->string('platform')->nullable(); // OS (Windows, iOS, etc)
            $table->string('browser')->nullable(); // Chrome, Safari, etc
            $table->string('city')->nullable();
            $table->string('country')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('login_histories', function (Blueprint $table) {
            $table->dropColumn([
                'device_type', 'platform', 'browser',
                'city', 'country', 'latitude', 'longitude'
            ]);
        });
    }
};
