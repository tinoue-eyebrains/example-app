<?php

namespace Tests\Feature;

use Tests\TestCase;

class SpaRoutesTest extends TestCase
{
    public function test_home_serves_spa_shell(): void
    {
        $this->get('/')->assertOk()->assertSee('id="app"', false);
    }

    public function test_settings_users_register_path_serves_spa_shell(): void
    {
        $this->get('/settings/users/register')->assertOk()->assertSee('id="app"', false);
    }

    public function test_legacy_register_path_still_serves_spa_shell(): void
    {
        $this->get('/register')->assertOk()->assertSee('id="app"', false);
    }

    public function test_settings_users_path_serves_spa_shell(): void
    {
        $this->get('/settings/users')->assertOk()->assertSee('id="app"', false);
    }
}
