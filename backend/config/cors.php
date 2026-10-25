<?php

return [

    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    // En .env de produccion: CORS_ALLOWED_ORIGINS=https://sigc.romanmegavallas.com
    // (varios separados por coma). Vacio = cualquiera (solo para desarrollo local).
    'allowed_origins' => array_values(array_filter(array_map('trim', explode(',', (string) env('CORS_ALLOWED_ORIGINS', '*'))))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // La app usa token en el encabezado Authorization, no cookies
    'supports_credentials' => false,

];
