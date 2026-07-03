import React from 'react';

export default function MeshGradientBackground() {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-gray-50 dark:bg-gray-950">
            {/* Base gradients for smooth transition under the blobs */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-100/50 via-primary-200/30 to-primary-50/50 dark:from-primary-950/50 dark:via-primary-900/30 dark:to-primary-950/50" />
            
            {/* Animated Blobs */}
            <div className="absolute inset-0 w-full h-full opacity-60 dark:opacity-40">
                <div className="absolute top-[10%] left-[20%] w-96 h-96 bg-primary-300 dark:bg-primary-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] animate-blob" />
                <div className="absolute top-[10%] right-[20%] w-96 h-96 bg-primary-400 dark:bg-primary-700 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] animate-blob animation-delay-2000" />
                <div className="absolute bottom-[10%] left-[35%] w-96 h-96 bg-primary-500 dark:bg-primary-800 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] animate-blob animation-delay-4000" />
            </div>

            {/* Frost overlay to ensure text is always readable over the gradient */}
            <div className="absolute inset-0 bg-white/40 dark:bg-gray-950/60 backdrop-blur-[2px]"></div>
        </div>
    );
}
