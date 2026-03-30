const mongoose=require('mongoose')
const express=require('express')
const app=express()
const path=require("path")
app.use(express.json())
app.use(express.static("public"))
mongoose.connect("mongodb://localhost:27017/random").then(
    ()=> console.log("connected")
).catch(()=>{
    console.log("connection error")
})


const Student_Schema=new mongoose.Schema({
    name: String,
    age: Number
})

const Student_Model=new mongoose.model("Student", Student_Schema)
app.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname, "ui.html"))
})
app.get("/api/students", (req,res)=>{
    Student_Model.find().then(
        (response)=>{
            res.json(response)
        }
    ).catch((err)=>console.log(err))
})

app.post("/api/students",async(req, res)=>{
    const s=await new Student_Model({name: req.body.name , age:req.body.age}).save()
    if(s){
        res.send("added")  
      }else{
        res.send("error")
      }

})

app.listen(3000, ()=> console.log("serveris running"))