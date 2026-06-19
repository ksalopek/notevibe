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
        if (DB::connection()->getDriverName() === 'sqlite') {
            DB::statement("DROP TRIGGER IF EXISTS notes_au");
            DB::statement("DROP TRIGGER IF EXISTS notes_ad");
            DB::statement("DROP TRIGGER IF EXISTS notes_ai");
            DB::statement("DROP TABLE IF EXISTS notes_fts");
        } elseif (DB::connection()->getDriverName() === 'mysql') {
            Schema::table('notes', function (Blueprint $table) {
                // Ignore error if it doesn't exist
                try {
                    $table->dropFullText('notes_fulltext');
                } catch (\Exception $e) {}
            });
        }

        Schema::table('notes', function (Blueprint $table) {
            $table->dropColumn('notes');
        });

        if (DB::connection()->getDriverName() === 'sqlite') {
            DB::statement("CREATE VIRTUAL TABLE notes_fts USING fts5(title, content, content='notes', content_rowid='id')");
            
            DB::statement("
                CREATE TRIGGER notes_ai AFTER INSERT ON notes BEGIN
                  INSERT INTO notes_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
                END;
            ");
            
            DB::statement("
                CREATE TRIGGER notes_ad AFTER DELETE ON notes BEGIN
                  INSERT INTO notes_fts(notes_fts, rowid, title, content) VALUES('delete', old.id, old.title, old.content);
                END;
            ");
            
            DB::statement("
                CREATE TRIGGER notes_au AFTER UPDATE ON notes BEGIN
                  INSERT INTO notes_fts(notes_fts, rowid, title, content) VALUES('delete', old.id, old.title, old.content);
                  INSERT INTO notes_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
                END;
            ");

            DB::statement("INSERT INTO notes_fts(notes_fts) VALUES('rebuild')");
        } elseif (DB::connection()->getDriverName() === 'mysql') {
            Schema::table('notes', function (Blueprint $table) {
                $table->fullText(['title', 'content'], 'notes_fulltext');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->text('notes')->nullable();
        });
        
        // Re-add FTS stuff for down method
        if (DB::connection()->getDriverName() === 'sqlite') {
            DB::statement("DROP TRIGGER IF EXISTS notes_au");
            DB::statement("DROP TRIGGER IF EXISTS notes_ad");
            DB::statement("DROP TRIGGER IF EXISTS notes_ai");
            DB::statement("DROP TABLE IF EXISTS notes_fts");
            
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
        } elseif (DB::connection()->getDriverName() === 'mysql') {
            Schema::table('notes', function (Blueprint $table) {
                try {
                    $table->dropFullText('notes_fulltext');
                } catch (\Exception $e) {}
                $table->fullText(['title', 'content', 'notes'], 'notes_fulltext');
            });
        }
    }
};
