import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Download, FileJson } from 'lucide-react';

export default function ExportDataForm({ className = '' }) {
    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Export My Data
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Download all your notes and data to ensure you own it forever.
                </p>
            </header>

            <div className="mt-6 flex flex-wrap items-center gap-4">
                <a href={route('profile.export', { format: 'json' })}>
                    <SecondaryButton type="button">
                        <FileJson className="w-4 h-4 mr-2" />
                        Export as JSON
                    </SecondaryButton>
                </a>

                <a href={route('profile.export', { format: 'markdown' })}>
                    <PrimaryButton type="button">
                        <Download className="w-4 h-4 mr-2" />
                        Export as Markdown (ZIP)
                    </PrimaryButton>
                </a>
            </div>
        </section>
    );
}
