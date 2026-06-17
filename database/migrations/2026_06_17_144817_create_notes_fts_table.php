<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("CREATE VIRTUAL TABLE notes_fts USING fts5(title, content, notes, content='notes', content_rowid='id')");
        
        DB::statement("
            CREATE TRIGGER notes_ai AFTER INSERT ON notes BEGIN
              INSERT INTO notes_fts(rowid, title, content, notes) VALUES (new.id, new.title, new.content, new.notes);
            END;
        ");
        
        DB::statement("
            CREATE TRIGGER notes_ad AFTER DELETE ON notes BEGIN
              INSERT INTO notes_fts(notes_fts, rowid, title, content, notes) VALUES('delete', old.id, old.title, old.content, old.notes);
            END;
        ");
        
        DB::statement("
            CREATE TRIGGER notes_au AFTER UPDATE ON notes BEGIN
              INSERT INTO notes_fts(notes_fts, rowid, title, content, notes) VALUES('delete', old.id, old.title, old.content, old.notes);
              INSERT INTO notes_fts(rowid, title, content, notes) VALUES (new.id, new.title, new.content, new.notes);
            END;
        ");

        DB::statement("INSERT INTO notes_fts(notes_fts) VALUES('rebuild')");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("DROP TRIGGER IF EXISTS notes_au");
        DB::statement("DROP TRIGGER IF EXISTS notes_ad");
        DB::statement("DROP TRIGGER IF EXISTS notes_ai");
        DB::statement("DROP TABLE IF EXISTS notes_fts");
    }
};
