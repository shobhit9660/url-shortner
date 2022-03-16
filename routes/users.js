const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt  = require('jsonwebtoken');
const cookie = require('cookie');
const authenticate = require('../middleware/authenticate');
const Userdetails = require('../models/userdetails');

router.get('/login', function(req, res) {
  res.render("users/login");
});
router.get('/changepassword',authenticate, function(req, res) {
  res.render("users/changepassword");
});
router.get('/register', function(req, res) {
  res.render("users/register")
});

router.post('/register',async(req,res)=>{
  
  const {username,email,password,confirm} = req.body;
  if(!username || !email || !password || !confirm ){
      return res.send("Please Fill all the fields") 
  }

  try{
    const userExist = await User.findOne({email : email});
    if(userExist){
        return res.send("Email Already exists")
    }
    else if(password != confirm){
         return res.send("Both Password Fields are not matching")
    }
    else{
        const user = new User({username,email,password});
        await user.save();
        const newUser = new Userdetails({username : username});
        newUser.author = user._id;
        await newUser.save();
        return res.redirect('/login');
    }
  }
  catch(err){
      console.log(err);
  }
})

router.post('/login',async(req,res) =>{
  try{
    const{email, password} = req.body;
    if(!email || !password){
      return res.send("Username/Password Incorrect");
    }
    const user = await User.findOne({email:email});
    if(user){
    const checkP =  await bcrypt.compare(password,user.password);
   
    if(!checkP){
       res.send("Invalid credentials")
    }
    else{
        const token = await user.generateAuthToken();
        await res.cookie("jwtoken",token,{
          expires : new Date(Date.now()+10000000),
          httpOnly : true
        });
        res.redirect('/shortner');
    }
  }
  }
  catch(err){
    console.log(err);
  }
})

router.get('/shortner',authenticate,(req,res)=>{
  const currUser = req.currUser //we are getting currUser data from authenticate middleware and passing
 // console.log(req.currUser);// this data forward so that we can use it further in other routes.
  res.render("shortner"); 
})
router.get('/logout',(req,res)=>{
  res.clearCookie('jwtoken',{path :'/'});
 // console.log("Hello my Logout");
  res.render('home');
})



router.post('/changepassword',authenticate,async(req,res)=>{
  const {OldPassword,NewPassword,ConfirmPassword,email} = req.body;
  if(!OldPassword || !NewPassword || !ConfirmPassword || NewPassword!==ConfirmPassword){
    return res.status(423).json({error :"Please fill the details correctly",statusCode : 423}); 
}
  const user = await User.findOne({email:email});
  const checkP =  await bcrypt.compare(OldPassword,user.password);
  if(!checkP)
  {
    return res.send("Passwords do not match");
  }
  try{
   // console.log(currUser);
    user.password = NewPassword;
    await user.save();
    return res.send("Password Updated Successfully");
  }
  catch(err){
      console.log(err);
      return res.send("Enter Details Correctly"); 
  }
})

router.get('/home',authenticate,(req,res)=>{
  const currUser = res.locals.currUser;
  res.render("home",{currUser});
})

router.get('/dashboard',authenticate,  async(req,res) =>{

  const data= await Userdetails.findOne({author : res.locals.currUser._id}).populate("Links").populate("DeadLinks");
  res.render("dashboard",{data});
})

module.exports = router;
