<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Reseta as horas das assinaturas no primeiro dia de cada mês
Schedule::call(function () {
    \App\Models\Assinatura::ativo()->each(function ($assinatura) {
        $assinatura->resetarHoras();
    });
})->monthlyOn(1, '00:00');
