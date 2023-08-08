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
    pass: 'Vuyeungan1994'
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
  con.query(" DELETE FROM `active` WHERE `time` < "+date3, function(err){if(err)console.log('co loi HA HA HA:'+err);});
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
    socket.on('regis_1_windlaxy_A',(mail,code,id_phone)=>{
        if(mail&&code&&id_phone){
                con.query("SELECT * FROM `active` WHERE `phone_id` LIKE '"+ id_phone +"' LIMIT 1", function(err3, row1s){
                  if(err3)socket.emit('regis_1_thatbai_A','A');
                  else {

                    if(row1s.length>0 && row1s[0].dem>2)socket.emit('regis_1_thatbai_A','C');
                    else {
                      con.query("SELECT * FROM `account2` WHERE `number` LIKE '"+ mail +"' LIMIT 1", function(err, rows){
                              // nếu tài khoản đã có người đăng ký rồi thì:
                              if(err)socket.emit('regis_1_thatbai_A','A');
                              else {
                                if (rows.length >0 )	{socket.emit('regis_1_thatbai_A','D');}
                                else {
                                  var string = Math.floor(Math.random() * (899999)) + 100000;
                                  var string1 = passwordHash.generate(''+string);
                                  if(code=="B"){
                                    var mailOptions = {
                                      from: 'windlaxy@gmail.com',
                                      to: mail,
                                      subject: 'Caro OTP',
                                      text: 'Your Caro OTP:'+string
                                    };
                                    transporter.sendMail(mailOptions, function(error, info){
                                    if (error) socket.emit('regis_1_thatbai_A','B');
                                    else {
                                      var time = Math.floor(Date.now() / 1000);
                                      if(row1s.length==0){
                                        var sql = "INSERT INTO `active` (mail,chuoi,time,dem,phone_id ) VALUES ?";
                                        var values = [[mail, string1,time,1,id_phone]];
                                        con.query(sql, [values], function (err1, result) {
                                          if ( err1)socket.emit('regis_1_thatbai_A','A');
                                          else  socket.emit('regis_1_thanhcong_A');
                                        });
                                      }
                                      else {
                                        //nếu có rồi thì cập nhật và cộng số đếm lên 1
                                        let dem = row1s[0].dem+1;
                                        if(dem>2)time=time+300;
                                        con.query("UPDATE `active` SET `chuoi`='"+string1+"',`time`="+time+",`dem`="+dem+" WHERE `phone_id` LIKE '"+id_phone+"'",function(err1){
                                          if(err1)socket.emit('regis_1_thatbai_A','A');
                                          else socket.emit('regis_1_thanhcong_A');
                                        });

                                      }
                                    }
                                  });
                                  }
                                  else {
                                    cb.sendMessage({"to": mail, "text": 'Caro OTP:'+string}, (error, response) => {
                                        if(error)socket.emit('regis_1_thatbai_A','E');
                                        else {

                                          var time = Math.floor(Date.now() / 1000);
                                          if(row1s.length==0){
                                            var sql = "INSERT INTO `active` (mail,chuoi,time,dem,phone_id ) VALUES ?";
                                            var values = [[mail, string1,time,1,id_phone]];
                                            con.query(sql, [values], function (err1, result) {
                                              if ( err1)socket.emit('regis_1_thatbai_A','A');
                                              else  socket.emit('regis_1_thanhcong_A');
                                            });
                                          }
                                          else {
                                            //nếu có rồi thì cập nhật và cộng số đếm lên 1
                                            let dem = row1s[0].dem+1;
                                            if(dem>2)time=time+300;
                                            con.query("UPDATE `active` SET `chuoi`='"+string1+"',`time`="+time+",`dem`="+dem+" WHERE `phone_id` LIKE '"+id_phone+"'",function(err1){
                                              if(err1)socket.emit('regis_1_thatbai_A','A');
                                              else socket.emit('regis_1_thanhcong_A');
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
    socket.on('regis_2_windlaxy_A',(tin)=>{
      if(tin.mail &&tin.name&&tin.chuoi&&tin.pass){
                con.query("SELECT `chuoi` FROM `active` WHERE `mail` LIKE '"+tin.mail +"' LIMIT 1", function(err, rows){
                  if (err)socket.emit('regis2_thatbai_A','A');
                  else{
                    if(rows.length==0)socket.emit('regis2_thatbai_A','B');
                    else {
                      if(passwordHash.verify(tin.chuoi, rows[0].chuoi)){
                        con.query("CREATE TABLE IF NOT EXISTS  `"+tin.mail+"caro` (`id` BIGINT NOT NULL AUTO_INCREMENT, `mail` VARCHAR(45) NOT NULL,`name` VARCHAR(45)  ,`ta` INT(5) , `ban` INT(5) , `loai_ban` CHAR(3),`danhan` CHAR(3),`utien` CHAR(3), PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC))", function(){});
                        var sql = "INSERT INTO `account2` (number,user, pass) VALUES ?";
                          var matkhau = passwordHash.generate(''+tin.pass);
                          var values = [[tin.mail,tin.name, matkhau]];
                          con.query(sql, [values], function (err1, result) {
                            if (err1)socket.emit('regis2_thatbai_A','A');
                            else  {
                              con.query("DELETE FROM `active` WHERE `mail` LIKE '"+tin.mail+"'", function(err2){
                                if (err2)socket.emit('regis2_thanhcong_A');
                                else socket.emit('regis2_thanhcong_A');
                              });
                            }
                          });

                        }
                      else socket.emit('regis2_thatbai_A','B');
                      }
                    }
                });
              }
            });
    socket.on('forget_pass_1_windlaxy_A',(mail,code,phone_id)=>{
      if(mail&&code&&phone_id){
                con.query("SELECT * FROM `active` WHERE `phone_id` LIKE '"+ phone_id +"' LIMIT 1", function(err3, row1s){
                  if(err3){socket.emit('regis_1_thatbai_A','A');console.log(err3);}
                  else {
                    if(row1s.length>0 && row1s[0].dem>2)socket.emit('regis_1_thatbai_A','C');
                    else {
                      con.query("SELECT * FROM `account2` WHERE `number` LIKE '"+ mail +"' LIMIT 1", function(err, rows){
                              // nếu tài khoản đã có người đăng ký rồi thì:
                              if(err)socket.emit('regis_1_thatbai_A','A');
                              else {
                                if (rows.length ==0 )	{socket.emit('regis_1_thatbai_A','D');}
                                else {
                                  var string = Math.floor(Math.random() * (899999)) + 100000;
                                  var string1 = passwordHash.generate(''+string);
                                  if(code=="A"){
                                    cb.sendMessage({"to": mail, "text": 'Caro OTP:'+string}, (error, response) => {
                                        if(error)socket.emit('regis_1_thatbai_A','E');
                                        else {
                                          var time = Math.floor(Date.now() / 1000);
                                          if(row1s.length==0){
                                            var sql = "INSERT INTO `active` (mail,chuoi,time,dem,phone_id ) VALUES ?";
                                            var values = [[mail, string1,time,1,phone_id]];
                                            con.query(sql, [values], function (err1, result) {
                                              if ( err1)socket.emit('regis_1_thatbai_A','A');
                                              else  socket.emit('regis_1_thanhcong_A');
                                            });
                                          }
                                          else {
                                            //nếu có rồi thì cập nhật và cộng số đếm lên 1
                                            let dem = row1s[0].dem+1;
                                            if(dem>2)time=time+300;
                                            con.query("UPDATE `active` SET `chuoi`='"+string1+"',`time`="+time+",`dem`="+dem+" WHERE `phone_id` LIKE '"+phone_id+"'",function(err1){
                                              if(err1)socket.emit('regis_1_thatbai_A','A');
                                              else socket.emit('regis_1_thanhcong_A');
                                            });

                                          }
                                        }

                                      });
                                  }
                                  else {
                                    var mailOptions = {
                                    from: 'windlaxy@gmail.com',
                                    to: mail,
                                    subject: 'Caro OTP',
                                    text: 'Your Caro OTP:'+string
                                  };
                                  transporter.sendMail(mailOptions, function(error, info){
                                    if (error) {socket.emit('regis_1_thatbai_A','B');console.log(error);}
                                    else {
                                      var time = Math.floor(Date.now() / 1000);
                                      if(row1s.length==0){
                                        var sql = "INSERT INTO `active` (mail,chuoi,time,dem,phone_id ) VALUES ?";
                                        var values = [[mail, string1,time,1,phone_id]];
                                        con.query(sql, [values], function (err1, result) {
                                          if ( err1)socket.emit('regis_1_thatbai_A','A');
                                          else  socket.emit('regis_1_thanhcong_A');
                                        });
                                      }
                                      else {
                                        //nếu có rồi thì cập nhật và cộng số đếm lên 1
                                        let dem = row1s[0].dem+1;
                                        if(dem>2)time=time+300;
                                        con.query("UPDATE `active` SET `chuoi`='"+string1+"',`time`="+time+",`dem`="+dem+" WHERE `phone_id` LIKE '"+phone_id+"'",function(err1){
                                          if(err1)socket.emit('regis_1_thatbai_A','A');
                                          else socket.emit('regis_1_thanhcong_A');
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
    socket.on('forget_pass_2_windlaxy_A',(tin)=>{
              if(tin.mail&&tin.chuoi&&tin.pass){
                con.query("SELECT * FROM `active` WHERE `mail` LIKE '"+tin.mail+"' LIMIT 1", function(err, rows){
                  if (err)socket.emit('forget_pass_2_thatbai_A','A');
                  else{
                    if(rows.length==0)socket.emit('forget_pass_2_thatbai_A','A');
                    else {
                      if(passwordHash.verify(tin.chuoi, rows[0].chuoi)){
                        let pass1 = passwordHash.generate(''+tin.pass);
                        con.query("UPDATE `account2` SET `pass` = '"+pass1+"' WHERE `number` LIKE '"+tin.mail+"'", function(err2){
                           if (err2)socket.emit('forget_pass_2_thatbai_A','B');
                          else {
                            con.query("DELETE FROM `active` WHERE `mail` LIKE '"+tin.mail+"'", function(err2){
                               if (err2)socket.emit('forget_pass_2_ok_A');
                              });
                            socket.emit('forget_pass_2_ok_A');}
                        });
                      }
                        else socket.emit('forget_pass_2_thatbai_A','B');
                      }

                  }
                });
              }
            });
    socket.on('C_check_phonenumber_A',(phone,code,id_phone)=>{
              if(phone&&code&&id_phone){

                con.query("SELECT * FROM `active` WHERE `phone_id` LIKE '"+ id_phone +"' LIMIT 1", function(err3, row1s){
                  if(err3)socket.emit('regis_1_thatbai_A','A');
                  else {
                    if(row1s.length>0 && row1s[0].dem>2)socket.emit('regis_1_thatbai_A','C');
                    else {
                      con.query("SELECT * FROM `account2` WHERE `number` LIKE '"+ phone +"' LIMIT 1", function(err, rows){
                              // nếu tài khoản đã có người đăng ký rồi thì:
                              if(err)socket.emit('regis_1_thatbai_A','A');
                              else {
                                if (rows.length >0 )	{socket.emit('regis_1_thatbai_A','D');}
                                else {
                                  if(code=="A"){
                                    cb.phoneInformation(phone, (error, response) => {
                                      if(error)socket.emit('regis_1_thatbai_A','E');
                                      else {
                                        socket.emit('checkphone_ok_A');
                                      }
                                    });
                                  }
                                  else socket.emit('checkphone_ok_A');
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
        con.query("SELECT * FROM `account2` WHERE `number` LIKE '"+user1+"' LIMIT 1", function(err, rows){
    	     if (err || rows.length ==0){socket.emit('login1_khongtaikhoan');}
    			 else{
            if (passwordHash.verify(pass1, rows[0].pass)) socket.emit('login1_caro_dung', {name:rows[0].user});
            else  socket.emit('login1_carosai', {name:rows[0].user});
          }
        });
      }
    });
    socket.on('login2_caro',(data)=>{
      if(data.rightuser&&data.right_pass){
        con.query("SELECT * FROM `account2` WHERE `number` LIKE '"+data.rightuser+"' LIMIT 1", function(err, rows){
          if (err || rows.length ==0){socket.emit('login2_khongtaikhoan');}
          else{
            if (passwordHash.verify(data.right_pass, rows[0].pass)){
              socket.number = data.rightuser;
              socket.username = rows[0].user;
              socket.join(data.rightuser);
              // kiểm tra xem có tin nào mới chưa nhận được không.
              // tìm kiếm toàn bộ bản tin, xem cột danhan có cái nào bằng N không.
              // nếu có thì gửi về, khi nhận được rồi thì báo nhận.
    // `mail` VARCHAR(20) NOT NULL,`name` VARCHAR(20) NOT NULL,`ta` INT(5) NULL , `loai_ta` CHAR(3), `ban` INT(5) NULL , `loai_ban` CHAR(3),`danhan` CHAR(3)
              con.query("SELECT * FROM `"+socket.number+"caro` WHERE `danhan` LIKE 'N'", function(err2, a2s){
                if(err2){console.log(err2);}
                else {
                  if(a2s.length>0){
                    a2s.forEach((a2,key)=>{
                      socket.emit('S_send_diem',a2.mail,a2.ban,a2.loai_ban,a2.name,a2.utien);
                    });

                  }
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
    socket.on('C_caro_del_acc',(pass)=>{
      if(socket.number && pass){

        con.query("SELECT * FROM `account2` WHERE `number` LIKE '"+socket.number+"' LIMIT 1", function(err, rows){
          if (err)socket.emit('S_caro_del_acc_thatbai','A');
          else{
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
    socket.on('ketban_Caro',(mail,name)=>{
      if(socket.number&&mail&&name){
        con.query("SELECT * FROM `"+socket.number+"caro` WHERE `mail` LIKE '"+mail+"' LIMIT 1", function(err, as){
          if(err)console.log(err);
          else {
            if(as.length==0){
              con.query("SELECT * FROM `"+mail+"caro` WHERE `mail` LIKE '"+socket.number+"' LIMIT 1", function(err1, a1s){
                if(err1){console.log(err1);}
                else {
                  if(a1s.length>0){
                    if(a1s[0].utien=='A'){
                      var sql2 = "INSERT INTO `"+socket.number+"caro` (mail,name, utien ) VALUES ?";
                      var val2 = [[mail,name,'B']];
                      con.query(sql2, [val2], function (err2, result2) {
                        if ( err2)console.log(err2);
                        else {
                          socket.emit('ketban_ok',mail,name,'B');
                        }
                      });
                    }
                    else {
                      var sql2 = "INSERT INTO `"+socket.number+"caro` (mail,name, utien ) VALUES ?";
                      var val2 = [[mail,name,'A']];
                      con.query(sql2, [val2], function (err2, result2) {
                        if ( err2)console.log(err2);
                        else {
                          socket.emit('ketban_ok',mail,name,'A');
                        }
                      });
                    }
                  }
                  else {
                    if(socket.number > mail){
                      var sql2 = "INSERT INTO `"+socket.number+"caro` (mail,name, utien ) VALUES ?";
                      var val2 = [[mail,name,'A']];
                      con.query(sql2, [val2], function (err2, result2) {
                        if ( err2)console.log(err2);
                        else {
                          socket.emit('ketban_ok',mail,name,'A');
                        }
                      });
                    }
                    else {
                      var sql2 = "INSERT INTO `"+socket.number+"caro` (mail,name, utien ) VALUES ?";
                      var val2 = [[mail,name,'B']];
                      con.query(sql2, [val2], function (err2, result2) {
                        if ( err2)console.log(err2);
                        else {
                          socket.emit('ketban_ok',mail,name,'B');
                        }
                      });
                    }
                  }
                }
              });
            }
            else {
              if(as[0].utien=='A')socket.emit('ketban_ok',mail,name,'A');
              else socket.emit('ketban_ok',mail,name,name,'B');
            }
          }
        });
      }
    });
    socket.on('search_contact_caro', function (string){
      if (socket.number&&string!=null){
        con.query("SELECT `number`,`user`,  LOCATE('"+string+"',number) FROM `account2` WHERE LOCATE('"+string+"',number)>0 LIMIT 50", function(err, a1s){
        if ( err)console.log(err);
        else
        {
          if(a1s.length>0){
            let noidung=[];
            a1s.forEach(function(a1,key){
              noidung.push({user:a1.user, number: a1.number});
                if(key===(a1s.length-1))  {
                  socket.emit('S_send_search_caro',noidung);

                }

            });

          }
          else socket.emit('S_kq_check_caro_zero_2');
        }
      });
      }
    });
    socket.on('choi_lai',(mail,luot)=>{
      if(socket.number != null&&mail!=null&&luot!=null){
              con.query("UPDATE `"+socket.number+"caro` SET `danhan` = 'Y', `loai_ban` = 'B',`utien`='"+luot+"' WHERE `mail` LIKE '"+mail+"'", function(err2){
              if (err2)console.log(err2);
              else {
                socket.emit('choi_lai_ok',mail,luot);
                con.query("UPDATE `"+mail+"caro` SET `danhan` = 'N', `loai_ban` = 'B',`utien`='"+luot+"' WHERE `mail` LIKE '"+socket.number+"'",function(err5,res5){
                  if(err5)console.log(err5);
                  else  {io.sockets.in(mail).emit('C_muon_choi_lai',socket.number,socket.username,luot);}

                });

            }
        });
      }
    });
    socket.on('C_xoa_game',(nhom_mail)=>{
      if(socket.number != null&&isArray(nhom_mail)){
          nhom_mail.forEach((mail,key)=>{
            con.query("DELETE FROM `"+socket.number+"caro` WHERE `mail` LIKE '"+mail+"'", function(err2){
              if (err2)console.log(err2);
            });
            if(key===(nhom_mail.length-1))socket.emit('S_del_caro_ok');
          });
      }
    });
    socket.on('C_send_diem',(toado,mail,stt)=>{
      //B là C muốn chơi lại từ đầu
      if(socket.number != null){
        if(toado!=null && mail !=null&&stt!=null){
        // xem đã có cái row này hay chưa
        con.query("SELECT * FROM `"+socket.number+"caro` WHERE `mail` LIKE '"+mail+"' LIMIT 1", function(err1, a1s){
          if(err1){console.log(err1);}
          else {
            //nếu chưa có trong danh sách, tức mới
            if(a1s.length==0){
                var sql7 = "INSERT INTO `"+socket.number+"caro` (mail, ta,utien) VALUES ?";
                var val7 = [[mail,toado,'B']];
                con.query(sql7, [val7], function (err7, result) {
                  if ( err7){console.log('a5'+err7);}
                  else socket.emit('C_send_diem_ok',mail,toado,stt);
                });
                con.query("SELECT * FROM `"+mail+"caro` WHERE `mail` LIKE '"+socket.number+"'", function(err4, a4s){
                    if(err4)console.log('a6'+err4);
                    else {
                      if(a4s.length==0){
                      var sql6 = "INSERT INTO `"+mail+"caro` (mail,name, ban,loai_ban,danhan,utien ) VALUES ?";
                        var val6 = [[socket.number,socket.username,toado, stt, 'N','A']];
                        con.query(sql6, [val6], function (err6, result) {
                            if ( err6)console.log('a7'+err6);
                            else  io.sockets.in(mail).emit('S_send_diem',socket.number,toado,stt,socket.username);
                        });
                      }
                      else {
                        con.query("UPDATE `"+mail+"caro` SET `ban` = "+toado+",`loai_ban`='"+stt+"',`danhan`='N', `utien` = 'A' WHERE `mail` LIKE '"+socket.number+"'",function(err6,res6){
                          if(err6)console.log('a8'+err6);
                          else io.sockets.in(mail).emit('S_send_diem',socket.number,toado,stt,socket.username);
                        });
                      }
                    }
                  });
              }
            else {
              con.query("UPDATE `"+socket.number+"caro` SET `ta` = "+toado+",`utien`='B' WHERE `mail` LIKE '"+mail+"'",function(err5,res5){
                    if(err5){console.log('a13'+err5);}
                    else socket.emit('C_send_diem_ok',mail,toado,stt);
              });

              con.query("SELECT * FROM `"+mail+"caro` WHERE `mail` LIKE '"+socket.number+"'", function(err4, a4s){
                  if(err4)console.log('a6'+err4);
                  else {
                    if(a4s.length==0){
                    var sql6 = "INSERT INTO `"+mail+"caro` (mail,name, ban,loai_ban,danhan,utien ) VALUES ?";
                      var val6 = [[socket.number,socket.username,toado, stt, 'N','A']];
                      con.query(sql6, [val6], function (err6, result) {
                          if ( err6)console.log('a7'+err6);
                          else  io.sockets.in(mail).emit('S_send_diem',socket.number,toado,stt,socket.username);
                      });
                    }
                    else {
                      con.query("UPDATE `"+mail+"caro` SET `ban` = "+toado+",`loai_ban`='"+stt+"',`danhan`='N', `utien` = 'A' WHERE `mail` LIKE '"+socket.number+"'",function(err6,res6){
                        if(err6)console.log('a8'+err6);
                        else io.sockets.in(mail).emit('S_send_diem',socket.number,toado,stt,socket.username);
                      });
                    }
                  }
                });

              }

          }
        });
      }
    }

    });
    socket.on('C_nhan_toado',(mail)=>{

      if(socket.number != null && mail != null){
        con.query("UPDATE `"+socket.number+"caro` SET `danhan` = 'Y' WHERE `mail` LIKE '"+mail+"'",function(err5,res5){
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
                  con.query("CREATE TABLE IF NOT EXISTS `"+tin.mail+"diem` (`id` BIGINT NOT NULL AUTO_INCREMENT,`idc` CHAR(20),`name` VARCHAR(45),`lat` DOUBLE,`lon` DOUBLE,PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC))", function(){});
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
                            let local_id=row.idc;
                            con.query("SELECT * FROM `"+socket.number+"line_detail` WHERE `idc` LIKE '"+row1.idlo+"'", function(err2, row2s){
                              if (err2){socket.emit('login2_khongtaikhoan');}
                              else if(row2s.length>0){
                                list_line.push({name:row1.name,culy:row1.culy,up_id:idc,list_line1:row2s,local_id:row1.idlo});
                                if(i1===(row1s.length-1)){
                                  con.query("SELECT * FROM `"+socket.number+"diem` WHERE `idc` LIKE '"+idc+"'", function(err3, row3s){
                                    if(err3){socket.emit('login2_khongtaikhoan');}
                                    else {
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
                                var val3 = [[idc, row.name, row.lat, row.lon,row.id]];
                                con.query(sql3, [val3], function (err3, res3) {if ( err3){console.log(err3);}});

                          });
                        }
                        if(mess.line!=null &&mess.line.length>0){
                          var sql4 = "INSERT INTO `"+nguoi.number+"line_main` (idc, name, culy,idlo) VALUES ?";
                          mess.line.forEach((row6,key6)=>{
                            var val4 = [[idc, row6.name, row6.culy,row6.id]];
                            con.query(sql4, [val4], function (err4, res4) {
                            if ( err4)console.log(err4);
                            else {
                                var sql5 = "INSERT INTO `"+nguoi.number+"line_detail` (idc, lat, lon,name,color,rieng1_id,stt_rieng1,rieng2_id,stt_rieng2) VALUES ?";
                                row6.tuyen.forEach((row7,key7)=>{
                                    var val5 = [[row6.id,row7.lat, row7.lon,row7.name,row7.color, row7.rieng1_id,row7.stt_rieng1,row7.rieng2_id,row7.stt_rieng2]];
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
    socket.on('search_contact',  (string)=>{
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
    socket.on('C_join_room',  (room)=>{
      if (socket.number&&room){
        con.query("SELECT * FROM `list_member_w` WHERE `idc` LIKE '"+room+"' AND `number` LIKE '"+socket.number+"' LIMIT 1", function(err1, rows){
          if ( err1){console.log('co loi 2 '+err1);}
          else if(rows.length >0){
            socket.emit('S_get_join');
            if(socket.roomabc&&socket.roomabc!=room){
                socket.leave(socket.roomabc);
                socket.join(room);
                socket.roomabc = room;
            }
            else {
              socket.join(room);
              socket.roomabc = room;
            }
          }
        });
      }
    });
    socket.on('C_leave_room',  (room)=> {
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
    socket.on('C_pos_online',  (info)=>{
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
    socket.on('C_make_room',  (info)=>{
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
    socket.on('login2_suco',(tin)=>{
      if(tin.user&&tin.pass){
              con.query("SELECT * FROM `list_user` WHERE `user` LIKE '"+tin.user+"' LIMIT 1", function(err, rows){
                if (err){socket.emit('login2_suco_thatbai');console.log('11111'+err);}
                else if(rows.length>0){
                  if (rows[0].pass==tin.pass){
                    socket.emit("login2_suco_ok");
                    socket.user = tin.user;
                    socket.type = rows[0].type;
                    if(rows[0].type=="A"||rows[0].type=="B"||rows[0].type=="C"||rows[0].type=="D") {

                      socket.join("chung");
                      //kiểm tra xem có bản tin nào chưa gửi về không thì gửi về cho nó
                      con.query("SELECT * FROM `list_err` WHERE id > "+tin.tt+" ORDER BY id ASC", function(err1, row1s){
                        if (err1){console.log(err1);}
                        else if(row1s.length>0){
                          row1s.forEach((row1, i) => {
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
                            socket.emit("S_send_nhiemvu",{tt:row1.id,idc:row1.idc,ten:row1.ten,mota:row1.mota,giaonv1:get_time(row1.giaonv1),tb_hoten:row1.tb_hoten,tb_chucvu:row1.tb_chucvu,tb_donvi:row1.tb_donvi,
                              ch1_hoten:row1.ch1_hoten,ch1_chucvu:row1.ch1_chucvu,ch1_donvi:row1.ch1_donvi,nguyennhan:nguyennhan,tieuhao:tieuhao,
                              giaonv2:giaonv2, ch2_hoten:row1.ch2_hoten,ch2_chucvu:row1.ch2_chucvu,ch2_donvi:row1.ch2_donvi,batdau:batdau,dennoi:dennoi,xong:xong,vedonvi:vedonvi,a0:a0,a1:a1,a2:a2,a3:a3,a4:a4});

                            con.query("SELECT * FROM `list_vitri` WHERE idc LIKE '"+row1.idc+"'", function(err2, row2s){
                              if (err2){console.log(err2);}
                              else {
                                if(row2s.length>0){
                                  row2s.forEach((item, i) => {
                                      if(item.hinhanh!=null){
                                        fs.readFile(item.hinhanh, (err, data2) => {
                                          if (err) { console.log('Có lỗi xảy ra khi đọc file:');}
                                          else {
                                            let base64Data = data2.toString('base64');
                                            socket.emit("S_capnhat_vitri",{lat:item.lat,lon:item.lon,name:item.name,diadanh:item.diadanh,idc:item.idc,tt:item.tt,hinhanh: base64Data,hinhanh_tt: item.hinhanh_tt});
                                          }
                                        });
                                      }
                                    });
                                }

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
                              con.query("SELECT * FROM `list_vitri` WHERE idc LIKE '"+item.idc+"' AND tt >"+item.a25, function(err3, row3s){
                                if (err3){console.log(err3);}
                                else {
                                  if(row3s.length>0){
                                    row3s.forEach((item, i) => {
                                      if(item.hinhanh!=null){
                                        fs.readFile(item.hinhanh, (err, data2) => {
                                          if (err) {console.log('Có lỗi xảy ra khi đọc file:');}
                                          else {
                                            let base64Data = data2.toString('base64');
                                            socket.emit("S_capnhat_vitri",{lat:item.lat,lon:item.lon,name:item.name,diadanh:item.diadanh,idc:item.idc,tt:item.tt,hinhanh: base64Data,hinhanh_tt: item.hinhanh_tt});
                                          }
                                        });
                                      }
                                    });
                                  }

                                }
                              });
                            }
                          });
                        });
                      }
                      if(tin.list_del.length>0){
                        tin.list_del.forEach((item, i) => {
                          con.query("SELECT * FROM `list_del` WHERE `idc` LIKE '"+item.idc+"' AND id >"+item.tt, function(err4, row4s){
                              if (err4){console.log(err4);}
                              else if(row4s.length>0){
                                let list_del=[];
                                row4s.forEach((item4, i4) => {
                                  list_del.push[{idc:item4.idc, tt:item4.ids, tt_del:item4.id}];
                                    if(i4===(row4s.length-1)) socket.emit("S_capnhat",{idc:item.idc,a0:'B',a1:'B',a2:'B',a3:'B',a4:'B',a20:'B',a21:'B',a6:'B',a7:'A', list_del:list_del});
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
                      if(rows[0].type=="E")lenh="SELECT * FROM `list_err` WHERE `ch1_user` LIKE '"+tin.user+"' AND id > "+tin.tt+" ORDER BY id ASC";
                      else lenh="SELECT * FROM `list_err` WHERE `ch2_user` LIKE '"+tin.user+"' AND id >"+tin.tt+"  ORDER BY id ASC";
                      con.query(lenh, function(err1, row1s){
                        if (err1){console.log('33333'+err1);}
                        else if(row1s.length>0){
                          row1s.forEach((row1, i) => {
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
                            socket.emit("S_send_nhiemvu",{tt:row1.id,idc:row1.idc,ten:row1.ten,mota:row1.mota,giaonv1:get_time(row1.giaonv1),tb_hoten:row1.tb_hoten,tb_chucvu:row1.tb_chucvu,tb_donvi:row1.tb_donvi,
                              ch1_hoten:row1.ch1_hoten,ch1_chucvu:row1.ch1_chucvu,ch1_donvi:row1.ch1_donvi,nguyennhan:nguyennhan,tieuhao:tieuhao,
                              giaonv2:giaonv2, ch2_hoten:row1.ch2_hoten,ch2_chucvu:row1.ch2_chucvu,ch2_donvi:row1.ch2_donvi,batdau:batdau,dennoi:dennoi,xong:xong,vedonvi:vedonvi,a0:a0,a1:a1,a2:a2,a3:a3,a4:a4});
                            con.query("SELECT * FROM `list_vitri` WHERE idc LIKE '"+row1.idc+"'", function(err2, row2s){
                              if (err2){console.log(err2);}
                              else {
                                if(row2s.length>0){
                                  row2s.forEach((item, i) => {
                                      if(item.hinhanh!=null){
                                        fs.readFile(item.hinhanh, (err, data2) => {
                                          if (err) {console.log('Có lỗi xảy ra khi đọc file:');}
                                          else {
                                            let base64Data = data2.toString('base64');
                                            socket.emit("S_capnhat_vitri",{lat:item.lat,lon:item.lon,name:item.name,diadanh:item.diadanh,idc:item.idc,tt:item.tt,hinhanh: base64Data,hinhanh_tt: item.hinhanh_tt});

                                          }
                                        });
                                      }
                                    });
                                }
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
                              con.query("SELECT * FROM `list_vitri` WHERE idc LIKE '"+item.idc+"' AND tt >"+item.a25, function(err3, row3s){
                                if (err3){console.log(err3);}
                                else {
                                  if(row3s.length>0){
                                    row3s.forEach((item, i) => {
                                      if(item.hinhanh!=null){
                                        fs.readFile(item.hinhanh, (err, data2) => {
                                          if (err) {console.log('Có lỗi xảy ra khi đọc file:');}
                                          else {
                                            let base64Data = data2.toString('base64');
                                            socket.emit("S_capnhat_vitri",{lat:item.lat,lon:item.lon,name:item.name,diadanh:item.diadanh,idc:item.idc,tt:item.tt,hinhanh: base64Data,hinhanh_tt: item.hinhanh_tt});

                                          }
                                        });
                                      }
                                    });





                                  }


                                }
                              });

                            }
                          });
                        });
                      }
                      if(tin.list_del.length>0){
                        tin.list_del.forEach((item, i) => {
                          con.query("SELECT * FROM `list_del` WHERE `idc` LIKE '"+item.idc+"' AND id >"+item.tt, function(err4, row4s){
                              if (err4){console.log(err4);}
                              else if(row4s.length>0){
                                let list_del=[];
                                row4s.forEach((item4, i4) => {
                                  list_del.push[{idc:item4.idc, tt:item4.ids, tt_del:item4.id}];
                                    if(i4===(row4s.length-1)) socket.emit("S_capnhat",{idc:item.idc,a0:'B',a1:'B',a2:'B',a3:'B',a4:'B',a20:'B',a21:'B',a6:'B',a7:'A', list_del:list_del});
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
    socket.on('C_tdsc_first_login',(number,pass,stt_err,stt_vitri)=>{
      if(number&&pass){
        con.query("SELECT * FROM `list_user` WHERE `user` LIKE '"+number+"' LIMIT 1", function(err, rows){
              if (err){socket.emit('login2_suco_thatbai');console.log('11111'+err);}
              else if(rows.length>0){
                if (rows[0].pass==pass){
                  socket.user = number;
                  socket.type=rows[0].type;
                  if(rows[0].type=="A"||rows[0].type=="B"||rows[0].type=="C"||rows[0].type=="D") {
                    socket.join("chung");
                    con.query("SELECT `id` FROM `list_err` WHERE `id` > "+stt_err+" ORDER BY id ASC", (err1, row1s)=>{
                      if (err1){console.log(err1);}
                      else if(row1s.length>0){
                        socket.emit('S_send_sum_err',row1s.length);

                      }
                    });
                  }
                  else {
                        socket.join(number);
                        let lenh;
                        if(rows[0].type=="E")lenh="SELECT * FROM `list_err` WHERE `ch1_donvi` LIKE '"+rows[0].donvi+"' AND id > "+stt_err+" ORDER BY id ASC";
                        else lenh="SELECT * FROM `list_err` WHERE `ch2_user` LIKE '"+number+"' AND id >"+stt_err+"  ORDER BY id ASC";
                        con.query(lenh, function(err1, row1s){
                          if (err1){console.log('33333'+err1);}
                          else if(row1s.length>0){ socket.emit('S_send_sum_err',row1s.length); }
                        });
                      }
                  }
                    else  socket.emit('login2_suco_thatbai');
                  }
              });
            }
        });
    socket.on('C_get_sum_err',()=>{
      if(socket.user!=null){
        if(socket.type=="E"||socket.type=="F"){
          if(rows[0].type=="E")lenh="SELECT * FROM `list_err` WHERE `ch1_donvi` LIKE '"+rows[0].donvi+"' AND id > "+stt_err+" ORDER BY id ASC";
          else lenh="SELECT * FROM `list_err` WHERE `ch2_user` LIKE '"+number+"' AND id >"+stt_err+"  ORDER BY id ASC";
          con.query(lenh, function(err1, row1s){
            if (err1){console.log('33333'+err1);}
            else if(row1s.length>0){
              row1s.forEach((row1, i) => {
                mang_vitri.push(row1.idc);
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
                socket.emit("S_send_nhiemvu",{tt:row1.id,idc:row1.idc,ten:row1.ten,mota:row1.mota,giaonv1:get_time(row1.giaonv1),tb_hoten:row1.tb_hoten,tb_chucvu:row1.tb_chucvu,tb_donvi:row1.tb_donvi,
                  ch1_hoten:row1.ch1_hoten,ch1_chucvu:row1.ch1_chucvu,ch1_donvi:row1.ch1_donvi,nguyennhan:nguyennhan,tieuhao:tieuhao,
                  giaonv2:giaonv2, ch2_hoten:row1.ch2_hoten,ch2_chucvu:row1.ch2_chucvu,ch2_donvi:row1.ch2_donvi,batdau:batdau,dennoi:dennoi,xong:xong,vedonvi:vedonvi,a0:a0,a1:a1,a2:a2,a3:a3,a4:a4});
              });
            }
          });
        }
        else {
          con.query("SELECT * FROM `list_err` WHERE `id` > "+stt_err+" ORDER BY id ASC", (err1, row1s)=>{
            if (err1){console.log(err1);}
            else if(row1s.length>0){
              row1s.forEach((item, i) => {
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
                socket.emit("S_send_nhiemvu",{tt:row1.id,idc:row1.idc,ten:row1.ten,mota:row1.mota,giaonv1:get_time(row1.giaonv1),tb_hoten:row1.tb_hoten,tb_chucvu:row1.tb_chucvu,tb_donvi:row1.tb_donvi,
                  ch1_hoten:row1.ch1_hoten,ch1_chucvu:row1.ch1_chucvu,ch1_donvi:row1.ch1_donvi,nguyennhan:nguyennhan,tieuhao:tieuhao,
                  giaonv2:giaonv2, ch2_hoten:row1.ch2_hoten,ch2_chucvu:row1.ch2_chucvu,ch2_donvi:row1.ch2_donvi,batdau:batdau,dennoi:dennoi,xong:xong,vedonvi:vedonvi,a0:a0,a1:a1,a2:a2,a3:a3,a4:a4});

              });
            }
          });
        }
      }


    });
    socket.on('C_get_err_ok',()=>{
        if(socket.user!=null){
          if(socket.type=="E"||socket.type=="F"){
            let lenh1;
            if(rows[0].type=="E")lenh1="SELECT * FROM `list_vitri` WHERE donvi LIKE '"+rows[0].ch1_donvi+"' AND tt>"+stt_vitri+" ORDER BY tt ASC";
            else lenh1="SELECT * FROM `list_vitri` WHERE user LIKE '"+number+"' AND tt>"+stt_vitri+" ORDER BY tt ASC";
            con.query(lenh1, (err2, row2s)=>{
                if (err2){console.log(err2);}
                else if(row2s.length>0){
                    socket.emit("S_send_sum_vitri",row2s.length);
                }
              });
          }
          else {
            con.query("SELECT * FROM `list_vitri` WHERE `tt`>"+stt_vitri+" ORDER BY id ASC", (err2, row2s)=>{
                if (err2){console.log(err2);}
                else if(row2s.length>0){
                  socket.emit("S_send_sum_vitri",row2s.length);
                }
            });
          }
        }

    });
    socket.on('C_get_sum_vitri',()=>{
      if(socket.user!=null){
        if(socket.type=="E"||socket.type=="F"){
          let lenh1;
          if(rows[0].type=="E")lenh1="SELECT * FROM `list_vitri` WHERE donvi LIKE '"+rows[0].ch1_donvi+"' AND tt>"+stt_vitri+" ORDER BY tt ASC";
          else lenh1="SELECT * FROM `list_vitri` WHERE user LIKE '"+number+"' AND tt>"+stt_vitri+" ORDER BY tt ASC";
          con.query(lenh1, (err2, row2s)=>{
              if (err2){console.log(err2);}
              else if(row2s.length>0){
                  row2s.forEach((item, i) => {
                      if(item.hinhanh!=null){
                          fs.readFile(item.hinhanh, (err, data2) => {
                              if (err) { console.log('Có lỗi xảy ra khi đọc file:');}
                              else {
                                let base64Data = data2.toString('base64');
                                socket.emit("S_send_vitri_full",{lat:item.lat,lon:item.lon,name:item.name,diadanh:item.diadanh,idc:item.idc,tt:item.tt,hinhanh: base64Data,hinhanh_tt: item.hinhanh_tt});
                              }
                            });
                          }
                          else socket.emit("S_send_vitri_full",{lat:item.lat,lon:item.lon,name:item.name,diadanh:item.diadanh,idc:item.idc,tt:item.tt,hinhanh: null,hinhanh_tt: 0});
                    });


              }
          });
        }
        else {

          con.query("SELECT * FROM `list_vitri` WHERE `tt` > "+stt_vitri+" ORDER BY tt ASC", (err2, row2s)=>{
              if (err2){console.log(err2);}
              else if(row2s.length>0){
                  row2s.forEach((item, i) => {
                      if(item.hinhanh!=null){
                          fs.readFile(item.hinhanh, (err, data2) => {
                              if (err) { console.log('Có lỗi xảy ra khi đọc file:');}
                              else {
                                let base64Data = data2.toString('base64');
                                socket.emit("S_send_vitri_full",{lat:item.lat,lon:item.lon,name:item.name,diadanh:item.diadanh,idc:item.idc,tt:item.tt,hinhanh: base64Data,hinhanh_tt: item.hinhanh_tt});
                              }
                            });
                          }
                          else socket.emit("S_send_vitri_full",{lat:item.lat,lon:item.lon,name:item.name,diadanh:item.diadanh,idc:item.idc,tt:item.tt,hinhanh: null,hinhanh_tt: 0});
                    });


              }
          });
        }
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
                     io.sockets.in("chung").emit("S_send_nhiemvu",{tt:result.insertId,idc:idc,ten:tin.ten,mota:tin.mota,tb_hoten:tin.tb_hoten,tb_chucvu:tin.tb_chucvu,tb_donvi:tin.tb_donvi,giaonv1:get_time(thoigian),
                     ch1_hoten:tin.hoten,ch1_chucvu:tin.chucvu,ch1_donvi:tin.donvi,a0:'B',a1:'B',a2:'B',a3:'B',a4:'B',nguyennhan:'',tieuhao:''});
                     io.sockets.in(tin.user).emit("S_send_nhiemvu",{tt:result.insertId,idc:idc,ten:tin.ten,mota:tin.mota,tb_hoten:tin.tb_hoten,tb_chucvu:tin.tb_chucvu,tb_donvi:tin.tb_donvi,giaonv1:get_time(thoigian),
                     ch1_hoten:tin.hoten,ch1_chucvu:tin.chucvu,ch1_donvi:tin.donvi,a0:'B',a1:'B',a2:'B',a3:'B',a4:'B',nguyennhan:'',tieuhao:''});
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
                      giaonv2:get_time(thoigian),a1:'B',a2:'B',a3:'B',a4:'B',nguyennhan:'',tieuhao:''});

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
                  var sql = "INSERT INTO `list_vitri` (idc,lat, lon,name,hinhanh,hinhanh_tt,diadanh) VALUES ?";
                  var values = [[idc,nd2.lat,nd2.lon,nd2.name,filePath,0,nd2.diadanh]];
                  con.query(sql, [values], function (err1, result) {
                  if (err1)socket.emit("giao_nhiemvu_thatbai","L");
                  else {
                      socket.emit('gui_thongtin_ok',{nd:'L',idc:idc,tt:result.insertId});
                      console.log('Đã gửi đi');
                      io.sockets.in("chung").emit("S_capnhat_vitri",{lat:nd2.lat,lon:nd2.lon,name:nd2.name,diadanh:nd2.diadanh,idc:idc,tt:result.insertId,hinhanh: nd2.hinhanh,hinhanh_tt:0});
                      if(socket.type=="F"){
                          con.query("SELECT `ch1_user` FROM `list_err` WHERE `idc` LIKE '"+idc+"' LIMIT 1", function(err, rows){
                              if (err){console.log(err);}
                              else io.sockets.in(rows[0].ch1_user).emit("S_capnhat_vitri",{lat:nd2.lat,lon:nd2.lon,name:nd2.name,diadanh:nd2.diadanh,idc:idc,tt:result.insertId,hinhanh: nd2.hinhanh,hinhanh_tt:0});
                          });
                      }
                    }
                  });
                }
              });
          }
          else if(nd=="M"){

            let sql1 = "INSERT INTO `list_del` (idc,ids) VALUES ?";
            let val1 = [[idc,nd2]];
            con.query(sql1,[val1],function(err2,result){
              if(err2){socket.emit('gui_thongtin_thatbai',nd);console.log(err2);}
               else {
                 con.query("DELETE FROM `list_vitri` WHERE `tt` ="+nd2, function(err3){
                   if (err3)console.log(err3);
                 });
                  socket.emit('gui_thongtin_ok',{nd:nd,idc:idc,tt:nd2,tt_del:result.insertId});
                  io.sockets.in("chung").emit("S_gui_thongtin",{nd:nd,idc:idc,tt:nd2,tt_del:result.insertId});
                  //gui cho chi huy 1 neu co
                  if(socket.type=="F"){
                    con.query("SELECT * FROM `list_err` WHERE `idc` LIKE '"+idc+"' LIMIT 1", function(err, rows){
                      if (err){console.log(err);}
                      else{
                        io.sockets.in(rows[0].ch1_user).emit("S_gui_thongtin",{nd:nd,idc:idc,tt:nd2,tt_del:result.insertId});
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


  });
  }
});
