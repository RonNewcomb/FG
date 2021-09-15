@echo off
echo.
echo Deploying to /built/ ...

copy /y .\\src\\index.html .\\built

cd built
del *.test
del *.
for %%f in (*.js) do ren %%f %%~nf
