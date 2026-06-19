#!/bin/bash

# A script to automate the full QA and release to prod process.
#
# USAGE:
# ./promote_and_release.sh <feature-branch> <version>
# Example: ./promote_and_release.sh feature/add-tags v1.1.0

# --- Configuration ---
# The name of your primary development/integration branch.
TEST_BRANCH="test"
MAIN_BRANCH="main"
DEVELOP_BRANCH="develop"

# --- Safety Checks ---
# Exit immediately if a command exits with a non-zero status.
set -e

# Check if the correct number of arguments are provided.
if [ "$#" -ne 2 ]; then
    echo "USAGE: ./promote_and_release.sh <feature-branch> <version>"
    echo "Example: ./promote_and_release.sh feature/add-tags v1.1.0"
    exit 1
fi

FEATURE_BRANCH=$1
VERSION=$2
RELEASE_BRANCH="release/$VERSION"

# --- Step 1: Merge Feature into Test Branch ---
echo "--- Step 1: Merging '$FEATURE_BRANCH' into '$TEST_BRANCH' ---"

git checkout $TEST_BRANCH
git pull origin $TEST_BRANCH
git merge --no-ff $FEATURE_BRANCH -m "Merge branch '$FEATURE_BRANCH' into $TEST_BRANCH"
git push origin $TEST_BRANCH
echo "✅ '$TEST_BRANCH' is now up-to-date with your feature."
echo

# --- Step 2: Create Release Branch ---
echo "--- Step 2: Creating release branch '$RELEASE_BRANCH' from '$TEST_BRANCH' ---"

git checkout -b $RELEASE_BRANCH $TEST_BRANCH

# Write the version to a config file
echo "<?php return ['app_version' => '$VERSION'];" > config/version.php
git add config/version.php
git commit -m "Bump version to $VERSION"

git push -u origin $RELEASE_BRANCH
echo "✅ Release branch '$RELEASE_BRANCH' created and pushed."
echo "➡️ You should now deploy this branch to production."
echo

# --- Step 3: Merge Release into Main (Post-Deployment) ---
echo "--- Step 3: Merging '$RELEASE_BRANCH' into '$MAIN_BRANCH' and tagging ---"

git checkout $MAIN_BRANCH
git pull origin $MAIN_BRANCH
if ! git merge --no-ff $RELEASE_BRANCH -m "Merge release branch '$RELEASE_BRANCH' into $MAIN_BRANCH"; then
    if [ "$(git diff --name-only --diff-filter=U)" = "config/version.php" ]; then
        echo "Auto-resolving config/version.php conflict by accepting incoming version..."
        git checkout --theirs config/version.php
        git add config/version.php
        git commit --no-edit
    else
        echo "Merge conflicts detected. Please resolve them manually."
        exit 1
    fi
fi
git tag -a $VERSION -m "Release version $VERSION"

# Generate and commit changelog
echo "Generating changelog for $VERSION..."
node generate_changelog.cjs
git add resources/js/data/changelog.js
git commit -m "Bump changelog for $VERSION"
# Force update the tag to include the changelog commit
git tag -a -f $VERSION -m "Release version $VERSION"

git push origin $MAIN_BRANCH
git push origin $VERSION
echo "✅ '$MAIN_BRANCH' is now tagged and up-to-date with release '$VERSION'."
echo

# --- Step 4: Update Develop ---
echo "--- Step 4: Updating Develop with release ---"

git checkout $DEVELOP_BRANCH
git pull origin $DEVELOP_BRANCH
if ! git merge --no-ff $MAIN_BRANCH -m "Merge branch '$MAIN_BRANCH' into $DEVELOP_BRANCH"; then
    if [ "$(git diff --name-only --diff-filter=U)" = "config/version.php" ]; then
        echo "Auto-resolving config/version.php conflict by accepting incoming version..."
        git checkout --theirs config/version.php
        git add config/version.php
        git commit --no-edit
    else
        echo "Merge conflicts detected. Please resolve them manually."
        exit 1
    fi
fi
git push origin $DEVELOP_BRANCH
echo "✅ '$DEVELOP_BRANCH' is now fully up-to-date."
echo
echo "🎉 Release process complete!"
