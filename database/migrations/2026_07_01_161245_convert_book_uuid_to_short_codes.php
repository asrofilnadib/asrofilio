<?php

use App\Models\Book;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $needsShortCodes = Book::query()
            ->withTrashed()
            ->where(function ($query): void {
                $query->whereNull('uuid')
                    ->orWhereRaw('LENGTH(uuid) > 8');
            })
            ->exists();

        if ($needsShortCodes) {
            Book::query()
                ->withTrashed()
                ->where(function ($query): void {
                    $query->whereNull('uuid')
                        ->orWhereRaw('LENGTH(uuid) > 8');
                })
                ->eachById(function (Book $book): void {
                    $book->forceFill(['uuid' => Book::generateUniqueCode()])->saveQuietly();
                });
        }

        if (Schema::getColumnType('books', 'uuid') !== 'varchar') {
            Schema::table('books', function (Blueprint $table) {
                $table->string('uuid', 8)->nullable(false)->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        Schema::table('books', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->change();
        });
    }
};
