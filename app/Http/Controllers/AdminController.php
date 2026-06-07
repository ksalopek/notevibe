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

    /**
     * Display all users.
     */
    public function users()
    {
        // Fetch users ordered by newest first
        $users = User::orderBy('created_at', 'desc')->get();

        return Inertia::render('Admin/Users', [
            'users' => $users,
        ]);
    }

    /**
     * Toggle the active status of a user.
     */
    public function toggleUserStatus(User $user)
    {
        // Prevent an admin from disabling themselves
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot disable your own account.');
        }

        $user->is_active = !$user->is_active;
        $user->save();

        $status = $user->is_active ? 'activated' : 'disabled';
        return back()->with('success', "User {$user->name} has been successfully {$status}.");
    }

    /**
     * Disable all users except the currently authenticated admin.
     */
    public function disableAllUsers()
    {
        $count = User::where('id', '!=', auth()->id())
                     ->where('is_active', true)
                     ->update(['is_active' => false]);

        return back()->with('success', "Nuclear Option Engaged! Successfully disabled {$count} active users.");
    }

    /**
     * Enable all users except the currently authenticated admin.
     */
    public function enableAllUsers()
    {
        $count = User::where('id', '!=', auth()->id())
                     ->where('is_active', false)
                     ->update(['is_active' => true]);

        return back()->with('success', "Successfully restored and enabled {$count} users.");
    }
}
