var express = require("express");
var app = express();
var http = require("http");
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
server.listen(process.env.PORT || 3000, function(){console.log("server start")});
var mysql = require('mysql');
var nodemailer = require('nodemailer');
var con = mysql.createConnection({
  host: "us-cdbr-iron-east-05.cleardb.net",
  user: "b04c2ff40d4e13",
  password: "0fdaedd4",
 database : "heroku_7790b5956b2a5c2",
 queueLimit: 30,
  acquireTimeout: 1000000,
});
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'windlaxy@gmail.com',
    pass: 'Vuyeungan1994'
  }
});

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
function strencode( data ){return unescape( encodeURIComponent(data));}
function strdecode( data ){
  return JSON.parse( decodeURIComponent( escape ( data ) ) );
}
var passwordHash = require('password-hash');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })
isArray = function(a) {
    return (!!a) && (a.constructor === Array);
}

con.connect(function(err) {
    if (err) { console.log(" da co loi:" + err);}
    else {
      app.get('/', (req, res) => res.render('dangnhap3'));
      app.get('/privacy-policy', (req, res) => res.render('privacy'));
      app.post('/', urlencodedParser, function (req, res){
              if (!req.body) return res.sendStatus(400)
              else {
                var full_number = "+"+req.body.code + req.body.number.replace('0','');
                con.query("SELECT * FROM `account` WHERE `number` LIKE '"+full_number+"' LIMIT 1", function(err, rows){
                  if (err || rows.length ==0){res.render('dangnhap', {noidung:'Tài khoản này không tồn tại'});}
                  else{
                    if (passwordHash.verify(req.body.pass, rows[0].pass)){res.render('home2', {sodienthoai:full_number, name:rows[0].user, pass:req.body.pass });}
                    else {res.render('dangnhap', {noidung:'Mật khẩu không đúng'});}
                  }
                });
              }
            })


function kiemtra_taikhoan(){
  setTimeout(function() {
    //sau mỗi phút, kiêm tra db và xóa các bản tin đã quá 10 phút ==600 giây
    var date2 = Math.floor(Date.now() / 1000) - 600;
    var date3=Math.floor(Date.now() / 1000) - 300;

    // mở khóa cho số điện thoại hoặc phoneid bị khóa
    con.query(" DELETE FROM `dangky` WHERE `time2` < "+date2, function(err){if(err){console.log('co loi HA HA HA:'+err);}});
    con.query(" DELETE FROM `active` WHERE `time` < "+date3, function(err){if(err){console.log('co loi HA HA HA:'+err);}});
    con.query("UPDATE `active` SET `time` = "+date2+" WHERE `dem` > 2",function(err1){if(err1)console.log(err1);
    });
    kiemtra_taikhoan();
  }, 5000);
}
kiemtra_taikhoan();

io.on('connection',(socket)=>
{
  console.log(socket.id);
  socket.emit('check_pass');
  socket.on('C_regis',(name,mail,pass)=>{
    if(mail &&pass){
      //kiểm tra xem tài khoản này có đủ điều kiện để làm việc tiếp không
      con.query("SELECT * FROM `active` WHERE `mail` LIKE '"+ mail +"' LIMIT 1", function(err3, row1s){
        if(err3)socket.emit('dangky_thatbai','A');
        else {

          if(row1s.length>0 && row1s[0].dem>2)socket.emit('dangky_quasolan','C');
          else {
            con.query("SELECT * FROM `account` WHERE `number` LIKE '"+ mail +"' LIMIT 1", function(err, rows){
                    // nếu tài khoản đã có người đăng ký rồi thì:
                    if(err)socket.emit('dangky_thatbai','A');
                    else {
                      if (rows.length >0 )	{socket.emit('regis_already_account','D');}
                      else {
                        var string = Math.floor(Math.random() * (899999)) + 100000;
                        var string1 = passwordHash.generate(''+string);
                        console.log('haha:'+string1);
                        var mailOptions = {
                          from: 'windlaxy@gmail.com',
                          to: mail,
                          subject: 'Active code',
                          text: 'Your active code:'+string
                        };
                        transporter.sendMail(mailOptions, function(error, info){
                          if (error) socket.emit('mail_ko_dung_dinh_dang');
                          else {
                            var time = Math.floor(Date.now() / 1000);
                            // let dem = row1[0].dem;
                            if(row1s.length==0){
                              var sql = "INSERT INTO `active` (name,mail,pass, chuoi,time,dem ) VALUES ?";
                              var matkhau = passwordHash.generate(''+pass);
                              console.log('hihi');
                              console.log(matkhau);


                              var values = [[name,mail, pass, string1,time,1]];
                              con.query(sql, [values], function (err1, result) {
                                if ( err1)socket.emit('dangky_thatbai','A');
                                else  socket.emit('dangky_thanhcong_1');
                              });
                            }
                            else {
                              //nếu có rồi thì cập nhật và cộng số đếm lên 1
                              let dem = row1s[0].dem+1;
                              con.query("UPDATE `active` SET `name` = '"+name+"', `pass` ='"+pass+"',`chuoi`='"+chuoi+"',`dem`="+dem+", `time`="+time+" WHERE `mail` LIKE '"+mail+"'",function(err1){
                                if(err1)socket.emit('dangky_thatbai','A');
                                else socket.emit('dangky_thanhcong_1');
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
    }
  });
  socket.on('C_kichhoat',(mail,code)=>{
    if(mail &&code){
      con.query("SELECT * FROM `active` WHERE `mail` LIKE '"+mail+"' LIMIT 1", function(err, rows){
        if (err)socket.emit('kichhoat_thatbai','A');
        else{
          if(rows.length==0)socket.emit('kichhoat_thatbai','B');
          else {
            if(passwordHash.verify(code, rows[0].chuoi)){
                var sql = "INSERT INTO `account` (number,user, pass) VALUES ?";
                var values = [[mail,rows[0].name, rows[0].pass]];
                con.query(sql, [values], function (err1, result) {if (err1)socket.emit('kichhoat_thatbai','A');
                  else  {
                    con.query("DELETE FROM `active` WHERE `mail` LIKE '"+mail+"'", function(err2){
                       if (err2)socket.emit('kichhoat_thanhcong');
                      else socket.emit('kichhoat_thanhcong');
                    });
                  }
                });
              }
              else socket.emit('kichhoat_thatbai','C');
            }

        }
      });
    }
  });
  socket.on('regis', function (key,num,user_info){
    if(key&&num&&user_info.number&&user_info.user&&user_info.code&&user_info.pass){
      if(key&&num&&pass){
      cb.getValidateStatus(key, (err,ketqua)=>{
        if(err)console.log(err);
        else {
          if(ketqua.validated){
            con.query("SELECT * FROM `account` WHERE `number` LIKE '"+ user_info.number +"' LIMIT 1", function(err, rows){
                    // nếu tài khoản đã có người đăng ký rồi thì:
                    if(err)socket.emit('dangky_thatbai');
                    else {
                      if (rows.length >0 )	{socket.emit('regis_already_account');}
                      else {

                            // TẠO RA CACS BẢNG THÔNG TIN CHO NGƯỜI DÙNG
                              // 1. Bảng chính: lưu id của bản tin đó trên server, id của người dùng, tên tin nhắn, tin nhắn gửi đi hay tin nhắn nhận về, trạng thái gửi đi hay nhận về.
                              con.query("CREATE TABLE IF NOT EXISTS  `"+user_info.number+"mes_main` (`id` BIGINT NOT NULL AUTO_INCREMENT,`idc` CHAR(60) NOT NULL, `subject` VARCHAR(20) NOT NULL,`send_receive` VARCHAR(5) NOT NULL,`stt` VARCHAR(5) NULL , `read_1` CHAR(3), `time` DATETIME(6), PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC))", function(){});
                              //2. Bảng địa điểm: lưu id bản tin đó trên server, tên điểm, tọa độ điểm
                              con.query("CREATE TABLE IF NOT EXISTS `"+user_info.number+"mes_detail` (`id` BIGINT NOT NULL AUTO_INCREMENT,`ids` BIGINT NOT NULL,`idp` CHAR(20) NOT NULL,`name` VARCHAR(45) NOT NULL,`lat` DOUBLE NULL,`lon` DOUBLE NULL,PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC))", function(){});
                              //3. Bảng  thông tin người gửi hoặc nhận: gồm number, tên, là người gửi hay nhận, trạng thái nhận hay gửi được chưa
                              con.query("CREATE TABLE IF NOT EXISTS `"+user_info.number+"mes_sender` (`id` BIGINT NOT NULL AUTO_INCREMENT,`ids` INT NOT NULL,`number` VARCHAR(20) NOT NULL,`name` VARCHAR(45) NULL,`send_receive` VARCHAR(5), `stt` VARCHAR(5) NULL,PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC))", function(){});
                              con.query("CREATE TABLE IF NOT EXISTS `"+user_info.number+"contact` (`id` INT NOT NULL AUTO_INCREMENT,`number` VARCHAR(20) NOT NULL,`name` VARCHAR(45) NOT NULL,`fr` VARCHAR(5) NULL,`code` VARCHAR(10) NULL,PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC))", function(){});
                                                            // lưu tài khoản vào db
                              var sql = "INSERT INTO `account` (number,user, pass, code ) VALUES ?";
                              var matkhau = passwordHash.generate(user_info.pass);
                              var values = [[user_info.number,user_info.user, matkhau, user_info.code]];

                              con.query(sql, [values], function (err, result) {if ( err)socket.emit('dangky_thatbai');
                                else  socket.emit('dangky_thanhcong');
                            });



                      } //end else 1
                    }
              });//end db.account
          }
        }
      });
    }
  }
  }); //end socket.on.regis
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

  socket.on('C_change_pass_admin',function(key,num,pass){
    if(key&&num&&pass){
      cb.getValidateStatus(key, (err,ketqua)=>{
        if(err)socket.emit('S_doipass_thatbai');
        else {
          if(ketqua.validated){
            con.query("UPDATE `account` SET `pass` = '"+passwordHash.generate(pass)+"' WHERE `number` LIKE '"+num+"'",function(err1){
              if(err1)socket.emit('S_doipass_thatbai');
              else socket.emit('S_doipass_thanhcong');
            });
          }
        }
      });
    }

  });
  socket.on('login1',(user1, pass1)=>{
      if(user1&&pass1){

      con.query("SELECT * FROM `account` WHERE `number` LIKE '"+user1+"' LIMIT 1", function(err, rows){
  	     if (err || rows.length ==0){socket.emit('login1_khongtaikhoan');}
  			 else{
          if (passwordHash.verify(pass1, rows[0].pass)){
            console.log('Login 1 đúng rồi hi hi:'+user1);
              socket.emit('login1_dung', {name:strencode(rows[0].user)});
          }
          else {
            socket.emit('login1_sai', {name:strencode(rows[0].user)});
          }
        }
      });
    }
  });
  socket.on('login3',(user1, pass1)=>{
      if(user1&&pass1){
      con.query("SELECT * FROM `account` WHERE `number` LIKE '"+user1+"' LIMIT 1", function(err, rows){
  	     if (err || rows.length ==0){socket.emit('login1_khongtaikhoan');}
  			 else{
          if (passwordHash.verify(pass1, rows[0].pass)){
            console.log('Login 3 đúng rồi hi hi:'+user1);
            socket.number = user1;
            socket.username = user1;
            socket.join(user1);
              socket.emit('login1_dung', {name:strencode(rows[0].user)});
          }
          else {
            socket.emit('login1_sai', {name:strencode(rows[0].user)});
          }
        }
      });
    }
  });

  function check_data1(data){
    let abc;
    if(data==null||isNaN(data))abc=false;
    else abc=true;
    return abc;
  }
  socket.on('login2',(data)=>{
    if(data.rightuser&&data.right_pass&&check_data1(data.online)&&check_data1(data.inbox)&&check_data1(data.send)&&check_data1(data.save)&&check_data1(data.contact)&&check_data1(data.group)){
      con.query("SELECT * FROM `account` WHERE `number` LIKE '"+data.rightuser+"' LIMIT 1", function(err, rows){
  	    if (err || rows.length ==0){socket.emit('login2_khongtaikhoan');}
        else{
          if (passwordHash.verify(data.right_pass, rows[0].pass)){
            socket.number = data.rightuser;
            socket.username = rows[0].user;
            socket.join(data.rightuser);
            // lấy bảng inbox
             con.query("SELECT *  FROM `"+socket.number+"mes_main` WHERE `send_receive` LIKE 'R' AND `id` > "+data.inbox+" ORDER BY `id` ASC", function(err1, a1s)
             {
              if (err1){console.log(err1);}
              else if(a1s.length >0)
                {
                  a1s.forEach((a1,key)=>{
                    con.query("SELECT `id`,`name`, `number` FROM `"+socket.number+"mes_sender` WHERE `ids` LIKE '"+a1.id+"' LIMIT 1", function(err2, a2s){
                       if(err2){console.log(err2);}
                       else {
                         socket.emit('S_send_tinnhan',{ids:a1.id,name_nguoigui:strencode(a2s[0].name),number_nguoigui:a2s[0].number, subject:strencode(a1.subject), id_tinnha_client:a1.idc,read_1:a1.read_1, stt: a1.stt,time:get_time(a1.time)});

                       }
                     });
                  });
                }
              });
            // lấy bảng send
             con.query("SELECT * FROM `"+socket.number+"mes_main` WHERE `send_receive` LIKE 'S' AND `id` > "+data.send+" ORDER BY `id` ASC", function(err1, a1s)
              {
                   if (err1){console.log(err1);}
                   else if(a1s.length >0)
                     {
                       a1s.forEach(function(a1,key){
                         let nhomnguoinhan =[];
                          con.query("SELECT * FROM `"+socket.number+"mes_sender` WHERE `send_receive` LIKE 'S' AND `ids` = "+a1.id, function(err2, a2s){
                            if(err2){console.log(err2);}
                            else {
                              if(a2s.length >0){
                              a2s.forEach(function(a2,key2){
                                nhomnguoinhan.push({number:strencode(a2.number),name:strencode(a2.name),stt:a2.stt});
                                if(key2 === (a2s.length-1)){

                                  socket.emit('S_send_send',{ids:a1.id,subject:strencode(a1.subject), idc:a1.idc,time:get_time(a1.time), nguoinhan:nhomnguoinhan});
                                }
                              });
                            }
                          }

                          });
                       });
                     }
            });
            // // lấy bảng save
            con.query("SELECT * FROM `"+socket.number+"mes_main` WHERE `send_receive` LIKE 'H' AND `id` > "+data.save+" ORDER BY `id` ASC", function(err1, a1s)
              {
                  if (err1){console.log(err1);}
                  else if(a1s.length >0){
                    a1s.forEach(function(a1){
                      socket.emit('S_send_save',{ids:a1.id,subject:strencode(a1.subject), idc:a1.idc,time:get_time(a1.time)});
                    });
                  }
              });
            // // // lấy bảng contact
            con.query("SELECT * FROM `"+socket.number+"contact` WHERE `id` > "+data.contact+" ORDER BY `id` ASC", function(err1, a1s)
              {
                if (err1){console.log('Da co loi contact full:'+err1);}
                else if(a1s.length > 0)
                  {
                    let mangcontact;
                    a1s.forEach(function(a1,key){
                      mangcontact={ids:a1.id,name:strencode(a1.name), number:a1.number};
                      socket.emit('S_send_contact',mangcontact);
                    });
                  }
            });
            //lấy danh sách group
            con.query("SELECT * FROM `"+socket.number+"mes_main` WHERE `send_receive` LIKE 'P' AND `id` > "+data.group+" ORDER BY `id` ASC", function(err1, a1s)
             {
              if ( err1){console.log(err1);}
              else if( a1s.length > 0)
                {
                  let tinfull;
                  a1s.forEach(function(a1,key){
                      let mangcontact = [];
                      con.query("SELECT * FROM `"+socket.number+"mes_sender` WHERE `ids` LIKE '"+a1.id+"'", function(err2, a2s){
                       if(err2){console.log(err2);}
                       else {
                         if(a2s.length>0){
                           a2s.forEach(function(a2,key2){
                             mangcontact.push({name:strencode(a2.name), number:a2.number});
                             if(key2===(a2s.length-1)){
                               tinfull={ids:a1.id,idc:a1.idc,subject:strencode(a1.subject),contact_list:mangcontact};
                               socket.emit('S_send_group',tinfull);

                             }
                           });
                         }
                       }
                     });
                  });
                }
              });
            // // Lấy danh sách room
            con.query("SELECT * FROM `"+socket.number+"mes_main`  WHERE `send_receive` LIKE 'O' AND `id` > "+data.online+" ORDER BY `id` ASC", function(err1, a1s){
                if (err1){console.log('Da co loi room full:'+err1);}
                else if(a1s.length>0)
                  {
                     a1s.forEach(function(a1,key){
                      con.query("SELECT `name`,`number` FROM `"+socket.number+"mes_sender` WHERE `ids` LIKE '"+a1.id+"' AND `send_receive` LIKE 'A' LIMIT 1 ", function(err5, a5s)
                        {
                          if ( err5 ){console.log(err5);}
                          else  {if(a5s.length>0){
                              socket.emit('S_send_room',{ids:a1.id,room_name:strencode(a1.subject), room_id_server:a1.idc, admin_name:strencode(a5s[0].name), admin_number:a5s[0].number, time:get_time(a1.time), stt:a1.stt});

                          }
                        }
                        });
                    });
                }
            });

            }
          else {socket.emit('login2_sai');}
        }
     	 });
     }
	});
  socket.on('C_send_diem',(toado,name,stt)=>{
    if(socket.number && toado && name){
        io.sockets.in(name).emit('S_send_diem',socket.number,toado,stt);

    }
  });
  socket.on('denghi_choi_lai',(name)=>{
    if(socket.number && name){
        io.sockets.in(name).emit('S_denghi_choilai',socket.number);

    }
  });
  socket.on('C_dannhan_denghi_choilai',(string,name)=>{
    if(socket.number && string && name){
      io.sockets.in(name).emit('C_danhan_denghi_choilai',string, socket.number);
    }
  });
  socket.on('ok_choilai',(name,chuoi)=>{
    if(socket.number && name && chuoi)io.sockets.in(name).emit('ok_choilai',socket.number,chuoi);
  });
  socket.on('C_nhan_toado',(name)=>{
    if(socket.number && name){
      io.sockets.in(name).emit('C_send_diem_ok');
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
                            position.push({name:strencode(a3.name), lat:a3.lat, lon:a3.lon, id:a3.idp});
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
                            position.push({name:strencode(a3.name), lat:a3.lat, lon:a3.lon, id:a3.idp});
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
                              position.push({name:strencode(a3.name), lat:a3.lat, lon:a3.lon, id:a3.idp});
                              if(key1===(list.length-1) && key===(a3s.length-1)){
                                socket.emit('S_send_point_import',position);console.log('Da gui tin import đi');
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
          nguoinhans.push({number:nguoi.number, name:strencode(nguoi.name), stt:'N'});
          if(key7===(mess.nguoinhan.length-1)){
            // lưu vào bảng chính của người gửi
            var sql2 = "INSERT INTO `"+socket.number+"mes_main` (idc,subject, send_receive, time,stt) VALUES ?";
            var values2 = [[mess.id, mess.subject,'S',thoigian,'F']];
            con.query(sql2, [values2], function (err, res)
              {
                if ( err){console.log(err);}
                else {
                  io.sockets.in(socket.number).emit('S_get_tinnhan',mess.imei,{ids:res.insertId, subject:strencode(mess.subject),nguoinhan:nguoinhans,idc:mess.id,time:get_time(thoigian),stt:'F'});
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
                                              io.sockets.in(row5.number).emit('S_send_tinnhan',{ids:res5.insertId,name_nguoigui:strencode(socket.username),number_nguoigui:socket.number,
                                                  subject: strencode(mess.subject), id_tinnha_client:mess.id, time:get_time(thoigian),read_1:'N', stt:'F'});


                                          } //het else
                                        });

                                        }
                                      });
                                      // gửi tin nhắn đến máy điện thoại người nhận
                                    }
                                    // nếu tìm trong bảng acccount mà không có tên người nhận thì báo lại là không có ai nhận
                                  else {socket.emit('S_send_mess_no_contact',mess.id, 'khong co contact');}
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
                    list.push({number:a2.number, name:strencode(a2.name),stt:a2.app});
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
    }
  }); //ok

  socket.on('C_save_pos',(mess)=>{

    if(socket.number&&mess.idc&&mess.subject&&mess.vitri&&isArray(mess.vitri)){
      console.log('có luu');
      let thoigian = new Date();
      var sql = "INSERT INTO `"+socket.number+"mes_main` (idc,subject, send_receive, time) VALUES ?";
      var val = [[mess.idc, mess.subject,'H',thoigian]];
      con.query(sql, [val], function (err, res)
        {
          if(err){console.log(err);}
          else {
            io.sockets.in(socket.number).emit('S_get_save_pos',mess.imei,{time:get_time(thoigian),subject:strencode(mess.subject),idc:mess.idc});
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
                      io.sockets.in(nguoigui).emit('C_danhantinnhan',{nguoinhan:socket.number,tennguoinhan:strencode(socket.username), idc:idc});
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
  socket.on('C_send_group',(mess)=>{
    if(socket.number&&mess.id&&mess.name&&mess.contact_list){
      if(isArray(mess.contact_list)){
      socket.emit('S_newgroup_ok');
      var sql = "INSERT INTO `"+socket.number+"mes_main` (idc,subject, send_receive) VALUES ?";
      var values = [[mess.id, mess.name,'P']];
      // P là ký hiệu cho biết đây là group
      con.query(sql, [values], function (err, res)
        {
          if ( err){console.log(err);}
          else {
            var sql4 = "INSERT INTO `"+socket.number+"mes_sender` (ids,number, name, send_receive) VALUES ?";
            mess.contact_list.forEach(function(contact)
              {
                if(contact.contact_number&&contact.contact_name){
                var val4 = [[res.insertId, contact.contact_number, contact.contact_name, 'P']];
                con.query(sql4, [val4], function (err3, res3) {if ( err3){console.log(err3);}});
              }
            });
          }
        });
      }
    }
  });
  socket.on('C_send__edit_group',(mess)=>{
    if(socket.number&&mess.name&&mess.id&&mess.contact_list){
      con.query("UPDATE `"+socket.number+"mes_main` SET `subject` = '"+mess.name+"' WHERE `send_receive` LIKE 'P' AND `idc` LIKE '"+mess.id+"'",function()
      {
        con.query("SELECT * FROM `"+socket.number+"mes_main` WHERE `idc` LIKE '"+mess.id+"'  AND `send_receive` LIKE 'P' LIMIT 1", function(err11, res11)
          {
            if ( err11 || (res11.length ==0) ){console.log(err11);}
            else
              {
                con.query("DELETE FROM `"+socket.number+"mes_sender` WHERE `ids` LIKE '"+res11[0].id+"'  AND `send_receive` LIKE 'P'", function(err12)
                  {
                    if ( err12){console.log(err12);}
                    else {
                      var sql4 = "INSERT INTO `"+socket.number+"mes_sender` (ids,number, name, send_receive) VALUES ?";
                      if(isArray(mess.contact_list)){
                      mess.contact_list.forEach(function(contact)
                        {
                          if(contact.contact_number&&contact.contact_name){
                          var val4 = [[res11[0].id, contact.contact_number, contact.contact_name, 'P']];
                          con.query(sql4, [val4], function (err3, res3) {if ( err3){console.log(err3);}});
                        }
                        });
                      }

                    }
                  });


              }
            });

      });


    }
  });
  socket.on('search_contact', function (string){

    if (socket.number&&string){

    con.query("SELECT `number`, `user` FROM `account` WHERE `number` LIKE CONCAT('%',"+string+",'%')", function(err, a1s){
      if ( err)console.log(err);
      else
      {
        if(a1s.length>0){
          let kq1 = [];
          a1s.forEach((a1,key) => {
            kq1.push({user:strencode(a1.user), number: a1.number});
            if(key===(a1s.length-1))socket.emit('S_kq_check_contact_2',kq1);
          });
        }
        else {socket.emit('S_kq_check_contact_zero_2');}
      }
    });
    }
  });
  socket.on('search_contact3', function (string){

    if (socket.number&&string){

    con.query("SELECT `number`,  LOCATE('"+string+"',number) FROM `account` WHERE LOCATE('"+string+"',number)>0", function(err, a1s){
      if ( err)console.log(err);
      else
      {
        if(a1s.length>0){
          let kq1 = [];
          a1s.forEach((a1,key) => {
            kq1.push({user:strencode(a1.user), number: a1.number});
            if(key===(a1s.length-1))socket.emit('S_kq_check_contact_2',kq1);
          });
        }
        else {
          socket.emit('S_kq_check_contact_zero_2');

        }
      }
    });
    }
  });
  socket.on('C_join_room', function (room){
    if (socket.number&&room){
        socket.emit('S_get_join');
        if(socket.roomabc){
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
                        tin.push({name:strencode(member.name), number:member.number, admin:member.send_receive});
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
                          socket.emit('S_add_contact_ok',{ids:res.insertId, idc:row.idc,name:strencode(row.name),number:row.number});}
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
            io.sockets.in(room.room_fullname).emit('S_pos_online',{lat:info.lat, lon:info.lon, name:strencode(socket.username), number:socket.number});
          }
        });
      }
    }
  });
  socket.on('C_make_room', function (info){
    if (socket.number&&info.room_name&&info.member_list){
      let thoigian = new Date();
      socket.emit('S_get_room');
      // bắt đầu xử lý cái room
      var room_id = passwordHash.generate(info.room_name);
      // Server tạo ra cái room đầy đủ để lưu hành trên hệ thống
      var sql = "INSERT INTO `"+socket.number+"mes_main` (idc, subject, send_receive, time,stt ) VALUES ?";
      var val = [[ room_id, info.room_name,'O', thoigian,'F']];
      con.query(sql, [val], function (err, res)
      {
        if (err){console.log(err);}
        else{
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
                io.sockets.in(socket.number).emit('S_send_room',{ids:res.insertId,room_name:strencode(info.room_name), room_id_server:room_id, admin_name:strencode(socket.username), admin_number:socket.number, time:get_time(thoigian)});
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
                                  io.sockets.in(row.number).emit('S_send_room',{ids:res5.insertId,room_name:strencode(info.room_name), room_id_server:room_id, admin_name:strencode(socket.username), admin_number:socket.number, time:get_time(thoigian),stt:'N'});

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
                    io.sockets.in(socket.roomabc).emit('S_send_member',{ name:strencode(mem.name), number:mem.number});
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
                              io.sockets.in(socket.roomabc).emit('S_send_room',{room_name:strencode(info.room_name), room_id_server:rows[0].idc, admin_name:strencode(socket.username), admin_number:socket.number, time:'N'});
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
