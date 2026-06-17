#!/bin/bash
git checkout develop
git pull origin develop

for branch in $(git branch --format='%(refname:short)' | grep -E "^(feature|hotfix)/"); do
    echo "======================================"
    echo "Syncing $branch"
    echo "======================================"
    git checkout "$branch"
    if ! git merge develop -m "Sync with latest develop"; then
        echo "Merge conflict on $branch. Aborting merge."
        git merge --abort
    else
        git push origin "$branch"
    fi
done
git checkout develop
echo "Done syncing local branches."
