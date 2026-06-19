const { execSync } = require('child_process');
const fs = require('fs');

const tagsOutput = execSync('git tag -l --sort=-v:refname', { encoding: 'utf-8' });
const tags = tagsOutput.split('\n').map(t => t.trim()).filter(t => t && /^v\d+\.\d+\.\d+$/.test(t));

const changelog = [];

for (let i = 0; i < tags.length; i++) {
    const currentTag = tags[i];
    // Next tag in the sorted list is the previous version chronologically
    const prevTag = i + 1 < tags.length ? tags[i + 1] : null;

    // Get the date of the tag
    const dateOutput = execSync(`git log -1 --format=%ai ${currentTag}`, { encoding: 'utf-8' });
    const date = dateOutput.split(' ')[0]; // just the YYYY-MM-DD

    // Get the commits
    const range = prevTag ? `${prevTag}..${currentTag}` : currentTag;
    const logOutput = execSync(`git log ${range} --oneline`, { encoding: 'utf-8' });
    
    const commits = logOutput.split('\n').map(l => l.trim()).filter(l => l);
    
    const features = [];
    const fixes = [];
    
    commits.forEach(commit => {
        // remove hash
        const msg = commit.substring(commit.indexOf(' ') + 1);
        const lower = msg.toLowerCase();
        
        if (lower.startsWith('merge') || lower.startsWith('bump version')) return;
        
        if (lower.includes('fix') || lower.includes('bug') || lower.includes('resolve')) {
            fixes.push(msg);
        } else {
            // treat as feature/enhancement
            features.push(msg);
        }
    });
    
    if (features.length > 0 || fixes.length > 0) {
        changelog.push({
            version: currentTag,
            date: date,
            features: features,
            fixes: fixes
        });
    }
}

// Write to changelog.js
const fileContent = `export const changelogData = ${JSON.stringify(changelog, null, 4)};\n`;
fs.writeFileSync('./resources/js/data/changelog.js', fileContent);
console.log('Changelog generated successfully!');
