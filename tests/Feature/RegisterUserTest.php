<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegisterUserTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_user_returns_created(): void
    {
        $response = $this->postJson('/api/users', [
            'name' => 'Test User',
            'email' => 'new@example.com',
            'password' => 'password123',
        ]);

        $response->assertCreated()
            ->assertJsonStructure(['id']);

        $this->assertDatabaseHas('users', [
            'email' => 'new@example.com',
            'name' => 'Test User',
        ]);
    }

    public function test_register_duplicate_email_returns_unprocessable(): void
    {
        $this->postJson('/api/users', [
            'name' => 'First',
            'email' => 'dup@example.com',
            'password' => 'password123',
        ])->assertCreated();

        $response = $this->postJson('/api/users', [
            'name' => 'Second',
            'email' => 'dup@example.com',
            'password' => 'password123',
        ]);

        $response->assertUnprocessable()
            ->assertJsonPath('message', 'Email is already registered.');
    }
}
