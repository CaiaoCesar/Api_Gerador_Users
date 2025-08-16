document.addEventListener("DOMContentLoaded", function () {
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

      const termo = document
        .querySelector("input[name='buscar']")
        .value.trim()
        .toLowerCase();
      if (!termo) return;

      resultado.innerHTML = "<p>Buscando...</p>";

      try {
        let allUsers = [];
        let page = 1;
        let totalPages = 1;

        // Varre todas as páginas
        while (page <= totalPages) {
          const res = await fetch(`https://reqres.in/api/users?page=${page}`, {
            headers: { "x-api-key": "reqres-free-v1" },
          });
          const data = await res.json();

          totalPages = data.total_pages;
          allUsers = [...allUsers, ...data.data];
          page++;
        }

        // Filtra localmente
        const encontrados = allUsers.filter(
          (user) =>
            user.first_name.toLowerCase().includes(termo) ||
            user.last_name.toLowerCase().includes(termo)
        );

        resultado.innerHTML = encontrados.length
          ? encontrados
              .map(
                (user) => `
                        <div class="usuario-card">
                            <img src="${user.avatar}" alt="${user.first_name}">
                            <div>
                                <h3>${user.first_name} ${user.last_name}</h3>
                                <p>${user.email}</p>
                                <p>ID: ${user.id}</p>
                            </div>
                        </div>
                    `
              )
              .join("")
          : '<p class="error">Nenhum usuário encontrado</p>';
      } catch (error) {
        console.error("Erro na busca:", error);
        resultado.innerHTML = '<p class="error">Erro na busca</p>';
      }
    });
  }

  // Buscar todos os usuários

  const urlApi = "https://reqres.in/api/users";

  async function showUsers(page = 1) {
    try {
      const response = await fetch(`${urlApi}?page=${page}`, {
        headers: {
          "x-api-key": "reqres-free-v1",
        },
      });

      const usuarios = await response.json();

      tooglePagination(true);

      pagAtual = usuarios.page;
      totalPags = usuarios.total_pages;

      usersContainer.innerHTML = "";

      pageIndicator.textContent = `Página ${pagAtual} de ${totalPags}`;

      antButton.disabled = pagAtual === 1;
      proxButton.disabled = pagAtual === totalPags;

      usuarios.data.forEach((usuario) => {
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

        usersContainer.innerHTML = usuarios.data
          .map(
            (usuario) => `
                    <li class="lista-usuario">
                        <div class="usuario-card" data-id="${usuario.id}">
                            <div class="img-usuario">
                                <img src="${usuario.avatar}">
                            </div>
                            <div class="info-usuario">
                                <h3>${usuario.first_name} ${usuario.last_name}</h3>
                                <div class="email-usuario">
                                    <p>${usuario.email}</p>
                                </div>
                            </div>
                            <div class="user-actions">
                                <button class="edit-btn">✏️ Editar</button>
                                <button class="delete-btn">🗑️ Remover</button>
                            </div>
                        </div>
                    </li>
                `
          )
          .join("");
      });

      document.getElementById("user-count").textContent = usuarios.total;
      document.getElementById("current-page").textContent = pagAtual;
    } catch (error) {
      console.error("Error:", error);
      usersContainer.innerHTML =
        '<li class="error">Ocorreu um erro ao buscar os usuários.</li>';

      tooglePagination(false);
    }
  }

  btnTodosUsuarios.addEventListener("click", () => showUsers(1));

  antButton.addEventListener("click", () => {
    if (pagAtual > 1) {
      showUsers(pagAtual - 1);
    }
  });
  proxButton.addEventListener("click", () => {
    if (pagAtual < totalPags) {
      showUsers(pagAtual + 1);
    }
  });

  showUsers(1);

  //Atualiza Usuário:

  async function setupUserUpdate() {
    const usersContainer = document.querySelector(".users");

    usersContainer.addEventListener("click", async (e) => {
      // Verifica se o clique foi no botão de editar
      if (e.target.classList.contains("edit-btn")) {
        const card = e.target.closest(".usuario-card");
        const userId = card.dataset.id;

        // Pede novos dados ao usuário
        const newName = prompt(
          "Novo nome completo:",
          card.querySelector("h3").textContent
        );
        const newEmail = prompt(
          "Novo email:",
          card.querySelector(".email-usuario p").textContent
        );

        if (newName && newEmail) {
          try {
            // 1. Atualização simulada na API ReqRes
            const response = await fetch(
              `https://reqres.in/api/users/${userId}`,
              {
                method: "PUT",
                headers: {
                  "x-api-key": "reqres-free-v1",
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  name: newName,
                  job: "Usuário atualizado",
                }),
              }
            );

            const updatedUser = await response.json();

            // 2. Atualização local
            const localUsers =
              JSON.parse(localStorage.getItem("userCraftUsers")) || [];
            const userIndex = localUsers.findIndex((u) => u.id == userId);

            if (userIndex !== -1) {
              const [firstName, lastName] = newName.split(" ");
              localUsers[userIndex] = {
                ...localUsers[userIndex],
                first_name: firstName,
                last_name: lastName || "",
                email: newEmail,
              };
              localStorage.setItem(
                "userCraftUsers",
                JSON.stringify(localUsers)
              );
            }

            alert("Usuário atualizado!");
            showLocalUsers(); // Atualiza a exibição
          } catch (error) {
            console.error("Erro ao atualizar:", error);
            alert("Erro ao atualizar usuário");
          }
        }
      }
    });
  }

  //Apaga Usuario:

  async function setupUserDeletion() {
    const usersContainer = document.querySelector(".users");

    usersContainer.addEventListener("click", async (e) => {
      // Verifica se o clique foi no botão de deletar
      if (e.target.classList.contains("delete-btn")) {
        const card = e.target.closest(".usuario-card");
        const userId = card.dataset.id;

        if (confirm("Tem certeza que deseja remover este usuário?")) {
          try {
            // 1. Remoção simulada na API ReqRes
            const response = await fetch(
              `https://reqres.in/api/users/${userId}`,
              {
                method: "DELETE",
                headers: { "x-api-key": "reqres-free-v1" },
              }
            );

            // 2. Remoção local
            const localUsers =
              JSON.parse(localStorage.getItem("userCraftUsers")) || [];
            const updatedUsers = localUsers.filter((u) => u.id != userId);
            localStorage.setItem(
              "userCraftUsers",
              JSON.stringify(updatedUsers)
            );

            if (response.status === 204) {
              alert("Usuário removido!");
              showLocalUsers(); // Atualiza a exibição
            }
          } catch (error) {
            console.error("Erro ao remover:", error);
            alert("Erro ao remover usuário");
          }
        }
      }
    });
  }

  document.getElementById("delete-btn").addEventListener("click", function() {
    // Chamar a função de deletar do main.js
    deleteUsuario();
});

  //Cria Usuário

  // Função corrigida para criar usuários

  // Função híbrida
  async function postUser() {
    const form = document.querySelector(".add-user");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // 1. Simula criação na ReqRes (sem persistência real)
      const res = await fetch("https://reqres.in/api/users", {
        method: "POST",
        headers: {
          "x-api-key": "reqres-free-v1",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${form.first_name.value} ${form.last_name.value}`,
          job: "Usuário UserCraft",
        }),
      });
      const data = await res.json();

      // 2. Persiste localmente
      const localUsers =
        JSON.parse(localStorage.getItem("userCraftUsers")) || [];
      localUsers.push({
        id: data.id || Date.now(),
        ...Object.fromEntries(new FormData(form)),
      });
      localStorage.setItem("userCraftUsers", JSON.stringify(localUsers));

      alert(`Usuário criado! ID: ${data.id || "local"}`);
    });
  }

  function showLocalUsers() {
    const localUsers = JSON.parse(localStorage.getItem("userCraftUsers")) || [];
    const container = document.querySelector(".users");

    container.innerHTML = localUsers
      .map(
        (user) => `
        <li class="lista-usuario">
            <div class="usuario-card" data-id="${user.id}">
                <div class="img-usuario">
                    <img src="${
                      user.avatar || "https://reqres.in/img/faces/1-image.jpg"
                    }">
                </div>
                <div class="info-usuario">
                    <h3>${user.first_name} ${user.last_name}</h3>
                    <div class="email-usuario">
                        <p>${user.email}</p>
                    </div>
                </div>
                <div class="user-actions">
                    <button class="edit-btn">✏️ Editar</button>
                    <button class="delete-btn">🗑️ Remover</button>
                    <small>Armazenado localmente</small>
                </div>
            </div>
        </li>
    `
      )
      .join("");
  }

  setupUserUpdate();
  setupUserDeletion();

  // campos api: email, first_name, last_name, avatar
});
