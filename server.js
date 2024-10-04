const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const jwt = require("jsonwebtoken");

let app = express();
app.use(cors());
app.use("/uploads",express.static("uploads"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  }, 

  filename: (req, file, cb) => {
    console.log(file);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${Date.now()}_${file.originalname}`);
  },

});

const upload = multer({ storage: storage });

let userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  age: Number,
  email: String,
  password: String,
  mobileNo: String,
  profilePic: String,
});

let User = new mongoose.model("user", userSchema);

app.post("/Login", upload.none(), async (req, res) => {
    console.log(req.body);
    let userDetails = await User.find().and({email:req.body.email});

    if(userDetails.length > 0){
        console.log(userDetails);

if(userDetails[0].password == req.body.password){
  let encryptedCred = jwt.sign({email:req.body.email, password:req.body.password},"prudhvi");

let loginDetails ={
    firstName:userDetails[0].firstName,
    lastName:userDetails[0].lastName,
    age:userDetails[0].age,
    email:userDetails[0].email,
    mobileNo:userDetails[0].mobileNo,
    profilePic:userDetails[0].profilePic,
    token: encryptedCred,
};

res.json({status:"Success",data:loginDetails});
}else{
    res.json({status:"Failed",msg:"Invalid Password"});
}      
    }else{
        res.json({status:"Failed",msg:"User doesnot exist"});
    }

  });


app.post("/validateToken", upload.none(), async (req,res) =>{
    console.log(req.body);

    let decryptedCred = jwt.verify(req.body.token,"prudhvi");

    let userDetails = await User.find().and({email:decryptedCred.email});

    if(userDetails.length > 0){
        console.log(userDetails);

if(userDetails[0].password == decryptedCred.password){
  
let loginDetails ={
    firstName:userDetails[0].firstName,
    lastName:userDetails[0].lastName,
    age:userDetails[0].age,
    email:userDetails[0].email,
    mobileNo:userDetails[0].mobileNo,
    profilePic:userDetails[0].profilePic,
};

res.json({status:"Success",data:loginDetails});
}else{
    res.json({status:"Failed",msg:"Invalid Password"});
}      
    }else{
        res.json({status:"Failed",msg:"User doesnot exist"});
    }
  });


app.post("/Signup", upload.single("profilePic"), async (req, res) => {
  console.log(req.body);
  console.log(req.file);

  try {
    let user1 = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      age: req.body.age,
      email: req.body.email,
      password: req.body.password,
      mobileNo: req.body.mobileNo,
      profilePic: req.file.path,
    });

    await User.insertMany([user1]);

    res.json({ status: "Success", msg: "Successfully created User" });
  } catch (error) {
    res.json({ status: "Failed", msg: "Unable to create User", error });
  }
});


app.patch("/updateProfile", upload.single("profilePic"), async (req,res) => {

  try {

  if(req.body.firstName.trim().length > 0) {
    await User.updateMany({email:req.body.email},{firstName:req.body.firstName});
  }

  if(req.body.lastName.trim().length > 0) {
    await User.updateMany({email:req.body.email},{lastName:req.body.lastName});
  }

  if(req.body.age > 0) {
    await User.updateMany({email:req.body.email},{age:req.body.age});
  }

  if(req.body.password.length > 0) {
    await User.updateMany({email:req.body.email},{password:req.body.password});
  }

  if(req.body.mobileNo.trim().length > 0) {
    await User.updateMany({email:req.body.email},{mobileNo:req.body.mobileNo});
  }

  if(req.file && req.file.path) {
    await User.updateMany({email:req.body.email},{profilePic:req.body.path});
  }

  res.json({status: "success", msg: "Profile updated successfully"});
} catch (error) {
  res.json({status: "failure", msg: "Unable to update your profile. Something went wrong. Please try again after sometime"});
}

});

app.delete("/deleteProfile", async (req,res) => {
 let delResult = await User.deleteMany({ email: req.query.email });
 console.log(delResult);

 if(delResult.deletedCount > 0){

   res.json({ status: "success", msg: "User deleted successfully."});
  }else{
  res.json({ status: "failure", msg: "Unable to delete account."});
  }
});

app.listen(4567, () => {
  console.log("Listening to Port 4567");
});

let connectToDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://prudhvireddy:prudhvireddy@prudhvib.jwu4g.mongodb.net/Batch2405Students?retryWrites=true&w=majority&appName=PrudhviB");
    console.log("Succesfully connected to DB");
  } catch (error) {
    console.log("Failed to create database", error);
  }
}; 

connectToDB();