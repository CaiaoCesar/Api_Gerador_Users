/* ============================================= */
/* ============ PÁGINA DE EDIÇÃO ============== */
/* ============================================= */

function initializeEditPage() {
    if (!document.getElementById("users-container-edit")) return;
    
    // Elementos da página
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

    // Inicialização
    loadUsersForEdit();

    // Event Listeners
    if (searchBtnEdit) searchBtnEdit.addEventListener("click", searchUsersForEdit);
    if (showAllBtnEdit) showAllBtnEdit.addEventListener("click", loadUsersForEdit);
    if (searchInputEdit) searchInputEdit.addEventListener("keyup", handleSearchKeyup);
    if (cancelEditBtn) cancelEditBtn.addEventListener("click", cancelEdit);
    if (updateForm) updateForm.addEventListener("submit", handleUpdateSubmit);

    // Atualiza a pré-visualização
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const avatarInput = document.getElementById("avatar");
    
    if (nameInput) nameInput.addEventListener("input", updatePreview);
    if (emailInput) emailInput.addEventListener("input", updatePreview);
    if (avatarInput) avatarInput.addEventListener("input", updatePreview);

    /* ----- FUNÇÕES ----- */

    async function loadUsersForEdit() {
        try {
            usersContainerEdit.innerHTML = "<p>Carregando usuários...</p>";
            
            const apiResponse = await fetch('https://reqres.in/api/users?per_page=12', {
                headers: { "x-api-key": "reqres-free-v1" }
            });
            const apiData = await apiResponse.json();
            
            const localUsers = JSON.parse(localStorage.getItem("userCraftUsers")) || [];
            
            allUsersEdit = [...apiData.data, ...localUsers];
            filteredUsersEdit = [...allUsersEdit];
            
            displayUsersForEdit(allUsersEdit);
        } catch (error) {
            console.error("Erro ao carregar usuários:", error);
            usersContainerEdit.innerHTML = '<p class="error">Erro ao carregar usuários</p>';
        }
    }

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
        
        document.querySelectorAll(".select-user-btn").forEach(btn => {
            btn.addEventListener("click", function() {
                const userId = this.closest(".user-card").dataset.id;
                selectUserForEdit(userId);
            });
        });
    }

    function selectUserForEdit(userId) {
        currentUserEdit = filteredUsersEdit.find(user => user.id == userId);
        
        if (!currentUserEdit) return;
        
        document.getElementById("user-id").value = currentUserEdit.id;
        document.getElementById("name").value = `${currentUserEdit.first_name} ${currentUserEdit.last_name}`;
        document.getElementById("email").value = currentUserEdit.email;
        document.getElementById("avatar").value = currentUserEdit.avatar || "";
        
        document.getElementById("editing-user-name").textContent = 
            `${currentUserEdit.first_name} ${currentUserEdit.last_name}`;
        document.getElementById("preview-name").textContent = 
            `${currentUserEdit.first_name} ${currentUserEdit.last_name}`;
        document.getElementById("preview-email").textContent = currentUserEdit.email;
        document.getElementById("preview-avatar").src = 
            currentUserEdit.avatar || "https://via.placeholder.com/150";
        
        document.querySelector(".user-selection-section").style.display = "none";
        editSection.style.display = "block";
    }

    function cancelEdit() {
        editSection.style.display = "none";
        document.querySelector(".user-selection-section").style.display = "block";
        updateForm.reset();
        currentUserEdit = null;
    }

    async function handleUpdateSubmit(e) {
        e.preventDefault();
        
        if (!currentUserEdit) return;
        
        const [firstName, lastName] = document.getElementById("name").value.split(" ");
        const email = document.getElementById("email").value;
        const avatar = document.getElementById("avatar").value;
        
        try {
            if (currentUserEdit.id < 100) {
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
            } else if (currentUserEdit.id >= 100) {
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
            loadUsersForEdit();
        } catch (error) {
            console.error("Erro ao atualizar usuário:", error);
            alert("Erro ao atualizar usuário");
        }
    }

    function updatePreview() {
        const name = document.getElementById("name").value || "Nome do Usuário";
        const email = document.getElementById("email").value || "email@exemplo.com";
        const avatar = document.getElementById("avatar").value || "https://via.placeholder.com/150";
        
        document.getElementById("preview-name").textContent = name;
        document.getElementById("preview-email").textContent = email;
        document.getElementById("preview-avatar").src = avatar;
    }

    function handleSearchKeyup(e) {
        if (e.key === "Enter") searchUsersForEdit();
    }
}

/* ============================================= */
/* ============ PÁGINA DE DELETE ============== */
/* ============================================= */

function initializeDeletePage() {
    if (!document.getElementById("users-container-delete")) return;
    
    // Elementos da página
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

    // Inicialização
    loadUsersForDelete();

    // Event Listeners
    if (searchBtnDelete) searchBtnDelete.addEventListener("click", searchUsersForDelete);
    if (showAllBtnDelete) showAllBtnDelete.addEventListener("click", loadUsersForDelete);
    if (searchInputDelete) searchInputDelete.addEventListener("keyup", handleSearchKeyup);
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener("click", cancelDelete);
    if (confirmDeleteBtn) confirmDeleteBtn.addEventListener("click", confirmDelete);

    /* ----- FUNÇÕES ----- */

    async function loadUsersForDelete() {
        try {
            usersContainerDelete.innerHTML = "<p>Carregando usuários...</p>";
            
            const apiResponse = await fetch('https://reqres.in/api/users?per_page=12', {
                headers: { "x-api-key": "reqres-free-v1" }
            });
            const apiData = await apiResponse.json();
            
            const localUsers = JSON.parse(localStorage.getItem("userCraftUsers")) || [];
            
            allUsersDelete = [...apiData.data, ...localUsers];
            filteredUsersDelete = [...allUsersDelete];
            
            displayUsersForDelete(allUsersDelete);
        } catch (error) {
            console.error("Erro ao carregar usuários:", error);
            usersContainerDelete.innerHTML = '<p class="error">Erro ao carregar usuários</p>';
        }
    }

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
        
        document.querySelectorAll(".delete-user-btn").forEach(btn => {
            btn.addEventListener("click", function() {
                const userId = this.closest(".user-card").dataset.id;
                selectUserForDelete(userId);
            });
        });
    }

    function selectUserForDelete(userId) {
        currentUserToDelete = filteredUsersDelete.find(user => user.id == userId);
        
        if (!currentUserToDelete) return;
        
        document.getElementById("user-to-delete-name").textContent = 
            `${currentUserToDelete.first_name} ${currentUserToDelete.last_name}`;
        
        document.querySelector(".user-selection-section").style.display = "none";
        confirmationSection.style.display = "block";
    }

    function cancelDelete() {
        confirmationSection.style.display = "none";
        document.querySelector(".user-selection-section").style.display = "block";
        currentUserToDelete = null;
    }

    async function confirmDelete() {
        if (!currentUserToDelete) return;
        
        try {
            if (currentUserToDelete.id < 100) {
                const response = await fetch(`https://reqres.in/api/users/${currentUserToDelete.id}`, {
                    method: "DELETE",
                    headers: { "x-api-key": "reqres-free-v1" }
                });
                
                if (response.status !== 204) {
                    throw new Error("Falha na API");
                }
            }
            
            const localUsers = JSON.parse(localStorage.getItem("userCraftUsers")) || [];
            const updatedUsers = localUsers.filter(u => u.id != currentUserToDelete.id);
            localStorage.setItem("userCraftUsers", JSON.stringify(updatedUsers));
            
            deleteStatus.innerHTML = `
                <div class="success-message">
                    Usuário ${currentUserToDelete.first_name} ${currentUserToDelete.last_name} removido com sucesso!
                </div>
            `;
            
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

    function handleSearchKeyup(e) {
        if (e.key === "Enter") searchUsersForDelete();
    }
}

/* ============================================= */
/* ========= PÁGINA DE ADICIONAR USUÁRIO ====== */
/* ============================================= */

function initializeAddPage() {
    if (!document.getElementById("add-user-form")) return;
    
    const addForm = document.getElementById("add-user-form");
    const statusElement = document.getElementById("add-user-status");
    
    // Elementos de input
    const firstNameInput = document.getElementById("first_name");
    const lastNameInput = document.getElementById("last_name");
    const emailInput = document.getElementById("email");
    const avatarInput = document.getElementById("avatar");
    
    // Event Listeners
    [firstNameInput, lastNameInput, emailInput, avatarInput].forEach(input => {
        input.addEventListener("input", updateUserPreview);
    });
    
    addForm.addEventListener("submit", handleAddSubmit);

    /* ----- FUNÇÕES ----- */

    function updateUserPreview() {
        const firstName = firstNameInput.value || "Nome";
        const lastName = lastNameInput.value || "Completo";
        const email = emailInput.value || "email@exemplo.com";
        const avatar = avatarInput.value || "https://via.placeholder.com/150";
        
        document.getElementById("preview-name").textContent = `${firstName} ${lastName}`;
        document.getElementById("preview-email").textContent = email;
        document.getElementById("preview-avatar").src = avatar;
    }
    
    async function handleAddSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(addForm);
        const userData = Object.fromEntries(formData.entries());
        
        try {
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
            
            const localUsers = JSON.parse(localStorage.getItem("userCraftUsers")) || [];
            const newUserId = data.id || Date.now();
            
            localUsers.push({
                id: newUserId,
                first_name: userData.first_name,
                last_name: userData.last_name,
                email: userData.email,
                avatar: userData.avatar || "https://via.placeholder.com/150"
            });
            
            localStorage.setItem("userCraftUsers", JSON.stringify(localUsers));
            
            statusElement.innerHTML = `
                <div class="success-message">
                    Usuário ${userData.first_name} ${userData.last_name} criado com sucesso! ID: ${newUserId}
                </div>
            `;
            
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
    }
}

/* ============================================= */
/* ============== PÁGINA DE MENU ============== */
/* ============================================= */

function initializeMenuPage() {
    if (!document.getElementById("total-users")) return;
    
    // Atualiza o contador de usuários
    async function updateUserCount() {
        try {
            const apiResponse = await fetch('https://reqres.in/api/users?per_page=12', {
                headers: { "x-api-key": "reqres-free-v1" }
            });
            const apiData = await apiResponse.json();
            
            const localUsers = JSON.parse(localStorage.getItem("userCraftUsers")) || [];
            const total = apiData.data.length + localUsers.length;
            document.getElementById("total-users").textContent = total;
        } catch (error) {
            console.error("Erro ao carregar contagem de usuários:", error);
            document.getElementById("total-users").textContent = "Erro ao carregar";
        }
    }
    
    updateUserCount();
}

/* ============================================= */
/* ============== PÁGINA INDEX ================ */
/* ============================================= */

function initializeIndexPage() {
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
    
    // Inicialização
    loadUsers();
    
    // Event Listeners
    if (searchForm) searchForm.addEventListener("submit", handleSearchSubmit);
    if (resetSearchBtn) resetSearchBtn.addEventListener("click", handleResetSearch);
    if (refreshBtn) refreshBtn.addEventListener("click", loadUsers);
    if (prevBtn) prevBtn.addEventListener("click", goToPrevPage);
    if (nextBtn) nextBtn.addEventListener("click", goToNextPage);

    /* ----- FUNÇÕES ----- */

    async function loadUsers() {
        try {
            usersList.innerHTML = '<div class="loading-message">Carregando usuários...</div>';
            
            const apiResponse = await fetch('https://reqres.in/api/users?per_page=12', {
                headers: { "x-api-key": "reqres-free-v1" }
            });
            const apiData = await apiResponse.json();
            
            const localUsers = JSON.parse(localStorage.getItem("userCraftUsers")) || [];
            allUsers = [...apiData.data, ...localUsers];
            
            totalUsersCount.textContent = allUsers.length;
            filterAndDisplayUsers();
        } catch (error) {
            console.error("Erro ao carregar usuários:", error);
            usersList.innerHTML = '<div class="error-message">Erro ao carregar usuários. Por favor, tente novamente.</div>';
        }
    }
    
    function filterAndDisplayUsers() {
        if (searchTerm) {
            filteredUsers = allUsers.filter(user => 
                `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm) ||
                user.id.toString().includes(searchTerm)
            );
        } else {
            filteredUsers = [...allUsers];
        }
        
        usersFoundCount.textContent = filteredUsers.length;
        const usersPerPage = 6;
        totalPages = Math.ceil(filteredUsers.length / usersPerPage);
        
        const startIndex = (currentPage - 1) * usersPerPage;
        const endIndex = startIndex + usersPerPage;
        const usersToDisplay = filteredUsers.slice(startIndex, endIndex);
        
        displayUsers(usersToDisplay);
        updatePaginationControls();
    }
    
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
    
    function updatePaginationControls() {
        currentPageElement.textContent = currentPage;
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;
        
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
    
    function handleSearchSubmit(e) {
        e.preventDefault();
        searchTerm = document.querySelector("input[name='buscar']").value.trim().toLowerCase();
        currentPage = 1;
        filterAndDisplayUsers();
    }
    
    function handleResetSearch() {
        searchTerm = '';
        if (searchForm) searchForm.reset();
        currentPage = 1;
        filterAndDisplayUsers();
    }
    
    function goToPrevPage() {
        if (currentPage > 1) {
            currentPage--;
            filterAndDisplayUsers();
        }
    }
    
    function goToNextPage() {
        if (currentPage < totalPages) {
            currentPage++;
            filterAndDisplayUsers();
        }
    }
    
    // Função global para confirmar exclusão
    window.confirmDelete = function(userId) {
        if (confirm('Tem certeza que deseja remover este usuário?')) {
            deleteUser(userId);
        }
    };
    
    async function deleteUser(userId) {
        try {
            if (userId < 100) {
                const response = await fetch(`https://reqres.in/api/users/${userId}`, {
                    method: "DELETE",
                    headers: { "x-api-key": "reqres-free-v1" }
                });
                
                if (response.status !== 204) {
                    throw new Error("Falha na API");
                }
            }
            
            const localUsers = JSON.parse(localStorage.getItem("userCraftUsers")) || [];
            const updatedUsers = localUsers.filter(u => u.id != userId);
            localStorage.setItem("userCraftUsers", JSON.stringify(updatedUsers));
            
            loadUsers();
            alert('Usuário removido com sucesso!');
        } catch (error) {
            console.error("Erro ao remover usuário:", error);
            alert("Erro ao remover usuário");
        }
    }
}

/* ============================================= */
/* ============ EVENTO DOMContentLoaded ======= */
/* ============================================= */

document.addEventListener("DOMContentLoaded", function() {
    // Inicializa todas as páginas
    initializeEditPage();
    initializeDeletePage();
    initializeAddPage();
    initializeMenuPage();
    initializeIndexPage();

    // Funções específicas da página index.html
    const btnTodosUsuarios = document.querySelector(".btn-todos-usuarios");
    const usersContainer = document.querySelector(".users");
    const pageIndicator = document.querySelector(".page-indicator");
    const antButton = document.querySelector(".prev-btn");
    const proxButton = document.querySelector(".next-btn");
    const statsSection = document.querySelector(".stats-section");
    const sectionTitle = document.querySelector(".section-title");
    const pagination = document.querySelector(".pagination");
    const pesquisa = document.getElementById("search");
    const resultado = document.querySelector(".resultados");

    let pagAtual = 1;
    let totalPags = 1;

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

                while (page <= totalPages) {
                    const res = await fetch(`https://reqres.in/api/users?page=${page}`, {
                        headers: { "x-api-key": "reqres-free-v1" },
                    });
                    const data = await res.json();

                    totalPages = data.total_pages;
                    allUsers = [...allUsers, ...data.data];
                    page++;
                }

                const encontrados = allUsers.filter(
                    user => user.first_name.toLowerCase().includes(termo) ||
                           user.last_name.toLowerCase().includes(termo)
                );

                resultado.innerHTML = encontrados.length
                    ? encontrados.map(user => `
                            <div class="usuario-card">
                                <img src="${user.avatar}" alt="${user.first_name}">
                                <div>
                                    <h3>${user.first_name} ${user.last_name}</h3>
                                    <p>${user.email}</p>
                                    <p>ID: ${user.id}</p>
                                </div>
                            </div>
                        `).join("")
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
                headers: { "x-api-key": "reqres-free-v1" }
            });

            const usuarios = await response.json();

            tooglePagination(true);

            pagAtual = usuarios.page;
            totalPags = usuarios.total_pages;

            usersContainer.innerHTML = "";

            pageIndicator.textContent = `Página ${pagAtual} de ${totalPags}`;

            antButton.disabled = pagAtual === 1;
            proxButton.disabled = pagAtual === totalPags;

            usersContainer.innerHTML = usuarios.data.map(usuario => `
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
            `).join("");

            document.getElementById("user-count").textContent = usuarios.total;
            document.getElementById("current-page").textContent = pagAtual;
        } catch (error) {
            console.error("Error:", error);
            usersContainer.innerHTML = '<li class="error">Ocorreu um erro ao buscar os usuários.</li>';
            tooglePagination(false);
        }
    }

    // Event Listeners
    if (btnTodosUsuarios) btnTodosUsuarios.addEventListener("click", () => showUsers(1));
    if (antButton) antButton.addEventListener("click", () => {
        if (pagAtual > 1) showUsers(pagAtual - 1);
    });
    if (proxButton) proxButton.addEventListener("click", () => {
        if (pagAtual < totalPags) showUsers(pagAtual + 1);
    });

    showUsers(1);

    // Atualiza Usuário
    async function setupUserUpdate() {
        const usersContainer = document.querySelector(".users");

        usersContainer.addEventListener("click", async (e) => {
            if (e.target.classList.contains("edit-btn")) {
                const card = e.target.closest(".usuario-card");
                const userId = card.dataset.id;

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
                        const response = await fetch(`https://reqres.in/api/users/${userId}`, {
                            method: "PUT",
                            headers: {
                                "x-api-key": "reqres-free-v1",
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                name: newName,
                                job: "Usuário atualizado",
                            }),
                        });

                        const updatedUser = await response.json();

                        const localUsers = JSON.parse(localStorage.getItem("userCraftUsers")) || [];
                        const userIndex = localUsers.findIndex((u) => u.id == userId);

                        if (userIndex !== -1) {
                            const [firstName, lastName] = newName.split(" ");
                            localUsers[userIndex] = {
                                ...localUsers[userIndex],
                                first_name: firstName,
                                last_name: lastName || "",
                                email: newEmail,
                            };
                            localStorage.setItem("userCraftUsers", JSON.stringify(localUsers));
                        }

                        alert("Usuário atualizado!");
                        showLocalUsers();
                    } catch (error) {
                        console.error("Erro ao atualizar:", error);
                        alert("Erro ao atualizar usuário");
                    }
                }
            }
        });
    }

    // Apaga Usuario
    async function setupUserDeletion() {
        const usersContainer = document.querySelector(".users");

        usersContainer.addEventListener("click", async (e) => {
            if (e.target.classList.contains("delete-btn")) {
                const card = e.target.closest(".usuario-card");
                const userId = card.dataset.id;

                if (confirm("Tem certeza que deseja remover este usuário?")) {
                    try {
                        const response = await fetch(`https://reqres.in/api/users/${userId}`, {
                            method: "DELETE",
                            headers: { "x-api-key": "reqres-free-v1" },
                        });

                        const localUsers = JSON.parse(localStorage.getItem("userCraftUsers")) || [];
                        const updatedUsers = localUsers.filter((u) => u.id != userId);
                        localStorage.setItem("userCraftUsers", JSON.stringify(updatedUsers));

                        if (response.status === 204) {
                            alert("Usuário removido!");
                            showLocalUsers();
                        }
                    } catch (error) {
                        console.error("Erro ao remover:", error);
                        alert("Erro ao remover usuário");
                    }
                }
            }
        });
    }

    // Cria Usuário
    async function postUser() {
        const form = document.querySelector(".add-user");
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

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

            const localUsers = JSON.parse(localStorage.getItem("userCraftUsers")) || [];
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

        container.innerHTML = localUsers.map(user => `
            <li class="lista-usuario">
                <div class="usuario-card" data-id="${user.id}">
                    <div class="img-usuario">
                        <img src="${user.avatar || "https://reqres.in/img/faces/1-image.jpg"}">
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
        `).join("");
    }

    // Inicializa funções
    setupUserUpdate();
    setupUserDeletion();
    searchUsers();
});