<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Note;
use App\Models\LoginHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportingController extends Controller
{
    public function index()
    {
        // 1. Power Users (Top users with most notes)
        $powerUsers = User::withCount('notes')
            ->orderByDesc('notes_count')
            ->paginate(5, ['id', 'name', 'email', 'last_login_at'], 'power_page')
            ->withQueryString()
            ->through(function ($user) {
                $user->last_login_human = $user->last_login_at ? $user->last_login_at->diffForHumans() : 'Never';
                return $user;
            });

        // 2. At-Risk Users (> 30 days since last login)
        $atRiskUsers = User::where('last_login_at', '<', now()->subDays(30))
            ->whereNotNull('last_login_at')
            ->orderBy('last_login_at')
            ->get(['id', 'name', 'email', 'last_login_at'])
            ->map(function ($user) {
                $user->last_login_human = $user->last_login_at->diffForHumans();
                return $user;
            });

        // 3. Activity Heatmap
        // SQLite uses strftime instead of DAYOFWEEK/HOUR. 
        // MySQL uses DAYOFWEEK/HOUR. 
        // Assuming MySQL/PostgreSQL compatibility, let's just fetch recent login histories and group them in PHP to be DB agnostic.
        $recentLogins = LoginHistory::where('created_at', '>=', now()->subDays(90))
            ->get(['created_at']);
            
        $heatmapData = [];
        $days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        // Initialize heatmap data
        foreach ($days as $day) {
            foreach (range(0, 23) as $hour) {
                $heatmapData[$day][$hour] = 0;
            }
        }
        
        foreach ($recentLogins as $login) {
            $day = $login->created_at->format('D');
            $hour = (int) $login->created_at->format('G');
            if (isset($heatmapData[$day][$hour])) {
                $heatmapData[$day][$hour]++;
            }
        }
        
        // Flatten heatmap data for Recharts
        $heatmapFlat = [];
        $peakHour = 0;
        $peakDay = 'Mon';
        $maxCount = 0;
        foreach ($days as $day) {
            foreach (range(0, 23) as $hour) {
                $count = $heatmapData[$day][$hour];
                $heatmapFlat[] = [
                    'day' => $day,
                    'hour' => $hour,
                    'count' => $count,
                ];
                if ($count > $maxCount) {
                    $maxCount = $count;
                    $peakHour = $hour;
                    $peakDay = $day;
                }
            }
        }
        
        $peakUsage = $maxCount > 0 ? "{$peakDay} at " . \Carbon\Carbon::createFromTime($peakHour)->format('g:i A') : 'No data';

        // 4. Note Velocity (last 30 days)
        // Group in PHP to be DB agnostic
        $recentNotes = Note::where('created_at', '>=', now()->subDays(30))
            ->get(['created_at']);
            
        $velocityData = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $velocityData[$date] = 0;
        }
        
        foreach ($recentNotes as $note) {
            $date = $note->created_at->format('Y-m-d');
            if (isset($velocityData[$date])) {
                $velocityData[$date]++;
            }
        }
        
        $velocityFlat = [];
        foreach ($velocityData as $date => $count) {
            $velocityFlat[] = [
                'date' => \Carbon\Carbon::parse($date)->format('M d'),
                'count' => $count,
            ];
        }

        // 5. Global Tag Cloud
        $tagCloud = DB::table('note_tag')
            ->join('tags', 'note_tag.tag_id', '=', 'tags.id')
            ->select('tags.name', DB::raw('count(*) as count'))
            ->groupBy('tags.id', 'tags.name')
            ->orderByDesc('count')
            ->take(20)
            ->get();

        // 6. Content Volume
        $totalNotes = Note::count();
        $sampleNotes = Note::orderByDesc('id')->take(1000)->pluck('content');
        $totalLength = 0;
        foreach ($sampleNotes as $content) {
            $totalLength += mb_strlen($content ?? '');
        }
        $avgNoteLength = count($sampleNotes) > 0 ? round($totalLength / count($sampleNotes)) : 0;

        // 7. Security: Access Logs (paginated)
        $accessLogs = LoginHistory::with('user:id,name,email,last_login_ip,city,country')
            ->orderByDesc('created_at')
            ->paginate(5, ['*'], 'logs_page')
            ->withQueryString()
            ->through(function ($log) {
                return [
                    'id' => $log->id,
                    'user_name' => $log->user->name ?? 'Unknown',
                    'email' => $log->user->email ?? 'Unknown',
                    'ip' => $log->user->last_login_ip ?? 'Unknown',
                    'location' => ($log->user->city && $log->user->country) ? $log->user->city . ', ' . $log->user->country : 'Unknown',
                    'time' => $log->created_at->diffForHumans(),
                ];
            });

        // 8. Security: Abandoned Accounts (No notes, > 7 days old)
        $abandonedAccounts = User::doesntHave('notes')
            ->where('created_at', '<', now()->subDays(7))
            ->orderBy('created_at')
            ->paginate(5, ['id', 'name', 'email', 'created_at'], 'abandoned_page')
            ->withQueryString()
            ->through(function ($user) {
                $user->created_human = $user->created_at->diffForHumans();
                return $user;
            });

        // 9. Security: Settings Audit (Recently updated settings)
        $settingsAudit = \App\Models\Setting::orderByDesc('updated_at')
            ->take(10)
            ->get(['key', 'value', 'updated_at'])
            ->map(function ($setting) {
                $setting->updated_human = $setting->updated_at->diffForHumans();
                return $setting;
            });

        // 10. Role Distribution
        $roleDistribution = DB::table('model_has_roles')
            ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
            ->where('model_has_roles.model_type', User::class)
            ->select('roles.name', DB::raw('count(*) as count'))
            ->groupBy('roles.id', 'roles.name')
            ->get()
            ->map(fn($r) => ['name' => ucfirst(str_replace('_', ' ', $r->name)), 'value' => (int) $r->count])
            ->toArray();

        $usersWithRolesCount = DB::table('model_has_roles')->where('model_type', User::class)->distinct('model_id')->count('model_id');
        $regularUsersCount = User::count() - $usersWithRolesCount;

        if ($regularUsersCount > 0) {
            $roleDistribution[] = ['name' => 'User', 'value' => $regularUsersCount];
        }

        // 11. Geo Distribution
        $usersWithLocation = User::whereNotNull('city')->whereNotNull('country')->get(['id', 'name', 'email', 'city', 'country']);
        $groupedByLocation = $usersWithLocation->groupBy(function($user) {
            return $user->city . ', ' . $user->country;
        });
        
        $geoDistribution = $groupedByLocation->map(function($users, $location) {
            return [
                'location' => $location,
                'count' => $users->count(),
                'users' => $users->map(fn($u) => ['name' => $u->name, 'email' => $u->email])->values()->all()
            ];
        })->sortByDesc('count')->take(10)->values()->all();

        // 12. Active Users Data (DAU vs MAU)
        $activeUsersData = [];
        $loginsLast60Days = LoginHistory::where('created_at', '>=', now()->subDays(60))
            ->get(['user_id', 'created_at']);
            
        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $startOfDay = now()->subDays($i)->startOfDay();
            $endOfDay = now()->subDays($i)->endOfDay();
            
            $dau = $loginsLast60Days->whereBetween('created_at', [$startOfDay, $endOfDay])->pluck('user_id')->unique()->count();
            $thirtyDaysAgo = $endOfDay->copy()->subDays(30);
            $mau = $loginsLast60Days->whereBetween('created_at', [$thirtyDaysAgo, $endOfDay])->pluck('user_id')->unique()->count();
            
            $activeUsersData[] = [
                'date' => \Carbon\Carbon::parse($date)->format('M d'),
                'dau' => $dau,
                'mau' => $mau
            ];
        }

        // 10. Dashboard Widget Usage
        $usersWithWidgets = User::whereNotNull('dashboard_widgets')->get(['dashboard_widgets']);
        $totalConfiguredUsers = $usersWithWidgets->count();
        $widgetCounts = [];
        
        // First pass: initialize all known widgets
        $knownWidgets = [
            // Dashboard Widgets
            'metric_total' => 'Metric: Total Notes',
            'metric_tags' => 'Metric: Unique Tags',
            'metric_trash' => 'Metric: In Trash',
            'quick_draft' => 'Quick Draft',
            'activity_chart' => 'Note Activity',
            'recent' => 'Recent Notes',
            'tags' => 'Top Tags',
            // Analytics Widgets
            'streak' => 'Current Streak',
            'words' => 'Total Words',
            'notes' => 'Analytics: Total Notes',
            'persona' => 'Writing Persona',
            'velocity' => 'Note Velocity',
            'topics' => 'Top Topics',
            'productivity' => 'Productivity by Hour',
            'busiest' => 'Busiest Day',
        ];

        foreach ($knownWidgets as $id => $title) {
            $widgetCounts[$id] = [
                'id' => $id,
                'title' => $title,
                'active' => 0,
                'inactive' => 0
            ];
        }

        // We should fetch both columns
        $usersWithWidgets = User::whereNotNull('dashboard_widgets')->orWhereNotNull('analytics_widgets')->get(['dashboard_widgets', 'analytics_widgets']);

        foreach ($usersWithWidgets as $user) {
            $dashboardWidgets = is_array($user->dashboard_widgets) ? $user->dashboard_widgets : json_decode($user->dashboard_widgets, true);
            $analyticsWidgets = is_array($user->analytics_widgets) ? $user->analytics_widgets : json_decode($user->analytics_widgets, true);
            
            $disabledIds = [];
            
            if (is_array($dashboardWidgets)) {
                foreach ($dashboardWidgets as $widget) {
                    if (isset($widget['id']) && isset($widget['isVisible']) && $widget['isVisible'] === false) {
                        $disabledIds[] = $widget['id'];
                    }
                }
            }
            
            if (is_array($analyticsWidgets)) {
                foreach ($analyticsWidgets as $widget) {
                    if (isset($widget['id']) && isset($widget['isVisible']) && $widget['isVisible'] === false) {
                        $disabledIds[] = $widget['id'];
                    }
                }
            }

            foreach ($knownWidgets as $id => $title) {
                if (in_array($id, $disabledIds)) {
                    $widgetCounts[$id]['inactive']++;
                } else {
                    // If not explicitly disabled, it's considered active by default
                    $widgetCounts[$id]['active']++;
                }
            }
        }
        
        $widgetUsage = collect(array_values($widgetCounts))
            ->sortByDesc('active')
            ->values()
            ->all();

        return Inertia::render('Admin/Reporting/Index', [
            'powerUsers' => $powerUsers,
            'atRiskUsers' => $atRiskUsers,
            'activityHeatmap' => $heatmapFlat,
            'peakUsage' => $peakUsage,
            'noteVelocity' => $velocityFlat,
            'tagCloud' => $tagCloud,
            'accessLogs' => $accessLogs,
            'abandonedAccounts' => $abandonedAccounts,
            'settingsAudit' => $settingsAudit,
            'widgetUsage' => $widgetUsage,
            'roleDistribution' => $roleDistribution,
            'geoDistribution' => $geoDistribution,
            'activeUsersData' => $activeUsersData,
            'stats' => [
                'totalNotes' => $totalNotes,
                'avgNoteLength' => $avgNoteLength,
            ]
        ]);
    }
}
