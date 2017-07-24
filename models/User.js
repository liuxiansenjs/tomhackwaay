const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
    userphone: Number,
    userpassword: String,
    usernickname: String,
    useravatar: {
    	type: String,
    	default: '/static/users/default/avatar/md/user_avatar.jpg'
    },
    posts: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Post'
    }
});


UserSchema.statics.isNotExist = function ({userphone}, callback) {
    this.count({
        userphone
    }, (err, amount) => {
        if (err) {
        	callback(err);
        	return;
        }
        if (amount === 0) {
        	callback && callback(undefined, true);
        	return;
        } else {
        	callback && callback(undefined, false);
        	return;
        }
    })
}

UserSchema.statics.createUser = function ({ userphone, userpassword, usernickname }, callback) {
        new User({
            userphone,
            userpassword,
            usernickname
        }).save((err)=>{
        	if (err) {
        		callback(err);
        		return;
        	}
        	callback && callback();
        });
}

UserSchema.statics.getUser = function ({userphone}, callback) {
	this.find({userphone: userphone}).exec((err, results) => {
		if (err) {
			callback && callback(err);
			return;
		}
		callback && callback(undefined, results[0]);
	});
}

UserSchema.statics.createPost = function({userphone, postid}, callback) {
    this.find({userphone: userphone}).exec((err, results)=>{
        if (err) {
            callback && callback(err);
            return;
        }
        let result = results[0];
        result.posts.push(postid);
        result.save((err)=>{
            if (err) {
                callback & callback(err);
                return;
            }
            callback && callback(undefined, result);
        });
    });
}

UserSchema.statics.updateUser = function({userphone, usernickname, useravatar},callback) {
    let _u = {};
    if(typeof usernickname === 'string') {
        _u.usernickname = usernickname;
    }
    if(typeof useravatar === 'string') {
        _u.useravatar = useravatar;
    }
    let _s = {$set: _u};
    this.update({userphone: userphone}, _s, function(err) {
        if (err) {
            callback && callback(err);
            return;
        }
        callback && callback();
    });
}

const User = mongoose.model('User', UserSchema);



module.exports = User;