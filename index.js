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
    // m