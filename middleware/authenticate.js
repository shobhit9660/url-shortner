const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticate = async(req,res,next) =>{
    try{
        const token = req.cookies.jwtoken;
        
        const verifyToken = jwt.verify(token,"THISISADVANCEURLSHORTNERINPROGRESS");
        const currUser = await User.findOne({_id:verifyToken._id,"tokens.token":token});
        if(!currUser){
            throw new Error("User Not Found");
        }
        res.locals.currUser = currUser;
       
        next(); 
    }
    catch(err){
        res.redirect('/');
       // console.log(err);
    }
};
module.exports = authenticate;