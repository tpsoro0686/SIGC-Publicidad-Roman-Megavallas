<?php

namespace App\Services\Pagos;

class ResultadoPago
{
    // $estado: Pagado | Fallido | Cancelado | Reembolsado
    public function __construct(
        public readonly string $referencia,
        public readonly string $estado,
        public readonly ?string $pasarelaReferencia = null,
        public readonly array $datos = [],
    ) {
    }
}
