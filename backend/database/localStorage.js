/**
 * Created by vikram on 31/7/17.
 */
let passport = require('passport');
let multer  = require('multer');
let fs = require('fs');
let path = require('path');


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let option = req.query.option
        let dir = '';
        if(['jpeg','png','jpg','bmp'].indexOf(req.file.originalname.split('.').pop()) > -1){
            dir = './profilePictureUploads/'+req.file.originalname.split('.')[0]+'/';
            console.log('path for profile image is ',dir)
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir);
            }
        }else{
            dir = './uploads/';
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir);
            }
            option = option.replace("/", "_")
            option = option.replace(" ", "_")
            option = option.replace(" ", "_")
            dir += option + "/"
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir);
            }
        }
        cb(null, dir)
    },
    filename: function (req, file, cb) {
        let user_id =  req.session.passport.user.user_id;
        let username = req.user.username;
        cb(null, file.originalname)
    }
})

module.exports= {


    upload : multer({ storage: storage }).single('file')
}