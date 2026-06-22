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
        if (!Schema::hasColumn('notes', 'folder_id')) {
            Schema::table('notes', function (Blueprint $table) {
                $table->foreignId('folder_id')->nullable()->constrained('folders')->nullOnDelete();
            });
        } else {
            Schema::table('notes', function (Blueprint $table) {
                // If it already exists, just add the constraint (ignoring errors if it already has one)
                try {
                    $table->foreign('folder_id')->references('id')->on('folders')->nullOnDelete();
                } catch (\Exception $e) {
                    // Constraint might already exist
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->dropForeign(['folder_id']);
            $table->dropColumn('folder_id');
        });
    }
};
