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

app.use(express.json())
app.use(express.urlencoded({ extended: true}))

app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

var securityLevel = 0;

app.get("/", (req, res) => {
  res.render("pages/index", {
    securityLevel: securityLevel
  });
});

app.get("/brokenauth", (req, res) => {
  res.render("pages/brokenAuth/brokenAuth", {
    securityLevel: securityLevel
  });
});

app.get("/xss", (req, res) => {
  res.render("pages/xss/xss", {
    securityLevel: securityLevel
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
    lastName: lastName
  });
});


app.get("/insecuredeserialization", (req, res) => {
  res.render("pages/insecureDeserialization/insecureDeserialization", {
    securityLevel: securityLevel
  });
});

app.post("/insecuredeserialization", (req, res) => {

  if(securityLevel == 0) {
    try {
      var str = Buffer.from(req.body.serObj, 'base64').toString();
      var obj = serialize.unserialize(str);

      res.render("pages/insecureDeserialization/insecure", {
        securityLevel: securityLevel,
        obj: obj
      });

    } catch(error) {
      res.send("No serialized object")
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
      validationMap: validationMap
    });
  }
});

app.get("/security", (req, res) => {
  securityLevel = securityLevel == 0 ? 1 : 0;
  res.end();
});

app.listen(port, () => console.log(`Listening on ${port}`));