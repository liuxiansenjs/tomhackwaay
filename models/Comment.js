const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
	post: {type: Schema.Types.ObjectId, ref: 'Post'},
	commenter: {type: Schema.Types.ObjectId, ref: 'User'},
	commentcontent: String
});

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;