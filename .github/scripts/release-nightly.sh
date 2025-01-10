## this script is to update for nightly updates
## the input version format should be like: 0.12.0-nightly-20250106
VERSION=$1

echo "Processing variables"
sed -i "s/greptimedbVersion: 'v[^']*'/greptimedbVersion: 'v$VERSION'/" variables/variables-nightly.ts

