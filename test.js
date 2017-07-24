const User = require('./models/User.js');


console.log(User.isNotExist);
User.isNotExist(13520920400, function(err, results) {
	console.log(err, results);
})

User.count({
        userphone: 13520920400
    }, (err, amount) => {
        console.log(err, amount);
    })