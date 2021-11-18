const cookierParser = require('cookie-parser');
const dotenv = require('dotenv');
dotenv.config();

function initCookieAuth(app) {
  app.use(cookierParser(process.env.COOKIE_KEY));
}

function getUserFromCookie(req, res, next) {  
    const username = req.signedCookies?.user;  
    if (username) { 
        req.user = {
            isAuthenticated : true,
            username
        };
    } else {
        req.user = {
            isAuthenticated : false      
        };
    }
    next(); 
}

function signInUser(res, username) {
  res.cookie('user', username, {
      signed : true,
      httpOnly: true
  });
}

function signOutUser(res, username) {
  res.clearCookie('user');
}

module.exports = {getUserFromCookie, initCookieAuth, signInUser, signOutUser};