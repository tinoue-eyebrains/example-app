<?php

use App\Http\Controllers\RegisterUserController;
use Illuminate\Support\Facades\Route;

Route::post('/users', [RegisterUserController::class, 'store']);
