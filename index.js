var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
server.listen(process.env.PORT || 3000, function(){console.log("server start")});
var nodemailer = require('nodemailer');
let CheckMobi = require('omrs-checkmobi');
var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'vu2551984@gmail.com',
            pass: '123'
        }
    });


var mysql = require('mysql');
var con = mysql.createConnection({
  host: "us-cdbr-iron-east-05.cleardb.net",
  user: "b04c2ff40d4e13",
  password: "0fdaedd4",
 database : "heroku_7790b5956b2a5c2",
 queueLimit: 30,
  acquireTimeout: 1000000,
});

var passwordHash = require('password-hash');
// var ketqua = passwordHash.verify('vuyeuvan', pass);
let cb = new CheckMobi('BECCEBC1-DB76-4EE7-B475-29FCF807849C');
// cb.phoneInformation('+84982025401', (error, response) => {
//       if(error){console.error();}
//       else {
//         console.log(response);
//       }
// });

var bodyParser = require('body-parser');

var urlencodedParser = bodyParser.urlencoded({ extended: false })
  con.connect(function(err) {
    if (err) { console.log(" da co loi:" + err); }
    else {
      console.log("Da co ket noi ok ha ha ha");
      app.set('view engine', 'ejs');
      app.set('views', './views');
      app.use(express.static('public'));
      app.get('/', (req, res) => res.render('dangnhap'));
        app.post('/', urlencodedParser, function (req, res) {
        if (!req.body) return res.sendStatus(400)
        else {
        var full_number = "+"+req.body.code + req.body.number.replace('0','');
        console.log(full_number);
        con.query("SELECT * FROM `account` WHERE `number` LIKE '"+full_number+"' AND `pass` LIKE '"+req.body.pass+"' LIMIT 1", function(err, rows){
          if (err || rows.length ==0){
            res.send("Dang nhap khong dung");
            console.log("Dang nhap first khong dung"+req.body.number);
            }
          else{
            // vào CSDL lấy dữ liệu của username này ra
            // một là mục inbox: hiển thị số tin mới chưa chuyển đến điện thoại,nội dung của inbox
            // khi nhấp chuột vào sẽ hiện ra 10 tin đầu tiên theo thời gian, bên dưới cùng là hiển thị thêm.
          // với mục contact thì hiển thị ra banj mới tham gia.
          // các mục đều hiển thị 10 mục đầu tiên.
          //các mục này không có sẵn mà khi nhập vào thì mới load trên server về.
        // đồng thời gán cái name cho cái socket đó là tên người dùng.

        con.query("SELECT * FROM `"+full_number+"mes_main` WHERE `send_receive` LIKE 'R'", function(err, a1s)
            {
            if ( err ){console.log(err);}
            else
              {
                con.query("SELECT * FROM `"+full_number+"mes_main` WHERE `send_receive` LIKE 'S'", function(err2, a2s)
                    {
                    if ( err2 ){console.log(err2);}
                    else
                      {
                        con.query("SELECT * FROM `"+full_number+"mes_main` WHERE `send_receive` LIKE 'O'", function(err3, a3s)
                            {
                            if ( err3){console.log(err3);}
                            else
                              {
                                con.query("SELECT * FROM `"+full_number+"contact` WHERE `fr` LIKE 'Y'", function(err4, a4s)
                                    {
                                    if ( err4 ){console.log(err4);}
                                    else{
                                        res.render('home2', {inbox:a1s, send:a2s, online:a3s,contact:a4s, number:full_number, name:rows[0].user, pass:req.body.pass });
                                        console.log('Da render xong' +a4s.length);
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
    }
})
function strencode( data ) {
    return unescape( encodeURIComponent( data ) );
  }
function strdecode( data ) {
  return JSON.parse( decodeURIComponent( escape ( data ) ) );
}
function kiemtra_taikhoan(){
  setTimeout(function() {
    //sau mỗi phút, kiêm tra db và xóa các bản tin đã quá 10 phút ==600 giây
    var date2 = Math.floor(Date.now() / 1000) - 600;
    // mở khóa cho số điện thoại hoặc phoneid bị khóa
    con.query(" DELETE FROM `danhsachkhoa` WHERE `date` < "+date2, function(err){if(err){console.log('co loi HA HA HA:'+err);}});
    // xóa giá trị cho chuỗi số vừa tạo ra
    con.query(" DELETE FROM `xacthuc` WHERE `date` < "+date2, function(err){if(err){console.log('co loi HA HA HA:'+err);}});
        // nếu tài khoản đã có người đăng ký rồi thì:
  kiemtra_taikhoan();
}, 5000);
}
kiemtra_taikhoan();
var ngay= new Date().getTime();
console.log(ngay);

io.on('connection',  (socket)=>
{
  console.log('Da co ket noi moi '+socket.id);
  socket.on('w_get_inbox', function(data, number){
     console.log("Da nhan number");
    con.query("SELECT * FROM `"+number+"mes_main` WHERE `send_receive` LIKE 'R' AND `idc` LIKE '"+data+"' LIMIT 1", function(err, a1s)
         {
         if ( err || ( a1s.length == 0) ){console.log('5'+err);}
         else
           {
             con.query("SELECT * FROM `"+number+"mes_sender` WHERE `send_receive` LIKE 'R' AND `ids` LIKE '"+a1s[0].id+"'", function(err2, a2s)
                 {
                 if ( err2 || ( a2s.length == 0) ){console.log('2'+err2);}
                 else
                   {
                     console.log("Da chọn");
                     con.query("SELECT * FROM `"+number+"mes_detail` WHERE `ids` LIKE '"+a1s[0].id+"'", function(err3, a3s)
                         {
                         if ( err3 || ( a3s.length == 0) ){console.log('3'+err3);}
                         else
                           {
                             let diems =[];
                             let diem = {lat:0.0, lon:0.0};
                             a3s.forEach((a3)=>{
                               diem = {lat:a3.lat, lon:a3.lon, name:a3.name}
                               diems.push(diem);
                             });
                            socket.emit('S_send_inbox', {subject:a1s[0].subject, point:diems, nguoigui:a2s[0].name});
                            console.log('nguoi gui là:'+a2s[0].name);
                           }
                         });
                   }
                 });
           }
         });
   });
  socket.emit('check_pass');
  socket.on('disconnect', function(){ console.log('user da disconnect:'+socket.user_name)});
  socket.on('regis1', function(idphone,num){
    console.log('so dien thoai:'+num);
    con.query("SELECT * FROM `account` WHERE `number` LIKE '"+ num +"'", function(err, rows){
        // nếu tài khoản đã có người đăng ký rồi thì:
      if(err){console.log(err);}
      else {
        if (rows.length >0 )	{
             socket.emit('regis_already_account',{number:num} );
             console.log("Da ton tai user nay");
          }
          else {
              con.query("SELECT * FROM `danhsachkhoa` WHERE `number` LIKE '"+ num +"' OR `phoneid` LIKE '"+idphone+"' LIMIT 1", function(err4, rows4){
                if(err4){console.log(err4);}
                else {
                  if(rows4.length >0){socket.emit('regis1_quasolan_number');}
                  else {
                    cb.phoneInformation('+84982025401', (error, response) => {
                        if(error){console.log(error); socket.emit('sodienthoaikhongdung');}
                        else {
                          console.log(response);
                          socket.emit('send_string_ok');// để Client chuyển sang giao diện chờ nhập chuỗi
                          var date = Math.floor(Date.now() / 1000);
                          var string = Math.floor(Math.random() * (89998)) + 10001;
                          //kiểm tra xem bảng xác thực đã có số điện thoại đó chưa, nếu có rồi thì update, nếu chưa có thì thêm mới
                          con.query("SELECT * FROM `xacthuc` WHERE `number` LIKE '"+ num +"'", function(err6, rows6){
                            if(err6){console.log(err6);}
                            else {
                                // cho phép đăng ký liên tục 3 lần, nếu là lần đầu
                              if(rows6.length==0){
                                  console.log('xac thuc moi');
                                var sql = "INSERT INTO `xacthuc` (number,chuoi,phoneid,date,status) VALUES ?";
                                var values = [[num, string,idphone,date,'Y']];
                                con.query(sql, [values], function(err, result){
                                  if(err){console.log(err);}
                                  else {
                                  con.query("SELECT * FROM `xacthuc` WHERE `phoneid` LIKE '"+ idphone +"'", function(err9, rows9){

                                    if(rows9.length >=3){
                                      console.log('da insert khoa idphone');
                                      var sql = "INSERT INTO `danhsachkhoa` (phoneid,date) VALUES ?";
                                      var values = [[idphone,date]];
                                      con.query(sql, [values], function(err, result){ if(err)console.log(err);});
                                    }
                                  });
                                }
                                });
                            }
                                // còn nếu trước đó đã có rồi
                              else {
                                console.log('update xac thuc');
                                con.query("UPDATE `xacthuc` SET `status` = 'N' WHERE `number` LIKE '"+num+"'",function(){
                                    //sau khi update rồi thì insert vào
                                    var sql = "INSERT INTO `xacthuc` (number,chuoi,phoneid,date,status) VALUES ?";
                                    var values = [[num, string,idphone,date,'Y']];
                                    con.query(sql, [values], function(err, result){
                                      con.query("SELECT * FROM `xacthuc` WHERE `number` LIKE '"+ num +"'", function(err9, rows9){
                                        console.log('ket qua:'+rows9);
                                        if(rows9.length >=3){
                                          var sql = "INSERT INTO `danhsachkhoa` (number,date) VALUES ?";
                                          var values = [[num, date]];
                                          con.query(sql, [values], function(err, result){ if(err)console.log(err);});
                                        }
                                      });
                                      con.query("SELECT * FROM `xacthuc` WHERE `phoneid` LIKE '"+ idphone +"'", function(err10, rows10){
                                        console.log('ket qua:'+rows10);
                                        if(rows10.length >=3){
                                          var sql = "INSERT INTO `danhsachkhoa` (phoneid,date) VALUES ?";
                                          var values = [[idphone,date]];
                                          con.query(sql, [values], function(err, result){ if(err)console.log(err);});
                                        }
                                      });
                                    });



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
        });
  });
  // lắng nghe sự kiện đăng ký tài khoản mới
  socket.on('regis', function (user_info){
		    console.log("User want to regis with account: "+ user_info.number);
        // Tìn tronbg db danh sách các tài khoản có number như number đăng ký không
		      con.query("SELECT * FROM `account` WHERE `number` LIKE '"+ user_info.number +"'", function(err, rows){
              // nếu tài khoản đã có người đăng ký rồi thì:
            if(err){console.log(err);}
            else {
              if (rows.length >0 )	{
        	 	       socket.emit('regis_already_account',{number:user_info.number} );
        	 	       console.log("Da ton tai user nay");
        	      }

              else {
                // Tìm xem liệu số điện thoại đó có đúng là của người đó không
                con.query("SELECT * FROM `xacthuc` WHERE `number` LIKE '"+ user_info.number +"' AND `chuoi`LIKE '"+user_info.string+"' AND `status` LIKE 'Y'", function(err1, row1s) {
					     		  if((err1)|| (row1s.length==0)) {
                      socket.emit('chuoi_ko_dung');
                    }
                    else {

                      // nếu số điện thoại và mã xác nhận khớp nhau
                      console.log('Đăng ký thành công');
                      //active thành công, trả thông tin người dùng về lại cho khách hàng
                      // TẠO RA CACS BẢNG THÔNG TIN CHO NGƯỜI DÙNG
                      // 1. Bảng chính: lưu id của bản tin đó trên server, id của người dùng, tên tin nhắn, tin nhắn gửi đi hay tin nhắn nhận về, trạng thái gửi đi hay nhận về.
                      con.query("CREATE TABLE IF NOT EXISTS  `"+user_info.number+"mes_main` (`id` INT NOT NULL AUTO_INCREMENT,`idc` CHAR(60) NOT NULL, `subject` VARCHAR(20) NOT NULL,`send_receive` VARCHAR(5) NOT NULL,`stt` VARCHAR(5) NULL , `read_1` CHAR(3), `time` CHAR(20), PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC))", function(err){console.log(err)});
                      //2. Bảng địa điểm: lưu id bản tin đó trên server, tên điểm, tọa độ điểm
                      con.query("CREATE TABLE IF NOT EXISTS `"+user_info.number+"mes_detail` (`id` INT NOT NULL AUTO_INCREMENT,`ids` INT NOT NULL,`idp` CHAR(20) NOT NULL,`name` VARCHAR(45) NOT NULL,`lat` DOUBLE NULL,`lon` DOUBLE NULL,PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC))", function(err){console.log(err)});
                      //3. Bảng  thông tin người gửi hoặc nhận: gồm number, tên, là người gửi hay nhận, trạng thái nhận hay gửi được chưa
                      con.query("CREATE TABLE IF NOT EXISTS `"+user_info.number+"mes_sender` (`id` INT NOT NULL AUTO_INCREMENT,`ids` INT NOT NULL,`number` VARCHAR(20) NOT NULL,`name` VARCHAR(45) NULL,`send_receive` VARCHAR(5), `stt` VARCHAR(5) NULL,PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC))", function(err){console.log(err)});
                      con.query("CREATE TABLE IF NOT EXISTS `"+user_info.number+"contact` (`id` INT NOT NULL AUTO_INCREMENT,`number` VARCHAR(20) NOT NULL,`name` VARCHAR(45) NOT NULL,`fr` VARCHAR(5) NULL,`code` VARCHAR(10) NULL,PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC))", function(err){console.log(err)});
                      con.query("SELECT number FROM `account` ", function(err, row3s)
                        {
                          if (err) {console.log('select loi '+ err);}
                          else if ( row3s.length >0)
                            {
                              row3s.forEach(function (row3)
                                {
                                  con.query("SELECT * FROM `"+row3.number+"contact` WHERE `number` LIKE '"+user_info.number+"'", function(err, row4s)
                                    {
                                      console.log('bang '+row3.number + ' so dien thoai la:'+user_info.number);
                                      if ( err) {console.log('có loi select');}
                                      else if (row4s.length >0)
                                        {
                                          console.log('da select '+row3.number+' '+user_info.number);
                                          con.query("UPDATE `"+row3.number+"contact` SET `fr` = 'Y' WHERE `number` LIKE '"+user_info.number+"'",function(err3, ok)
                                          {
                                            //gửi thông báo cho ngươi kia biết là ông này đã tham gia ePos
                                            if ( err3 ){console.log('update bị loi'+err3);}
                                            else
                                              {
                                                console.log('updat thanh cong' + ok);
                                                io.sockets.in(row3.number).emit('contact_joined', {number:user_info.number,name:user_info.user, code:user_info.code});
                                              }
                                          });
                                        }
                                    });
                                });
                            }

                        });
                      // lưu tài khoản vào db
                      var sql = "INSERT INTO `account` (number,user, pass, code ) VALUES ?";
                      var matkhau = passwordHash.generate(user_info.pass);
                      var values = [[user_info.number,user_info.user, matkhau, user_info.code]];
                      con.query(sql, [values], function (err, result) {if ( err){console.log(err);}});
                      // xóa bản tin trong bảng active đi, coi như quá trình active hoàn tất
                      console.log('dang ky thanh cong:'+user_info.number);
                      socket.emit('dangky_thanhcong');
                    					          }//end else 2
				       });//end db.acive account
        	    } //end else 1
            }
   		   });//end db.account
	  }); //end socket.on.regis
  socket.on('C_yeucau_chuoi_forgotpass',function(idphone, num){
    console.log('nguoi dung yeu cau chuoi');
    con.query("SELECT * FROM `account` WHERE `number` LIKE '"+ num +"'", function(err, rows){
        // nếu tài khoản đã có người đăng ký rồi thì:
      if(err){console.log(err);}
      else {
        if (rows.length == 0 )	{
             socket.emit('taikhoankhongco');
             console.log("forgotpass: không có tài khoản này");
          }
          else {
              con.query("SELECT * FROM `danhsachkhoa` WHERE `number` LIKE '"+ num +"' OR `phoneid` LIKE '"+idphone+"' LIMIT 1", function(err4, rows4){
                if(err4){console.log(err4);}
                else {
                  if(rows4.length >0){socket.emit('C_yeucauchuoi_quasolan');console.log('yeu cau chuoi qua so lan');}
                  else {
                    cb.phoneInformation('+84982025401', (error, response) => {
                        if(error){console.log(error); socket.emit('sodienthoaikhongtontai');}
                        else {
                          console.log(response);
                          socket.emit('S_guichuoi_xacnhan_forget');// để Client chuyển sang giao diện chờ nhập chuỗi
                          var date = Math.floor(Date.now() / 1000);
                          var string = Math.floor(Math.random() * (89998)) + 10001;
                          //kiểm tra xem bảng xác thực đã có số điện thoại đó chưa, nếu có rồi thì update, nếu chưa có thì thêm mới
                          con.query("SELECT * FROM `xacthuc` WHERE `number` LIKE '"+ num +"'", function(err6, rows6){
                            if(err6){console.log(err6);}
                            else {
                                // cho phép đăng ký liên tục 3 lần, nếu là lần đầu
                              if(rows6.length==0){
                                  console.log('xac thuc moi');
                                var sql = "INSERT INTO `xacthuc` (number,chuoi,phoneid,date,status) VALUES ?";
                                var values = [[num, string,idphone,date,'Y']];
                                con.query(sql, [values], function(err, result){
                                  if(err){console.log(err);}
                                  else {
                                  // con.query("SELECT * FROM `xacthuc` WHERE `number` LIKE '"+ num +"'", function(err9, rows9){
                                  //   console.log('ket qua:'+rows9);
                                  //   if(rows9.length >=3){
                                  //     console.log('da khoa number');
                                  //     var sql = "INSERT INTO `danhsachkhoa` (number,date) VALUES ?";
                                  //     var values = [[num, date]];
                                  //     con.query(sql, [values], function(err, result){ if(err)console.log(err);});
                                  //   }
                                  // });
                                  con.query("SELECT * FROM `xacthuc` WHERE `phoneid` LIKE '"+ idphone +"'", function(err9, rows9){

                                    if(rows9.length >=3){
                                      console.log('da insert khoa idphone');
                                      var sql = "INSERT INTO `danhsachkhoa` (phoneid,date) VALUES ?";
                                      var values = [[idphone,date]];
                                      con.query(sql, [values], function(err, result){ if(err)console.log(err);});
                                    }
                                  });
                                }
                                });
                            }
                                // còn nếu trước đó đã có rồi
                              else {
                                console.log('update xac thuc');
                                con.query("UPDATE `xacthuc` SET `status` = 'N' WHERE `number` LIKE '"+num+"'",function(){
                                    //sau khi update rồi thì insert vào
                                    var sql = "INSERT INTO `xacthuc` (number,chuoi,phoneid,date,status) VALUES ?";
                                    var values = [[num, string,idphone,date,'Y']];
                                    con.query(sql, [values], function(err, result){
                                      con.query("SELECT * FROM `xacthuc` WHERE `number` LIKE '"+ num +"'", function(err9, rows9){
                                        console.log('ket qua:'+rows9);
                                        if(rows9.length >=3){
                                          var sql = "INSERT INTO `danhsachkhoa` (number,date) VALUES ?";
                                          var values = [[num, date]];
                                          con.query(sql, [values], function(err, result){ if(err)console.log(err);});
                                        }
                                      });
                                      con.query("SELECT * FROM `xacthuc` WHERE `phoneid` LIKE '"+ idphone +"'", function(err10, rows10){
                                        console.log('ket qua:'+rows10);
                                        if(rows10.length >=3){
                                          var sql = "INSERT INTO `danhsachkhoa` (phoneid,date) VALUES ?";
                                          var values = [[idphone,date]];
                                          con.query(sql, [values], function(err, result){ if(err)console.log(err);});
                                        }
                                      });
                                    });



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
        });
  });
  socket.on('C_send_chuoi_forgot',function(num,chuoi,pass){
    con.query("SELECT * FROM `xacthuc` WHERE `number` LIKE '"+ num +"' AND `chuoi` LIKE '"+chuoi+"' AND `status` LIKE 'Y'", function(err1, row1s) {
        if((err1)|| (row1s.length==0)) {socket.emit('S_chuoikhongdung');}
        else {
          con.query("UPDATE `account` SET `pass` = '"+passwordHash.generate(pass)+"' WHERE `number` LIKE '"+num+"'",function(){
          socket.emit('S_doipass_thanhcong');
        });
        }
    });

  });
  socket.on('dangky_thanhcong_ok', function(number){
      con.query(" DELETE FROM `xacthuc` WHERE `number` LIKE'"+number+"'", function(err){if(err){console.log('co loi dangky_thanhcong_ok:'+err);}});

  });
  socket.on('login2',(user1, pass1)=>{
    console.log('Dang login2 voi tai khoan:'+user1);
    console.log('Mat khau la:'+pass1);
    con.query("SELECT * FROM `account` WHERE `number` LIKE '"+user1+"' LIMIT 1", function(err, rows){
	     if (err || rows.length ==0){
          socket.emit('login2_khongtaikhoan');
          console.log("Login 2 khong co tai khoan "+user1);
        }
			else{
        if (passwordHash.verify(pass1, rows[0].pass)){
          socket.emit('login2_dung', {name:strencode(rows[0].user)});
          console.log('login 2 đung:');
          socket.number = user1;
          socket.username = rows[0].user;
          socket.join(user1);
          con.query("UPDATE `account` SET `inbox` = 'A',`send` = 'A',`save` = 'A',`room` = 'A',`contact` = 'A' WHERE `number` LIKE '"+user1+"'",function(){
            console.log('da update account xong');
          });

          // lấy toàn bộ dữ liệu mới nhất gửi cho ông này
          // lấy dữ liệu inbox

        }
        else {
          socket.emit('login2_sai', {name:strencode(rows[0].user)});
          console.log('login 2 sai');
        }
      }
    });
  });
  socket.on('login1',(user1, pass1)=>{
    //login 1 là login mà user đang ở mainactivity rồi, chi cần gửi dữ liệu mới về thôi.
    console.log('Dang login1 voi tai khoan:'+user1);
    console.log('Mat khau la:'+pass1);
    con.query("SELECT * FROM `account` WHERE `number` LIKE '"+user1+"' LIMIT 1", function(err, rows){
	     if (err || rows.length ==0){
          socket.emit('login1_khongtaikhoan');
          console.log("Login 2 khong co tai khoan "+user1);
        }
			else{
        if (passwordHash.verify(pass1, rows[0].pass)){
          // socket.emit('login1_dung', {name:strencode(rows[0].user)});
          socket.number = user1;
          socket.username = rows[0].user;
          socket.join(user1);
          // socket.emit('login2_ok', {name: strencode(rows[0].user)});
          console.log('Dang nhap dung roi voi tai khoan' + user1);
          // xem có ai gửi tin cho mình trong thời gian offline không
          con.query("SELECT * FROM `"+user1+"mes_main` WHERE `send_receive` LIKE 'R' AND `stt` LIKE 'N'", function(err1, a1s)
              {
              if ( err1 || ( a1s.length == 0) ){console.log(err1);}
              else
                {
                  console.log(a1s);
                  a1s.forEach(function(a1)
                  {
                  //lấy tên người gửi
                    con.query("SELECT * FROM `"+user1+"mes_sender` WHERE `send_receive` LIKE 'R' AND `ids` LIKE '"+a1.id+"' LIMIT 1", function(err2, a2s)
                    {
                      if ( err2 || ( a2s.length==0)){console.log(err2);}
                      else
                      {
                        //lấy danh sách các điểm
                        console.log('ten nguoi gui:');
                        console.log(a2s);

                        con.query("SELECT * FROM `"+user1+"mes_detail` WHERE `ids` LIKE '"+a1.id+"'", function(err3, a3s)
                        {
                          if ( err3 || ( a3s.length==0) ){console.log(err3);}
                          else
                            {
                            var pos3 = [];
                            var pos2;
                            console.log('cac diem:');
                            console.log(a3s);
                            a3s.forEach(function(a3)
                            {
                               pos2 = {name:strencode(a3.name), lat:a3.lat, lon:a3.lon, id:strencode(a3.id)};
                               pos3.push(pos2);
                               console.log(pos3);
                              });
                              console.log(' Tin nhan gui di:');
                            socket.emit('S_guitinnhan',{ name_nguoigui:strencode(a2s[0].name),number_nguoigui:a2s[0].number,
                               subject: strencode(a1.subject), pos: pos3, id_tinnha_client:a1.idc});


                          }
                        });
                      }
                    });
                  });

                }
          });
            //kiểm tra xem có ai đã nhận tin nhắn rồi không
          con.query("SELECT * FROM `"+user1+"mes_main` WHERE `send_receive` LIKE 'S' AND `stt` LIKE 'G'", function(err1, a1s)
              {
            if ( err1 || (a1s.length==0)){console.log(err1);}
            else
              {
                a1s.forEach(function(a1)
                  {
                  con.query("SELECT * FROM `"+user1+"mes_sender` WHERE `send_receive` LIKE 'S' AND `ids` LIKE '"+a1.id+"' AND `stt` LIKE 'G'", function(err5, a5s)
                  {

                  if ( err5 || (a5s.length==0)){console.log(err5);}
                  else
                    {
                      a5s.forEach(function(a5)
                        {
                          socket.emit('C_danhantinnhan',{nguoinhan:a5.number, idc:a1.idc});
                          console.log('Da gui sự kiện C_gui tin nhan di cho cac so:'+a5.number +' ma la '+ a1.idc);
                        });


                    }
                  });

                  });

              }
          });
          // kiểm tra xem có room nào gửi không
          con.query("SELECT * FROM `"+user1+"mes_main` WHERE `send_receive` LIKE 'O' AND `stt` LIKE 'N'", function(err2, a5s)
            {
              if ( err2){console.log(err2);}
              else if ( a5s.length>0)
                {
                a5s.forEach(function(a5)
                  {
                    //lấy tên admin của room
                    console.log('room chua gui: '+a5.subject);
                    con.query("SELECT * FROM `"+user1+"mes_sender` WHERE `ids` LIKE '"+a5.id+"' AND `send_receive` LIKE 'A' LIMIT 1", function(err3, a2s)
                    {
                      if (err3){console.log(err3);}
                      else
                      {
                        con.query("SELECT * FROM `"+user1+"mes_sender` WHERE `ids` LIKE '"+a5.id+"' AND `send_receive` LIKE 'B' ", function(err4, a8s)
                        {
                          if (err4){console.log(err4);}
                          else
                          {
                            if(a8s.length >0){
                            var thanhvien=[];
                            a8s.forEach((mem)=>{thanhvien.push({name:strencode(mem.name),number:mem.number});});
                            var room_full_server = {room_name:strencode(a5.subject), room_id_server:a5.idc, admin_name:strencode(a2s[0].name), admin_number:a2s[0].number, member_list1:thanhvien};
                            socket.emit('S_send_room', room_full_server );
                          }
                          }
                        });


                    }
                    });
                  });
              }
          });

        }
        else {
          console.log('dang nhap sai roi');
        socket.emit('login1_sai');
      }
      }
   	  });
	});
  socket.on('C_yeucau_data_full',()=>{
    console.log('C yeu cau full data');
    if(socket.number){
      // lấy bảng inbox
      con.query("SELECT * FROM `"+socket.number+"mes_main` WHERE `send_receive` LIKE 'R' ORDER BY `id` DESC LIMIT 20", function(err, a1s)
      {
        if ( err || ( a1s.length == 0) ){console.log(err);}
        else
          {
            let tinfull = [];
            a1s.forEach(function(a1,key){
               con.query("SELECT * FROM `"+socket.number+"mes_sender` WHERE `send_receive` LIKE 'R' AND `ids` LIKE '"+a1.id+"' LIMIT 1", function(err2, a2s){
                 if(err2){console.log(err2);}
                 else {
                   tinfull.push({name_nguoigui:strencode(a2s[0].name),number_nguoigui:a2s[0].number, subject:strencode(a1.subject), id_tinnha_client:a1.idc,trangthai:a1.read_1, stt: a1.stt,
                     thoigian:a1.time});
                     if(key===(a1s.length-1)){
                       console.log('Da inbox:'+tinfull.length);
                       socket.emit('S_send_inbox',{tin:tinfull});
                     }
                 }
               });
            });
          }
     });

      // lấy bảng send
      con.query("SELECT * FROM `"+socket.number+"mes_main` WHERE `send_receive` LIKE 'S' ORDER BY `id` DESC", function(err, a1s)
        {
             if ( err || ( a1s.length == 0) ){console.log(err);}
             else
               {
                 let tinfull2=[];
                 a1s.forEach(function(a1,key){
                   let nhomnguoinhan =[];
                    con.query("SELECT * FROM `"+socket.number+"mes_sender` WHERE `send_receive` LIKE 'S' AND `ids` LIKE '"+a1.id+"' LIMIT 1", function(err2, a2s){
                      if(err2){console.log(err2);}
                      else {
                        a2s.forEach(function(a2,key2){
                          nhomnguoinhan.push({number:a2.number, name:strencode(a2.name),trangthai:a2.stt});
                          if(key2 === (a2s.length-1)){
                            tinfull2.push({subject:strencode(a1.subject), idc:a1.idc,thoigian:a1.time, nguoinhan:nhomnguoinhan, trangthai:a1.stt});
                            if(key === (a1s.length-1)){  socket.emit('S_send_send',{tin:tinfull2});console.log('Server đã gửi send');}
                          }
                        });
                      }
                    });
                 });
               }
      });
      // lấy bảng save
      con.query("SELECT * FROM `"+socket.number+"mes_main` WHERE `send_receive` LIKE 'SA' ORDER BY `id` DESC LIMIT 20", function(err, a1s)
        {
            if ( err || ( a1s.length == 0) ){console.log(err);}
                 else
                   {
                     let tinfull = [];
                     a1s.forEach(function(a1,key){
                       tinfull.push({subject:strencode(a1.subject), idc:a1.idc,thoigian:a1.time});
                       if(key=== (a1s.length-1)){socket.emit('S_send_save',{tin:tinfull});console.log('Server đã gửi save');}
                     });
                   }
              });
      // lấy bảng contact
      con.query("SELECT * FROM `"+socket.number+"contact` ORDER BY `name` DESC ", function(err3, a1s)
             {
               if ( err3 || ( a1s.length == 0) ){console.log('Da co loi contact:'+err3);}
               else
                 {
                   let mangcontact = [];
                   a1s.forEach(function(a1,key){
                     mangcontact.push({name:strencode(a1.name), number:a1.number});
                     if(key===(a1s.length-1)){socket.emit('S_send_contact',{tin:mangcontact});console.log('Server đã gửi contact');}
                   });
                 }

      });
      // Lấy danh sách room
      con.query("SELECT * FROM `"+socket.number+"mes_main`  WHERE `send_receive` LIKE 'O' ORDER BY `id` DESC LIMIT 20 ", function(err4, a4s)
             {
               if ( err4 || ( a4s.length == 0) ){console.log('Da co loi contact:'+err4);}
               else
                 {
                   let tinfull = [];
                   a4s.forEach(function(a4,key){
                      con.query("SELECT * FROM `"+socket.number+"mes_sender` WHERE `ids` LIKE '"+a4.id+"' AND `send_receive` LIKE 'A' LIMIT 1 ", function(err5, a5s)
                        {
                              if ( err5 || ( a5s.length == 0) ){console.log('Da co loi contact:'+err5);}
                              else
                                {
                                    tinfull.push({room_name:strencode(a4.subject), room_id_server:a4.idc, admin_name:strencode(a5s[0].name), admin_number:a5s[0].number, time:a4.time});
                                    if(key===(a4s.length-1)){socket.emit('S_send_room',{tin:tinfull});console.log('Server đã gửi room:');}
                                }
                      });
                   });
                 }
      });
    }
  });
  socket.on('C_reques_point_inbox',(idc)=>{
    if(socket.number){
      con.query("SELECT * FROM `"+socket.number+"mes_main` WHERE `send_receive` LIKE 'R' AND `idc` LIKE '"+idc+"' LIMIT 1", function(err, a1s)
         {
           if ( err || ( a1s.length == 0) ){console.log(err);}
           else
             {
               con.query("SELECT * FROM `"+socket.number+"mes_detail` WHERE `ids` LIKE '"+a1s[0].id+"'", function(err3, a3s){
                        if(err3){console.log(err3);}
                        else {
                          let position=[];
                          console.log('Du lieu pos la:'+a3s.length);
                          a3s.forEach(function(a3){position.push({name:strencode(a3.name), lat:a3.lat, lon:a3.lon, id:a3.idp}); });
                          socket.emit('S_send_point_inbox',{pos:position});
                          console.log('Server đã gửi inbox point:'+position);
                        }
                });

             }
        });

    }
  });
  socket.on('C_gui_tinnhan', function(mess){
    console.log(mess);
    if (socket.number){
      console.log('nguoi dung la:'+socket.number);
    socket.emit('S_get_tinnhan',mess.id);
    // lưu vào bảng chính của người gửi
    var sql2 = "INSERT INTO `"+socket.number+"mes_main` (idc,subject, send_receive, time) VALUES ?";
    var values2 = [[mess.id, mess.subject,'S',mess.thoigian]];
    con.query(sql2, [values2], function (err, res)
      {
        if ( err){console.log(err);}
        else {
              console.log('Da luu voi id:'+ mess.id);
                // lưu vào bảng vị trí của người gửi
                var sql3 = "INSERT INTO `"+socket.number+"mes_detail` (ids, idp, name, lat, lon) VALUES ?";
                mess.pos.forEach(function(row)
                  {
                    var val = [[res.insertId, row.id, row.name, row.lat, row.lon]];
                    con.query(sql3, [val], function (err2, res2) {if ( err2){console.log(err2);}});
                  });
                  // lưu vào bảng người nhận của người gửi
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
                                var sql5= "INSERT INTO `"+row5.number+"mes_main` (idc,subject, send_receive, stt, read_1, time) VALUES ?";
                              var val5 = [[mess.id, mess.subject,'R','N','N','N']];
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
                                    var array_tinnhan = [];
                                    var tin = {lat:0.1, lon:0.0, name:"", id:""};
                                    mess.pos.forEach(function(row3){
                                        // lưu vào bảng vị trí của người nhan
                                        var sql7 = "INSERT INTO `"+row5.number+"mes_detail` (ids, idp, name, lat, lon) VALUES ?";
                                        var val7 = [[res5.insertId, row3.id, row3.name, row3.lat, row3.lon]];
                                        tin = {lat:row3.lat, lon: row3.lon, name:strencode(row3.name), id:strencode(row3.id)};
                                        array_tinnhan.push(tin);
                                        con.query(sql7, [val7], function (err7, result) {
                                          if ( err7){console.log(err7);}
                                        else {
                                          console.log("Da insert vao mess detail "+ result.insertId);
                                        }
                                      });
                                      });
                                      // io.sockets.in(row5.number).emit('S_guitinnhan',{ name_nguoigui:strencode(mess.nguoigui_name),number_nguoigui:mess.nguoigui_number,
                                      //   subject: strencode(mess.subject), pos: mess.pos, id_tinnha_client:mess.id});
                                      console.log('nguoi nhan');
                                      console.log(row5.number);
                                        io.sockets.in(row5.number).emit('S_guitinnhan',{ name_nguoigui:strencode(socket.username),number_nguoigui:socket.number,
                                          subject: strencode(mess.subject), pos: array_tinnhan, id_tinnha_client:mess.id});

                                      console.log('Da gui tin nhan di xong');

                                  } //het else
                                });

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
    }
    }); // end socket.on('sendmess', function(test)
  socket.on('C_save_pos', (mess)=>{
    if(socket.number){
      socket.emit('S_get_save_pos');
      var sql = "INSERT INTO `"+socket.number+"mes_main` (idc,subject, send_receive, time) VALUES ?";
      var val = [[mess.maso, mess.subject,'SA',mess.thoigian]];
      con.query(sql, [val], function (err, res)
        {
          if(err){socket.emit('S_save_pos_err');}
          else {
            var sql3 = "INSERT INTO `"+socket.number+"mes_detail` (ids, idp, name, lat, lon) VALUES ?";
            mess.vitri.forEach(function(row)
              {
                var val3 = [[res.insertId, row.id, row.name, row.lat, row.lon]];
                con.query(sql3, [val3], function (err3, res3) {if ( err3){console.log(err3);}});
              });

          }
      });
    }
  });
  socket.on('C_nhan_inbox',()=>{
    con.query("UPDATE `account` SET `inbox` = 'B' WHERE `number` LIKE '"+socket.number+"'",function(){
      console.log('da update account xong');
    });
  });
  socket.on('C_nhan_send',()=>{
    con.query("UPDATE `account` SET `send` = 'B' WHERE `number` LIKE '"+socket.number+"'",function(){
      console.log('da update account xong');
    });
  });
  socket.on('C_nhan_save',()=>{
    con.query("UPDATE `account` SET `save` = 'B' WHERE `number` LIKE '"+socket.number+"'",function(){
      console.log('da update account xong');
    });
  });
  socket.on('C_nhan_room',()=>{
    con.query("UPDATE `account` SET `room` = 'B' WHERE `number` LIKE '"+socket.number+"'",function(){
      console.log('da update account xong');
    });
  });
  socket.on('C_nhan_contact',()=>{
    con.query("UPDATE `account` SET `contact` = 'B' WHERE `number` LIKE '"+socket.number+"'",function(){
      console.log('da update account xong');
    });
  });
  socket.on('danhantinnhan', function (nguoigui, idc, thoigian)
   	{
      if (socket.number){

	    //chuyển trạng thái trong db thành người nhận đã đọc được tin, báo về cho người gửi biết
    con.query("UPDATE `"+socket.number+"mes_main` SET `stt` = 'Y',`time` = '"+thoigian+"' WHERE `idc` LIKE '"+idc+"'",function(){
      console.log('ma san pham la '+idc);
    });
    con.query("SELECT * FROM `"+nguoigui+"mes_main` WHERE `idc` LIKE '"+idc+"'  AND `send_receive` LIKE 'S' LIMIT 1", function(err11, res11)
      {
        if ( err11 || (res11.length ==0) ){console.log(err11);}
        else
          {
            con.query("UPDATE `"+nguoigui+"mes_main` SET `stt` = 'G' WHERE `idc` LIKE '"+idc+"' AND `send_receive` LIKE 'S'",function(err2,res2){
              if(err2){console.log(err2);}
              else {
              con.query("UPDATE `"+nguoigui+"mes_sender` SET `stt` = 'G' WHERE `ids` LIKE '"+res11[0].id+"' AND `number` LIKE '"+socket.number+"'",function(err3,res3)
                {
                  if(err3){console.log(err3);}
                  else {
                      io.sockets.in(nguoigui).emit('C_danhantinnhan',{nguoinhan:socket.number, idc:idc});
                  }
                  //console.log('Da bao cho ' +nguoigui +' biet la '+nguoinhan + ' da nhan tin nhan '+idc);

                });
              }

          });

          }

        });

    //trạng thái G cho biết, có một ai đó trong danh sách nhận đã nhận tin nhắn, nhưng người gửi chưa biết
    }
  });
  socket.on('C_read_mes',(idc)=>{

    if(socket.number){
      console.log('Da nhan su kien read');;
      con.query("UPDATE `"+socket.number+"mes_main` SET `read_1` = 'OK' WHERE `idc` LIKE '"+idc+"' AND `send_receive` LIKE 'R'",function(err2){
          if(err2){console.log(err2);}
          else {
            console.log('Da read xong');
          }
        });

    }
  });
  // khi người gửi biết rằng khách đã nhận được tin, chuyển màu sắc người nhận trong mục send sang đỏ và báo lại
  // server, kết thúc phần gửi tin cho khách hàng đó
  socket.on('tinnhan_final', function ( id, nguoinhan){
      if (socket.number){
		      console.log('Da nhan tin nhan final');
          con.query("SELECT * FROM `"+socket.number+"mes_main` WHERE `idc` LIKE '"+id+"' AND `send_receive` LIKE 'S' LIMIT 1", function(err, a1s){
            if ( err || ( a1s.length==0)) {console.log(err);}
            else {
              console.log('Da tim thay ma dung 1');
              con.query("UPDATE `"+socket.number+"mes_sender` SET `stt` = 'OK' WHERE `ids` LIKE '"+a1s[0].id+"' AND `number` LIKE '"+nguoinhan+"'",function(err2){
                  if(err2){console.log(err2);}
                  else {
                  console.log('nguoi gui:'+socket.user_name+' da biet '+nguoinhan+ ' da nhan tin nhan');
                  // kiểm tra xem có thằng nào chưa gửi thông báo không
                  con.query("SELECT * FROM `"+socket.number+"mes_sender` WHERE `ids` LIKE '"+a1s[0].id+"' AND `send_receive` LIKE 'S' AND `stt` LIKE 'G' LIMIT 1", function(err3, a3s){
                    if ( err3 ) {console.log(err3);}
                    else {
                      console.log('Da tim thay ma dung 2');
                      if(a3s.length == 0){
                        console.log('Da tim thay ma dung 3');
                      con.query("UPDATE `"+socket.number+"mes_main` SET `stt` = 'OK' WHERE `idc` LIKE '"+id+"' AND `stt` LIKE 'G'",function(err4){
                        if(err4){console.log(err4);}
                        else {
                          console.log('ma san pham final la '+id);
                        }

                  });
                }
              }
                });

              }

            });

      		//	kết thúc quá trình gửi tin nhắn

        }

      });
    }
  });
    //CREATE  TABLE  IF NOT EXISTS "main"."abc" ("id" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL  UNIQUE , "name1" VARCHAR, "name 2" VARCHAR)
  socket.on('search_contact', function (string){
    if (socket.number){
    console.log("Chuoi nhan duoc la:"+string);
    con.query("SELECT `number`, `user` FROM `account`", function(err, a1){
      if (!( err))
      {
        var s=true;;
        a1.forEach(function (row1)
          {
            if (row1.number.indexOf(string) !== -1 )
            {
              socket.emit('S_kq_check_contact_2',{user:strencode(row1.user), number: row1.number});console.log("Da tim thay:"+row1.user);
              s=false;
            }
          });
        if (s){socket.emit('S_kq_check_contact_zero_2');}
      }
    });
    }
  });
  socket.on('C_check_contact', function (string){
      if (socket.number){
    console.log("Chuoi nhan duoc la:"+string);
    con.query("SELECT `number`, `user` FROM `account`", function(err, a1){
      if ( err){console.log(err);}
      else
      {
        let s=true;;
        a1.forEach(function (row1)
          {
            if (string.charAt(0)=='0'){
              string = string.substr(1);
              console.log(string);
            }
            if (row1.number.indexOf(string) !== -1 || row1.user.indexOf(string) !== -1)
            {
              socket.emit('S_kq_check_contact',{user:strencode(row1.user), number: row1.number});
            //  socket.emit('S_kq_check_contact',{user:row1.user, number: row1.number});
              console.log("Da tim thay:"+row1.user);
              s=false;
            }
          });
        if (s){socket.emit('S_kq_check_contact_zero');}
      }
    });
    }
  });
  socket.on('W_check_contact', function (string){
    console.log("Chuoi nhan duoc la:"+string);
    if (socket.number){
    string = string.trim();
    if (string.charAt(0)=='0'){
      string = string.substr(1);
      console.log(string);
    }
     if (string.length > 5){
    con.query("SELECT `number`, `user` FROM `account`", function(err, a1){
      if ( err){console.log(err);}
      else
      {
        let s=true;;
        a1.forEach(function (row1)
          {

            if (row1.number.indexOf(string) !== -1 || row1.user.indexOf(string) !== -1)
            {
              socket.emit('S_W_kq_check_contact',row1);
              console.log("Da tim thay:"+row1.user);
              s=false;
            }
          });
        if (s){socket.emit('S_W_kq_check_contact_zero');}

      }
    });
    }
    }
  });
  socket.on('W_add_friend',function(data){
      if (socket.number){
    console.log('Da nhan:'+data.password);
    con.query("SELECT * FROM `account` WHERE `number` LIKE '"+data.admin+"' AND `pass` LIKE '"+ data.password+"' LIMIT 1", function(err, rows){
       if (err || rows.length ==0){
          console.log("Dang nhap first khong dung");
        }
      else{
        con.query("SELECT * FROM `"+data.admin+"contact` WHERE `number` LIKE '"+data.number+"' AND `name` LIKE '"+ data.user+"' LIMIT 1", function(err, rows){
           if (err || rows.length > 0){
              console.log("Dang nhap first khong dung");
            }
          else{
            var sql2 = "INSERT INTO `"+data.admin+"contact` (number,name,fr) VALUES ?";
            var values2 = [[data.number, data.user, 'Y']];
              con.query(sql2, [values2], function (err1, res1)
                {
                if ( err1){console.log(err1);}
                else {
                  var dulieu=  {id:res1.insertId, name:data.user, number:data.number};
                  console.log(dulieu);
                  socket.emit('S_W_add_friend_ok',dulieu);
                }
                });
        }
      });

      }
    });
    }
  });
  socket.on('C_join_room', function (room)  {
      if (socket.number){
        socket.emit('S_get_join');
        if(socket.roomabc){socket.leave(socket.roomabc);}
        socket.join(room);
        socket.roomabc = room;

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
                      a2s.forEach((member)=>{
                          socket.emit('S_send_member',{name:strencode(member.name), number:member.number, admin:member.send_receive});
                      });

                    }
              });


           }
    });
    console.log('ten room la:' +room);
    }

  });
  socket.on('C_send_contact', function (contact)  {
      if (socket.number){
        var sql2 = "INSERT INTO `"+socket.number+"contact` (name,number) VALUES ?";
        var values2 = [[contact.name,contact.number]];
        con.query(sql2, [values2], function (err, res)
          {
            if ( err){console.log(err);}
            else {
              console.log('Da them contact vao danh sach');
            }
          });

      }
      });
  socket.on('W_join_room', function (room, number)  {
      if (socket.number){
    socket.join(room);
    console.log('da join vao number '+ number);
    con.query("SELECT id FROM `"+number+"mes_main` WHERE `send_receive` LIKE 'O' AND `idc` LIKE '"+room+"' LIMIT 1", function(err7, a7s)
      {
        if ( err7 ||(a7s.length==0)){console.log(err7);}
        else{
          console.log(a7s[0].id);
          con.query("SELECT number, name FROM `"+number+"mes_sender` WHERE `ids` LIKE '"+a7s[0].id+"'", function(err8, a8s)
            {
              if ( err8 ||(a8s.length==0)){console.log(err8);}
              else{
              socket.emit('S_send_room_member', a8s);

              }
            });

        }
      });


    }


  });
  socket.on('C_leave_off', function () {
      if (socket.number){

      socket.leave(socket.number);
      console.log('Da leave user khoi user'+socket.number);
      socket.number = undefined;

    }
  });
  socket.on('C_leave_room', function (room) {
      if (socket.number){
      socket.leave(room);
      console.log('Da leave user khoi room: '+room);


    }
  });
    //sự kiến check_contact xảy ra khi người dùng được thông báo acitve thành công, app sẽ lấy  toàn bộ danh sách
    // để gửi lên server để server lưu và kiểm tra xe liệu trong đó có ai đã tham gia ePos rồi chưa
  socket.on('check_contact_full', function (arr_contact){
      if (socket.number){
    //người dùng mới đăng nhập và sẽ gửi lên một đống cái contact, lúc này
    //server không gửi trả về từng contact mà gửi chung cả cụm.
    var mang_contact = [];
    var contact = {name : "", number : "", code: ""};
        console.log("Contact nhan duoc la:"+arr_contact.contact.length);
            var sql = "INSERT INTO `"+socket.number+"contact` (number, name, fr, code) VALUES ?";
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
                    con.query(sql, [val], function (err2, result) {if ( err2)console.log(err2);});
                    contact = {name : strencode(row.name), number : row.number, code: row.code};
                    mang_contact.push(contact);
                  }
                  else {
                    var val = [[row.number, row.name,"N",row.code]];
                    con.query(sql, [val], function (err2, result) {if ( err2)console.log(err2);});
                  }
                }
              });
              // socket.emit('first_contact_joined', mang_contact);
            });//arr_contact.contact.forEach


      }
  });//check_contact
  socket.on('C_got_friend', function (number){
      if (socket.number){
    console.log('Người dùng đã lưu friend la:'+number);
    // con.query("DELETE FROM `"+host+"contact` WHERE `number` LIKE '"+number+"'", function(err){console.log('loi delete'+err)});
    con.query("UPDATE `"+socket.number+"contact` SET `fr` = 'OK' WHERE `number` LIKE '"+number+"'",function(err3, ok){ console.log('loi update'+err)});
    }
  });
  socket.on('C_pos_online', function (info){
    if (socket.number){
      if ( info != null){
        info.room.forEach(function(room){
          io.sockets.in(room.room_fullname).emit('S_pos_online',{lat:info.lat, lon:info.lon, name:strencode(socket.username), number:socket.number});
          console.log('da gui cho '+room.room_fullname + 'AAAAA' +info.stt+ "ten la:"+ socket.username );
        });
    }

    }
  });
  socket.on('C_make_room', function (info)
   	{
    if (socket.number){
      // bắt đầu xử lý cái room
      var room_id = passwordHash.generate(info.room_name);

      // gửi lại cho admin cái room đầy đủ để lưu hành trên hệ thống
      console.log('Da nhan room la:'+info);
      var sql = "INSERT INTO `"+socket.number+"mes_main` (idc, subject, send_receive, stt,time ) VALUES ?";
      var val = [[ room_id, info.room_name,'O', 'N','N']];
      con.query(sql, [val], function (err, res)
      {
        if ( err){console.log(err);}
        else {
          // lưu thành viên vào bảng
          var sql2 = "INSERT INTO `"+socket.number+"mes_sender` (ids, name, number, send_receive) VALUES ?";

          var abc = [[ res.insertId, socket.username,socket.number,'A']];
          con.query(sql2, [abc], function (err9, res9){if ( err9){console.log(err9);}
            else {
            info.member_list.forEach((member)=>{
              val2 = [[ res.insertId, member.name,member.number,'B']];
              con.query(sql2, [val2], function (err2, res2){if ( err2){console.log(err2);}});
              });
              socket.emit('S_get_room');
              socket.emit('S_send_room',{room_name:strencode(info.room_name), room_id_server:room_id, admin_name:strencode(socket.username), admin_number:socket.number, time:'N'});
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
                      var sql5 = "INSERT INTO `"+row.number+"mes_main` (idc, subject, send_receive, stt, time ) VALUES ?";
                      var val5 = [[ room_id, info.room_name,'O', 'N','N']];
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
                                  io.sockets.in(row.number).emit('S_send_room',{room_name:strencode(info.room_name), room_id_server:room_id, admin_name:strencode(socket.username), admin_number:socket.number, time:'N'});
                                  console.log('Da gui room di lan:');
                                }
                              });
                            }
                          });
              }
            });

        });

    }
   	});
  socket.on('C_change_pass', function(oldpass,newpass){
   if (socket.number){
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
   if (socket.number){
    console.log('Da nhan su kien C get add mem');
    // lượn qua xem tài khoản đó có tồn tại hay không
        //kiêm tra xem room đó có trên server hay không
        con.query("SELECT * FROM `" + socket.number+"mes_main` WHERE `idc` LIKE '"+info.room_fullname+"' LIMIT 1", function(err1, rows){
          if ( err1 || (rows.length ==0)){console.log(err);}
          else {
            //info.member.forEach(mem)=>{
          info.member.forEach(function(mem)
              {
              con.query("UPDATE `"+socket.number+"mes_sender` SET `stt` = 'Y' WHERE `number` LIKE '"+mem.number+"' AND `ids` LIKE '"+rows[0].id+"'",function(err4){if (err4){console.log(err4);}});
            });
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
   if (socket.roomabc){
    console.log(info);
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
                    socket.emit('S_send_room',{room_name:strencode(info.room_name), room_id_server:rows[0].idc, admin_name:strencode(socket.username), admin_number:socket.number, time:'N'});
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
  socket.on('C_get_room', function(room_fullname,time){
      if (socket.number){
        console.log(socket.username+' da nhan room roi:' + room_fullname);
      con.query("UPDATE `"+socket.number+"mes_main` SET `stt` = 'Y', `time` = '"+time+"' WHERE `idc` LIKE '"+room_fullname+"'",function(err){
      if ( err){console.log(err);}
    });
    }
  });

});
}});
