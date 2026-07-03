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
        $folderId = $request->input('folder_id');
        $tagsFilter = $request->input('tags');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        
        $isPinned = filter_var($request->input('is_pinned'), FILTER_VALIDATE_BOOLEAN);
        $hasLinks = filter_var($request->input('has_links'), FILTER_VALIDATE_BOOLEAN);
        $hasTasks = filter_var($request->input('has_tasks'), FILTER_VALIDATE_BOOLEAN);
        $updatedFrom = $request->input('updated_from');
        $updatedTo = $request->input('updated_to');

        $query = Auth::user()->notes()->where('is_archived', false)->with(['tags', 'folder']);

        if ($folderId) {
            $query->where('folder_id', $folderId);
        }
        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }
        if (!empty($tagsFilter)) {
            $tagsArray = is_array($tagsFilter) ? $tagsFilter : explode(',', $tagsFilter);
            $query->whereHas('tags', function ($q) use ($tagsArray) {
                $q->whereIn('name', $tagsArray);
            });
        }
        
        if ($isPinned) {
            $query->where('is_pinned', true);
        }
        if ($hasLinks) {
            $query->whereNotNull('link_previews')->where('link_previews', '!=', '[]');
        }
        if ($hasTasks) {
            $query->where('content', 'LIKE', '%data-type="taskList"%');
        }
        if ($updatedFrom) {
            $query->whereDate('updated_at', '>=', $updatedFrom);
        }
        if ($updatedTo) {
            $query->whereDate('updated_at', '<=', $updatedTo);
        }


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
                    $q->whereRaw("MATCH(title, content) AGAINST(? IN BOOLEAN MODE)", [$search])
                      ->orWhereHas('tags', function ($tagQuery) use ($search) {
                          $tagQuery->where('name', 'like', "%{$search}%");
                      });
                })
                ->orderBy('is_pinned', 'desc')
                ->orderByRaw("MATCH(title, content) AGAINST(? IN BOOLEAN MODE) DESC", [$search]);
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

        $folders = Auth::user()->folders;
        $templates = Auth::user()->templates;
        $tags = Auth::user()->tags;

        return Inertia::render('Notes/Index', [
            'notes' => $notes,
            'filters' => $request->only(['search', 'sort', 'folder_id', 'tags', 'date_from', 'date_to', 'is_pinned', 'has_links', 'has_tasks', 'updated_from', 'updated_to']),
            'folders' => $folders,
            'templates' => $templates,
            'tags' => $tags,
            'isArchiveView' => false,
        ]);
    }

    public function archived(Request $request)
    {
        $sortBy = $request->input('sort', 'relevance');
        $search = $request->input('search');
        $folderId = $request->input('folder_id');
        $tagsFilter = $request->input('tags');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        $query = Auth::user()->notes()->where('is_archived', true)->with(['tags', 'folder']);

        if ($folderId) {
            $query->where('folder_id', $folderId);
        }
        if ($dateFrom) {
            $query->whereDate('archived_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('archived_at', '<=', $dateTo);
        }
        if (!empty($tagsFilter)) {
            $tagsArray = is_array($tagsFilter) ? $tagsFilter : explode(',', $tagsFilter);
            $query->whereHas('tags', function ($q) use ($tagsArray) {
                $q->whereIn('name', $tagsArray);
            });
        }

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
                    $q->whereRaw("MATCH(title, content) AGAINST(? IN BOOLEAN MODE)", [$search])
                      ->orWhereHas('tags', function ($tagQuery) use ($search) {
                          $tagQuery->where('name', 'like', "%{$search}%");
                      });
                })
                ->orderBy('is_pinned', 'desc')
                ->orderByRaw("MATCH(title, content) AGAINST(? IN BOOLEAN MODE) DESC", [$search]);
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
                    $query->oldest('archived_at');
                    break;
                case 'a_z':
                    $query->orderBy('title', 'asc');
                    break;
                case 'z_a':
                    $query->orderBy('title', 'desc');
                    break;
                case 'latest':
                default:
                    $query->latest('archived_at');
                    break;
            }
        }

        $notes = $query->paginate(10)->withQueryString();

        $folders = Auth::user()->folders;
        $templates = Auth::user()->templates;
        $tags = Auth::user()->tags;

        return Inertia::render('Notes/Index', [
            'notes' => $notes,
            'filters' => $request->only(['search', 'sort', 'folder_id', 'tags', 'date_from', 'date_to']),
            'folders' => $folders,
            'templates' => $templates,
            'tags' => $tags,
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
        $sortBy = $request->input('sort', 'latest');
        $search = $request->input('search');
        $folderId = $request->input('folder_id');
        $tagsFilter = $request->input('tags');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        
        $isPinned = filter_var($request->input('is_pinned'), FILTER_VALIDATE_BOOLEAN);
        $hasLinks = filter_var($request->input('has_links'), FILTER_VALIDATE_BOOLEAN);
        $hasTasks = filter_var($request->input('has_tasks'), FILTER_VALIDATE_BOOLEAN);
        $updatedFrom = $request->input('updated_from');
        $updatedTo = $request->input('updated_to');

        $query = Auth::user()->notes()->onlyTrashed()->with(['tags', 'folder']);

        if ($folderId) {
            $query->where('folder_id', $folderId);
        }
        if ($dateFrom) {
            $query->whereDate('deleted_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('deleted_at', '<=', $dateTo);
        }
        if (!empty($tagsFilter)) {
            $tagsArray = is_array($tagsFilter) ? $tagsFilter : explode(',', $tagsFilter);
            $query->whereHas('tags', function ($q) use ($tagsArray) {
                $q->whereIn('name', $tagsArray);
            });
        }
        
        if ($isPinned) {
            $query->where('is_pinned', true);
        }
        if ($hasLinks) {
            $query->whereNotNull('link_previews')->where('link_previews', '!=', '[]');
        }
        if ($hasTasks) {
            $query->where('content', 'LIKE', '%data-type="taskList"%');
        }
        if ($updatedFrom) {
            $query->whereDate('updated_at', '>=', $updatedFrom);
        }
        if ($updatedTo) {
            $query->whereDate('updated_at', '<=', $updatedTo);
        }


        $query->when($search, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%")
                  ->orWhereHas('tags', function ($tagQuery) use ($search) {
                      $tagQuery->where('name', 'like', "%{$search}%");
                  });
            });
        });

        switch ($sortBy) {
            case 'oldest':
                $query->oldest('deleted_at');
                break;
            case 'a_z':
                $query->orderBy('title', 'asc');
                break;
            case 'z_a':
                $query->orderBy('title', 'desc');
                break;
            case 'latest':
            default:
                $query->latest('deleted_at');
                break;
        }

        $trashedNotes = $query->paginate(10)->withQueryString();

        $folders = Auth::user()->folders;
        $tags = Auth::user()->tags;

        return Inertia::render('Notes/Trash', [
            'notes' => $trashedNotes,
            'filters' => $request->only(['search', 'sort', 'folder_id', 'tags', 'date_from', 'date_to', 'is_pinned', 'has_links', 'has_tasks', 'updated_from', 'updated_to']),
            'folders' => $folders,
            'tags' => $tags,
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
            $user = \Illuminate\Support\Facades\Auth::user();
            foreach ($tagNames as $tagName) {
                $tagName = trim($tagName);
                if ($tagName) {
                    $tag = $user->tags()->firstOrCreate(['name' => $tagName]);
                    $tagIds[] = $tag->id;
                }
            }
        }
        $note->tags()->sync($tagIds);
    }

    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|string|in:delete,restore,force_delete,archive,unarchive,pin,unpin,move,add_tags,remove_tags',
            'note_ids' => 'required|array',
            'note_ids.*' => 'integer|exists:notes,id',
            'folder_id' => 'nullable|integer|exists:folders,id',
            'tag_names' => 'nullable|array',
            'tag_names.*' => 'string'
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
                case 'move':
                    $note->update(['folder_id' => $request->input('folder_id')]);
                    break;
                case 'add_tags':
                    if ($request->has('tag_names')) {
                        $user = \Illuminate\Support\Facades\Auth::user();
                        $tagIds = [];
                        foreach ($request->input('tag_names') as $tagName) {
                            $tagName = trim($tagName);
                            if ($tagName) {
                                $tag = $user->tags()->firstOrCreate(['name' => $tagName]);
                                $tagIds[] = $tag->id;
                            }
                        }
                        $note->tags()->syncWithoutDetaching($tagIds);
                    }
                    break;
                case 'remove_tags':
                    if ($request->has('tag_names')) {
                        $user = \Illuminate\Support\Facades\Auth::user();
                        $tagIdsToRemove = $user->tags()->whereIn('name', $request->input('tag_names'))->pluck('id');
                        $note->tags()->detach($tagIdsToRemove);
                    }
                    break;
            }
        }

        return redirect()->back()->with('message', 'Bulk action applied successfully!');
    }
}

