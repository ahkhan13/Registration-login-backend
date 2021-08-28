const express = require("express");
const app=express();
const path=require("path");
const hbs=require("hbs");
const User = require('./modals/userSchema');
const staticPath=path.join(__dirname,"../public");
const partialsPath=path.join(__dirname,"../templates/partials");
hbs.registerPartials(partialsPath);
app.set("view engine", "hbs");
const viewsPath=path.join(__dirname,"../templates/views");
app.set("views",viewsPath);
//db connection
require("./db/conn");
app.use(express.json());
const { resolveSoa } = require("dns");
app.use(express.urlencoded({extended:false}));
app.get("/", (req,res)=>{
    res.render("index");
});
app.get("/register", (req,res)=>{
    res.render("register");
});

//registering user data to database

app.post("/register", async(req,res)=>{
    try{
         const password = req.body.password;
         const cpassword = req.body.cpassword;
         const name = req.body.name;
         const email = req.body.email;
        let errors = [];
        User.findOne({username:name}).then(user=>{
            if(user){
                errors.push({msg: 'Username already taken'});
                res.render('register',{msg: 'Username already taken'});
            }
         })
        User.findOne({useremail:email}).then(user=>{
        if(user){
            errors.push({msg: 'Email already exists'});
            res.render('register',{msg: 'Email already exists'});
        }
        })
         if(password===cpassword){
         const user = new User({
         username : req.body.name,
         useremail : req.body.email,
         userpassword : req.body.password
        });
        const savedata = await user.save();
        res.render("register", {msg : `${name} , You registered successfully`}); 
    }
    else{
        res.render("register", {msg : "Password are not matching"});
    }
    }catch(err){
       console.log(err);
    }

})

// login part

app.post("/", async(req, res)=>{
    try{
      const user = req.body.user;
      const password = req.body.password;
      console.log(user);
      const ismatchuser = await User.findOne({username:user});
      const ismatchemail = await User.findOne({useremail:user});
      console.log(ismatchemail);
      if(ismatchuser){
           if(ismatchuser.userpassword === password){
             res.render("home", {msg : `${ismatchuser.username}`});
           }else{
            res.render("index", {msg : "Invalid password"});
           }
      }else if(ismatchemail){
        if(ismatchemail.userpassword === password){
            res.render("home", {msg : `${ismatchemail.username}`});
          }else{
           res.render("index", {msg : "Invalid password"});
          }
      }
      else{
        res.render("index", {msg : "Invalid username"});
      }
    }catch(err){
     console.log(err);
    }
})

app.use(express.static(staticPath));
app.listen(3000,()=>{
    console.log("Success at port 3000");
})