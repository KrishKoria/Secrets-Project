import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
// import mongooseEncryption from "mongoose-encryption";
// import md5 from "md5";
import bcrypt from "bcrypt";

const saltRounds = 10;

const app = express();
const port = 3000;

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/secretsDB");


const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// userSchema.plugin(mongooseEncryption, {secret:process.env.SECRET_KEY, encryptedFields: ["password"]});

const User = new mongoose.model("User", userSchema);

app.get("/", (req, res) => {
    res.render("home.ejs");
});
app.get("/login", (req, res) => {
    res.render("login.ejs");
});
app.get("/register", (req, res) => {
    res.render("register.ejs");
});

app.post("/register", async (req, res) => {
    try {
        bcrypt.hash(req.body.password, saltRounds, async (err, hash) => {
            const newUser = new User({
                email: req.body.username,
                password: hash
            });
            await newUser.save();
            res.render("secrets.ejs");
        })
    } catch (err) {
        console.log(err);
    }
});
app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    try {
        const foundUser = await User.findOne({email: username});
        if (foundUser) {
            bcrypt.compare(password, foundUser.password, (err, result) => {
                if (result === true) {
                    res.render("secrets.ejs");
                } else {
                    res.send("Wrong password");
                }
            })
        }
    } catch (err) {
        console.log(err);
    }
});
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});