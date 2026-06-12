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
        $appTheme = 'purple';
        $globalAnnouncement = null;
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('settings')) {
                $appTheme = \App\Models\Setting::get('app_theme', 'purple');
                $globalAnnouncement = \App\Models\Setting::get('global_announcement');
            }
        } catch (\Exception $e) {
            // fallback
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'is_impersonating' => $request->session()->has('impersonated_by'),
                'has_trashed_notes' => $request->user() ? \App\Models\Note::onlyTrashed()->where('user_id', $request->user()->id)->exists() : false,
            ],
            'flash' => [
                'message' => $request->session()->get('message'),
            ],
            'app_theme' => $appTheme,
            'global_announcement' => $globalAnnouncement,
        ];
    }
}
