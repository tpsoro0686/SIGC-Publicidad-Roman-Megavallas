<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUsuarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => ['sometimes', 'string', 'max:150'],
            'correo' => ['sometimes', 'email', 'max:150', Rule::unique('usuarios', 'correo')->ignore($this->route('usuario'))],
            'password' => ['nullable', 'string', 'min:6'],
            'rol_id' => ['sometimes', 'exists:roles,id'],
            'estado' => ['sometimes', Rule::in(['Activo', 'Inactivo'])],
        ];
    }

    public function messages(): array
    {
        return [
            'correo.unique' => 'Ya existe un usuario registrado con ese correo.',
        ];
    }
}
