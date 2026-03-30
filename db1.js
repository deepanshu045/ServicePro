
const express=require("express")
const routes=require("./demo")
const app=express()
let names=[]

function middleware(req,res,next){
    console.log("middleware fnc")
    next()
}
app.use(express.json())

app.use("/" , routes)
app.use(middleware)


app.get("/name/:name",(req,res)=>{
    const name=req.params.name
    res.send(name)
})

app.post("/add", (req,res)=>{
    names.push(req.body.name)
    res.send("successful")
})

app.put("/add", (req,res)=>{
   const uN= names.indexOf(req.body.name)
   names[uN]=req.body.nname
   res.send(names)

  
})

app.delete("/add", (req,res)=>{
   const uN= names.find((v,i)=> v!=req.body.name)
   names=uN

  
})

app.listen(3000, ()=>{})