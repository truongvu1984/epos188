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
  //  https://www.cleardb.com/database/details?id=EC6CC143D125B9254AFD2C0DCEE155F3
  //  b0bd8d2dadd7e9:4ef561c7@us-cdbr-iron-east-05.cleardb.net/heroku_22d08a1219bdc10?reconnect=tr
// DELETE FROM `table` WHERE `timestamp` &gt; DATE_SUB(NOW(), INTERVAL 10 MINUTE);

var mysql = require('mysql');
var con = mysql.createConnection({
  host: "us-cdbr-iron-east-05.cleardb.net",
  user: "b04c2ff40d4e13",
  password: "0fdaedd4",
 database : "heroku_7790b5956b2a5c2",
 queueLimit: 30,
  acquireTimeout: 1000000,
});

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

function strdecode( data ) {
  return JSON.parse( decodeURIComponent( escape ( data ) ) );
}

// var sql123 = "INSERT INTO `active_account` (number,user, pass, string, code,date ) VALUES ?";
// sau mỗi phút, kiêm tra db và xóa các bản tin đã quá 5 phút
function check_active_string() {
  setTimeout(function() {
    var date2 = Math.floor(Date.now() / 1000) - 500;
    con.query(" DELETE FROM `active_account` WHERE `date` < "+date2, function(err){if(err){console.log('co loi:'+err);}});
  check_active_string();
  }, 60000);
}
check_active_string();

io.on('connection',  (socket)=>
{
  console.log('Da co ket noi moi '+socket.id);
  console.log('Room la: '+ socket.adapter.rooms);
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
  socket.emit('check_pass', function(){console.log('Da day su kien check di')});
  socket.on('disconnect', function(){ console.log('user da disconnect')});
  socket.on('regis1', function(idphone,number){
      cb.phoneInformation('+84982025401', (error, response) => {
            if(error){console.log(error); socket.emit('regis1_sai');}
            else {
              console.log(response);
              socket.emit('send_string_ok');
              var string = Math.floor(Math.random() * (89998)) + 10001;
              // fs.writeFile(num+".png",img, (err, result)=>console.log(result));
              var sql = "INSERT INTO `xacthuc` (number,chuoi,phoneid) VALUES ?";
              var values = [[number, string,idphone]];
              con.query(sql, [values], function(err, result){

              });
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
                con.query("SELECT * FROM `xacthuc` WHERE `number` LIKE '"+ user_info.number +"' AND `chuoi`LIKE '"+user_info.string+"'", function(err1, row1s) {
					     		  if((err1)|| (row1s.length==0)) {
                      socket.emit('chuoi_ko_dung');

                    }
                    else {

                      // nếu số điện thoại và mã xác nhận khớp nhau
                      console.log('Đăng ký thành công');
                      //active thành công, trả thông tin người dùng về lại cho khách hàng
                      // TẠO RA CACS BẢNG THÔNG TIN CHO NGƯỜI DÙNG
                      // 1. Bảng chính: lưu id của bản tin đó trên server, id của người dùng, tên tin nhắn, tin nhắn gửi đi hay tin nhắn nhận về, trạng thái gửi đi hay nhận về.
                      con.query("CREATE TABLE IF NOT EXISTS  `"+active_info.number+"mes_main` (`id` INT NOT NULL AUTO_INCREMENT,`idc` CHAR(25) NOT NULL, `subject` VARCHAR(20) NOT NULL,`send_receive` VARCHAR(5) NOT NULL,`stt` VARCHAR(5) NULL,PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC))", function(err){console.log(err)});
                      //2. Bảng địa điểm: lưu id bản tin đó trên server, tên điểm, tọa độ điểm
                      con.query("CREATE TABLE IF NOT EXISTS `"+active_info.number+"mes_detail` (`id` INT NOT NULL AUTO_INCREMENT,`ids` INT NOT NULL,`idp` CHAR(20) NOT NULL,`name` VARCHAR(45) NOT NULL,`lat` DOUBLE NULL,`lon` DOUBLE NULL,PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC))", function(err){console.log(err)});
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


					          }//end else 2
				       });//end db.acive account
        	    } //end else 1
            }
   		   });//end db.account
	  }); //end socket.on.regis
  // lắng nghe sự kiện xác nhận tài khoản
  socket.on('active', function (active_info){
    console.log(active_info);
  		con.query("SELECT * FROM `active_account` WHERE `number` LIKE '"+ active_info.number +"'", function(err, rows)
  		  {
          if (err||rows.length==0){ socket.emit('active_no_number', {mail:active_info.number});}
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
                  con.query("CREATE TABLE IF NOT EXISTS `"+active_info.number+"mes_detail` (`id` INT NOT NULL AUTO_INCREMENT,`ids` INT NOT NULL,`idp` CHAR(20) NOT NULL,`name` VARCHAR(45) NOT NULL,`lat` DOUBLE NULL,`lon` DOUBLE NULL,PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC))", function(err){console.log(err)});
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
  socket.on('fisrtlogin',(user1, pass1)=>{console.log('Da dang nhap bang ten:'+user1);
    //  nếu đăng nhập đúng thì phát sự kiện để app chuyển sang giao diện main
    con.query("SELECT * FROM `account` WHERE `number` LIKE '"+user1+"' AND `pass` LIKE '"+ pass1+"' LIMIT 1", function(err, rows){
	     if (err || rows.length ==0){
        // Nếu đăng nhập sai
        socket.emit('firscheckwrong');
        console.log("Dang nhap first khong dung"+user1);
        }
			else{
        //Nếu đăng nhập đúng
      //  socket.emit('okfirstlogin',{number:rows[0].number, pass:rows[0].pass, name:rows[0].user});
      // var traloi = [];
      // var user0k = {number : rows[0].number, pass : rows[0].pass, code: ""};

      socket.emit('dangnhap_dung', {number:rows[0].number, pass:rows[0].pass, name:strencode(rows[0].user)});

        console.log('Dang nhap dung roi ha ha  voi ten:'+ strencode(rows[0].user));
        // bắt đầu kiểm tra các thông tin cần gửi cho user này đang được lưu trên db
        // đầu tiên là các room gửi cho user
        // tìm trong db xem các room chưa được gửi cho user
        }
   	  });
	  });
  socket.on('mainlogin', function(user, pass){
    console.log("Da nhan user "+ user);
    // kiểm tra mật khẩu và tài khoản
    con.query("SELECT * FROM `account` WHERE `number` LIKE '"+user+"' AND `pass` LIKE '"+ pass+"' LIMIT 1", function(err1, rows){
        if (err1||rows.length ==0){
          // Nếu đăng nhập sai
          socket.emit('main_login_wrong');
          console.log("Dang nhap second khong dung"+user);
          }
        else{
          //Nếu đăng nhập đúng
          socket.join(user);
          console.log('Dang nhap dung roi voi tai khoan' + user);
          // kiểm tra xem contact có ai mới tham gia ePOS không
          con.query("SELECT * FROM `"+user+"contact` WHERE `fr` LIKE 'Y'", function(err, rows2){
            if ( err || ( rows2.length ==0)){console.log('co loi select user contact: '+err);}
            else {
              rows2.forEach(function(row2){
                socket.emit('contact_joined', {number:row2.number,name:strencode(row2.name), code:row2.code});
                });
            }

            });
          // kiểm tra xem có ai gửi tin nhắn cho không
          con.query("SELECT * FROM `"+user+"mes_main` WHERE `send_receive` LIKE 'R' AND `stt` LIKE 'N'", function(err, a1s)
              {
              if ( err || ( a1s.length == 0) ){console.log(err);}
              else
                {
                  console.log(a1s);
                  a1s.forEach(function(a1)
                  {
                  //lấy tên người gửi
                    con.query("SELECT * FROM `"+user+"mes_sender` WHERE `send_receive` LIKE 'R' AND `ids` LIKE '"+a1.id+"' LIMIT 1", function(err, a2s)
                    {
                      if ( err || ( a2s.length==0)){console.log(err);}
                      else
                      {
                        //lấy danh sách các điểm
                        console.log('ten nguoi gui:'+a2s);

                        con.query("SELECT * FROM `"+user+"mes_detail` WHERE `ids` LIKE '"+a1.id+"'", function(err, a3s)
                        {
                          if ( err || ( a3s.length==0) ){console.log(err);}
                          else
                            {
                            var pos3 = [];
                            var pos2;
                            console.log('cac diem:'+a3s);
                            a3s.forEach(function(a3)
                            {
                               pos2 = {name:strencode(a3.name), lat:a3.lat, lon:a3.lon, id:strencode(a3.id)};
                               pos3.push(pos2);
                              });
                              console.log(' Tin nhan gui di:'+pos3);
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
          con.query("SELECT * FROM `"+user+"mes_main` WHERE `send_receive` LIKE 'S' AND `stt` LIKE 'G'", function(err, a4s)
              {
            if ( err || (a4s.length==0)){console.log(err);}
            else
              {
                a4s.forEach(function(a4)
                  {
                  con.query("SELECT * FROM `"+user+"mes_sender` WHERE `send_receive` LIKE 'S' AND `ids` LIKE '"+a4.id+"' AND `stt` LIKE 'G'", function(err5, a5s)
                  {

                  if ( err5 || (a5s.length==0)){console.log(err5);}
                  else
                    {
                      let nhoms_nguoinhan = [];
                      let nguoinhan = {number:"", name:""};

                      a5s.forEach(function(a5)
                        {
                          nguoinhan = {number:a5.number, name: strencode(a5.name)};
                          nhoms_nguoinhan.push(nguoinhan);
                        });

                      socket.emit('C_danhantinnhan',{nguoinhan:nhoms_nguoinhan, idc:a4.idc});
                      console.log('Da gui sự kiện C_gui tin nhan di cho cac so:'+a5s[0].number +' ma la '+ a4.idc);
                    }
                  });

                  });

              }
          });
          // kiểm tra xem có room nào gửi không
          con.query("SELECT * FROM `"+user+"mes_main` WHERE `send_receive` LIKE 'O' AND `stt` LIKE 'N'", function(err, a5s)
            {
              if ( err){console.log(err);}
              else if ( a5s.length>0)
                {
                var ad_num,ad_name;
                a5s.forEach(function(a5)
                  {
                    //lấy tên người gửi và tên người tham gia room
                    console.log('room chua gui: '+a5.subject);
                    con.query("SELECT * FROM `"+user+"mes_sender` WHERE `ids` LIKE '"+a5.id+"'", function(err, a2s)
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
                                  mem = {name:strencode(a2.name), number:a2.number};
                                  list.push(mem);
                                  console.log('Thanh vien la:'+a2.name);
                                }
                              else
                              // còn không thì đây là tên admin của room
                            { ad_num = a2.number; ad_name = strencode(a2.name);
                              console.log('admin la:'+a2.number);
                            }
                          });
                        socket.emit('S_send_room',{admin_name:ad_name, admin_number:ad_num, room_name: strencode(a5.subject),room_fullname: strencode(a5.idc), member_list: list });
                        console.log('Da gui room di '+ad_name);
                    }
                    });
                  });
              }
          });
          // kiểm tra xem có room nào cần bổ sung mmember không
          con.query("SELECT * FROM `"+user+"mes_main` WHERE `send_receive` LIKE 'O' AND `stt` LIKE 'M'", function(err7, a7s)
            {
              if ( err7 ||(a7s.length==0)){console.log(err7);}
              else
                { //else1
                  a7s.forEach((room)=>{
                    con.query("SELECT * FROM `"+user+"mes_sender` WHERE `ids` LIKE '"+room.id+"' AND `stt` LIKE 'M'", function(err8, members)
                      {
                        if ( err8 ||(a7s.length==0)){console.log(err8);}
                        else{
                          let mem = [];
                          let mem1 ={name:"", number:""};
                          members.forEach((mem2)=>{
                            mem1 = {name:strencode(mem2.name), number:mem2.number};
                            mem.push(mem1);
                          });
                          socket.emit('S_add_mem',{ room_fullname:strencode(room.idc), member_list:mem});
                        }
                      });
                  });

                } // else1
              });
          }
      });
	});//hết phần socket.on mainlogin
  socket.on('C_gui_tinnhan', function(mess){
    console.log(mess);
    socket.emit('S_get_tinnhan',mess.id);
    // lưu vào bảng chính của người gửi
    var sql2 = "INSERT INTO `"+mess.nguoigui_number+"mes_main` (idc,subject, send_receive) VALUES ?";
    var values2 = [[mess.id, mess.subject,'S']];
    con.query(sql2, [values2], function (err, res)
      {
        if ( err){console.log(err);}
        else {
              console.log('Da luu voi id:'+ mess.id);
                // lưu vào bảng vị trí của người gửi
                var sql3 = "INSERT INTO `"+mess.nguoigui_number+"mes_detail` (ids, idp, name, lat, lon) VALUES ?";
                mess.pos.forEach(function(row)
                  {
                    var val = [[res.insertId, row.id, row.name, row.lat, row.lon]];
                    con.query(sql3, [val], function (err, res2) {if ( err){console.log(err);}});
                  });
                  // lưu vào bảng người nhận của người gửi
                var sql4 = "INSERT INTO `"+mess.nguoigui_number+"mes_sender` (ids,number, name, send_receive) VALUES ?";
                mess.nguoinhan.forEach(function(row5)
                  {
                    var val4 = [[res.insertId, row5.number, row5.name, 'S']];
                    con.query(sql4, [val4], function (err, res3) {if ( err){console.log(err);}});
                    con.query("SELECT * FROM `account` WHERE `number` LIKE '"+ row5.number +"' LIMIT 1", function(err, res)
                      {
                        if ( err ){console.log(err);}
                        else if ( res.length >0)
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
                                  var sql6 = "INSERT INTO `"+row5.number+"mes_sender` (ids,number, name, send_receive) VALUES ?";
                                  var val6 = [[ res5.insertId, mess.nguoigui_number,mess.nguoigui_name,'R']];
                                  con.query(sql6, [val6], function (err, res6) {
                                    if ( err){console.log(err);}
                                  else {
                                    var array_tinnhan = [];
                                    var tin = {lat:0.1, lon:0.0, name:"", id:""};
                                    mess.pos.forEach(function(row3){
                                        // lưu vào bảng vị trí của người nhan
                                        var sql7 = "INSERT INTO `"+row5.number+"mes_detail` (ids, idp, name, lat, lon) VALUES ?";
                                        var val7 = [[res5.insertId, row3.id, row3.name, row3.lat, row3.lon]];
                                        tin = {lat:row3.lat, lon: row3.lon, name:strencode(row3.name), id:strencode(row3.id)};
                                        array_tinnhan.push(tin);
                                        con.query(sql7, [val7], function (err, result) {
                                          if ( err){console.log(err);}
                                        else {
                                          console.log("Da insert vao mess detail "+ result.insertId);
                                        }
                                      });
                                      });
                                      // io.sockets.in(row5.number).emit('S_guitinnhan',{ name_nguoigui:strencode(mess.nguoigui_name),number_nguoigui:mess.nguoigui_number,
                                      //   subject: strencode(mess.subject), pos: mess.pos, id_tinnha_client:mess.id});
                                        io.sockets.in(row5.number).emit('S_guitinnhan',{ name_nguoigui:strencode(mess.nguoigui_name),number_nguoigui:mess.nguoigui_number,
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
    }); // end socket.on('sendmess', function(test)
  socket.on('danhantinnhan', function (nguoinhan, nguoigui, idc)
   	{
      let nhoms_nguoinhan = [];
      let nguoinhan1 = {number:nguoinhan, name:""};
      nhoms_nguoinhan.push(nguoinhan1);
      io.sockets.in(nguoigui).emit('C_danhantinnhan',{nguoinhan:nhoms_nguoinhan, idc:idc});
		console.log("user:" + nguoinhan+" đã nhan tin nhan ha ha ha:" + idc+ " tu nguoi gui;"+ nguoigui);
    //chuyển trạng thái trong db thành người nhận đã đọc được tin, báo về cho người gửi biết
    con.query("UPDATE `"+nguoinhan+"mes_main` SET `stt` = 'Y' WHERE `idc` LIKE '"+idc+"'",function(){
      console.log('ma san pham la '+idc);
      //  io.sockets.in(nguoigui).emit('C_danhantinnhan',{nguoinhan_number:nguoinhan, idc:idc});
    });

    con.query("SELECT * FROM `"+nguoigui+"mes_main` WHERE `idc` LIKE '"+idc+"' LIMIT 1", function(err11, res11)
      {
        if ( err11 || (res11.length ==0) ){console.log(err11);}
        else
          {
            con.query("UPDATE `"+nguoigui+"mes_main` SET `stt` = 'G' WHERE `idc` LIKE '"+idc+"' AND `send_receive` LIKE 'S'",function(err2,res2){
              con.query("UPDATE `"+nguoigui+"mes_sender` SET `stt` = 'G' WHERE `ids` LIKE '"+res11[0].id+"' AND `number` LIKE '"+nguoinhan+"'",function(err3,res3)
                {

                  //console.log('Da bao cho ' +nguoigui +' biet la '+nguoinhan + ' da nhan tin nhan '+idc);

                });

          });

          }

        });




    //trạng thái G cho biết, có một ai đó trong danh sách nhận đã nhận tin nhắn,

  });
  // khi người gửi biết rằng khách đã nhận được tin, chuyển màu sắc người nhận trong mục send sang đỏ và báo lại
  // server, kết thúc phần gửi tin cho khách hàng đó
  socket.on('tinnhan_final', function (nguoigui, id, nhom_nguoinhan){
		console.log('Da nhan tin nhan final');
      con.query("SELECT * FROM `"+nguoigui+"mes_main` WHERE `idc` LIKE '"+id+"' AND `stt` LIKE 'G' LIMIT 1", function(err, a1s){
        if ( err || ( a1s.length==0)) {console.log(err);}
        else {

          con.query("UPDATE `"+nguoigui+"mes_main` SET `stt` = 'OK' WHERE `idc` LIKE '"+id+"' AND `stt` LIKE 'G'",function(){
              console.log('ma san pham final la '+id);
            });
            nhom_nguoinhan.forEach((nguoinhan)=>{
              con.query("UPDATE `"+nguoigui+"mes_sender` SET `stt` = 'OK' WHERE `ids` LIKE '"+a1s[0].id+"' AND `number` LIKE '"+nguoinhan+"'",function(){
                  console.log('ma san pham final la '+id);
                });

            });


      		//	kết thúc quá trình gửi tin nhắn

        }

      });


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
              socket.emit('S_kq_check_contact_2',{user:strencode(row1.user), number: row1.number});console.log("Da tim thay:"+row1.user);
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

  });
  socket.on('W_check_contact', function (string){
    console.log("Chuoi nhan duoc la:"+string);
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
  });
  socket.on('W_add_friend',function(data){
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
    })
  })
  socket.on('C_join_room', function (room)  {
    socket.join(room);
    console.log('ten room la:' +room);


  });
  socket.on('W_join_room', function (room, number)  {
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





  });
  socket.on('C_leave_room', function (room) {
      if ( room !=null || room!=""){
      socket.leave(room);
      console.log('Da leave user khoi room 111: '+room+'hihihi');
    }

    });
  socket.on('C_leave_off',function(number){
      socket.leave(number);
      socket.emit('S_ok_log_off');//server đồng ý cho Client log off
    });
    //sự kiến check_contact xảy ra khi người dùng được thông báo acitve thành công, app sẽ lấy  toàn bộ danh sách
    // để gửi lên server để server lưu và kiểm tra xe liệu trong đó có ai đã tham gia ePos rồi chưa
  socket.on('check_contact_full', function (arr_contact){
    //người dùng mới đăng nhập và sẽ gửi lên một đống cái contact, lúc này
    //server không gửi trả về từng contact mà gửi chung cả cụm.
    var mang_contact = [];
    var contact = {name : "", number : "", code: ""};
    con.query("SELECT * FROM `account` WHERE `number` LIKE '"+arr_contact.hostnumber+"' AND `pass` LIKE '"+ arr_contact.pass+"' LIMIT 1", function(err1, rows1){
        if (err1 || rows1.length ==0){
        // Nếu đăng nhập sai
        socket.emit('firscheckwrong');
        console.log("Dang nhap first khong dung"+user1);
        }
      else{
            console.log("Contact nhan duoc la:"+arr_contact.contact.length);
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
    });

    });//check_contact
  socket.on('C_got_friend', function (host,pass,number){
    console.log(host+" " + number);
    // con.query("DELETE FROM `"+host+"contact` WHERE `number` LIKE '"+number+"'", function(err){console.log('loi delete'+err)});
    con.query("UPDATE `"+host+"contact` SET `fr` = 'OK' WHERE `number` LIKE '"+number+"'",function(err3, ok){ console.log('loi update'+err)});
  });
  socket.on('C_pos_online', function (info){
    if ( info != null){
    info.room.forEach(function(room){
          io.sockets.in(room.room_fullname).emit('S_pos_online',{lat:info.lat, lon:info.lon, name:strencode(info.user_name), number:info.user_number});
          console.log('da gui cho '+room.room_fullname + 'AAAAA' +info.stt+ "ten la:"+ info.user_name );
        });
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
      console.log(info);
      let member = [];
      let mem = {name:"", number:""};
      if (info.member_list.length >0)
      {
        info.member_list.forEach(function(row){
          // kiểm tra xem thành viên này có tài khoản chưa
          con.query("SELECT * FROM `account` WHERE `number` LIKE '"+ row.number +"' LIMIT 1", function(err, kq)
            {
              if(err || (kq.length ==0)){console.log(err);}
              else {
                  mem = {name: strencode(row.name), number: row.number};
                  member.push(mem);
                  con.query("SELECT * FROM `"+row.number+"mes_main` WHERE `idc` LIKE '"+ info.fullname +"' LIMIT 1", function(err, rows)
                    {
                      if(err || (rows.length >0)){console.log(err);}
                      else
                       {

                            var sql = "INSERT INTO `"+row.number+"mes_main` (idc, subject, send_receive, stt ) VALUES ?";
                            var val = [[ info.room_fullname, info.room_name,'O', 'N']];
                            con.query(sql, [val], function (err, res)
                            {
                              if ( err){console.log(err);}
                              else
                              {
                              let sql2 = "INSERT INTO `"+row.number+"mes_sender` (ids, number, name, send_receive ) VALUES ?";
                                info.member_list.forEach(function(row2)
                                {
                                  if (row2.number ==info.admin_number)
                                  {
                                    let val2 = [[res.insertId,row2.number,row2.name,'OM']];
                                    con.query(sql2, [val2], function (err)
                                    {
                                      if ( err){console.log(err);}
                                      else { console.log('da insert 1');}
                                    });
                                  }
                                  else
                                  {
                                    var val2 = [[res.insertId,row2.number,row2.name,'O']];
                                    con.query(sql2, [val2], function (err) {if ( err){console.log(err);}
                                    else {
                                      console.log('da insert 2');
                                  }

                                  });

                                  }

                                });
                                  io.sockets.in(row.number).emit('S_send_room',{admin_number: info.admin_number , admin_name: strencode(info.admin_name), room_name:strencode(info.room_name) ,room_fullname:strencode(info.room_fullname), member_list:member});
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
  socket.on('C_change_pass', function(user, oldpass, newpass){
    con.query("SELECT * FROM `account` WHERE `number` LIKE '"+ user +"' AND `pass` LIKE '"+ oldpass+"' LIMIT 1", function(err, rows)
      {
        if (err||rows.length==0){ console.log(err+":"+rows);socket.emit('change_pass_sai_old_pass');}
        else
          {
            con.query("UPDATE `account` SET `pass` = '"+newpass+"' WHERE `number` LIKE '"+user+"'",function(err3, ok)
          {
              if ( err3 ){console.log('update bị loi'+err3);}
              else
                {
                  socket.emit('change_pass_ok', {passmoi:newpass});
                }
            });
          }
        });


  });
  socket.on('C_get_add_mem', function(info){
    console.log('Da nhan su kien C get add mem');
    // lượn qua xem tài khoản đó có tồn tại hay không
    con.query("SELECT * FROM `account` WHERE `number` LIKE '"+info.user+"' AND `pass` LIKE '"+info.pass+"' LIMIT 1", function(err, kq)
    {
      if (err || (kq==0)){console.log(err);}
      else {
        //kiêm tra xem room đó có trên server hay không
        con.query("SELECT * FROM `" + info.user+"mes_main` WHERE `idc` LIKE '"+info.room_fullname+"' LIMIT 1", function(err1, rows){
          if ( err1 || (rows.length ==0)){console.log(err);}
          else {
            //info.member.forEach(mem)=>{
          info.member.forEach(function(mem)
              {
              con.query("UPDATE `"+info.user+"mes_sender` SET `stt` = 'Y' WHERE `number` LIKE '"+mem.number+"' AND `ids` LIKE '"+rows[0].id+"'",function(err4){if (err4){console.log(err4);}});
            });
            con.query("SELECT 'id' FROM `" + info.user+"mes_sender` WHERE `ids` LIKE '"+rows[0].id+"' AND `stt` LIKE 'N' LIMIT 1", function(err2, rows2){
              if (err2 || (rows2.length >0)) {console.log(err2);}
              else {
                  con.query("UPDATE `"+info.user+"mes_main` SET `stt` = 'Y' WHERE `id` LIKE '"+rows[0].id+"'",function(err3){if (err3){console.log(err3);}});
              }
            });

          }
        });
      }
    });

  });
  socket.on('C_bosung_member', function(info){
    console.log(info);
    // xác minh tài khoản đủ điều kiện để bổ sung thành viên không
    con.query("SELECT * FROM `account` WHERE `number` LIKE '"+info.admin+"' AND `pass` LIKE '"+info.pass+"' LIMIT 1", function(err, rows6)
    {
      if (err || (rows6==0)){console.log('co loi 1' + err);}
      else {
        socket.emit ('S_get_bosung_member');
        let mem3 = {name:"", number:""};
    //bổ sung thành viên mới cho người cũ
        info.old_list.forEach((member)=>{
            let member3 = [];
            con.query("SELECT * FROM `" + member.number+"mes_main` WHERE `idc` LIKE '"+info.room_full_name+"' LIMIT 1", function(err1, rows){
              if ( err1 || (rows.length ==0 )){console.log('co loi 2 '+err1);}
              else { let sql2 = "INSERT INTO `"+member.number+"mes_sender` (ids,number, name, send_receive, stt) VALUES ?";
            info.new_list.forEach((mem2)=>{
              let values2 = [[rows[0].id, mem2.number, mem2.name, 'O', 'N']];
              con.query(sql2, [values2], function (err2, res){
                if (err2){console.log('co loi 3 '+err2);}
                else {
                console.log('Da insert thanh cong '+ res.id);
                }
              });
              mem3 = {name:strencode(mem2.name), number:mem2.number};
              member3.push(mem3);
              console.log('da ok 1'+mem3);
            });
            con.query("UPDATE `"+member.number+"mes_main` SET `stt` = 'M' WHERE `send_receive` LIKE 'O' AND `idc` LIKE '"+info.room_full_name+"'",function(err3){
                if (err3){console.log('co loi 4'+err3);}
              });
            io.sockets.in(member.number).emit('S_add_mem',{ room_fullname:strencode(info.room_full_name), member_list:member3});
            console.log('a gui room di cho nguoi cu:'+info.room_name + ' danh sach la:'+member3);
          } }); });
      // thông báo room cho thành viên mới
        info.new_list.forEach((member1)=>{
       //kiểm tra xem thành viên mới này có tài khoản chưa.
            con.query("SELECT * FROM `account` WHERE `number` LIKE '"+ member1.number +"' LIMIT 1", function(err4, kq){
           if ( err4 || (kq.length == 0)){console.log('co loi 5'+err4);}
           else {
             //nếu tài khoản đó đã có, kiêm tra xem cái room đó đã có trong bảng chưa
             con.query("SELECT * FROM `"+member1.number+"mes_main` WHERE `idc` LIKE '"+ info.room_full_name +"' LIMIT 1", function(err8, row1s)
               {
                 if(err8 || (row1s.length >0)){console.log('co loi 6' + err8);}
                 else {
                    let member = [];
                    let mem = {name:"", number:""};
                    //lưu vào bảng chính
                    var sql = "INSERT INTO `"+member1.number+"mes_main` (idc, subject, send_receive, stt ) VALUES ?";
                    var val = [[ info.room_full_name, info.room_name,'O', 'N']];
                    con.query(sql, [val], function (err5, res){
                      if ( err5){console.log('co loi 7'+err5);}
                      else {
                        let sql2 = "INSERT INTO `"+member1.number+"mes_sender` (ids, number, name, send_receive ) VALUES ?";
                          info.full_list.forEach(function(row4){

                              mem = {name:strencode(row4.name), number:row4.number}
                              member.push(mem);
                              if (row4.number ==info.admin){
                                let val2 = [[res.insertId,row4.number,row4.name,'OM']];
                                con.query(sql2, [val2], function (err6) {
                                  if ( err6){console.log('co loi 8'+err6);}
                                  else { console.log('da insert 1');}
                                });
                              }
                              else  {
                                var val2 = [[res.insertId,row4.number,row4.name,'O']];
                                con.query(sql2, [val2], function (err7) {
                                  if ( err7){console.log('Da co loi'+err7);}
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
  socket.on('C_get_room', function(info){
    console.log('Da nhan room roi:' + info.fullname);
      con.query("UPDATE `"+info.number+"mes_main` SET `stt` = 'Y' WHERE `send_receive` LIKE 'O' AND `idc` LIKE '"+info.fullname+"'",function(err){
      if ( err){console.log(err);}
    });

  });
});
}});
