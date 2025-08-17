# API Gerador de Usuários

## Autor
**Nome Completo:** [Caio César Oliveira Silva]

## Descrição do Projeto
Este projeto é um sistema de gerenciamento de usuários que consome a API pública do ReqRes (https://reqres.in/), permitindo:

- Listagem de usuários
- Adição de novos usuários
- Edição de informações
- Exclusão de registros

O objetivo é demonstrar a integração com APIs RESTful utilizando tecnologias web modernas.

## Tecnologias Utilizadas
- **Frontend:**
  - HTML5
  - CSS3
  - JavaScript (ES6+)
- **Armazenamento:**
  - LocalStorage (para persistência local de dados)
- **Ferramentas:**
  - Git/GitHub (controle de versão)
  - ReqRes API (API pública)

## Endpoints Utilizados

| Página         | Tipo Requisição | Endpoint                     | Descrição                           |
|----------------|-----------------|------------------------------|-------------------------------------|
| index.html     | GET             | /api/users?page=1            | Lista todos os usuários             |
| index.html     | DELETE          | /api/users/:id               | Remove um usuário                   |
| edit.html      | GET             | /api/users/:id               | Busca dados de um usuário           |
| edit.html      | PUT             | /api/users/:id               | Atualiza dados de um usuário        |
| add.html       | POST            | /api/users                   | Cria um novo usuário                |
| delete.html    | DELETE          | /api/users/:id               | Remove um usuário                   |

## Funcionalidades por Página
1. **index.html** - Listagem completa de usuários com paginação
2. **add.html** - Formulário para criação de novos usuários
3. **edit.html** - Edição de informações dos usuários existentes
4. **delete.html** - Confirmação e remoção de usuários

## Créditos e Referências
- **API Utilizada:** [ReqRes](https://reqres.in/) - API REST pública para testes
- **Canais de Referência:**
  - [Programação Web](https://www.youtube.com/@programacaoweb)
  - [CFB Cursos](https://www.youtube.com/@cfbcursos)
  - [Manipulando a Reqres](https://youtu.be/mxlNGxTYW2I?si=s1zT7kWCE6yZ1gf0)

## Como Executar
1. Clone o repositório
2. Abra os arquivos HTML diretamente no navegador
3. Interaja com as diferentes funcionalidades

## Melhorias Futuras
- [ ] Adicionar autenticação
- [ ] Implementar busca avançada
- [ ] Aprimorar a versão mobile responsiva

Este projeto foi desenvolvido como parte da atividade de integração do Frontend com APIs públicas.