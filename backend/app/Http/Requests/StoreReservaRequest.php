<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReservaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

          public function rules(): array
    {
        return [
            'valla_id' => ['required', 'exists:vallas,id'],
            'cliente_id' => ['nullable', 'exists:clientes,id', 'required_without:cliente_nombre'],
            'cliente_nombre' => ['nullable', 'string', 'max:150', 'required_without:cliente_id'],
            'cliente_telefono' => ['nullable', 'string', 'max:30', 'required_with:cliente_nombre'],
            'cliente_correo' => ['nullable', 'email', 'max:150', 'required_with:cliente_nombre'],
        ];
    }
}
