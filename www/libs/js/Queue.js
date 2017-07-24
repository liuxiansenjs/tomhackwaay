(function() {
function Queue () {
	var self = this;
	this.frame = 0;
	this.queue = [];

	setInterval(function() {
		(function() {
			var _a = [], _cobj;
			for (var i = 0; i < self.queue.length; i++) {
				_cobj = self.queue[i];
				if (_cobj.frame === self.frame) {
					_cobj.fn.apply(_cobj.context, _cobj.args);
					_a[i] = true;
				}
			}
			for (var j = 0; j < _a.length; j++) {
				if (_a[j]) {
					self.queue.splice(j, 1);
				}
			}
		}());
		self.frame++;
	}, 200);
}

Queue.prototype.registerEvent = function(obj) {
	var _c = {
		fn: obj.fn || function() {},
		frame: (typeof obj.delay === 'number' ? Math.floor(obj.delay) : 0) + this.frame + 1,
		context: obj.context || null,
		args: obj.args || null
	}
	this.queue.push(_c);
	return this;
}
window.Queue = Queue;
}());