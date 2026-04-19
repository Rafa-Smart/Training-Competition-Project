<?php

namespace Database\Seeders;

use Hash;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // disni ktia buat 3 user
        // ini uh mirip kaya array of objek

        // jadi kalo akses function di class itu gunain ::

        $users = [
            [
                'name' => 'admin',
                'email' => 'admin@gmail.com',
                'password' => Hash::make('123'),
            ],
            [
                'name' => 'creator',
                'email' => 'creator@gmail.com',
                'password' => Hash::make('123'),
            ],
            [
                'name' => 'editor',
                'email' => 'editor@gmail.com',
                'password' => Hash::make('123'),
            ],
        ];

        foreach ($users as $key => $value) {
            User::create($value);
        }
    }
}
