<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome'); // Ou redirecionar para login
});

// Admin Panel Routes
Route::get('/admpanel/{any?}', function () {
    return view('admin');
})->where('any', '.*');
