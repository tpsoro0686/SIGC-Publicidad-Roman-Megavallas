<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RenovarContratoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'plazo_meses' => ['required', 'integer', 'min:1', 'max:120'],
            'fecha_inicio' => ['required', 'date'],
            'monto_usd' => ['nullable', 'numeric', 'min:0.01'],
        ];
    }
}
