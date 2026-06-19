<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $globalSettings = [];
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('settings')) {
                $globalSettings = \App\Models\Setting::pluck('value', 'key')->toArray();
            }
        } catch (\Exception $e) {
            // fallback
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'roles' => $request->user() ? $request->user()->roles->pluck('name') : [],
                'permissions' => $request->user() ? $request->user()->getAllPermissions()->pluck('name') : [],
                'is_impersonating' => $request->session()->has('impersonated_by'),
                'has_trashed_notes' => $request->user() ? \App\Models\Note::onlyTrashed()->where('user_id', $request->user()->id)->exists() : false,
                'has_archived_notes' => $request->user() ? \App\Models\Note::where('is_archived', true)->where('user_id', $request->user()->id)->exists() : false,
            ],
            'flash' => [
                'message' => $request->session()->get('message'),
            ],
            'app_theme' => $globalSettings['app_theme'] ?? 'purple',
            'global_announcement' => $globalSettings['global_announcement'] ?? null,
            'global_settings' => [
                // Branding properties removed
            ],
        ];
    }
}
