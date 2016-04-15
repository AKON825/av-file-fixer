var moment = require('moment')
var fs = require('fs')


var route = '/Users/akon825/avs'

fs.readdir(route, function(err, files) {
  // 這邊用async做 （一次限制個位數筆）
  files.forEach(function(file){
    console.log(file)

    //console.log(fs.lstatSync(route + '/' + file).isDirectory())

    // 是資料夾 - 
    if (fs.lstatSync(route + '/' + file).isDirectory()) {

    } else {
    // 判斷是不是所有影音檔的副檔名
    }

    console.log(getAvNum(file))
  })
})

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