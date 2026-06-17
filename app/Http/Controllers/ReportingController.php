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
        // 1. Power Users (Top 10 users with most notes)
        $powerUsers = User::withCount('notes')
            ->orderByDesc('notes_count')
            ->take(10)
            ->get(['id', 'name', 'email', 'last_login_at', 'notes_count'])
            ->map(function ($user) {
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
        foreach ($days as $day) {
            foreach (range(0, 23) as $hour) {
                $heatmapFlat[] = [
                    'day' => $day,
                    'hour' => $hour,
                    'count' => $heatmapData[$day][$hour],
                ];
            }
        }

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

        // 7. Security: Access Logs (last 20 logins)
        $accessLogs = LoginHistory::with('user:id,name,email,last_login_ip,city,country')
            ->orderByDesc('created_at')
            ->take(20)
            ->get()
            ->map(function ($log) {
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
            ->get(['id', 'name', 'email', 'created_at'])
            ->map(function ($user) {
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

        return Inertia::render('Admin/Reporting/Index', [
            'powerUsers' => $powerUsers,
            'atRiskUsers' => $atRiskUsers,
            'activityHeatmap' => $heatmapFlat,
            'noteVelocity' => $velocityFlat,
            'tagCloud' => $tagCloud,
            'accessLogs' => $accessLogs,
            'abandonedAccounts' => $abandonedAccounts,
            'settingsAudit' => $settingsAudit,
            'stats' => [
                'totalNotes' => $totalNotes,
                'avgNoteLength' => $avgNoteLength,
            ]
        ]);
    }
}
