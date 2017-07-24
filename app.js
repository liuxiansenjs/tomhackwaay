const express = require('express');
var session = require('express-session');
const ejs = require('ejs');
const mongoose = require('mongoose');
const loginController = require('./controllers/loginController');
const appController = require('./controllers/appController')
mongoose.connect('mongodb://127.0.0.1:27017/plunk');

const app = express();
app.set('view engine', 'ejs');
app.use(session({
	secret: '真的是超神哥',
	resave: false,
	saveUninitialized: true
}));

app.get('/login', loginController.renderLoginPage);
app.post('/register', loginController.register);
app.post('/register/check', loginController.check);
app.post('/authentication', loginController.authentication);
app.post('/logout', loginController.logout);


//---------以下内容均需登录才能访问
app.use(loginController.verify);
app.post('/retrieveUserInfo', appController.retrieveUserInfo);
app.post('/changeUserInfo', appController.changeUserInfo);
app.post('/changeUserAvatar', appController.changeUserAvatar);
app.get('/cutavatar', appController.cutavatar);
app.post('/gmprocess', appController.gmprocess);





//---------评论区
app.post('/createPost', appController.createPost);
app.post('/showPosts', appController.showPosts);
app.post('/mkComment', appController.mkComment);
app.post('/getCommenter', appController.getCommenter);





app.use(express.static(`${__dirname}/www`));


app.listen(12345);
