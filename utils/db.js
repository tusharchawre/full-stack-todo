const mongoose = require('mongoose');
require('dotenv').config();


mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log('Connected!'));


const Schema = mongoose.Schema;


const userSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    token: String
})

const todoSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})


const UserModel = mongoose.model('User', userSchema);
const TodoModel = mongoose.model('Todo', todoSchema);

module.exports = {
    UserModel,
    TodoModel
}