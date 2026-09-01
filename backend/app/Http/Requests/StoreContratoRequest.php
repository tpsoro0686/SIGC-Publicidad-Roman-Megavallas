<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreContratoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reserva_id' => ['nullable', 'exists:reservas,id'],
            'valla_id' => ['required_without:reserva_id', 'exists:vallas,id'],
            'cliente_id' => ['nullable', 'exists:clientes,id', 'required_without_all:reserva_id,cliente_nombre'],
            'cliente_nombre' => ['nullable', 'string', 'max:150'],
            'monto_usd' => ['required', 'numeric', 'min:0.01'],
            'plazo_meses' => ['required', 'integer', 'min:1', 'max:120'],
            'fecha_inicio' => ['required', 'date'],
        ];
    }
}
