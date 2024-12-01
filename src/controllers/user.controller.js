const {prisma} = require('../../db/config')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const signup = async (req,res) =>{
    try{
        const {name, email, password} = req.body;
    
    if (!name) {
        return res.status(400).json({ error: "Name is required" });
    }
    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }
    if (!password) {
        return res.status(400).json({ error: "Password is required" });
    }

    const existingUser = await prisma.User.findUnique({where : {email}});
    if(existingUser){
        return res.status(400).json({error : "Email already in use"});
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.User.create({
        data : {name, email, password : hashedPassword}});
        
    return res.status(201).json({ message: "User created successfully",userId: user.id});
    }
    catch(err){
        return res.status(500).json({message : "Internal server error occured"})
    }
    
}

const login = async (req,res)=>{
    try{
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({ error: "Email and password are required"})
        }
        const existingUser = await prisma.User.findUnique({where : {email}});
        if(!existingUser){
            return res.status(404).json({error: "User not found"});
        }
        const isValidPassword = await bcrypt.compare(password, existingUser.password);
        if(!isValidPassword){
            return res.status(401).json({error: "Invalid credentials"});
            }
        
        const jwtSecret = process.env.JWT_SECRET|| "68d97a7b7965450091cd86a139a66caaca857c05511860b11b0064e388ba105328de791c8336dd7561f52ea7f2fa64f2d09810cfea12978b571cdceab05270b"; 
        const jwtToken = jwt.sign({id : existingUser.id}, jwtSecret, { expiresIn: "1d" });
        return res.status(200).cookie('token', jwtToken, {httpOnly: true}).json({userdata: {
    "id": existingUser.id,
    "name": existingUser.name,
    "email": existingUser.email
  },"accesstoken": jwtToken})
        
    }
    catch(err){
        return res.status(500).json({message : "Internal server error"});
    }
}
module.exports = {signup, login}