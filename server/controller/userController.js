const User = require('../model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');


 const addUser = async(req, res) => {
    console.log(req.body)
 const{name,email,password} = req.body;
 try {
    const user = await User.find({email})
    if(user.length>0){
        return res.status(400).json({msg:"user already exist"})
    }
    if(!validator.isEmail(email)){
        return res.status(400).json({msg:"invalid email"})
    }
    if(password.length<6){
        return res.status(400).json({msg:"password must be 6 characters"})
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password,salt);
    const newUser = new User({
        name,
        email,
        password:hashPassword  
    })
    await newUser.save();
    jwt.sign({id:newUser._id},process.env.JWT_SECRET,(err,token)=>{
        if(err) throw err;
        res.json({token,user:{id:newUser._id,name:newUser.name,email:newUser.email}})
    })
  
 } catch (error) {
        res.status(500).json({msg:error})
 }
}
const signIn = async(req,res)=>{
    const {email,password}= req.body;
    try {
       const user = await User.findOne({email})
       if(!user){
           return res.status(400).json({msg:"invalid email or password"})
        }
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({msg:"invalid email or password"})
        }
        jwt.sign({id:user._id},process.env.JWT_SECRET,(err,token)=>{
            if(err) throw err;
            res.status(200).json({token,user:{id:user._id,name:user.name,email:user.email}})
        })
        

    } catch (error) {
      res.status(400).json({msg:error}) 
    }
}

module.exports = {addUser,signIn}

