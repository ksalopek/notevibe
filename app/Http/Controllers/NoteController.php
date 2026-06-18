<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreNoteRequest;
use App\Http\Requests\UpdateNoteRequest;
use App\Models\Note;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class NoteController extends Controller
{
    public function index(Request $request)
    {
        $sortBy = $request->input('sort', 'relevance');
        $search = $request->input('search');

        $query = Auth::user()->notes()->where('is_archived', false)->with('tags');

        if ($sortBy === 'relevance' && $search) {
            if (\Illuminate\Support\Facades\DB::connection()->getDriverName() === 'sqlite') {
                $ftsSearch = '"' . str_replace('"', '""', $search) . '"';
                
                $ftsSubquery = \Illuminate\Support\Facades\DB::table('notes_fts')
                    ->selectRaw('rowid, bm25(notes_fts) as score')
                    ->whereRaw("notes_fts MATCH ?", [$ftsSearch]);

                $query->leftJoinSub($ftsSubquery, 'fts', 'notes.id', '=', 'fts.rowid')
                      ->where(function ($q) use ($search) {
                          $q->whereNotNull('fts.rowid')
                            ->orWhereHas('tags', function ($tagQuery) use ($search) {
                                $tagQuery->where('name', 'like', "%{$search}%");
                            });
                      })
                      ->orderBy('is_pinned', 'desc')
                      ->orderByRaw('COALESCE(fts.score, 0) ASC')
                      ->select('notes.*');
            } else {
                $query->where(function ($q) use ($search) {
                    $q->whereRaw("MATCH(title, content, notes) AGAINST(? IN BOOLEAN MODE)", [$search])
                      ->orWhereHas('tags', function ($tagQuery) use ($search) {
                          $tagQuery->where('name', 'like', "%{$search}%");
                      });
                })
                ->orderBy('is_pinned', 'desc')
                ->orderByRaw("MATCH(title, content, notes) AGAINST(? IN BOOLEAN MODE) DESC", [$search]);
            }
        } else {
            $query->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('content', 'like', "%{$search}%")
                      ->orWhereHas('tags', function ($tagQuery) use ($search) {
                          $tagQuery->where('name', 'like', "%{$search}%");
                      });
                });
            });

            $query->orderBy('is_pinned', 'desc');

            // Apply sorting
            switch ($sortBy) {
                case 'oldest':
                    $query->oldest();
                    break;
                case 'a_z':
                    $query->orderBy('title', 'asc');
                    break;
                case 'z_a':
                    $query->orderBy('title', 'desc');
                    break;
                case 'latest':
                default:
                    $query->latest();
                    break;
            }
        }

        $notes = $query->paginate(10)->withQueryString();

        return Inertia::render('Notes/Index', [
            'notes' => $notes,
            'filters' => $request->only(['search', 'sort']),
            'isArchiveView' => false,
        ]);
    }

    public function archived(Request $request)
    {
        $sortBy = $request->input('sort', 'relevance');
        $search = $request->input('search');

        $query = Auth::user()->notes()->where('is_archived', true)->with('tags');

        if ($sortBy === 'relevance' && $search) {
            if (\Illuminate\Support\Facades\DB::connection()->getDriverName() === 'sqlite') {
                $ftsSearch = '"' . str_replace('"', '""', $search) . '"';
                
                $ftsSubquery = \Illuminate\Support\Facades\DB::table('notes_fts')
                    ->selectRaw('rowid, bm25(notes_fts) as score')
                    ->whereRaw("notes_fts MATCH ?", [$ftsSearch]);

                $query->leftJoinSub($ftsSubquery, 'fts', 'notes.id', '=', 'fts.rowid')
                      ->where(function ($q) use ($search) {
                          $q->whereNotNull('fts.rowid')
                            ->orWhereHas('tags', function ($tagQuery) use ($search) {
                                $tagQuery->where('name', 'like', "%{$search}%");
                            });
                      })
                      ->orderBy('is_pinned', 'desc')
                      ->orderByRaw('COALESCE(fts.score, 0) ASC')
                      ->select('notes.*');
            } else {
                $query->where(function ($q) use ($search) {
                    $q->whereRaw("MATCH(title, content, notes) AGAINST(? IN BOOLEAN MODE)", [$search])
                      ->orWhereHas('tags', function ($tagQuery) use ($search) {
                          $tagQuery->where('name', 'like', "%{$search}%");
                      });
                })
                ->orderBy('is_pinned', 'desc')
                ->orderByRaw("MATCH(title, content, notes) AGAINST(? IN BOOLEAN MODE) DESC", [$search]);
            }
        } else {
            $query->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('content', 'like', "%{$search}%")
                      ->orWhereHas('tags', function ($tagQuery) use ($search) {
                          $tagQuery->where('name', 'like', "%{$search}%");
                      });
                });
            });

            $query->orderBy('is_pinned', 'desc');

            switch ($sortBy) {
                case 'oldest':
                    $query->oldest();
                    break;
                case 'a_z':
                    $query->orderBy('title', 'asc');
                    break;
                case 'z_a':
                    $query->orderBy('title', 'desc');
                    break;
                case 'latest':
                default:
                    $query->latest();
                    break;
            }
        }

        $notes = $query->paginate(10)->withQueryString();

        return Inertia::render('Notes/Index', [
            'notes' => $notes,
            'filters' => $request->only(['search', 'sort']),
            'isArchiveView' => true,
        ]);
    }

    public function store(StoreNoteRequest $request)
    {
        $validated = $request->validated();
        $note = Auth::user()->notes()->create($validated);
        $this->syncTags($request, $note);
        $this->dispatchLinkPreviews($note);

        return redirect()->back()->with('message', 'Note created successfully!');
    }

    public function update(UpdateNoteRequest $request, Note $note)
    {
        $validated = $request->validated();
        $note->update($validated);
        $this->syncTags($request, $note);
        $this->dispatchLinkPreviews($note);

        return redirect()->back()->with('message', 'Note updated successfully!');
    }

    public function destroy(Note $note)
    {
        Gate::authorize('delete', $note);
        $note->delete();
        return redirect()->back()->with('message', 'Note moved to trash!');
    }

    public function trash(Request $request)
    {
        $trashedNotes = Auth::user()->notes()
            ->onlyTrashed()
            ->with('tags')
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('content', 'like', "%{$search}%")
                      ->orWhereHas('tags', function ($tagQuery) use ($search) {
                          $tagQuery->where('name', 'like', "%{$search}%");
                      });
                });
            })
            ->latest('deleted_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Notes/Trash', [
            'notes' => $trashedNotes,
            'filters' => $request->only(['search']),
        ]);
    }

    public function restore($id)
    {
        $note = Note::withTrashed()->findOrFail($id);
        Gate::authorize('restore', $note);
        $note->restore();

        return redirect()->route('notes.trash')->with('message', 'Note restored successfully!');
    }

    public function forceDelete($id)
    {
        $note = Note::withTrashed()->findOrFail($id);
        Gate::authorize('forceDelete', $note);
        $note->forceDelete();

        return redirect()->route('notes.trash')->with('message', 'Note permanently deleted!');
    }

    private function dispatchLinkPreviews(Note $note): void
    {
        $html = ($note->content ?? '') . ' ' . ($note->notes ?? '');
        preg_match_all('/href=["\'](https?:\/\/[^"\']+)["\']/', $html, $matches);
        
        if (!empty($matches[1])) {
            // Get the first link only, as per user request
            $firstUrl = $matches[1][0];
            
            // Check if we already have it
            $previews = $note->link_previews ?? [];
            $exists = false;
            foreach ($previews as $p) {
                if ($p['url'] === $firstUrl) {
                    $exists = true;
                    break;
                }
            }
            
            if (!$exists) {
                // Fetch synchronously so it appears immediately on save
                try {
                    $response = \Illuminate\Support\Facades\Http::timeout(3)->get($firstUrl);
                    if ($response->successful()) {
                        $doc = new \DOMDocument();
                        @$doc->loadHTML($response->body());
                        
                        $title = '';
                        $description = '';
                        $image = '';
                        
                        $metaTags = $doc->getElementsByTagName('meta');
                        foreach ($metaTags as $meta) {
                            $property = $meta->getAttribute('property');
                            $name = $meta->getAttribute('name');
                            $content = $meta->getAttribute('content');
                            
                            if ($property === 'og:title' || $name === 'title') $title = $title ?: $content;
                            if ($property === 'og:description' || $name === 'description') $description = $description ?: $content;
                            if ($property === 'og:image') $image = $image ?: $content;
                        }
                        
                        if (!$title) {
                            $titleTags = $doc->getElementsByTagName('title');
                            if ($titleTags->length > 0) $title = $titleTags->item(0)->nodeValue;
                        }
                        
                        if ($title) {
                            $previews[] = [
                                'url' => $firstUrl,
                                'title' => $title,
                                'description' => $description,
                                'image' => $image,
                            ];
                            $note->updateQuietly(['link_previews' => $previews]);
                        }
                    }
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Synchronous fetch link preview failed: ' . $e->getMessage());
                }
            }
        }
    }

    private function syncTags(Request $request, Note $note): void
    {
        $tagIds = [];
        if ($request->has('tags')) {
            $tagNames = explode(',', $request->input('tags'));
            foreach ($tagNames as $tagName) {
                $tagName = trim($tagName);
                if ($tagName) {
                    $tag = Tag::firstOrCreate(['name' => $tagName]);
                    $tagIds[] = $tag->id;
                }
            }
        }
        $note->tags()->sync($tagIds);
    }

    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|string|in:delete,restore,force_delete,archive,unarchive,pin,unpin',
            'note_ids' => 'required|array',
            'note_ids.*' => 'integer|exists:notes,id',
        ]);

        $action = $request->input('action');
        $noteIds = $request->input('note_ids');

        $query = Auth::user()->notes();
        if (in_array($action, ['restore', 'force_delete'])) {
            $query->withTrashed();
        }
        $notes = $query->whereIn('id', $noteIds)->get();

        foreach ($notes as $note) {
            switch ($action) {
                case 'delete':
                    Gate::authorize('delete', $note);
                    $note->delete();
                    break;
                case 'restore':
                    Gate::authorize('restore', $note);
                    $note->restore();
                    break;
                case 'force_delete':
                    Gate::authorize('forceDelete', $note);
                    $note->forceDelete();
                    break;
                case 'archive':
                    $note->update(['is_archived' => true]);
                    break;
                case 'unarchive':
                    $note->update(['is_archived' => false]);
                    break;
                case 'pin':
                    $note->update(['is_pinned' => true]);
                    break;
                case 'unpin':
                    $note->update(['is_pinned' => false]);
                    break;
            }
        }

        return redirect()->back()->with('message', 'Bulk action applied successfully!');
    }
}

