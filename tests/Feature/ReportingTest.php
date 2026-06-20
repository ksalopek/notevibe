<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Note;
use App\Models\LoginHistory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;
use Carbon\Carbon;

class ReportingTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_reporting_gatekeeping_for_regular_users()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('admin.reporting'));

        // Should be forbidden
        $response->assertStatus(403);
    }

    public function test_admin_reporting_is_accessible_by_admins()
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get(route('admin.reporting'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Reporting/Index')
            ->has('powerUsers')
            ->has('atRiskUsers')
            ->has('activityHeatmap')
            ->has('tagCloud')
            ->has('noteVelocity')
            ->has('abandonedAccounts')
            ->has('accessLogs')
            ->has('settingsAudit')
        );
    }

    public function test_aggregation_accuracy_for_power_users_and_at_risk_users()
    {
        $admin = User::factory()->admin()->create();

        // Power User: Top 10 users with most notes
        $powerUser = User::factory()->create();
        Note::factory()->count(25)->create(['user_id' => $powerUser->id]);

        // At-Risk User: > 30 days since last login
        $atRiskUser = User::factory()->create([
            'last_login_at' => Carbon::now()->subDays(35)
        ]);

        $response = $this->actingAs($admin)->get(route('admin.reporting'));

        $response->assertInertia(fn (Assert $page) => $page
            ->where('powerUsers.data.0.id', $powerUser->id)
            ->where('atRiskUsers.0.id', $atRiskUser->id)
        );
    }

    public function test_security_metrics_abandoned_accounts()
    {
        $admin = User::factory()->admin()->create();

        // Abandoned Account: No notes, > 7 days old
        $abandonedUser = User::factory()->create([
            'created_at' => Carbon::now()->subDays(10)
        ]);
        // Ensure no notes are created for this user

        $response = $this->actingAs($admin)->get(route('admin.reporting'));

        $response->assertInertia(fn (Assert $page) => $page
            ->where('abandonedAccounts.data.0.id', $abandonedUser->id)
        );
    }
}
