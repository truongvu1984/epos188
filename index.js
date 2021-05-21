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
    var date2 = Math.floor(Date.now() / 1000) - 600;
    var date3=Math.floor(Date.now() / 1000) - 300;
    con.query(" DELETE FROM `active` WHERE `time` < "+date3, function(err){if(err)console.log('co loi HA HA HA:'+err);});
    kiemtra_taikhoan();
  }, 5000);
}
 kiemtra_taikhoan();

io.on('connection',(socket)=>
{

  socket.emit('check_pass');
  socket.on('C_check_phonenumber_caro',(phone,code,id_phone)=>{
    if(phone&&code&&id_phone){
      con.query("SELECT * FROM `active` WHERE `phone_id` LIKE '"+ id_phone +"' LIMIT 1", function(err3, row1s){
        if(err3)socket.emit('regis_1_thatbai','A');
        else {
          if(row1s.length>0 && row1s[0].dem>2)socket.emit('regis_1_thatbai','C');
          else {
            con.query("SELECT * FROM `account2` WHERE `number` LIKE '"+ phone +"' LIMIT 1", function(err, rows){
                    // nếu tài khoản đã có người đăng ký rồi thì:
                    if(err)socket.emit('regis_1_carothatbai','A');
                    else {
                      if (rows.length >0 )	{socket.emit('regis_1_carothatbai','D');}
                      else {
                        if(code=="A"){
                          cb.phoneInformation(phone, (error, response) => {
                            if(error)socket.emit('regis_1_carothatbai','E');
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
  socket.on('regis_1_caro',(mail,code,id_phone)=>{

    if(mail&&code&&id_phone){
      con.query("SELECT * FROM `active` WHERE `phone_id` LIKE '"+ id_phone +"' LIMIT 1", function(err3, row1s){
        if(err3)socket.emit('regis_1_thatbai','A');
        else {

          if(row1s.length>0 && row1s[0].dem>2)socket.emit('regis_1_carothatbai','C');
          else {
            con.query("SELECT * FROM `account2` WHERE `number` LIKE '"+ mail +"' LIMIT 1", function(err, rows){
                    // nếu tài khoản đã có người đăng ký rồi thì:
                    if(err)socket.emit('regis_1_carothatbai','A');
                    else {

                      if (rows.length >0 )	{socket.emit('regis_1_carothatbai','D');}
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
                          if (error) socket.emit('regis_1_carothatbai','B');
                          else {
                            var time = Math.floor(Date.now() / 1000);
                            if(row1s.length==0){
                              var sql = "INSERT INTO `active` (mail,chuoi,time,dem,phone_id ) VALUES ?";
                              var values = [[mail, string1,time,1,id_phone]];
                              con.query(sql, [values], function (err1, result) {
                                if ( err1)socket.emit('regis_1_carothatbai','A');
                                else  socket.emit('regis_1_carothanhcong');
                              });
                            }
                            else {
                              //nếu có rồi thì cập nhật và cộng số đếm lên 1
                              let dem = row1s[0].dem+1;
                              if(dem>2)time=time+300;
                              con.query("UPDATE `active` SET `chuoi`='"+string1+"',`time`="+time+",`dem`="+dem+" WHERE `phone_id` LIKE '"+id_phone+"'",function(err1){
                                if(err1)socket.emit('regis_1_carothatbai','A');
                                else socket.emit('regis_1_carothanhcong');
                              });

                            }
                          }
                        });
                        }
                        else {

                          cb.sendMessage({"to": mail, "text": 'Caro OTP:'+string}, (error, response) => {
                              if(error)socket.emit('regis_1_carothatbai','E');
                              else {

                                var time = Math.floor(Date.now() / 1000);
                                if(row1s.length==0){
                                  var sql = "INSERT INTO `active` (mail,chuoi,time,dem,phone_id ) VALUES ?";
                                  var values = [[mail, string1,time,1,id_phone]];
                                  con.query(sql, [values], function (err1, result) {
                                    if ( err1)socket.emit('regis_1_carothatbai','A');
                                    else  socket.emit('regis_1_carothanhcong');
                                  });
                                }
                                else {
                                  //nếu có rồi thì cập nhật và cộng số đếm lên 1
                                  let dem = row1s[0].dem+1;
                                  if(dem>2)time=time+300;
                                  con.query("UPDATE `active` SET `chuoi`='"+string1+"',`time`="+time+",`dem`="+dem+" WHERE `phone_id` LIKE '"+id_phone+"'",function(err1){
                                    if(err1)socket.emit('regis_1_carothatbai','A');
                                    else socket.emit('regis_1_carothanhcong');
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
  socket.on('regis_2_caro',(tin)=>{
    if(tin.mail &&tin.name&&tin.chuoi&&tin.pass){

      con.query("SELECT `chuoi` FROM `active` WHERE `mail` LIKE '"+tin.mail +"' LIMIT 1", function(err, rows){
        if (err)socket.emit('regis2_carothatbai','A');
        else{
          if(rows.length==0)socket.emit('regis2_carothatbai','B');
          else {
            if(passwordHash.verify(tin.chuoi, rows[0].chuoi)){
                con.query("CREATE TABLE IF NOT EXISTS  `"+tin.mail+"caro` (`id` BIGINT NOT NULL AUTO_INCREMENT, `mail` VARCHAR(45) NOT NULL,`name` VARCHAR(45)  NULL,`ta` INT(5) NULL , `ban` INT(5) NULL , `loai_ban` CHAR(3),`danhan` CHAR(3), PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC))", function(){});
                var sql = "INSERT INTO `account2` (number,user, pass) VALUES ?";
                var matkhau = passwordHash.generate(''+tin.pass);
                var values = [[tin.mail,tin.name, matkhau]];
                con.query(sql, [values], function (err1, result) {
                  if (err1)socket.emit('regis2_carothatbai','A');
                  else  {
                    con.query("DELETE FROM `active` WHERE `mail` LIKE '"+tin.mail+"'", function(err2){
                      if (err2)socket.emit('regis2_carothanhcong');
                      else socket.emit('regis2_carothanhcong');
                    });
                  }
                });

              }
            else socket.emit('regis2_carothatbai','B');
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
                    socket.emit('S_send_diem',a2.mail,a2.ban,a2.loai_ban,a2.name);
                  });

                }
              }
            });
          }
          }
      });
    }//end
    else {socket.emit('login2_sai');}

  });
  socket.on('forget_pass_1_caro',(mail,code,phone_id)=>{
    if(mail&&code&&phone_id){
      con.query("SELECT * FROM `active` WHERE `phone_id` LIKE '"+ phone_id +"' LIMIT 1", function(err3, row1s){
        if(err3){socket.emit('regis_1_thatbai','A');}
        else {
          if(row1s.length>0 && row1s[0].dem>2)socket.emit('regis_1_thatbai','C');
          else {
            con.query("SELECT * FROM `account2` WHERE `number` LIKE '"+ mail +"' LIMIT 1", function(err, rows){
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
  socket.on('forget_pass_2_caro',(tin)=>{
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
  socket.on('search_contact_caro', function (string){

    if (socket.number&&string!=null){

      con.query("SELECT `number`,`user`,  LOCATE('"+string+"',number) FROM `account2` WHERE LOCATE('"+string+"',number)>0", function(err, a1s){
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
  socket.on('C_xoa_banco',(mail)=>{
    if(socket.number != null&&mail!=null){
      con.query("DELETE FROM `"+socket.number+"caro` WHERE `mail` LIKE '"+mail+"'", function(err2){
        if (err2)console.log(err2);
        else {
          var sql7 = "INSERT INTO `"+socket.number+"caro` (mail) VALUES ?";
          var val7 = [[mail]];
          con.query(sql7, [val7], function (err7, result) {
              if ( err7){console.log(err7);}
              else socket.emit('S_del_banco_ok');
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
      if(toado!=null && mail !=null){
// `mail` VARCHAR(20) NOT NULL,`name` VARCHAR(20) NOT NULL,`ta` INT(5) NULL , `loai_ta` CHAR(3), `ban` INT(5) NULL , `loai_ban` CHAR(3),`danhan` CHAR(3)
      // lưu vào mình.
      // xem đã có cái row này hay chưa
    con.query("SELECT * FROM `"+socket.number+"caro` WHERE `mail` LIKE '"+mail+"'", function(err1, a1s){
        if(err1){console.log(err1);}
        else {
          if(a1s.length==0){
            var sql7 = "INSERT INTO `"+socket.number+"caro` (mail, ta) VALUES ?";
            var val7 = [[mail,toado]];
            con.query(sql7, [val7], function (err7, result) {
                if ( err7){console.log(err7);}
                else {
                  socket.emit('C_send_diem_ok');
                  con.query("SELECT * FROM `"+mail+"caro` WHERE `mail` LIKE '"+socket.number+"'", function(err4, a4s){
                      if(err4)console.log(err4);
                      else {
                        if(a4s.length==0){
                          var sql6 = "INSERT INTO `"+mail+"caro` (mail,name, ban,loai_ban,danhan ) VALUES ?";
                          var val6 = [[socket.number,socket.username,toado, stt, 'N']];
                          con.query(sql6, [val6], function (err6, result) {
                              if ( err6)console.log(err6);
                              else io.sockets.in(mail).emit('S_send_diem',socket.number,toado,stt,socket.username);

                          });
                        }
                        else {
                          con.query("UPDATE `"+mail+"caro` SET `ban` = "+toado+",`loai_ban`='"+stt+"',`danhan`='N' WHERE `mail` LIKE '"+socket.number+"'",function(err6,res6){
                            if(err6)console.log(err6);
                            else io.sockets.in(mail).emit('S_send_diem',socket.number,toado,stt,socket.username);

                          });
                        }
                      }
                    });

                }
            });
          }
          else {
            con.query("UPDATE `"+socket.number+"caro` SET `ta` = "+toado+" WHERE `mail` LIKE '"+mail+"'",function(err5,res5){
              if(err5){console.log(err5);}
              else {
                socket.emit('C_send_diem_ok');
                con.query("SELECT * FROM `"+mail+"caro` WHERE `mail` LIKE '"+socket.number+"'", function(err4, a4s){
                    if(err4){console.log(err4);}
                    else {
                      if(a4s.length==0){
                        var sql6 = "INSERT INTO `"+mail+"caro` (mail, ban,name,loai_ban,danhan ) VALUES ?";
                        var val6 = [[socket.number,socket.username,toado, stt, 'N']];
                        con.query(sql6, [val6], function (err6, result) {
                            if ( err6)console.log(err6);
                            else io.sockets.in(mail).emit('S_send_diem',socket.number,toado,stt,socket.username);

                        });
                      }
                      else {
                        con.query("UPDATE `"+mail+"caro` SET `ban` = "+toado+",`loai_ban`='"+stt+"',`danhan`='N' WHERE `mail` LIKE '"+socket.number+"'",function(err6,res6){
                          if(err6)console.log(err6);
                          else io.sockets.in(mail).emit('S_send_diem',socket.number,toado,stt,socket.username);

                        });
                      }
                    }
                  });



              }
            });
          }
        }
      });
    }
  }
  else socket.emit('check_pass');
  });
  socket.on('C_nhan_toado',(mail)=>{
    if(socket.number != null && mail != null){
      con.query("UPDATE `"+socket.number+"caro` SET `danhan` = 'Y' WHERE `mail` LIKE '"+mail+"'",function(err5,res5)
          {if(err5){console.log(err5);}
      });
    }
    else socket.emit('check_pass');
  });
  socket.on('reg_old_game',(mail)=>{
    if(socket.number != null){
      if(mail!= null) io.sockets.in(mail).emit('C_reg_old_game',socket.number);
  }
  else socket.emit('check_pass');
  });
  socket.on('C_send_old_game',(mail,ten,ban,ta,luot)=>{
    if(socket.number != null){
        if(mail!= null &&ban!= null&&ta!= null &&ten !=null && luot != null){
       io.sockets.in(mail).emit('C_send_old_game_2',{mail:socket.number,name:strencode(ten),toado_ban:ban,toado_ta:ta, luotchoi:strencode(luot)});

    }
  }
  else socket.emit('check_pass');

  });
  socket.on('regis_1_windlaxy',(mail,code,id_phone)=>{
    if(mail&&code&id_phone){
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

                con.query("CREATE TABLE IF NOT EXISTS  `"+tin.mail+"mes_main` (`id` BIGINT NOT NULL AUTO_INCREMENT,`idc` CHAR(60) NOT NULL, `subject` VARCHAR(20) NOT NULL,`send_receive` VARCHAR(5) NOT NULL,`stt` VARCHAR(5) NULL , `read_1` CHAR(3), `time` DATETIME(6), PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC))", function(){});

                con.query("CREATE TABLE IF NOT EXISTS `"+tin.mail+"mes_detail` (`id` BIGINT NOT NULL AUTO_INCREMENT,`ids` BIGINT NOT NULL,`idp` CHAR(20) NOT NULL,`name` VARCHAR(45) NOT NULL,`lat` DOUBLE NULL,`lon` DOUBLE NULL,PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC))", function(){});

                con.query("CREATE TABLE IF NOT EXISTS `"+tin.mail+"mes_sender` (`id` BIGINT NOT NULL AUTO_INCREMENT,`ids` INT NOT NULL,`number` VARCHAR(20) NOT NULL,`name` VARCHAR(45) NULL,`send_receive` VARCHAR(5), `stt` VARCHAR(5) NULL,PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC))", function(){});
                con.query("CREATE TABLE IF NOT EXISTS `"+tin.mail+"contact` (`id` INT NOT NULL AUTO_INCREMENT,`number` VARCHAR(45) NOT NULL,`name` VARCHAR(45) NOT NULL,`idc` CHAR(15) NULL,PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC))", function(){});
                con.query("CREATE TABLE IF NOT EXISTS `"+tin.mail+"alarm` (`id` BIGINT NOT NULL AUTO_INCREMENT,`maso` CHAR(20) NOT NULL,`name` VARCHAR(45) NOT NULL,`type` CHAR(3) NOT NULL,`time` DATETIME(6) NOT NULL,`culy` INT NOT NULL,`lat` DOUBLE,`lon` DOUBLE,`ring` CHAR(3),`time1` CHAR(16),`uri` VARCHAR(45),`kieu` CHAR(1),PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC))", function(){});

                var sql = "INSERT INTO `account` (number,user, pass) VALUES ?";
                var matkhau = passwordHash.generate(''+tin.pass);
                var values = [[tin.mail,tin.name, matkhau]];
                con.query(sql, [values], function (err1, result) {
                  if (err1)socket.emit('regis2_thatbai','A');
                  else  {
                    con.query("DELETE FROM `active` WHERE `mail` LIKE '"+tin.mail+"'", function(err2){
                      if (err2)socket.emit('regis2_thanhcong');
                      else socket.emit('regis2_thanhcong');
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
        if(err3){socket.emit('regis_1_thatbai','A');log}
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
            if(data.room != ""){
              if(socket.roomabc){
                socket.leave(socket.roomabc);
                socket.join(data.room );
                socket.roomabc = data.room ;
              }
              else {
                socket.join(data.room );
                socket.roomabc = data.room ;

              }
            }

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
  socket.on('C_reg_online',(id,num)=>{
    if(socket.number&&id!=null&&num!= null&&(!isNaN(id))&&(!isNaN(num))){

      if(num==0){
        if(id==0){
        con.query("SELECT * FROM `"+socket.number+"mes_main`  WHERE `send_receive` LIKE 'O' ORDER BY `id` DESC LIMIT 20", function(err1, a1s){
          if (err1){console.log('Da co loi room full:'+err1);}
          else if(a1s.length>0)
            {
              let noidung=[];
               a1s.forEach(function(a1,key){
                con.query("SELECT `name`,`number` FROM `"+socket.number+"mes_sender` WHERE `ids` LIKE '"+a1.id+"' AND `send_receive` LIKE 'A' LIMIT 1 ", function(err5, a5s)
                  {
                    if ( err5 ){console.log(err5);}
                    else  {if(a5s.length>0){
                      noidung.push({ids:a1.id,room_name:a1.subject, room_id_server:a1.idc, admin_name:a5s[0].name, admin_number:a5s[0].number, time:get_time(a1.time), stt:a1.stt,abc:'A'});
                        if(key===(a1s.length-1))socket.emit('S_send_room',noidung);

                    }
                  }
                  });
              });
          }
      });
      }
        else {
        con.query("SELECT * FROM `"+socket.number+"mes_main`  WHERE `send_receive` LIKE 'O' AND `id` > "+id+" ORDER BY `id` ASC", function(err1, a1s){
          if (err1){console.log('Da co loi room full:'+err1);}
          else if(a1s.length>0)
            {
              let noidung=[];
               a1s.forEach(function(a1,key){
                con.query("SELECT `name`,`number` FROM `"+socket.number+"mes_sender` WHERE `ids` LIKE '"+a1.id+"' AND `send_receive` LIKE 'A' LIMIT 1 ", function(err5, a5s)
                  {
                    if ( err5 ){console.log(err5);}
                    else  {if(a5s.length>0){
                      noidung.push({ids:a1.id,room_name:a1.subject, room_id_server:a1.idc, admin_name:a5s[0].name, admin_number:a5s[0].number, time:get_time(a1.time), stt:a1.stt,abc:'B'});
                        if(key===(a1s.length-1))socket.emit('S_send_room',noidung);
                    }
                  }
                  });
              });
          }
      });
      }
      }
      else {
        con.query("SELECT * FROM `"+socket.number+"mes_main`  WHERE `send_receive` LIKE 'O' AND `id` < "+id+" ORDER BY `id` DESC LIMIT "+num, function(err1, a1s){
            if (err1){console.log('Da co loi room full:'+err1);}
            else if(a1s.length>0)
              {
                let noidung=[];
                 a1s.forEach(function(a1,key){
                  con.query("SELECT `name`,`number` FROM `"+socket.number+"mes_sender` WHERE `ids` LIKE '"+a1.id+"' AND `send_receive` LIKE 'A' LIMIT 1 ", function(err5, a5s)
                    {
                      if ( err5 ){console.log(err5);}
                      else  {if(a5s.length>0){
                        noidung.push({ids:a1.id,room_name:a1.subject, room_id_server:a1.idc, admin_name:a5s[0].name, admin_number:a5s[0].number, time:get_time(a1.time), stt:a1.stt,abc:'A'});
                          if(key===(a1s.length-1))socket.emit('S_send_room',noidung);
                      }
                    }
                    });
                });
            }
        });
      }
    }
    else socket.emit('check_pass');
  });
  socket.on('C_reg_inbox',(id,num)=>{
    if(socket.number&&id != null&&num!= null&&(!isNaN(id))&&(!isNaN(num))){
      if(num==0){
        if(id==0){
       con.query("SELECT *  FROM `"+socket.number+"mes_main` WHERE `send_receive` LIKE 'R' AND `id` > "+num+" ORDER BY `id` DESC LIMIT 20", function(err1, a1s)
       {
        if (err1){console.log(err1);}
        else if(a1s.length >0)
          {
            let noidung=[];
            a1s.forEach((a1,key)=>{
              con.query("SELECT `id`,`name`, `number` FROM `"+socket.number+"mes_sender` WHERE `ids` LIKE '"+a1.id+"' LIMIT 1", function(err2, a2s){
                 if(err2){console.log(err2);}
                 else {
                   if(a2s.length>0) noidung.push({ids:a1.id,name_nguoigui:a2s[0].name,number_nguoigui:a2s[0].number, subject:a1.subject, id_tinnha_client:a1.idc,read_1:a1.read_1, stt: a1.stt,time:get_time(a1.time),abc:'A'});
                    if(key===(a1s.length-1))socket.emit('S_send_tinnhan',noidung);

                 }
               });
            });
          }
        });
      }
        else {
        con.query("SELECT *  FROM `"+socket.number+"mes_main` WHERE `send_receive` LIKE 'R' AND `id` > "+id+" ORDER BY `id` ASC", function(err1, a1s)
        {
         if (err1){console.log(err1);}
         else if(a1s.length >0)
           {
             let noidung=[];
             a1s.forEach((a1,key)=>{
               con.query("SELECT `id`,`name`, `number` FROM `"+socket.number+"mes_sender` WHERE `ids` LIKE '"+a1.id+"' LIMIT 1", function(err2, a2s){
                  if(err2){console.log(err2);}
                  else {
                    if(a2s.length>0) noidung.push({ids:a1.id,name_nguoigui:a2s[0].name,number_nguoigui:a2s[0].number, subject:a1.subject, id_tinnha_client:a1.idc,read_1:a1.read_1, stt: a1.stt,time:get_time(a1.time),abc:'B'});
                     if(key===(a1s.length-1))socket.emit('S_send_tinnhan',noidung);

                  }
                });
             });
           }
         });
      }
      }
      else {
        con.query("SELECT * FROM `"+socket.number+"mes_main`  WHERE `send_receive` LIKE 'R' AND `id` < "+id+" ORDER BY `id` DESC LIMIT "+num, function(err1, a1s){
          if (err1){console.log(err1);}
          else if(a1s.length >0)
            {
              let noidung=[];
              a1s.forEach((a1,key)=>{
                con.query("SELECT `id`,`name`, `number` FROM `"+socket.number+"mes_sender` WHERE `ids` LIKE '"+a1.id+"' LIMIT 1", function(err2, a2s){
                   if(err2){console.log(err2);}
                   else {
                     if(a2s.length>0)noidung.push({ids:a1.id,name_nguoigui:a2s[0].name,number_nguoigui:a2s[0].number, subject:a1.subject, id_tinnha_client:a1.idc,read_1:a1.read_1, stt: a1.stt,time:get_time(a1.time),abc:'A'});
                      if(key===(a1s.length-1))socket.emit('S_send_tinnhan',noidung);

                   }
                 });
              });
            }
        });
      }
    }
  });
  socket.on('C_reg_send',(id,num)=>{
    if(socket.number&&id!=null&&num!= null&&(!isNaN(id))&&(!isNaN(num))){
      if(num==0){
        if(id==0){
       con.query("SELECT * FROM `"+socket.number+"mes_main` WHERE `send_receive` LIKE 'S' AND `id` > "+num+" ORDER BY `id` DESC LIMIT 20", function(err1, a1s)
        {
             if (err1){console.log(err1);}
             else if(a1s.length >0)
               {
                 let noidung=[];
                 a1s.forEach(function(a1,key){
                   let nhomnguoinhan =[];
                    con.query("SELECT * FROM `"+socket.number+"mes_sender` WHERE `send_receive` LIKE 'S' AND `ids` = "+a1.id, function(err2, a2s){
                      if(err2){console.log(err2);}
                      else {
                        if(a2s.length >0){
                        a2s.forEach(function(a2,key2){
                          nhomnguoinhan.push({number:a2.number,name:a2.name,stt:a2.stt});
                          if(key2 === (a2s.length-1)){
                            noidung.push({ids:a1.id,subject:a1.subject, idc:a1.idc,time:get_time(a1.time), nguoinhan:nhomnguoinhan,abc:'A'});
                            if(key === (a1s.length-1))socket.emit('S_send_send',noidung);
                          }
                        });
                      }
                    }

                    });
                 });
               }
        });
      }
        else {
        con.query("SELECT * FROM `"+socket.number+"mes_main` WHERE `send_receive` LIKE 'S' AND `id` > "+id+" ORDER BY `id` ASC", function(err1, a1s)
         {
              if (err1){console.log(err1);}
              else if(a1s.length >0)
                {
                  let noidung=[];
                  a1s.forEach(function(a1,key){
                    let nhomnguoinhan =[];
                     con.query("SELECT * FROM `"+socket.number+"mes_sender` WHERE `send_receive` LIKE 'S' AND `ids` = "+a1.id, function(err2, a2s){
                       if(err2){console.log(err2);}
                       else {
                         if(a2s.length >0){
                         a2s.forEach(function(a2,key2){
                           nhomnguoinhan.push({number:a2.number,name:a2.name,stt:a2.stt});
                           if(key2 === (a2s.length-1)){
                             noidung.push({ids:a1.id,subject:a1.subject, idc:a1.idc,time:get_time(a1.time), nguoinhan:nhomnguoinhan,abc:'B'});
                             if(key === (a1s.length-1))socket.emit('S_send_send',noidung);
                           }
                         });
                       }
                     }

                     });
                  });
                }
       });
      }
    }
    else {
      con.query("SELECT * FROM `"+socket.number+"mes_main` WHERE `send_receive` LIKE 'S' AND `id` < "+id+" ORDER BY `id` DESC LIMIT "+num, function(err1, a1s)
       {
            if (err1){console.log(err1);}
            else if(a1s.length >0)
              {
                let noidung=[];
                a1s.forEach(function(a1,key){
                  let nhomnguoinhan =[];
                   con.query("SELECT * FROM `"+socket.number+"mes_sender` WHERE `send_receive` LIKE 'S' AND `ids` = "+a1.id, function(err2, a2s){
                     if(err2){console.log(err2);}
                     else {
                       if(a2s.length >0){
                       a2s.forEach(function(a2,key2){
                         nhomnguoinhan.push({number:a2.number,name:a2.name,stt:a2.stt});
                         if(key2 === (a2s.length-1)){
                           noidung.push({ids:a1.id,subject:a1.subject, idc:a1.idc,time:get_time(a1.time), nguoinhan:nhomnguoinhan,abc:'A'});
                           if(key === (a1s.length-1))socket.emit('S_send_send',noidung);
                         }
                       });
                     }
                   }

                   });
                });
              }
       });
    }
    }
    else socket.emit('check_pass');

  });
  socket.on('C_reg_save',(id,num)=>{
    if(socket.number&&id!=null&&num!= null&&(!isNaN(id))&&(!isNaN(num))){
      if(num==0){
        if(id==0){
        con.query("SELECT * FROM `"+socket.number+"mes_main` WHERE `send_receive` LIKE 'H' ORDER BY `id` DESC LIMIT 20", function(err1, a1s){
          if (err1){console.log(err1);}
          else if(a1s.length >0){
            let noidung=[];
                a1s.forEach(function(a1,key){
                  noidung.push({ids:a1.id,subject:a1.subject, idc:a1.idc,time:get_time(a1.time),abc:'A'});
                  if(key===(a1s.length-1))socket.emit('S_send_save',noidung);
                });
              }
          });
      }
        else {
        con.query("SELECT * FROM `"+socket.number+"mes_main` WHERE `send_receive` LIKE 'H' AND `id` > "+id+" ORDER BY `id` ASC", function(err1, a1s)
          {
              if (err1){console.log(err1);}
              else if(a1s.length >0){
                let noidung=[];
                    a1s.forEach(function(a1,key){
                      noidung.push({ids:a1.id,subject:a1.subject, idc:a1.idc,time:get_time(a1.time),abc:'B'});
                      if(key===(a1s.length-1))socket.emit('S_send_save',noidung);
                    });
              }
          });
      }
    }
    else {
      con.query("SELECT * FROM `"+socket.number+"mes_main` WHERE `send_receive` LIKE 'H' AND `id` < "+id+" ORDER BY `id` DESC LIMIT "+num, function(err1, a1s)
        {
            if (err1){console.log(err1);}
            else if(a1s.length >0){
              let noidung=[];
                  a1s.forEach(function(a1,key){
                    noidung.push({ids:a1.id,subject:a1.subject, idc:a1.idc,time:get_time(a1.time),abc:'A'});
                    if(key===(a1s.length-1))socket.emit('S_send_save',noidung);
                  });
            }
        });
    }
    }
    else {
      socket.emit('check_pass');
    }
  });
  socket.on('C_reg_friend',(ids,num)=>{
    if(socket.number&&ids!=null&&num!=null&&(!isNaN(num))){
        if(num==0){

        con.query("SELECT * FROM `"+socket.number+"contact` ORDER BY `id` ASC LIMIT 50", function(err1, a1s)
          {
            if (err1){console.log('Da co loi contact 3:'+err1);}
            else if(a1s.length > 0)
              {
                  let noidung=[];
                  a1s.forEach(function(a1,key){
                    noidung.push({ids:a1.id,name:a1.name, number:a1.number,idc:a1.idc,abc:'A'});
                      if(key===(a1s.length-1))    socket.emit('S_send_contact',noidung);


                });
              }
        });

      }
      else {
        con.query("SELECT * FROM `"+socket.number+"contact` WHERE `id` > "+ids+" ORDER BY `id` ASC LIMIT 50", function(err1, a1s)
          {
            if (err1){console.log('Da co loi contact1:'+err1);}
            else if(a1s.length > 0)
              {
                let noidung=[];
                a1s.forEach(function(a1,key){
                      noidung.push({ids:a1.id,name:a1.name, number:a1.number,idc:a1.idc,abc:'A'});
                    if(key===(a1s.length-1))socket.emit('S_send_contact',noidung);
                });

              }
        });
      }
    }
    else {
      socket.emit('check_pass');
    }
  });
  socket.on('C_reg_alarm',(id,num)=>{
    if(socket.number&&id != null&&num!= null&&(!isNaN(id))&&(!isNaN(num))){
      if(num==0){
        if(id==0){
          con.query("SELECT * FROM `"+socket.number+"alarm` ORDER BY `id` DESC LIMIT 20", function(err1, a1s){
              if (err1){console.log('Da co loi room full:'+err1);}
              else if(a1s.length>0)
                {
                  let noidung=[];
                   a1s.forEach(function(a1,key){
                     noidung.push({ids:a1.id,name:a1.name,ma:a1.maso,type:a1.type,lat:a1.lat,lon:a1.lon,culy:a1.culy,uri:a1.uri,time:get_time(a1.time),time1:a1.time1,abc:'A',kieu:a1.kieu});
                     if(key===(a1s.length-1))socket.emit('S_send_alarm',noidung);
                  });
              }
          });
      }
        else {
          con.query("SELECT * FROM `"+socket.number+"alarm`  WHERE `id` > "+id+" ORDER BY `id` ASC", function(err1, a1s){
              if (err1){console.log('Da co loi room full:'+err1);}
              else if(a1s.length>0)
                {
                  let noidung=[];
                   a1s.forEach(function(a1,key){
                     noidung.push({ids:a1.id,name:a1.name,ma:a1.maso,type:a1.type,lat:a1.lat,lon:a1.lon,culy:a1.culy,uri:a1.uri,time:get_time(a1.time),time1:a1.time1,abc:'B',kieu:a1.kieu});
                     if(key===(a1s.length-1))socket.emit('S_send_alarm',noidung);
                  });
              }
          });
      }
      }
      else {
        con.query("SELECT * FROM `"+socket.number+"alarm`  WHERE `id` < "+id+" ORDER BY `id` DESC LIMIT "+num, function(err1, a1s){
            if (err1){console.log('Da co loi room full:'+err1);}
            else if(a1s.length>0)
              {
                let noidung=[];
                 a1s.forEach(function(a1,key){
                   noidung.push({ids:a1.id,name:a1.name,ma:a1.maso,type:a1.type,lat:a1.lat,lon:a1.lon,culy:a1.culy,uri:a1.uri,time:get_time(a1.time),time1:a1.time1,abc:'A',kieu:a1.kieu});
                   if(key===(a1s.length-1))socket.emit('S_send_alarm',noidung);
                });
            }
        });
      }
    }
  });
  socket.on('C_send_alarm',(data)=>{
  if(socket.number){
    if(data.name != null&&data.ma != null&&data.type != null&&data.lat != null&&data.lon != null&&data.culy != null&&(!isNaN(data.culy))&&data.ring !=null&&data.kieu!= null&&data.uri != null){
      let thoigian = new Date();
      var sql2 = "INSERT INTO `"+socket.number+"alarm` (maso,name, type, time,culy,lat,lon,ring,uri,kieu) VALUES ?";
      var values2 = [[data.ma, data.name,data.type,thoigian,data.culy,data.lat,data.lon,data.ring,data.uri,data.kieu]];
      con.query(sql2, [values2], function (err, res)
        {
          if ( err){console.log(err);}
          else {
            socket.emit('S_get_alarm',{ids:res.insertId, name:data.name,ma:data.ma,type:data.type,lat:data.lat,lon:data.lon,culy:data.culy,uri:data.uri,kieu:data.kieu,time:get_time(thoigian)});
          }
        });
      }
    }
});
  socket.on('C_del_inbox',(mes)=>{
    if(socket.number&&isArray(mes)&&(mes.length>0)){
      mes.forEach((mes1,key)=>{
        if(mes1.idc){
        con.query("SELECT * FROM `"+socket.number+"mes_main` WHERE `idc` LIKE '"+mes1.idc+"'  AND `send_receive` LIKE 'R' LIMIT 1", function(err, res)
          {
            if ( err){console.log(err);}
            else
              {
                if(res.length>0){
                con.query("DELETE FROM `"+socket.number+"mes_sender` WHERE `ids` LIKE '"+res[0].id+"'  AND `send_receive` LIKE 'R'", function(err1)
                  {
                    if ( err1){console.log(err1);}
                    else {
                      con.query("DELETE FROM `"+socket.number+"mes_detail` WHERE `ids` LIKE '"+res[0].id+"'", function(err2)
                        {
                          if (err2){console.log(err2);}
                          else {
                            con.query("DELETE FROM `"+socket.number+"mes_main` WHERE `idc` LIKE '"+mes1.idc+"'", function(err3)
                              {
                                if (err3){console.log(err3);}
                                else {

                                  if(key===(mes.length-1)){socket.emit('S_del_inbox');}
                                }
                            });
                          }
                      });

                    }
                });
              }

              }
          });
        }
      });
    }
  });
  socket.on('C_del_send',(mes)=>{
    if(socket.number&&isArray(mes)&&(mes.length>0)){
      mes.forEach((mes1,key)=>{
        if(mes1.idc){
          con.query("SELECT * FROM `"+socket.number+"mes_main` WHERE `idc` LIKE '"+mes1.idc+"'  AND `send_receive` LIKE 'S' LIMIT 1", function(err, res)
            {
            if ( err ){console.log(err);}
            else
              {
                if(res.length>0){
                con.query("DELETE FROM `"+socket.number+"mes_sender` WHERE `ids` LIKE '"+res[0].id+"'  AND `send_receive` LIKE 'S'", function(err1)
                  {
                    if ( err1){console.log(err1);}
                    else {
                      con.query("DELETE FROM `"+socket.number+"mes_detail` WHERE `ids` LIKE '"+res[0].id+"'", function(err2)
                        {
                          if (err2){console.log(err2);}
                          else {
                            con.query("DELETE FROM `"+socket.number+"mes_main` WHERE `idc` LIKE '"+mes1.idc+"' AND `send_receive` LIKE 'S'", function(err3)
                              {
                                if (err3){console.log(err3);}
                                else {
                                  if(key===(mes.length-1)){socket.emit('S_del_send');}

                                }
                            });
                          }
                      });

                    }
                });
              }
              }
            });
        }
      });
    }
  });
  socket.on('C_del_save',(mes)=>{
    if(socket.number&&isArray(mes)&&(mes.length>0)){
      mes.forEach((mes1,key)=>{
        if(mes1.idc){
          con.query("SELECT * FROM `"+socket.number+"mes_main` WHERE `idc` LIKE '"+mes1.idc+"'  AND `send_receive` LIKE 'H' LIMIT 1", function(err, res)
          {
            if ( err ){console.log(err);}
            else
              {
                if(res.length>0){
                  con.query("DELETE FROM `"+socket.number+"mes_detail` WHERE `ids` LIKE '"+res[0].id+"'", function(err2)
                        {
                          if (err2){console.log(err2);}
                          else {
                            con.query("DELETE FROM `"+socket.number+"mes_main` WHERE `idc` LIKE '"+mes1.idc+"' AND `send_receive` LIKE 'H'", function(err3)
                              {
                                if (err3){console.log(err3);}
                                else {

                                  if(key===(mes.length-1)){socket.emit('S_del_save');}

                                }
                            });
                          }
                      });

                  }
              }
        });
        }
      });
    }
  });
  socket.on('C_del_online',(mes)=>{
    if(socket.number&&isArray(mes)&&(mes.length>0)){
      socket.emit('S_del_online');
      mes.forEach((mes1,key)=>{
        if(mes1.idc){
          con.query("SELECT * FROM `"+socket.number+"mes_main` WHERE `idc` LIKE '"+mes1.idc+"'  AND `send_receive` LIKE 'O' LIMIT 1", function(err, res)
          {
            if ( err ){console.log(err);}
            else
              {
                if(res.length>0){
                con.query("SELECT * FROM `"+socket.number+"mes_sender` WHERE `ids` = "+res[0].id + " AND `number` NOT LIKE '"+socket.number+"'", function(err1, res1)
                  {
                    if ( err1|| (res1.length ==0) ){console.log('2:'+err1);}
                    else
                      {

                        res1.forEach((member1,key1)=>{
                          con.query("SELECT * FROM `"+member1.number+"mes_main` WHERE `idc` LIKE '"+mes1.idc+"'  AND `send_receive` LIKE 'O' LIMIT 1", function(err2, res2)
                            {
                              if ( err2|| (res2.length ==0) ){console.log('3:'+err2);}
                              else
                                {
                                  con.query("DELETE FROM `"+member1.number+"mes_sender` WHERE `ids` = "+res2[0].id + " AND `number` LIKE '"+socket.number+"'", function(err3)
                                    {
                                        if (err3){console.log(err3);}
                                        else {

                                          if(key1===(res1.length-1)){
                                          con.query("DELETE FROM `"+socket.number+"mes_main` WHERE `id` = "+res[0].id, function(err9){if (err9){console.log(err9);}});
                                          con.query("DELETE FROM `"+socket.number+"mes_sender` WHERE `ids` = "+res[0].id , function(err8){if (err8){console.log(err8);}});
                                        }
                                        }

                                    });

                                }
                            });

                        });
                      }
                });
              }
              }
            });
        }
        });
    }
  });
  socket.on('C_del_alarm',(list)=>{
    socket.emit('S_del_alarm_ok');
    if(socket.number&&isArray(list)&&(list.length>0)){
      list.forEach((item,key)=>{
        con.query("DELETE FROM `"+socket.number+"alarm` WHERE `maso` LIKE '"+item.maso+"'", function(err1)
          {
            if ( err1){console.log(err1);}

          });

      });
    }
  });
  socket.on('C_del_friend',(numbers)=>{
    if(socket.number&&isArray(numbers)&&(numbers.length>0)){
      numbers.forEach((number)=>{

        if(number.idc){
        con.query("DELETE FROM `"+socket.number+"contact` WHERE `number` LIKE '"+number.idc+"'", function(err3)
          {
              if (err3)console.log(err3);
              else  socket.emit('S_del_friend');

        });
      }
      });
    }
  });//hi
  socket.on('C_reques_point_inbox',(idc)=>{
    if(socket.number&&idc){
      if(socket.roomabc){
        socket.leave(socket.roomabc);
        socket.roomabc = undefined;
      }
      con.query("SELECT * FROM `"+socket.number+"mes_main` WHERE `send_receive` LIKE 'R' AND `idc` LIKE '"+idc+"' LIMIT 1", function(err, a1s)
         {
           if ( err || ( a1s.length == 0) ){console.log(err);}
           else
             {
               if(a1s[0].read_1 ==="N"){
                 con.query("UPDATE `"+socket.number+"mes_main` SET `read_1` = 'Y' WHERE `send_receive` LIKE 'R' AND `idc` LIKE '"+idc+"' LIMIT 1",function(error){
                   if(error){console.log(error);}
                 });
               }
               con.query("SELECT * FROM `"+socket.number+"mes_detail` WHERE `ids` LIKE '"+a1s[0].id+"'", function(err3, a3s){
                        if(err3){console.log(err3);}
                        else {
                          let position=[];
                          a3s.forEach(function(a3,key){
                            position.push({name:a3.name, lat:a3.lat, lon:a3.lon, id:a3.idp});
                            if(key===(a3s.length-1)){socket.emit('S_send_point',position);}
                          });
                        }
                });

             }
      });
    }
  });
  socket.on('C_reques_point',(idc)=>{
    if(socket.number&&idc){
        if(socket.roomabc){
          socket.leave(socket.roomabc);
          socket.roomabc = undefined;
        }

      con.query("SELECT * FROM `"+socket.number+"mes_main` WHERE `idc` LIKE '"+idc+"' LIMIT 1", function(err, a1s)
         {
           if ( err || ( a1s.length == 0) ){console.log(err);}
           else
             {
               con.query("SELECT * FROM `"+socket.number+"mes_detail` WHERE `ids` LIKE '"+a1s[0].id+"'", function(err3, a3s){
                        if(err3){console.log(err3);}
                        else {
                          let position=[];
                          a3s.forEach(function(a3,key){
                            position.push({name:a3.name, lat:a3.lat, lon:a3.lon, id:a3.idp});
                            if(key===(a3s.length-1)){socket.emit('S_send_point',position);}
                          });
                        }
                });

             }
        });

  }
  });
  socket.on('C_reques_point_import',(list)=>{
    if(socket.number&&isArray(list)){
      let position=[];
        list.forEach((list1,key1)=>{
          if(list1.id){
            con.query("SELECT * FROM `"+socket.number+"mes_main` WHERE `idc` LIKE '"+list1.id+"' LIMIT 1", function(err, a1s)
           {
             if ( err || ( a1s.length == 0) ){console.log('ha ha ha:'+err);}
             else
               {
                 con.query("SELECT * FROM `"+socket.number+"mes_detail` WHERE `ids` LIKE '"+a1s[0].id+"'", function(err3, a3s){
                          if(err3 || (a3s.length==0)){console.log('ko co:'+err3);}
                          else {
                            a3s.forEach(function(a3,key){
                              position.push({name:a3.name, lat:a3.lat, lon:a3.lon, id:a3.idp});
                              if(key1===(list.length-1) && key===(a3s.length-1)){
                                socket.emit('S_send_point_import',position);
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
  socket.on('C_gui_tinnhan', function(mess){
    if (socket.number&&mess.nguoinhan&&mess.id&&mess.subject){
      let thoigian = new Date();
        let nguoinhans = [];
        if(isArray(mess.nguoinhan)){
          mess.nguoinhan.forEach((nguoi, key7)=>{
            if(nguoi.number){
          nguoinhans.push({number:nguoi.number, name:nguoi.name, stt:'N'});
          if(key7===(mess.nguoinhan.length-1)){
            // lưu vào bảng chính của người gửi
            var sql2 = "INSERT INTO `"+socket.number+"mes_main` (idc,subject, send_receive, time,stt) VALUES ?";
            var values2 = [[mess.id, mess.subject,'S',thoigian,'F']];
            con.query(sql2, [values2], function (err, res)
              {
                if ( err){console.log(err);}
                else {
                  socket.emit('S_get_tinnhan',mess.imei,{ids:res.insertId, subject:mess.subject,nguoinhan:nguoinhans,idc:mess.id,time:get_time(thoigian),stt:'F'});
                        // lưu vào bảng vị trí của người gửi
                        var sql3 = "INSERT INTO `"+socket.number+"mes_detail` (ids, idp, name, lat, lon) VALUES ?";
                        mess.pos.forEach(function(row)
                          {
                            var val = [[res.insertId, row.id, row.name, row.lat, row.lon]];
                            con.query(sql3, [val], function (err2, res2) {if ( err2){console.log(err2);}});
                          });
                          // lưu danh sách người nhận vào bảng của người gửi
                        var sql4 = "INSERT INTO `"+socket.number+"mes_sender` (ids,number, name, send_receive, stt) VALUES ?";
                        mess.nguoinhan.forEach(function(row5)
                          {
                            var val4 = [[res.insertId, row5.number, row5.name, 'S', 'N']];
                            con.query(sql4, [val4], function (err3, res3) {if ( err3){console.log(err3);}});
                            con.query("SELECT * FROM `account` WHERE `number` LIKE '"+ row5.number +"' LIMIT 1", function(err4, res4)
                              {
                                if ( err4 ){console.log(err4);}
                                else if ( res4.length >0)
                                  {
                                      // lưu vào bảng chính của người nhận
                                      // var sql5= "INSERT INTO `"+row5.number+"mes_main` (idc,subject, send_receive, stt, read,time) VALUES ?";
                                      var sql5= "INSERT INTO `"+row5.number+"mes_main` (idc,subject, send_receive, read_1,stt, time ) VALUES ?";
                                      var val5 = [[mess.id, mess.subject,'R','N','N',thoigian]];
                                      con.query(sql5, [val5], function (err5, res5)
                                      {
                                        if ( err5){console.log(err5);}
                                        else
                                        {
                                          //lưu vào bảng người gửi của người nhận
                                          var sql6 = "INSERT INTO `"+row5.number+"mes_sender` (ids,number, name, send_receive) VALUES ?";
                                          var val6 = [[ res5.insertId, socket.number,socket.username,'R']];
                                          con.query(sql6, [val6], function (err6, res6) {
                                            if ( err6){console.log(err6);}
                                          else {
                                              mess.pos.forEach(function(row3){
                                              // lưu vào bảng vị trí của người nhan
                                              var sql7 = "INSERT INTO `"+row5.number+"mes_detail` (ids, idp, name, lat, lon) VALUES ?";
                                              var val7 = [[res5.insertId, row3.id, row3.name, row3.lat, row3.lon]];
                                              con.query(sql7, [val7], function (err7, result) {if ( err7){console.log(err7);}});



                                              });
                                              io.sockets.in(row5.number).emit('S_send_tinnhan',[{ids:res5.insertId,name_nguoigui:socket.username,number_nguoigui:socket.number,
                                                  subject: mess.subject, id_tinnha_client:mess.id, time:get_time(thoigian),read_1:'N', stt:'N',abc:'B'}]);


                                          } //het else
                                        });

                                        }
                                      });
                                      // gửi tin nhắn đến máy điện thoại người nhận
                                    }
                                    // nếu tìm trong bảng acccount mà không có tên người nhận thì báo lại là không có ai nhận
                                  else {socket.emit('S_send_mess_no_contact',row5.number);}
                                });
                            });
                  }
              });
          }
        }
        });
        }
      }

  });
  socket.on('C_check_send',(data)=>{
    if(socket.number){
      let list=[];
      let list_full=[];
      if(isArray(data)&&(data.length>0)){
        data.forEach((tin,key)=>{
          if(tin.number&&tin.idc){
        con.query("SELECT * FROM `"+socket.number+"mes_main` WHERE `send_receive` LIKE 'S' AND `idc` LIKE '"+tin.idc+"' LIMIT 1", function(err1, a1s){
          if(err1){console.log(err1);}
          else {
            if(a1s.length>0){
            con.query("SELECT * FROM `"+socket.number+"mes_sender` WHERE `send_receive` LIKE 'S' AND `ids` LIKE '"+a1s[0].id+"' AND `stt` LIKE 'Y'", function(err2, a2s){
              if(err2){console.log(err2);}
              else {
                if(a2s.length > tin.number){
                  a2s.forEach((a2,key2)=>{
                    list.push({number:a2.number, name:a2.name,stt:a2.app});
                    if(key2===a2s.length){
                      list_full.push({list:list,idc:tin.idc});
                      if(key===data.length){socket.emit('S_check_send',list_full);}
                    }
                  });
                }
              }
            });
          }
          }
        });
      }
      });
      }
    }  }); //ok
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
              con.query("DROP TABLE IF EXISTS `"+abc+"mes_main`", function(err4){ if (err4)console.log(err4);});
              con.query("DROP TABLE IF EXISTS `"+abc+"mes_sender`", function(err4){ if (err4)console.log(err4);});
              con.query("DROP TABLE IF EXISTS `"+abc+"mes_detail`", function(err4){ if (err4)console.log(err4);});
              con.query("DROP TABLE IF EXISTS `"+abc+"alarm`", function(err4){ if (err4)console.log(err4);});

                }
              });
            }
            else socket.emit('del_acc_2_thatbai','B');
          }

        }
      });

    }
  });
  socket.on('C_save_pos',(mess)=>{

    if(socket.number&&mess.idc&&mess.subject&&mess.vitri&&isArray(mess.vitri)){

      let thoigian = new Date();
      var sql = "INSERT INTO `"+socket.number+"mes_main` (idc,subject, send_receive, time) VALUES ?";
      var val = [[mess.idc, mess.subject,'H',thoigian]];
      con.query(sql, [val], function (err, res)
        {
          if(err){console.log(err);}
          else {
            io.sockets.in(socket.number).emit('S_get_save_pos',mess.imei,{ids:res.insertId,time:get_time(thoigian),subject:mess.subject,idc:mess.idc});
            var sql3 = "INSERT INTO `"+socket.number+"mes_detail` (ids, idp, name, lat, lon) VALUES ?";
            mess.vitri.forEach((row)=>{
                var val3 = [[res.insertId, row.id, row.name, row.lat, row.lon]];
                con.query(sql3, [val3], function (err3, res3) {if ( err3){console.log(err3);}});
              });

          }
      });
    }
  });
  socket.on('danhantinnhan', function (nguoigui, idc){

   	if (socket.number&&nguoigui&&idc){
      con.query("UPDATE `"+socket.number+"mes_main` SET `stt` = 'Y' WHERE `idc` LIKE '"+idc+"' AND `send_receive` LIKE 'R'",function(err5,res5)
          {if(err5){console.log(err5);}


      });
	     // báo cho người gửi biết là thằng socket.number đã nhận tin nhắn
       con.query("SELECT * FROM `"+nguoigui+"mes_main` WHERE `idc` LIKE '"+idc+"' AND `send_receive` LIKE 'S' LIMIT 1", function(err11, res11)
        {
          if (err11){console.log(err11);}
          else if(res11.length > 0)
          {
            con.query("UPDATE `"+nguoigui+"mes_sender` SET `stt` = 'Y' WHERE `ids` LIKE '"+res11[0].id+"' AND `number` LIKE '"+socket.number+"'",function(err3,res3)
                {
                  if(err3){console.log(err3);}
                  else {
                      io.sockets.in(nguoigui).emit('C_danhantinnhan',{nguoinhan:socket.number,tennguoinhan:socket.username, idc:idc});
                  }
                });
          }

        });
      }
  });
  socket.on('C_read_mes',(idc)=>{
    if(socket.number&&idc){
        con.query("UPDATE `"+socket.number+"mes_main` SET `read_1` = 'OK' WHERE `idc` LIKE '"+idc+"' AND `send_receive` LIKE 'R'",function(err2){
          if(err2){console.log(err2);}

        });

    }
  });
  socket.on('search_contact', function (string){

    if (socket.number&&string!=null){

      con.query("SELECT `number`,`user`,  LOCATE('"+string+"',number) FROM `account` WHERE LOCATE('"+string+"',number)>0", function(err, a1s){
      if ( err)console.log(err);
      else
      {
        if(a1s.length>0){
          let noidung=[];
          a1s.forEach(function(a1,key){
            noidung.push({user:a1.user, number: a1.number});
              if(key===(a1s.length-1))  {
                socket.emit('S_send_search_contact',noidung);

              }

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


        // cái này cho app chuyển sang giao diên map
        // gửi danh sách thành viên cho app
    con.query("SELECT * FROM `"+socket.number+"mes_main` WHERE `send_receive` LIKE 'O' AND `idc` LIKE '"+room+"' LIMIT 1", function(err, a1s)
       {
         if ( err || ( a1s.length == 0) ){console.log(err);}
         else
           {
             con.query("SELECT * FROM `"+socket.number+"mes_sender` WHERE `ids` LIKE '"+a1s[0].id+"'", function(err2, a2s)
                {
                  if ( err2 || ( a2s.length == 0) ){console.log(err2);}
                  else
                    {
                      var tin=[];
                      a2s.forEach((member,key)=>{
                        tin.push({name:member.name, number:member.number, admin:member.send_receive});
                        if(key===(a2s.length-1)){socket.emit('S_send_member',tin);}
                      });
                    }
              });


           }
    });

    }
  });
  socket.on('C_send_contact', function (contact){
      if (socket.number&&isArray(contact)){
        contact.forEach((row,key)=>{

          con.query("SELECT * FROM `"+socket.number+"contact` WHERE `number` LIKE '"+row.number+"' LIMIT 1", function(err, a1s)
             {
               if ( err){console.log(err);}
               else
                 {
                   if(a1s.length===0){
                    var sql2 = "INSERT INTO `"+socket.number+"contact` (idc,name,number) VALUES ?";
                    var values2 = [[row.idc,row.name,row.number]];
                    con.query(sql2, [values2], function (err, res)
                      {
                        if ( err){console.log(err);}
                        else {
                          socket.emit('S_add_contact_ok',{ids:res.insertId, idc:row.idc,name:row.name,number:row.number});
                        }
                    });
                  }
                 }
            });

        });

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
      socket.emit('log_out_ok');
  });
  socket.on('C_leave_room', function (room) {
      if (socket.number&&room){
      socket.leave(room);
      socket.roomabc = undefined;
    }
  });
  socket.on('C_got_friend', function (number){
      if (socket.number&&number){con.query("UPDATE `"+socket.number+"contact` SET `fr` = 'OK' WHERE `number` LIKE '"+number+"'",function(err3, ok){ console.log('loi update'+err)});
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
      var room_id = passwordHash.generate(info.room_name);
      // Server tạo ra cái room đầy đủ để lưu hành trên hệ thống
      var sql = "INSERT INTO `"+socket.number+"mes_main` (idc, subject, send_receive, time,stt ) VALUES ?";
      var val = [[ room_id, info.room_name,'O', thoigian,'F']];
      con.query(sql, [val], function (err, res)
      {
        if (err){console.log(err);}
        else{
          socket.emit('S_get_room',{ids:res.insertId,room_name:info.room_name, room_id_server:room_id, admin_name:socket.username, admin_number:socket.number, time:get_time(thoigian),stt:'F'});
          // lưu thành viên vào bảng
          var sql2 = "INSERT INTO `"+socket.number+"mes_sender` (ids, name, number, send_receive) VALUES ?";
          var abc = [[ res.insertId, socket.username,socket.number,'A']];
          con.query(sql2, [abc], function (err9, res9){if ( err9){console.log(err9);}
            else {
              if(isArray(info.member_list)){
                info.member_list.forEach((member)=>{
                  if(member.name&&member.number){
                  val2 = [[ res.insertId, member.name,member.number,'B']];
                  con.query(sql2, [val2], function (err2, res2){if ( err2){console.log(err2);}});
                  }
                });

            }
            }
          });
        }
      });
      // gửi room cho các thành viên
        info.member_list.forEach(function(row){
          // kiểm tra xem thành viên này có tài khoản chưa
          con.query("SELECT * FROM `account` WHERE `number` LIKE '"+ row.number +"' LIMIT 1", function(err3, kq)
            {
              if(err3 || (kq.length ==0)){console.log(err3);}
              else {
                      var sql5 = "INSERT INTO `"+row.number+"mes_main` (idc, subject, send_receive, time,stt ) VALUES ?";
                      var val5 = [[ room_id, info.room_name,'O', thoigian,'F']];
                      con.query(sql5, [val5], function (err5, res5)
                            {
                              if ( err5){console.log(err5);}
                              else
                              {
                              let sql6 = "INSERT INTO `"+row.number+"mes_sender` (ids, number, name, send_receive ) VALUES ?";
                              var ab = [[ res5.insertId,socket.number, socket.username,'A']];
                              con.query(sql6, [ab], function (err6, res6)
                              {
                                if ( err6){console.log(err6);}
                                else
                                {
                                  var val7;
                                  info.member_list.forEach((mem)=>{
                                    val7 = [[ res5.insertId,mem.number, mem.name,'B']];
                                    con.query(sql6, [val7], function (err7){if ( err7){console.log(err7);}});
                                  });
                                  io.sockets.in(row.number).emit('S_send_room',[{ids:res5.insertId,room_name:info.room_name, room_id_server:room_id, admin_name:socket.username, admin_number:socket.number, time:get_time(thoigian),stt:'F',abc:'B'}]);

                                }
                              });
                            }
                          });
              }
            });

        });
    }
   	});
  socket.on('danhan_room',(idc)=>{
    if(socket.number&&idc){
      con.query("UPDATE `"+socket.number+"mes_main` SET `stt` = 'Y' WHERE `idc` LIKE '"+idc+"' AND `send_receive` LIKE 'O'",function(err5,res5)
          {if(err5){console.log(err5);}

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
        con.query("SELECT * FROM `" + socket.number+"mes_main` WHERE `idc` LIKE '"+info.room_fullname+"' LIMIT 1", function(err1, rows){
          if ( err1 || (rows.length ==0)){console.log(err);}
          else {
          if(isArray(info.member)){
          info.member.forEach(function(mem)
              {
              con.query("UPDATE `"+socket.number+"mes_sender` SET `stt` = 'Y' WHERE `number` LIKE '"+mem.number+"' AND `ids` LIKE '"+rows[0].id+"'",function(err4){if (err4){console.log(err4);}});
            });
          }
            con.query("SELECT 'id' FROM `" + socket.number+"mes_sender` WHERE `ids` LIKE '"+rows[0].id+"' AND `stt` LIKE 'N' LIMIT 1", function(err2, rows2){
              if (err2 || (rows2.length >0)) {console.log(err2);}
              else {
                  con.query("UPDATE `"+socket.number+"mes_main` SET `stt` = 'Y' WHERE `id` LIKE '"+rows[0].id+"'",function(err3){if (err3){console.log(err3);}});
              }
            });

          }
        });


    }
  });
  socket.on('C_bosung_member', function(info){
    //nếu socket này đang tham gia room thì mới chấp nhận các thao tác tiếp theo
   if (socket.roomabc&&isArray(info)){
    socket.emit ('S_get_bosung_member');
    // lưu thành viên mới vào cơ sở dữ liệu của các thành viên cũ
    con.query("SELECT * FROM `" + socket.number+"mes_main` WHERE `idc` LIKE '"+socket.roomabc+"' LIMIT 1", function(err1, rows){
      if ( err1 || (rows.length ==0 )){console.log('co loi 2 '+err1);}
      else {
        con.query("SELECT * FROM `" + socket.number+"mes_sender` WHERE `ids` LIKE '"+rows[0].id+"'", function(err2, row2s){
          if ( err2 || (row2s.length ==0 )){console.log('co loi 3 '+err2);}
          else {
            row2s.forEach((old_member)=>{
              con.query("SELECT * FROM `" +old_member.number+"mes_main` WHERE `idc` LIKE '"+socket.roomabc+"' LIMIT 1", function(err3, row3s){
                if ( err3 || (row3s.length ==0 )){console.log('co loi 4 '+err3);}
                else {
                  let sql2 = "INSERT INTO `"+old_member.number+"mes_sender` (ids,number, name, send_receive) VALUES ?";
                  info.forEach((mem)=>{
                    let values = [[row3s[0].id, mem.number, mem.name, 'B']];
                    con.query(sql2, [values], function (err4){if (err4){console.log('co loi 3 '+err4);}});
                    io.sockets.in(socket.roomabc).emit('S_send_member',{ name:mem.name, number:mem.number});
                    var sql3 = "INSERT INTO `"+mem.number+"mes_main` (idc, subject, send_receive, stt,time ) VALUES ?";
                    var val3 = [[ rows[0].idc, rows[0].subject,'O', 'N','N']];
                    con.query(sql3, [val3], function (err3, res3)
                    {
                      if(err3){console.log(err3);}
                      else {
                          row2s.forEach((old_member)=>{
                          let sql4 = "INSERT INTO `"+mem.number+"mes_sender` (ids, number, name, send_receive ) VALUES ?";
                          var ab = [[ res3.insertId,old_member.number, old_member.name,old_member.send_receive]];
                          con.query(sql4, [ab], function (err4)
                          {
                            if ( err4){console.log(err4);}
                          });
                          });

                          info.forEach((new_member)=>{
                          let sql5 = "INSERT INTO `"+mem.number+"mes_sender` (ids, number, name, send_receive ) VALUES ?";
                          var ab5 = [[ res3.insertId,new_member.number, new_member.name,'B']];
                          con.query(sql5, [ab5], function (err5)
                          {
                            if ( err5){console.log('loi 6:'+err5);}
                            else {
                              io.sockets.in(socket.roomabc).emit('S_send_room',{room_name:info.room_name, room_id_server:rows[0].idc, admin_name:socket.username, admin_number:socket.number, time:'N'});
                            }
                          });
                          });

                      }

                    });

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
});
}});
