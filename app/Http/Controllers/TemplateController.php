<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Template;
use Illuminate\Support\Facades\Auth;

class TemplateController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'content' => 'nullable|string',
        ]);

        Auth::user()->templates()->create($validated);

        return redirect()->back()->with('message', 'Template created successfully!');
    }

    public function update(Request $request, Template $template)
    {
        if ($template->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'content' => 'nullable|string',
        ]);

        $template->update($validated);

        return redirect()->back()->with('message', 'Template updated successfully!');
    }

    public function destroy(Template $template)
    {
        if ($template->user_id !== Auth::id()) {
            abort(403);
        }

        $template->delete();

        return redirect()->back()->with('message', 'Template deleted successfully!');
    }
}
