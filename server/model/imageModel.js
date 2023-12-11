const mongoose  = require('mongoose');
const ImageShema = new mongoose.Schema({
    email: {
        type:String,

    },
    image:{
        type:String,
    }
})

const imageModel = mongoose.model('Image',ImageShema)


module.exports = imageModel