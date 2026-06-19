<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Create the super_admin role using DB facade to avoid model state issues
        $roleId = DB::table('roles')->insertGetId([
            'name' => 'super_admin',
            'guard_name' => 'web',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Assign the super_admin role to existing users with role = 'admin'
        $adminUsers = DB::table('users')->where('role', 'admin')->get();
        foreach ($adminUsers as $user) {
            DB::table('model_has_roles')->insert([
                'role_id' => $roleId,
                'model_type' => 'App\Models\User',
                'model_id' => $user->id,
            ]);
        }

        // 3. Drop the old role column
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('spatie_and_drop_role_column', function (Blueprint $table) {
            //
        });
    }
};
