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

        $activityDays = (int) $request->input('activity_days', 7);
        if (!in_array($activityDays, [7, 14, 21, 30])) {
            $activityDays = 7;
        }

        $radarDays = (int) $request->input('radar_days', 30);
        if (!in_array($radarDays, [7, 14, 21, 30])) {
            $radarDays = 30;
        }

        return Inertia::render('Admin/Dashboard', [
            'metrics' => fn () => [
                'totalUsers' => User::count(),
                'activeUsers' => User::where('is_active', true)->count(),
                'inactiveUsers' => User::count() - User::where('is_active', true)->count(),
                'totalNotes' => \App\Models\Note::count(),
                'totalLogins' => \App\Models\LoginHistory::count(),
            ],
            'chartData' => fn () => collect(range($activityDays - 1, 0))->map(function ($daysAgo) {
                $date = now()->subDays($daysAgo);
                return [
                    'name' => $date->format('M d'),
                    'users' => User::whereDate('created_at', $date->toDateString())->count(),
                    'notes' => \App\Models\Note::whereDate('created_at', $date->toDateString())->count(),
                    'logins' => \App\Models\LoginHistory::whereDate('created_at', $date->toDateString())->distinct('user_id')->count('user_id'),
                ];
            })->values()->toArray(),
            'radarData' => fn () => [
                ['subject' => 'New Users', 'value' => User::where('created_at', '>=', now()->subDays($radarDays))->count(), 'fullMark' => 100],
                ['subject' => 'Notes Created', 'value' => \App\Models\Note::where('created_at', '>=', now()->subDays($radarDays))->count(), 'fullMark' => 100],
                ['subject' => 'Recent Logins', 'value' => User::where('last_login_at', '>=', now()->subDays($radarDays))->count(), 'fullMark' => 100],
                ['subject' => 'Active Users', 'value' => User::where('is_active', true)->count(), 'fullMark' => 100],
                ['subject' => 'Trashed Notes', 'value' => \App\Models\Note::onlyTrashed()->count(), 'fullMark' => 100],
            ],
            'latestGlobalNotes' => fn () => \App\Models\Note::with('user:id,name,email')->latest()->take(5)->get(),
            'recentUsers' => fn () => User::with('roles')->latest()->take(5)->get(),
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
            'filters' => $request->only(['search_logins', 'sort_logins', 'direction_logins', 'activity_days', 'radar_days']),
        ]);
    }

    public function users(Request $request)
    {
        $sortField = $request->input('sort', 'id');
        $sortDirection = $request->input('direction', 'asc');

        $users = \App\Models\User::with('roles')
            ->when($request->search_users, function($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($request->role && $request->role !== 'all', function($query) use ($request) {
                if ($request->role === 'admin') {
                    $query->whereHas('roles');
                } else {
                    $query->whereDoesntHave('roles');
                }
            })
            ->when($request->status && $request->status !== 'all', function($query) use ($request) {
                $query->where('is_active', $request->status === 'active');
            })
            ->orderBy($sortField, $sortDirection)
            ->paginate(10)
            ->withQueryString();

        $heatmapData = \App\Models\User::whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->get(['latitude', 'longitude'])
            ->map(fn ($user) => [(float) $user->latitude, (float) $user->longitude, 1])
            ->toArray();

        $metrics = [
            'totalUsers' => \App\Models\User::count(),
            'newUsersThisWeek' => \App\Models\User::where('created_at', '>=', now()->subDays(7))->count(),
            'activeUsers' => \App\Models\User::where('is_active', true)->count(),
            'disabledUsers' => \App\Models\User::where('is_active', false)->count(),
        ];

        return Inertia::render('Admin/Users', [
            'users' => $users,
            'heatmapData' => $heatmapData,
            'metrics' => $metrics,
            'filters' => $request->only(['search_users', 'sort', 'direction', 'role', 'status']),
            'availableRoles' => \Spatie\Permission\Models\Role::orderBy('id')->get()->map(function($r) {
                return ['id' => $r->id, 'name' => $r->name, 'label' => ucfirst(str_replace('_', ' ', $r->name))];
            }),
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

    public function syncRoles(Request $request, \App\Models\User $user)
    {
        $request->validate([
            'roles' => 'array',
            'roles.*' => 'string|exists:roles,name'
        ]);

        if ($user->id === auth()->id() && !in_array('super_admin', $request->roles ?? []) && $user->hasRole('super_admin')) {
            return back()->withErrors('You cannot remove your own super_admin role.');
        }

        $user->syncRoles($request->roles ?? []);

        return back()->with('message', 'User roles updated successfully.');
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

        // Calculate Analytics Data
        $topAuthors = \App\Models\User::withCount('notes')
            ->has('notes', '>', 0)
            ->orderBy('notes_count', 'desc')
            ->take(3)
            ->get(['id', 'name', 'notes_count']);

        $shortCount = \App\Models\Note::whereRaw('LENGTH(content) < 200')->count();
        $mediumCount = \App\Models\Note::whereRaw('LENGTH(content) >= 200 AND LENGTH(content) < 1000')->count();
        $longCount = \App\Models\Note::whereRaw('LENGTH(content) >= 1000')->count();

        return Inertia::render('Admin/Notes', [
            'notes' => $notes,
            'analyticsData' => [
                'topAuthors' => $topAuthors,
                'lengths' => [
                    ['name' => 'Short', 'value' => $shortCount],
                    ['name' => 'Medium', 'value' => $mediumCount],
                    ['name' => 'Long', 'value' => $longCount],
                ]
            ],
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

    public function settings()
    {
        $settings = \App\Models\Setting::pluck('value', 'key')->toArray();

        return Inertia::render('Admin/Settings', [
            'settings' => $settings,
            'appTheme' => $settings['app_theme'] ?? 'purple',
        ]);
    }

    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            // Branding
            'app_theme' => [
                'required',
                'string',
                function ($attribute, $value, $fail) {
                    if (!in_array($value, ['purple', 'orange', 'emerald', 'blue', 'rose']) && !preg_match('/^#[a-fA-F0-9]{6}$/', $value)) {
                        $fail('The selected theme is invalid.');
                    }
                },
            ],
            // Security
            'require_2fa' => 'nullable|boolean',
            'session_timeout' => 'nullable|integer|min:1',
            'password_rules' => 'nullable|string|in:standard,strict',

            // System
            'maintenance_mode' => 'nullable|boolean',
            'system_webhook_url' => 'nullable|url|max:255',
        ]);

        // Save all other settings
        foreach ($validated as $key => $value) {
            if ($value !== null) {
                \App\Models\Setting::set($key, $value);
            }
        }
        
        // Handle explicit booleans (in case they come through as false)
        if ($request->has('require_2fa')) {
             \App\Models\Setting::set('require_2fa', $request->boolean('require_2fa'));
        }
        if ($request->has('maintenance_mode')) {
             \App\Models\Setting::set('maintenance_mode', $request->boolean('maintenance_mode'));
        }

        return back()->with('message', 'Settings updated successfully.');
    }

    public function updateAnnouncement(Request $request)
    {
        $request->validate([
            'message' => 'nullable|string|max:1000',
        ]);

        if (empty($request->message)) {
            // Delete it if empty
            $setting = \App\Models\Setting::where('key', 'global_announcement')->first();
            if ($setting) {
                $setting->delete();
            }
            return back()->with('message', 'Global announcement cleared.');
        }

        \App\Models\Setting::set('global_announcement', $request->message);

        return back()->with('message', 'Global announcement published successfully.');
    }

    public function bulkAction(Request $request)
    {
        $request->validate([
            'userIds' => 'required|array',
            'userIds.*' => 'integer|exists:users,id',
            'action' => 'required|string|in:delete,disable,enable,make_admin,make_user'
        ]);

        $userIds = $request->userIds;
        
        // Prevent action on self
        if (in_array(auth()->id(), $userIds)) {
            $userIds = array_diff($userIds, [auth()->id()]);
            if (empty($userIds)) {
                return back()->withErrors('You cannot perform this action on your own account.');
            }
        }

        switch ($request->action) {
            case 'delete':
                \App\Models\User::whereIn('id', $userIds)->delete();
                $message = 'Selected users deleted successfully.';
                break;
            case 'disable':
                \App\Models\User::whereIn('id', $userIds)->update(['is_active' => false]);
                $message = 'Selected users disabled successfully.';
                break;
            case 'enable':
                \App\Models\User::whereIn('id', $userIds)->update(['is_active' => true]);
                $message = 'Selected users enabled successfully.';
                break;
            case 'make_admin':
                $users = \App\Models\User::whereIn('id', $userIds)->get();
                foreach($users as $u) { $u->assignRole('user_admin'); }
                $message = 'Selected users promoted to admin.';
                break;
            case 'make_user':
                $users = \App\Models\User::whereIn('id', $userIds)->get();
                foreach($users as $u) { $u->syncRoles([]); }
                $message = 'Selected users demoted to user.';
                break;
        }

        return back()->with('message', $message ?? 'Bulk action completed.');
    }

    public function exportUsers(Request $request)
    {
        $sortField = $request->input('sort', 'id');
        $sortDirection = $request->input('direction', 'asc');

        $users = \App\Models\User::with('roles')
            ->when($request->search_users, function($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($request->role && $request->role !== 'all', function($query) use ($request) {
                if ($request->role === 'admin') {
                    $query->whereHas('roles');
                } else {
                    $query->whereDoesntHave('roles');
                }
            })
            ->when($request->status && $request->status !== 'all', function($query) use ($request) {
                $query->where('is_active', $request->status === 'active');
            })
            ->orderBy($sortField, $sortDirection)
            ->get();

        $filename = "users_export_" . now()->format('Y_m_d_His') . ".csv";
        $handle = fopen('php://temp', 'w+');
        
        fputcsv($handle, ['ID', 'Name', 'Email', 'Role', 'Status', 'Joined At']);
        foreach ($users as $u) {
            fputcsv($handle, [
                $u->id,
                $u->name,
                $u->email,
                $u->roles->count() > 0 ? $u->roles->pluck('name')->join(', ') : 'user',
                $u->is_active ? 'Active' : 'Disabled',
                $u->created_at->toDateTimeString()
            ]);
        }
        
        rewind($handle);
        $content = stream_get_contents($handle);
        fclose($handle);
        
        return response($content)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");
    }

    public function userActivity(\App\Models\User $user)
    {
        $logins = \App\Models\LoginHistory::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->take(50)
            ->get()
            ->map(function($login) {
                return [
                    'type' => 'login',
                    'action' => 'Logged in',
                    'details' => "IP: {$login->ip_address}",
                    'date' => $login->created_at
                ];
            });

        $notes = \App\Models\Note::where('user_id', $user->id)
            ->withTrashed()
            ->orderBy('created_at', 'desc')
            ->take(50)
            ->get()
            ->map(function($note) {
                $status = $note->trashed() ? 'Deleted note' : 'Created note';
                return [
                    'type' => 'note',
                    'action' => $status,
                    'details' => "Title: {$note->title}",
                    'date' => $note->created_at
                ];
            });

        $activity = collect($logins)->merge($notes)->sortByDesc('date')->values()->take(50);
        
        return response()->json($activity);
    }
}
