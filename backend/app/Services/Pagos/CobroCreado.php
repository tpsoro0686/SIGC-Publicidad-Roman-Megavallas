<?php

namespace App\Services\Pagos;

class CobroCreado
{
    public function __construct(
        public readonly string $urlPago,
        public readonly ?string $pasarelaReferencia = null,
        public readonly array $datos = [],
    ) {
    }
}
