<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // create permissions
        $permissions = [
            'manage_users',
            'manage_notes',
            'manage_settings',
            'manage_reporting',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // create roles and assign created permissions
        $superAdmin = Role::firstOrCreate(['name' => 'super_admin']);
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $userAdmin = Role::firstOrCreate(['name' => 'user_admin']);
        $contentAdmin = Role::firstOrCreate(['name' => 'content_admin']);
        $settingsAdmin = Role::firstOrCreate(['name' => 'settings_admin']);

        // Give all permissions to general admin (super_admin bypasses through Gate)
        $admin->syncPermissions(Permission::all());

        // Give specific permissions to specific admins
        $userAdmin->syncPermissions(['manage_users']);
        $contentAdmin->syncPermissions(['manage_notes']);
        $settingsAdmin->syncPermissions(['manage_settings']);
    }
}
