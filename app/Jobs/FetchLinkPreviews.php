<?php

namespace App\Jobs;

use App\Models\Note;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use DOMDocument;

class FetchLinkPreviews implements ShouldQueue
{
    use Queueable;

    public function __construct(public Note $note, public string $url)
    {
    }

    public function handle(): void
    {
        try {
            $response = Http::timeout(5)->get($this->url);
            
            if ($response->successful()) {
                $html = $response->body();
                $doc = new DOMDocument();
                @$doc->loadHTML($html);
                
                $title = '';
                $description = '';
                $image = '';
                
                $metaTags = $doc->getElementsByTagName('meta');
                foreach ($metaTags as $meta) {
                    $property = $meta->getAttribute('property');
                    $name = $meta->getAttribute('name');
                    $content = $meta->getAttribute('content');
                    
                    if ($property === 'og:title' || $name === 'title') {
                        $title = $title ?: $content;
                    }
                    if ($property === 'og:description' || $name === 'description') {
                        $description = $description ?: $content;
                    }
                    if ($property === 'og:image') {
                        $image = $image ?: $content;
                    }
                }
                
                if (!$title) {
                    $titleTags = $doc->getElementsByTagName('title');
                    if ($titleTags->length > 0) {
                        $title = $titleTags->item(0)->nodeValue;
                    }
                }
                
                if ($title) {
                    $previews = $this->note->link_previews ?? [];
                    // Only add if not already present
                    $exists = false;
                    foreach ($previews as $p) {
                        if ($p['url'] === $this->url) {
                            $exists = true;
                            break;
                        }
                    }
                    if (!$exists) {
                        $previews[] = [
                            'url' => $this->url,
                            'title' => $title,
                            'description' => $description,
                            'image' => $image,
                        ];
                        $this->note->updateQuietly(['link_previews' => $previews]);
                    }
                }
            }
        } catch (\Exception $e) {
            Log::error('Failed to fetch link preview: ' . $e->getMessage());
        }
    }
}
