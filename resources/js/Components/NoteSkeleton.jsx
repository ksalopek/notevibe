export default function NoteSkeleton() {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 break-inside-avoid mb-6 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex justify-between items-start mb-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mt-1"></div>
            </div>

            {/* Content Skeleton */}
            <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
            </div>

            {/* Tags Skeleton */}
            <div className="mt-4 flex gap-2">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-12"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
            </div>
        </div>
    );
}
