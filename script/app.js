var moment = require('moment')
var fs = require('fs')
var async = require('async')
var path = require('path')

$(document).on('click', '.file-item', function(event){
  if ($(this).hasClass('active')) {
    $(this).removeClass('active')
  } else {
    $(this).addClass('active')
  }
});

$(document).on('dblclick', '.file-item', function(event){
  alert('yoooooooo')
});

$('button.select-all').on('click', function(event){
  $('.file-item').addClass('active')
});

$('button.select-nothing').on('click', function(event){
  $('.file-item').removeClass('active')
});

$('button.select-reverse').on('click', function(event){
  var allItem = $('.file-item')
  allItem.each(function(){
    if($(this).hasClass('active')) {
      $(this).removeClass('active')
    } else {
      $(this).addClass('active')
    }
  })
});

$(function() {
  var route = ''
  var videoExt = ['.mp4', '.avi', '.wmv', '.mpg']

  $("h1").on("click", function() {
    alert("Heading 1 is clicked" + moment().format('YYYY-MM-DD'));
  });

  $("button.wewe").on("click", function() {
    alert($('input[name="route"]').val());

    route = $('input[name="route"]').val()
  });

  $("input.route").on("change", function() {
    route = $("input.route").val()
    fs.readdir(route, function(err, files) {
      $('.file-area a:not(:first)').remove()

      files.forEach(function(file){
        var fileItem = $('.file-area a:first').clone().removeClass('hide')

        // 如果是資料夾
        if (fs.lstatSync(path.join(route, file)).isDirectory()) {
          fileItem.find('p').append('<i style="color:#ff9900" class="fa fa-folder-open" aria-hidden="true"></i>' + '\n')
          //fileItem.find('p').text(file+'是資料夾')
        }

        // 如果是影音檔
        var extName = path.extname(file)
        extName = extName.toLowerCase()

        if (videoExt.indexOf(extName) != -1) {
          fileItem.find('p').append('<i class="fa fa-file-video-o" aria-hidden="true"></i>' + '\n')
        }

        fileItem.find('p').append(file)
        $('.file-area').append(fileItem)
      })
    })
  });

  fs.readdir('/', function(err, files) {
     files.forEach(function(file){
      $('textarea').append(file + '\r\n')
     })
    
  })
});