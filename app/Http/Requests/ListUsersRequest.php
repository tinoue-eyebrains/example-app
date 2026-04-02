<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ListUsersRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $name = $this->query('name');
        $email = $this->query('email');
        $merge = [];
        if (is_string($name)) {
            $merge['name'] = trim($name);
        }
        if (is_string($email)) {
            $merge['email'] = trim($email);
        }
        $sort = $this->query('sort');
        if (is_string($sort)) {
            $merge['sort'] = strtolower(trim($sort));
        }
        $order = $this->query('order');
        if (is_string($order)) {
            $merge['order'] = strtolower(trim($order));
        }
        if ($merge !== []) {
            $this->merge($merge);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'max:255'],
            'sort' => ['sometimes', 'string', Rule::in(['id', 'email'])],
            'order' => ['sometimes', 'string', Rule::in(['asc', 'desc'])],
        ];
    }
}
