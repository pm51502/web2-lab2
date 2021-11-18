const express = require("express");
const path = require("path");
const cors = require('cors');
const sanitizeHtml = require('sanitize-html');
var escape = require('escape-html');
var serialize = require('node-serialize');

const app = express();
app.use(cors());
app.options('*', cors());

const dotenv = require("dotenv");
const { format } = require("path");
dotenv.config();
const port = process.env.PORT || 3000;

const auth = require("./auth-middleware");
auth.initCookieAuth(app);
app.use(auth.getUserFromCookie);

app.use(express.json())
app.use(express.urlencoded({ extended: true}))

app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

var securityLevel = 0;

app.get("/", (req, res) => {
  res.render("pages/index", {
    securityLevel: securityLevel,
    user: req.user
  });
});


app.get("/login", (req, res) => {
  res.render("pages/brokenAuth/login", {
    securityLevel: securityLevel,
    user: req.user,
    msg: ""
  });
});

app.post('/login',  function (req, res) {    
  let username = req.body.username;
  let password = req.body.password;

  if(securityLevel == 0) {
    msg = ""
    if(username !== "admin") {
      msg += "Incorrect username;";
      if(username.length != 5) msg += "Incorrect username length;";
    }
    if(password !== "admin123") {
      msg += "Incorrect password;";
      if(password.length != "8") msg += "Incorrect password length;";
    }
    
    if(username != "admin" || password != "admin123") {
      res.render("pages/brokenAuth/login", {
        securityLevel: securityLevel,
        user: req.user,
        msg: msg
      });
    } else {
        auth.signInUser(res, username);
        
        res.render("pages/brokenAuth/private", {
          securityLevel: securityLevel,
          user: {
            isAuthenticated : true,
          },
          msg: ""
        });
    }
  } else {
    let q1 = req.body.question1;
    let q2 = req.body.question2;

    if(username != "admin" || password != "B%MR9RWVRjJhKTw$bSgJvwzATH+fy_ygBqk4E-$GVwEHfcdEc5gvE33454gjNFeR"
      || q1 != "fried nuts" || q2 != "os fkf") {
      res.render("pages/brokenAuth/login", {
        securityLevel: securityLevel,
        user: req.user,
        msg: "Incorrect credentials"
      });
    } else {
        auth.signInUser(res, username);
        
        res.render("pages/brokenAuth/private", {
          securityLevel: securityLevel,
          user: {
            isAuthenticated : true,
          },
          msg: ""
        });
    }
  }
});

app.post("/logout",   function (req, res) {
  auth.signOutUser(res);
  res.end();
});


app.get("/xss", (req, res) => {
  res.render("pages/xss/xss", {
    securityLevel: securityLevel,
    user: req.user
  });
});

app.post("/xss", (req, res) => {
  let firstName;
  let lastName;
  
  if(securityLevel == 0) {
    firstName = req.body.fname;
    lastName = req.body.lname;
  } else {
    firstName = sanitizeHtml(req.body.fname);
    lastName = sanitizeHtml(req.body.lname);
  }
  
  res.render("pages/xss/user", {
    securityLevel: securityLevel,
    firstName: firstName,
    lastName: lastName,
    user: req.user
  });
});


app.get("/insecuredeserialization", (req, res) => {
  res.render("pages/insecureDeserialization/insecureDeserialization", {
    securityLevel: securityLevel,
    error: false,
    user: req.user
  });
});

app.post("/insecuredeserialization", (req, res) => {

  if(securityLevel == 0) {
    try {
      var str = Buffer.from(req.body.serObj, 'base64').toString();
      var obj = serialize.unserialize(str);

      res.render("pages/insecureDeserialization/insecure", {
        securityLevel: securityLevel,
        obj: obj,
        user: req.user
      });

    } catch(error) {
      res.render("pages/insecureDeserialization/insecureDeserialization", {
        securityLevel: securityLevel,
        error: true,
        user: req.user
      });
    }
  } else {
    var str = Buffer.from(req.body.serObj, 'base64').toString();
    var obj = JSON.parse(str);
    
    var regex = /[^\p{L}\d\s@#]/u;
    let validationMap = new Map();

    for(let [key, value] of Object.entries(obj)) {
      let isValid = !regex.test(value);
      let label = isValid ? "Valid input" : "Invalid input"
      validationMap.set(key, [value, label]);
    }

    res.render("pages/insecureDeserialization/secure", {
      securityLevel: securityLevel,
      validationMap: validationMap,
      user: req.user
    });
  }
});

app.get("/security", (req, res) => {
  securityLevel = securityLevel == 0 ? 1 : 0;
  res.end();
});

app.listen(port, () => console.log(`Listening on ${port}`));