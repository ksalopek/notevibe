<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <link rel="icon" type="image/svg+xml" href="/favicon.svg">
        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    @php
        $appTheme = 'purple';
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('settings')) {
                $appTheme = \App\Models\Setting::get('app_theme', 'purple');
            }
        } catch (\Exception $e) {
            // fallback to purple
        }
        $isCustom = str_starts_with($appTheme, '#');
    @endphp
    <script>
        (function() {
            var theme = '{{ $appTheme }}';
            var hexColor = theme.startsWith('#') ? theme : {
                'purple': '#a855f7',
                'orange': '#f97316',
                'emerald': '#10b981',
                'blue': '#3b82f6',
                'rose': '#f43f5e'
            }[theme] || '#a855f7';

            // Update Favicon
            var svg = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="' + hexColor + '" /></svg>';
            var link = document.querySelector("link[rel~='icon']");
            if (link) {
                link.href = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
            }

            // Custom Theme Style Injection
            if (theme.startsWith('#')) {
                var hex = theme.replace('#', '');
                var r = parseInt(hex.substring(0, 2), 16);
                var g = parseInt(hex.substring(2, 4), 16);
                var b = parseInt(hex.substring(4, 6), 16);

                var mix = function(c1, c2, weight) { return Math.round(c1 * (1 - weight) + c2 * weight); };
                var tint = function(weight) { return mix(r, 255, weight) + ' ' + mix(g, 255, weight) + ' ' + mix(b, 255, weight); };
                var shade = function(weight) { return mix(r, 0, weight) + ' ' + mix(g, 0, weight) + ' ' + mix(b, 0, weight); };

                var style = document.createElement('style');
                style.innerHTML = '.theme-custom {' +
                    '--color-primary-50: ' + tint(0.95) + ';' +
                    '--color-primary-100: ' + tint(0.9) + ';' +
                    '--color-primary-200: ' + tint(0.7) + ';' +
                    '--color-primary-300: ' + tint(0.5) + ';' +
                    '--color-primary-400: ' + tint(0.3) + ';' +
                    '--color-primary-500: ' + r + ' ' + g + ' ' + b + ';' +
                    '--color-primary-600: ' + shade(0.2) + ';' +
                    '--color-primary-700: ' + shade(0.4) + ';' +
                    '--color-primary-800: ' + shade(0.6) + ';' +
                    '--color-primary-900: ' + shade(0.8) + ';' +
                    '--color-primary-950: ' + shade(0.9) + ';' +
                '}';
                document.head.appendChild(style);
            }
        })();
    </script>
    <body class="font-sans antialiased {{ $isCustom ? 'theme-custom' : 'theme-' . $appTheme }}">
        @inertia
    </body>
</html>
