<?php

namespace App\Http\Requests\Api;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreSpaceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null && ! $this->user()->is_suspended;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:3', 'max:60'],
            'description' => ['nullable', 'string', 'max:500'],
            'type' => ['required', 'in:public,private'],
        ];
    }
}
