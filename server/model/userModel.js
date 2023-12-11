const mongoose = require('mongoose');



const userShema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
email:{
    type:String,
    require:true,
    unique:true
},

password:{
    type:String,
    require:true
}

});

const User = mongoose.model("user",userShema);
module.exports = User;