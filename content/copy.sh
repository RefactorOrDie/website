PREV=$PWD
cd $(dirname $0)

echo $PWD
rm -rf json/*

cp -R ./_json/* ./json/
cp -R ./video ./json/

find ./json -type f -name "*.md" | xargs sed -i '' 's/type/lastType/g'
# Debug...
# based on https://unix.stackexchange.com/questions/26284/how-can-i-use-sed-to-replace-a-multi-line-string
find ./json -type f -name "*.md" | xargs perl -0777 -pi -e 's/\n---/\n---\nLoaded from JSON version./'

cd $PREV
