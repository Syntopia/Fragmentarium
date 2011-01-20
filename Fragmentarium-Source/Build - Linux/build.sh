#!/bin/sh

cd ..
qmake-qt4 -project -after "CONFIG+=opengl" -after "QT+=xml opengl script"
qmake-qt4
make

cd "Build - Linux"

mkdir "Fragmentarium"
mkdir "Fragmentarium/Examples"
cp -r ../Examples/* "Fragmentarium/Examples"
mkdir "Fragmentarium/Misc"
cp -r ../Misc/* "Fragmentarium/Misc"
cp ../../trunk "Fragmentarium/Fragmentarium"

cd "Fragmentarium"
rm -rf `find . -type d -name .svn`
cd ..


