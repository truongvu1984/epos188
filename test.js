var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
server.listen(process.env.PORT || 3000, function(){console.log("server start")});
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'vu2551984@gmail.com',
            pass: '123'
        }
    });
  //  https://www.cleardb.com/database/details?id=EC6CC143D125B9254AFD2C0DCEE155F3
  //  b0bd8d2dadd7e9:4ef561c7@us-cdbr-iron-east-05.cleardb.net/heroku_22d08a1219bdc10?reconnect=tr
var mysql = require('mysql');
var con = mysql.createConnection({
  host: "us-cdbr-iron-east-05.cleardb.net",
  user: "b04c2ff40d4e13",
  password: "0fdaedd4",
 database : "heroku_7790b5956b2a5c2",
 queueLimit: 30,
  acquireTimeout: 1000000,

});
var accountSid = 'ACaa41a4ddc473c35c1192aa1a7fd6dab4';
var authToken = '94b2749230e0d3d5b379cf851c0d3c8c';
//require the Twilio module and create a REST client
var client = require('twilio')(accountSid, authToken);
var stt = 0;

  con.connect(function(err) {
    if (err) { console.log(" da co loi:" + err); }
    else {
      console.log("Da co ket noi ok ha ha ha");
      }});

  function waitAndDo() {
    setTimeout(function() {
    con.query("SELECT `number` FROM `account` WHERE `number` LIKE '123'", function(err){if(err){console.log('co loi:'+err);}});
    waitAndDo();
    }, 10000);
  }
  waitAndDo();
  function strencode( data ) {
    return unescape( encodeURIComponent( data ) );
  }

// function strdecode( data ) {
//   return JSON.parse( decodeURIComponent( escape ( data ) ) );
// }

io.on('connection',  (socket)=>
{
  socket.on('C_bosung_member', function(info){
    console.log(info);
    // xác minh tài khoản đủ điều kiện để bổ sung thành viên không
    con.query("SELECT * FROM `account` WHERE `number` LIKE '"+info.admin+"' AND `pass` LIKE '"+info.pass+"' LIMIT 1", function(err, rows6)
    {
      if (err || (rows6==0)){console.log(err);}
      else {
        socket.emit ('S_get_bosung_member');
        let mem3 = {name:"", number:""};
    //bổ sung thành viên mới cho người cũ
        info.old_list.forEach((member)=>{
            let member3 = [];
            con.query("SELECT * FROM `" + member.number+"mes_main` WHERE `idc` LIKE '"+info.room_full_name+"' LIMIT 1", function(err1, rows){
              if ( err1 || (rows.length >0 )){console.log(err1);}
              else { let sql2 = "INSERT INTO `"+member.number+"mes_sender` (ids,number, name, send_receive, stt) VALUES ?";
            info.new_list.forEach((mem2)=>{
              let values2 = [[rows[0].id, mem2.number, mem2.name, 'O', 'N']];
              con.query(sql2, [values2], function (err2, res){
                if (err2){console.log(err2);}
                else {
                console.log('Da insert thanh cong '+ res.id);
                }
              });
              mem3 = {name:strencode(mem2), number:mem2.number};
              member3.push(mem3);
              console.log(mem3);
            });
            con.query("UPDATE `"+member.number+"mes_main` SET `stt` = 'M' WHERE `send_receive` LIKE 'O' AND `idc` LIKE '"+info.room_full_name+"'",function(err3){
                if (err3){console.log(err3);}
              });
            io.sockets.in(member.number).emit('S_add_mem',{ room_fullname:strencode(info.room_name), member_list:member3});
            console.log('a gui room di cho nguoi cu:'+info.room_name + ' danh sach la:'+member3);
          } }); });
      // thông báo room cho thành viên mới
        info.new_list.forEach((member1)=>{
       //kiểm tra xem thành viên mới này có tài khoản chưa.
            con.query("SELECT * FROM `account` WHERE `number` LIKE '"+ member1.number +"' LIMIT 1", function(err4, kq){
           if ( err4 || (kq.length == 0)){console.log(err4);}
           else {
             //nếu tài khoản đó đã có, kiêm tra xem cái room đó đã có trong bảng chưa
             con.query("SELECT * FROM `"+member1.number+"mes_main` WHERE `idc` LIKE '"+ info.room_full_name +"' LIMIT 1", function(err8, row1s)
               {
                 if(err8 || (row1s.length >0)){console.log(err4);}
                 else {
                    let member = [];
                    let mem = {name:"", number:""};
                    //lưu vào bảng chính
                    var sql = "INSERT INTO `"+member1.number+"mes_main` (idc, subject, send_receive, stt ) VALUES ?";
                    var val = [[ info.room_full_name, info.room_name,'O', 'N']];
                    con.query(sql, [val], function (err5, res){
                      if ( err5){console.log(err5);}
                      else {
                        let sql2 = "INSERT INTO `"+member1.number+"mes_sender` (ids, number, name, send_receive ) VALUES ?";
                          info.full_list.forEach(function(row4){

                              mem = {name:strencode(row4.name), number:row4.number}
                              member.push(mem);
                              if (row4.number ==info.admin){
                                let val2 = [[res.insertId,row4.number,row4.name,'OM']];
                                con.query(sql2, [val2], function (err6) {
                                  if ( err6){console.log(err6);}
                                  else { console.log('da insert 1');}
                                });
                              }
                              else  {
                                var val2 = [[res.insertId,row4.number,row4.name,'O']];
                                con.query(sql2, [val2], function (err7) {
                                  if ( err7){console.log(err7);}
                                  else { console.log('da insert 2');}

                                });

                              }
                            });
                            io.sockets.in(member1.number).emit('S_send_room',{admin_number: info.admin , admin_name: strencode(rows6.user), room_name:strencode(info.room_name) ,room_fullname:strencode(info.room_full_name), member_list:member});
                            console.log('Da gui room di cho nguoi moi ');

                      }
                    });

                  }

              });
            }
         });
      });
       }
      });

    });
});
