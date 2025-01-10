## this script is to update for minor updates
## the input version format should be like: 1.0.2 or 0.12.2
VERSION=$1

echo "Processing variables"
MAJOR_VERSION=$(echo $VERSION | sed -E 's/^([0-9]+\.[0-9]+)\..*/\1/')
sed -i "s/greptimedbVersion: 'v[^']*'/greptimedbVersion: 'v$VERSION'/" variables/variables-$MAJOR_VERSION.ts
sed -i "s/greptimedbVersion: 'v[^']*'/greptimedbVersion: 'v$VERSION'/" variables/variables-nightly.ts

