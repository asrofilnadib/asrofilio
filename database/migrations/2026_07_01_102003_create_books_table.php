<?php

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
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->string('author');
            $table->string('isbn')->nullable();
            $table->text('description')->nullable();
            $table->unsignedInteger('page_count')->nullable();
            $table->string('cover_path')->nullable();
            $table->string('file_path')->nullable();
            $table->string('file_type')->nullable();
            $table->foreignId('language_id')->nullable()->constrained()->nullOnDelete();
            $table->boolean('is_public')->default(false);
            $table->string('google_books_id')->nullable();
            $table->string('open_library_key')->nullable();
            $table->json('metadata')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};
