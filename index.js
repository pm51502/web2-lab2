const express = require("express");
const path = require("path");
const cors = require('cors');
const validator = require('validator');

const app = express();
app.use(cors());
app.options('*', cors());

const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT || 3000;

app.use(express.json())
app.use(express.urlencoded({ extended: true}))

app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

var securityLevel = 0;

app.post("/", (req, res) => {
  let firstName = req.body.fname;
  let lastName = req.body.lname;

  res.render("pages/user", {
    securityLevel: securityLevel,
    firstName: firstName,
    lastName: lastName
  });
  
  // if(securityLevel == 0) {
  //   firstName = req.body.fname;
  //   lastName = req.body.lname;
    
  //   res.render("pages/user", {
  //     securityLevel: securityLevel,
  //     firstName: firstName,
  //     lastName: lastName
  //   });
  // } else {
  //   firstName = new String(validator.escape(req.body.fname));
  //   lastName = new String(validator.escape(req.body.lname));

  //   if (firstName.valueOf() != new String(req.body.fname).valueOf() 
  //       || lastName.valueOf() != new String(req.body.lname).valueOf()){
  //     firstName = "";
  //     lastName = "";
  //   }

  //   res.render("pages/user", {
  //     securityLevel: securityLevel,
  //     firstName: firstName,
  //     lastName: lastName
  //   });
  // }
});

app.get("/security", function(req, res) {
  securityLevel = securityLevel == 0 ? 1 : 0;
  res.end();
});

app.listen(port, () => console.log(`Listening on ${port}`));