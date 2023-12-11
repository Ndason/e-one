require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');

const cors = require('cors')
const app = express(); 
app.use(cors());
app.use(express.json()); 
app.use("/user",require("./router/userRouter"))



const port = process.env.PORT||5000;  
mongoose.connect(process.env.MONGDB_KEY).then(() => {
    console.log('connected')
})
.catch((err)=>{
    console.log(err)
})


app.listen(port, () => {
    console.log(`app is connected on ${port}`)
}) 