<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function index()
    {
        return Inertia::render('Admin/Dashboard');
    }

    public function users()
    {
        return Inertia::render('Admin/Users', [
            'users' => \App\Models\User::orderBy('created_at', 'desc')->get()
        ]);
    }

    public function toggleUserStatus(\App\Models\User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->withErrors('You cannot disable your own account.');
        }

        $user->update([
            'is_active' => !$user->is_active
        ]);

        return back()->with('message', 'User status updated successfully.');
    }

    public function disableAllUsers()
    {
        \App\Models\User::where('id', '!=', auth()->id())->update([
            'is_active' => false
        ]);

        return back()->with('message', 'NUCLEAR OPTION ENGAGED: All other users have been disabled.');
    }

    public function enableAllUsers()
    {
        \App\Models\User::query()->update([
            'is_active' => true
        ]);

        return back()->with('message', 'RESTORE OPTION ENGAGED: All users have been enabled.');
    }
}
