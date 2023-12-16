import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
// import mongooseEncryption from "mongoose-encryption";
// import md5 from "md5";
// import bcrypt from "bcrypt";
// const saltRounds = 10;

// Working With passport.js Now
import session from "express-session";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";
const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    secret: "Thisismysecretkey",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/secretsDB");


const userSchema = new mongoose.Schema({
    email: String,
    password: String
});
userSchema.plugin(passportLocalMongoose);
// userSchema.plugin(mongooseEncryption, {secret:process.env.SECRET_KEY, encryptedFields: ["password"]});

const User = new mongoose.model("User", userSchema);


passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser(function (user, done) {
    done(null, user.id);
}));
passport.deserializeUser(User.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });

}));

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
    // try {
    //     bcrypt.hash(req.body.password, saltRounds, async (err, hash) => {
    //         const newUser = new User({
    //             email: req.body.username,
    //             password: hash
    //         });
    //         await newUser.save();
    //         res.render("secrets.ejs");
    //     })
    // } catch (err) {
    //     console.log(err);
    // }

    //Working with passport.js Now
    User.register({username: req.body.username}, req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets");
            });
        }
    });
});
app.get("/secrets", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("secrets.ejs");
    } else {
        res.redirect("/login");
    }
});
app.post("/login", async (req, res) => {
    // const username = req.body.username;
    // const password = req.body.password;
    // try {
    //     const foundUser = await User.findOne({email: username});
    //     if (foundUser) {
    //         bcrypt.compare(password, foundUser.password, (err, result) => {
    //             if (result === true) {
    //                 res.render("secrets.ejs");
    //             } else {
    //                 res.send("Wrong password");
    //             }
    //         })
    //     }
    // } catch (err) {
    //     console.log(err);
    // }
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, (err) => {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets");
            });
        }
    });
});
app.get("/logout", (req, res) => {
   req.logout((err) => {
         if (err) {
              console.log(err);
         }
       res.redirect('/');
   });
});
app.listen(3000, () => {
    console.log(`Server started on port 3000`);
});