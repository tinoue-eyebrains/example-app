<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Infrastructure\Persistence\Eloquent\UserModel;
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

    public function test_register_validation_errors_return_unprocessable_with_errors_key(): void
    {
        $response = $this->postJson('/api/users', [
            'name' => '',
            'email' => 'invalid',
            'password' => 'short',
        ]);

        $response->assertUnprocessable()
            ->assertJsonStructure(['message', 'errors']);
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
            ->assertJsonValidationErrors(['email'])
            ->assertJsonPath('errors.email.0', 'このメールアドレスは既に登録されています。');
    }

    public function test_register_with_avatar_stores_path(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('face.png', 80, 80);

        $response = $this->post('/api/users', [
            'name' => 'Photo User',
            'email' => 'photo@example.com',
            'password' => 'password123',
            'avatar' => $file,
        ], ['Accept' => 'application/json']);

        $response->assertCreated();

        $this->assertDatabaseHas('users', [
            'email' => 'photo@example.com',
            'name' => 'Photo User',
        ]);

        $path = UserModel::query()->where('email', 'photo@example.com')->value('avatar_path');
        $this->assertIsString($path);
        Storage::disk('public')->assertExists($path);
    }
}
