<?php

use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\BookController as AdminBookController;
use App\Http\Controllers\Admin\BookStagedUploadController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\GenreController;
use App\Http\Controllers\Admin\LanguageController;
use App\Http\Controllers\Admin\TagController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\BookCoverController;
use App\Http\Controllers\BookmarkController;
use App\Http\Controllers\BookSearchController;
use App\Http\Controllers\HighlightController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LibraryController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\PreferenceController;
use App\Http\Controllers\QuoteController;
use App\Http\Controllers\ReaderController;
use App\Http\Controllers\UserBookController;
use App\Http\Controllers\VocabularyController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::post('/preferences/locale', [PreferenceController::class, 'locale'])->name('preferences.locale');

Route::get('/library', [LibraryController::class, 'index'])->name('library.index');
Route::get('/books/{book}/cover', [BookCoverController::class, 'show'])->name('books.cover');
Route::get('/library/{book}', [LibraryController::class, 'show'])->name('library.show');

Route::get('/auth/google', [GoogleAuthController::class, 'redirect'])->name('auth.google.redirect');
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->name('auth.google.callback');

Route::prefix('api')->middleware('auth')->group(function (): void {
    Route::get('/books/search', [BookSearchController::class, 'search'])->name('api.books.search');
    Route::get('/books/isbn/{isbn}', [BookSearchController::class, 'isbn'])->name('api.books.isbn');
});

Route::middleware('auth')->group(function (): void {
    Route::redirect('/my-library', '/library?mine=1')->name('my-library');

    Route::get('/highlights', [HighlightController::class, 'index'])->name('highlights.index');
    Route::post('/highlights', [HighlightController::class, 'store'])->name('highlights.store');
    Route::put('/highlights/{highlight}', [HighlightController::class, 'update'])->name('highlights.update');
    Route::delete('/highlights/{highlight}', [HighlightController::class, 'destroy'])->name('highlights.destroy');

    Route::get('/notes', [NoteController::class, 'index'])->name('notes.index');
    Route::post('/notes', [NoteController::class, 'store'])->name('notes.store');
    Route::put('/notes/{note}', [NoteController::class, 'update'])->name('notes.update');
    Route::delete('/notes/{note}', [NoteController::class, 'destroy'])->name('notes.destroy');

    Route::get('/quotes', [QuoteController::class, 'index'])->name('quotes.index');
    Route::post('/quotes', [QuoteController::class, 'store'])->name('quotes.store');
    Route::put('/quotes/{quote}', [QuoteController::class, 'update'])->name('quotes.update');
    Route::delete('/quotes/{quote}', [QuoteController::class, 'destroy'])->name('quotes.destroy');

    Route::get('/vocabulary', [VocabularyController::class, 'index'])->name('vocabulary.index');
    Route::post('/vocabulary', [VocabularyController::class, 'store'])->name('vocabulary.store');
    Route::put('/vocabulary/{vocabularyItem}', [VocabularyController::class, 'update'])->name('vocabulary.update');
    Route::delete('/vocabulary/{vocabularyItem}', [VocabularyController::class, 'destroy'])->name('vocabulary.destroy');

    Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics.index');

    Route::get('/library/{book}/annotations', [LibraryController::class, 'annotations'])->name('library.annotations');

    Route::get('/read/{book}', [ReaderController::class, 'show'])->name('reader.show');
    Route::get('/read/{book}/file', [ReaderController::class, 'file'])->name('reader.file');
    Route::patch('/read/{book}/progress', [ReaderController::class, 'updateProgress'])->name('reader.progress');
    Route::post('/read/{book}/chapters', [ReaderController::class, 'storeChapters'])->name('reader.chapters.store');

    Route::post('/user-books', [UserBookController::class, 'create'])->name('user-books.create');
    Route::post('/library/{book}', [UserBookController::class, 'store'])->name('user-books.store');
    Route::patch('/user-books/{userBook}', [UserBookController::class, 'update'])->name('user-books.update');
    Route::delete('/user-books/{userBook}', [UserBookController::class, 'destroy'])->name('user-books.destroy');
    Route::post('/user-books/{userBook}/bookmark', [BookmarkController::class, 'store'])->name('user-books.bookmark.store');
});

Route::prefix('admin')
    ->middleware(['auth', 'admin'])
    ->name('admin.')
    ->group(function (): void {
        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

        Route::post('books/uploads/process', [BookStagedUploadController::class, 'process'])
            ->name('books.uploads.process');
        Route::delete('books/uploads/revert', [BookStagedUploadController::class, 'revert'])
            ->name('books.uploads.revert');

        Route::resource('books', AdminBookController::class);
        Route::resource('users', AdminUserController::class);
        Route::resource('genres', GenreController::class)->except(['show']);
        Route::resource('languages', LanguageController::class)->except(['show']);
        Route::resource('tags', TagController::class)->except(['show']);
        Route::resource('activity-logs', ActivityLogController::class)->only(['index', 'show']);
    });
