@echo off
echo ====================================
echo Iniciando Servidor de Analytics
echo ====================================
echo.

cd /d %~dp0

echo Verificando arquivo .env...
if not exist ".env" (
    echo.
    echo AVISO: Arquivo .env nao encontrado!
    echo Por favor, crie o arquivo .env com as credenciais do MongoDB.
    echo Veja o arquivo SETUP.md para instrucoes.
    echo.
    pause
    exit /b 1
)

echo Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
    echo.
)

echo Iniciando servidor...
echo.
node server.js

pause

