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
            pass: 'vuyeuvan18101988'
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
  connectionLimit: 100
});
var accountSid = 'ACaa41a4ddc473c35c1192aa1a7fd6dab4';
var authToken = '94b2749230e0d3d5b379cf851c0d3c8c';
//require the Twilio module and create a REST client
var client = require('twilio')(accountSid, authToken);
var stt = 0;
function ketnoi(){
  con.connect(function(err) {
    if (err) { console.log(" da co loi:" + err); } else {
      console.log("Da co ket noi ok ha ha ha");
      }});

}
ketnoi();
// con.on('error', function(err) {
//   console.log('ngat ket noi va ket noi lai');
//
//   ketnoi();
//     // con.end(function(){
//     //   console.log('ngat ket noi va ket noi lai');
//     //     ketnoi();
//     //   });
//     });

  // function keep_server(){
  //   console.log('test');
  //
  // }
  // for ( var i=0; i<10; i++){
  //   setTimeout(keep_server, 5000);
  // }

  function waitAndDo() {
  setTimeout(function() {
    con.query("SELECT `number` FROM `account` WHERE `number` LIKE '123'", function(err){if(err){console.log('co loi:'+err);}});
    waitAndDo();
  }, 10000);
}
waitAndDo();


  //con.query("SELECT `number` FROM `account` WHERE `number` LIKE '123'", function(err){if(err){console.log('co loi:'+err);}});
  // con.on('error', function(err) {
  //   con.end(function(){
  //     con.connect(function(err) {
  //       if (err) { console.log(" da co loi roi troi oi:" + err); } else {
  //         console.log("Da co ket noi ok lan 2");
  //       }});
  //
  //   });
  //
  // });

// var del = con._protocol._delegateError;
// con._protocol._delegateError = function(err, sequence){
//   if (err.fatal) {
//     console.trace('loi fatal: ' + err.message);
//   }
//   return del.call(this, err, sequence);
// };

//   function handleDisconnect() {
//       con.connect(function(err) {              // The server is either down
//       if(err) {                                     // or restarting (takes a while sometimes).
//         console.log('error when connecting to db:', err);
//         setTimeout(handleDisconnect, 5000);
//       }   else {
//
//         console.log('Da co ket noi ok ha ha ha');
//         con.on('error', function(err) {
//           console.log('Co loi roi ha ha ha:', err);
//           con.connect(function(err) { if (err){console.log('ket noi loi lan 2');}
// else {
//   console.log('ket noi tot lai lan 2');
// }
//         });
//           if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
//             setTimeout(handleDisconnect, 5000);
//             console.log('Ket noi da khoi dong lai:');                       // lost due to either server restart, or a
//           } else {
//             console.log('Ket noi bi loi 1');                                // connnection idle timeout (the wait_timeout
//             throw err;                                  // server variable configures this)
//           }
//         });
//       }                                  // to avoid a hot loop, and to allow our node script to
//     });                                     // process asynchronous requests in the meantime.
//                                             // If you're also serving http, display a 503 error.
//
//   }
// handleDisconnect();


io.on('connection', function (socket)
{
  console.log('Da co ket noi moi '+socket.id);
  socket.emit('check_pass', function(){console.log('Da day su kien check di')});
  socket.on('disconnect', function(){ console.log('user da disconnect')});
  // lắng nghe sự kiện đăng ký tài khoản mới
  socket.on('regis', function (user_info){
		    console.log("User want to regis with account: "+ user_info.number);
        // Tìn tronbg db danh sách các tài khoản có number như number đăng ký không
		      con.query("SELECT * FROM `account` WHERE `number` LIKE '"+ user_info.number +"'", function(err, rows){
              // nếu tài khoản đã có người đăng ký rồi thì:
              if (rows.length >0 )	{
        	 	       socket.emit('regis_already_account',{number:user_info.number} );
        	 	       console.log("Da ton tai user nay");
        	      }

              else {
                // Tiếp tục tìm trong db đang chờ acitve
                //  con.query("SELECT * FROM customers", function (err, result, fields) {
                con.query("SELECT * FROM `active_account` WHERE `number` LIKE '"+ user_info.number +"'", function(err, row1s) {
					          if (row1s.length >0 ){
        	 			       socket.emit('regis_wait_acitve', {number:user_info.number});
        	 			       console.log("Da ton tai user dang cho active");
                         // tính toán thời gian còn lại cho việc actvie
        			         }
            			  else {   //nếu user không có trong account lẫn active account thì ok, do it now
				              //xuất ra chuỗi ngẫu nhiên để kích hoạt, gửi trả lại cho app và lưu vào hệ thống
                      var string = Math.floor(Math.random() * (89998)) + 10001;
                      // fs.writeFile(num+".png",img, (err, result)=>console.log(result));
                      var sql = "INSERT INTO `active_account` (number,user, pass, string ,code ) VALUES ?";
                      var values = [[user_info.number, user_info.user,user_info.pass,string, user_info.code]];
                      con.query(sql, [values], function(err, result) {
                      socket.emit('regis_ok_1', {number: user_info.number, code: user_info.code, pass: user_info.pass},function(){console.log('Da gui su kien regis ok')});
                              // client.messages.create({
                              //     to: "+84982025401",
                              //     from: "+17323875504",
                              //     body: string,
                              // }, function(err, message) {
                              //     console.log(err);
                              // });
                              });

					                       }//end else 2
				                           });//end db.acive account
        	                        } //end else 1
   		      });//end db.account
	  }); //end socket.on.regis
  // lắng nghe sự kiện xác nhận tài khoản
  socket.on('active', function (active_info){
  		console.log("Chuoi so da nhan duoc"+ active_info.string);
      console.log(active_info.number);
      con.query("SELECT * FROM `active_account` WHERE `number` LIKE '"+ active_info.number +"'", function(err, rows)
  		  {
          if (rows.length==0){ socket.emit('active_no_number', {mail:active_info.number});}
          else
            {
              if (rows[0].string == active_info.string & rows[0].pass==active_info.pass)
                {
                  console.log('Active thành công');
                  //active thành công, trả thông tin người dùng về lại cho khách hàng
                  // TẠO RA CACS BẢNG THÔNG TIN CHO NGƯỜI DÙNG
                  // 1. Bảng chính: lưu id của bản tin đó trên server, id của người dùng, tên tin nhắn, tin nhắn gửi đi hay tin nhắn nhận về, trạng thái gửi đi hay nhận về.
                  con.query("CREATE TABLE IF NOT EXISTS  `"+active_info.number+"mes_main` (`id` INT NOT NULL AUTO_INCREMENT,`idc` CHAR(25) NOT NULL, `subject` VARCHAR(20) NOT NULL,`send_receive` VARCHAR(5) NOT NULL,`stt` VARCHAR(5) NULL,PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC))", function(err){console.log(err)});
                  //2. Bảng địa điểm: lưu id bản tin đó trên server, tên điểm, tọa độ điểm
                  con.query("CREATE TABLE IF NOT EXISTS `"+active_info.number+"mes_detail` (`id` INT NOT NULL AUTO_INCREMENT,`ids` INT NOT NULL,`name` VARCHAR(45) NOT NULL,`lat` DOUBLE NULL,`lon` DOUBLE NULL,PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC))", function(err){console.log(err)});
                  //3. Bảng  thông tin người gửi hoặc nhận: gồm number, tên, là người gửi hay nhận, trạng thái nhận hay gửi được chưa
                  con.query("CREATE TABLE IF NOT EXISTS `"+active_info.number+"mes_sender` (`id` INT NOT NULL AUTO_INCREMENT,`ids` INT NOT NULL,`number` VARCHAR(20) NOT NULL,`name` VARCHAR(45) NULL,`send_receive` VARCHAR(5), `stt` VARCHAR(5) NULL,PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC))", function(err){console.log(err)});
                  con.query("CREATE TABLE IF NOT EXISTS `"+active_info.number+"contact` (`id` INT NOT NULL AUTO_INCREMENT,`number` VARCHAR(20) NOT NULL,`name` VARCHAR(45) NOT NULL,`fr` VARCHAR(5) NULL,`code` VARCHAR(10) NULL,PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC))", function(err){console.log(err)});
                  con.query("SELECT number FROM `account` ", function(err, row3s)
                    {
                      if (err) {console.log('select loi '+ err);}
                      else if ( row3s.length >0)
                        {
                          row3s.forEach(function (row3)
                            {
                              con.query("SELECT * FROM `"+row3.number+"contact` WHERE `number` LIKE '"+active_info.number+"'", function(err, row4s)
                                {
                                  console.log('bang '+row3.number + ' so dien thoai la:'+active_info.number);
                                  if ( err) {console.log('có loi select');}
                                  else if (row4s.length >0)
                                    {
                                      console.log('da select '+row3.number+' '+active_info.number);
                                      con.query("UPDATE `"+row3.number+"contact` SET `fr` = 'Y' WHERE `number` LIKE '"+active_info.number+"'",function(err3, ok)
                                      {
                                        //gửi thông báo cho ngươi kia biết là ông này đã tham gia ePos
                                        if ( err3 ){console.log('update bị loi'+err3);}
                                        else
                                          {
                                            console.log('updat thanh cong' + ok);
                                            io.sockets.in(row3.number).emit('contact_joined', {number:rows[0].number,name:rows[0].user, code:rows[0].code});
                                          }
                                      });
                                    }
                                });
                            });
                        }

                    });
                  // lưu tài khoản vào db
                  var sql = "INSERT INTO `account` (number,user, pass, code ) VALUES ?";
                  var values = [[rows[0].number,rows[0].user, rows[0].pass, rows[0].code]];
                  con.query(sql, [values], function (err, result) {if ( err){console.log(err);}});
                  // xóa bản tin trong bảng active đi, coi như quá trình active hoàn tất
                  console.log('sẽ xóa bản tin active có number như sau:'+active_info.number);
                  con.query("DELETE FROM `active_account` WHERE `number` LIKE '"+active_info.number+"'", function(err){
                    if ( err){console.log('loi delete'+err);  }
                    else {
                      console.log('Da xoa ok');
                      socket.emit('acive_success');
                      // socket.emit('acive_success', {number:rows[0].number, user: rows[0].user, code:rows[0].code});

                    }


                });
                }
            }

        });
      });
  socket.on('fisrtlogin',function(user1, pass1){console.log('Da dang nhap bang ten:'+user1);
    //  nếu đăng nhập đúng thì phát sự kiện để app chuyển sang giao diện main
    con.query("SELECT * FROM `account` WHERE `number` LIKE '"+user1+"' AND pass LIKE '"+ pass1+"'", function(err, rows){
	    console.log(rows.length);
      if (rows.length ==0){
        // Nếu đăng nhập sai
        socket.emit('firscheckwrong');
        console.log("Dang nhap first khong dung"+user1);
        }
			else{
        //Nếu đăng nhập đúng
        socket.emit('okfirstlogin',{number:user1, pass:pass1, name:rows[0].user});
        console.log('Dang nhap dung voi ten:'+rows[0].user);
        // bắt đầu kiểm tra các thông tin cần gửi cho user này đang được lưu trên db
        // đầu tiên là các room gửi cho user
        // tìm trong db xem các room chưa được gửi cho user
        }
   	  });
	  });
  socket.on('mainlogin', function(user, pass){
    console.log("Da nhan user "+ user);
    // kiểm tra
    con.query("SELECT * FROM `account` WHERE `number` LIKE '"+user+"' AND `pass` LIKE '"+ pass+"'", function(err, rows){
        console.log('so luong row giong la:'+rows.length);
        if (rows.length ==0){
          // Nếu đăng nhập sai
          socket.emit('main_login_wrong');
          console.log("Dang nhap second khong dung"+user);
          }
        else{
          //Nếu đăng nhập đúng
          socket.join(user);
          console.log('Dang nhap dung roi voi tai khoan' + user);
          // kiểm tra xem contact có ai mới tham gia ePOS không
          con.query("SELECT * FROM `"+user+"contact` WHERE `fr` LIKE 'N'", function(err, rows2){
            if ( err){console.log('co loi select user contact: '+err);}
            else if ( rows2.length>0){
              rows2.forEach(function(row2){
                socket.emit('contact_joined', {number:row2.number,name:row2.name, code:row2.code});
                });
            }
            else {console.log('khong co contact nao tham gia ca');}
            });
          // kiểm tra xem có ai gửi tin nhắn cho không
          con.query("SELECT * FROM `"+user+"mes_main` WHERE `send_receive` LIKE 'R' AND `stt` LIKE 'N'", function(err, a1s)
              {
              if ( err ){console.log(err);}
              else if ( a1s.length>0)
                {
                  console.log(a1s);
                  a1s.forEach(function(a1)
                  {
                  //lấy tên người gửi
                    con.query("SELECT * FROM `"+user+"mes_sender` WHERE `send_receive` LIKE 'R' AND `ids` LIKE '"+a1.id+"'", function(err, a2s)
                    {
                      if ( err ){console.log(err);}
                      else if (a2s.length>0)
                      {
                        //lấy danh sách các điểm
                        con.query("SELECT * FROM `"+user+"mes_detail` WHERE `ids` LIKE '"+a1.id+"'", function(err, a3s)
                        {
                          if ( err ){console.log(err);}
                          else  if ( a3s.length >0)
                            {
                            var pos3 = [];
                            var pos2;
                            a3s.forEach(function(a3)
                            {
                               pos2 = {name:a3.name, lat:a3.lat, lon:a3.lon};
                               pos3.push(pos2);
                              });
                            socket.emit('S_guitinnhan',{ name_nguoigui:a2s[0].name,number_nguoigui:a2s[0].number,
                               subject: a1.subject, pos: pos3, id_tinnha_client:a1.idc});
                          }
                        });
                      }
                    });
                  });

                }
          });
            //kiểm tra xem có ai đã nhận tin nhắn rồi không
          con.query("SELECT * FROM `"+user+"mes_main` WHERE `send_receive` LIKE 'S' AND `stt` LIKE 'Y'", function(err, a4S)
              {
            if ( err){console.log(err);}
            else if ( a4S.length>0)
              {

                a4S.forEach(function(a4)
                  {
                  //socket.emit('C_danhantinnhan',{nguoinhan_number:a4s.nguoinhan_number, idc:a4s.idc, ids:a4s.ids});
                  con.query("SELECT * FROM `"+user+"mes_sender` WHERE `send_receive` LIKE 'S' AND `ids` LIKE '"+a4.id+"'", function(err, a5s)
                  {
                    socket.emit('C_danhantinnhan',{nguoinhan_number:a5s[0], idc:a4.idc});
                    console.log('Da gui sự kiện C_gui tin nhan di cho cac so:'+a5s[0].name);
                  });
                });
              }
          });
          // kiểm tra xem có room nào gửi không
          con.query("SELECT * FROM `"+user+"mes_main` WHERE `send_receive` LIKE 'O' AND `stt` LIKE 'N'", function(err, a1s)
            {
              if ( err){console.log(err);}
              else if ( a1s.length>0)
                {
                var ad_num,ad_name;
                a1s.forEach(function(a1)
                  {
                    //lấy tên người gửi và tên người tham gia room
                    console.log('room chua gui: '+a1.subject);
                    con.query("SELECT * FROM `"+user+"mes_sender` WHERE `ids` LIKE '"+a1.id+"'", function(err, a2s)
                  {
                      if (err){console.log(err);}
                      else
                      {
                        console.log('Da chon 2 thanh cong' + a2s.length);

                          var list = [];
                          var mem;
                          a2s.forEach(function(a2)
                            {
                              if (a2.send_receive == 'O')
                                {
                                  // nếu là O thì đây là danh sách thành viên tham gia
                                  mem = {name:a2.name, number:a2.number};
                                  list.push(mem);
                                  console.log('Thanh vien la:'+a2.name);
                                }
                              else
                              // còn không thì đây là tên admin của room
                            { ad_num = a2.number; ad_name = a2.name;
                              console.log('admin la:'+a2.number);

                            }
                          });
                        socket.emit('S_send_room',{admin_name:ad_name, admin_number:ad_num, room_name: a1.subject,room_fullname: a1.idc, member_list: list });
                        console.log('Da gui room di '+ad_name);
                    }
                    });
                  });
              }
          });
          }
      });
	});//hết phần socket.on mainlogin
  socket.on('C_gui_tinnhan', function(mess){
    console.log(mess);
    socket.emit('S_get_tinnhan',mess.id);
    //let id =new Date().getTime();
    // lưu vào bảng chính của người gửi
    var sql2 = "INSERT INTO `"+mess.nguoigui_number+"mes_main` (idc,subject, send_receive, stt) VALUES ?";
    var values2 = [[mess.id, mess.subject,'S', 'N']];
    con.query(sql2, [values2], function (err, res)
      {
        if ( err){console.log(err);}
        else {
              console.log('Da luu voi id:'+ mess.id);
                // lưu vào bảng vị trí của người gửi
                var sql3 = "INSERT INTO `"+mess.nguoigui_number+"mes_detail` (ids,name, lat, lon) VALUES ?";
                mess.pos.forEach(function(row)
                  {
                    var val = [[res.insertId, row.name, row.lat, row.lon]];
                    con.query(sql3, [val], function (err, res2) {if ( err){console.log(err);}});
                  });
                  // lưu vào bảng người nhận của người gửi
                var sql4 = "INSERT INTO `"+mess.nguoigui_number+"mes_sender` (ids,number, name, send_receive, stt) VALUES ?";
                mess.nguoinhan.forEach(function(row5)
                  {
                    var val4 = [[res.insertId, row5.number, row5.name, 'S', 'N']];
                    con.query(sql4, [val4], function (err, res3) {if ( err){console.log(err);}});
                    con.query("SELECT * FROM `account` WHERE `number` LIKE '"+ row5.number +"'", function(err, res)
                      {
                        if ( err ){console.log(err);}
                        else if(res.length >0)
                          {
                              // lưu vào bảng chính của người nhận
                              var sql5= "INSERT INTO `"+row5.number+"mes_main` (idc,subject, send_receive, stt) VALUES ?";
                              var val5 = [[mess.id, mess.subject,'R','N']];
                              con.query(sql5, [val5], function (err, res5)
                              {
                                if ( err){console.log(err);}
                                else
                                {
                                  //lưu vào bảng người gửi của người nhận
                                  var sql6 = "INSERT INTO `"+row5.number+"mes_sender` (ids,number, name, send_receive, stt) VALUES ?";
                                  var val6 = [[ res5.insertId, mess.nguoigui_number,mess.nguoigui_name,'R', 'N']];
                                  con.query(sql6, [val6], function (err, res6) {if ( err){console.log(err);}});
                                  // lưu vào bảng vị trí điểm của người nhận
                                  mess.pos.forEach(function(row3){
                                      // lưu vào bảng vị trí của người nhan
                                      var sql7 = "INSERT INTO `"+row5.number+"mes_detail` (ids,name, lat, lon) VALUES ?";
                                      var val7 = [[res5.insertId, row3.name, row3.lat, row3.lon]];
                                      con.query(sql7, [val7], function (err, result) {if ( err){console.log(err);}});
                                    });
                                    io.sockets.in(row5.number).emit('S_guitinnhan',{ name_nguoigui:mess.nguoigui_name,number_nguoigui:mess.nguoigui_number,
                                      subject: mess.subject, pos: mess.pos, id_tinnha_client:mess.id});

                                }
                              });
                              // gửi tin nhắn đến máy điện thoại người nhận
                            }
                            // nếu tìm trong bảng acccount mà không có tên người nhận thì báo lại là không có ai nhận
                          else {
                            socket.emit('S_send_mess_no_contact',mess.id, 'khong co contact');
                            console.log('contact khong ton tai');
                          }
                        });
                    });


          }
      });
    }); // end socket.on('sendmess', function(test)
  socket.on('danhantinnhan', function (nguoinhan, nguoigui, idc)
   	{
		console.log("user:" + nguoinhan+" đã nhan tin nhan:" + idc+ " tu nguoi gui;"+ nguoigui);
    //chuyển trạng thái trong db thành người nhận đã đọc được tin, báo về cho người gửi biết
    con.query("UPDATE `"+nguoinhan+"mes_main` SET `stt` = 'Y' WHERE `send_receive` LIKE 'R' AND `idc` LIKE '"+idc+"'",function(){
      console.log('ma san pham la '+idc);
      //  io.sockets.in(nguoigui).emit('C_danhantinnhan',{nguoinhan_number:nguoinhan, idc:idc});
    });
    //trạng thái Y cho biết tin nhắn đã đến tay người nhận, người gửi hãy cập nhật màu sắc  trên bảng tin đi
    con.query("UPDATE `"+nguoigui+"mes_main` SET `stt` = 'Y' WHERE ``send_receive LIKE 'S' AND `idc` LIKE '"+idc+"'",function(){
      console.log('ma san pham la '+idc);
      io.sockets.in(nguoigui).emit('C_danhantinnhan',{nguoinhan_number:nguoinhan, idc:idc});
    });
  });
  // khi người gửi biết rằng khách đã nhận được tin, chuyển màu sắc người nhận trong mục send sang đỏ và báo lại
  // server, kết thúc phần gửi tin cho khách hàng đó
  socket.on('tinnhan_final', function (nguoigui, id){
		console.log('Da nhan tin nhieu final');
    con.query("UPDATE `"+nguoigui+"mes_main` SET `stt` = 'K' WHERE `send_receive` LIKE 'S' AND `idc` LIKE '"+id+"'",function(){
        console.log('ma san pham final la '+id);
      });
		//	kết thúc quá trình gửi tin nhắn
  	});
  //CREATE  TABLE  IF NOT EXISTS "main"."abc" ("id" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL  UNIQUE , "name1" VARCHAR, "name 2" VARCHAR)
  socket.on('search_contact', function (string){
    console.log("Chuoi nhan duoc la:"+string);
    con.query("SELECT `number`, `user` FROM `account`", function(err, a1){
      if (!( err))
      {
        var s=true;;
        a1.forEach(function (row1)
          {
            if (row1.number.indexOf(string) !== -1 )
            {
              socket.emit('S_kq_check_contact_2',{user:row1.user, number: row1.number});console.log("Da tim thay:"+row1.user);
              s=false;
            }
          });
        if (s){socket.emit('S_kq_check_contact_zero_2');}
      }
    });

  });
  socket.on('C_check_contact', function (string){
    console.log("Chuoi nhan duoc la:"+string);
    con.query("SELECT `number`, `user` FROM `account`", function(err, a1){
      if (!( err))
      {
        var s=true;;
        a1.forEach(function (row1)
          {
            if (row1.number.indexOf(string) !== -1 )
            {
              socket.emit('S_kq_check_contact',{user:row1.user, number: row1.number});console.log("Da tim thay:"+row1.user);
              s=false;
            }
          });
        if (s){socket.emit('S_kq_check_contact_zero');}

      }
    });

  });
  socket.on('C_join_room', function (room)  {
    socket.join(room);
    console.log('da join user vao room '+ room);

  });
  socket.on('C_leave_room', function (room) {
      socket.leave(room);
      console.log('Da leave user khoi room: '+room);

    });
  socket.on('C_leave_off',function(number){
      socket.leave(number);
      socket.emit('S_ok_log_off');//server đồng ý cho Client log off
    });
    //sự kiến check_contact xảy ra khi người dùng được thông báo acitve thành công, app sẽ lấy  toàn bộ danh sách
    // để gửi lên server để server lưu và kiểm tra xe liệu trong đó có ai đã tham gia ePos rồi chưa
  socket.on('check_contact', function (arr_contact){
    //người dùng mới đăng nhập và sẽ gửi lên một đống cái contact, lúc này
    //server không gửi trả về từng contact mà gửi chung cả cụm.
    var mang_contact = [];
    var contact = {name : "", number : "", code: ""};
    var sql = "INSERT INTO `"+arr_contact.hostnumber+"contact` (number, name, fr, code) VALUES ?";
    //từng contact một, cái nào đã có trong account rồi thì lưu dưới fr = Y và gửi thông báo cáo account đó biết
    // chưa thì lưu = N
    arr_contact.contact.forEach(function(row){
      con.query("SELECT `number` FROM `account` WHERE `number` LIKE '"+ row.number +"'", function(err, row1s){
        if ( err){console.log('select check_contact bị loi '+err);}
        else {
          if (row1s.length >0){
            // nếu sđt đó có trong accout thì lưu là Y và đưa sđt đó vào JSON contact để gửi trả về báo cho người dùng
            // biết là số điện thoại đó đã tham gia.
            var val = [[ row.number, row.name,"Y",row.code]];
            con.query(sql, [val], function (err, result) {if ( err)console.log(err);});
            contact = {name : row.name, number : row.number, code: row.code};
            mang_contact.push(contact);
          }
          else {
            var val = [[row.number, row.name,"N",row.code]];
            con.query(sql, [val], function (err, result) {if ( err)console.log(err);});
          }
        }
      });
      socket.emit('first_contact_joined', mang_contact);
    });//arr_contact.contact.forEach
    });//check_contact
  socket.on('C_got_friend', function (host, number){
    console.log(host+" " + number);
    con.query("DELETE FROM `"+host+"contact` WHERE `number` LIKE '"+number+"'", function(err){console.log('loi delete'+err)});
    con.query("UPDATE `"+host+"contact` SET `fr` = 'OK' WHERE number LIKE '"+number+"'",function(err3, ok){ console.log('loi update'+err)});
  });
  socket.on('C_pos_online', function (info){
    console.log('Da nhan diem');
    if ( info != null){
      for (var j=0; j<info.room.length; j++)
        {
          io.sockets.in(info.room[j].room_fullname).emit('S_pos_online',{lat:info.lat, lon:info.lon, name:info.user_name, number:info.user_number});
          console.log(info.lat + 'da gui cho '+info.room[j].room_fullname + 'AAAAA' + (stt++) + "ten la:"+ info.user_name );
        }
    }
    else { console.log(info);}
  });
  socket.on('C_make_room', function (info)
   	{
      var n=0;
      console.log('Da nhan room moi tu ứng dụng '+info.admin_name);
      //trả lời cho ngời gửi biết server đã nhận được room
      socket.emit('S_get_room', {room: info.fullname});
      // bắt đầu quá trình lưu room vào csdl
      if (info.member_list.length >0)
      {
        info.member_list.forEach(function(row){
          con.query("SELECT * FROM `"+row.number+"mes_main` WHERE `idc` LIKE '"+ info.fullname +"'", function(err, rows)
            {
              console.log('So luong ban tin giong la:'+rows.length);
              if(err){console.log(err);}
              else
               {
                  if ( rows.length<=0){
                    var sql = "INSERT INTO `"+row.number+"mes_main` (idc, subject, send_receive, stt ) VALUES ?";
                    var val = [[ info.room_fullname, info.room_name,'O', 'N']];
                    con.query(sql, [val], function (err, res)
                    {
                      if ( err){console.log(err);}
                      else
                      {
                        n=n+1;
                        console.log('Da dua vao main thanh  cong lan:'+n);
                        var sql2 = "INSERT INTO `"+row.number+"mes_sender` (ids, number, name, send_receive ) VALUES ?";
                        info.member_list.forEach(function(row2)
                        {
                          if (row2.number ==info.admin_number) {
                            var val2 = [[res.insertId,row2.number,row2.name,'OM']];
                            con.query(sql2, [val2], function (err) {if ( err){console.log(err);}
                            else {
                              console.log('da insert 1');
                            }
                          });
                          }
                          else {
                            var val2 = [[res.insertId,row2.number,row2.name,'O']];
                            con.query(sql2, [val2], function (err) {if ( err){console.log(err);}
                            else {
                              console.log('da insert 2');
                            }

                          });

                          }

                        });
                          io.sockets.in(row.number).emit('S_send_room',info);
                          console.log('Da gui room di lan:');
                    }
                  });



                  }
               }

            });

        });

      }
   	});
  socket.on('C_get_room', function(info){
    con.query("UPDATE `"+info.number+"mes_main` SET `stt` = 'OK' WHERE send_receive LIKE 'O' AND idc LIKE '"+info.fullname+"'",function(err){
      if ( err){console.log(err);}
    });

  });
});
