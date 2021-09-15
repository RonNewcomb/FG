copy /y .\\src\\index.html .\\built

cd built

for %%f in (*.js) do ren %%f %%~nf
