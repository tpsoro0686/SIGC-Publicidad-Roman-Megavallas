<?php

namespace App\Http\Requests;

use App\Services\SolicitudPortalService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSolicitudPortalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:120'],
            'empresa' => ['nullable', 'string', 'max:150'],
            'telefono' => ['required', 'string', 'min:7', 'max:30'],
            'correo' => ['required', 'email', 'max:150'],
            'mensaje' => ['nullable', 'string', 'max:1000'],
            'fecha_inicio_deseada' => ['nullable', 'date', 'after_or_equal:today'],
            'plazo_meses_deseado' => ['nullable', 'integer', 'min:1', 'max:60'],
            'vallas' => ['required', 'array', 'min:1', 'max:20'],
            'vallas.*' => [
                'integer',
                'distinct',
                Rule::exists('vallas', 'id')->whereNotIn('estado', SolicitudPortalService::ESTADOS_OCULTOS),
            ],
            // Campo trampa: las personas no lo ven, los bots si lo llenan
            'sitio_web' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'Escribe tu nombre.',
            'telefono.required' => 'Escribe un teléfono de contacto.',
            'telefono.min' => 'El teléfono es muy corto.',
            'correo.required' => 'Escribe tu correo.',
            'correo.email' => 'El correo no es válido.',
            'fecha_inicio_deseada.after_or_equal' => 'La fecha de inicio no puede ser anterior a hoy.',
            'vallas.required' => 'Selecciona al menos una valla.',
            'vallas.min' => 'Selecciona al menos una valla.',
            'vallas.max' => 'Puedes solicitar hasta 20 vallas a la vez.',
            'vallas.*.exists' => 'Una de las vallas seleccionadas ya no está disponible en el portal.',
        ];
    }
}
