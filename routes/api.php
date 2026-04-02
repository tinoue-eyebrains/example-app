<?php

use App\Http\Controllers\RegisterUserController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/users', [UserController::class, 'index']);
Route::get('/users/{user}', [UserController::class, 'show'])->whereNumber('user');
Route::post('/users', [RegisterUserController::class, 'store']);
Route::put('/users/{user}', [UserController::class, 'update'])->whereNumber('user');
Route::delete('/users/{user}', [UserController::class, 'destroy'])->whereNumber('user');
