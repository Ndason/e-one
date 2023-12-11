const mongoose = require('mongoose');


const todoShema = new mongoose.Schema({
    email:{
        type:String,
    },
    task:{
        type:Array,
    },
    image:{
        type:String,
    }
});

const todoModel = mongoose.model("todo",todoShema);

module.exports = todoModel;