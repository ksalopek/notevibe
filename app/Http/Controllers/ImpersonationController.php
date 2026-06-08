<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class ImpersonationController extends Controller
{
    /**
     * Start impersonating a user.
     */
    public function store(User $user)
    {
        // Double check admin authorization (also handled by middleware)
        if (!auth()->user()->isAdmin()) {
            abort(403);
        }

        // Don't impersonate yourself
        if (auth()->id() === $user->id) {
            return back()->withErrors('You cannot impersonate yourself.');
        }

        // Store original admin ID in session
        session()->put('impersonated_by', auth()->id());

        // Login as the target user
        auth()->login($user);

        return redirect()->route('dashboard')->with('message', "You are now impersonating {$user->name}.");
    }

    /**
     * Stop impersonating and revert back to admin.
     */
    public function destroy()
    {
        if (session()->has('impersonated_by')) {
            $originalAdminId = session()->get('impersonated_by');
            
            // Retrieve original admin
            $admin = User::find($originalAdminId);
            
            if ($admin) {
                // Clear the session variable
                session()->forget('impersonated_by');
                
                // Login back as admin
                auth()->login($admin);
                
                return redirect()->route('admin.users')->with('message', 'Welcome back! You are no longer impersonating.');
            }
        }
        
        return back();
    }
}
