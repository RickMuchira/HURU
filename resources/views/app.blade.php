<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="#0D9488">
        <meta name="description" content="SafeSpace EA — a free, anonymous directory of LGBTQ+-affirming resources across Kenya and East Africa.">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }

            /* Skip-link for keyboard accessibility */
            .skip-link {
                position: absolute;
                top: -100%;
                left: 1rem;
                background: #0D9488;
                color: #fff;
                padding: 0.5rem 1rem;
                border-radius: 0 0 8px 8px;
                font-size: 0.875rem;
                font-weight: 600;
                z-index: 9999;
                transition: top 0.15s;
            }
            .skip-link:focus {
                top: 0;
            }
        </style>

        <title inertia>{{ config('app.name', 'SafeSpace EA') }}</title>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600|dm-sans:400,500,600|dm-serif-display:400,400i" rel="stylesheet" />

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        <a href="#main-content" class="skip-link">Skip to main content</a>
        @inertia
    </body>
</html>
