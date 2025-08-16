document.addEventListener('DOMContentLoaded', function () {
    const btnTodosUsuarios = document.querySelector(".btn-todos-usuarios");
    const usersContainer = document.querySelector(".users");

    const pageIndicator = document.querySelector(".page-indicator");
    const antButton = document.querySelector(".prev-btn");
    const proxButton = document.querySelector(".next-btn");
    const statsSection = document.querySelector(".stats-section");
    const sectionTitle = document.querySelector(".section-title");
    const pagination = document.querySelector(".pagination");

    let pagAtual = 1;
    let totalPags = 1;

    const pesquisa = document.getElementById("search");
    const resultado = document.querySelector(".resultados");

    function tooglePagination(show) {
        if (show) {
            statsSection.classList.add("visible");
            sectionTitle.classList.add("visible");
            pagination.classList.add("visible");
        } else {
            statsSection.classList.remove("visible");
            sectionTitle.classList.remove("visible");
            pagination.classList.remove("visible");
        }
    }

    tooglePagination(false);


    // Pesquisar Usuários por Nome
        // Pesquisar Usuários por Nome
    async function searchUsers() {
    const searchForm = document.getElementById("search-users");
    const resultado = document.querySelector(".resultados");

    if (!searchForm || !resultado) return;

    searchForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const termo = document.querySelector("input[name='buscar']").value.trim().toLowerCase();
        if (!termo) return;

        resultado.innerHTML = "<p>Buscando...</p>";

        try {
            let allUsers = [];
            let page = 1;
            let totalPages = 1;

            // Varre todas as páginas
            while (page <= totalPages) {
                const res = await fetch(`https://reqres.in/api/users?page=${page}`, {
                    headers: { 'x-api-key': 'reqres-free-v1' }
                });
                const data = await res.json();
                
                totalPages = data.total_pages;
                allUsers = [...allUsers, ...data.data];
                page++;
            }

            // Filtra localmente
            const encontrados = allUsers.filter(user => 
                user.first_name.toLowerCase().includes(termo) || 
                user.last_name.toLowerCase().includes(termo)
            );

            resultado.innerHTML = encontrados.length ? 
                encontrados.map(user => `
                    <div class="usuario-card">
                        <img src="${user.avatar}" alt="${user.first_name}">
                        <div>
                            <h3>${user.first_name} ${user.last_name}</h3>
                            <p>${user.email}</p>
                            <p>ID: ${user.id}</p>
                        </div>
                    </div>
                `).join('') : 
                '<p class="error">Nenhum usuário encontrado</p>';

        } catch (error) {
            console.error("Erro na busca:", error);
            resultado.innerHTML = '<p class="error">Erro na busca</p>';
        }
    });
}

     // Buscar todos os usuários

    const urlApi = "https://reqres.in/api/users";

    async function showUsers(page = 1) {
        try{
            const response = await fetch(`${urlApi}?page=${page}`, {
                headers: {
                    'x-api-key': 'reqres-free-v1'
                }
            })

            const usuarios = await response.json();

            tooglePagination(true);

            pagAtual = usuarios.page;
            totalPags = usuarios.total_pages;

            usersContainer.innerHTML = "";

            pageIndicator.textContent = `Página ${pagAtual} de ${totalPags}`;

            antButton.disabled = pagAtual === 1;
            proxButton.disabled = pagAtual === totalPags;

            usuarios.data.forEach(usuario => {
                const nomeUsuario = usuario.first_name + " " + usuario.last_name; 
                const idUsuario = usuario.id;
                const emailUsuario = usuario.email; 
                const avatarUsuario = usuario.avatar; 

                const usuarioHTML = `
                    <li class="lista-usuario">
                        <div class = "usuario-card">
                            <div class="img-usuario">
                                <img src="${avatarUsuario}">
                            </div>

                            <div class="info-usuario">
                                id="${idUsuario}"
                                <h3>${nomeUsuario}</h3>
                            </div>

                            <div class="email-usuario">
                                <p>${emailUsuario}</p>
                            </div>
                        </div>   
                    </li>            
                `;

                usersContainer.innerHTML += usuarioHTML;
            });           

            document.getElementById("user-count").textContent = usuarios.total;
            document.getElementById("current-page").textContent = pagAtual;
        
        }
        catch (error){
            console.error("Error:", error);
            usersContainer.innerHTML = '<li class="error">Ocorreu um erro ao buscar os usuários.</li>';
            
            tooglePagination(false);
        }
    }

    btnTodosUsuarios.addEventListener('click', () => showUsers(1));

    antButton.addEventListener('click', () => {
        if (pagAtual > 1) {
            showUsers(pagAtual - 1);
        }
    });
    proxButton.addEventListener('click', () => {
        if (pagAtual < totalPags) {
            showUsers(pagAtual + 1);
        }
    });

    showUsers(1);

    //Cria Usuário

        // Função corrigida para criar usuários
   
    async function postUser() {
    const formAddUsuario = document.querySelector(".add-user");
    const resultado = document.querySelector(".resultados");

    if (!formAddUsuario) return;

    formAddUsuario.addEventListener("submit", async (event) => {
        event.preventDefault();

        try {
            const formData = new FormData(formAddUsuario);
            const usuario = {
                name: `${formData.get("first_name")} ${formData.get("last_name")}`,
                job: "Usuário User Craft", // Campo obrigatório da API
                email: formData.get("email"),
                avatar: formData.get("avatar") || "https://reqres.in/img/faces/1-image.jpg"
            };

            if (!usuario.name || !usuario.email) {
                alert("Preencha nome e e-mail");
                return;
            }

            const response = await fetch("https://reqres.in/api/users", {
                method: "POST",
                headers: {
                    'x-api-key': 'reqres-free-v1',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: usuario.name,
                    job: usuario.job
                })
            });

            const data = await response.json();

            if (response.status === 201) {
                alert(`Sucesso! ID simulado: ${data.id}`);
                formAddUsuario.reset();
                
                // Mostra o usuário "criado" (simulação)
                resultado.innerHTML = `
                    <div class="usuario-card">
                        <img src="${usuario.avatar}" alt="${usuario.name}">
                        <div>
                            <h3>${usuario.name}</h3>
                            <p>${usuario.email}</p>
                            <p>Cargo: ${usuario.job}</p>
                            <p>ID: ${data.id} (simulado)</p>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error("Erro:", error);
            alert("Erro ao criar usuário (simulado)");
        }
    });
}

    // campos api: email, first_name, last_name, avatar

    });
