// ===== FUNÇÕES PARA A PÁGINA DE EDIÇÃO ===== //

function initializeEditPage() {
    // Verifica se estamos na página de edição
    if (!document.getElementById("users-container-edit")) return;
    
    // Elementos da página de edição
    const searchBtnEdit = document.getElementById("search-btn-edit");
    const showAllBtnEdit = document.getElementById("show-all-btn-edit");
    const usersContainerEdit = document.getElementById("users-container-edit");
    const editSection = document.getElementById("edit-section");
    const updateForm = document.getElementById("update-form");
    const cancelEditBtn = document.getElementById("cancel-edit");
    const searchInputEdit = document.querySelector("input[name='buscar-edit']");
    
    // Variáveis de estado
    let allUsersEdit = [];
    let filteredUsersEdit = [];
    let currentUserEdit = null;

    // Carrega os usuários ao iniciar
    loadUsersForEdit();

    // Event Listeners
    if (searchBtnEdit) searchBtnEdit.addEventListener("click", searchUsersForEdit);
    if (showAllBtnEdit) showAllBtnEdit.addEventListener("click", loadUsersForEdit);
    if (searchInputEdit) {
        searchInputEdit.addEventListener("keyup", function(e) {
            if (e.key === "Enter") searchUsersForEdit();
        });
    }
    if (cancelEditBtn) cancelEditBtn.addEventListener("click", cancelEdit);

    // Função para carregar todos os usuários para edição
    async function loadUsersForEdit() {
        try {
            usersContainerEdit.innerHTML = "<p>Carregando usuários...</p>";
            
            // Carrega da API
            const apiResponse = await fetch('https://reqres.in/api/users?per_page=12', {
                headers: { "x-api-key": "reqres-free-v1" }
            });
            const apiData = await apiResponse.json();
            
            // Carrega do localStorage
            const localUsers = JSON.parse(localStorage.getItem("userCraftUsers")) || [];
            
            // Combina os resultados
            allUsersEdit = [...apiData.data, ...localUsers];
            filteredUsersEdit = [...allUsersEdit];
            
            displayUsersForEdit(allUsersEdit);
        } catch (error) {
            console.error("Erro ao carregar usuários:", error);
            usersContainerEdit.innerHTML = '<p class="error">Erro ao carregar usuários</p>';
        }
    }

    // Função para buscar usuários na página de edição
    function searchUsersForEdit() {
        const term = searchInputEdit.value.trim().toLowerCase();
        
        if (!term) {
            displayUsersForEdit(allUsersEdit);
            return;
        }
        
        filteredUsersEdit = allUsersEdit.filter(user => 
            `${user.first_name} ${user.last_name}`.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term)
        );
        
        displayUsersForEdit(filteredUsersEdit);
    }

    // Função para exibir usuários na lista de edição
    function displayUsersForEdit(users) {
        if (users.length === 0) {
            usersContainerEdit.innerHTML = '<p class="error">Nenhum usuário encontrado</p>';
            return;
        }
        
        usersContainerEdit.innerHTML = users.map(user => `
            <div class="user-card" data-id="${user.id}">
                <img src="${user.avatar || 'https://via.placeholder.com/150'}" alt="${user.first_name}">
                <div class="user-info">
                    <h4>${user.first_name} ${user.last_name}</h4>
                    <p>${user.email}</p>
                    <p class="user-id">ID: ${user.id}</p>
                </div>
                <button class="select-user-btn">Selecionar para Edição</button>
            </div>
        `).join("");
        
        // Adiciona eventos aos botões de seleção
        document.querySelectorAll(".select-user-btn").forEach(btn => {
            btn.addEventListener("click", function() {
                const userId = this.closest(".user-card").dataset.id;
                selectUserForEdit(userId);
            });
        });
    }

    // Função para selecionar um usuário para edição
    function selectUserForEdit(userId) {
        currentUserEdit = filteredUsersEdit.find(user => user.id == userId);
        
        if (!currentUserEdit) return;
        
        // Preenche o formulário
        document.getElementById("user-id").value = currentUserEdit.id;
        document.getElementById("name").value = `${currentUserEdit.first_name} ${currentUserEdit.last_name}`;
        document.getElementById("email").value = currentUserEdit.email;
        document.getElementById("avatar").value = currentUserEdit.avatar || "";
        
        // Atualiza a pré-visualização
        document.getElementById("editing-user-name").textContent = 
            `${currentUserEdit.first_name} ${currentUserEdit.last_name}`;
        document.getElementById("preview-name").textContent = 
            `${currentUserEdit.first_name} ${currentUserEdit.last_name}`;
        document.getElementById("preview-email").textContent = currentUserEdit.email;
        document.getElementById("preview-avatar").src = 
            currentUserEdit.avatar || "https://via.placeholder.com/150";
        
        // Mostra a seção de edição
        document.querySelector(".user-selection-section").style.display = "none";
        editSection.style.display = "block";
    }

    // Função para cancelar a edição
    function cancelEdit() {
        editSection.style.display = "none";
        document.querySelector(".user-selection-section").style.display = "block";
        updateForm.reset();
        currentUserEdit = null;
    }

    // Função para atualizar o usuário
    if (updateForm) {
        updateForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            
            if (!currentUserEdit) return;
            
            // Extrai os dados do formulário
            const [firstName, lastName] = document.getElementById("name").value.split(" ");
            const email = document.getElementById("email").value;
            const avatar = document.getElementById("avatar").value;
            
            try {
                // 1. Atualização na API (simulada)
                if (currentUserEdit.id < 100) { // IDs baixos são da API
                    await fetch(`https://reqres.in/api/users/${currentUserEdit.id}`, {
                        method: "PUT",
                        headers: {
                            "x-api-key": "reqres-free-v1",
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            name: `${firstName} ${lastName}`,
                            job: "Usuário atualizado"
                        })
                    });
                }
                
                // 2. Atualização local
                const localUsers = JSON.parse(localStorage.getItem("userCraftUsers")) || [];
                const userIndex = localUsers.findIndex(u => u.id == currentUserEdit.id);
                
                if (userIndex !== -1) {
                    localUsers[userIndex] = {
                        ...localUsers[userIndex],
                        first_name: firstName,
                        last_name: lastName || "",
                        email: email,
                        avatar: avatar || localUsers[userIndex].avatar
                    };
                } else if (currentUserEdit.id >= 100) { // Novo usuário local
                    localUsers.push({
                        id: currentUserEdit.id,
                        first_name: firstName,
                        last_name: lastName || "",
                        email: email,
                        avatar: avatar || "https://via.placeholder.com/150"
                    });
                }
                
                localStorage.setItem("userCraftUsers", JSON.stringify(localUsers));
                
                alert("Usuário atualizado com sucesso!");
                cancelEdit();
                loadUsersForEdit(); // Recarrega a lista
            } catch (error) {
                console.error("Erro ao atualizar usuário:", error);
                alert("Erro ao atualizar usuário");
            }
        });
    }

    // Atualiza a pré-visualização quando os campos mudam
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const avatarInput = document.getElementById("avatar");
    
    if (nameInput) nameInput.addEventListener("input", updatePreview);
    if (emailInput) emailInput.addEventListener("input", updatePreview);
    if (avatarInput) avatarInput.addEventListener("input", updatePreview);
    
    function updatePreview() {
        const name = document.getElementById("name").value || "Nome do Usuário";
        const email = document.getElementById("email").value || "email@exemplo.com";
        const avatar = document.getElementById("avatar").value || "https://via.placeholder.com/150";
        
        document.getElementById("preview-name").textContent = name;
        document.getElementById("preview-email").textContent = email;
        document.getElementById("preview-avatar").src = avatar;
    }
}


// ===== FUNÇÕES PARA A PÁGINA DE DELETE ===== //
function initializeDeletePage() {
    // Verifica se estamos na página de delete
    if (!document.getElementById("users-container-delete")) return;
    
    // Elementos da página de delete
    const searchBtnDelete = document.getElementById("search-btn-delete");
    const showAllBtnDelete = document.getElementById("show-all-btn-delete");
    const usersContainerDelete = document.getElementById("users-container-delete");
    const confirmationSection = document.getElementById("confirmation-section");
    const cancelDeleteBtn = document.getElementById("cancel-delete");
    const confirmDeleteBtn = document.getElementById("confirm-delete");
    const searchInputDelete = document.querySelector("input[name='buscar-delete']");
    const deleteStatus = document.getElementById("delete-status");
    
    // Variáveis de estado
    let allUsersDelete = [];
    let filteredUsersDelete = [];
    let currentUserToDelete = null;

    // Carrega os usuários ao iniciar
    loadUsersForDelete();

    // Event Listeners
    if (searchBtnDelete) searchBtnDelete.addEventListener("click", searchUsersForDelete);
    if (showAllBtnDelete) showAllBtnDelete.addEventListener("click", loadUsersForDelete);
    if (searchInputDelete) {
        searchInputDelete.addEventListener("keyup", function(e) {
            if (e.key === "Enter") searchUsersForDelete();
        });
    }
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener("click", cancelDelete);
    if (confirmDeleteBtn) confirmDeleteBtn.addEventListener("click", confirmDelete);

    // Função para carregar todos os usuários para delete
    async function loadUsersForDelete() {
        try {
            usersContainerDelete.innerHTML = "<p>Carregando usuários...</p>";
            
            // Carrega da API
            const apiResponse = await fetch('https://reqres.in/api/users?per_page=12', {
                headers: { "x-api-key": "reqres-free-v1" }
            });
            const apiData = await apiResponse.json();
            
            // Carrega do localStorage
            const localUsers = JSON.parse(localStorage.getItem("userCraftUsers")) || [];
            
            // Combina os resultados
            allUsersDelete = [...apiData.data, ...localUsers];
            filteredUsersDelete = [...allUsersDelete];
            
            displayUsersForDelete(allUsersDelete);
        } catch (error) {
            console.error("Erro ao carregar usuários:", error);
            usersContainerDelete.innerHTML = '<p class="error">Erro ao carregar usuários</p>';
        }
    }

    // Função para buscar usuários na página de delete
    function searchUsersForDelete() {
        const term = searchInputDelete.value.trim().toLowerCase();
        
        if (!term) {
            displayUsersForDelete(allUsersDelete);
            return;
        }
        
        filteredUsersDelete = allUsersDelete.filter(user => 
            `${user.first_name} ${user.last_name}`.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term)
        );
        
        displayUsersForDelete(filteredUsersDelete);
    }

    // Função para exibir usuários na lista de delete
    function displayUsersForDelete(users) {
        if (users.length === 0) {
            usersContainerDelete.innerHTML = '<p class="error">Nenhum usuário encontrado</p>';
            return;
        }
        
        usersContainerDelete.innerHTML = users.map(user => `
            <div class="user-card" data-id="${user.id}">
                <img src="${user.avatar || 'https://via.placeholder.com/150'}" alt="${user.first_name}">
                <div class="user-info">
                    <h4>${user.first_name} ${user.last_name}</h4>
                    <p>${user.email}</p>
                    <p class="user-id">ID: ${user.id}</p>
                </div>
                <button class="delete-user-btn">🗑️ Remover Usuário</button>
            </div>
        `).join("");
        
        // Adiciona eventos aos botões de delete
        document.querySelectorAll(".delete-user-btn").forEach(btn => {
            btn.addEventListener("click", function() {
                const userId = this.closest(".user-card").dataset.id;
                selectUserForDelete(userId);
            });
        });
    }

    // Função para selecionar um usuário para delete
    function selectUserForDelete(userId) {
        currentUserToDelete = filteredUsersDelete.find(user => user.id == userId);
        
        if (!currentUserToDelete) return;
        
        // Atualiza a confirmação
        document.getElementById("user-to-delete-name").textContent = 
            `${currentUserToDelete.first_name} ${currentUserToDelete.last_name}`;
        
        // Mostra a seção de confirmação
        document.querySelector(".user-selection-section").style.display = "none";
        confirmationSection.style.display = "block";
    }

    // Função para cancelar a exclusão
    function cancelDelete() {
        confirmationSection.style.display = "none";
        document.querySelector(".user-selection-section").style.display = "block";
        currentUserToDelete = null;
    }

    // Função para confirmar a exclusão
    async function confirmDelete() {
        if (!currentUserToDelete) return;
        
        try {
            // 1. Remoção simulada na API ReqRes
            if (currentUserToDelete.id < 100) { // IDs baixos são da API
                const response = await fetch(`https://reqres.in/api/users/${currentUserToDelete.id}`, {
                    method: "DELETE",
                    headers: { "x-api-key": "reqres-free-v1" }
                });
                
                if (response.status !== 204) {
                    throw new Error("Falha na API");
                }
            }
            
            // 2. Remoção local
            const localUsers = JSON.parse(localStorage.getItem("userCraftUsers")) || [];
            const updatedUsers = localUsers.filter(u => u.id != currentUserToDelete.id);
            localStorage.setItem("userCraftUsers", JSON.stringify(updatedUsers));
            
            // Feedback para o usuário
            deleteStatus.innerHTML = `
                <div class="success-message">
                    Usuário ${currentUserToDelete.first_name} ${currentUserToDelete.last_name} removido com sucesso!
                </div>
            `;
            
            // Recarrega a lista
            cancelDelete();
            loadUsersForDelete();
            
        } catch (error) {
            console.error("Erro ao deletar usuário:", error);
            deleteStatus.innerHTML = `
                <div class="error-message">
                    Erro ao remover usuário. Por favor, tente novamente.
                </div>
            `;
        }
    }
}

// ===== FUNÇÕES PARA A PÁGINA DE ADICIONAR USUÁRIO ===== //
function initializeAddPage() {
    // Verifica se estamos na página de adicionar
    if (!document.getElementById("add-user-form")) return;
    
    const addForm = document.getElementById("add-user-form");
    const statusElement = document.getElementById("add-user-status");
    
    // Atualiza a pré-visualização quando os campos mudam
    const firstNameInput = document.getElementById("first_name");
    const lastNameInput = document.getElementById("last_name");
    const emailInput = document.getElementById("email");
    const avatarInput = document.getElementById("avatar");
    
    [firstNameInput, lastNameInput, emailInput, avatarInput].forEach(input => {
        input.addEventListener("input", updateUserPreview);
    });
    
    function updateUserPreview() {
        const firstName = firstNameInput.value || "Nome";
        const lastName = lastNameInput.value || "Completo";
        const email = emailInput.value || "email@exemplo.com";
        const avatar = avatarInput.value || "https://via.placeholder.com/150";
        
        document.getElementById("preview-name").textContent = `${firstName} ${lastName}`;
        document.getElementById("preview-email").textContent = email;
        document.getElementById("preview-avatar").src = avatar;
    }
    
    // Manipula o envio do formulário
    addForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        
        const formData = new FormData(addForm);
        const userData = Object.fromEntries(formData.entries());
        
        try {
            // 1. Simula criação na ReqRes (sem persistência real)
            const res = await fetch("https://reqres.in/api/users", {
                method: "POST",
                headers: {
                    "x-api-key": "reqres-free-v1",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: `${userData.first_name} ${userData.last_name}`,
                    job: "Usuário UserCraft"
                })
            });
            const data = await res.json();
            
            // 2. Persiste localmente
            const localUsers = JSON.parse(localStorage.getItem("userCraftUsers")) || [];
            
            // Cria um ID único para o novo usuário
            const newUserId = data.id || Date.now();
            
            localUsers.push({
                id: newUserId,
                first_name: userData.first_name,
                last_name: userData.last_name,
                email: userData.email,
                avatar: userData.avatar || "https://via.placeholder.com/150"
            });
            
            localStorage.setItem("userCraftUsers", JSON.stringify(localUsers));
            
            // Feedback visual
            statusElement.innerHTML = `
                <div class="success-message">
                    Usuário ${userData.first_name} ${userData.last_name} criado com sucesso! ID: ${newUserId}
                </div>
            `;
            
            // Limpa o formulário
            addForm.reset();
            updateUserPreview();
            
        } catch (error) {
            console.error("Erro ao criar usuário:", error);
            statusElement.innerHTML = `
                <div class="error-message">
                    Erro ao criar usuário. Por favor, tente novamente.
                </div>
            `;
        }
    });
}

// ===== FUNÇÕES PARA A PÁGINA DE MENU ===== //
function initializeMenuPage() {
    // Verifica se estamos na página de menu
    if (!document.getElementById("total-users")) return;
    
    // Atualiza o contador de usuários
    async function updateUserCount() {
        try {
            // Carrega usuários da API
            const apiResponse = await fetch('https://reqres.in/api/users?per_page=12', {
                headers: { "x-api-key": "reqres-free-v1" }
            });
            const apiData = await apiResponse.json();
            
            // Carrega do localStorage
            const localUsers = JSON.parse(localStorage.getItem("userCraftUsers")) || [];
            
            // Soma os usuários
            const total = apiData.data.length + localUsers.length;
            document.getElementById("total-users").textContent = total;
        } catch (error) {
            console.error("Erro ao carregar contagem de usuários:", error);
            document.getElementById("total-users").textContent = "Erro ao carregar";
        }
    }
    
    // Inicializa
    updateUserCount();
}


// ===== FUNÇÕES PARA A PÁGINA INDEX ===== //
function initializeIndexPage() {
    // Verifica se estamos na página index
    if (!document.getElementById("users-list")) return;
    
    // Elementos da página
    const usersList = document.getElementById("users-list");
    const searchForm = document.getElementById("search-users");
    const resetSearchBtn = document.getElementById("reset-search");
    const refreshBtn = document.getElementById("refresh-users");
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");
    const pageNumbers = document.getElementById("page-numbers");
    const totalUsersCount = document.getElementById("total-users-count");
    const usersFoundCount = document.getElementById("users-found-count");
    const currentPageElement = document.getElementById("current-page");
    
    // Variáveis de estado
    let currentPage = 1;
    let totalPages = 1;
    let allUsers = [];
    let filteredUsers = [];
    let searchTerm = '';
    
    // Inicializa a página
    loadUsers();
    
    // Event listeners
    if (searchForm) {
        searchForm.addEventListener("submit", function(e) {
            e.preventDefault();
            searchTerm = document.querySelector("input[name='buscar']").value.trim().toLowerCase();
            currentPage = 1;
            filterAndDisplayUsers();
        });
    }
    
    if (resetSearchBtn) {
        resetSearchBtn.addEventListener("click", function() {
            searchTerm = '';
            if (searchForm) searchForm.reset();
            currentPage = 1;
            filterAndDisplayUsers();
        });
    }
    
    if (refreshBtn) {
        refreshBtn.addEventListener("click", loadUsers);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener("click", function() {
            if (currentPage > 1) {
                currentPage--;
                filterAndDisplayUsers();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener("click", function() {
            if (currentPage < totalPages) {
                currentPage++;
                filterAndDisplayUsers();
            }
        });
    }
    
    // Função para carregar usuários
    async function loadUsers() {
        try {
            usersList.innerHTML = '<div class="loading-message">Carregando usuários...</div>';
            
            // Carrega da API
            const apiResponse = await fetch('https://reqres.in/api/users?per_page=12', {
                headers: { "x-api-key": "reqres-free-v1" }
            });
            const apiData = await apiResponse.json();
            
            // Carrega do localStorage
            const localUsers = JSON.parse(localStorage.getItem("userCraftUsers")) || [];
            
            // Combina os resultados
            allUsers = [...apiData.data, ...localUsers];
            
            // Atualiza contagem total
            totalUsersCount.textContent = allUsers.length;
            
            // Filtra e exibe
            filterAndDisplayUsers();
        } catch (error) {
            console.error("Erro ao carregar usuários:", error);
            usersList.innerHTML = '<div class="error-message">Erro ao carregar usuários. Por favor, tente novamente.</div>';
        }
    }
    
    // Função para filtrar e exibir usuários
    function filterAndDisplayUsers() {
        // Filtra os usuários
        if (searchTerm) {
            filteredUsers = allUsers.filter(user => 
                `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm) ||
                user.id.toString().includes(searchTerm)
            );
        } else {
            filteredUsers = [...allUsers];
        }
        
        // Atualiza contagem
        usersFoundCount.textContent = filteredUsers.length;
        
        // Calcula paginação
        const usersPerPage = 6;
        totalPages = Math.ceil(filteredUsers.length / usersPerPage);
        
        // Pega os usuários da página atual
        const startIndex = (currentPage - 1) * usersPerPage;
        const endIndex = startIndex + usersPerPage;
        const usersToDisplay = filteredUsers.slice(startIndex, endIndex);
        
        // Exibe os usuários
        displayUsers(usersToDisplay);
        
        // Atualiza controles de paginação
        updatePaginationControls();
    }
    
    // Função para exibir usuários
    function displayUsers(users) {
        if (users.length === 0) {
            usersList.innerHTML = '<div class="no-users-message">Nenhum usuário encontrado</div>';
            return;
        }
        
        usersList.innerHTML = users.map(user => `
            <div class="user-card" data-id="${user.id}">
                <img src="${user.avatar || 'https://via.placeholder.com/150'}" alt="${user.first_name}" class="user-avatar">
                <div class="user-info">
                    <h3 class="user-name">${user.first_name} ${user.last_name}</h3>
                    <p class="user-email">${user.email}</p>
                    <p class="user-id">ID: ${user.id}</p>
                </div>
                <div class="user-actions">
                    <button class="btn-edit" onclick="location.href='edit.html?id=${user.id}'">
                        ✏️ Editar
                    </button>
                    <button class="btn-delete" onclick="confirmDelete(${user.id})">
                        🗑️ Remover
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // Função para atualizar controles de paginação
    function updatePaginationControls() {
        // Atualiza página atual
        currentPageElement.textContent = currentPage;
        
        // Atualiza botões anterior/próximo
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;
        
        // Atualiza números de página
        pageNumbers.innerHTML = '';
        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
        
        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('span');
            pageBtn.className = `page-number ${i === currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                filterAndDisplayUsers();
            });
            pageNumbers.appendChild(pageBtn);
        }
    }
    
    // Função global para confirmar exclusão
    window.confirmDelete = function(userId) {
        if (confirm('Tem certeza que deseja remover este usuário?')) {
            deleteUser(userId);
        }
    };
    
    // Função para deletar usuário
    async function deleteUser(userId) {
        try {
            // 1. Remoção simulada na API ReqRes (para usuários da API)
            if (userId < 100) { // IDs baixos são da API
                const response = await fetch(`https://reqres.in/api/users/${userId}`, {
                    method: "DELETE",
                    headers: { "x-api-key": "reqres-free-v1" }
                });
                
                if (response.status !== 204) {
                    throw new Error("Falha na API");
                }
            }
            
            // 2. Remoção local
            const localUsers = JSON.parse(localStorage.getItem("userCraftUsers")) || [];
            const updatedUsers = localUsers.filter(u => u.id != userId);
            localStorage.setItem("userCraftUsers", JSON.stringify(updatedUsers));
            
            // 3. Atualiza a lista
            loadUsers();
            
            // Feedback
            alert('Usuário removido com sucesso!');
        } catch (error) {
            console.error("Erro ao remover usuário:", error);
            alert("Erro ao remover usuário");
        }
    }
}


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


   initializeEditPage();
   initializeDeletePage();
   initializeAddPage();
   initializeMenuPage();
   initializeIndexPage();

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
