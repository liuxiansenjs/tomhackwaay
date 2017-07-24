const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
	poster: { type: Schema.Types.ObjectId, ref: 'User' },
	comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}],
	posttitle: String,
	postcontent: String,
	postimages: [String],
	posttime: Number,
	poststamp: Number,
});

PostSchema.statics.createPost = function({postid, poster, posttitle, postcontent, postimages}, callback) {
	const date = Number(new Date());
	const poststamp = Number(String(date) + (function () {
    return [Math.floor(Math.random()*10),Math.floor(Math.random()*10),Math.floor(Math.random()*10),Math.floor(Math.random()*10)].join("");
}()));
	new Post({
		_id: postid,
		poster: poster,
		posttitle: posttitle,
		postcontent: postcontent,
		postimages: postimages,
		posttime: date,
		poststamp: poststamp
	}).save((err)=>{
		if (err) {
			callback && callback(err);
			return;
		}
		callback && callback();
	});
}


const Post = mongoose.model('Post', PostSchema);


module.exports = Post;