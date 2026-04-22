<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'full_name' => $this->faker->name(),
            'bio' => $this->faker->sentence(10),
            'username' => $this->faker->unique()->userName(),
            // 'email' => $this->faker->unique()->safeEmail(),
            'password' => Hash::make('password123'),
            'is_private' => $this->faker->boolean(30), // 30% chance of being private
            // 'remember_token' => Str::random(10),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * State for private account
     */
    public function private(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'is_private' => true,
            ];
        });
    }

    /**
     * State for public account
     */
    public function public(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'is_private' => false,
            ];
        });
    }

    /**
     * State for specific username
     */
    public function username(string $username): Factory
    {
        return $this->state(function (array $attributes) use ($username) {
            return [
                'username' => $username,
            ];
        });
    }
}