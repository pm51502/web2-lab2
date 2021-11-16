const express = require("express");
const path = require("path");
const cors = require('cors');
const sanitizeHtml = require('sanitize-html');

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

app.get("/", (req, res) => {
  res.render("pages/index", {
    securityLevel: securityLevel
  });
});

app.post("/", (req, res) => {
  let firstName;
  let lastName;
  
  if(securityLevel == 0) {
    firstName = req.body.fname;
    lastName = req.body.lname;
  } else {
    firstName = sanitizeHtml(req.body.fname);
    lastName = sanitizeHtml(req.body.lname);
  }

  res.render("pages/user", {
    securityLevel: securityLevel,
    firstName: firstName,
    lastName: lastName
  });
});

app.get("/security", (req, res) => {
  securityLevel = securityLevel == 0 ? 1 : 0;
  res.end();
});

app.listen(port, () => console.log(`Listening on ${port}`));