<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateClienteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => ['sometimes', 'string', 'max:150'],
            'cedula' => ['sometimes', 'string', 'max:30', Rule::unique('clientes', 'cedula')->ignore($this->route('cliente'))],
            'telefono' => ['nullable', 'string', 'max:30'],
            'correo' => ['nullable', 'email', 'max:150'],
            'direccion' => ['nullable', 'string', 'max:255'],
            'estado' => ['sometimes', Rule::in(['Activo', 'Inactivo'])],
        ];
    }

    public function messages(): array
    {
        return [
            'cedula.unique' => 'Ya existe un cliente registrado con esa cédula.',
        ];
    }
}
