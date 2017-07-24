const formidable = require('formidable');
const User = require('../models/User');

module.exports.renderLoginPage = (req, res) => {
	res.render('login', {});
}

module.exports.authentication = (req, res) => {
	const form = formidable.IncomingForm();
	form.parse(req, (err, fields) => {
		if (err) {
			res.send({results: 'error'});
			return;
		}
		const registerInfo = {
			userphone: Number(fields.userphone),
			userpassword: fields.userpassword
		}
		if (!/\d{11}/.test(registerInfo.userphone) || /<script>|<\/script>/.test(registerInfo.userpassword) || registerInfo.userpassword === '') {res.send({results: 'badrequest'}); return;}
		User.getUser(registerInfo, (err, result) => {
			if (err) {
				res.send({results: 'success'});
				return;
			}
			if (result && result.userpassword === registerInfo.userpassword) {
				req.session.isLoggedIn = true;
				req.session.userphone = result.userphone;
				req.session.usernickname = result.usernickname;
				res.send({results: 'success'});
			} else {
				res.send({results: 'error'});
			}
		});

	});
}

module.exports.register = (req, res) => {
	const form = formidable.IncomingForm();
	form.parse(req, (err, fields) => {
		if (err) {
			res.send({results: 'error'});
			return;
		}
		const registerInfo = {
			userphone: Number(fields.userphone),
			userpassword: fields.userpassword,
			usernickname : (function() {
    			var arr = ['曹操', '貂蝉', '诸葛亮', '刘备', '西施', '鲁智深', '林黛玉', '王昭君'];
    			return arr[Math.floor(Math.random()*arr.length)];
    		}())
		}
		if (!/\d{11}/.test(registerInfo.userphone) || /<script>|<\/script>|<style>|<\/style>/.test(registerInfo.userpassword) || registerInfo.userpassword === '') {res.send({results: 'badrequest'}); return;}
		User.isNotExist(registerInfo, function(err, results) {
			if (err) {
				res.send({results: 'error'});
				return;
			}
			if (results) {
				User.createUser(registerInfo, function(err) {
					if (err) {
						res.send({results: 'error'});
						return;
					}
					req.session.isLoggedIn = true;
					req.session.userphone = registerInfo.userphone;
					req.session.usernickname = registerInfo.usernickname;
					res.send({results: 'success'});
					return;
				});
			} else {
				res.send({results: 'taken'});
				return;
			}
		})
	});
}

module.exports.verify = (req, res, next) => {
	if (req.session.isLoggedIn === true) {
		next('route');
		return;
	}
	if (/^\/libs\//.test(req.url)) {
		next('route');
		return;
	}
	res.redirect('/login');
}

module.exports.check = (req, res) => {
	const form = formidable.IncomingForm();
	form.parse(req, (err, fields) => {
		if (err) {
			res.send({results: 'error'});
			return;
		}
		const registerInfo = {
			userphone: Number(fields.userphone),
		}

		if (/[\D]/.test(registerInfo.userphone) || /<script>|<\/script>|<style>|<\/style>/.test(registerInfo.userpassword)) {res.send({results: 'badrequest'}); return;}
		User.isNotExist(registerInfo, function(err, results) {
			if (err) {
				res.send({results: 'error'});
				return;
			}
			if (results) {
				res.send({results: 'success'});
				return;
			} else {
				res.send({results: 'taken'});
			}
		})
			
	});
}

module.exports.logout = function(req, res) {
	req.session.isLoggedIn = false;
	res.send({results: 'success'});
}