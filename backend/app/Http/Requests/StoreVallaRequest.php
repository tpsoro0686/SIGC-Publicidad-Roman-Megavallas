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
            'estructura_id' => ['required', 'exists:estructuras,id'],
            'tamano' => ['nullable', 'string', 'max:50'],
            'codigo' => ['nullable', 'string', 'max:30', 'unique:vallas,codigo'],
        ];
    }
}