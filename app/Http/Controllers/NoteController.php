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

        $query = Auth::user()->notes()->with('tags');

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
        ]);
    }

    public function store(StoreNoteRequest $request)
    {
        $validated = $request->validated();
        $note = Auth::user()->notes()->create($validated);
        $this->syncTags($request, $note);

        return redirect()->back()->with('message', 'Note created successfully!');
    }

    public function update(UpdateNoteRequest $request, Note $note)
    {
        $validated = $request->validated();
        $note->update($validated);
        $this->syncTags($request, $note);

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
}
