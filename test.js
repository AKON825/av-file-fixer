var moment = require('moment')
var fs = require('fs')


var route = '/Users/akon825/avs1'

fs.readdir(route, function(err, files) {
  // 這邊用async做 （一次限制個位數筆）
  files.forEach(function(file){
    console.log(file)

    var avNum

    // 是資料夾 - 
    if (fs.lstatSync(route + '/' + file).isDirectory()) {
      avNum = getAvNum(file)
    } else {
      // 判斷是不是所有影音檔的副檔名
      if (file.match(/\.mp4$|\.avi$/)) {
        console.log('是影音')

        // 去掉副檔名
        var handledName = file.replace(/(.*)\.mp4$|\.avi$/g, '$1')
        console.log('去除後', handledName)
        avNum = getAvNum(file)
        //mkFolder(route + '/' + avNum)
      } else {
        // 第一層不是影音和folder的砍掉
        fs.unlinkSync(route + '/' + file);
      }
    }

     //console.log(getAvNum(file))
  })
})

function mkFolder(route, cb) {
  fs.mkdir(route, function(err, result){
  
    cb()
  })
}

function renameFolder(oldRoute, newRoute, cb) {
  fs.rename(oldRoute, newRoute, function(err, result){
    console.log('修改結束 ', err, result)

    cb()
  })
}

// fs.mkdir(route + '/createByffssss', function(err, result){
//   console.log('新增結束', err, result)

//   fs.rename(route + '/createByffssss', route + '/renameByffssss', function(err, result){
//     console.log('修改結束 ', err, result)
//   })
// })

function getAvNum(fileName){
  var avNum = ''

  if (fileName.match(/^[0-9]+[-][a-zA-Z]+[0-9]+$/)) {
    //avNum = file.replace(/([a-z\d])([A-Z]+)/g, '$1_$2')
    avNum = fileName.replace(/^[0-9]+[-]([a-zA-Z]+)([0-9]+$)/g, '$1-$2')
  }

  if (fileName.match(/^[0-9]+[a-zA-Z]+[0-9]+$/)) {
    avNum = fileName.replace(/^[0-9]+([a-zA-Z]+)([0-9]+$)/g, '$1-$2')
  }

  if (fileName.match(/^[a-zA-Z]+[-][0-9]+$/)) {
    avNum = fileName
  }

  if (fileName.match(/^[a-zA-Z]+[0-9]+$/)) {
    avNum = fileName.replace(/^([a-zA-Z]+)([0-9]+$)/g, '$1-$2')
  }

  return avNum
}




//if (url.match(/^\/change_password/) || url.match(/^\/api\/user\/([0-9]+)\/password/)) {

// fs.readdirSync(route).forEach(function (file) {
//   if (file.match(/^[A-Za-z0-9_-]+\.js$/)) {
//     // 檔名為camelized字串, 將其轉成底線分隔, 以供驗證網址使用
//     var prefixUrl = file.replace('.js', '').replace(/([a-z\d])([A-Z]+)/g, '$1_$2').replace(/[-\s]+/g, '_').toLowerCase()
//     var url = util.format('/%s/*', prefixUrl)

//     app.all(url, setSensitiveData)
//     app.all(util.format('/api%s', url), setSensitiveData)

//     require('./controller/' + file)(app)
//   }
//   console.log(file)
// })