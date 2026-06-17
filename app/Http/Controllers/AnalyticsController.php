<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // 1. Calculate Streak
        $dates = $user->notes()->pluck('updated_at')->map(fn($date) => $date->format('Y-m-d'))->unique()->sortDesc()->values();
        $streak = 0;
        $today = now()->format('Y-m-d');
        $yesterday = now()->subDay()->format('Y-m-d');

        if ($dates->contains($today)) {
            $streak = 1;
            $checkDate = now()->subDay();
            while ($dates->contains($checkDate->format('Y-m-d'))) {
                $streak++;
                $checkDate->subDay();
            }
        } elseif ($dates->contains($yesterday)) {
            $streak = 1;
            $checkDate = now()->subDays(2);
            while ($dates->contains($checkDate->format('Y-m-d'))) {
                $streak++;
                $checkDate->subDay();
            }
        }

        // 2. Total Words
        $totalWords = 0;
        $notesContent = $user->notes()->pluck('content');
        foreach ($notesContent as $content) {
            $totalWords += str_word_count(strip_tags($content ?? ''));
        }

        // 3. Productivity By Hour & Persona
        $productivityByHour = array_fill(0, 24, 0);
        $notesTimes = $user->notes()->pluck('created_at');
        foreach ($notesTimes as $time) {
            $hour = (int) $time->format('G');
            $productivityByHour[$hour]++;
        }

        $hourChart = [];
        foreach ($productivityByHour as $hour => $count) {
            $hourChart[] = ['hour' => $hour, 'count' => $count];
        }

        $timeSlots = [
            'Early Bird (5am-11am)' => 0,
            'Midday Writer (12pm-4pm)' => 0,
            'Evening Writer (5pm-9pm)' => 0,
            'Night Owl (10pm-4am)' => 0,
        ];

        foreach ($productivityByHour as $hour => $count) {
            if ($hour >= 5 && $hour <= 11) $timeSlots['Early Bird (5am-11am)'] += $count;
            elseif ($hour >= 12 && $hour <= 16) $timeSlots['Midday Writer (12pm-4pm)'] += $count;
            elseif ($hour >= 17 && $hour <= 21) $timeSlots['Evening Writer (5pm-9pm)'] += $count;
            else $timeSlots['Night Owl (10pm-4am)'] += $count;
        }

        arsort($timeSlots);
        $persona = count($notesTimes) > 0 ? array_key_first($timeSlots) : 'Newcomer';

        // 4. Tag Distribution
        $tagDistribution = DB::table('note_tag')
            ->join('notes', 'note_tag.note_id', '=', 'notes.id')
            ->join('tags', 'note_tag.tag_id', '=', 'tags.id')
            ->where('notes.user_id', $user->id)
            ->whereNull('notes.deleted_at')
            ->select('tags.name', DB::raw('count(*) as count'))
            ->groupBy('tags.id', 'tags.name')
            ->orderByDesc('count')
            ->take(8)
            ->get();

        // 5. Note Velocity (last 30 days)
        $velocityData = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $velocityData[$date] = 0;
        }

        $recentNotes = $user->notes()->where('created_at', '>=', now()->subDays(30))->pluck('created_at');
        foreach ($recentNotes as $time) {
            $date = $time->format('Y-m-d');
            if (isset($velocityData[$date])) {
                $velocityData[$date]++;
            }
        }

        $velocityChart = [];
        foreach ($velocityData as $date => $count) {
            $velocityChart[] = [
                'date' => \Carbon\Carbon::parse($date)->format('M d'),
                'count' => $count,
            ];
        }

        // 6. Busiest Day
        $daysOfWeek = ['Sun' => 0, 'Mon' => 0, 'Tue' => 0, 'Wed' => 0, 'Thu' => 0, 'Fri' => 0, 'Sat' => 0];
        foreach ($notesTimes as $time) {
            $day = $time->format('D');
            $daysOfWeek[$day]++;
        }

        $busiestDayChart = [];
        foreach (['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as $day) {
            $busiestDayChart[] = ['day' => $day, 'count' => $daysOfWeek[$day]];
        }

        return Inertia::render('Analytics/Index', [
            'streak' => $streak,
            'totalWords' => $totalWords,
            'persona' => $persona,
            'hourChart' => $hourChart,
            'tagDistribution' => $tagDistribution,
            'velocityChart' => $velocityChart,
            'busiestDayChart' => $busiestDayChart,
            'totalNotes' => count($notesTimes),
        ]);
    }
}
