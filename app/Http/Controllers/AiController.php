<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AiController extends Controller
{
    public function enhance(Request $request)
    {
        $request->validate([
            'text' => 'required|string|max:10000',
        ]);

        $text = $request->input('text');
        $apiKey = env('GEMINI_API_KEY');

        if (!$apiKey) {
            return response()->json(['error' => 'GEMINI_API_KEY is not set in .env'], 500);
        }

        try {
            $response = Http::post("https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            [
                                'text' => "Please rewrite the following text to make it sound better, more professional, and fix any grammar issues. Keep the formatting intact (e.g. HTML or markdown) if present. Only return the rewritten text and nothing else.\n\nText:\n" . $text
                            ]
                        ]
                    ]
                ]
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $enhancedText = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
                
                if ($enhancedText) {
                    return response()->json(['enhanced_text' => $enhancedText]);
                }
            }

            $errorMessage = $response->json('error.message') ?? 'Unknown error from Gemini API';
            return response()->json(['error' => 'AI Error: ' . $errorMessage, 'details' => $response->json()], 500);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
