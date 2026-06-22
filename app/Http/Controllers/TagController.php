<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TagController extends Controller
{
    public function update(Request $request, Tag $tag)
    {
        if ($tag->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'nullable|string|max:50',
        ]);

        // Check uniqueness for user
        $existing = Auth::user()->tags()->where('name', $request->input('name'))->where('id', '!=', $tag->id)->first();
        if ($existing) {
            return back()->withErrors(['name' => 'You already have a tag with this name.']);
        }

        $tag->update($request->only('name', 'color'));

        return redirect()->back()->with('message', 'Tag updated successfully!');
    }

    public function destroy(Tag $tag)
    {
        if ($tag->user_id !== Auth::id()) {
            abort(403);
        }

        $tag->delete();

        return redirect()->back()->with('message', 'Tag deleted successfully!');
    }
}
