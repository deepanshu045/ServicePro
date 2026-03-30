const express=require("express")
const routes=express.Router()
const path=require('path')

routes.get("/", (req,res)=>{
    res.sendFile(path.join(__dirname, "ui.html"))
})

routes.get("/student", (req, res)=>{
    res.json({
        name:"Hari",
        age: 33
    })
})

module.exports=routes