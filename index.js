const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
var _=require("lodash");
let alert=require('alert');
const app = express();
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.get("/",function(req,res){
    res.render('doct');
})
app.get("/faq",function(req,res){
    res.render('faq');
})
app.get("/hosp",function(req,res){
    res.render('hosp');
})
app.get("/pp",function(req,res){
    res.render('patient_profile');
})
app.listen(process.env.PORT||4000,function(){
    console.log("server started on 4000");
})