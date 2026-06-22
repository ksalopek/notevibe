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
        Schema::table('tags', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('color')->nullable();
        });

        // Assign users to existing tags
        $tags = \Illuminate\Support\Facades\DB::table('tags')->get();
        foreach ($tags as $tag) {
            $noteTag = \Illuminate\Support\Facades\DB::table('note_tag')
                ->join('notes', 'note_tag.note_id', '=', 'notes.id')
                ->where('note_tag.tag_id', $tag->id)
                ->first();

            if ($noteTag) {
                \Illuminate\Support\Facades\DB::table('tags')->where('id', $tag->id)->update(['user_id' => $noteTag->user_id]);
            } else {
                \Illuminate\Support\Facades\DB::table('tags')->where('id', $tag->id)->delete();
            }
        }

        // Now drop old unique and add new
        Schema::table('tags', function (Blueprint $table) {
            $table->dropUnique('tags_name_unique');
            $table->unique(['user_id', 'name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tags', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'name']);
            $table->unique('name', 'tags_name_unique');
            $table->dropForeign(['user_id']);
            $table->dropColumn(['user_id', 'color']);
        });
    }
};
