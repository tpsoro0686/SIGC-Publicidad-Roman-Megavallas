<?php

return [
    // Días que se aparta una valla cuando el cliente envía su solicitud desde el portal.
    'dias_apartado' => (int) env('PORTAL_DIAS_APARTADO', 3),

    // Máximo de vallas apartadas a la vez por un mismo correo (evita acaparar el inventario).
    'max_apartadas_por_correo' => (int) env('PORTAL_MAX_APARTADAS', 10),
];
