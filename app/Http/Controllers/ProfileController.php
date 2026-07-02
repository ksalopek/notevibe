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

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
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
}
