var express = require("express");
var app = express();
var http = require("http");
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
server.listen(process.env.PORT || 3000, function(){console.log("server start hi hi")});
var mysql = require('mysql');
var nodemailer = require('nodemailer');
var con = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "Vuyeungan1995@",
 database : "windlaxy",
 queueLimit: 30,
  acquireTimeout: 1000000
});
let CheckMobi = require('omrs-checkmobi');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'windlaxy@gmail.com',
    pass: 'spihrtkjqhqnduml'
  }
});

function strencode( data ){return unescape( encodeURIComponent(data));}
function strdecode( data ){
  return JSON.parse( decodeURIComponent( escape ( data ) ) );
}
var passwordHash = require('password-hash');
var bodyParser = require('body-parser');
let cb = new CheckMobi('BECCEBC1-DB76-4EE7-B475-29FCF807849C');

var urlencodedParser = bodyParser.urlencoded({ extended: false })
isArray = function(a) {
    return (!!a) && (a.constructor === Array);
}

con.connect(function(err) {
    if (err) { console.log(" da co loi:" + err);}
    else {

  function kiemtra_taikhoan(){
    setTimeout(function() {
    //sau mỗi phút, kiêm tra db và xóa các bản tin đã quá 10 phút ==600 giây
    // var date2 = Math.floor(Date.now() / 1000) - 600;
    var date3=Math.floor(Date.now() / 1000) - 300;
    con.query(" DELETE FROM `active` WHERE `time` < "+date3, function(err){if(err)console.log('co loi HA HA HA:'+err);});
    kiemtra_taikhoan();
  }, 5000);
}
 kiemtra_taikhoan();

io.on('connection',(socket)=>
{
console.log(socket.id);
  socket.emit('check_pass');
  socket.on('disconnect',()=>{
    console.log('Disconnect');
  });
          // con.query("CREATE TABLE IF NOT EXISTS  `"+tin.mail+"caro` (`id` BIGINT NOT NULL AUTO_INCREMENT, `mail` VARCHAR(45) NOT NULL,`name` VARCHAR(45)  NULL,`ta` INT(5) NULL , `ban` INT(5) NULL , `loai_ban` CHAR(3),`danhan` CHAR(3), PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC))", function(){});


});
}});
