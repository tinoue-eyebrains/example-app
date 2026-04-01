<?php

namespace Infrastructure\Providers;

use Application\User\PasswordHasherInterface;
use Application\User\UserRepositoryInterface;
use Illuminate\Support\ServiceProvider;
use Infrastructure\Hashing\LaravelPasswordHasher;
use Infrastructure\Persistence\EloquentUserRepository;

class InfrastructureServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(UserRepositoryInterface::class, EloquentUserRepository::class);
        $this->app->bind(PasswordHasherInterface::class, LaravelPasswordHasher::class);
    }
}
