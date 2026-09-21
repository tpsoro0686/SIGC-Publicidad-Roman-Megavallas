<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateConfiguracionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'empresa' => ['nullable', 'string', 'max:150'],
            'correo' => ['nullable', 'email', 'max:150'],
            'telefono' => ['nullable', 'string', 'max:30'],
            'direccion' => ['nullable', 'string', 'max:255'],
            'cedula_tipo' => ['required', Rule::in(['fisica', 'juridica'])],
            'cedula_numero' => ['nullable', 'string', 'max:30'],
            'sitio_web' => ['nullable', 'string', 'max:255'],

            'tipo_cambio' => ['required', 'numeric', 'min:0'],
            'tipo_cambio_auto' => ['required', 'boolean'],

            'comision_ejecutivo_pct' => ['required', 'numeric', 'min:0', 'max:100'],
            'dias_aviso_vencimiento' => ['required', 'integer', 'min:1', 'max:365'],

            'notificaciones_activas' => ['required', 'boolean'],
            'notificaciones_correo_remitente' => ['nullable', 'email', 'max:150'],
            'notificaciones_nombre_remitente' => ['nullable', 'string', 'max:150'],
        ];
    }
}
