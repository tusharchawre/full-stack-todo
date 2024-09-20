

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
        const token = localStorage.getItem("TodoToken");
        if (!token) {
            console.error("No token found in localStorage");
            showAuthBanner();
            return;
        }

        const response = await axios.get("/api/todo", {
            headers: {
                token: token
            }
        });

        // Hide auth banner if authenticated
        hideAuthBanner();


        document.getElementById("todo-list").innerHTML = "";

        response.data.todos.forEach(todo=>{
            const div = document.createElement("div");
            div.classList.add("bg-white/60", "flex" , "justify-between" , "p-4", "rounded-lg", "w-64","h-64", "shadow-md", "relative");
            div.innerHTML = `<div>
           <h3 class="text-xl font-bold mb-2">${todo.title}</h3>
            <p class="text-sm">${todo.description}</p>
             </div>
             <div id="todoBtns" class="absolute bottom-2 right-2">
            <button class="bg-black/100  text-white h-12 px-2 py-1 rounded-md hover:bg-black/60" onclick="deleteTodo('${todo._id}')">
            Delete
            </button>
            </div>
            `;
            
            document.getElementById("todo-list").appendChild(div);
        });
    } catch (error) {
        console.log(error.response.data)
        const div = document.createElement("div");
            div.innerHTML = ` <div id="authBanner" class="bg-red-500 text-white p-4 mb-4 hidden text-center">
    You need to be authenticated to access this page!
  </div>
            `;
            document.getElementById("todo-list").appendChild(div);
    }
}   

if(window.location.pathname === "/todo"){
getTodos();
}


function showAuthBanner() {
    const banner = document.getElementById("authBanner");
    banner.classList.remove("hidden");
}

function hideAuthBanner() {
    const banner = document.getElementById("authBanner");
    banner.classList.add("hidden");
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


async function deleteTodo(id) {
    try {
        const response = await axios.delete(`/api/todo/${id}`, {
            headers: {
                token: localStorage.getItem("TodoToken")
            }
        });

        if (response.status === 200) {

            getTodos();
        }
    } catch (error) {
        console.error("Error during deleteTodo: ", error);
    }
}



function logOut() {
    localStorage.removeItem("TodoToken")
    window.location.href = "/login"

}