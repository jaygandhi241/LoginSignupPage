const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const User = require('./connection')
const bcrypt = require('bcryptjs')
const session = require("express-session")
const flash=require("connect-flash")
mongoose.connect('mongodb://localhost:27017/login-app-db', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
})
const app = express()
app.use('/', express.static(path.join(__dirname, 'static')))
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: false,
    saveUninitialized: true
	
	

}));
app.use(flash())
app.set("view engine","ejs")
app.get("/",(req,res)=>{
	res.render("dashboard",{message:req.flash("message")})
})
app.get('/add', function(req, res){
	res.render("index",{message:req.flash("message")});
});
 app.get('/login', function(req, res){
	if(req.session.name_id){

	res.redirect("welcome");
	}
	else{
		res.render("login",{message:req.flash("message")})
	}
});
app.get("/welcome",(req,res)=>{
	if(req.session.name_id){
	res.render("welcome",{name:req.session.name_id})
	}
	else{
		req.flash("message","please login")
		res.redirect("/login")
	}
})
app.get("/ERROR",(req,res)=>{
	res.render("ERROR",{message:req.flash("message")})
})
app.get("/REGISTER/ERROR",(req,res)=>{
	res.render("REGERR",{message:req.flash("message")})
})
app.get("/logout",(req,res)=>{
	req.session.destroy((err)=>{
		if(err){
			console.log("error");
		}
		else{
			res.redirect("/login")
		}
	})
})
//register
app.post('/add', async (req, res) => {
     const username=req.body.username;
	 let password=req.body.password;
	 const number=req.body.number ;
	 const name_id=req.body.name_id;
	if (!username || typeof username !== 'string') {
		return res.redirect("/REGISTER/ERROR")
	}
	if (password.length < 5) {
	    return res.redirect("/REGISTER/ERROR")
	}
	password = await bcrypt.hash(password, 10)

	const response = await User.create({
			username,
			password,
			number,
			name_id
	})
	response.save((error,result)=>{
		if(error){
			console.log(error);
		}
		req.flash("message","ADDED SUCCEFULLY")
		res.redirect("/login")
	})
})
app.post('/login',async (req, res) => {
	try{
	   const email=req.body.email
	   const password=req.body.password
	   const useremail=await User.findOne({username:email})
	   console.log(useremail);
       if(useremail){
	   if (await bcrypt.compare(password, useremail.password)) {
            req.flash("message","login succefully")
	     	ses=req.session;
		 	ses.name_id=useremail.name_id
			res.redirect("/welcome")
	    }
		req.flash("message","invalid credential")
	    res.redirect("/ERROR")
	}
	req.flash("message","invalid credential")
	res.redirect("/ERROR")
	}catch(error){
		res.status(400).redirect("/")
	}
})
app.listen(9999, () => {
	console.log('Server up at 9999')
})
