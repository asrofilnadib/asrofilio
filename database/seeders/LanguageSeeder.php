<?php

namespace Database\Seeders;

use App\Models\Language;
use Illuminate\Database\Seeder;

class LanguageSeeder extends Seeder
{
    /**
     * @var array<string, string>
     */
    private array $languages = [
        'en' => 'English',
        'id' => 'Indonesian',
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach ($this->languages as $code => $name) {
            Language::query()->updateOrCreate(
                ['code' => $code],
                ['name' => $name],
            );
        }
    }
}
