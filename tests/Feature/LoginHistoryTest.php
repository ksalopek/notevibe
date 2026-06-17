<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\LoginHistory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginHistoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_successful_login_records_history()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
        ]);

        $this->assertDatabaseCount('login_histories', 0);

        $response = $this->post('/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ], [
            'User-Agent' => 'TestBrowser/1.0',
        ]);

        $response->assertRedirect(route('dashboard', absolute: false));
        $this->assertAuthenticatedAs($user);

        // Verify the login history was recorded
        $this->assertDatabaseCount('login_histories', 1);
        $this->assertDatabaseHas('login_histories', [
            'user_id' => $user->id,
        ]);
        
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'last_login_ip' => '127.0.0.1', // The default test IP
        ]);
    }

    public function test_failed_login_does_not_record_history()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
        ]);

        $this->assertDatabaseCount('login_histories', 0);

        $response = $this->post('/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();

        // Verify the login history was NOT recorded
        $this->assertDatabaseCount('login_histories', 0);
    }
}
