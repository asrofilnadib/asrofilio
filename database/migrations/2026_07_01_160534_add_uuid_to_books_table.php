<?php

use App\Models\Book;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->string('uuid', 8)->nullable()->unique()->after('id');
        });

        Book::query()
            ->withTrashed()
            ->whereNull('uuid')
            ->eachById(function (Book $book): void {
                $book->forceFill(['uuid' => Book::generateUniqueCode()])->saveQuietly();
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->dropColumn('uuid');
        });
    }
};
