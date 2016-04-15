var moment = require('moment')
var fs = require('fs')


var route = '/Users/akon825/avs'

fs.readdir(route, function(err, files){
  files.forEach(function(file){
    console.log(file)

    var avNum = ''

    if (file.match(/^[0-9]+[-][a-zA-Z]+[0-9]+$/)) {
      console.log('中了1')
      //avNum = file.replace(/([a-z\d])([A-Z]+)/g, '$1_$2')
      avNum = file.replace(/^[0-9]+[-]([a-zA-Z]+)([0-9]+$)/g, '$1-$2')
      console.log(avNum)
    }

    if (file.match(/^[0-9]+[a-zA-Z]+[0-9]+$/)) {
      console.log('中了2')
      avNum = file.replace(/^[0-9]+([a-zA-Z]+)([0-9]+$)/g, '$1-$2')
      console.log(avNum)
    }

    if (file.match(/^[a-zA-Z]+[-][0-9]+$/)) {
      console.log('中了3')
      console.log(avNum)
    }

    if (file.match(/^[a-zA-Z]+[0-9]+$/)) {
      console.log('中了4')
      avNum = file.replace(/^([a-zA-Z]+)([0-9]+$)/g, '$1-$2')
      console.log(avNum)
    }
  })
})

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