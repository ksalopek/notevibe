export function generateThemeVariables(hexColor) {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const mix = (c1, c2, weight) => Math.round(c1 * (1 - weight) + c2 * weight);
    const tint = (weight) => `${mix(r, 255, weight)} ${mix(g, 255, weight)} ${mix(b, 255, weight)}`;
    const shade = (weight) => `${mix(r, 0, weight)} ${mix(g, 0, weight)} ${mix(b, 0, weight)}`;

    return {
        '--color-primary-50': tint(0.95),
        '--color-primary-100': tint(0.9),
        '--color-primary-200': tint(0.7),
        '--color-primary-300': tint(0.5),
        '--color-primary-400': tint(0.3),
        '--color-primary-500': `${r} ${g} ${b}`,
        '--color-primary-600': shade(0.2),
        '--color-primary-700': shade(0.4),
        '--color-primary-800': shade(0.6),
        '--color-primary-900': shade(0.8),
        '--color-primary-950': shade(0.9),
    };
}

export function applyTheme(themeValue) {
    // Clear any previous custom inline styles from body
    const vars = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
    for (const v of vars) {
        document.body.style.removeProperty(`--color-primary-${v}`);
    }

    if (themeValue.startsWith('#')) {
        document.body.className = `font-sans antialiased theme-custom`;
        const generatedVars = generateThemeVariables(themeValue);
        for (const [key, value] of Object.entries(generatedVars)) {
            document.body.style.setProperty(key, value);
        }
    } else {
        document.body.className = `font-sans antialiased theme-${themeValue}`;
    }

    // Update Favicon
    const hexColor = themeValue.startsWith('#') ? themeValue : {
        'purple': '#a855f7',
        'orange': '#f97316',
        'emerald': '#10b981',
        'blue': '#3b82f6',
        'rose': '#f43f5e'
    }[themeValue] || '#a855f7';

    const svg = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="${hexColor}" /></svg>`;
    const link = document.querySelector("link[rel~='icon']");
    if (link) {
        link.href = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }
}
