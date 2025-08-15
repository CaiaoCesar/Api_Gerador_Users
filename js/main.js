document.addEventListener('DOMContentLoaded', () => {
    const pesquisa = document.getElementById("#search");
    const resultado = document.querySelector("resultados");

    //Pesquisar Usuários
   pesquisa.addEventListener("submit", (event) =>{
        try{
            event.preventDefault();

            const termoPesquisa = event.target.querySelector("input[name=buscar]").value.trim();

            if(!termoPesquisa){
                alert("Por favor, insira um termo de pesquisa.");
                return;
            }

            const getApi = `https://reqres.in/api/users/${termoPesquisa}`;

            async function getUsers(getApi){
                const response = await fetch(getApi, {
                    headers: {
                        'x-api-key' : 'reqres-free-v1'
                    }
                });
            }

            const usuariosAchados = response.data();

            console.log(usuariosAchados);

            if(usuariosAchados.data.length === 0){
                alert("Nenhum usuário encontrado.");
            }
            else{
                resultado.innerHTML = "";

                usuariosAchados.data.forEach((usuario) => {
                    const card = document.createElement("div");
                    card.classList.add("usuario-card");
                    card.innerHTML = `
                        <div class="img-usuario">
                            <img src="${usuario.avatar}" alt="${usuario.first_name} ${usuario.last_name}">
                        </div>
                        <div class="info-usuario">
                            <h3>${usuario.first_name} ${usuario.last_name}</h3>
                            <p>${usuario.email}</p>
                        </div>
                    `;
                    resultado.appendChild(card);
                });
            }
        }
        catch(error){
            console.error("Error:", error);
            resultado.textContent = "Ocorreu um erro ao buscar os usuários.";
        }
     });

     // Buscar todos os usuários

    const urlApi = "https://reqres.in/api/users";

    async function showUsers(urlApi) {
        try{
            const response = await fetch(urlApi, {
                headers: {
                    'x-api-key': 'reqres-free-v1'
                }
            })

            const usuarios = await response.data.json();

            usuarios.forEach(usuario => {
                const nomeUsuario = usuario.first_name + " " + usuario.last_name; 
                const emailUsuario = usuario.email; 
                const avatarUsuario = usuario.avatar; 

                const usuarioHTML = `
                    <div class = "usuario-card">
                        <div class="img-usuario">
                            <img src="${avatar}">
                        </div>

                        <div class="info-usuario">
                            id="${id}"
                            <h3>${nome}</h3>
                        </div>

                        <div class="email-usuario">
                            <p>${email}</p>
                        </div>
                    </div>           
                `;

                resultado.innerHTML += usuarioHTML;
            });

            /*
            const dados = await response.json();
            console.log(dados);
            */

        
        }
        catch (error){
            console.error("Error:", error);
            resultado.textContent = "Ocorreu um erro ao buscar os usuários.";
        }
    }

    //Cria Usuário

    urlPost = "https://reqres.in/api/users/register";
    async function postUser(urlPost) {
        const response = await fetch(urlPost, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(usuario)
        });

        const formAddUsuario = document.getElementsByClassName("add-user");
        const adicionarUsuario = document.getElementById("adicionar-usuario");

        formAddUsuario.addEventListener("submit", async (event) => {
            event.preventDefault();

            const dadosForm = new dadosForm(formAddUsuario);
            const usuario = {
                id: length +1,
                first_name: dadosForm.get("first_name"),
                last_name: dadosForm.get("last_name"),
                email: dadosForm.get("email"),
                avatar: dadosForm.get("avatar")
            };

            if (!usuario.first_name || !usuario.last_name || !usuario.email || !usuario.avatar) {
                alert("Por favor, preencha todos os campos.");
                return;
            }

            try {
                const response = await fetch(urlPost, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(usuario)
                });

                if(response.data.status === 1) {
                    alert("Usuário criado com sucesso!");
                    formAddUsuario.reset();
                }
                else {
                    alert("Ocorreu um erro ao criar o usuário.");
                    console.error("Resposta da API:", response.data);
                }
            }
            catch (error) {
                console.error("Error:", error);
                resultado.textContent = "Ocorreu um erro ao criar o usuário.";
            }
        });
    }

    // campos api: email, first_name, last_name, avatar

    });
