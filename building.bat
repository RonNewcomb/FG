@echo off
echo.
echo Deploying to /built/ ...

copy /y .\\src\\index.html .\\built
copy /y .\\src\\balance\\matchup.html .\\built\\balance

cd built
del /q tests\*.*
del /q game\*.
del /q interfaces\*.
for %%f in (game\*.js) do ren %%f %%~nf
for %%f in (interfaces\*.js) do ren %%f %%~nf
