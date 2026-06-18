<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\ImpersonationController;
use App\Http\Controllers\AiController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    // Check config first (for production), fallback to git command (for local dev)
    $version = config('version.app_version');
    if (!$version) {
        $version = trim(exec('git describe --tags --abbrev=0 2>/dev/null')) ?: 'v1.0.0';
    }

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'appVersion' => $version,
    ]);
});

Route::get('/maintenance', function () {
    return Inertia::render('Maintenance');
})->name('maintenance');

Route::get('/dashboard', function (\Illuminate\Http\Request $request) {
    $user = auth()->user();

    $recentNotes = $user->notes()->with('tags')->latest()->take(5)->get();
    
    $totalNotes = $user->notes()->count();
    $trashedNotesCount = $user->notes()->onlyTrashed()->count();
    
    $tagCounts = \Illuminate\Support\Facades\DB::table('note_tag')
        ->join('notes', 'note_tag.note_id', '=', 'notes.id')
        ->join('tags', 'note_tag.tag_id', '=', 'tags.id')
        ->where('notes.user_id', $user->id)
        ->whereNull('notes.deleted_at')
        ->select('tags.name', \Illuminate\Support\Facades\DB::raw('count(*) as count'))
        ->groupBy('tags.id', 'tags.name')
        ->orderByDesc('count')
        ->get();

    $totalTags = \Illuminate\Support\Facades\DB::table('note_tag')
        ->join('notes', 'note_tag.note_id', '=', 'notes.id')
        ->where('notes.user_id', $user->id)
        ->distinct('note_tag.tag_id')
        ->count('note_tag.tag_id');

    $noteDays = (int) $request->input('note_days', 7);
    if (!in_array($noteDays, [7, 14, 21, 30])) {
        $noteDays = 7;
    }

    $chartData = collect(range($noteDays - 1, 0))->map(function ($daysAgo) use ($user) {
        $date = now()->subDays($daysAgo);
        return [
            'name' => $date->format('M d'),
            'notes' => $user->notes()->whereDate('created_at', $date->toDateString())->count(),
        ];
    })->values()->toArray();

    return Inertia::render('Dashboard', [
        'recentNotes' => $recentNotes,
        'stats' => [
            'totalNotes' => $totalNotes,
            'trashedNotes' => $trashedNotesCount,
            'totalTags' => $totalTags,
        ],
        'allTags' => $tagCounts,
        'chartData' => $chartData,
        'filters' => [
            'note_days' => $noteDays,
        ],
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Notes Routes
    Route::get('/my-journal', [NoteController::class, 'index'])->name('notes.index');
    Route::post('/my-journal', [NoteController::class, 'store'])->name('notes.store');
    Route::put('/my-journal/{note}', [NoteController::class, 'update'])->name('notes.update');
    Route::delete('/my-journal/{note}', [NoteController::class, 'destroy'])->name('notes.destroy');

    // Trash Routes
    Route::get('/my-journal/trash', [NoteController::class, 'trash'])->name('notes.trash');
    Route::put('/my-journal/{id}/restore', [NoteController::class, 'restore'])->name('notes.restore');
    Route::delete('/my-journal/{id}/force-delete', [NoteController::class, 'forceDelete'])->name('notes.forceDelete');

    // Archive Routes
    Route::get('/my-journal/archived', [NoteController::class, 'archived'])->name('notes.archived');

    // AI Routes
    Route::post('/ai/enhance', [AiController::class, 'enhance'])->name('ai.enhance');

    // Analytics Route
    Route::get('/my-analytics', [\App\Http\Controllers\AnalyticsController::class, 'index'])->name('analytics.index');
});

// Admin Routes
Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/admin', [AdminController::class, 'index'])->name('admin.index');
    Route::get('/admin/users', [AdminController::class, 'users'])->name('admin.users');
    Route::patch('/admin/users/{user}/toggle-status', [AdminController::class, 'toggleUserStatus'])->name('admin.users.toggle');
    Route::patch('/admin/users/{user}/role', [AdminController::class, 'updateRole'])->name('admin.users.role');
    Route::patch('/admin/users/disable-all', [AdminController::class, 'disableAllUsers'])->name('admin.users.disable-all');
    Route::patch('/admin/users/enable-all', [AdminController::class, 'enableAllUsers'])->name('admin.users.enable-all');
    Route::post('/admin/users/{user}/impersonate', [ImpersonationController::class, 'store'])->name('admin.users.impersonate');
    Route::delete('/admin/users/{user}', [AdminController::class, 'destroyUser'])->name('admin.users.destroy');
    Route::get('/admin/notes', [AdminController::class, 'notes'])->name('admin.notes');
    Route::delete('/admin/notes/{note}', [AdminController::class, 'destroyNote'])->name('admin.notes.destroy');
    Route::get('/admin/settings', [AdminController::class, 'settings'])->name('admin.settings');
    Route::post('/admin/settings', [AdminController::class, 'updateSettings'])->name('admin.settings.update');
    Route::post('/admin/announcement', [AdminController::class, 'updateAnnouncement'])->name('admin.announcement.update');
    Route::get('/admin/reporting', [\App\Http\Controllers\ReportingController::class, 'index'])->name('admin.reporting');
});

Route::post('/impersonate/leave', [ImpersonationController::class, 'destroy'])
    ->middleware(['auth'])
    ->name('impersonate.leave');

require __DIR__.'/auth.php';

// Trigger new hotfix build
