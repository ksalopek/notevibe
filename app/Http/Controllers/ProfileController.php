<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        if ($request->user()->email === 'guest@example.com') {
            abort(403, 'Guest user cannot access profile.');
        }

        $user = $request->user();
        $totalNotes = $user->notes()->count();
        $totalWords = $user->notes()->get(['content'])->reduce(function ($carry, $note) {
            return $carry + str_word_count(strip_tags($note->content));
        }, 0);

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'accountStats' => [
                'total_notes' => $totalNotes,
                'total_words' => $totalWords,
                'account_age' => $user->created_at->diffForHumans(null, true),
            ],
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        if ($request->user()->email === 'guest@example.com') {
            abort(403, 'Guest user cannot modify profile.');
        }

        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        if ($request->user()->email === 'guest@example.com') {
            abort(403, 'Guest user cannot delete account.');
        }

        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    /**
     * Update the user's dashboard widgets configuration.
     */
    public function updateWidgets(Request $request)
    {
        $request->validate([
            'widgets' => ['required', 'array'],
        ]);

        $request->user()->update([
            'dashboard_widgets' => $request->widgets,
        ]);

        return response()->json(['status' => 'success']);
    }

    /**
     * Update the user's analytics widgets configuration.
     */
    public function updateAnalyticsWidgets(Request $request)
    {
        $request->validate([
            'widgets' => ['required', 'array'],
        ]);

        $request->user()->update([
            'analytics_widgets' => $request->widgets,
        ]);

        return response()->json(['status' => 'success']);
    }

    /**
     * Update the user's preferences.
     */
    public function updatePreferences(Request $request): RedirectResponse
    {
        if ($request->user()->email === 'guest@example.com') {
            abort(403, 'Guest user cannot modify preferences.');
        }

        $request->validate([
            'preferences' => ['required', 'array'],
        ]);

        $user = $request->user();
        
        $currentPreferences = $user->preferences ?? [];
        $newPreferences = array_merge($currentPreferences, $request->preferences);
        
        $user->update([
            'preferences' => $newPreferences,
        ]);

        return Redirect::route('profile.edit')->with('status', 'preferences-updated');
    }

    /**
     * Export the user's data.
     */
    public function exportData(Request $request)
    {
        $user = $request->user();
        $format = $request->query('format', 'json');
        
        $notes = $user->notes()->with(['tags', 'folder'])->get();

        if ($format === 'json') {
            $filename = 'notevibe_export_' . now()->format('Y_m_d_His') . '.json';
            return response()->streamDownload(function () use ($notes) {
                echo $notes->toJson(JSON_PRETTY_PRINT);
            }, $filename, ['Content-Type' => 'application/json']);
        }

        if ($format === 'markdown') {
            $zip = new \ZipArchive();
            $filename = 'notevibe_export_' . now()->format('Y_m_d_His') . '.zip';
            $zipPath = storage_path('app/temp/' . $filename);
            
            if (!\Illuminate\Support\Facades\File::isDirectory(storage_path('app/temp'))) {
                \Illuminate\Support\Facades\File::makeDirectory(storage_path('app/temp'), 0755, true);
            }

            if ($zip->open($zipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) === TRUE) {
                foreach ($notes as $note) {
                    $noteTitle = preg_replace('/[^A-Za-z0-9_\- ]/', '', $note->title ?: 'Untitled');
                    $noteFilename = $noteTitle . '_' . $note->id . '.md';
                    
                    $content = "# " . ($note->title ?: 'Untitled') . "\n\n";
                    if ($note->folder) {
                        $content .= "Folder: " . $note->folder->name . "\n";
                    }
                    if ($note->tags->count() > 0) {
                        $content .= "Tags: " . $note->tags->pluck('name')->join(', ') . "\n";
                    }
                    $content .= "Date: " . $note->created_at->format('Y-m-d H:i:s') . "\n\n";
                    $content .= "---\n\n";
                    $content .= $note->content;

                    $zip->addFromString($noteFilename, $content);
                }
                $zip->close();
            }

            return response()->download($zipPath)->deleteFileAfterSend(true);
        }

        abort(400, 'Invalid format.');
    }
}
