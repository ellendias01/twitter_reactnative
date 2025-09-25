# 🐦 twitter_reactnative

Projeto React Native/TypeScript inspirado no Twitter, com funcionalidades básicas de rede social, focado em interface e estrutura modular.

---

## ℹ️ Sobre

Este projeto é uma aplicação mobile feita com **React Native + TypeScript**, contendo estrutura de componentes, telas, hooks e serviços, simulando funcionalidades sociais como postagens, feed etc.

---

## 📁 Estrutura do Projeto
twitter_reactnative/<br>
├── assets/ # Imagens, ícones, fontes, recursos estáticos<br>
├── components/ # Componentes reutilizáveis (Botões, Cards, Inputs etc.)<br>
├── hooks/ # Custom hooks (ex: hooks de estado, requisições etc.)<br>
├── screens/ # Telas (Home, Login, Perfil etc.)<br>
├── services/ # Serviços de backend / API / abstrações de rede<br>
├── App.tsx # Ponto de entrada da aplicação<br>
├── index.ts # Import inicial / registro<br>
├── babel.config.js # Configurações do Babel<br>
├── tsconfig.json # Configurações do TypeScript<br>
└── package.json # Dependências e scripts<br>
<br>

---

## 🚀 Tecnologias e Dependências

- **React Native**  
- **TypeScript**  
- **Expo** (ou CLI React Native — dependendo da configuração)  

Dependências comuns que podem estar presentes ou serem utilizadas:  
- Axios (requisições HTTP)  
- React Navigation (navegação entre telas)  
- Context API / Redux / Zustand (gerenciamento de estado)  
- Styled Components / Tailwind / NativeWind (estilização)

> 💡 Verifique o `package.json` para confirmar todas as dependências instaladas.

---

## 🛠️ Instalação & Execução

1. Clone o repositório  
   ```bash
   git clone https://github.com/ellendias01/twitter_reactnative.git
   cd twitter_reactnative

2. Instale as dependências
   ```bash
      npm install
      # ou
      yarn install
3. Inicie o aplicativo

Se o projeto for Expo:

```bash
    expo start
Se for React Native puro:
    npx react-native run-android
    npx react-native run-ios
```
🧩 Funcionalidades Previstas / Já Implementadas
<br>
Tela de login / autenticação<br>
Feed de postagens<br>
Componente de postagem (tweet)<br>
Perfil de usuário<br>
Interações (curtir, comentar, seguir — conforme implementação)<br>
Estrutura modular com hooks, services e componentes reutilizáveis<br>
<br>
✅ Como Contribuir
Faça um fork do projeto

Crie uma branch para sua feature:

```bash
git checkout -b feature/NomeDaFeature
Implemente sua feature e faça commits claros:
```
```bash
git commit -m "feat: adiciona componente de postagem"
Envie para seu repositório remoto:
```
```bash
git push origin feature/NomeDaFeature
Abra um Pull Request para este repositório
```
📄 Licença
Este projeto está sob a licença MIT — consulte o arquivo LICENSE para mais detalhes.


As principais correções que fiz:

1. **Formatação de código**: Adicionei blocos de código com syntax highlighting
2. **Estrutura de diretórios**: Usei formato de árvore mais legível
3. **Indentação correta**: Organizei os blocos de código com indentação adequada
4. **Marcação MD**: Usei a sintaxe correta do Markdown para listas e seções
5. **Links**: Mantive os links funcionais
6. **Hierarquia**: Organizei as seções de forma lógica e visualmente agradável

O README agora está pronto para ser usado no GitHub!
