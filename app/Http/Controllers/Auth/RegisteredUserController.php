<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Mail;
use App\Mail\WelcomeEmail;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $ip = $request->ip();
        $locationService = new \App\Services\IpLocationService();
        $locationData = $locationService->getLocation($ip);

        $userData = [
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'last_login_at' => now(),
            'last_login_ip' => $ip,
        ];

        if ($locationData) {
            $userData = array_merge($userData, $locationData);
        }

        $user = User::create($userData);

        event(new Registered($user));
        
        // Mail::to($user)->send(new WelcomeEmail($user));

        $webhookUrl = \App\Models\Setting::get('system_webhook_url');
        if ($webhookUrl) {
            try {
                \Illuminate\Support\Facades\Http::post($webhookUrl, [
                    'text' => "🎉 New user registered: {$user->name} ({$user->email})"
                ]);
            } catch (\Exception $e) {
                // Ignore webhook failures
            }
        }

        Auth::login($user);

        \App\Models\LoginHistory::create(['user_id' => $user->id, 'ip_address' => $ip]);

        return redirect(route('dashboard', absolute: false));
    }
}
