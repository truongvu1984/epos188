
  //var socket = io("10.0.10.132:3000");
$(document).ready(() => {

  $("#btn_inbox").click(()=>{
    socket.emit("vuyeuvan");


  });
  socket.on('SERVER_REPLY', num => {

    //  $('#list').append('<li> ${num} </li>');
  });
  $('#xacnhan').click(() => {
    let txt = $('#text').val();
    socket.emit('CLIENT_SEND_MESSAGE', txt);
  });

});
