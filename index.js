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

// cb.validatePhone('+84982025401','reverse_cli',(a1,a2)=>{
//   if(a1){console.log(a1);}
//   else {
//     console.log(a2);
//   }
// });

var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })
isArray = function(a) {
    return (!!a) && (a.constructor === Array);
}

con.connect(function(err) {
    if (err) { console.log(" da co loi:" + err);}
    else {
      app.get('/', (req, res) => res.render('dangnhap3'));
      app.post('/', urlencodedParser, function (req, res){
        if (!req.body) return res.sendStatus(400)
        else {
          if(req.body.number&&req.body.code&&req.body.pass){
            var full_number = "+"+req.body.code + req.body.number.replace('0','');
            con.query("SELECT * FROM `account` WHERE `number` LIKE '"+full_number+"' LIMIT 1", function(err, rows){
              if (err || rows.length ==0){res.render('dangnhap3', {noidung:'Tài khoản này không tồn tại'});}
              else{
                if (passwordHash.verify(req.body.pass, rows[0].pass)){
                  res.render('home2');
                  // req.session.number = full_number;
                }
                else {res.render('dangnhap3', {noidung:'Mật khẩu không đúng'});}
              }
            });
          }
          else {
            res.render('dangnhap3', {noidung:'Mật khẩu không đúng'});
          }
        }
      })
function kiemtra_taikhoan(){
  setTimeout(function() {
    //sau mỗi phút, kiêm tra db và xóa các bản tin đã quá 10 phút ==600 giây
    var date2 = Math.floor(Date.now() / 1000) - 600;
    // mở khóa cho số điện thoại hoặc phoneid bị khóa
    con.query(" DELETE FROM `dangky` WHERE `time2` < "+date2, function(err){if(err){console.log('co loi HA HA HA:'+err);}});
    kiemtra_taikhoan();
  }, 5000);
}
kiemtra_taikhoan();

io.on('connection',(socket)=>
{
  console.log(socket.id);
  // socket.emit('truy_cap_moi_hoithao');
  // socket.on('hoithao',(tin)=>{
  //   if(tin.toandoan != null){
  //
  //     con.query("SELECT * FROM `thoigian` WHERE `ma_so` LIKE 'A1' LIMIT 1", function(err10, row10s){
  //         if(err10)console.log(err10);
  //         else {
  //           if(row10s[0].time>tin.toandoan)
  //           {
  //             con.query("SELECT * FROM `toandoan` ", function(err, rows){
  //               if (err){console.log('co loi 1:'+err);}
  //               else{
  //                 let tin=[];
  //                 rows.forEach((row,key)=>{
  //                   tin.push({donvi:strencode(row.donvi),tongdiem:row.tongdiem,bonmon:row.bonmon,chiensikhoe:row.chiensikhoe,boivutrang:row.boivutrang,chayvutrang:row.chayvutrang,k16:row.k16,bongchuyen:row.bongchuyen,keoco:row.keoco,chay10000m:row.chay10000m,caulong:row.caulong,bongban:row.bongban});
  //                   if(key===(rows.length-1)){
  //                     con.query("SELECT * FROM `danhsach_monthi` ", function(err3, row3s){
  //                      if (err3){console.log('co loi 2:'+err3);}
  //                      else {
  //                        let monthi=[];
  //                        row3s.forEach((row3,key3)=>{
  //                          monthi.push(strencode(row3.ten));
  //                          if(key3===(row3s.length-1)){
  //                            con.query("SELECT * FROM information_schema.columns WHERE table_name = 'toandoan'", function(err1, row1s){
  //                              if (err1){console.log('co loi 2:'+err1);}
  //                              else {
  //                                  let noidung=[];
  //                                  row1s.forEach((row1,key1)=>{
  //                                    noidung.push(row1.COLUMN_NAME);
  //                                    if(key1===(row1s.length-2)){
  //                                      con.query("UPDATE `thoigian` SET `time` = "+time.getTime()+" WHERE `ma_so` LIKE 'A1' ",function(err11,res11)
  //                                          {if(err11){console.log(err11);}
  //                                      });
  //                                       socket.emit('toan_doan',monthi,noidung,tin, time.getTime());
  //
  //                                       return false;
  //                                    }
  //                                  });
  //                              }
  //                            });
  //
  //                          }
  //                        });
  //                      }
  //                     });
  //                   }
  //                 });
  //
  //
  //               }
  //               });
  //             // có nghĩa là một trong những bảng từng môn có sự thay đổi, bây giờ bắt đầu đi lấy từng bảng gửi về
  //
  //           }
  //           else {
  //             socket.emit('ketqua_toandan_ok');
  //           }
  //         }
  //     });
  //     // con.query("SELECT * FROM `bongchuyen` WHERE `ma_doi` IS NOT NULL ", function(err, rows){
  //
  //   }
  // });
  // socket.on('reg_monthi',()=>{
  //   con.query("SELECT * FROM `danhsach_monthi`", function(err, rows){
  //       if(err)console.log(err);
  //       else {
  //           let tin=[];
  //           rows.forEach((row,key)=>{
  //             tin.push({monthi:strencode(row.ten),code:row.code,type:row.type});
  //             if(key===(rows.length-1))socket.emit('S_send_monthi',tin);
  //           });
  //         }
  //       });
  //       con.query("SELECT * FROM `list_donvi`", function(err1, row1s){
  //           if(err1)console.log(err1);
  //           else {
  //             let tin1=[];
  //             row1s.forEach((row1,key)=>{
  //               tin1.push({ten:strencode(row1.donvi),code:row1.code});
  //               if(key==(row1s.length-1))socket.emit('S_list_donvi',tin1);
  //             });
  //           }
  //       });
  //       con.query("SELECT * FROM `list_loi`", function(err, rows){
  //           if(err)console.log(err);
  //           else {
  //               let tin=[];
  //               rows.forEach((row,key)=>{
  //                 tin.push({monthi:strencode(row.ten),code_monthi:row.code_monthi,type:row.type,loi:strencode(row.ten_loi), code_loi:row.code_loi, diem:row.diem});
  //                 if(key===(rows.length-1))socket.emit('S_send_list_loi',tin);
  //               });
  //             }
  //           });
  //
  // });
  // socket.on('C_reg_trandau',(code,type)=>{
  //   console.log(code +":"+type);
  //   con.query("SELECT * FROM `"+code+"`", function(err, rows){
  //       if(err)console.log(err);
  //       else {
  //           if(type=="a" && code=="a8"){
  //             let tin=[];
  //             rows.forEach((row,key)=>{
  //               con.query("SELECT * FROM `"+code+"loi` WHERE `maso` LIKE '"+row.tt+"'", function(err2, r2s){
  //                   if(err2)console.log(err2);
  //                   else {
  //                     if(r2s.length>0){
  //                     let loi1=[];
  //                     r2s.forEach((r2,key2)=>{
  //                       loi1.push({code_monthi:code, ten:strencode(r2.ten),code:r2.code,type:r2.type,diem:r2.diem,solan:r2.solan,tong:r2.tong});
  //                       if(key2===(r2s.length-1)){
  //                         tin.push({code_monthi:code,ten:strencode(row.ten),donvi:strencode(row.donvi),code:row.code,thoigian:row.thoigian,loi:loi1,ketqua:row.ketqua});
  //                         if(key===(rows.length-1)){socket.emit('S_send_trandau','a',tin);console.log('Đã send trận đấu');}
  //                       }
  //                     });
  //                   }
  //                   else {
  //                     let loi1=[];
  //                     tin.push({code_monthi:code,ten:strencode(row.ten),donvi:strencode(row.donvi),code:row.code,thoigian:row.thoigian,loi:loi1,ketqua:row.ketqua});
  //                     if(key===(rows.length-1)){socket.emit('S_send_trandau',tin);console.log('Đã send trận đấu');}
  //
  //                   }
  //                 }
  //               });
  //             });
  //           }
  //           else if(code=="a6") {
  //
  //             let tin=[];
  //             rows.forEach((row,key)=>{
  //               con.query("SELECT * FROM `"+code+"full` WHERE `ma` LIKE '"+row.ma+"'", function(err2, r2s){
  //                 if(err2)console.log(err2);
  //                 else {
  //                   let tin1=[];
  //                   r2s.forEach((r2,key2)=>{
  //                     tin1.push({time:r2.time,doi1:strencode(r2.doi1),doi2:strencode(r2.doi2),setnumber:r2.setnumber,diem11:r2.diem11,diem12:r2.diem12,diem13:r2.diem13,diem14:r2.diem14,diem15:r2.diem15,diem21:r2.diem21,diem22:r2.diem22,diem23:r2.diem23,diem24:r2.diem24,diem25:r2.diem25});
  //                     if(key2==(r2s.length-1)){
  //                       tin.push({ten:strencode(row.ten),tran:tin1});
  //                       if(key==(rows.length-1)){socket.emit("S_send_trandau_b",tin);
  //                       console.log("đã gửi tin b đi");
  //                     }
  //                     }
  //                   });
  //                 }
  //               });
  //             });
  //           }
  //         }
  //       });
  // });
  // socket.on('trongtai_bongchuyen',(tin,number)=>{
  //   console.log(tin);
  //   console.log(number);
  //   con.query("SELECT * FROM `bongchuyen` ", function(err, rows){
  //       if(err)console.log(err);
  //       else {
  //         rows.forEach((row,key)=>{
  //           if(number==0) socket.emit('S_trongtai_bongchuyen',{matran:row.matran,tentran:strencode(row.tentran),time:row.time,doi1:strencode(row.doi1),doi2:strencode(row.doi2),setnumber:row.setnumber,diem11:row.diem11,diem12:row.diem12,diem13:row.diem13,diem14:row.diem14,diem15:row.diem15,diem21:row.diem21,diem22:row.diem22,diem23:row.diem23,diem24:row.diem24,diem25:row.diem25});
  //           else {
  //             let test = true;
  //             tin.forEach((tin1,key1)=>{
  //             if(row.matran===tin1.matran){
  //               console.log(tin1.matran);
  //                 if(row.time > tin1.time){
  //                   console.log('tim thay');
  //                   socket.emit('S_trongtai_bongchuyen',{matran:row.matran,tentran:strencode(row.tentran),time:row.time,doi1:strencode(row.doi1),doi2:strencode(row.doi2),setnumber:row.setnumber,diem11:row.diem11,diem12:row.diem12,diem13:row.diem13,diem14:row.diem14,diem15:row.diem15,diem21:row.diem21,diem22:row.diem22,diem23:row.diem23,diem24:row.diem24,diem25:row.diem25});
  //                   test = false;
  //                   return false;
  //                 }
  //               }
  //             if(key1===(tin.length-1)){if(test)socket.emit('S_trongtai_bongchuyen',{matran:row.matran,tentran:strencode(row.tentran),time:row.time,doi1:strencode(row.doi1),doi2:strencode(row.doi2),setnumber:row.setnumber,diem11:row.diem11,diem12:row.diem12,diem13:row.diem13,diem14:row.diem14,diem15:row.diem15,diem21:row.diem21,diem22:row.diem22,diem23:row.diem23,diem24:row.diem24,diem25:row.diem25});}
  //             });
  //           }
  //         });
  //     }
  //   });
  // });
  // socket.on('C_ketqua_bongchuyen',(tin)=>{
  //   let time1  =new Date().getTime();
  //   if(tin.setnumber==3){
  //     con.query("UPDATE `bongchuyen` SET `time`= "+time1+",`diem11` = "+tin.doi1.set1+",`diem12` = "+tin.doi1.set2+",`diem13` = "+tin.doi1.set3+ ",`diem21` = "+tin.doi2.set1+" ,`diem22` = "+tin.doi2.set2+",`diem23` = "+tin.doi2.set3+" WHERE `matran` LIKE '"+tin.matran+"'",function(err,res)
  //       {if(err){console.log(err);}
  //       else {
  //         socket.emit('send_ketqua_bongchuyen_ok',{time:time1, matran:tin.matran,setnumber:3,diem11:tin.doi1.set1,diem12:tin.doi1.set2,diem13:tin.doi1.set3,diem21:tin.doi2.set1,diem22:tin.doi2.set2,diem23:tin.doi2.set3});
  //       }
  //   });
  // }
  // else {
  //   con.query("UPDATE `bongchuyen` SET `time`="+time1+",`diem11` = "+tin.doi1.set1+",`diem12` = "+tin.doi1.set2+",`diem13` = "+tin.doi1.set3+ ",`diem14` = "+tin.doi1.set4+ ",`diem15` = "+tin.doi1.set5+ ",`diem21` = "+tin.doi2.set1+" ,`diem22` = "+tin.doi2.set2+",`diem23` = "+tin.doi2.set3+",`diem24` = "+tin.doi2.set4+ ",`diem25` = "+tin.doi2.set5+ " WHERE `matran` LIKE '"+tin.matran+"'",function(err1,res1)
  //       {if(err1){console.log(err1);}
  //       else {
  //         socket.emit('send_ketqua_bongchuyen_ok',{time:time1,matran:row.matran,setnumber:5,diem11:tin.doi1.set1,diem12:tin.doi1.set2,diem13:tin.doi1.set3,diem14:tin.doi1.set4,diem15:tin.doi1.set5,diem21:tin.doi2.set1,diem22:tin.doi2.set2,diem23:tin.doi2.set3,diem24:tin.doi2.set4,diem25:tin.doi2.set5});
  //       }
  //
  //   });
  // }
  // });
  socket.emit('check_pass');
  socket.on('C_check_numberphone',(idphone,num)=>{
    if(idphone&&num){
    var date = Math.floor(Date.now() / 1000);
    con.query("SELECT * FROM `dangky` WHERE `phone_id` LIKE '"+idphone+"'", function(err1, rows1){
      if(err1){console.log(err1);}
      else {
        if(rows1.length >2){socket.emit('regis1_quasolan_number');}
        else {
          var sql = "INSERT INTO `dangky`(phone_id,time1, time2) VALUES ?";
          var values = [[idphone,date,date]];
          con.query(sql, [values], function (err4, result) {
            if (err4){console.log(err4);}
            else {
              con.query("UPDATE `dangky` SET `time2` = '"+date+"' WHERE `phone_id` LIKE '"+idphone+"'",function(err5, ok){
                if (err5){console.log('update bị loi'+err5);}
                else {
                  con.query("SELECT * FROM `account` WHERE `number` LIKE '"+ num +"' LIMIT 1", function(err2, rows2){
                    if(err2){console.log(err2);}
                    else {
                      if (rows2.length >0 ){socket.emit('regis_already_account');}
                      else {
                        cb.phoneInformation(num,(error3,ketqua) => {
                          if(error3){socket.emit('sodienthoaikhongdung');}
                          else if (!ketqua.is_mobile){socket.emit('sodienthoaikhongdung');}
                          else {socket.emit('number_phone_ok',num,'BECCEBC1-DB76-4EE7-B475-29FCF807849C');}
                        });
                      }
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
  socket.on('C_check_forget',(idphone,num)=>{
    if(idphone&&num){
    var date = Math.floor(Date.now() / 1000);
    con.query("SELECT * FROM `dangky` WHERE `phone_id` LIKE '"+idphone+"'", function(err1, rows1){
      if(err1){console.log(err1);}
      else {
        if(rows1.length >2){socket.emit('regis1_quasolan_number');console.log('qua so lan dang ky');}
        else {
          var sql = "INSERT INTO `dangky`(phone_id,time1, time2) VALUES ?";
          var values = [[idphone,date,date]];
          con.query(sql, [values], function (err4, result) {
            if (err4){console.log(err4);}
            else {
              con.query("UPDATE `dangky` SET `time2` = '"+date+"' WHERE `phone_id` LIKE '"+idphone+"'",function(err5, ok){
                if (err5){console.log('update bị loi'+err5);}
                else {
                  con.query("SELECT * FROM `account` WHERE `number` LIKE '"+ num +"' LIMIT 1", function(err2, rows2){
                    if(err2){console.log(err2);}
                    else {
                      if (rows2.length ==0 ){socket.emit('taikhoankhongco');}
                      else {
                        cb.phoneInformation(num,(error3,ketqua) => {
                          if(error3){socket.emit('sodienthoaikhongdung');}
                          else if (!ketqua.is_mobile){socket.emit('sodienthoaikhongdung');}
                          else {socket.emit('number_phone_ok',num,'BECCEBC1-DB76-4EE7-B475-29FCF807849C');}
                        });
                      }
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
  socket.on('C_revify_number_ok',(idphone, number)=>{
    if(idphone&&number){
      con.query("UPDATE `real_number` SET `number` = '"+number+"' WHERE `id_phone` LIKE '"+idphone+"'",function(err5, ok){
        if (err5){console.log('update bị loi'+err5);}
        else {
          if(ok.insertId==0){
          var sql = "INSERT INTO `real_number`(id_phone,number) VALUES ?";
          var values = [[idphone,number]];
          con.query(sql, [values], function (err4, result) {
            if (err4){console.log(err4);}
            else {
              socket.emit('S_save_real_number_ok');
            }
          });
        }
        else {
          socket.emit('S_save_real_number_ok');

        }
        }
      });

    }
  });
  socket.on('regis', function (user_info){
    if(user_info.number&&user_info.user&&user_info.code&&user_info.pass){
    socket.emit('dangky_thanhcong');
    con.query("SELECT * FROM `account` WHERE `number` LIKE '"+ user_info.number +"' LIMIT 1", function(err, rows){
            // nếu tài khoản đã có người đăng ký rồi thì:
            if(err){console.log(err);}
            else {
              if (rows.length >0 )	{socket.emit('regis_already_account');}
              else {

                    // TẠO RA CACS BẢNG THÔNG TIN CHO NGƯỜI DÙNG
                      // 1. Bảng chính: lưu id của bản tin đó trên server, id của người dùng, tên tin nhắn, tin nhắn gửi đi hay tin nhắn nhận về, trạng thái gửi đi hay nhận về.
                      con.query("CREATE TABLE IF NOT EXISTS  `"+user_info.number+"mes_main` (`id` BIGINT NOT NULL AUTO_INCREMENT,`idc` CHAR(60) NOT NULL, `subject` VARCHAR(20) NOT NULL,`send_receive` VARCHAR(5) NOT NULL,`stt` VARCHAR(5) NULL , `read_1` CHAR(3), `time` DATETIME(6), PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC))", function(err){console.log(err)});
                      //2. Bảng địa điểm: lưu id bản tin đó trên server, tên điểm, tọa độ điểm
                      con.query("CREATE TABLE IF NOT EXISTS `"+user_info.number+"mes_detail` (`id` BIGINT NOT NULL AUTO_INCREMENT,`ids` BIGINT NOT NULL,`idp` CHAR(20) NOT NULL,`name` VARCHAR(45) NOT NULL,`lat` DOUBLE NULL,`lon` DOUBLE NULL,PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC))", function(err){console.log(err)});
                      //3. Bảng  thông tin người gửi hoặc nhận: gồm number, tên, là người gửi hay nhận, trạng thái nhận hay gửi được chưa
                      con.query("CREATE TABLE IF NOT EXISTS `"+user_info.number+"mes_sender` (`id` BIGINT NOT NULL AUTO_INCREMENT,`ids` INT NOT NULL,`number` VARCHAR(20) NOT NULL,`name` VARCHAR(45) NULL,`send_receive` VARCHAR(5), `stt` VARCHAR(5) NULL,PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC))", function(err){console.log(err)});
                      con.query("CREATE TABLE IF NOT EXISTS `"+user_info.number+"contact` (`id` INT NOT NULL AUTO_INCREMENT,`number` VARCHAR(20) NOT NULL,`name` VARCHAR(45) NOT NULL,`fr` VARCHAR(5) NULL,`code` VARCHAR(10) NULL,PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC))", function(err){console.log(err)});
                      con.query("SELECT `number` FROM `account` ", function(err, row3s)
                        {
                          if (err) {console.log('select loi '+ err);}
                          else if ( row3s.length >0)
                            {
                              row3s.forEach(function (row3)
                                {
                                  con.query("SELECT * FROM `"+row3.number+"contact` WHERE `number` LIKE '"+user_info.number+"'", function(err, row4s)
                                    {

                                      if ( err) {console.log('có loi select');}
                                      else if (row4s.length >0)
                                        {
                                          con.query("UPDATE `"+row3.number+"contact` SET `fr` = 'Y' WHERE `number` LIKE '"+user_info.number+"'",function(err3, ok)
                                          {
                                            //gửi thông báo cho ngươi kia biết là ông này đã tham gia ePos
                                            if ( err3 ){console.log('update bị loi'+err3);}
                                            else{io.sockets.in(row3.number).emit('contact_joined', {number:user_info.number,name:user_info.user, code:user_info.code});}
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
                      socket.emit('dangky_thanhcong');

              } //end else 1
            }
      });//end db.account
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
  socket.on('C_yeucau_chuoi_forgotpass',function(idphone, num){
    if(idphone&&num){
    con.query("SELECT * FROM `account` WHERE `number` LIKE '"+ num +"'", function(err, rows){
      if(err){console.log(err);}
      else {
        if (rows.length == 0 )	{
             socket.emit('taikhoankhongco');
             }
          else {
              con.query("SELECT * FROM `danhsachkhoa` WHERE `number` LIKE '"+ num +"' OR `phoneid` LIKE '"+idphone+"' LIMIT 1", function(err4, rows4){
                if(err4){console.log(err4);}
                else {
                  if(rows4.length >0){socket.emit('C_yeucauchuoi_quasolan');}
                  else {
                    var date = Math.floor(Date.now()/1000);
                    var string = Math.floor(Math.random() * (89998)) + 10001;
                    cb.sendMessage({to:'84982025401', text:'Mesage from ePos'}, (error, response) => {
                        if(error){console.log(error); socket.emit('sodienthoaikhongtontai');}
                        else {
                          console.log(response);
                          socket.emit('S_guichuoi_xacnhan_forget');// để Client chuyển sang giao diện chờ nhập chuỗi
                          //kiểm tra xem bảng xác thực đã có số điện thoại đó chưa, nếu có rồi thì update, nếu chưa có thì thêm mới
                          con.query("SELECT * FROM `xacthuc` WHERE `number` LIKE '"+ num +"'", function(err6, rows6){
                            if(err6){console.log(err6);}
                            else {
                                // cho phép đăng ký liên tục 3 lần, nếu là lần đầu
                              if(rows6.length==0){
                                var sql = "INSERT INTO `xacthuc` (number,chuoi,phoneid,date,status) VALUES ?";
                                var values = [[num, string,idphone,date,'Y']];
                                con.query(sql, [values], function(err, result){
                                  if(err){console.log(err);}
                                  else {
                                    con.query("SELECT * FROM `xacthuc` WHERE `phoneid` LIKE '"+ idphone +"'", function(err9, rows9){
                                    if(rows9.length >=3){
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
    }
  });
  socket.on('C_send_chuoi_forgot',function(num,chuoi,pass){
    if(num&&chuoi&&pass){
      con.query("SELECT * FROM `xacthuc` WHERE `number` LIKE '"+ num +"' AND `chuoi` LIKE '"+chuoi+"' AND `status` LIKE 'Y'", function(err1, row1s) {
          if((err1)|| (row1s.length==0)) {socket.emit('S_chuoikhongdung');}
          else {
            con.query("UPDATE `account` SET `pass` = '"+passwordHash.generate(pass)+"' WHERE `number` LIKE '"+num+"'",function(){
            socket.emit('S_doipass_thanhcong');
          });
          }
      });
    }
  });
  socket.on('C_change_pass_admin',function(id,num,pass){
    if(num&&id&&pass){
      con.query("SELECT * FROM `real_number` WHERE `id_phone` LIKE '"+id+"' LIMIT 1", function(err1, rows1){
        if(err1){console.log(err1);}
        else {
          if(rows1[0].number==num){
            con.query("UPDATE `account` SET `pass` = '"+passwordHash.generate(pass)+"' WHERE `number` LIKE '"+num+"'",function(){
              socket.emit('S_doipass_thanhcong');

              con.query("DELETE FROM `real_number` WHERE `id_phone` LIKE '"+id+"'", function(err2,kq)
                    {
                      if (err2){console.log(err2);}


                    });
              });
          }
          else {
            socket.emit('doi_pass_ko_ok');
          }
        }
      });
    }
  });
  socket.on('login1',(user1, pass1)=>{
    console.log('có nhận login 1');
    if(user1&&pass1){
      con.query("SELECT * FROM `account` WHERE `number` LIKE '"+user1+"' LIMIT 1", function(err, rows){
  	     if (err || rows.length ==0){socket.emit('login1_khongtaikhoan');}
  			 else{
          if (passwordHash.verify(pass1, rows[0].pass)){
              socket.emit('login1_dung', {name:strencode(rows[0].user)});
          }
          else {
            socket.emit('login1_sai', {name:strencode(rows[0].user)});
            console.log('login 1 sai');
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
            //lấy bảng inbox
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
                          con.query("SELECT * FROM `"+socket.number+"mes_sender` WHERE `send_receive` LIKE 'S' AND `ids` LIKE '"+a1.id+"'", function(err2, a2s){
                            if(err2){console.log(err2);}
                            else {
                              a2s.forEach(function(a2,key2){
                                nhomnguoinhan.push({number:a2.number, name:strencode(a2.name),stt:a2.stt});
                                if(key2 === (a2s.length-1)){
                                  socket.emit('S_send_send',{ids:a1.id,subject:strencode(a1.subject), idc:a1.idc,time:get_time(a1.time), nguoinhan:nhomnguoinhan});
                                }
                              });
                            }
                          });
                       });
                     }
            });
            // lấy bảng save
            con.query("SELECT * FROM `"+socket.number+"mes_main` WHERE `send_receive` LIKE 'H' AND `id` > "+data.save+" ORDER BY `id` ASC", function(err1, a1s)
              {
                  if (err1){console.log(err1);}
                  else if(a1s.length >0){
                    a1s.forEach(function(a1,key){
                      console.log('có gửi save đi:');
                      socket.emit('S_send_save',{ids:a1.id,subject:strencode(a1.subject), idc:a1.idc,time:get_time(a1.time)});
                    });
                  }
              });
            // // lấy bảng contact
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
            // con.query("SELECT * FROM `"+socket.number+"mes_main` WHERE `send_receive` LIKE 'P' AND `id` > "+data.group+" ORDER BY `id` ASC", function(err1, a1s)
            //  {
            //   if ( err1){console.log(err1);}
            //   else if( a1s.length > 0)
            //     {
            //       let tinfull;
            //       a1s.forEach(function(a1,key){
            //           let mangcontact = [];
            //           con.query("SELECT * FROM `"+socket.number+"mes_sender` WHERE `ids` LIKE '"+a1.id+"'", function(err2, a2s){
            //            if(err2){console.log(err2);}
            //            else {
            //              if(a2s.length>0){
            //                a2s.forEach(function(a2,key2){
            //                  mangcontact.push({name:strencode(a2.name), number:a2.number});
            //                  if(key2===(a2s.length-1)){
            //                    tinfull={ids:a1.id,idc:a1.idc,subject:strencode(a1.subject),contact_list:mangcontact};
            //                    socket.emit('S_send_group',tinfull);
            //
            //                  }
            //                });
            //              }
            //            }
            //          });
            //       });
            //     }
            //   });
            // // Lấy danh sách room
            con.query("SELECT * FROM `"+socket.number+"mes_main`  WHERE `send_receive` LIKE 'O' AND `id` > "+data.online+" ORDER BY `id` ASC", function(err1, a1s){
                if (err1){console.log('Da co loi room full:'+err1);}
                else if(a1s.length>0)
                  {
                     a1s.forEach(function(a1,key){
                      con.query("SELECT * FROM `"+socket.number+"mes_sender` WHERE `ids` LIKE '"+a1.id+"' AND `send_receive` LIKE 'A' LIMIT 1 ", function(err5, a5s)
                        {
                          if ( err5 ){console.log(err5);}
                          else  {if(a5s.length>0){
                            console.log(a5s);
                            socket.emit('S_send_room',{ids:a1.id,room_name:strencode(a1.subject), room_id_server:a1.idc, admin_name:strencode(a5s[0].name), admin_number:a5s[0].number, time:get_time(a1.time), stt:a1.stt});
                            console.log('có gửi room đi:'+strencode(a1.subject));
                            console.log('có gửi room đi:'+a1.idc);
                            // console.log('có gửi room đi:'+strencode(a5s[0].name));
                            console.log('có gửi room đi:'+a5s[0].number);
                            console.log('có gửi room đi:'+get_time(a1.time));
                            console.log('có gửi room đi:'+a1.stt);

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

  socket.on('C_del_inbox',(mes)=>{
    if(socket.number&&isArray(mes)){
      mes.forEach((mes1,key)=>{
        if(mes1.idc){
        con.query("SELECT * FROM `"+socket.number+"mes_main` WHERE `idc` LIKE '"+mes1.idc+"'  AND `send_receive` LIKE 'R' LIMIT 1", function(err, res)
          {
            if ( err|| (res.length ==0) ){console.log(err);}
            else
              {
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
          });
        }
      });
    }
  });
  socket.on('C_del_send',(mes)=>{
    if(socket.number&&isArray(mes)){
      mes.forEach((mes1,key)=>{
        if(mes1.idc){
          con.query("SELECT * FROM `"+socket.number+"mes_main` WHERE `idc` LIKE '"+mes1.idc+"'  AND `send_receive` LIKE 'S' LIMIT 1", function(err, res)
            {
            if ( err|| (res.length ==0) ){console.log(err);}
            else
              {
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
            });
        }
      });
    }
  });
  socket.on('C_del_save',(mes)=>{
    if(socket.number&&isArray(mes)){
      mes.forEach((mes1,key)=>{
        if(mes1.idc){
          con.query("SELECT * FROM `"+socket.number+"mes_main` WHERE `idc` LIKE '"+mes1.idc+"'  AND `send_receive` LIKE 'H' LIMIT 1", function(err, res)
          {
            if ( err|| (res.length ==0) ){console.log(err);}
            else
              {
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
        });
        }
      });
    }
  });
  socket.on('C_del_online',(mes)=>{
    if(socket.number&&isArray(mes)){
      socket.emit('S_del_online');
      mes.forEach((mes1,key)=>{
        if(mes1.idc){
          con.query("SELECT * FROM `"+socket.number+"mes_main` WHERE `idc` LIKE '"+mes1.idc+"'  AND `send_receive` LIKE 'O' LIMIT 1", function(err, res)
          {
            if ( err|| (res.length ==0) ){console.log('1:'+err);}
            else
              {
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
            });
        }
        });
    }
  });
  socket.on('C_del_friend',(numbers)=>{

    if(socket.number&&isArray(numbers)){
      socket.emit('S_del_friend');
      numbers.forEach((number)=>{
        if(number.idc){
        con.query("DELETE FROM `"+socket.number+"contact` WHERE `number` LIKE '"+number.idc+"'", function(err3)
          {
              if (err3){console.log(err3);}
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
                                              io.sockets.in(row5.number).emit('S_guitinnhan',{ids:res5.insertId,name_nguoigui:strencode(socket.username),number_nguoigui:socket.number,
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
      if(isArray(data)){
        data.forEach((tin,key)=>{
          if(tin.number&&tin.idc){
        con.query("SELECT * FROM `"+socket.number+"mes_main` WHERE `send_receive` LIKE 'S' AND `idc` LIKE '"+tin.idc+"' LIMIT 1", function(err1, a1s){
          if(err1){console.log(err1);}
          else {
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
      con.query("SELECT `number`, `user` FROM `account`", function(err, a1){
      if (!( err))
      {
        var s=true;
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
    if (socket.number&&string){
      con.query("SELECT `number`, `user` FROM `account`", function(err, a1){
      if ( err){console.log(err);}
      else
      {
        let s=true;
        let ketqua=[];
        a1.forEach(function (row1,key)
          {
            if (row1.number.indexOf(string) !== -1 || row1.user.indexOf(string) !== -1)
            {
              ketqua.push({user:strencode(row1.user), number: row1.number});
              s=false;
            }
            if(key === (a1.length-1)){
              if (s){socket.emit('S_kq_check_contact_zero');}
              else {socket.emit('S_kq_check_contact',ketqua);}
            }


          });

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
      if (socket.number&&contact){
        con.query("SELECT * FROM `"+socket.number+"contact` WHERE `number` LIKE '"+contact.number+"' LIMIT 1", function(err, a1s)
           {
             if ( err){console.log(err);}
             else
               {
                 if(a1s.length===0){
                  var sql2 = "INSERT INTO `"+socket.number+"contact` (name,number) VALUES ?";
                  var values2 = [[contact.name,contact.number]];
                  con.query(sql2, [values2], function (err, res)
                    {
                      if ( err){console.log(err);}
                      else {socket.emit('S_add_contact_ok');}
                  });
                }
               }
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
