var express = require("express");
var app = express();
const fs = require('fs');
const path = require('path');
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
    pass: 'bnzjtzumamyrqcrz'
  }
});

function strencode( data ){return unescape( encodeURIComponent(data));}
function strdecode( data ){
  return JSON.parse( decodeURIComponent( escape ( data ) ) );
}
var passwordHash = require('password-hash');
var bodyParser = require('body-parser');
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
let cb = new CheckMobi('BECCEBC1-DB76-4EE7-B475-29FCF807849C');
var urlencodedParser = bodyParser.urlencoded({ extended: false })
isArray = function(a) {
    return (!!a) && (a.constructor === Array);
}
function isNumeric(str) {
  if (typeof str != "string") return false // we only process strings!
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
         !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}
function kiemtra_taikhoan(){
  setTimeout(function() {
  //sau mỗi phút, kiêm tra db và xóa các bản tin đã quá 10 phút ==600 giây
  // var date2 = Math.floor(Date.now() / 1000) - 600;
  var date3=Math.floor(Date.now() / 1000) - 300;
  con.query(" DELETE FROM `active` WHERE `time` < "+date3, (err1)=>{if(err1)console.log('co loi HA HA HA:'+err1);});
  con.query(" DELETE FROM `account_tem` WHERE `time` < "+date3, (err2)=>{if(err2)console.log('co loi HA HA HA:'+err2);});
  con.query(" DELETE FROM `kiemtra` WHERE `time` < "+date3, (err3)=>{if(err3)console.log('co loi HA HA HA:'+err3);});

  kiemtra_taikhoan();
}, 5000);
}
app.get('/', (req, res) => res.render('privacy'));
app.get('/privacy-policy', (req, res) => res.render('privacy'));

con.connect(function(err) {
  if (err) { console.log(" da co loi:" + err);}
  else {
  kiemtra_taikhoan();

  io.on('connection',(socket)=>
  {
    socket.emit('check_pass');
    socket.emit('check_pass_1_login');
    socket.on('C_regis_caro',(stt,tin)=>{
      if(stt!=null&&tin.username&&tin.displayname&&tin.pass){
          con.query("SELECT * FROM `account2` WHERE `number` LIKE '"+ tin.username +"' LIMIT 1", (err, rows)=>{
            if(err){console.log(err);socket.emit('C_regis_caro_loi','A');}
            else if(rows.length>0)socket.emit('C_regis_caro_loi','B');
            else {
              if(stt=='A'){
                var string = Math.floor(Math.random() * (899999)) + 100000;
                var mailOptions = {
                  from: 'windlaxy@gmail.com',
                  to: tin.username,
                  subject: 'Caro OTP',
                  text: 'Your Caro OTP:'+string
                };
                transporter.sendMail(mailOptions, (error, info)=>{
                if (error){ socket.emit('C_regis_caro_loi','D');console.log(error);}
                else {
                  con.query("DELETE FROM `account_tem` WHERE `user` LIKE '"+tin.username+"'", (err2)=>{
                      if (err2)console.log(err2);
                      else {
                        var sql = "INSERT INTO `account_tem` (user,name,pass,chuoi,time) VALUES ?";
                        var time = Math.floor(Date.now() / 1000);
                        var matkhau = passwordHash.generate(''+tin.pass);
                        var values = [[tin.username,tin.displayname, matkhau,string,time]];
                        con.query(sql, [values], function (err1, result) {
                          if (err1)socket.emit('C_regis_caro_loi','A');
                          else socket.emit('S_regis_caro_check_mail',tin.username);
                        });
                      }
                  });

                }
              });
              }
              else {
                con.query("CREATE TABLE IF NOT EXISTS  `"+tin.username+"caro` (`id` BIGINT NOT NULL AUTO_INCREMENT, `mail` VARCHAR(45) NOT NULL,`name` VARCHAR(45)  ,`time` BIGINT , `thongbao` CHAR(1) , `stt` CHAR(1),`luotchoi` CHAR(1),`ditruoc` CHAR(1), PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC))", function(){});
                con.query("CREATE TABLE IF NOT EXISTS  `"+tin.username+"caro1` (`id` BIGINT NOT NULL AUTO_INCREMENT, `mail` VARCHAR(45) NOT NULL,`name` VARCHAR(45)  ,`toado` INT(11) , `ta` CHAR(1), PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC))", function(){});
                var sql = "INSERT INTO `account2` (number,user,pass) VALUES ?";
                var matkhau = passwordHash.generate(''+tin.pass);
                var values = [[tin.username,tin.displayname, matkhau]];
                con.query(sql, [values], function (err1, result) {
                    if (err1)socket.emit('C_regis_caro_loi','A');
                    else {socket.emit('C_regis_caro_ok',tin.username);}
                });
              }
            }
        });
      }
    });
    socket.on('check_mail_regis_caro',(mail,chuoi)=>{
      if(mail!=null&&chuoi!=null){
        con.query("SELECT `dem` FROM `kiemtra` WHERE `username` LIKE '"+mail+"' LIMIT 1", (err1, row1s)=>{
          if(err1)console.log(err1);
          else {
            if(row1s.length>0&&row1s[0].dem>4)socket.emit('C_reg_qua_solan');
            else {
              var time = Math.floor(Date.now() / 1000);
              if(row1s.length==0){
                var sql = "INSERT INTO `kiemtra` (username,loai,dem,time) VALUES ?";
                var values = [[mail,'A',0, time]];
                con.query(sql, [values], function (err4, result) {
                    if (err1)console.log(err1);
                });
              }
              else {
                let dem=row1s[0].dem+1;
                con.query("UPDATE `kiemtra` SET `dem` = "+dem+",`time`="+time+" WHERE `username` LIKE '"+mail+"'", (err6)=>{
                  if (err6)console.log(err6);
                });
              }
              con.query("SELECT * FROM `account_tem` WHERE `user` LIKE '"+mail+"' LIMIT 1", (err, rows)=>{
                if (err)socket.emit('check_mail_regis_caro_thatbai','A');
                else if(rows.length==0)socket.emit('check_mail_regis_caro_thatbai','B');
                else {
                  if(chuoi===rows[0].chuoi){
                    con.query("CREATE TABLE IF NOT EXISTS  `"+mail+"caro` (`id` BIGINT NOT NULL AUTO_INCREMENT, `mail` VARCHAR(45) NOT NULL,`name` VARCHAR(45)  ,`time` BIGINT , `thongbao` CHAR(2) , `stt` CHAR(1),`luotchoi` CHAR(1),`ditruoc` CHAR(1),, PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC))", function(){});
                    con.query("CREATE TABLE IF NOT EXISTS  `"+mail+"caro1` (`id` BIGINT NOT NULL AUTO_INCREMENT, `mail` VARCHAR(45) NOT NULL,`name` VARCHAR(45)  ,`toado` INT(11) , `ta` CHAR(1), PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC))", function(){});
                    var sql = "INSERT INTO `account2` (number,user,pass) VALUES ?";
                    var values = [[rows[0].user,rows[0].name,rows[0].pass]];
                    con.query(sql, [values], (err1, result)=>{
                      if (err1)socket.emit('C_regis_caro_loi','A');
                      else {
                        socket.emit('C_regis_caro_ok',mail);
                        con.query("DELETE FROM `account_tem` WHERE `user` LIKE '"+mail+"'", (err2)=>{
                            if (err2)console.log(err2);
                        });
                      }
                    });
                  }
                  else socket.emit('check_mail_regis_caro_thatbai','C');
                }
              });
            }
          }
        });

      }
    });
    socket.on('forget_pass_caro',(mail)=>{
      if(mail!=null){
        con.query("SELECT * FROM `account2` WHERE `number` LIKE '"+ mail +"' LIMIT 1", (err, rows)=>{
                // nếu tài khoản đã có người đăng ký rồi thì:
                if(err)socket.emit('forget_pass_caro_loi','A');
                else {
                  if (rows.length ==0 )	{socket.emit('forget_pass_caro_loi','B');}
                  else {
                    var string = Math.floor(Math.random() * (899999)) + 100000;
                    var mailOptions = {
                      from: 'windlaxy@gmail.com',
                      to: mail,
                      subject: 'Caro OTP',
                      text: 'Your Caro OTP:'+string
                    };
                    transporter.sendMail(mailOptions, function(error, info){
                      if (error) {socket.emit('forget_pass_caro_loi','D');console.log(error);}
                      else {
                        con.query("DELETE FROM `account_tem` WHERE `user` LIKE '"+mail+"'", (err2)=>{
                            if (err2)console.log(err2);
                            else {
                              var sql = "INSERT INTO `account_tem` (user,chuoi,time) VALUES ?";
                              var time = Math.floor(Date.now() / 1000);
                              var values = [[mail,string, time]];
                              con.query(sql, [values], (err1, result)=>{
                                if (err1)socket.emit('forget_pass_caro_loi','A');
                                else socket.emit('S_check_mail_forget',mail);
                              });
                            }
                        });




                        var time = Math.floor(Date.now() / 1000);

                          var sql = "INSERT INTO `active` (mail,chuoi,time) VALUES ?";
                          var values = [[mail, string1,time,1,phone_id]];
                          con.query(sql, [values], function (err1, result) {
                            if ( err1)socket.emit('regis_1_thatbai_A','A');
                            else  socket.emit('regis_1_thanhcong_A');
                          });


                      }
                    });


                  }
                }
        });

      }
    });
    socket.on('forget_pass_2_caro',(tin)=>{
      if(tin.mail&&tin.chuoi&&tin.pass){
        con.query("SELECT `dem` FROM `kiemtra` WHERE `username` LIKE '"+mail+"' LIMIT 1", (err1, row1s)=>{
          if(err1)console.log(err1);
          else {
            if(row1s.length>0&&row1s[0].dem>4)socket.emit('C_reg_qua_solan');
            else {
              var time = Math.floor(Date.now() / 1000);
              if(row1s.length==0){
                var sql = "INSERT INTO `kiemtra` (username,loai,dem,time) VALUES ?";
                var values = [[mail,'A',0, time]];
                con.query(sql, [values], function (err4, result) {
                    if (err1)console.log(err1);
                });
              }
              else {
                let dem=row1s[0].dem+1;
                con.query("UPDATE `kiemtra` SET `dem` = "+dem+",`time`="+time+" WHERE `username` LIKE '"+mail+"'", (err6)=>{
                  if (err6)console.log(err6);
                });
              }
              con.query("SELECT * FROM `account_tem` WHERE `user` LIKE '"+tin.mail+"' LIMIT 1", (err, rows)=>{
                      if (err){socket.emit('forget_pass_2_caro_thatbai','A');console.log(err);}
                      else{
                        if(rows.length==0)socket.emit('forget_pass_2_caro_thatbai','B');
                        else {
                          if(rows[0].chuoi===tin.chuoi){
                            let pass1 = passwordHash.generate(''+tin.pass);
                            con.query("UPDATE `account2` SET `pass` = '"+pass1+"' WHERE `number` LIKE '"+tin.mail+"'", (err2)=>{
                               if (err2){socket.emit('forget_pass_2_caro_thatbai','A');console.log(err2);}
                              else {
                                con.query("DELETE FROM `account_tem` WHERE `user` LIKE '"+tin.mail+"'", (err3)=>{
                                   if (err3)console.log(err3);
                                });
                                socket.emit('forget_pass_2_caro_ok');
                              }
                            });
                          }
                          else socket.emit('forget_pass_2_caro_thatbai','C');
                        }

                      }
                    });
            }
          }
        });





              }
            });
    socket.on('login1_Caro',(user1, pass1)=>{
      if(user1&&pass1){
        con.query("SELECT `dem` FROM `kiemtra` WHERE `username` LIKE '"+user1+"' LIMIT 1", (err1, row1s)=>{
          if(err1)console.log(err1);
          else {
            if(row1s.length>0&&row1s[0].dem>4)socket.emit('C_reg_qua_solan');
            else {
              var time = Math.floor(Date.now() / 1000);
              if(row1s.length==0){
                var sql = "INSERT INTO `kiemtra` (username,loai,dem,time) VALUES ?";
                var values = [[user1,'A',0, time]];
                con.query(sql, [values], function (err4, result) {
                    if (err1)console.log(err1);
                });
              }
              else {
                let dem=row1s[0].dem+1;
                con.query("UPDATE `kiemtra` SET `dem` = "+dem+",`time`="+time+" WHERE `username` LIKE '"+user1+"'", (err6)=>{
                  if (err6)console.log(err6);
                });
              }
              con.query("SELECT * FROM `account2` WHERE `number` LIKE '"+user1+"' LIMIT 1", (err, rows)=>{
          	     if (err)socket.emit('login1_Caro_loi','A');
                 else if ( rows.length ==0)socket.emit('login1_Caro_loi','B');
          			 else{
                  if (passwordHash.verify(pass1, rows[0].pass)) {
                    socket.number = user1;
                    socket.username = rows[0].user;
                    socket.join(user1);
                    socket.emit('login1_caro_dung', {user:user1,name:rows[0].user,pass:pass1});
                  }
                  else  socket.emit('login1_Caro_loi','C');
                }
              });
            }
          }
        });
      }
    });
    socket.on('login2_caro',(data,game)=>{
      if(data.rightuser&&data.right_pass){
        con.query("SELECT * FROM `account2` WHERE `number` LIKE '"+data.rightuser+"' LIMIT 1", (err, rows)=>{
          if (err || rows.length ==0){socket.emit('login2_khongtaikhoan');}
          else{
            if (passwordHash.verify(data.right_pass, rows[0].pass)){
              socket.number = data.rightuser;
              socket.username = rows[0].user;
              socket.join(data.rightuser);
              // tìm các thông báo gửi về cho người chơi, bao gồm cả thông báo kết bạn và chơi game
              // thông báo ở đây không bao gồm các nước đi mới
                con.query("SELECT `thongbao`,`mail`,`name`,`luotchoi` FROM `"+socket.number+"caro` WHERE `stt` LIKE 'B' ORDER BY time ASC", (err2, a2s)=>{
                  if(err2){console.log(err2);}
                  else if(a2s.length>0) {
                    socket.emit('S_send_thongbao',a2s,);
                    a2s.forEach((item, i) => {
                      if(item==game){
                        con.query("SELECT `name`,`toado` FROM `"+socket.number+"caro1` WHERE `mail` LIKE '"+game+"' AND `ta` LIKE 'B' ORDER BY id DESC LIMIT 1", (err3, a3s)=>{
                          if(err3){console.log(err3);}
                          else {
                            if(a3s.length>0){
                              // đây là send điểm mà bên nhận không phải phát thông báo, vì thông báo đã gửi theo kênh ở trên
                                socket.emit('S_send_diem_2',game,a3s[0].name,a3s[0].toado);
                            }
                          }
                        });
                        break;
                      }
                    });

                  }
                });

            }
            else {
              socket.number = null;
              socket.username = null;
            }
            }
        });
      }//end
      else {
        socket.number = null;
        socket.username = null;
        socket.emit('login2_sai');
      }

    });
    socket.on('C_reg_caro_1',(data)=>{
      if(data.rightuser&&data.right_pass){
          con.query("SELECT * FROM `account2` WHERE `number` LIKE '"+data.rightuser+"' LIMIT 1", (err, rows)=>{
            if (err || rows.length ==0){socket.emit('login2_khongtaikhoan');}
            else{
              if (passwordHash.verify(data.right_pass, rows[0].pass)){
                socket.number = data.rightuser;
                socket.username = rows[0].user;
                socket.join(data.rightuser);
                con.query("SELECT `mail`,`name`,`thongbao` FROM `"+socket.number+"caro` ORDER BY time DESC", (err2, a2s)=>{
                    if(err2)console.log(err2);
                    else if(a2s.length>0) socket.emit('S_send_caro_1',a2s);
                });
              }
            }
          });


      }
    });
    socket.on('C_send_ketban_caro',(type,mail,name)=>{
      if(socket.number!=null&&mail!=null&&type!=null){
        con.query("SELECT * FROM `account2` WHERE `number` LIKE '"+mail+"' LIMIT 1", (err, rows)=>{
          if (err)console.log(err);
          else if(rows.length>0){
            socket.emit('S_danhan_reg_ketban',type,mail,name);
            if(type=="B1"){
              // gửi lời đề nghị kết bạn với tôi nhé
                  if(rows.length ==0)socket.emit('taikhoan_da_xoa',mail);
                  else {
                    let date=Date.now();
                    var sql3 = "INSERT INTO `"+socket.number+"caro` (mail, name, time, thongbao,stt,luotchoi) VALUES ?";
                    var val3 = [[mail, rows[0].user, date, 'B','A','A']];
                    con.query(sql3, [val3],  (err3, res3)=> {
                    if ( err3){console.log(err3);}
                    else {
                      var sql4 = "INSERT INTO `"+mail+"caro` (mail, name, time,thongbao,stt,luotchoi) VALUES ?";
                      var val4 = [[socket.number, socket.username, date, 'B1','B','B']];
                      con.query(sql4, [val4],  (err4, res4)=> {
                        if ( err4){console.log(err4);}
                        else {
                          io.sockets.in(mail).emit('S_send_reg_ketban','B1',socket.number,socket.username);
                        }
                    });

                    }
                });
                  }
            }
            else if(type=="E"){
              // cho tôi thu hồi lời mời kết bạn lại nhé
              con.query("DELETE FROM `"+socket.number+"caro` WHERE `mail` LIKE '"+mail+"'", (err2)=>{
                if (err2)console.log(err2);
              });
              con.query("UPDATE `"+mail+"caro` SET `thongbao` ='E',`stt`='B' WHERE `mail` LIKE '"+socket.number+"'",(err6,res6)=>{
                if(err6)console.log('a8'+err6);
                else   io.sockets.in(mail).emit('S_send_reg_ketban','E',socket.number,socket.username);
              });
            }
            else if(type=="C"){
              // cho tôi từ chối lời mời kết bạn  nhé
              con.query("DELETE FROM `"+socket.number+"caro` WHERE `mail` LIKE '"+mail+"'", (err2)=>{
                if (err2)console.log(err2);
              });
              con.query("UPDATE `"+mail+"caro` SET `thongbao` ='C',`stt`='B' WHERE `mail` LIKE '"+socket.number+"'",(err6,res6)=>{
                if(err6)console.log('a8'+err6);
                else   io.sockets.in(mail).emit('S_send_reg_ketban','C',socket.number,socket.username);
              });
            }
            else if(type=="D"){
              // cho tôi đồng ý lời mời kết bạn  nhé
              con.query("UPDATE `"+socket.number+"caro` SET `thongbao` ='A',`stt`='A' WHERE `mail` LIKE '"+socket.number+"'",(err6,res6)=>{
                if(err6)console.log('a8'+err6);
              });
              con.query("UPDATE `"+mail+"caro` SET `thongbao` ='D',`stt`='B' WHERE `mail` LIKE '"+socket.number+"'",(err6,res6)=>{
                if(err6)console.log('a8'+err6);
                else   io.sockets.in(mail).emit('S_send_reg_ketban','D',socket.number,socket.username);
              });
            }
            else if(type=="F"){
              // xóa kết bạn nhé
              con.query("DELETE FROM `"+socket.number+"caro` WHERE `mail` LIKE '"+mail+"'", (err2)=>{
                if (err2)console.log(err2);
              });
              con.query("UPDATE `"+mail+"caro` SET `thongbao` ='F',`stt`='B' WHERE `mail` LIKE '"+socket.number+"'",(err6,res6)=>{
                if(err6)console.log('a8'+err6);
                else   io.sockets.in(mail).emit('S_send_reg_ketban','F',socket.number,socket.username);
              });
            }
            else if(type=="E1"){
          // xóa kết bạn ông này đi, lúc này chỉ xóa thôi, vì bên kia cũng đã xóa rồi
          con.query("DELETE FROM `"+socket.number+"caro` WHERE `mail` LIKE '"+mail+"'", (err2)=>{
            if (err2)console.log(err2);
          });
        }
          }
        });
      }
    });
    socket.on('C_get_reg_ketban_caro',(type,mail)=>{
      if(socket.number!=null&&mail!=null){
        if(type=='E'||type=='F'){
          con.query("DELETE FROM `"+socket.number+"caro` WHERE `mail` LIKE '"+mail+"'", (err2)=>{
            if (err2)console.log(err2);
          });
        }
        else {
          con.query("UPDATE `"+socket.number+"caro` SET `stt` = 'A' WHERE `mail` LIKE '"+mail+"'", (err2)=>{
              if (err2)console.log(err2);
          });
        }

      }
    });
    socket.on('C_reg_game',(mail)=>{
      if(socket.number!=null&&mail!=null){
        con.query("SELECT `luotchoi` FROM `"+socket.number+"caro` WHERE `mail` LIKE '"+mail+"' ORDER BY id LIMIT 1", (err, as)=>{
            if(err)console.log(err);
            else if(as.length==0)socket.emit('taikhoan_da_xoa');
            else {
              con.query("SELECT * FROM `"+socket.number+"caro1` WHERE `mail` LIKE '"+mail+"' ORDER BY id", (err2, a2s)=>{
                  if(err2)console.log(err2);
                  else socket.emit('S_send_game',a2s,as[0].luotchoi);

              });
            }
        });

      }
    });
    socket.on('C_caro_del_acc',(pass)=>{
      if(socket.number && pass){
        con.query("SELECT * FROM `account2` WHERE `number` LIKE '"+socket.number+"' LIMIT 1", function(err, rows){
          if (err)socket.emit('S_caro_del_acc_thatbai','A');
          else {
            if(rows.length==0)socket.emit('S_caro_del_acc_ok');
            else {
              if(passwordHash.verify(pass, rows[0].pass)){
                socket.emit('S_caro_del_acc_ok');
                con.query("DELETE FROM `account2` WHERE `number` LIKE '"+socket.number+"'", function(err3){
                  if (err3)socket.emit('S_caro_del_acc_thatbai','A');
                  else {
                    let abc= socket.number;
                    socket.number = undefined;
                    con.query("DROP TABLE IF EXISTS `"+abc+"caro`", function(err4){ if (err4)console.log(err4);});
                  }
                });
              }
              else socket.emit('S_caro_del_acc_thatbai','B');
            }
          }
        });
      }
    });
    socket.on('search_contact_caro',(string)=>{
      if (socket.number&&string!=null){
        con.query("SELECT `number`,`user`,  LOCATE('"+string+"',number) FROM `account2` WHERE LOCATE('"+string+"',number)>0 LIMIT 50", function(err, a1s){
        if ( err)console.log(err);
        else
        {
          if(a1s.length>0){
            let noidung=[];
            a1s.forEach(function(a1,key){
              if(noidung!=socket.number)noidung.push({user:a1.user, number: a1.number});
                if(key===(a1s.length-1))  {socket.emit('S_send_search_caro',noidung);}
            });

          }
          else socket.emit('S_kq_check_caro_zero_2');
        }
      });
      }
    });
    socket.on('C_reg_choi_lai',(mail)=>{
      if(socket.number != null&&mail!=null){
        con.query("UPDATE `"+socket.number+"caro` SET `thongbao` = 'N' WHERE `mail` LIKE '"+mail+"'", (err2)=>{
              if (err2)console.log(err2);
              else {
                socket.emit('S_get_reg_choilai',mail);
                con.query("UPDATE `"+mail+"caro` SET `thongbao` = 'M', `stt` = 'B' WHERE `mail` LIKE '"+socket.number+"'",(err5,res5)=>{
                  if(err5)console.log(err5);
                  else io.sockets.in(mail).emit('C_muon_choi_lai',socket.number,socket.username);

                });

            }
        });
      }
    });
    socket.on('C_dongy_choilai',(mail,stt)=>{
      if(socket.number != null&&mail!=null&&stt!=null){
        if(stt=='A'){
          con.query("SELECT `ditruoc` FROM `"+socket.number+"caro` WHERE `mail` LIKE '"+mail+"' ORDER BY id LIMIT 1", (err, as)=>{
            if(err)console.log(err);
            else if(as.length==0)socket.emit('taikhoan_da_xoa');
            else {
              let new_luot;
              if(as[0].ditruoc=='A')new_luot='B';
              else new_luot='A';
              con.query("UPDATE `"+socket.number+"caro` SET `thongbao` = 'A', `stt`='A',`luotchoi`='"+new_luot+"',`ditruoc`='"+new_luot+"' WHERE `mail` LIKE '"+mail+"'", (err2)=>{
                    if (err2)console.log(err2);
                    else {
                      con.query("DELETE FROM `"+socket.number+"caro1` WHERE `mail` LIKE '"+mail+"'", (err2)=>{
                        if (err2)console.log(err2);
                      });
                      con.query("DELETE FROM `"+mail+"caro1` WHERE `mail` LIKE '"+socket.number+"'", (err2)=>{
                        if (err2)console.log(err2);
                      });
                      socket.emit('S_get_dongy_choilai',mail,'A',new_luot);
                      con.query("UPDATE `"+mail+"caro` SET `thongbao` = 'S', `stt` = 'B',`luotchoi`='"+as[0].ditruoc+"',`ditruoc`='"+as[0].ditruoc+"' WHERE `mail` LIKE '"+socket.number+"'",(err5,res5)=>{
                        if(err5)console.log(err5);
                        else
                        {
                          io.sockets.in(mail).emit('S_send_C_dongy_choi_lai',socket.number,socket.username,'A',as[0].ditruoc);
                        }
                      });

                  }
              });
            }
        });
        }
        else {
          //neu tu chuoi
          con.query("UPDATE `"+socket.number+"caro` SET `thongbao` = 'A', `stt`='A' WHERE `mail` LIKE '"+mail+"'", (err2)=>{
                if (err2)console.log(err2);
                else {
                  socket.emit('S_get_dongy_choilai',mail,'B',new_luot);
                  con.query("UPDATE `"+mail+"caro` SET `thongbao` = 'P', `stt` = 'B' WHERE `mail` LIKE '"+socket.number+"'",(err5,res5)=>{
                    if(err5)console.log(err5);
                    else io.sockets.in(mail).emit('S_send_C_dongy_choi_lai',socket.number,socket.username,'B');
                  });

              }
          });
        }






      }
    });
    socket.on('C_xoa_game',(nhom_mail)=>{
      if(socket.number != null&&isArray(nhom_mail)){
        socket.emit('S_get_xoagame',nhom_mail);
          nhom_mail.forEach((mail,key)=>{
            con.query("DELETE FROM `"+socket.number+"caro` WHERE `mail` LIKE '"+mail+"'", (err2)=>{
              if (err2)console.log(err2);
            });
            con.query("DELETE FROM `"+socket.number+"caro1` WHERE `mail` LIKE '"+mail+"'", (err2)=>{
              if (err2)console.log(err2);
            });
            con.query("UPDATE `"+mail+"caro` SET `thongbao` ='F',`stt`='B' WHERE `mail` LIKE '"+socket.number+"'",(err6,res6)=>{
              if(err6)console.log('a8'+err6);
              else io.sockets.in(mail).emit('S_send_reg_ketban','F',socket.number,socket.username);
            });
        });
      }
    });
    socket.on('C_send_diem',(toado,mail)=>{
      if(socket.number != null){
        if(toado!=null && mail !=null){
          con.query("UPDATE `"+mail+"caro` SET `thongbao`='K',`luotchoi` = 'A',`stt`='B' WHERE `mail` LIKE '"+socket.number+"'",(err,res)=>{
            if(err)console.log('a8'+err);
            else {
              var sql = "INSERT INTO `"+mail+"caro1` (mail,toado, ta) VALUES ?";
              var val = [[socket.number,toado,'B']];
              con.query(sql, [val],  (err1, res1)=> {
                if ( err1){console.log('a5'+err1);}
                else {
                  socket.emit('C_send_diem_ok',mail,toado);
                  // đây là send điểm có thông báo, còn hiển thị điểm thì tùy trạng thái bên nhận, nếu đang ở game thì hiển thị
                  io.sockets.in(mail).emit('S_send_diem',socket.number,socket.username,toado);
                  con.query("UPDATE `"+socket.number+"caro` SET `luotchoi` = 'B' WHERE `mail` LIKE '"+mail+"'",(err,res)=>{
                    if(err)console.log('a8'+err);
                    else {
                      var sql = "INSERT INTO `"+socket.number+"caro1` (mail,toado, ta) VALUES ?";
                      var val = [[mail,toado,'A']];
                      con.query(sql, [val],  (err1, res1)=> {
                        if ( err1){console.log('a5'+err1);}

                      });
                    }
                  });
                }
              });
            }
          });




      }
    }

    });
    socket.on('C_nhan_toado',(mail)=>{
      if(socket.number != null && mail != null){
        con.query("UPDATE `"+socket.number+"caro` SET `stt` = 'A' WHERE `mail` LIKE '"+mail+"'",(err5,res5)=>{
          if(err5)console.log(err5);
        });
      }

    });
    socket.on('regis_1_windlaxy',(mail,code,id_phone)=>{
      if(mail&&code&&id_phone){
        con.query("SELECT * FROM `active` WHERE `phone_id` LIKE '"+ id_phone +"' LIMIT 1", function(err3, row1s){
          if(err3)socket.emit('regis_1_thatbai','A');
          else {
            if(row1s.length>0 && row1s[0].dem>2)socket.emit('regis_1_thatbai','C');
            else {
              con.query("SELECT * FROM `account` WHERE `number` LIKE '"+ mail +"' LIMIT 1", function(err, rows){
                      // nếu tài khoản đã có người đăng ký rồi thì:
                      if(err)socket.emit('regis_1_thatbai','A');
                      else {
                        if (rows.length >0 )	{socket.emit('regis_1_thatbai','D');}
                        else {
                          var string = Math.floor(Math.random() * (899999)) + 100000;
                          var string1 = passwordHash.generate(''+string);
                          if(code=="B"){
                            var mailOptions = {
                              from: 'windlaxy@gmail.com',
                              to: mail,
                              subject: 'Windlaxy OTP',
                              text: 'Your Windlaxy OTP:'+string
                            };
                            transporter.sendMail(mailOptions, function(error, info){
                            if (error) socket.emit('regis_1_thatbai','B');
                            else {
                              var time = Math.floor(Date.now() / 1000);
                              if(row1s.length==0){
                                var sql = "INSERT INTO `active` (mail,chuoi,time,dem,phone_id ) VALUES ?";
                                var values = [[mail, string1,time,1,id_phone]];
                                con.query(sql, [values], function (err1, result) {
                                  if ( err1)socket.emit('regis_1_thatbai','A');
                                  else  socket.emit('regis_1_thanhcong');
                                });
                              }
                              else {
                                //nếu có rồi thì cập nhật và cộng số đếm lên 1
                                let dem = row1s[0].dem+1;
                                if(dem>2)time=time+300;
                                con.query("UPDATE `active` SET `chuoi`='"+string1+"',`time`="+time+",`dem`="+dem+" WHERE `phone_id` LIKE '"+id_phone+"'",function(err1){
                                  if(err1)socket.emit('regis_1_thatbai','A');
                                  else socket.emit('regis_1_thanhcong');
                                });

                              }
                            }
                          });
                          }
                          else {
                            cb.sendMessage({"to": mail, "text": 'Windlaxy OTP:'+string}, (error, response) => {
                                if(error)socket.emit('regis_1_thatbai','E');
                                else {

                                  var time = Math.floor(Date.now() / 1000);
                                  if(row1s.length==0){
                                    var sql = "INSERT INTO `active` (mail,chuoi,time,dem,phone_id ) VALUES ?";
                                    var values = [[mail, string1,time,1,id_phone]];
                                    con.query(sql, [values], function (err1, result) {
                                      if ( err1)socket.emit('regis_1_thatbai','A');
                                      else  socket.emit('regis_1_thanhcong');
                                    });
                                  }
                                  else {
                                    //nếu có rồi thì cập nhật và cộng số đếm lên 1
                                    let dem = row1s[0].dem+1;
                                    if(dem>2)time=time+300;
                                    con.query("UPDATE `active` SET `chuoi`='"+string1+"',`time`="+time+",`dem`="+dem+" WHERE `phone_id` LIKE '"+id_phone+"'",function(err1){
                                      if(err1)socket.emit('regis_1_thatbai','A');
                                      else socket.emit('regis_1_thanhcong');
                                    });

                                  }
                                }

                                });

                          }
                        }
                      }
              });

            }
          }
        });

      }
    });
    socket.on('regis_2_windlaxy',(tin)=>{
      if(tin.mail &&tin.name&&tin.chuoi&&tin.pass){
        con.query("SELECT `chuoi` FROM `active` WHERE `mail` LIKE '"+tin.mail +"' LIMIT 1", function(err, rows){
          if (err)socket.emit('regis2_thatbai','A');
          else{
             if(rows.length==0)socket.emit('regis2_thatbai','B');
             else {
               if(passwordHash.verify(tin.chuoi, rows[0].chuoi)){
                  con.query("CREATE TABLE IF NOT EXISTS  `"+tin.mail+"main` (`id` BIGINT NOT NULL AUTO_INCREMENT,`idc` CHAR(20), `subject` VARCHAR(60),`number` VARCHAR(25),`name` VARCHAR(45),`stt` CHAR(2), `time` DATETIME(6), PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC))", function(){});
                  con.query("CREATE TABLE IF NOT EXISTS `"+tin.mail+"diem` (`id` BIGINT NOT NULL AUTO_INCREMENT,`idc` CHAR(20),`name` VARCHAR(45),`lat` DOUBLE,`lon` DOUBLE, `idlo` CHAR(15),PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC))", function(){});
                  con.query("CREATE TABLE IF NOT EXISTS `"+tin.mail+"line_main` (`id` BIGINT NOT NULL AUTO_INCREMENT,`idc` CHAR(20),`name` VARCHAR(45),`culy` BIGINT,`idlo` CHAR(15),PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC))", function(){});
                  con.query("CREATE TABLE IF NOT EXISTS `"+tin.mail+"line_detail` (`id` BIGINT NOT NULL AUTO_INCREMENT,`idc` CHAR(15),`lat` DOUBLE,`lon` DOUBLE,`name` VARCHAR(45),`color` INT,`rieng1_id` INT,`stt_rieng1` INT,`rieng2_id` INT,`stt_rieng2` INT,PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC))", function(){});

                  // con.query("CREATE TABLE IF NOT EXISTS `"+tin.mail+"member` (`id` INT NOT NULL AUTO_INCREMENT,`idc`CHAR(20), `number` VARCHAR(45) NOT NULL,`name` VARCHAR(45),PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC))", function(){});
                  var sql = "INSERT INTO `account` (number,user, pass) VALUES ?";
                  var matkhau = passwordHash.generate(''+tin.pass);
                  var values = [[tin.mail,tin.name, matkhau]];
                  con.query(sql, [values], function (err1, result) {
                    if (err1)socket.emit('regis2_thatbai','A');
                    else  {
                      con.query("DELETE FROM `active` WHERE `mail` LIKE '"+tin.mail+"'", function(err2){
                        if (err2)socket.emit('regis2_thanhcong');
                        else {socket.emit('regis2_thanhcong');}
                      });
                    }
                  });

                }
              else socket.emit('regis2_thatbai','B');
              }
            }
        });
      }
    });
    socket.on('forget_pass_1_windlaxy',(mail,code,phone_id)=>{
      if(mail&&code&&phone_id){
        con.query("SELECT * FROM `active` WHERE `phone_id` LIKE '"+ phone_id +"' LIMIT 1", function(err3, row1s){
          if(err3){socket.emit('regis_1_thatbai','A');}
          else {
            if(row1s.length>0 && row1s[0].dem>2)socket.emit('regis_1_thatbai','C');
            else {
              con.query("SELECT * FROM `account` WHERE `number` LIKE '"+ mail +"' LIMIT 1", function(err, rows){
                      // nếu tài khoản đã có người đăng ký rồi thì:
                      if(err)socket.emit('regis_1_thatbai','A');
                      else {
                        if (rows.length ==0 )	{socket.emit('regis_1_thatbai','D');}
                        else {
                          var string = Math.floor(Math.random() * (899999)) + 100000;
                          var string1 = passwordHash.generate(''+string);
                          if(code=="A"){
                            cb.sendMessage({"to": mail, "text": 'Windlaxy OTP:'+string}, (error, response) => {
                                if(error)socket.emit('regis_1_thatbai','E');
                                else {
                                  var time = Math.floor(Date.now() / 1000);
                                  if(row1s.length==0){
                                    var sql = "INSERT INTO `active` (mail,chuoi,time,dem,phone_id ) VALUES ?";
                                    var values = [[mail, string1,time,1,phone_id]];
                                    con.query(sql, [values], function (err1, result) {
                                      if ( err1)socket.emit('regis_1_thatbai','A');
                                      else  socket.emit('regis_1_thanhcong');
                                    });
                                  }
                                  else {
                                    //nếu có rồi thì cập nhật và cộng số đếm lên 1
                                    let dem = row1s[0].dem+1;
                                    if(dem>2)time=time+300;
                                    con.query("UPDATE `active` SET `chuoi`='"+string1+"',`time`="+time+",`dem`="+dem+" WHERE `phone_id` LIKE '"+phone_id+"'",function(err1){
                                      if(err1)socket.emit('regis_1_thatbai','A');
                                      else socket.emit('regis_1_thanhcong');
                                    });

                                  }
                                }

                              });
                          }
                          else {
                            var mailOptions = {
                            from: 'windlaxy@gmail.com',
                            to: mail,
                            subject: 'Windlaxy OTP',
                            text: 'Your Windlaxy OTP:'+string
                          };
                          transporter.sendMail(mailOptions, function(error, info){
                            if (error) {socket.emit('regis_1_thatbai','B');console.log('that bai:'+mail);}
                            else {
                              var time = Math.floor(Date.now() / 1000);
                              if(row1s.length==0){
                                var sql = "INSERT INTO `active` (mail,chuoi,time,dem,phone_id ) VALUES ?";
                                var values = [[mail, string1,time,1,phone_id]];
                                con.query(sql, [values], function (err1, result) {
                                  if ( err1)socket.emit('regis_1_thatbai','A');
                                  else  socket.emit('regis_1_thanhcong');
                                });
                              }
                              else {
                                //nếu có rồi thì cập nhật và cộng số đếm lên 1
                                let dem = row1s[0].dem+1;
                                if(dem>2)time=time+300;
                                con.query("UPDATE `active` SET `chuoi`='"+string1+"',`time`="+time+",`dem`="+dem+" WHERE `phone_id` LIKE '"+phone_id+"'",function(err1){
                                  if(err1)socket.emit('regis_1_thatbai','A');
                                  else socket.emit('regis_1_thanhcong');
                                });

                              }
                            }
                          });
                          }

                        }
                      }
              });

            }
          }
        });
      }
    });
    socket.on('forget_pass_2_windlaxy',(tin)=>{
      if(tin.mail&&tin.chuoi&&tin.pass){
        con.query("SELECT * FROM `active` WHERE `mail` LIKE '"+tin.mail+"' LIMIT 1", function(err, rows){
          if (err)socket.emit('forget_pass_2_thatbai','A');
          else{
            if(rows.length==0)socket.emit('forget_pass_2_thatbai','A');
            else {
              if(passwordHash.verify(tin.chuoi, rows[0].chuoi)){
                let pass1 = passwordHash.generate(''+tin.pass);
                con.query("UPDATE `account` SET `pass` = '"+pass1+"' WHERE `number` LIKE '"+tin.mail+"'", function(err2){
                   if (err2)socket.emit('forget_pass_2_thatbai','B');
                  else {
                    con.query("DELETE FROM `active` WHERE `mail` LIKE '"+tin.mail+"'", function(err2){
                       if (err2)socket.emit('forget_pass_2_ok');
                      });
                    socket.emit('forget_pass_2_ok');}
                });
              }
                else socket.emit('forget_pass_2_thatbai','B');
              }

          }
        });
      }
    });
    socket.on('C_check_phonenumber',(phone,code,id_phone)=>{
      if(phone&&code&&id_phone){

        con.query("SELECT * FROM `active` WHERE `phone_id` LIKE '"+ id_phone +"' LIMIT 1", function(err3, row1s){
          if(err3)socket.emit('regis_1_thatbai','A');
          else {
            if(row1s.length>0 && row1s[0].dem>2)socket.emit('regis_1_thatbai','C');
            else {
              con.query("SELECT * FROM `account` WHERE `number` LIKE '"+ phone +"' LIMIT 1", function(err, rows){
                      // nếu tài khoản đã có người đăng ký rồi thì:
                      if(err)socket.emit('regis_1_thatbai','A');
                      else {
                        if (rows.length >0 )	{socket.emit('regis_1_thatbai','D');}
                        else {
                          if(code=="A"){
                            cb.phoneInformation(phone, (error, response) => {
                              if(error)socket.emit('regis_1_thatbai','E');
                              else {
                                socket.emit('checkphone_ok');
                              }
                            });
                          }
                          else socket.emit('checkphone_ok');
                        }
                      }
              });

            }
          }
        });

      }

  });
   function get_time(gio){
      let year1 = gio.getFullYear();
      let month1 = gio.getMonth();
      let day1 = gio.getDate();
      let hr1 = gio.getHours();
      let min1 = gio.getMinutes();
      let sec1 = gio.getSeconds();
      let time_zone1 = gio.getTimezoneOffset();
      let ketqua = {year:year1,month:month1,day:day1,hr:hr1,min:min1,sec:sec1,time_zone:time_zone1};
      return ketqua;

    }
    // lắng nghe sự kiện đăng ký tài khoản mới
    socket.on('login1',(user1, pass1)=>{
      if(user1&&pass1){
        con.query("SELECT * FROM `account` WHERE `number` LIKE '"+user1+"' LIMIT 1", function(err, rows){
    	     if (err || rows.length ==0){socket.emit('login1_khongtaikhoan');}
    			 else{
            if (passwordHash.verify(pass1, rows[0].pass)){
                socket.emit('login1_dung', {name:rows[0].user});

            }
            else {
              socket.emit('login1_sai', {name:rows[0].user});

            }
          }
        });
      }
    });
    socket.on('login2',(data)=>{
      if(data.rightuser&&data.right_pass){
        con.query("SELECT * FROM `account` WHERE `number` LIKE '"+data.rightuser+"' LIMIT 1", function(err, rows){
    	    if (err || rows.length ==0){socket.emit('login2_khongtaikhoan');}
          else{
            if (passwordHash.verify(data.right_pass, rows[0].pass)){
              socket.number = data.rightuser;
              socket.username = rows[0].user;
              socket.join(data.rightuser);
              if(data.room != null && data.room!=""){
                            if(socket.roomabc){
                              socket.leave(socket.roomabc);
                              socket.join(data.room );
                              socket.roomabc = data.room;
                            }
                            else {
                              socket.join(data.room );
                              socket.roomabc = data.room;
                  }
              }
              // bản tin đến
              con.query("SELECT * FROM `"+socket.number+"main` WHERE `stt` LIKE 'N'", function(err, rows){
                if (err){socket.emit('login2_khongtaikhoan');console.log(err);}
                else if(rows.length>0){
                  rows.forEach((row, i) => {
                      let idc=row.idc;
                      let list_line=[];
                      let list_diem=[];
                      con.query("SELECT * FROM `"+socket.number+"line_main` WHERE `idc` LIKE '"+idc+"'", function(err1, row1s){
                        if (err1){socket.emit('login2_khongtaikhoan');}
                        else if(row1s.length>0){
                          row1s.forEach((row1, i1) => {
                            con.query("SELECT * FROM `"+socket.number+"line_detail` WHERE `idc` LIKE '"+row1.idlo+"'", function(err2, row2s){
                              if (err2){socket.emit('login2_khongtaikhoan');}
                              else if(row2s.length>0){
                                list_line.push({name:row1.name,culy:row1.culy,up_id:idc,list_line1:row2s,idlo:row1.idlo});
                                if(i1===(row1s.length-1)){
                                  con.query("SELECT * FROM `"+socket.number+"diem` WHERE `idc` LIKE '"+idc+"'", function(err3, row3s){
                                    if(err3){socket.emit('login2_khongtaikhoan');}
                                    else if(row3s.length>0){
                                      socket.emit('S_send_tinnhan',{name_nguoigui:row.name,number_nguoigui:row.number,
                                                                subject: row.subject, idc:row.idc, time:get_time(row.time),list_line:list_line,list_diem:row3s});
                                    }

                                  });
                                }

                              }
                            });
                          });
                        }
                        else {
                          con.query("SELECT * FROM `"+socket.number+"diem` WHERE `idc` LIKE '"+idc+"'", function(err3, row3s){
                            if(err3){socket.emit('login2_khongtaikhoan');}
                            else {
                              socket.emit('S_send_tinnhan',{name_nguoigui:row.name,number_nguoigui:row.number,
                                                        subject: row.subject, idc:row.idc, time:get_time(row.time),list_line:list_line,list_diem:row3s});
                            }

                          });

                        }
                      });


                  });
                }
              });
              // những người đã nhận tin của mình
              con.query("SELECT * FROM `"+socket.number+"main` WHERE `stt` LIKE 'K'", function(err, rows){
                if(err)console.log(err);
                else if(rows.length>0){
                  rows.forEach((row, i) => {

                    io.sockets.in(socket.number).emit('C_danhantinnhan',{nguoinhan:row.number,subject:row.subject, idc:row.idc,time:get_time(row.time)});
                  });
                }
              });
              // bản tin room online
              con.query("SELECT * FROM `"+socket.number+"main` WHERE `stt` LIKE 'R'", function(err, rows){
                if(err)console.log(err);
                else if(rows.length>0){
                  rows.forEach((row, i) => {
                    con.query("SELECT * FROM `list_member_w` WHERE `idc` LIKE '"+row.idc+"'", function(err2, rows2){
                      if(err2)console.log(err2);
                      else if(rows2.length>0){
                      socket.emit('S_send_room',{room_name:row.subject, room_id_server:row.idc, nguoigui_name:row.name, nguoigui_number:row.number,member:rows2, time:get_time(row.time)});
                      }
                    });
                  });
                }
              });
              //gửi danh sách bổ sung nếu chưa nhận được
              con.query("SELECT * FROM `"+socket.number+"main` WHERE `stt` LIKE 'Z'", function(err, rows){
                if(err)console.log(err);
                else if(rows.length>0){
                  rows.forEach((row, i) => {
                    con.query("SELECT * FROM `list_member_w` WHERE `idc` LIKE '"+row.idc+"'", function(err2, rows2){
                      if(err2)console.log(err2);
                      else if(rows2.length>0){
                        socket.emit('S_send_member_bosung',{ idc:row.idc, name:row.name, number:row.number,list:rows2});
                      }
                    });
                  });


                }
              });
              // gửi danh sách thành viên rời khỏi nhóm
              con.query("SELECT * FROM `"+socket.number+"main` WHERE `stt` LIKE 'H'", function(err, rows){
                if(err)console.log(err);
                else if(rows.length>0){
                  rows.forEach((row, i) => {
                    socket.emit('S_send_roi_nhom',row.idc,row.number);
                  });
                }
              });
              // gửi danh sách new admin, có chuyển cho người khác
              con.query("SELECT * FROM `"+socket.number+"main` WHERE `stt` LIKE 'V'", function(err, rows){
                if(err)console.log(err);
                else if(rows.length>0){
                  rows.forEach((row, i) => {
                    socket.emit('S_send_new_admin',row.idc,row.number);
                  });
                }
              });
              // gửi danh sách new admin, có chuyển cho người khác
              con.query("SELECT * FROM `"+socket.number+"main` WHERE `stt` LIKE 'X'", function(err, rows){
                if(err)console.log(err);
                else if(rows.length>0){
                  rows.forEach((row, i) => {
                    socket.emit('S_kick_off',row.idc);
                  });
                }
              });

            }//end
            else {socket.emit('login2_sai');}
          }
       	 });
       }
       else {
         socket.emit('login2_sai');
       }
  	});
    function check_data1(data){
      let abc;
      if(data==null||isNaN(data))abc=false;
      else abc=true;
      return abc;
    }
    socket.on('C_off_gps',(rooms)=>{
      if (socket.number&&rooms!=null){
        if (isArray(rooms)){
          rooms.forEach(function(room){
            if(room.room_fullname){
              io.sockets.in(room.room_fullname).emit('S_off_gps',{name:socket.username, number:socket.number});
            }
          });
        }
      }
    });
    socket.on('C_gui_tinnhan', (mess)=>{
      if (socket.number&&mess.nguoinhan&&mess.subject&&mess.vitri&&mess.line){
        let thoigian = new Date();
        let idc=''+Date.now();
        socket.emit('S_get_tinnhan',idc);
        if(isArray(mess.nguoinhan)){
            mess.nguoinhan.forEach((nguoi, key7)=>{
              if(nguoi.number){
                con.query("SELECT * FROM `account` WHERE `number` LIKE '"+ nguoi.number +"' LIMIT 1", function(err4, res4){
                      if ( err4 ){console.log(err4);}
                      else if ( res4.length >0){
                        // lưu vào bảng chính của người nhận
                        if(mess.vitri!=null &&mess.vitri.length>0){
                          var sql3 = "INSERT INTO `"+nguoi.number+"diem` (idc, name, lat, lon,idlo) VALUES ?";
                          mess.vitri.forEach((row,key)=>{
                                var val3 = [[idc, row.name, row.lat, row.lon,row.idlo]];
                                con.query(sql3, [val3], function (err3, res3) {if ( err3){console.log(err3);}});

                          });
                        }
                        if(mess.line!=null &&mess.line.length>0){
                          var sql4 = "INSERT INTO `"+nguoi.number+"line_main` (idc, name, culy,idlo) VALUES ?";
                          mess.line.forEach((row6,key6)=>{
                            var val4 = [[idc, row6.name, row6.culy,row6.idlo]];
                            con.query(sql4, [val4], function (err4, res4) {
                            if ( err4)console.log(err4);
                            else {
                                var sql5 = "INSERT INTO `"+nguoi.number+"line_detail` (idc, lat, lon,name,color,rieng1_id,stt_rieng1,rieng2_id,stt_rieng2) VALUES ?";
                                row6.list_line1.forEach((row7,key7)=>{
                                    var val5 = [[row6.idlo,row7.lat, row7.lon,row7.name,row7.color, row7.rieng1_id,row7.stt_rieng1,row7.rieng2_id,row7.stt_rieng2]];
                                    con.query(sql5, [val5], function (err5, res5) {if ( err5)console.log(err5);});
                                });
                              }
                            });
                          });
                        }
                        var sql5= "INSERT INTO `"+nguoi.number+"main` (idc,subject, number,name, stt, time ) VALUES ?";
                        var val5 = [[idc, mess.subject,socket.number,socket.username,'N',thoigian]];
                        con.query(sql5, [val5], function (err5, res5){
                            if ( err5){console.log(err5);}
                            else{
                                io.sockets.in(nguoi.number).emit('S_send_tinnhan',{name_nguoigui:socket.username,number_nguoigui:socket.number,
                                  subject: mess.subject, idc:idc, time:get_time(thoigian),list_line:mess.line,list_diem:mess.vitri});
                              }
                          });

                      }
                        // nếu tìm trong bảng acccount mà không có tên người nhận thì báo lại là không có ai nhận
                      else socket.emit('S_send_mess_no_contact',row5.number);
                    });



          }
          });
          }
        }

    });
    socket.on('C_del_acc',(pass,code,phone_id)=>{
      if(socket.number && pass&&code){
        con.query("SELECT * FROM `active` WHERE `phone_id` LIKE '"+ phone_id +"' LIMIT 1", function(err3, row1s){
          if(err3)socket.emit('del_acc_thatbai','A');
          else {
            if(row1s.length>0 && row1s[0].dem>2)socket.emit('del_acc_thatbai','C');
            else {
              con.query("SELECT * FROM `account` WHERE `number` LIKE '"+socket.number+"' LIMIT 1", function(err, rows){
                 if (err || rows.length ==0)socket.emit('del_acc_thatbai','A');
                 else{
                  if (passwordHash.verify(pass, rows[0].pass)){
                    var string = Math.floor(Math.random() * (899999)) + 100000;
                    var string1 = passwordHash.generate(''+string);
                    if(code =="A"){
                      cb.sendMessage({"to": socket.number, "text": 'Windlaxy OTP:'+string}, (error, response) => {
                          if(error)socket.emit('del_acc_thatbai','E');
                          else {
                            var time = Math.floor(Date.now() / 1000);
                            if(row1s.length==0){
                              var sql = "INSERT INTO `active` (mail,chuoi,time,dem,phone_id ) VALUES ?";
                              var values = [[socket.number, string1,time,1,phone_id]];
                              con.query(sql, [values], function (err1, result) {
                                if ( err1)socket.emit('del_acc_thatbai','A');
                                else  socket.emit('del_acc_thanhcong');
                              });
                            }
                            else {
                              //nếu có rồi thì cập nhật và cộng số đếm lên 1
                              let dem = row1s[0].dem+1;
                              if(dem>2)time=time+300;
                              con.query("UPDATE `active` SET `chuoi`='"+string1+"',`time`="+time+",`dem`="+dem+" WHERE `phone_id` LIKE '"+phone_id+"'",function(err1){
                                if(err1)socket.emit('regis_1_thatbai','A');
                                else socket.emit('regis_1_thanhcong');
                              });

                            }
                          }

                          });
                    }
                    else {
                      var mailOptions = {
                        from: 'windlaxy@gmail.com',
                        to: socket.number,
                        subject: 'Windlaxy OTP',
                        text: 'Your Windlaxy OTP:'+string
                      };
                      transporter.sendMail(mailOptions, function(error, info){
                      if (error) socket.emit('del_acc_thatbai','A');
                      else {
                        var time = Math.floor(Date.now() / 1000);
                        if(row1s.length==0){
                          var sql = "INSERT INTO `active` (mail,chuoi,time,dem,phone_id ) VALUES ?";
                          var values = [[socket.number, string1,time,1,phone_id]];
                          con.query(sql, [values], function (err1, result) {
                            if ( err1)socket.emit('del_acc_thatbai','A');
                            else socket.emit('del_acc_thanhcong');
                          });
                        }
                        else {
                          //nếu có rồi thì cập nhật và cộng số đếm lên 1
                          let dem = row1s[0].dem+1;
                          if(dem>2)time=time+300;
                          con.query("UPDATE `active` SET `chuoi`='"+string1+"',`time`="+time+",`dem`="+dem+" WHERE `phone_id` LIKE '"+phone_id+"'",function(err1){
                            if(err1)socket.emit('del_acc_thatbai','A');
                            else socket.emit('del_acc_thanhcong');
                          });
                        }
                      }
                    });
                    }
                  }
                  else socket.emit('del_acc_thatbai','D');
                }
              });



            }
          }
        });
      }
    });
    socket.on('del_acc_2',(chuoi)=>{
      if(socket.number && chuoi){
        con.query("SELECT * FROM `active` WHERE `mail` LIKE '"+socket.number+"' LIMIT 1", function(err, rows){
          if (err)socket.emit('del_acc_2_thatbai','A');
          else{
            if(rows.length==0)socket.emit('del_acc_2_thatbai','B');
            else {
              if(passwordHash.verify(chuoi, rows[0].chuoi)){
                con.query("DELETE FROM `account` WHERE `number` LIKE '"+socket.number+"'", function(err3){
                  if (err3)socket.emit('del_acc_2_thatbai','A');
                  else {
                    let abc= socket.number;
                    socket.emit('del_acc_2_thanhcong');
                    socket.number = null;socket.roomabc = undefined;
                con.query("DROP TABLE IF EXISTS `"+abc+"contact`", function(err4){ if (err4)console.log(err4);});
                con.query("DROP TABLE IF EXISTS `"+abc+"main`", function(err4){ if (err4)console.log(err4);});
                con.query("DROP TABLE IF EXISTS `"+abc+"diem`", function(err4){ if (err4)console.log(err4);});
                con.query("DROP TABLE IF EXISTS `"+abc+"line_main`", function(err4){ if (err4)console.log(err4);});
                con.query("DROP TABLE IF EXISTS `"+abc+"line_detail`", function(err4){ if (err4)console.log(err4);});

                  }
                });
              }
              else socket.emit('del_acc_2_thatbai','B');
            }

          }
        });

      }
    });
    socket.on('danhantinnhan',  (nguoigui, ten_nguoi_nhan,idc,subject)=>{
     	if (socket.number&&nguoigui&&idc){
        con.query("SELECT * FROM `account` WHERE `number` LIKE '"+ nguoigui +"' LIMIT 1", function(err4, res4){
            if ( err4 ){console.log(err4);}
            else if ( res4.length >0){
              var sql5= "INSERT INTO `"+nguoigui+"main` (idc,subject,number,stt,time ) VALUES ?";
              let thoigian = new Date();
              var val5 = [[idc,subject, socket.number,'K',thoigian]];
              con.query(sql5, [val5], function (err5, res5) {
                if ( err5){console.log(err5);}
                else {
                  io.sockets.in(nguoigui).emit('C_danhantinnhan',{nguoinhan:socket.number,subject:subject, idc:idc,time:get_time(thoigian)});
                  con.query("DELETE FROM `"+socket.number+"main` WHERE `idc` LIKE '"+idc+"'", function(err9){
                    if (err9)console.log(err9);
                    else {
                      con.query("DELETE FROM `"+socket.number+"diem` WHERE `idc` LIKE '"+idc+"'", function(err5){if (err5)console.log(err5);});
                      con.query("SELECT * FROM `"+socket.number+"line_main` WHERE `idc` LIKE '"+ idc +"'", function(err6, res6){
                          if ( err6 ){console.log(err6);}
                          else if ( res6.length >0){
                            res6.forEach((re6, i) => {
                              con.query("DELETE FROM `"+socket.number+"line_main` WHERE `id` LIKE '"+re6.id+"'", function(err8){
                                  if (err8)console.log(err8);
                                  else {
                                      con.query("DELETE FROM `"+socket.number+"line_detail` WHERE `idc` LIKE '"+re6.idlo+"'", function(err7){
                                          if (err7)console.log(err7);
                                    });
                                  }


                                });


                            });
                          }
                        });
                    }
                  });

                  }
              });

              }
          });
        }

    });
    socket.on('C_get_tin', (idc,code)=>{
      if(socket.number && idc&&code){
          con.query("DELETE FROM `"+socket.number+"main` WHERE `stt` LIKE '"+code+"' AND `idc` LIKE '"+idc+"'", (err)=>{
              if(err)console.log(err);
          });

      }
    });
    socket.on('search_contact', (string)=>{
      if (socket.number&&string!=null){
        con.query("SELECT `number`,`user`,  LOCATE('"+string+"',number) FROM `account` WHERE LOCATE('"+string+"',number)>0 LIMIT 50", function(err, a1s){
        if ( err)console.log(err);
        else
        {
          if(a1s.length>0){
            let noidung=[];
            a1s.forEach(function(a1,key){
              noidung.push({user:a1.user, number: a1.number});
                if(key===(a1s.length-1))  { socket.emit('S_send_search_contact',noidung);}

            });

          }
          else socket.emit('S_kq_check_contact_zero_2');
        }
      });
      }
    });
    socket.on('C_join_room', (room)=>{
      if (socket.number&&room){
        con.query("SELECT * FROM `list_member_w` WHERE `idc` LIKE '"+room+"' AND `number` LIKE '"+socket.number+"' LIMIT 1", function(err1, rows){
          if ( err1){console.log('co loi 2 '+err1);}
          else if(rows.length >0){
            socket.emit('S_get_join');
            if(socket.roomabc&&socket.roomabc!=room) socket.leave(socket.roomabc);
            socket.join(room);
            socket.roomabc = room;

          }
        });
      }
    });
    socket.on('C_leave_room', (room)=> {
        if (socket.number&&room){
        socket.leave(room);
        socket.roomabc = undefined;
      }
    });
    socket.on('C_out_of_room', (tin) =>{
      if (socket.number&&tin&&tin.room){
        if(socket.roomabc==tin.room){
          socket.leave(tin.room);
          socket.roomabc = undefined;
        }
        con.query("SELECT * FROM `list_member_w` WHERE `idc` LIKE '"+tin.room+"' AND `number` LIKE '"+socket.number+"' LIMIT 1", function(err1, row1s){
          if ( err1){console.log('co loi 1 '+err1);}
          else if(row1s.length >0){
            if(row1s[0].stt=='A'){
              if(tin.new_admin){
                con.query("UPDATE `list_member_w` SET `stt` = 'A' WHERE `number` LIKE '"+tin.new_admin+"'",function(err3, ok)
                {
                  if ( err3 ){socket.emit('C_out_of_room_thatbai');}
                  else {
                    con.query("DELETE FROM `list_member_w` WHERE `idc` LIKE '"+tin.room+"' AND `number` LIKE '"+socket.number+"'", function(err2){
                      if (err2)console.log(err2);
                      else {
                        socket.emit('S_get_out_of_room',tin.room);
                        con.query("SELECT * FROM `list_member_w` WHERE `idc` LIKE '"+tin.room+"'", function(err1, rows){
                          if ( err1){console.log('co loi 2 '+err1);}
                          else if(rows.length >0){
                            //gửi thông báo đến toàn bộ thành viên về việc rời nhóm
                            // xóa member đó đi,
                            // nếu thằng socket.number này mà là admin, thì chuyển lại admin cho thằng tiếp theo
                            rows.forEach((row, i) => {
                              var sql5 = "INSERT INTO `"+row.number+"main` (idc, number, stt ) VALUES ?";
                              var val5 = [[ tin.room, socket.number,'H']];
                              con.query(sql5, [val5], function (err5, res5){
                                  if ( err5){console.log(err5);}
                                  else {
                                    io.sockets.in(row.number).emit('S_send_roi_nhom',tin.room,socket.number);
                                    var sql6 = "INSERT INTO `"+row.number+"main` (idc, number, stt ) VALUES ?";
                                    var val6 = [[ tin.room, tin.new_admin,'V']];
                                    con.query(sql6, [val6], function (err6, res6){
                                        if ( err6){console.log(err6);}
                                        else io.sockets.in(row.number).emit('S_send_new_admin',tin.room,tin.new_admin);

                                    });

                                  }
                              });

                            });

                          }
                        });
                      }
                    });

                  }
                });
              }
            }
            else {
              con.query("DELETE FROM `list_member_w` WHERE `idc` LIKE '"+tin.room+"' AND `number` LIKE '"+socket.number+"'", function(err2){
                if (err2)console.log(err2);
                else {
                  socket.emit('S_get_out_of_room',tin.room);
                  con.query("SELECT * FROM `list_member_w` WHERE `idc` LIKE '"+tin.room+"'", function(err1, rows){
                    if ( err1){console.log('co loi 2 '+err1);}
                    else if(rows.length >0){
                      rows.forEach((row, i) => {
                        var sql5 = "INSERT INTO `"+row.number+"main` (idc, number, stt ) VALUES ?";
                        var val5 = [[ tin.room, socket.number,'H']];
                        con.query(sql5, [val5], function (err5, res5){
                            if ( err5){console.log(err5);}
                            else io.sockets.in(row.number).emit('S_send_roi_nhom',tin.room,socket.number);
                        });
                      });
                    }
                  });
                }
              });

            }

          }
          else socket.emit('S_get_out_of_room',tin.room);
        });
      }
    });
    socket.on('C_pos_online', (info)=>{
      if (socket.number&&info.room){
        if (isArray(info.room)){
          info.room.forEach((room)=>{
            if(room.room_fullname){
              io.sockets.in(room.room_fullname).emit('S_pos_online',{lat:info.lat, lon:info.lon, name:socket.username, number:socket.number, room:room.room_fullname});
            }
          });
        }
      }
    });
    socket.on('C_make_room', (info)=>{
      if (socket.number&&info.room_name&&info.member_list){
        let thoigian = new Date();
        // bắt đầu xử lý cái room
        var room_id = 'r'+Date.now();
        socket.emit('S_get_room',room_id);
        // gửi room cho các thành viên
        var sql1 = "INSERT INTO `list_room` (idc,name ) VALUES ?";
        val1 = [[ room_id,info.room_name]];
        con.query(sql1, [val1], function (err){
          if ( err){console.log(err);}
          else {
            var val7;
            var sql6;
            info.member_list.forEach((mem,key)=>{
              if(mem.number==socket.number){
                sql6 = "INSERT INTO `list_member_w` (idc,number,name,stt) VALUES ?";
                val7 = [[ room_id,mem.number, mem.name,mem.stt]];
                con.query(sql6, [val7], function (err7){
                  if ( err7){console.log(err7);}
                });
              }
              else {
                con.query("SELECT * FROM `account` WHERE `number` LIKE '"+ mem.number +"' LIMIT 1", function(err3, kq){
                  if(err3){console.log(err3);}
                  else if(kq.length >0){
                      sql6 = "INSERT INTO `list_member_w` (idc,number,name,stt) VALUES ?";
                      val7 = [[ room_id,mem.number, mem.name,mem.stt]];
                      con.query(sql6, [val7], function (err7){
                        if ( err7){console.log(err7);}
                        else {
                          sql8 = "INSERT INTO `"+mem.number+"main` (idc,subject,number,name,stt,time) VALUES ?";
                          val8 = [[ room_id,info.room_name,socket.number, socket.username,'R',thoigian]];
                          con.query(sql8, [val8], function (err8){
                            if ( err8){console.log(err8);}
                            else io.sockets.in(mem.number).emit('S_send_room',{room_name:info.room_name, room_id_server:room_id, nguoigui_name:socket.username, nguoigui_number:socket.number,member:info.member_list, time:get_time(thoigian)});
                          });
                        }

                      });


                  }
                });

              }
            });
          }

      });

      }
    });
    socket.on('C_change_pass', (oldpass,newpass)=>{
     if (socket.number&&oldpass&&newpass){
       con.query("SELECT * FROM `account` WHERE `number` LIKE '"+socket.number+"' LIMIT 1", function(err, rows){
          if (err || rows.length ==0){ socket.emit('change_pass_thatbai');}
         else{
           if (passwordHash.verify(oldpass, rows[0].pass)){
             var matkhau = passwordHash.generate(newpass);
            con.query("UPDATE `account` SET `pass` = '"+matkhau+"' WHERE `number` LIKE '"+socket.number+"'",function(err3, ok)
              {
                if ( err3 ){socket.emit('change_pass_thatbai');}
                  else
                        {
                          socket.emit('change_pass_ok');
                        }
              });


           }
           else {
             socket.emit('change_pass_sai_old_pass');
           }
         }
       });

      }
    });
    socket.on('C_bosung_member', (list)=>{
     if (socket.roomabc&&list&&isArray(list)){
        socket.emit ('S_get_bosung_member');
        let thoigian = new Date();
        con.query("SELECT * FROM `list_member_w` WHERE `idc` LIKE '"+socket.roomabc+"'", function(err1, rows){
        if ( err1){console.log('co loi 2 '+err1);}
        else if(rows.length >0){
          let member_full=list;
          rows.forEach((item2, i2) => {
            if(item2.number!=socket.number){
              con.query("SELECT * FROM `"+item2.number+"main` WHERE `idc` LIKE '"+socket.roomabc+"' AND `stt` LIKE 'Z' LIMIT 1", function(err6, rows6){
              if ( err6){console.log('co loi 6 '+err6);}
              else {
                if(rows6.length=0){
                var sql5 = "INSERT INTO `"+item2.number+"main` (idc, number,name, stt ) VALUES ?";
                var val5 = [[ socket.roomabc, socket.number,socket.username,'Z']];//z là ký hiệu cho member bổ sung
                con.query(sql5, [val5], function (err5){
                  if ( err5)console.log(err5);
                  io.sockets.in(item2.number).emit('S_send_member_bosung',{ idc:socket.roomabc, name:socket.username, number:socket.number,list:list});

                });
                }
                else io.sockets.in(item2.number).emit('S_send_member_bosung',{ idc:socket.roomabc, name:socket.username, number:socket.number,list:list});
            }
            });
            }
            member_full.push({number:item2.number,name:item2.name,stt:item2.stt});
            if(i2===(rows.length-1)){
              //gửi cho mấy đứa mới
              con.query("SELECT * FROM `list_room` WHERE `idc` LIKE '"+socket.roomabc+"' LIMIT 1", function(err33, row3s){
                if ( err33){console.log('co loi 33 '+err33);}
                else if(row3s.length >0){
                  list.forEach((item3, i3) => {
                    var sql3 = "INSERT INTO `"+item3.number+"main` (idc, subject,number,name, stt,time ) VALUES ?";
                    var val3= [[ socket.roomabc, row3s[0].name,socket.number,socket.username,'R',thoigian]];
                    con.query(sql3, [val3], function (err3, res3){
                        if ( err3){console.log(err3);}
                        else {

                         io.sockets.in(item3.number).emit('S_send_room',{room_name:row3s[0].name, room_id_server:row3s[0].idc, nguoigui_name:socket.username, nguoigui_number:socket.number,member:member_full, time:get_time(thoigian)});
                       }
                    });
                    con.query("SELECT * FROM `list_member_w` WHERE `idc` LIKE '"+socket.roomabc+"' AND `number` LIKE '"+item3.number+"' LIMIT 1", function(err7, row7s){
                      if ( err7){console.log('co loi 7 '+err7);}
                      else if(row7s.length ==0){
                        let sql4 = "INSERT INTO `list_member_w` (idc,number,name,stt) VALUES ?";
                        var val4= [[ socket.roomabc, item3.number,item3.name,'B']];
                        con.query(sql4, [val4], function (err4){ if ( err4){console.log(err4);}});
                      }
                    })

                  });
                }
              });
            }
          });
        }
      });
        }
    });
    socket.on('C_kick_member', (room,number)=>{
     if (socket.roomabc&&room&&number){
       if(socket.roomabc==room){
        con.query("SELECT * FROM `list_member_w` WHERE `idc` LIKE '"+room+"' AND `number` LIKE '"+socket.number+"' AND `stt` LIKE 'A' LIMIT 1", function(err, rows){
          if ( err){console.log('co loi 1 '+err);}
          else if(rows.length >0){
          //ĐÂY ĐÚNG LÀ ADMIN CỦA ROOM
            con.query("DELETE FROM `list_member_w` WHERE `idc` LIKE '"+room+"' AND `number` LIKE '"+number+"'", function(err2,kq){
              if (err2)console.log(err2);
              else {
                socket.emit ('S_get_kick_member');
                var sql3 = "INSERT INTO `"+number+"main` (idc, stt ) VALUES ?";
                var val3 = [[ room, 'X']];//x là bị kick ra ngoài
                con.query(sql3, [val3], function (err3, res3){
                  if ( err3){console.log(err3);}
                  else io.sockets.in(number).emit('S_kick_off',room);
                });
                con.query("SELECT * FROM `list_member_w` WHERE `idc` LIKE '"+room+"'", function(err1, row1s){
                  if(err1)console.log('C_kick_member'+err1);
                  else {
                    row1s.forEach((row1, i) => {
                      if(row1.number!=socket.number){
                        var sql5 = "INSERT INTO `"+row1.number+"main` (idc, number, stt ) VALUES ?";
                        var val5 = [[ room, number,'H']];
                        con.query(sql5, [val5], function (err5, res5){
                          if ( err5){console.log(err5);}
                          else io.sockets.in(row1.number).emit('S_send_roi_nhom',room,number);
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }

    }
    });
    socket.on('login1_suco',(user1, pass1)=>{
        if(user1&&pass1){
            con.query("SELECT * FROM `list_user` WHERE `user` LIKE '"+user1+"' LIMIT 1", function(err, rows){
              if (err || rows.length ==0){socket.emit('login1_suco_kotaikhoan');}
              else{
                if (rows[0].pass==pass1){
                  socket.user = user1;
                  socket.type = rows[0].type;

                  if(rows[0].type=="A"||rows[0].type=="B"||rows[0].type=="C")socket.join("chung");
                  else socket.join(user1);
                  socket.emit('login1_suco_dung', {name:rows[0].hoten,capbac:rows[0].capbac,chucvu:rows[0].chucvu,donvi:rows[0].donvi,type:rows[0].type});
                }
                else  socket.emit('login1_suco_sai', {name:rows[0].user});
              }
          });
        }
      });
    socket.on('login2_suco',(tin,trangthai)=>{
      if(tin.user&&tin.pass){
          con.query("SELECT * FROM `list_user` WHERE `user` LIKE '"+tin.user+"' LIMIT 1", (err, rows)=>{
                if (err){socket.emit('login2_suco_thatbai');console.log('11111'+err);}
                else if(rows.length>0){
                  if (rows[0].pass==tin.pass){
                    socket.emit("login2_suco_ok");
                    socket.user = tin.user;
                    socket.hoten = rows[0].hoten;
                    socket.type = rows[0].type;
                    socket.donvi=rows[0].donvi;
                    if(rows[0].type=="A"||rows[0].type=="B"||rows[0].type=="C"||rows[0].type=="D") {
                      socket.join("chung");
                      //kiểm tra xem có bản tin nào chưa gửi về không thì gửi về cho nó
                      let lenh;
                      if(trangthai=='A')lenh="SELECT * FROM `list_err` WHERE id > "+tin.tt+" ORDER BY id DESC LIMIT 20";
                      else lenh="SELECT * FROM `list_err` WHERE id > "+tin.tt+" ORDER BY id ASC";
                      con.query(lenh, function(err1, row1s){
                        if (err1){console.log(err1);}
                        else if(row1s.length>0){
                          let noidung=[];
                          row1s.forEach((row1, i) => {
                            con.query("SELECT `tt` FROM `list_vitri` WHERE idc LIKE '"+row1.idc+"' ORDER BY `tt` DESC LIMIT 1", function(err2, row2s){
                              if (err2){console.log(err2);}
                              else {
                                let a1='B';
                                let a2='B';
                                let a3='B';
                                let a4='B';
                                let a0='B';
                                let a6='B';
                                let batdau=null;if(row1.batdau!=null){batdau=get_time(row1.batdau);a1='A';}
                                let dennoi=null;if(row1.dennoi!=null){dennoi=get_time(row1.dennoi);a2='A';}
                                let xong=null;if(row1.xong!=null){xong=get_time(row1.xong);a3='A';}
                                let vedonvi=null;if(row1.vedonvi!=null){vedonvi=get_time(row1.vedonvi);a4='A';}
                                let giaonv2=null;if(row1.giaonv2!=null){giaonv2=get_time(row1.giaonv2);a0='A';}
                                let nguyennhan='';if(row1.nguyennhan!=null)nguyennhan=row1.nguyennhan;
                                let tieuhao=''; if(row1.tieuhao!=null)tieuhao=row1.tieuhao;
                                let tt_vitri=0;
                                if(row2s.length>0)tt_vitri=row2s[0].tt;
                                socket.emit("S_send_nhiemvu",{tt_vitri:tt_vitri,tt:row1.id,idc:row1.idc,ten:row1.ten,mota:row1.mota,giaonv1:get_time(row1.giaonv1),tb_hoten:row1.tb_hoten,tb_chucvu:row1.tb_chucvu,tb_donvi:row1.tb_donvi,
                                  ch1_hoten:row1.ch1_hoten,ch1_chucvu:row1.ch1_chucvu,ch1_donvi:row1.ch1_donvi,nguyennhan:nguyennhan,tieuhao:tieuhao,
                                  giaonv2:giaonv2, ch2_hoten:row1.ch2_hoten,ch2_chucvu:row1.ch2_chucvu,ch2_donvi:row1.ch2_donvi,batdau:batdau,dennoi:dennoi,xong:xong,vedonvi:vedonvi,a0:a0,a1:a1,a2:a2,a3:a3,a4:a4},trangthai);
                              }
                            });

                          });
                        }
                      });
                      if(tin.bantin!=undefined&&tin.bantin.length>0){
                        tin.bantin.forEach((item, i) => {
                        con.query("SELECT * FROM `list_err` WHERE `idc` LIKE '"+item.idc+"' LIMIT 1", function(err2, row2s){
                            if (err2){console.log(err2);}
                            else if(row2s.length>0){
                              let phat='B';
                              let a1='B';
                              let a2='B';
                              let a3='B';
                              let a4='B';
                              let a0='B';
                              let a20='B';
                              let a21='B';
                              let a6='B';
                              let a25='B';
                              let batdau=''; let dennoi=''; let xong=''; let vedonvi='';
                              let giaonv2='';
                              if(item.a0=='A'){
                                if(row2s[0].giaonv2!=null&&row2s[0].giaonv2!=''){giaonv2=get_time(row2s[0].giaonv2);a0='A';phat='A';}
                              }
                              if(item.a3=='A'){
                                if(row2s[0].xong!=null&&row2s[0].xong!=''){xong=get_time(row2s[0].xong);a3='A';phat='A';}
                                if(item.a2=='A'){
                                  if(row2s[0].dennoi!=null&&row2s[0].dennoi!=''){dennoi=get_time(row2s[0].dennoi);a2='A';phat='A';}
                                  if(item.a1=='A'){
                                    if(row2s[0].batdau!=null&&row2s[0].batdau!=''){batdau=get_time(row2s[0].batdau);a1='A';phat='A';}
                                  }
                                }
                              }
                              if(row2s[0].vedonvi!=null&&row2s[0].vedonvi!=''){vedonvi=get_time(row2s[0].vedonvi);a4='A';phat='A';}
                              let nguyennhan='';let tieuhao='';
                              if(item.a20=='A'){
                                if(row2s[0].nguyennhan!=null&&row2s[0].nguyennhan!=''){nguyennhan=row2s[0].nguyennhan;phat='A';a20='A';}
                              }
                              if(item.a21=='A'){
                                if(row2s[0].tieuhao!=null&&row2s[0].tieuhao!=''){tieuhao=row2s[0].tieuhao;phat='A';a21='A';}
                              }
                              if(phat=='A')socket.emit("S_capnhat",{idc:item.idc,giaonv2:giaonv2,ch2_hoten:row2s[0].ch2_hoten,ch2_chucvu:row2s[0].ch2_chucvu,ch2_donvi:row2s[0].ch2_donvi,batdau:batdau,nguyennhan:row2s[0].nguyennhan,tieuhao:row2s[0].tieuhao,dennoi:dennoi,xong:xong,vedonvi:vedonvi,a0:a0,a1:a1,a2:a2,a3:a3,a4:a4,a20:a20,a21:a21,a7:'B'});
                              con.query("SELECT `tt` FROM `list_vitri` WHERE idc LIKE '"+item.idc+"' AND tt >"+item.a25+" ORDER BY `tt` ASC", function(err3, row3s){
                                if (err3){console.log(err3);}
                                else if(row3s.length>0){
                                  let noidung=[];
                                  for(let i=0;i<row3s.length;i++){
                                    noidung.push({lat:row3s[i].lat,lon:row3s[i].lon,tt:row3s[i].tt});
                                    if(i===(row3s.length-1))socket.emit("S_capnhat_vitri",noidung,row3s[i].idc);
                                  }
                                }
                              });
                            }
                          });
                        });
                      }

                      if(rows[0].type=="A") {
                        con.query("SELECT * FROM `list_user` WHERE `id` > "+tin.tt_list+" AND `id`>5 ORDER BY id ASC", function(err5, row5s){
                          if (err5)console.log('2222'+err5);
                          else{
                            if(row5s.length>0){
                              row5s.forEach((item, i) => {
                                  socket.emit("S_send_user",{tt:item.id, user:item.user,hoten:item.hoten,capbac:item.capbac,chucvu:item.chucvu,donvi:item.donvi,type:item.type});
                              });
                            }
                          }
                        });
                        con.query("SELECT * FROM `list_donvi` WHERE `id` > "+tin.donvi+" ORDER BY id ASC", function(err6, row6s){
                          if (err6)console.log('2234'+err6);
                          else{
                            if(row6s.length>0){
                              row6s.forEach((item6, i) => {
                                  socket.emit("S_send_donvi",{tt:item6.id, donvi:item6.donvi});
                              });
                            }
                          }
                        });
                      }
                      else if(rows[0].type=="B") {
                        con.query("SELECT * FROM `list_user` WHERE `type` LIKE 'E' AND `id` > "+tin.tt_list+" AND `id`>5 ORDER BY id ASC", function(err5, row5s){
                          if (err5)console.log('2225'+err5);
                          else{
                            if(row5s.length>0){
                              row5s.forEach((item, i) => {
                                  socket.emit("S_send_user",{tt:item.id, user:item.user,hoten:item.hoten,capbac:item.capbac,chucvu:item.chucvu,donvi:item.donvi,type:item.type});
                              });
                            }
                          }
                        });
                      }
                    }
                    else {
                      socket.join(tin.user);
                      let lenh;
                      if(trangthai=='A')lenh="SELECT * FROM `list_err` WHERE id > "+tin.tt+" ORDER BY id DESC";
                      else lenh="SELECT * FROM `list_err` WHERE id > "+tin.tt+" ORDER BY id ASC";
                      if(trangthai=='A'){
                        if(rows[0].type=="E")lenh="SELECT * FROM `list_err` WHERE `ch1_user` LIKE '"+tin.user+"' AND id > "+tin.tt+" ORDER BY id DESC";
                        else lenh="SELECT * FROM `list_err` WHERE `ch2_user` LIKE '"+tin.user+"' AND id >"+tin.tt+"  ORDER BY id DESC";
                      }
                      else {
                        if(rows[0].type=="E")lenh="SELECT * FROM `list_err` WHERE `ch1_user` LIKE '"+tin.user+"' AND id > "+tin.tt+" ORDER BY id ASC";
                        else lenh="SELECT * FROM `list_err` WHERE `ch2_user` LIKE '"+tin.user+"' AND id >"+tin.tt+"  ORDER BY id ASC";
                      }

                      con.query(lenh, function(err1, row1s){
                        if (err1){console.log('33333'+err1);}
                        else if(row1s.length>0){
                          let noidung=[];
                          row1s.forEach((row1, i) => {
                            con.query("SELECT * FROM `list_vitri` WHERE idc LIKE '"+row1.idc+"' ORDER BY `tt` DESC LIMIT 1", function(err2, row2s){
                              if (err2){console.log(err2);}
                              else {
                                let tt_vitri=0;
                                if(row2s.length>0)tt_vitri=row2s[0].tt;
                                let a1='B';
                                let a2='B';
                                let a3='B';
                                let a4='B';
                                let a0='B';
                                let giaonv2=null;if(row1.giaonv2!=null){giaonv2=get_time(row1.giaonv2);a0='A';}
                                let batdau=null;if(row1.batdau!=null){batdau=get_time(row1.batdau);a1='A';}
                                let dennoi=null;if(row1.dennoi!=null){dennoi=get_time(row1.dennoi);a2='A';}
                                let xong=null;if(row1.xong!=null){xong=get_time(row1.xong);a3='A';}
                                let vedonvi=null;if(row1.vedonvi!=null){vedonvi=get_time(row1.vedonvi);a4='A';}
                                let nguyennhan='';if(row1.nguyennhan!=null)nguyennhan=row1.nguyennhan;
                                let tieuhao=''; if(row1.tieuhao!=null)tieuhao=row1.tieuhao;
                                socket.emit("S_send_nhiemvu",{tt_vitri:tt_vitri,tt:row1.id,idc:row1.idc,ten:row1.ten,mota:row1.mota,giaonv1:get_time(row1.giaonv1),tb_hoten:row1.tb_hoten,tb_chucvu:row1.tb_chucvu,tb_donvi:row1.tb_donvi,
                                  ch1_hoten:row1.ch1_hoten,ch1_chucvu:row1.ch1_chucvu,ch1_donvi:row1.ch1_donvi,nguyennhan:nguyennhan,tieuhao:tieuhao,
                                  giaonv2:giaonv2, ch2_hoten:row1.ch2_hoten,ch2_chucvu:row1.ch2_chucvu,ch2_donvi:row1.ch2_donvi,batdau:batdau,dennoi:dennoi,xong:xong,vedonvi:vedonvi,a0:a0,a1:a1,a2:a2,a3:a3,a4:a4},trangthai);

                              }
                            });

                          });

                        }
                      });
                      if(tin.bantin.length>0){
                        tin.bantin.forEach((item, i) => {

                          if(rows[0].type=="E")lenh="SELECT * FROM `list_err` WHERE `ch1_user` LIKE '"+tin.user+"' AND `idc` LIKE '"+item.idc+"' LIMIT 1";
                          else "SELECT * FROM `list_err` WHERE `ch2_user` LIKE '"+tin.user+"' AND `idc` LIKE '"+item.idc+"' LIMIT 1";
                          con.query(lenh, function(err2, row2s){
                            if (err2){console.log('4444'+err2);}
                            else if(row2s.length>0){
                              let phat='B';
                              let a1='B';
                              let a2='B';
                              let a3='B';
                              let a4='B';
                              let a0='B';
                              let a20='B';
                              let a21='B';
                              let batdau=''; let dennoi=''; let xong=''; let vedonvi='';let giaonv2='';
                              if(item.a0=='A'){
                                if(row2s[0].giaonv2!=null&&row2s[0].giaonv2!=''){giaonv2=get_time(row2s[0].giaonv2);a0='A';phat='A';}
                              }
                              if(item.a3=='A'){
                                if(row2s[0].xong!=null&&row2s[0].xong!=''){xong=get_time(row2s[0].xong);a3='A';phat='A';}
                                if(item.a2=='A'){
                                  if(row2s[0].dennoi!=null&&row2s[0].dennoi!=''){dennoi=get_time(row2s[0].dennoi);a2='A';phat='A';}
                                  if(item.a1=='A'){
                                    if(row2s[0].batdau!=null&&row2s[0].batdau!=''){batdau=get_time(row2s[0].batdau);a1='A';phat='A';}
                                  }
                                }
                              }
                              if(row2s[0].vedonvi!=null&&row2s[0].vedonvi!=''){vedonvi=get_time(row2s[0].vedonvi);a4='A';phat='A';}
                              let nguyennhan='';let tieuhao='';
                              if(item.a20=='A'){
                                if(row2s[0].nguyennhan!=null&&row2s[0].nguyennhan!=''){nguyennhan=row2s[0].nguyennhan;phat='A';a20='A';}
                              }
                              if(item.a21=='A'){
                                if(row2s[0].tieuhao!=null&&row2s[0].tieuhao!=''){tieuhao=row2s[0].tieuhao;phat='A';a21='A';}
                              }
                              if(phat=='A') socket.emit("S_capnhat",{idc:item.idc,giaonv2:giaonv2,ch2_hoten:row2s[0].ch2_hoten,ch2_chucvu:row2s[0].ch2_chucvu,ch2_donvi:row2s[0].ch2_donvi,batdau:batdau,nguyennhan:row2s[0].nguyennhan,tieuhao:row2s[0].tieuhao,dennoi:dennoi,xong:xong,vedonvi:vedonvi,a0:a0,a1:a1,a2:a2,a3:a3,a4:a4,a20:a20,a21:a21,a7:'B'});
                              con.query("SELECT * FROM `list_vitri` WHERE idc LIKE '"+item.idc+"' AND tt >"+item.a25+" ORDER BY tt ASC", function(err3, row3s){
                                if (err3){console.log(err3);}
                                else if(row3s.length>0){
                                  let noidung=[];
                                  for(let i=0;i<row3s.length;i++){
                                    noidung.push({lat:row3s[i].lat,lon:row3s[i].lon,tt:row3s[i].tt});
                                    if(i===(row3s.length-1))socket.emit("S_capnhat_vitri",noidung,row3s[i].idc);
                                  }

                                }
                              });

                            }
                          });
                        });
                      }

                      if(rows[0].type=="E"){
                        con.query("SELECT * FROM `list_user` WHERE `user` LIKE '"+tin.user+"' LIMIT 1", function(err4, row4s){
                          if (err4)console.log('5555'+err4);
                          else{
                            con.query("SELECT * FROM `list_user` WHERE LOCATE('"+row4s[0].donvi+"',donvi)>0 AND `id` > "+tin.tt_list+" AND `id` > 5 ORDER BY id ASC", function(err5, row5s){
                              if (err5)console.log(err5);
                              else{
                                if(row5s.length>0){
                                  row5s.forEach((item, i) => {
                                    if(item.user!=tin.user) socket.emit("S_send_user",{tt:item.id, user:item.user,hoten:item.hoten,capbac:item.capbac,chucvu:item.chucvu,donvi:item.donvi,type:item.type});
                                  });
                                }
                              }
                            });

                          }
                        });
                      }
                    }
                  }
                  else  socket.emit('login2_suco_thatbai');
                }
            });
          }
      });
    socket.on('C_reg_vitri',(idc)=>{
      if(socket.user!=null&&idc!=null){
        con.query("SELECT `tt`,`lat`,`lon` FROM `list_vitri` WHERE `idc` LIKE '"+idc+"' ORDER BY tt ASC", (err2, row2s)=>{
            if (err2){console.log(err2);}
            else {
              if(socket.roomabc!=null)socket.leave(socket.roomabc);
              socket.join(idc);
              socket.roomabc=idc;
              socket.emit("S_send_vitri_ok",row2s);
            }
        });
      }
    });
    socket.on('C_reg_more_err',(tt)=>{

      if(socket.user!=null&&tt!=null){
        let lenh;
        if(socket.type=='A'||socket.type=='B'||socket.type=='C'||socket.type=='D'){
          lenh="SELECT * FROM `list_err` WHERE id < "+tt+" ORDER BY id DESC";
        }
        else if(socket.type=="E")lenh="SELECT * FROM `list_err` WHERE `ch1_user` LIKE '"+socket.user+"' AND id < "+tt+" ORDER BY id DESC";
        else lenh="SELECT * FROM `list_err` WHERE `ch2_user` LIKE '"+socket.user+"' AND id <"+tt+"  ORDER BY id DESC";
        con.query(lenh, function(err1, row1s){
          if (err1){console.log('33333'+err1);}
          else if(row1s.length>0){
            let noidung=[];
            row1s.forEach((row1, i) => {
              con.query("SELECT * FROM `list_vitri` WHERE idc LIKE '"+row1.idc+"' ORDER BY `tt` DESC LIMIT 1", function(err2, row2s){
                if (err2){console.log(err2);}
                else {
                  let tt_vitri=0;
                  if(row2s.length>0)tt_vitri=row2s[0].tt;
                  let a1='B';
                  let a2='B';
                  let a3='B';
                  let a4='B';
                  let a0='B';
                  let giaonv2=null;if(row1.giaonv2!=null){giaonv2=get_time(row1.giaonv2);a0='A';}
                  let batdau=null;if(row1.batdau!=null){batdau=get_time(row1.batdau);a1='A';}
                  let dennoi=null;if(row1.dennoi!=null){dennoi=get_time(row1.dennoi);a2='A';}
                  let xong=null;if(row1.xong!=null){xong=get_time(row1.xong);a3='A';}
                  let vedonvi=null;if(row1.vedonvi!=null){vedonvi=get_time(row1.vedonvi);a4='A';}
                  let nguyennhan='';if(row1.nguyennhan!=null)nguyennhan=row1.nguyennhan;
                  let tieuhao=''; if(row1.tieuhao!=null)tieuhao=row1.tieuhao;
                  socket.emit("S_send_nhiemvu_more",{tt_vitri:tt_vitri,tt:row1.id,idc:row1.idc,ten:row1.ten,mota:row1.mota,giaonv1:get_time(row1.giaonv1),tb_hoten:row1.tb_hoten,tb_chucvu:row1.tb_chucvu,tb_donvi:row1.tb_donvi,
                    ch1_hoten:row1.ch1_hoten,ch1_chucvu:row1.ch1_chucvu,ch1_donvi:row1.ch1_donvi,nguyennhan:nguyennhan,tieuhao:tieuhao,
                    giaonv2:giaonv2, ch2_hoten:row1.ch2_hoten,ch2_chucvu:row1.ch2_chucvu,ch2_donvi:row1.ch2_donvi,batdau:batdau,dennoi:dennoi,xong:xong,vedonvi:vedonvi,a0:a0,a1:a1,a2:a2,a3:a3,a4:a4});


                }
              });

            });

          }
        });
      }
    });
    socket.on('C_reg_hinhanh',(idc,tt)=>{
        if(socket.user!=null&&tt!=null){
          con.query("SELECT `hinhanh`,`name`,`diadanh` FROM `list_vitri` WHERE `idc` LIKE '"+idc+"' AND `tt`="+tt+" ORDER BY tt ASC LIMIT 1", (err2, row2s)=>{
              if (err2){console.log(err2);}
              else {
                if(row2s[0].hinhanh!=null){
                  fs.readFile(row2s[0].hinhanh, (err, data2) => {
                      if (err) { console.log('Có lỗi xảy ra khi đọc file:');}
                      else {
                        let base64Data = data2.toString('base64');
                        socket.emit("S_send_hinhanh_ok",{name:row2s[0].name,diadanh:row2s[0].diadanh,hinhanh: base64Data});
                      }
                    });
                }
              }
          });
        }
            });
    socket.on('make_user', (nd,tin)=>{
      if (socket.user!=null && socket.type!=null&&socket.type=="A"){
        if(nd=='A'){
          con.query("SELECT * FROM `list_user` WHERE `user` LIKE '"+tin.user+"' LIMIT 1", function(err, rows){
           if (err)socket.emit("regis_suco_thatbai",'A',"A");
           else{
                if(rows.length==0){
                  var sql = "INSERT INTO `list_user` (user, pass,hoten,capbac,chucvu,donvi,type) VALUES ?";
                    var values = [[tin.user,tin.pass,tin.hoten,tin.capbac,tin.chucvu,tin.donvi,tin.type]];
                    con.query(sql, [values], function (err1, result) {
                      if (err1)socket.emit("regis_suco_thatbai",'A',"A");
                      else  socket.emit("regis_suco_ok",'A',result.insertId);
                    });
                }  else socket.emit("regis_suco_thatbai",'A',"B");
           }
         });
        }
        else {
          con.query("SELECT * FROM `list_donvi` WHERE `donvi` LIKE '"+tin+"' LIMIT 1", function(err, rows){
           if (err)socket.emit("regis_suco_thatbai",'B',"A");
           else{
                if(rows.length==0){
                  var sql = "INSERT INTO `list_donvi` (donvi) VALUES ?";
                    var values = [[tin]];
                    con.query(sql, [values], function (err1, result) {
                      if (err1)socket.emit("regis_suco_thatbai",'B',"A");
                      else  socket.emit("regis_suco_ok",'B',result.insertId);
                    });
                }  else socket.emit("regis_suco_thatbai",'B',"B");
           }
         });
        }

        }
      });
    socket.on('giao_nhiemvu', (tin)=>{
         if (socket.user!=null && socket.type!=null&&socket.type=="B"){
           var idc = 'r'+Date.now();
           let thoigian=new Date();
           var sql = "INSERT INTO `list_err` (idc,ten, mota,tb_user,tb_hoten,tb_chucvu,tb_donvi,giaonv1,ch1_user,ch1_hoten,ch1_chucvu,ch1_donvi) VALUES ?";
             var values = [[idc,tin.ten,tin.mota,tin.tb_user,tin.tb_hoten,tin.tb_chucvu,tin.tb_donvi,thoigian,tin.user,tin.hoten,tin.chucvu,tin.donvi]];
             con.query(sql, [values], function (err1, result) {
               if (err1)socket.emit("giao_nhiemvu_thatbai","A");
               else {
                     socket.emit("giao_nhiemvu_ok",{tt:result.insertId ,idc:idc,time:get_time(thoigian)});
                     io.sockets.in("chung").emit("S_send_nhiemvu",{tt_vitri:0,tt:result.insertId,idc:idc,ten:tin.ten,mota:tin.mota,tb_hoten:tin.tb_hoten,tb_chucvu:tin.tb_chucvu,tb_donvi:tin.tb_donvi,giaonv1:get_time(thoigian),
                     ch1_hoten:tin.hoten,ch1_chucvu:tin.chucvu,ch1_donvi:tin.donvi,a0:'B',a1:'B',a2:'B',a3:'B',a4:'B',nguyennhan:'',tieuhao:''},'B');
                     io.sockets.in(tin.user).emit("S_send_nhiemvu",{tt_vitri:0,tt:result.insertId,idc:idc,ten:tin.ten,mota:tin.mota,tb_hoten:tin.tb_hoten,tb_chucvu:tin.tb_chucvu,tb_donvi:tin.tb_donvi,giaonv1:get_time(thoigian),
                     ch1_hoten:tin.hoten,ch1_chucvu:tin.chucvu,ch1_donvi:tin.donvi,a0:'B',a1:'B',a2:'B',a3:'B',a4:'B',nguyennhan:'',tieuhao:''},'B');
               }
             });
          }
        });
    socket.on('giao_nhiemvu2', (tin)=>{
      if (socket.user!=null && socket.type!=null&&socket.type=="E"){
          let thoigian=new Date();
          let sql1 = "UPDATE `list_err` SET `giaonv2` = ?,`ch2_user` = ?,`ch2_hoten` = ?,`ch2_chucvu` = ?,`ch2_donvi` = ? WHERE `idc` LIKE ?";
          let val1 = [thoigian, tin.user,tin.hoten,tin.chucvu,tin.donvi,tin.idc];
          con.query(sql1,val1,function(err2){
              if(err2){socket.emit('giao_nhiemvu2_thatbai');console.log(err2);}
              else {
                con.query("SELECT * FROM `list_err` WHERE `idc` LIKE '"+tin.idc+"' LIMIT 1", function(err, rows){
                  if (err || rows.length ==0){socket.emit('giao_nhiemvu2_thatbai');}
                  else{
                    socket.emit("giao_nhiemvu2_ok",{idc:tin.idc,time:get_time(thoigian)});
                    io.sockets.in("chung").emit("S_giaonv2",{idc:tin.idc,giaonv2:get_time(thoigian), ch2_hoten:tin.hoten,ch2_chucvu:tin.chucvu,ch2_donvi:tin.donvi});
                    io.sockets.in(tin.user).emit("S_send_nhiemvu",{tt:rows[0].id,idc:rows[0].idc,ten:rows[0].ten,mota:rows[0].mota,giaonv1:get_time(rows[0].giaonv1),tb_hoten:rows[0].tb_hoten,tb_chucvu:rows[0].tb_chucvu,tb_donvi:rows[0].tb_donvi,
                      ch1_hoten:rows[0].ch1_hoten,ch1_chucvu:rows[0].ch1_chucvu,ch1_donvi:rows[0].ch1_donvi,
                      giaonv2:get_time(thoigian),a1:'B',a2:'B',a3:'B',a4:'B',nguyennhan:'',tieuhao:''},'B');

                  }
                });

                  }
               });

        }
    });
    socket.on('C_capnhat', (idc,nd,nd2)=>{
      if (socket.user!=null){
        let abc='';
        if (nd=="E"||nd=="F"){
          if(nd=="E")abc='nguyennhan';
          else abc='tieuhao';
          let sql1 = "UPDATE `list_err` SET `"+abc+"` = ? WHERE `idc` LIKE ?";
          let val1 = [nd2, idc];
          con.query(sql1,val1,function(err2){
            if(err2){socket.emit('gui_thongtin_thatbai',nd);console.log(err2);}
            else {
              if(nd=='E'){
                socket.emit('gui_thongtin_ok',{nd:nd,idc:idc});
                io.sockets.in("chung").emit("S_gui_thongtin",{nd:nd,idc:idc,nguyennhan:nd2});
                //gui cho chi huy 1 neu co
                if(socket.type=="F"){
                     con.query("SELECT * FROM `list_err` WHERE `idc` LIKE '"+idc+"' LIMIT 1", function(err, rows){
                       if (err){console.log(err);}
                       else{
                         io.sockets.in(rows[0].ch1_user).emit("S_gui_thongtin",{nd:nd,idc:idc,nguyennhan:nd2});
                       }
                     });
                   }
                }
                else {
                  socket.emit('gui_thongtin_ok',{nd:nd,idc:idc});
                  io.sockets.in("chung").emit("S_gui_thongtin",{nd:nd,idc:idc,tieuhao:nd2});
                  //gui cho chi huy 1 neu co
                  if(socket.type=="F"){
                    con.query("SELECT * FROM `list_err` WHERE `idc` LIKE '"+idc+"' LIMIT 1", function(err, rows){
                      if (err){console.log(err);}
                      else{
                        io.sockets.in(rows[0].ch1_user).emit("S_gui_thongtin",{nd:nd,idc:idc,tieuhao:nd2});
                      }
                    });
                  }
                }

               }
            });
          }
        else if(nd=="L"){
          let filename = 'p'+Date.now()+'.jpg';
          let filePath = path.join('/root/tdsc', filename);
          let byteArray = Buffer.from(nd2.hinhanh, 'base64');
          fs.writeFile(filePath, byteArray, (err) => {
                if (err) {console.log(err);}
                else {
                  var sql = "INSERT INTO `list_vitri` (idc,lat, lon,name,hinhanh,hinhanh_tt,diadanh,donvi,user) VALUES ?";
                  var values = [[idc,nd2.lat,nd2.lon,nd2.name,filePath,0,nd2.diadanh,socket.donvi,socket.user]];
                  con.query(sql, [values], function (err1, result) {
                  if (err1)socket.emit("giao_nhiemvu_thatbai","L");
                  else {
                      socket.emit('gui_thongtin_ok',{nd:'L',idc:idc,tt:result.insertId});
                      io.sockets.in("chung").emit("S_capnhat_1_vitri",{lat:nd2.lat,lon:nd2.lon,idc:idc,tt:result.insertId});
                      if(socket.type=="F"){
                          con.query("SELECT `ch1_user` FROM `list_err` WHERE `idc` LIKE '"+idc+"' LIMIT 1", function(err, rows){
                              if (err){console.log(err);}
                              else io.sockets.in(rows[0].ch1_user).emit("S_capnhat_1_vitri",{lat:nd2.lat,lon:nd2.lon,idc:idc,tt:result.insertId});
                          });
                      }
                    }
                  });
                }
              });
          }
          else if(nd=="M"){
            con.query("DELETE FROM `list_vitri` WHERE `tt` ="+nd2, function(err3){
              if (err3)console.log(err3);
              else {
                socket.emit('gui_thongtin_ok',{nd:nd,idc:idc,tt:nd2});
                io.sockets.in("chung").emit("S_gui_thongtin",{nd:nd,idc:idc,tt:nd2});
                if(socket.type=="F"){
                  con.query("SELECT * FROM `list_err` WHERE `idc` LIKE '"+idc+"' LIMIT 1", function(err, rows){
                    if (err){console.log(err);}
                    else{
                      io.sockets.in(rows[0].ch1_user).emit("S_gui_thongtin",{nd:nd,idc:idc,tt:nd2});
                    }
                  });
                }
              }
            });
          }
          else {
            let thoigian=new Date();
            if(nd=="A")abc='batdau';
            else if(nd=="B")abc='dennoi';
            else if(nd=="C")abc='xong';
            else if(nd=="D")abc='vedonvi';
            let sql1 = "UPDATE `list_err` SET `"+abc+"` = ? WHERE `idc` LIKE ?";
            let val1 = [thoigian, idc];
            con.query(sql1,val1,function(err2){
              if(err2){socket.emit('gui_thongtin_thatbai',nd);console.log(err2);}
               else {
                 socket.emit('gui_thongtin_ok',{nd:nd,idc:idc,time:get_time(thoigian)});
                 io.sockets.in("chung").emit("S_gui_thongtin",{nd:nd,idc:idc,time:get_time(thoigian)});
                 //gui cho chi huy 1 neu co
                 if(socket.type=="F"){
                   con.query("SELECT * FROM `list_err` WHERE `idc` LIKE '"+idc+"' LIMIT 1", function(err, rows){
                     if (err){console.log(err);}
                     else{
                       io.sockets.in(rows[0].ch1_user).emit("S_gui_thongtin",{nd:nd,idc:idc,time:get_time(thoigian)});
                     }
                   });
                 }

               }
            });
          }


        }
    });
    socket.on('C_xoa_suco',(stt,list)=>{
      if(socket.user != null&&socket.type=='A'&&isArray(list)){
        if(stt=='A'){
          list.forEach((mail,key)=>{
            con.query("DELETE FROM `list_user` WHERE `user` LIKE '"+mail+"'", function(err2){
              if (err2)console.log(err2);
            });
            if(key===(list.length-1))socket.emit('S_del_suco_ok','A');
          });
        }
        else if(stt=='B'){
          list.forEach((mail,key)=>{
            con.query("DELETE FROM `list_err` WHERE `idc` LIKE '"+mail+"'", function(err2){
              if (err2)console.log(err2);
            });
            con.query("DELETE FROM `list_vitri` WHERE `idc` LIKE '"+mail+"'", function(err2){
              if (err2)console.log(err2);
            });
            if(key===(list.length-1))socket.emit('S_del_suco_ok','B');
          });
        }
        else {
          list.forEach((mail,key)=>{
            con.query("DELETE FROM `list_donvi` WHERE `id` = "+mail, function(err2){
              if (err2)console.log(err2);
            });

            if(key===(list.length-1))socket.emit('S_del_suco_ok','C');
          });
        }

      }
    });
    socket.on('C_pos_online_tdsc',  (info)=>{
      if (socket.user&&info.suco_id){
          io.sockets.in(info.suco_id).emit('S_pos_online_tdsc',{lat:info.lat, lon:info.lon, name:socket.hoten, number:socket.user, suco_id:info.suco_id});
      }
    });

  });
  }
});
