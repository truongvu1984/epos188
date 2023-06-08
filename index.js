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
      let time=new Date();
      var sql = "INSERT INTO `test`(abc) VALUES ?";
        var values = [[time]];
        con.query(sql, [values], function (err1, result) {
          if(err1)console.log(err1);
        });

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
          if (passwordHash.verify(pass1, rows[0].pass)){
                  socket.emit('login1_caro_dung', {name:rows[0].user});
          }
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
                else  io.sockets.in(mail).emit('C_muon_choi_lai',socket.number,socket.username,luot);


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
                con.query("CREATE TABLE IF NOT EXISTS `"+tin.mail+"member` (`id` INT NOT NULL AUTO_INCREMENT,`idc`CHAR(20), `number` VARCHAR(45) NOT NULL,`name` VARCHAR(45),PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC))", function(){});
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
                              let list_line1=[];
                              row2s.forEach((row2, i2) => {
                                list_line1.push({up_id:row1.idc,lat:row2.lat,lon:row2.lon,name:row2.name,color:row2.color,rieng1_id:row2.rieng1_id,stt_rieng1:row2.stt_rieng1,rieng2_id:row2.rieng2_id,stt_rieng2:row2.stt_rieng2});
                                if(i2===(row2s.length-1)){
                                  list_line.push({name:row1.name,culy:row1.culy,up_id:idc,list_line1:list_line1,local_id:row1.idlo});
                                  if(i1===(row1s.length-1)){

                                    con.query("SELECT * FROM `"+socket.number+"diem` WHERE `idc` LIKE '"+idc+"'", function(err3, row3s){
                                      if(err3){socket.emit('login2_khongtaikhoan');}
                                      else if(row3s.length>0){
                                        row3s.forEach((row3, i3) => {
                                          list_diem.push({idc:idc,name:row3.name,lat:row3.lat,lon:row3.lon,id:row3.id});
                                          if(i3===(row3s.length-1)){
                                            socket.emit('S_send_tinnhan',{name_nguoigui:row.name,number_nguoigui:row.number,
                                                                      subject: row.subject, idc:row.idc, time:get_time(row.time),list_line:list_line,list_diem:list_diem});
                                          }
                                        });
                                      }
                                      else {
                                        socket.emit('S_send_tinnhan',{name_nguoigui:row.name,number_nguoigui:row.number,
                                                                  subject: row.subject, idc:row.idc, time:get_time(row.time),list_line:list_line,list_diem:list_diem});
                                      }
                                    });

                                  }
                                }
                              });
                            }
                          });
                        });
                      }
                      else {
                        con.query("SELECT * FROM `"+socket.number+"diem` WHERE `idc` LIKE '"+idc+"'", function(err3, row3s){
                          if(err3){socket.emit('login2_khongtaikhoan');}
                          else if(row3s.length>0){
                            row3s.forEach((row3, i3) => {
                              list_diem.push({idc:idc,name:row3.name,lat:row3.lat,lon:row3.lon,id:row3.id});
                              if(i3===(row3s.length-1)){
                                socket.emit('S_send_tinnhan',{name_nguoigui:row.name,number_nguoigui:row.number,
                                                          subject: row.subject, idc:row.idc, time:get_time(row.time),list_line:list_line,list_diem:list_diem});
                              }
                            });
                          }
                          else {
                            socket.emit('S_send_tinnhan',{name_nguoigui:row.name,number_nguoigui:row.number,
                                                      subject: row.subject, idc:row.idc, time:get_time(row.time),list_line:list_line,list_diem:list_diem});
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
                  con.query("SELECT * FROM `"+socket.number+"member` WHERE `idc` LIKE '"+row.idc+"'", function(err2, rows2){
                    if(err2)console.log(err2);
                    else if(rows2.length>0){
                      let member=[];
                      rows2.forEach((row2, i2) => {
                          member.push({number:row2.number,name:row2.name});
                          if(i2===(rows2.length-1)){
                            socket.emit('S_send_room',{room_name:row.subject, room_id_server:row.idc, admin_name:row.name, admin_number:row.number,member:member, time:get_time(row.time)});
                          }
                      });


                    }
                  });
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
  socket.on('C_gui_tinnhan', function(mess){
    if (socket.number&&mess.nguoinhan&&mess.subject&&mess.vitri&&mess.line){
      let thoigian = new Date();
      let idc=''+Date.now();
      socket.emit('S_get_tinnhan',idc);
        let nguoinhans = [];
        if(isArray(mess.nguoinhan)){
          mess.nguoinhan.forEach((nguoi, key7)=>{
            if(nguoi.number){
              nguoinhans.push({number:nguoi.number, name:nguoi.name, stt:'N'});
              if(key7===(mess.nguoinhan.length-1)){
                mess.nguoinhan.forEach(function(row5,key5){
                  con.query("SELECT * FROM `account` WHERE `number` LIKE '"+ row5.number +"' LIMIT 1", function(err4, res4){
                    if ( err4 ){console.log(err4);}
                    else if ( res4.length >0){
                      // lưu vào bảng chính của người nhận
                        var sql5= "INSERT INTO `"+row5.number+"main` (idc,subject, number,name, stt, time ) VALUES ?";
                        var val5 = [[idc, mess.subject,socket.number,socket.username,'N',thoigian]];
                        con.query(sql5, [val5], function (err5, res5){
                              if ( err5){console.log(err5);}
                              else{

                                  //lưu vào bảng người gửi của người nhận

                                  let list_line=[];
                                  let list_diem=[];
                                  if(mess.vitri!=null &&mess.vitri.length>0){
                                        var sql3 = "INSERT INTO `"+row5.number+"diem` (idc, name, lat, lon,idlo) VALUES ?";
                                        mess.vitri.forEach((row,key)=>{
                                          list_diem.push({idc:idc,name:row.name,lat:row.lat,lon:row.lon,id:row.id});
                                          var val3 = [[idc, row.name, row.lat, row.lon,row.id]];
                                          con.query(sql3, [val3], function (err3, res3) {if ( err3){console.log(err3);}});
                                          if(key===(mess.vitri.length-1)){
                                            if(mess.line!=null &&mess.line.length>0){
                                                        var sql4 = "INSERT INTO `"+row5.number+"line_main` (idc, name, culy,idlo) VALUES ?";
                                                        mess.line.forEach((row6,key6)=>{
                                                          var val4 = [[idc, row6.name, row6.culy,row6.id]];
                                                          con.query(sql4, [val4], function (err4, res4) {
                                                            if ( err4)console.log(err4);
                                                            else {
                                                                var sql5 = "INSERT INTO `"+row5.number+"line_detail` (idc, lat, lon,name,color,rieng1_id,stt_rieng1,rieng2_id,stt_rieng2) VALUES ?";
                                                                let list_line1=[];
                                                                row6.tuyen.forEach((row7,key7)=>{
                                                                  list_line1.push({up_id:row6.id,lat:row7.lat,lon:row7.lon,name:row7.name,color:row7.color,rieng1_id: row7.rieng1_id,stt_rieng1:row7.stt_rieng1,rieng2_id:row7.rieng2_id,stt_rieng2:row7.stt_rieng2});
                                                                    var val5 = [[row6.id,row7.lat, row7.lon,row7.name,row7.color, row7.rieng1_id,row7.stt_rieng1,row7.rieng2_id,row7.stt_rieng2]];
                                                                    con.query(sql5, [val5], function (err5, res5) {if ( err5)console.log(err5);});
                                                                    if(key7===(row6.tuyen.length-1)){
                                                                      list_line.push({name:row6.name,culy:row6.culy,up_id:idc,list_line1: list_line1,local_id:row6.id});
                                                                      io.sockets.in(row5.number).emit('S_send_tinnhan',{name_nguoigui:socket.username,number_nguoigui:socket.number,
                                                                                                subject: mess.subject, idc:idc, time:get_time(thoigian),list_line:list_line,list_diem:list_diem});

                                                                    }
                                                                });
                                                            }
                                                      });
                                                  });
                                              }
                                          }
                                      });
                                  }
                                  else if(mess.line!=null &&mess.line.length>0){
                                              var sql4 = "INSERT INTO `"+row5.number+"line_main` (idc, name, culy,idlo) VALUES ?";
                                              mess.line.forEach((row,key)=>{
                                                var val4 = [[idc, row.name, row.culy,row.id]];
                                                con.query(sql4, [val4], function (err4, res4) {
                                                  if ( err4)console.log(err4);
                                                  else {
                                                      var sql5 = "INSERT INTO `"+row5.number+"line_detail` (idc, lat, lon,name,color,rieng1_id,stt_rieng1,rieng2_id,stt_rieng2) VALUES ?";
                                                      let list_line1=[];
                                                      row.tuyen.forEach((row1,key1)=>{
                                                        list_line1.push({up_id:row.id,lat:row1.lat,lon:row1.lon,name:row1.name,color:row1.color,rieng1_id: row1.rieng1_id,stt_rieng1:row1.stt_rieng1,rieng2_id:row1.rieng2_id,stt_rieng2:row1.stt_rieng2});
                                                          var val5 = [[row.id,row1.lat, row1.lon,row1.name,row1.color, row1.rieng1_id,row1.stt_rieng1,row1.rieng2_id,row1.stt_rieng2]];
                                                          con.query(sql5, [val5], function (err5, res5) {if ( err5)console.log(err5);});
                                                          if(key1===(row.tuyen.length-1)){
                                                            list_line.push({name:row.name,culy:row.culy,up_id:idc,list_line1: list_line1,local_id:row.id});
                                                            if(mess.vitri!=null &&mess.vitri.length>0){
                                                                  var sql3 = "INSERT INTO `"+row5.number+"diem` (idc, name, lat, lon,idlo) VALUES ?";
                                                                  mess.vitri.forEach((row8,key8)=>{
                                                                    list_diem.push({idc:idc,name:row8.name,lat:row8.lat,lon:row8.lon,id:row8.id});
                                                                    var val3 = [[idc, row8.name, row8.lat, row8.lon,row8.id]];
                                                                    con.query(sql3, [val3], function (err3, res3) {if ( err3){console.log(err3);}});
                                                                    if(key===(mess.vitri.length-1)){
                                                                      io.sockets.in(row5.number).emit('S_send_tinnhan',{name_nguoigui:socket.username,number_nguoigui:socket.number,
                                                                                                subject: mess.subject, idc:idc, time:get_time(thoigian),list_line:list_line,list_diem:list_diem});

                                                                    }
                                                                });
                                                            }

                                                          }
                                                      });
                                                  }
                                                });
                                                  });
                                                }

                              }
                        });

                    }
                      // nếu tìm trong bảng acccount mà không có tên người nhận thì báo lại là không có ai nhận
                    else socket.emit('S_send_mess_no_contact',row5.number);
                  });
                });

          }
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
              con.query("DROP TABLE IF EXISTS `"+abc+"member`", function(err4){ if (err4)console.log(err4);});
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
  socket.on('danhantinnhan', function (nguoigui, ten_nguoi_nhan,idc,subject){
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
  socket.on('C_nhan_send', function (idc){
    if(socket.number && idc){

    con.query("DELETE FROM `"+socket.number+"main` WHERE `stt` LIKE 'K' AND `idc` LIKE '"+idc+"'", function(err){
        if(err)console.log(err);
    });
    }
  });
  socket.on('search_contact', function (string){
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
  socket.on('C_join_room', function (room){
    if (socket.number&&room){
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
  socket.on('C_leave_off', function () {
      if (socket.number){
      socket.leave(socket.number);
      socket.number = undefined;
      }
      if(socket.roomabc){
        socket.leave(socket.roomabc);
        socket.roomabc = undefined;
      }

  });
  socket.on('C_leave_room', function (room) {
      if (socket.number&&room){
      socket.leave(room);
      socket.roomabc = undefined;
    }
  });
  socket.on('C_pos_online', function (info){
    if (socket.number&&info.room){
      if (isArray(info.room)){
        info.room.forEach(function(room){
          if(room.room_fullname){
            io.sockets.in(room.room_fullname).emit('S_pos_online',{lat:info.lat, lon:info.lon, name:socket.username, number:socket.number, room:room.room_fullname});
          }
        });
      }
    }
  });
  socket.on('C_make_room', function (info){
    if (socket.number&&info.room_name&&info.member_list){
      let thoigian = new Date();
      // bắt đầu xử lý cái room
      var room_id = 'r'+Date.now();
      socket.emit('S_get_room',room_id);
      // gửi room cho các thành viên
      let member=[];
      info.member_list.forEach((mem,key)=>{
        member.push({number:mem.number,name:mem.name});
        if(key==(info.member_list.length-1)){
          info.member_list.forEach(function(row){
              // kiểm tra xem thành viên này có tài khoản chưa
              con.query("SELECT * FROM `account` WHERE `number` LIKE '"+ row.number +"' LIMIT 1", function(err3, kq)
                {
                  if(err3 || (kq.length ==0)){console.log(err3);}
                  else {
                      var sql5 = "INSERT INTO `"+row.number+"main` (idc, subject,number,name, stt,time ) VALUES ?";
                      var val5 = [[ room_id, info.room_name,socket.number,socket.username,'R',thoigian]];
                      con.query(sql5, [val5], function (err5, res5){
                          if ( err5){console.log(err5);}
                          else{
                            var val7;
                            var sql6 = "INSERT INTO `"+row.number+"member` (idc,number,name ) VALUES ?";
                              info.member_list.forEach((mem)=>{
                              val7 = [[ room_id,mem.number, mem.name]];
                              con.query(sql6, [val7], function (err7){if ( err7){console.log(err7);}});
                            });
                            io.sockets.in(row.number).emit('S_send_room',{room_name:info.room_name, room_id_server:room_id, admin_name:socket.username, admin_number:socket.number,member:member, time:get_time(thoigian)});
                          }
                      });
                  }
                });

            });
        }
      });
    }
  });
  socket.on('danhan_room',(idc)=>{
    if(socket.number&&idc){
      con.query("DELETE FROM `"+socket.number+"main` WHERE `idc` LIKE '"+idc+"'", function(err9){
        if (err9)console.log(err9);
        else {
          con.query("DELETE FROM `"+socket.number+"member` WHERE `idc` LIKE '"+idc+"'", function(err7){
            if (err7)console.log(err7);
          })
        }
      });

      }
  });
  socket.on('C_change_pass', function(oldpass,newpass){
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
  socket.on('C_get_add_mem', function(info){
   if (socket.number&&info.room_fullname&&info.member){
        con.query("SELECT * FROM `" + socket.number+"main` WHERE `idc` LIKE '"+info.room_fullname+"' LIMIT 1", function(err1, rows){
          if ( err1 || (rows.length ==0)){console.log(err);}
          else {
          if(isArray(info.member)){


            }
          }
        });


    }
  });
  socket.on('C_bosung_member', function(info){
    //nếu socket này đang tham gia room thì mới chấp nhận các thao tác tiếp theo
   if (socket.roomabc&&isArray(info)){
    socket.emit ('S_get_bosung_member');
    // lưu thành viên mới vào cơ sở dữ liệu của các thành viên cũ
    con.query("SELECT * FROM `" + socket.number+"main` WHERE `idc` LIKE '"+socket.roomabc+"' LIMIT 1", function(err1, rows){
      if ( err1 || (rows.length ==0 )){console.log('co loi 2 '+err1);}
      else {

      }
    });
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
                if(rows[0].type=="A"||rows[0].type=="D"||rows[0].type=="C")socket.join("chung");
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
              if (err || rows.length ==0){socket.emit('login2_suco_thatbai');}
              else{
                if (rows[0].pass==tin.pass){
                  socket.user = tin.user;
                  socket.type = rows[0].type;
                  if(rows[0].type=="A"||rows[0].type=="B"||rows[0].type=="C"||rows[0].type=="D") {
                    socket.join("chung");

                    //kiểm tra xem có bản tin nào chưa gửi về không thì gửi về cho nó
                    con.query("SELECT * FROM `list_err` WHERE id > "+tin.tt+" ORDER BY id ASC", function(err1, row1s){
                      if (err1 || row1s.length ==0){console.log(err1);}
                      else{
                        console.log('BBBB'+row1s.length);
                        row1s.forEach((row1, i) => {
                          let chihuy2='';if(row1.chihuy2!=null)chihuy=row1.chihuy2;
                          let batdau='';if(row1.batdau!=null)batdau=get_time(row1.batdau);
                          let dennoi='';if(row1.dennoi!=null)dennoi=get_time(row1.dennoi);
                          let xong='';if(row1.xong!=null)xong=get_time(row1.xong);
                          let vedonvi='';if(row1.vedonvi!=null)vedonvi=get_time(row1.vedonvi);
                          socket.emit("S_send_nhiemvu",{tt:row1.id,idc:row1.idc,ten:row1.ten,mota:row1.mota,giaonv:get_time(row1.giaonv),chihuy:row1.chihuy1,
                            chihuy2:chihuy2,batdau:batdau,dennoi:dennoi,xong:xong,vedonvi:vedonvi});
                        });

                      }
                    });
                    // kiểm tra xem có cập nhật mới nào không thì gửi về cho nó
                    if(tin.bantin!=undefined&&tin.bantin.length>0){
                      tin.bantin.forEach((item, i) => {
                      con.query("SELECT * FROM `list_err` WHERE `idc` LIKE '"+item.idc+"' AND `"+item.cot+"`NOT LIKE '' LIMIT 1", function(err2, row2s){
                          if (err2){console.log(err2);}
                          else if(row2s.length>0){
                            let chihuy2='';if(row2s[0].chihuy2!=null)chihuy=row2s[0].chihuy2;
                            let batdau='';if(row2s[0].batdau!=null)batdau=get_time(row2s[0].batdau);
                            let dennoi='';if(row2s[0].dennoi!=null)dennoi=get_time(row2s[0].dennoi);
                            let xong='';if(row2s[0].xong!=null)xong=get_time(row2s[0].xong);
                            let vedonvi='';if(row2s[0].vedonvi!=null)vedonvi=get_time(row2s[0].vedonvi);
                            socket.emit("S_capnhat",{idc:item.idc,chihuy2:chihuy2,batdau:batdau,dennoi:dennoi,xong:xong,vedonvi:vedonvi});
                          }
                        });
                      });
                    }
                    con.query("SELECT * FROM `list_user` WHERE `id` > "+tin.tt_list+" ORDER BY id ASC", function(err5, row5s){
                      if (err5)console.log(err5);
                      else{
                        if(row5s.length>0){
                          row5s.forEach((item, i) => {
                              socket.emit("S_send_user",{tt:item.id, user:item.user,hoten:item.hoten,capbac:item.capbac,chucvu:item.chucvu,donvi:item.donvi,type:item.type});
                          });


                        }
                      }
                    });

                  }
                  else {
                    socket.join(tin.user);
                    let lenh;
                    if(rows[0].type=="E")lenh="SELECT * FROM `list_err` WHERE `chihuy1` LIKE '"+tin.user+"' AND id > "+tin.tt+" ORDER BY id ASC";
                    else lenh="SELECT * FROM `list_err` WHERE `chihuy2` LIKE '"+tin.user+"' AND id >"+tin.tt+"  ORDER BY id ASC";
                    con.query(lenh, function(err1, row1s){
                      if (err1 || row1s.length ==0){console.log(err1);}
                      else{

                        row1s.forEach((row1, i) => {
                          let chihuy2=null;if(row1.chihuy2!=null)chihuy=row1.chihuy2;
                          let batdau=null;if(row1.batdau!=null)batdau=get_time(row1.batdau);
                          let dennoi=null;if(row1.dennoi!=null)dennoi=get_time(row1.dennoi);
                          let xong=null;if(row1.xong!=null)xong=get_time(row1.xong);
                          let vedonvi=null;if(row1.vedonvi!=null)vedonvi=get_time(row1.vedonvi);

                          socket.emit("S_send_nhiemvu",{tt:row1.id,idc:row1.idc,ten:row1.ten,mota:row1.mota,giaonv:get_time(row1.giaonv),chihuy:row1.chihuy1,
                            chihuy2:chihuy2,batdau:batdau,dennoi:dennoi,xong:xong,vedonvi:vedonvi});

                        });

                      }
                    });
                    if(tin.bantin.length>0){
                      tin.bantin.forEach((item, i) => {
                      if(rows[0].type=="E")lenh="SELECT * FROM `list_err` WHERE `chihuy1` LIKE '"+tin.user+"' AND `idc` LIKE '"+item.idc+"' AND `"+item.cot+"`NOT LIKE '' LIMIT 1";
                      else "SELECT * FROM `list_err` WHERE `chihuy2` LIKE '"+tin.user+"' AND `idc` LIKE '"+item.idc+"' AND `"+item.cot+"`NOT LIKE '' LIMIT 1";
                      con.query(lenh, function(err2, row2s){
                          if (err2){console.log(err2);}
                          else if(row2s.length>0){
                            let chihuy2=null;if(row2s[0].chihuy2!=null)chihuy=row2s[0].chihuy2;
                            let batdau=null;if(row2s[0].batdau!=null)batdau=get_time(row2s[0].batdau);
                            let dennoi=null;if(row2s[0].dennoi!=null)dennoi=get_time(row2s[0].dennoi);
                            let xong=null;if(row2s[0].xong!=null)xong=get_time(row2s[0].xong);
                            let vedonvi=null;if(row2s[0].vedonvi!=null)vedonvi=get_time(row2s[0].vedonvi);
                            socket.emit("S_capnhat",{idc:item.idc,chihuy2:chihuy2,batdau:batdau,dennoi:dennoi,xong:xong,vedonvi:vedonvi});
                          }
                        });
                      });
                    }
                    if(rows[0].type=="E"){
                      con.query("SELECT * FROM `list_user` WHERE `user` LIKE '"+tin.user+"' LIMIT 1", function(err4, row4s){
                        if (err4)console.log(err4);
                        else{
                          con.query("SELECT * FROM `list_user` WHERE LOCATE('"+row4s[0].donvi+"',donvi)>0 AND `id` > "+tin.tt_list+" ORDER BY id ASC", function(err5, row5s){
                            if (err5)console.log(err5);
                            else{
                              if(row5s.length>0){
                                row5s.forEach((item, i) => {
                                    socket.emit("S_send_user",{tt:item.id, user:item.user,hoten:item.hoten,capbac:item.capbac,chucvu:item.chucvu,donvi:item.donvi,type:item.type});
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
  socket.on('make_user', function(tin){
    if (socket.user!=null && socket.type!=null&&socket.type=="A"){

       con.query("SELECT * FROM `list_user` WHERE `user` LIKE '"+tin.user+"' LIMIT 1", function(err, rows){
         if (err)socket.emit("regis_suco_thatbai","A");
         else{
              if(rows.length==0){
                var sql = "INSERT INTO `list_user` (user, pass,hoten,capbac,chucvu,donvi,type) VALUES ?";
                  var values = [[tin.user,tin.pass,tin.hoten,tin.capbac,tin.chucvu,tin.donvi,tin.type]];
                  con.query(sql, [values], function (err1, result) {
                    if (err1)socket.emit("regis_suco_thatbai","A");
                    else  socket.emit("regis_suco_ok",result.insertId);
                  });
              }  else socket.emit("regis_suco_thatbai","B");
         }
       });


      }
    });
  socket.on('giao_nhiemvu', function(tin){
       if (socket.user!=null && socket.type!=null&&socket.type=="B"){
         var idc = 'r'+Date.now();
         let thoigian=new Date();
         var sql = "INSERT INTO `list_err` (idc,ten, mota,giaonv,chihuy1) VALUES ?";
           var values = [[idc,tin.ten,tin.mota,thoigian,tin.user]];
           con.query(sql, [values], function (err1, result) {
             if (err1)socket.emit("giao_nhiemvu_thatbai","A");
             else {
               socket.emit("giao_nhiemvu_ok",{tt:result.insertId ,idc:idc,time:get_time(thoigian)});
               io.sockets.in("chung").emit("S_send_nhiemvu",{tt:result.insertId,idc:idc,ten:tin.ten,mota:tin.mota,giaonv:get_time(thoigian),
               chihuy1:tin.name,chihuy2:'',batdau:'',dennoi:'',xong:'',vedonvi:''});
               io.sockets.in(tin.user).emit("S_send_nhiemvu",{tt:result.insertId,idc:idc,ten:tin.ten,mota:tin.mota,giaonv:get_time(thoigian),
               chihuy1:tin.name,chihuy2:'',batdau:'',dennoi:'',xong:'',vedonvi:''});
             }
           });
        }
      });
  socket.on('C_capnhat', function(idc,nd){
      if (socket.user!=null){
        let thoigian=new Date();

        console.log(thoigian);
        let abc='';
        if(nd=="A")abc='batdau';
        else if(nd=="B")abc='dennoi';
        else if(nd=="C")abc='xong';
        else abc='vedonvi';
        var sql = "INSERT INTO `list_err` (idc,ten, mota,giaonv,chihuy1) VALUES ?";
          var values = [["12345","abbc","",thoigian,"dfgh"]];
          con.query(sql, [values], function (err1, result) {
            if (err1)console.log(err1);
            else {
              con.query("UPDATE `list_err` SET giaonv = "+thoigian+" WHERE `idc` LIKE '"+idc+"'",function(err2){
                if(err2){socket.emit('gui_thongtin_thatbai',nd);console.log(err2);}
                 else socket.emit('gui_thongtin_ok',{nd:nd,idc:idc,time:get_time(thoigian)});
              });

            }
        });
        // con.query("UPDATE `list_err` SET `"+abc+"` = "+ok+" WHERE `idc` LIKE '"+idc+"'",function(err1){
        //   if(err1){socket.emit('gui_thongtin_thatbai',nd);console.log(err1);}
        //    else socket.emit('gui_thongtin_ok',nd,idc,{time:get_time(ok)});
        // });
      }
  });

});
}});
