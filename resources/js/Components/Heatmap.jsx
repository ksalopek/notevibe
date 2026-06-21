import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// leaflet.heat needs L to be globally available in some environments
window.L = L;
import 'leaflet.heat';

export default function Heatmap({ data }) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);

    useEffect(() => {
        if (!mapInstance.current && mapRef.current) {
            // Initialize map centered roughly around the equator/prime meridian
            mapInstance.current = L.map(mapRef.current).setView([20, 0], 2);

            // Add dark theme tile layer to match our modern app theme
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(mapInstance.current);

            // Add heat layer
            if (data && data.length > 0) {
                L.heatLayer(data, {
                    radius: 20,
                    blur: 15,
                    maxZoom: 10,
                    gradient: {0.2: 'cyan', 0.4: 'lime', 0.6: 'yellow', 0.8: 'orange', 1.0: 'red'}
                }).addTo(mapInstance.current);
            }
        }

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, [data]);

    return (
        <div 
            ref={mapRef} 
            className="w-full h-full min-h-[200px] rounded-2xl shadow-inner border border-gray-200 dark:border-gray-700 z-0 relative"
            style={{ zIndex: 1 }} // Ensure dropdowns can appear over the map
        />
    );
}
