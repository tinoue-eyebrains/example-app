<?php

namespace Tests\Feature;

use Tests\TestCase;

class SpaRoutesTest extends TestCase
{
    public function test_home_serves_spa_shell(): void
    {
        $this->get('/')->assertOk()->assertSee('id="app"', false);
    }

    public function test_register_path_serves_spa_shell(): void
    {
        $this->get('/register')->assertOk()->assertSee('id="app"', false);
    }
}
