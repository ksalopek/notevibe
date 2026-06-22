<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckMaintenanceMode
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $isMaintenanceMode = false;
        try {
            $isMaintenanceMode = filter_var(\App\Models\Setting::get('maintenance_mode', false), FILTER_VALIDATE_BOOLEAN);
        } catch (\Exception $e) {
            // Ignore if DB/Table is not ready
        }

        $allowedRoutes = ['maintenance', 'login', 'logout', 'password.request', 'password.email', 'password.reset', 'password.store'];

        if ($isMaintenanceMode && !in_array($request->route()?->getName(), $allowedRoutes) && !$request->is('login')) {
            // Check if user is logged in and is admin
            if (auth()->check() && auth()->user()->isAdmin()) {
                return $next($request);
            }

            // Redirect to maintenance page
            return redirect()->route('maintenance');
        }

        return $next($request);
    }
}
