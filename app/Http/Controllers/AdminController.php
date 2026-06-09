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
    public function index(Request $request)
    {
        $sortLoginsField = $request->input('sort_logins', 'last_login_at');
        $sortLoginsDirection = $request->input('direction_logins', 'desc');

        return Inertia::render('Admin/Dashboard', [
            'metrics' => fn () => [
                'totalUsers' => User::count(),
                'activeUsers' => User::where('is_active', true)->count(),
                'inactiveUsers' => User::count() - User::where('is_active', true)->count(),
                'totalNotes' => \App\Models\Note::count(),
            ],
            'recentUsers' => fn () => User::latest()->take(5)->get(),
            'latestLogins' => fn () => User::whereNotNull('last_login_at')
                ->when($request->search_logins, function($query, $search) {
                    $query->where(function($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                          ->orWhere('email', 'like', "%{$search}%");
                    });
                })
                ->orderBy($sortLoginsField, $sortLoginsDirection)
                ->paginate(10)
                ->withQueryString(),
            'filters' => $request->only(['search_logins', 'sort_logins', 'direction_logins']),
        ]);
    }

    public function users(Request $request)
    {
        $sortField = $request->input('sort', 'id');
        $sortDirection = $request->input('direction', 'asc');

        $users = \App\Models\User::query()
            ->when($request->search_users, function($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->orderBy($sortField, $sortDirection)
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Users', [
            'users' => $users,
            'filters' => $request->only(['search_users', 'sort', 'direction']),
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

    public function notes(Request $request)
    {
        $sortField = $request->input('sort', 'created_at');
        $sortDirection = $request->input('direction', 'desc');

        $query = \App\Models\Note::with('user')
            ->when($request->search_notes, function($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('content', 'like', "%{$search}%")
                      ->orWhereHas('user', function($uq) use ($search) {
                          $uq->where('name', 'like', "%{$search}%");
                      });
                });
            });

        if ($sortField === 'author') {
            $query->join('users', 'notes.user_id', '=', 'users.id')
                  ->select('notes.*')
                  ->orderBy('users.name', $sortDirection);
        } else {
            $query->orderBy('notes.' . $sortField, $sortDirection);
        }

        $notes = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/Notes', [
            'notes' => $notes,
            'filters' => $request->only(['search_notes', 'sort', 'direction']),
        ]);
    }

    public function destroyUser(\App\Models\User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->withErrors('You cannot completely delete your own account.');
        }

        $user->delete();

        return back()->with('message', 'User and all associated data deleted successfully.');
    }

    public function destroyNote(\App\Models\Note $note)
    {
        $note->delete();

        return back()->with('message', 'Note deleted successfully.');
    }
}
