## this script is to update for major/minor updates
## the input version format should be like: 1.0 or 0.12
VERSION=$1

echo "Processing variables"
cp variables/variables-nightly.ts variables/variables-$VERSION.ts
sed -i "s/greptimedbVersion: 'v[^']*'/greptimedbVersion: 'v$VERSION.0'/" variables/variables-$VERSION.ts

echo "Processing localized sidebars"
cp i18n/zh/docusaurus-plugin-content-docs/current.json i18n/zh/docusaurus-plugin-content-docs/version-$VERSION.json
jq 'del(.["version.label"])' i18n/zh/docusaurus-plugin-content-docs/version-$VERSION.json > temp.json && mv temp.json i18n/zh/docusaurus-plugin-content-docs/version-$VERSION.json

echo "Removing greptimecloud content from current version"
CURRENT_VERSION=$(jq -r '.[0]' versions.json)
rm -rf versioned_docs/version-$CURRENT_VERSION/greptimecloud
rm -rf i18n/zh/docusaurus-plugin-content-docs/version-$CURRENT_VERSION/greptimecloud
jq 'del(.docs[] | select(.label == "GreptimeCloud"))' versioned_sidebars/version-$CURRENT_VERSION-sidebars.json > temp.json && mv temp.json versioned_sidebars/version-$CURRENT_VERSION-sidebars.json
sed -i '/^- \[GreptimeCloud\]/d' versioned_docs/version-$CURRENT_VERSION/index.md
sed -i '/^- \[GreptimeCloud\]/d' i18n/zh/docusaurus-plugin-content-docs/version-$CURRENT_VERSION/index.md

echo "Generating new version"
npm run docusaurus docs:version $VERSION

# echo "Removing oldest version"
# OLDEST_VERSION=$(jq -r '.[-1]' versions.json)
# rm -rf versioned_docs/version-$OLDEST_VERSION
# rm -rf i18n/zh/docusaurus-plugin-content-docs/version-$OLDEST_VERSION/
# rm i18n/zh/docusaurus-plugin-content-docs/version-$OLDEST_VERSION.json
# rm versioned_sidebars/version-$OLDEST_VERSION-sidebars.json
# jq '.[:-1]' versions.json > temp.json && mv temp.json versions.json

# echo "Set new default"
# npm run docusaurus docs:use-version $VERSION
