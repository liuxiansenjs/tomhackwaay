const mongoose = require('mongoose');
const User = require('./User');
const Post = require('./Post');
const Comment = require('./Comment');

const Schema = mongoose.Schema;

const createPost = ({userphone, posttitle, postcontent, postimages}, callback) => {
	const postid = new mongoose.Types.ObjectId;
	User.createPost({
		userphone: userphone,
		postid: postid
	}, (err, result) => {
		if (err) {
			callback && callback(err);
			return;
		}
		const userid = result._id;
		Post.createPost({
			postid: postid,
			poster: userid,
			posttitle: posttitle,
			postcontent: postcontent,
			postimages: postimages
		}, (err) => {
			if (err) {
				callback && callback(err);
				return;
			}
			callback && callback();
		});
	});
}
//{page, limit}, callback
const showPosts = ({page, limit}, callback) => {
	Post.find({}).populate([{path: 'poster', select: '-userpassword'},{path: 'comments'}]).sort({_id: -1}).skip(page * limit).limit(limit).exec((err, docs)=>{
		callback && callback(err, docs);
	});
}

const writeComment = ({userphone, poststamp, commentcontent}, callback) => {
	User.getUser({userphone: userphone}, (err, user)=>{
		if (err) {
			callback && callback(err);
			return;
		}
		Post.find({poststamp: poststamp}).exec((err, posts)=>{
			if (err) {
				callback && callback(err);
				return;
			}
			const post = posts[0];
			const commentId = new mongoose.Types.ObjectId;
			post.comments.push(commentId);
			post.save((err)=>{
				if (err) {
					callback && callback(err);
					return;
				}
				new Comment({
					_id: commentId,
					post: post._id,
					commenter: user._id,
					commentcontent: commentcontent
				}).save((err)=>{
					if (err) {
						callback && callback(err);
						return;
					}
					callback && callback();
				});
			});
		});
	});
}

module.exports = {
	createPost,
	showPosts,
	writeComment
}