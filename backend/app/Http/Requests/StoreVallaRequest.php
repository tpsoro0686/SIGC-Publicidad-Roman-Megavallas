<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVallaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'provincia_id' => ['required', 'exists:provincias,id'],
            'referencia' => ['required', 'string', 'max:255'],
            'latitud' => ['required', 'numeric', 'between:-90,90'],
            'longitud' => ['required', 'numeric', 'between:-180,180'],
            'tamano' => ['nullable', 'string', 'max:50'],
            'codigo' => ['nullable', 'string', 'max:30', 'unique:vallas,codigo'],
            'precio_normal' => ['nullable', 'numeric', 'min:0'],
            'precio_minimo' => ['nullable', 'numeric', 'min:0'],
            'vehiculos_diarios' => ['nullable', 'integer', 'min:0'],
            'precio_instalacion' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
