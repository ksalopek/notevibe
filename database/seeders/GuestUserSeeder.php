<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Folder;
use App\Models\Tag;
use App\Models\Note;
use App\Models\Template;
use Illuminate\Support\Facades\Hash;

class GuestUserSeeder extends Seeder
{
    public function run()
    {
        // 1. Create or get Guest User
        $user = User::firstOrCreate(
            ['email' => 'guest@example.com'],
            [
                'name' => 'Guest User',
                'password' => Hash::make('password'),
                'is_active' => true,
            ]
        );

        // Clear existing data for this user to avoid duplicates if run multiple times
        $user->notes()->forceDelete(); // forceDelete since notes use SoftDeletes
        $user->folders()->delete();
        $user->tags()->delete();
        $user->templates()->delete();

        // 2. Create Folders
        $folders = [
            ['name' => 'Work Projects', 'color' => '#3b82f6'], // blue
            ['name' => 'Meeting Notes', 'color' => '#8b5cf6'], // purple
            ['name' => 'Personal', 'color' => '#10b981'], // green
            ['name' => 'Ideas & Brainstorming', 'color' => '#f59e0b'], // yellow
            ['name' => 'Recipes', 'color' => '#ef4444'], // red
        ];
        $folderModels = [];
        foreach ($folders as $f) {
            $folderModels[] = $user->folders()->create($f);
        }

        // 3. Create Tags
        $tags = [
            ['name' => 'Urgent', 'color' => '#ef4444'],
            ['name' => 'In Progress', 'color' => '#3b82f6'],
            ['name' => 'Completed', 'color' => '#10b981'],
            ['name' => 'Review Needed', 'color' => '#f59e0b'],
            ['name' => 'Reference', 'color' => '#6b7280'],
            ['name' => 'Frontend', 'color' => '#06b6d4'],
            ['name' => 'Backend', 'color' => '#8b5cf6'],
        ];
        $tagModels = [];
        foreach ($tags as $t) {
            $tagModels[] = $user->tags()->create($t);
        }

        // 4. Create Templates
        $user->templates()->create([
            'name' => 'Daily Standup',
            'content' => "### What did I do yesterday?\n- \n\n### What will I do today?\n- \n\n### Any blockers?\n- None"
        ]);
        $user->templates()->create([
            'name' => 'Meeting Minutes',
            'content' => "### Date:\n### Attendees:\n\n### Agenda:\n1. \n\n### Action Items:\n- [ ] "
        ]);

        // 5. Create Realistic Notes
        $detailedNotes = [
            [
                'title' => 'Q3 Roadmap Planning',
                'content' => "## Q3 Goals\n\n- Launch the new user dashboard.\n- Improve API response times by 20%.\n- Complete security audit.\n\n### Key Milestones\n| Date | Milestone | Status |\n|---|---|---|\n| July 15 | Dashboard Beta | In Progress |\n| Aug 1 | API Optimization | Planned |\n| Sept 15 | Security Sign-off | Not Started |\n\nNeed to sync with the design team next week about the new UI components.",
                'folder_id' => $folderModels[0]->id,
                'is_pinned' => true,
                'tags' => [0, 1] // Urgent, In Progress
            ],
            [
                'title' => 'Team Sync - 07/02/2026',
                'content' => "### Attendees\n- Alice\n- Bob\n- Charlie\n- Guest\n\n### Notes\nAlice reported that the backend migration is 80% complete. We hit a snag with the database indexing, but Charlie is looking into it.\n\n### Action Items\n- [x] Review PR #1042\n- [ ] Schedule follow-up with DevOps\n- [ ] Update documentation for new endpoint",
                'folder_id' => $folderModels[1]->id,
                'is_pinned' => false,
                'tags' => [4, 6] // Reference, Backend
            ],
            [
                'title' => 'Grocery List',
                'content' => "- [ ] Almond Milk\n- [ ] Eggs\n- [ ] Spinach\n- [ ] Chicken breast\n- [ ] Coffee beans (dark roast)\n- [ ] Avocado\n\n*Note to self: Try to get the organic spinach this time.*",
                'folder_id' => $folderModels[2]->id,
                'is_pinned' => false,
                'tags' => []
            ],
            [
                'title' => 'App Idea: Pet Matcher',
                'content' => "A mobile app that matches rescue animals with potential adopters based on lifestyle.\n\n**Features:**\n- Tinder-like swiping interface for pets.\n- Questionnaire for adopters (activity level, home size, other pets).\n- Direct messaging with shelters.\n\n*Monetization:* Premium features for shelters to promote pets?",
                'folder_id' => $folderModels[3]->id,
                'is_pinned' => true,
                'tags' => [3, 5] // Review Needed, Frontend
            ],
            [
                'title' => 'Grandma\'s Lasagna',
                'content' => "### Ingredients\n- 1 lb ground beef\n- 1 onion, chopped\n- 2 cloves garlic, minced\n- 1 (28 oz) can crushed tomatoes\n- 2 cans tomato paste\n- 1 box lasagna noodles\n- 15 oz ricotta cheese\n- 3 cups mozzarella\n\n### Instructions\n1. Cook meat, onion, and garlic.\n2. Stir in tomatoes and paste. Simmer 1 hour.\n3. Layer noodles, meat sauce, ricotta, and mozzarella.\n4. Bake at 375°F for 25 minutes.",
                'folder_id' => $folderModels[4]->id,
                'is_pinned' => false,
                'tags' => [4] // Reference
            ],
            [
                'title' => 'React component optimization',
                'content' => "We need to use `useMemo` and `useCallback` more effectively in the `Dashboard` component. It's re-rendering too often when the search input changes.\n\n```javascript\nconst memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);\n```\nLet's apply this to the data table sorting logic.",
                'folder_id' => $folderModels[0]->id,
                'is_pinned' => false,
                'tags' => [5] // Frontend
            ],
            [
                'title' => 'Marketing Strategy 2026',
                'content' => "Focus on organic growth and SEO for the first two quarters. \n\n1. Publish 2 long-form articles per week.\n2. Re-vamp the landing page copy.\n3. Partner with influencers in the tech space.\n\nBudget allocation: $5,000/mo.",
                'folder_id' => $folderModels[0]->id,
                'is_pinned' => false,
                'tags' => [1] // In Progress
            ],
            [
                'title' => 'Must-watch movies',
                'content' => "- Dune: Part Two\n- Spider-Man: Across the Spider-Verse\n- Oppenheimer\n- The Batman\n- Everything Everywhere All at Once\n\nI need to re-watch Inception soon.",
                'folder_id' => $folderModels[2]->id,
                'is_pinned' => false,
                'tags' => []
            ],
        ];

        foreach ($detailedNotes as $dn) {
            $note = $user->notes()->create([
                'title' => $dn['title'],
                'content' => $dn['content'],
                'folder_id' => $dn['folder_id'],
                'is_pinned' => $dn['is_pinned'],
            ]);
            
            if (!empty($dn['tags'])) {
                $tagsToAttach = array_map(function($idx) use ($tagModels) {
                    return $tagModels[$idx]->id;
                }, $dn['tags']);
                $note->tags()->attach($tagsToAttach);
            }
        }

        // Fill the rest with hardcoded random data to reach about 48 notes without Faker
        $sampleTitles = ['Meeting notes', 'Project update', 'Random thoughts', 'To-Do list', 'Weekly review', 'Client feedback', 'Bug report', 'Feature request', 'Research', 'Code review'];
        $sampleParagraphs = [
            'We discussed the new UI changes and agreed to proceed.',
            'The backend API is almost ready, just need to finalize endpoints.',
            'Need to review the pull requests before merging to main.',
            'Performance is looking great after the database optimization.',
            'Client wants to change the color scheme, we need to schedule a meeting.',
            'Make sure to update the documentation by Friday.'
        ];
        $sampleWords = ['test', 'implement', 'deploy', 'review', 'fix', 'refactor', 'design', 'document', 'update', 'build'];

        for ($i = 0; $i < 40; $i++) {
            $folder = $folderModels[array_rand($folderModels)];
            
            $numParagraphs = mt_rand(1, 4);
            $paragraphs = [];
            for ($p = 0; $p < $numParagraphs; $p++) {
                $paragraphs[] = $sampleParagraphs[array_rand($sampleParagraphs)];
            }
            $content = "### " . $sampleTitles[array_rand($sampleTitles)] . "\n\n" . implode("\n\n", $paragraphs);
            
            // Randomly insert a list or code block
            $randChoice = mt_rand(1, 100);
            if ($randChoice <= 30) {
                 $listItems = [];
                 for ($l = 0; $l < 4; $l++) {
                     $listItems[] = $sampleWords[array_rand($sampleWords)];
                 }
                 $content .= "\n\n- " . implode("\n- ", $listItems);
            } else if ($randChoice <= 50) {
                 $content .= "\n\n```\n// Sample code\nfunction " . $sampleWords[array_rand($sampleWords)] . "() {\n    return true;\n}\n```";
            }
            
            $numWordsTitle = mt_rand(2, 4);
            $titleWords = [];
            for ($t = 0; $t < $numWordsTitle; $t++) {
                $titleWords[] = $sampleWords[array_rand($sampleWords)];
            }

            $note = $user->notes()->create([
                'title' => ucfirst(implode(' ', $titleWords)),
                'content' => $content,
                'folder_id' => $folder->id,
                'is_pinned' => mt_rand(1, 100) <= 10, // 10% chance to be pinned
                'is_archived' => mt_rand(1, 100) <= 15, // 15% chance to be archived
            ]);

            // Assign 0 to 3 random tags
            $numTags = mt_rand(0, 3);
            if ($numTags > 0) {
                $tagKeys = array_rand($tagModels, $numTags);
                if (!is_array($tagKeys)) {
                    $tagKeys = [$tagKeys];
                }
                $tagIds = [];
                foreach ($tagKeys as $k) {
                    $tagIds[] = $tagModels[$k]->id;
                }
                $note->tags()->attach($tagIds);
            }
        }
    }
}
