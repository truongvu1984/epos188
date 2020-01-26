var express = require("express");
var app = express();
var http = require("http");
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
server.listen(process.env.PORT || 3000, function(){console.log("server start")});
let CheckMobi = require('omrs-checkmobi');
var mysql = require('mysql');
var con = mysql.createConnection({
  host: "us-cdbr-iron-east-05.cleardb.net",
  user: "b04c2ff40d4e13",
  password: "0fdaedd4",
 database : "heroku_7790b5956b2a5c2",
 queueLimit: 30,
  acquireTimeout: 1000000,
});
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
function strencode( data ){return unescape( encodeURIComponent(data));}
function strdecode( data ){
  return JSON.parse( decodeURIComponent( escape ( data ) ) );
}
var passwordHash = require('password-hash');
let cb = new CheckMobi('BECCEBC1-DB76-4EE7-B475-29FCF807849C');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })
isArray = function(a) {
    return (!!a) && (a.constructor === Array);
}
con.connect(function(err) {
    if (err) { console.log(" da co loi:" + err);}
    else {
function kiemtra_taikhoan(){
  setTimeout(function() {

    var date2 = Math.floor(Date.now() / 1000) - 600;

    con.query(" DELETE FROM `dangky` WHERE `time2` < "+date2, function(err){if(err){console.log('co loi HA HA HA:'+err);}});
    kiemtra_taikhoan();
  }, 5000);
}
kiemtra_taikhoan();

io.on('connection',(socket)=>
{
  console.log(socket.id);

  socket.emit('check_pass');
  socket.on('C_check_phone',(idphone,num,abc)=>{
    if(idphone&&num){
    var date = Math.floor(Date.now() / 1000);
    con.query("SELECT * FROM `dangky` WHERE `phone_id` LIKE '"+idphone+"'", function(err1, rows1){
      if(err1){console.log(err1);}
      else {
        if(rows1.length >2){socket.emit('verify_loi','A1');}
        else {
          var sql = "INSERT INTO `dangky`(phone_id,time1, time2) VALUES ?";
          var values = [[idphone,date,date]];
          con.query(sql, [values], function (err4, result) {
            if (err4){console.log(err4);}
            else {
              con.query("UPDATE `dangky` SET `time2` = '"+date+"' WHERE `phone_id` LIKE '"+idphone+"'",function(err5, ok){
                if (err5){console.log('update b