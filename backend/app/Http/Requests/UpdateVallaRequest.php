<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateVallaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'referencia' => ['sometimes', 'string', 'max:255'],
            'latitud' => ['sometimes', 'numeric', 'between:-90,90'],
            'longitud' => ['sometimes', 'numeric', 'between:-180,180'],
            'tamano' => ['nullable', 'string', 'max:50'],
            'precio_normal' => ['nullable', 'numeric', 'min:0'],
            'precio_minimo' => ['nullable', 'numeric', 'min:0'],
            'vehiculos_diarios' => ['nullable', 'integer', 'min:0'],
            'precio_instalacion' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
