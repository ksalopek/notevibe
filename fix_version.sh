#!/bin/bash
set -e

# Delete old tag
git push origin --delete v2.18.5 || true
git tag -d v2.18.5 || true

# Switch to main and pull latest
git checkout main
git pull origin main

# Update version config
echo "<?php return ['app_version' => 'v2.19.1'];" > config/version.php
git add config/version.php
git commit -m "Bump version to v2.19.1"

# Initial tag for changelog script
git tag -a v2.19.1 -m "Release version v2.19.1"

# Generate changelog
node generate_changelog.cjs
git add resources/js/data/changelog.js
git commit -m "Bump changelog for v2.19.1"

# Overwrite tag with changelog included
git tag -a -f v2.19.1 -m "Release version v2.19.1"

# Push main and new tag
git push origin main
git push origin v2.19.1

# Sync develop
git checkout develop
git pull origin develop
git merge --no-ff main -m "Merge branch 'main' into develop"
git push origin develop

echo "Fix completed!"
