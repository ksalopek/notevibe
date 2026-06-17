<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Note;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;
use Carbon\Carbon;

class AnalyticsTest extends TestCase
{
    use RefreshDatabase;

    public function test_my_analytics_route_is_accessible_and_returns_correct_props()
    {
        $user = User::factory()->create();

        // Create some notes for this user
        Note::factory()->create([
            'user_id' => $user->id,
            'content' => 'One two three four five.',
            'created_at' => Carbon::now()->subHours(5), // Make it early bird if time allows
        ]);

        $response = $this->actingAs($user)->get(route('analytics.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Analytics/Index')
            ->has('streak')
            ->has('totalWords')
            ->has('persona')
            ->has('hourChart')
            ->has('tagDistribution')
            ->has('velocityChart')
            ->has('busiestDayChart')
            ->has('totalNotes')
        );
    }

    public function test_streak_calculation()
    {
        $user = User::factory()->create();

        // Note 1: Today
        Note::factory()->create([
            'user_id' => $user->id,
            'updated_at' => Carbon::now(),
        ]);

        // Note 2: Yesterday
        Note::factory()->create([
            'user_id' => $user->id,
            'updated_at' => Carbon::now()->subDay(),
        ]);

        // Note 3: 2 Days ago
        Note::factory()->create([
            'user_id' => $user->id,
            'updated_at' => Carbon::now()->subDays(2),
        ]);

        // Note 4: 4 Days ago (break in streak)
        Note::factory()->create([
            'user_id' => $user->id,
            'updated_at' => Carbon::now()->subDays(4),
        ]);

        $response = $this->actingAs($user)->get(route('analytics.index'));
        
        $response->assertInertia(fn (Assert $page) => $page
            ->where('streak', 3)
        );
    }

    public function test_writing_persona_logic_night_owl()
    {
        $user = User::factory()->create();

        // Create notes specifically at 11 PM (23:00)
        Note::factory()->count(3)->create([
            'user_id' => $user->id,
            'created_at' => Carbon::now()->setTime(23, 0),
        ]);

        $response = $this->actingAs($user)->get(route('analytics.index'));

        $response->assertInertia(fn (Assert $page) => $page
            ->where('persona', 'Night Owl (10pm-4am)')
        );
    }
    
    public function test_writing_persona_logic_early_bird()
    {
        $user = User::factory()->create();

        // Create notes specifically at 8 AM (08:00)
        Note::factory()->count(3)->create([
            'user_id' => $user->id,
            'created_at' => Carbon::now()->setTime(8, 0),
        ]);

        $response = $this->actingAs($user)->get(route('analytics.index'));

        $response->assertInertia(fn (Assert $page) => $page
            ->where('persona', 'Early Bird (5am-11am)')
        );
    }

    public function test_data_isolation()
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        // User A creates 5 notes
        Note::factory()->count(5)->create([
            'user_id' => $userA->id,
        ]);

        // User B creates 2 notes
        Note::factory()->count(2)->create([
            'user_id' => $userB->id,
        ]);

        // User A checks analytics
        $responseA = $this->actingAs($userA)->get(route('analytics.index'));
        $responseA->assertInertia(fn (Assert $page) => $page
            ->where('totalNotes', 5)
        );

        // User B checks analytics
        $responseB = $this->actingAs($userB)->get(route('analytics.index'));
        $responseB->assertInertia(fn (Assert $page) => $page
            ->where('totalNotes', 2)
        );
    }
}
