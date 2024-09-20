const express = require('express')

const {z} = require("zod")
const { UserModel, TodoModel } = require('./utils/db')
const bcrypt = require("bcrypt")
const jwt  = require("jsonwebtoken")


const app = express()

app.use(express.static('public'))
app.use(express.json())


app.get("/", (req, res)=>{
    res.sendFile("/public/index.html")
})

app.get("/signup", (req, res)=>{
    res.sendFile("/public/signup.html")
})

app.get("/login", (req, res)=>{
    res.sendFile("/public/login.html")
})

app.get("/todo", (req, res)=>{
    res.sendFile("/public/todo.html")
})


const userSchema = z.object({
    email: z.string().min(3).max(100).email(),
    username : z.string(),
    password: z.string().min(8)
})

function auth(req, res, next) {
    const token = req.headers.token;
    if (token) {
        try {
            const decodedData = jwt.verify(token, process.env.JWT_SECRET);

            if (decodedData.username) {
                req.username = decodedData.username;
                next();
            } else {
                res.status(403).json({
                    message: "You are not logged in"
                });
            }
        } catch (error) {
            res.status(401).json({
                message: "Invalid token"
            });
        }
    } else {
        res.status(403).json({
            message: "Authorization token missing"
        });
    }
}


app.post("/signup", async (req, res)=>{

    const {email, username , password } = req.body

    const user = await UserModel.findOne({
        username: username
    })

    if(user){
        res.json({
            message: "User already exist. Please Login!"
        })
    }

    else{

        const validateData = userSchema.parse({ 
            username: username, 
            email: email, 
            password: password 
        })

       let hashedPassword = await bcrypt.hash(validateData.password, 10);

        await UserModel.create({
            password: hashedPassword,
            username: validateData.username,
            email: validateData.email
        })


        res.json({
            message: "You are successfully signed in."
        })
    }
})


app.post("/login", async (req,res)=>{
    const {username , password} = req.body

    const user = await UserModel.findOne({
        username : username
    })

    if(user){
        const passwordCheck = await bcrypt.compare(password, user.password)

        if(passwordCheck){

            const token = jwt.sign({
                username
            }, process.env.JWT_SECRET)

            await UserModel.updateOne(
                { username : username },
                {
                  $set: { token : token },
                  $currentDate: { lastModified: true }
                }
              );

            res.json({
                message: "User successfully signed in.",
                token
            })
        }
        else{
            res.status(403).json({
                message: "Invalid Credentials"
            })
        }
    }
    else{
        res.json({
            message: "User not found"
        })
    }

    

})

app.post("/api/todo", auth , async (req, res)=>{
    const {title , description } = req.body
    
    const user = await UserModel.findOne({
        username : req.username
    })

    if(user){
        await TodoModel.create({
            title: title,
            description : description,
            userId : user._id,
            status: false
        })
    }
    else{
        res.json({
            message : "User doesn't exist."
        })
    }

    res.json({
        message: "Todo added successfully"
    })
})

app.get("/api/todo",auth, async (req, res)=>{
    const user = await UserModel.findOne({
        username : req.username
    })

    const todos = await TodoModel.find({
        userId: user._id
    })

    res.json({
        todos
    })

})

app.get("/api/todo/:id" , auth , async (req, res)=>{
    const user = await UserModel.findOne({
        username : req.username
    })

    const todo = await TodoModel.find({
        userId: user._id,
        _id: req.params.id
    })

    if(todo){
        res.json({
            todo
        })
    }
    else{   
        res.status(404).json({
            message: "Not Found"
        })
    }

    
})

app.delete("/api/todo/:id", auth, async (req, res) => {
    const user = await UserModel.findOne({
        username: req.username
    });

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    const result = await TodoModel.deleteOne({
        userId: user._id,
        _id: req.params.id
    });

    if (result.deletedCount > 0) {
        res.json({
            message: "Todo deleted successfully"
        });
    } else {
        res.status(404).json({
            message: "Todo not found"
        });
    }
});

app.use('/.netlify/functions/api', app);

app.listen(3000)