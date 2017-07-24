const formidable = require('formidable');
const User = require('../models/User');
const fsUtil = require('../models/fsUtil');
const path = require('path');
const gm = require('gm');
const url = require('url');
const fs = require('fs');
const relation = require('../models/relation');

module.exports.retrieveUserInfo = (req, res) => {
    let UserInfo = {
        userphone: req.session.userphone
    }
    User.getUser(UserInfo, (err, result) => {
        if (err) {
            res.send({
                results: 'error'
            });
            return;
        }
        var _u = {
            userphone: result.userphone,
            useravatar: result.useravatar,
            usernickname: result.usernickname
        }
        res.send({
            results: _u
        });
    })
}

module.exports.changeUserInfo = (req, res) => {
    const form = formidable.IncomingForm();
    form.parse(req, (err, fields) => {
        if (err) {
            res.send({
                results: 'error'
            });
            return;
        }
        let usernickname = fields.usernickname;
        if (/[^\w\u4E00-\u9FA5]/.test(usernickname)) {
            res.send({
                results: 'badrequest'
            });
            return;
        }
        let _u = {
            userphone: req.session.userphone,
            usernickname: fields.usernickname
        }
        User.updateUser(_u, (err) => {
            if (err) {
                res.send({
                    results: 'error'
                });
                return;
            }
            res.send({
                results: 'success'
            });
        })
    });
}

module.exports.changeUserAvatar = (req, res) => {
    const form = formidable.IncomingForm();
    form.uploadDir = path.resolve(__dirname, '..', 'www/temp/');
    form.parse(req, (err, fields, files) => {
        if (err) {
            res.send({
                results: 'error'
            });
            return;
        }
        const format = path.extname(files.useravatar.name);
        if (!/\.jpg|\.jpeg|\.png/i.test(format)) {
            res.send({
                results: 'badrequest'
            });
            return;
        }
        req.session._useravatar_filename = path.basename(url.parse(files.useravatar.path).pathname);
        res.redirect('/cutavatar');
    });
}

module.exports.cutavatar = (req, res) => {
    res.render('cut', {
        url: `/temp/${req.session._useravatar_filename}`
    });
}

module.exports.gmprocess = (req, res) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields) => {
        if (err) {
            res.send({
                results: 'success'
            });
            return;
        }
        let w = Number(fields.width);
        let h = Number(fields.height);
        let _w = Number(fields._width);
        let _h = Number(fields._height);
        let x = Number(fields.left);
        let y = Number(fields.top);
        gm(path.resolve(__dirname, '..', `www/temp/${req.session._useravatar_filename}`)).size((err, size) => {
            if (err) {
                res.send({
                    results: 'error'
                });
                return;
            }
            const ori_w = size.width;
            const ori_h = size.height;
            let rate_x = ori_w / _w;
            let rate_y = ori_h / _h;
            let c_x = x * rate_x;
            let c_y = y * rate_y;
            let c_w = w * rate_x;
            let c_h = h * rate_y;
            fsUtil.createFolder(path.resolve(__dirname, '..', `www/static/users/${req.session.userphone}/avatar/md/${req.session._useravatar_filename}`));
            fsUtil.createFolder(path.resolve(__dirname, '..', `www/static/users/${req.session.userphone}/avatar/lg/${req.session._useravatar_filename}`));
            fsUtil.createFolder(path.resolve(__dirname, '..', `www/static/users/${req.session.userphone}/avatar/sm/${req.session._useravatar_filename}`));
            gm(`./www/temp/${req.session._useravatar_filename}`)
                .crop(c_w, c_h, c_x, c_y)
                .resize(100, 100)
                .write(path.resolve(__dirname, '..', `www/static/users/${req.session.userphone}/avatar/md/${req.session._useravatar_filename}`), (err) => {
                    //通知数据库，改写这个用户的头像
                    if (err) {
                        res.send({
                            results: 'error'
                        });
                        return;
                    }

                    User.updateUser({
                        userphone: req.session.userphone,
                        useravatar: `/static/users/${req.session.userphone}/avatar/md/${req.session._useravatar_filename}`
                    }, (err) => {
                        if (err) {
                            res.send({
                                results: 'error'
                            });
                            return;
                        }
                        res.send({
                            results: 'success'
                        });
                        return;
                    });


                });
            gm(`./www/temp/${req.session._useravatar_filename}`)
                .crop(c_w, c_h, c_x, c_y)
                .resize(200, 200)
                .write(path.resolve(__dirname, '..', `www/static/users/${req.session.userphone}/avatar/lg/${req.session._useravatar_filename}`), () => {});
            gm(`./www/temp/${req.session._useravatar_filename}`)
                .crop(c_w, c_h, c_x, c_y)
                .resize(80, 80)
                .write(path.resolve(__dirname, '..', `www/static/users/${req.session.userphone}/avatar/sm/${req.session._useravatar_filename}`), () => {});
        });
    });
}

//--------以下部分是评论功能区

module.exports.createPost = (req, res) => {
    const form = formidable.IncomingForm();
    form.parse(req, (err, fields) => {
        if (err) {
            res.send({
                results: 'error'
            });
            return;
        }
        var _t = {
            userphone: Number(req.session.userphone),
            posttitle: fields.posttitle,
            postcontent: fields.postcontent
        }

        if (_t.posttitle === '' || /<\s*script>|<\/script>|<\s*style>|<\/style>/.test(_t.posttitle) || _t.postcontent === '' || /<\s*script>|<\/script>|<\s*style>|<\/style>/.test(_t.postcontent)) {
            res.send({
                results: 'badrequest'
            });
            return;
        }
        relation.createPost(_t, (err) => {
            if (err) {
                res.send({
                    results: 'error'
                });
                return;
            }
            res.send({
                results: 'success'
            });
        });

    });
}

function dpclone(obj) {
    if (typeof obj === 'function') {
        return;
    }
    if (({}).toString.call(obj) === '[object Object]') {
        var _o = {};
        Object.keys(obj).forEach(function(prop) {
            if (/^_id|^__v|password|phone|\$__|\$init|isNew/.test(prop)) {
                return;
            }
            _o[prop] = dpclone(obj[prop]);
        });
        return _o;
    }
    if (({}).toString.call(obj) === '[object Array]') {
        var _arr = [];
        obj.forEach(function(item, index) {
            _arr[index] = dpclone(item);
        });
        return _arr;
    }
    if (/^number$|^string$|^boolean$/.test(typeof obj)) {
        return obj;
    }
}

module.exports.showPosts = (req, res) => {
    const form = formidable.IncomingForm();
    form.parse(req, (err, fields) => {
        if (err) {
            res.send({results: 'error'});
            return;
        }
        const _t = {
            page: Number(fields.page),
            limit: !isNaN(Number(fields.limit)) ? Number(fields.limit) : 10
        }
        relation.showPosts(_t, (err, results) => {
            if (err) {
                res.send({
                    results: 'error'
                });
                return;
            }
            res.send({
                results: results,
            });
        });
    })

}

module.exports.mkComment = (req, res) => {
    const form = formidable.IncomingForm();
    form.parse(req, (err, fields) => {
        if (err) {
            res.send({
                results: 'error'
            });
            return;
        }
        let _t = {
            userphone: req.session.userphone,
            poststamp: Number(fields.poststamp),
            commentcontent: fields.commentcontent
        }
        if (isNaN(_t.poststamp) || !_t.commentcontent || /<\s*script|<\s*style/.test(_t.commentcontent)) {
            res.send({
                results: 'badrequest'
            });
            return;
        }
        relation.writeComment(_t, (err) => {
            if (err) {
                res.send({
                    results: 'error'
                });
                return;
            }
            res.send({
                results: 'success'
            });
        })
    })
}

module.exports.getCommenter = (req, res) => {
    const form = formidable.IncomingForm();
    form.parse(req, (err, fields)=>{
        if (err) {
            res.send({results: 'error'});
            return;
        }
        User.find({
            _id: fields.userid
        }).exec((err, results)=>{
            if (err) {
                res.send({results: 'error'});
                return;
            }
            res.send({results: results[0]});
        })
    })
}