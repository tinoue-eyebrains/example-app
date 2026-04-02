<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Infrastructure\Persistence\Eloquent\UserModel;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_lists_users_with_meta(): void
    {
        UserModel::factory()->create(['name' => 'Alpha', 'email' => 'a@example.com']);
        UserModel::factory()->create(['name' => 'Beta', 'email' => 'b@example.com']);

        $response = $this->getJson('/api/users?per_page=1&page=1');

        $response->assertOk()
            ->assertJsonPath('meta.total', 2)
            ->assertJsonPath('meta.per_page', 1)
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.last_page', 2)
            ->assertJsonCount(1, 'data');
    }

    public function test_search_filters_by_name_and_email_separately(): void
    {
        UserModel::factory()->create(['name' => 'Alice', 'email' => 'x@example.com']);
        UserModel::factory()->create(['name' => 'Bob', 'email' => 'findme@example.com']);

        $this->getJson('/api/users?email=findme')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.email', 'findme@example.com');

        $this->getJson('/api/users?name=Alice')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Alice');
    }

    public function test_search_combines_name_and_email_with_and(): void
    {
        UserModel::factory()->create(['name' => 'Alice Smith', 'email' => 'alice@example.com']);
        UserModel::factory()->create(['name' => 'Alice Jones', 'email' => 'other@example.com']);

        $this->getJson('/api/users?name=Alice&email=example.com')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.email', 'alice@example.com');
    }

    public function test_list_sorts_by_email_asc(): void
    {
        UserModel::factory()->create(['email' => 'zebra@example.com']);
        UserModel::factory()->create(['email' => 'alpha@example.com']);

        $this->getJson('/api/users?sort=email&order=asc&per_page=10')
            ->assertOk()
            ->assertJsonPath('data.0.email', 'alpha@example.com')
            ->assertJsonPath('data.1.email', 'zebra@example.com');
    }

    public function test_list_sorts_by_id_asc(): void
    {
        $first = UserModel::factory()->create();
        $second = UserModel::factory()->create();

        $this->getJson('/api/users?sort=id&order=asc&per_page=10')
            ->assertOk()
            ->assertJsonPath('data.0.id', min($first->id, $second->id))
            ->assertJsonPath('data.1.id', max($first->id, $second->id));
    }

    public function test_list_rejects_invalid_sort_field(): void
    {
        $this->getJson('/api/users?sort=name')->assertUnprocessable();
    }

    public function test_list_includes_avatar_url_key(): void
    {
        UserModel::factory()->create(['name' => 'X', 'email' => 'x@example.com']);

        $this->getJson('/api/users')
            ->assertOk()
            ->assertJsonPath('data.0.avatar_url', null);
    }

    public function test_show_returns_user(): void
    {
        $user = UserModel::factory()->create(['name' => 'Show Me', 'email' => 'show@example.com']);

        $this->getJson("/api/users/{$user->id}")
            ->assertOk()
            ->assertJsonPath('id', $user->id)
            ->assertJsonPath('name', 'Show Me')
            ->assertJsonPath('email', 'show@example.com')
            ->assertJsonPath('avatar_url', null);
    }

    public function test_show_missing_returns_not_found(): void
    {
        $this->getJson('/api/users/999999')->assertNotFound();
    }

    public function test_update_user(): void
    {
        $user = UserModel::factory()->create(['name' => 'Old', 'email' => 'old@example.com']);

        $this->putJson("/api/users/{$user->id}", [
            'name' => 'New',
            'email' => 'new@example.com',
        ])->assertNoContent();

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'New',
            'email' => 'new@example.com',
        ]);
    }

    public function test_update_duplicate_email_returns_unprocessable(): void
    {
        $a = UserModel::factory()->create(['email' => 'a@example.com']);
        $b = UserModel::factory()->create(['email' => 'b@example.com']);

        $this->putJson("/api/users/{$b->id}", [
            'name' => 'X',
            'email' => 'a@example.com',
        ])->assertUnprocessable()->assertJsonValidationErrors(['email']);
    }

    public function test_delete_user(): void
    {
        $user = UserModel::factory()->create();

        $this->deleteJson("/api/users/{$user->id}")->assertNoContent();

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    public function test_delete_missing_returns_not_found(): void
    {
        $this->deleteJson('/api/users/999999')->assertNotFound();
    }
}
