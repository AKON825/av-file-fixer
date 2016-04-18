var os = require('os') 
var moment = require('moment')
var fs = require('fs')
var async = require('async')
var path = require('path')
var avProcess = require('./script/lib/avProcess.js')()

$(document).on('click', '.pre-path', function(event){
  var originRoute = $("input.route").val()
  var route = path.join(originRoute, '..')

  $("input.route").val(route)
  $("input.route").change();
});

$(document).on('click', '.file-item', function(event){
  if ($(this).hasClass('active')) {
    $(this).removeClass('active')
  } else {
    $(this).addClass('active')
  }
});

$(document).on('dblclick', '.file-item.folder', function(event){
  var originRoute = $("input.route").val()
  var fileName = $(this).find('input.file-name').val()

  $("input.route").val(path.join(originRoute, fileName))
  $("input.route").change();
});

$(document).on('click', '.li-disk',function(event){
  var name = $(this).text()
  $('#diskMenu').text(name + '槽')
  $('#diskMenu').append('<span class="caret"></span>')
  $("input.route").val(name + ':/')
  $("input.route").change();
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

$('.process-btn').on('click', function(event){
  var allItem = $('.file-item.active')
  var fileAry = []
  var fileRoute = $("input.route").val()

  allItem.each(function(item){
    fileAry.push($(this).text().trim())
  })
  console.log(fileAry)

  avProcess.processByRule1(1, fileRoute, fileAry)

  //processAv(fileRoute, fileAry)
  //alert(fileAry+fileRoute)
});

$(function() {
  var route = ''
  var videoExt = ['.mp4', '.avi', '.wmv', '.mpg']
  var imageExt = ['.jpg', '.jpeg', '.png', '.gif']

  // var osStr = 'eol: ' + os.EOL + ' os.arch: ' + os.arch() 
  // osStr = osStr + ' homedir: ' + os.homedir() + ' platform:' + os.platform()
  // alert(osStr)

  var partitions = []

  // 若系統為win32, 則初始化磁碟選擇按鈕
  if (os.platform() == 'win32') {
    get_win_drives(function(data){
      data.forEach(function(partName){
        partName = partName.substring(0,1)
        partitions.push(partName)
      })

      initPartiton(partitions)
    })
  } else {
    $('#diskMenu').prop('disabled', true)
  }
  
  function initPartiton() {
    partitions.forEach(function(partition){
      $('.disk-menu').append('<li><a href="#" class="li-disk">' + partition.toUpperCase() + '</a></li>')
    })
  }

  // 初始載入路徑為專案所在路徑
  route =  os.homedir()

  $("input.route").on("change", function() {
    // 去前後空格
    route = $("input.route").val().trim()
    $("input.route").val(route)
    // 依平台正規劃路徑
    route = path.normalize(route)
    // 放回欄位
    $("input.route").val(route)

    fs.readdir(route, function(err, files) {
      if (err) {
        alert('路徑錯誤, 請重新選擇. 錯誤訊息:' + err)
        return $('.file-area a:not(:first)').remove()
      }

      $('.file-area a:not(:first)').remove()

      files.forEach(function(file){
        var fileItem = $('.file-area a:first').clone().removeClass('hide')
        fileItem.find('input.file-name').val(file)

        // 如果是資料夾
        if (fs.lstatSync(path.join(route, file)).isDirectory()) {
          fileItem.addClass('folder')
          fileItem.find('p').append('<i style="color:#ff9900" class="fa fa-folder-open" aria-hidden="true"></i>' + '\n')
          //fileItem.find('p').text(file+'是資料夾')
        }

        // 如果是影音檔或圖片檔
        var extName = path.extname(file)
        extName = extName.toLowerCase()

        if (videoExt.indexOf(extName) != -1) {
          fileItem.find('p').append('<i class="fa fa-file-video-o" aria-hidden="true"></i>' + '\n')
        }

        if (imageExt.indexOf(extName) != -1) {
          fileItem.find('p').append('<i class="fa fa-file-picture-o" aria-hidden="true"></i>' + '\n')
        }

        fileItem.find('p').append(file)
        $('.file-area').append(fileItem)
      })
    })
  });

  // 依作業系統初始化路徑
  $("input.route").val(route)
  $("input.route").change();
});

/**
 * Get windows drives
 * */
function get_win_drives(success_cb,error_cb){
    var stdout = '';
    var spawn = require('child_process').spawn,
    list  = spawn('cmd');

    list.stdout.on('data', function (data) {
        stdout += data;
    });

    list.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });

    list.on('exit', function (code) {
        if (code == 0) {
            console.log(stdout);
            var data = stdout.split('\r\n');
            data = data.splice(4,data.length - 7);
            data = data.map(Function.prototype.call, String.prototype.trim);
            success_cb(data);
        } else {
            console.log('child process exited with code ' + code);
            error_cb();
        }
    });
    list.stdin.write('wmic logicaldisk get caption\n');
    list.stdin.end();
}