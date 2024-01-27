mkdir -p dump$1
cd dump$1

spim -dump -delayed_branches -notrap -file ../$1

cut -c16-23 text.asm > hex.txt
sed -i '1,2d' hex.txt

cd ..
mv dump$1/hex.txt $2
rm -rf dump$1