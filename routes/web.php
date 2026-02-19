<?php

use Illuminate\Support\Facades\Route;

// Admin Panel Routes
Route::get('/admpanel/{any?}', function () {
    return view('admin');
})->where('any', '.*');

// Client Panel Routes (homepage)
Route::get('/{any?}', function () {
    return view('client');
})->where('any', '^(?!admpanel|api|sanctum).*$');
