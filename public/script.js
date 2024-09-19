async function signUp() {
    const username = document.getElementById("name").value
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value

   const response = await axios.post(`/signup`, {
        username: username,
        email: email,
        password: password

    })

    if(response.status === 200){
        window.location.href = '/login'
    }
}


async function login() {
    const username = document.getElementById("name").value;
    const password = document.getElementById("password").value;

    try {
        const response = await axios.post(`/login`, {
            username: username,
            password: password
        });

        if (response.status === 200) {

            localStorage.setItem("TodoToken", response.data.token);


            await axios.get("/todo", {
                headers: {
                    token: localStorage.getItem("TodoToken")
                }
            });


            window.location.href = '/todo';
        }

    } catch (error) {
        console.error("Error during login: ", error);

    }
}


async function getTodos() {
    try {
        const response = await axios.get("/api/todo", {
            headers: {
                token: localStorage.getItem("TodoToken")
            }
        });

        document.getElementById("todo-list").innerHTML = "";

        response.data.todos.forEach(todo=>{
            const div = document.createElement("div");
            div.classList.add("bg-gray-100", "p-4", "rounded-lg", "w-64", "shadow-md");
            div.innerHTML = `<h3 class="text-xl font-bold mb-2">${todo.title}</h3>
            <p class="text-sm">${todo.description}</p>`;
            document.getElementById("todo-list").appendChild(div);
        });
    } catch (error) {
        console.error("Error during getTodos: ", error);
    }
}   

if(window.location.pathname === "/todo"){
getTodos();
}


const createBtn = document.getElementById('createBtn');
const todoModal = document.getElementById('todoModal');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');


createBtn.addEventListener('click', () => {
    todoModal.classList.remove('hidden');
});


cancelBtn.addEventListener('click', () => {
    todoModal.classList.add('hidden');
});


saveBtn.addEventListener('click', async () => {
    await createTodo();
    todoModal.classList.add('hidden');
});


async function createTodo() {
    try {
        let title = document.getElementById("title").value;
        let description = document.getElementById("description").value;
        
        const response = await axios.post("/api/todo", {
            title: title,
            description : description,
            status: false
        }, {
            headers: {
                token: localStorage.getItem("TodoToken")
            }
        });

        if (response.status === 200) {
            document.getElementById("title").value = "";    
            document.getElementById("description").value = "";
            getTodos();

        }
    } catch (error) {
        console.error("Error during createTodo: ", error);
    }
}
