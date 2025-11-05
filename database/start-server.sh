#!/bin/bash

echo "===================================="
echo "Iniciando Servidor de Analytics"
echo "===================================="
echo ""

cd "$(dirname "$0")"

echo "Verificando arquivo .env..."
if [ ! -f ".env" ]; then
    echo ""
    echo "AVISO: Arquivo .env não encontrado!"
    echo "Por favor, crie o arquivo .env com as credenciais do MongoDB."
    echo "Veja o arquivo SETUP.md para instruções."
    echo ""
    exit 1
fi

echo "Verificando dependências..."
if [ ! -d "node_modules" ]; then
    echo "Instalando dependências..."
    npm install
    echo ""
fi

echo "Iniciando servidor..."
echo ""
node server.js

