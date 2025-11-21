document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURATION ---
    const API_URL = 'http://localhost:3000'; // Change this to your backend URL

    // --- PAGE SELECTORS ---
    const loginPage = document.getElementById('login-page');
    const registerPage = document.getElementById('register-page');
    const dashboardPage = document.getElementById('dashboard-page');

    // --- LINK SELECTORS ---
    const showRegisterLink = document.getElementById('show-register-link');
    const showLoginLink = document.getElementById('show-login-link');

    // --- FORM SELECTORS ---
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const todoForm = document.getElementById('todo-form');

    // --- DASHBOARD SELECTORS ---
    const logoutBtn = document.getElementById('logout-btn');
    const todoList = document.getElementById('todo-list');
    const todoTitleInput = document.getElementById('todo-title-input');
    const avatarImg = document.getElementById('avatar-img');
    const avatarUploadInput = document.getElementById('avatar-upload-input');
    const avatarUploadBtn = document.getElementById('avatar-upload-btn');
    const avatarDeleteBtn = document.getElementById('avatar-delete-btn');

    // --- PAGE NAVIGATION ---
    function showPage(pageId) {
        loginPage.classList.add('hidden');
        registerPage.classList.add('hidden');
        dashboardPage.classList.add('hidden');
        
        const page = document.getElementById(pageId);
        if (page) {
            page.classList.remove('hidden');
        }
    }

    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('register-page');
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('login-page');
    });

    // --- AUTH FUNCTIONS ---

    // REGISTER
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.msg || 'Registration failed');
            }

            alert('Registration successful! Please login.');
            showPage('login-page');
            registerForm.reset();

        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    });

    // LOGIN
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.msg || 'Login failed');
            }

            localStorage.setItem('token', data.token);
            loadDashboard();
            showPage('dashboard-page');
            loginForm.reset();

        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    });

    // LOGOUT
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        todoList.innerHTML = ''; // Clear the list
        avatarImg.src = 'https://placehold.co/100'; // Reset avatar
        showPage('login-page');
    });

    // --- DASHBOARD FUNCTIONS ---
    async function loadDashboard() {
        const token = localStorage.getItem('token');
        if (!token) {
            showPage('login-page');
            return;
        }
        
        // We'll fetch profile and todos at the same time
        await fetchProfile();
        await fetchTodos();
    }

    // GET PROFILE
    async function fetchProfile() {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/get/profile/avatar`, {
                method: 'get',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.msg);

            // Set profile picture if it exists
            if (data.avatarUrl) {
                avatarImg.src = data.avatarUrl;
            } else {
                avatarImg.src = 'https://placehold.co/100'; // Default
            }

        } catch (err) {
            console.error('Error fetching profile:', err.message);
        }
    }

    // UPLOAD AVATAR
    avatarUploadBtn.addEventListener('click', async () => {
        const token = localStorage.getItem('token');
        const file = avatarUploadInput.files[0];
        if (!file) {
            alert('Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await fetch(`${API_URL}/api/profile/avatar`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData, // No 'Content-Type' header, browser sets it
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.msg);

            avatarImg.src = data.avatarUrl; // Update image on success
            alert('Profile picture uploaded!');

        } catch (err) {
            alert(`Error uploading: ${err.message}`);
        }
    });
    
    // DELETE AVATAR
    avatarDeleteBtn.addEventListener('click', async () => {
        const token = localStorage.getItem('token');
        if (!confirm('Are you sure you want to delete your avatar?')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/user/profile-picture`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.msg);

            avatarImg.src = 'https://via.placeholder.com/100'; // Reset to default
            alert('Avatar deleted.');

        } catch (err) {
            alert(`Error deleting: ${err.message}`);
        }
    });

    // --- TODO FUNCTIONS ---

    // GET ALL TODOS
    async function fetchTodos() {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/tasks/getAllTasks`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const todos = await response.json();
            if (!response.ok) throw new Error(todos.msg);
            
            todoList.innerHTML = ''; // Clear list before rendering
            todos.forEach(renderTodo);

        } catch (err) {
            console.error('Error fetching todos:', err.message);
        }
    }

    // ADD A TODO
    todoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${API_URL}/api/tasks/createTasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    TaskName: todoTitleInput.value
                 })
            });
            
            const newTodo = await response.json();
            console.log(newTodo.savedTask);
            if (!response.ok) throw new Error(newTodo.msg);
            
            renderTodo(newTodo.savedTask); // Add new todo to the list
            todoTitleInput.value = ''; // Clear input

        } catch (err) {
            alert(`Error adding todo: ${err.message}`);
        }
    });

    // RENDER A SINGLE TODO ITEM
    function renderTodo(todo) {
        const li = document.createElement('li');
        li.dataset.id = todo._id;
        if (todo.TaskStatus) {
            li.classList.add('completed');
        }

        // --- 1. CREATE CHECKBOX ---
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.TaskStatus;
        // pass the new checked state (don't invert it later)
        checkbox.addEventListener('change', () => toggleTodo(todo._id, checkbox.checked));

        // Title (clickable to toggle complete)
        const titleSpan = document.createElement('span');
        titleSpan.textContent = todo.TaskName;
        // pass the span and id so makeEditable can replace the span correctly
        titleSpan.addEventListener('click', () => makeEditable(titleSpan, todo._id));
        
        // Delete Button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', () => deleteTodo(todo._id));

        li.appendChild(checkbox);
        li.appendChild(titleSpan);
        li.appendChild(deleteBtn);
        todoList.appendChild(li);
    }

    // TOGGLE TODO (Update)
    async function toggleTodo(_id, TaskStatus) {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/tasks/updateTask/${_id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                // send the new status (TaskStatus is already the new checked state)
                body: JSON.stringify({ TaskStatus: TaskStatus })
            });
            
            const updatedTodo = await response.json();
            if (!response.ok) throw new Error(updatedTodo.msg);

            // Find the list item in the DOM and update its class
            const li = todoList.querySelector(`li[data-id="${_id}"]`);
            const checkbox = li.querySelector('input[type="checkbox"]');

            // update checkbox state (use value returned by server)
            checkbox.checked = updatedTodo.TaskStatus;

            // Update visual state
            if (updatedTodo.TaskStatus) {
                li.classList.add('completed');
            } else {
                li.classList.remove('completed');
            }

        } catch (err) {
            alert(`Error updating todo: ${err.message}`);
        }
    };
    
    function makeEditable(span, id) {
        // 1. Create an input field
        const input = document.createElement('input');
        input.type = 'text';
        input.value = span.textContent;
        input.classList.add('edit-input'); // Use the CSS class we added

        // 2. Replace the <span> with the <input>
        span.parentElement.insertBefore(input, span);
        span.remove();
        input.focus(); // Automatically focus the input

        // 3. Save when user clicks away (blur) or hits Enter
        input.addEventListener('blur', () => saveTodoText(input, id));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                input.blur(); // Trigger the blur event to save
            }
        });
    };

    // DELETE TODO
    async function deleteTodo(id) {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/tasks/deleteTask/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.msg);

            // Remove from DOM
            const li = todoList.querySelector(`li[data-id="${id}"]`);
            if (li) {
                li.remove();
            }

        } catch (err) {
            alert(`Error deleting todo: ${err.message}`);
        }
    }

    async function saveTodoText(input, id) {
        const token = localStorage.getItem('token');
        const newTitle = input.value;

        try {
            // --- Call the API to update the title ---
            const response = await fetch(`${API_URL}/api/tasks/updateTask/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ TaskName: newTitle })
            });

            console.log(response);
            const updatedTodo = await response.json();
            if (!response.ok) throw new Error(updatedTodo.msg);
            
            // --- On success, turn the input back into a <span> ---
            const newSpan = document.createElement('span');
            newSpan.textContent = updatedTodo.TaskName;
            newSpan.addEventListener('click', () => makeEditable(newSpan, id)); // Add edit ability back

            input.parentElement.insertBefore(newSpan, input);
            input.remove();

        } catch (err) {
            alert(`Error updating title: ${err.message}`);
            // If save fails, just put the original text back (for simplicity)
            const originalSpan = document.createElement('span');
            originalSpan.textContent = input.value; // (or fetch original text)
            originalSpan.addEventListener('click', () => makeEditable(originalSpan, id));
            input.parentElement.insertBefore(originalSpan, input);
            input.remove();
        }
    }

    // --- INITIAL APP LOAD ---
    function init() {
        const token = localStorage.getItem('token');
        if (token) {
            loadDashboard();
            showPage('dashboard-page');
        } else {
            showPage('login-page');
        }
    }

    init(); // Start the app
});