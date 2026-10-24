<?php

namespace App\Services\Pagos;

use App\Models\PagoPortal;
use Illuminate\Http\Request;

// Contrato que cumple cada pasarela (Tilopay, BAC, etc.).
// Para sumar una nueva: crear una clase que lo implemente y registrarla en config/pagos.php.
interface PasarelaPago
{
    // Crea el cobro en la pasarela y devuelve la direccion a la que se manda al cliente.
    public function crearCobro(PagoPortal $pago, string $urlRetorno): CobroCreado;

    // Valida y lee el aviso (webhook) que envia la pasarela. Debe lanzar
    // \InvalidArgumentException si la firma/datos no son validos.
    public function leerWebhook(Request $request): ResultadoPago;
}
