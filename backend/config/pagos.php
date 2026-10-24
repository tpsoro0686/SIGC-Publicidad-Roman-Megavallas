<?php

// Pagos en linea del portal de clientes.
// Mientras PAGOS_HABILITADOS sea false el portal NO muestra opciones de pago
// y los endpoints de cobro responden 404.
return [

    'habilitados' => (bool) env('PAGOS_HABILITADOS', false),

    // Pasarela activa. Debe existir en "pasarelas". "simulado" solo sirve fuera de produccion.
    'pasarela' => env('PAGOS_PASARELA', 'simulado'),

    'moneda' => env('PAGOS_MONEDA', 'USD'),

    // Porcentaje del primer mes (+ instalacion) que se cobra como adelanto
    'porcentaje_adelanto' => (int) env('PAGOS_PORCENTAJE_ADELANTO', 30),

    // Pagina del portal a la que vuelve el cliente despues de pagar
    'url_retorno' => env('PAGOS_URL_RETORNO', 'http://127.0.0.1:5500/frontend/portal/index.html'),

    // Cada pasarela real se agrega aqui con su clase (que implementa PasarelaPago)
    'pasarelas' => [
        'simulado' => \App\Services\Pagos\PasarelaSimulada::class,
        // 'tilopay' => \App\Services\Pagos\PasarelaTilopay::class,
    ],

];
