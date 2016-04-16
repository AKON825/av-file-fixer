var fs = require('fs')
var async = require('async')

var route = '/Users/akon825/avs1'

newTemp(route, step1)

function step1 () { 
  fs.readdir(route, function(err, files) {
    // 這邊用async做 （一次限制個位數筆）
    //files.forEach(function(file){
    async.eachLimit(files, 1, function(file, asyncCb) {
      console.log('開始幹')
      console.log(file)

      var avNum

      // 是資料夾 - 
      if (fs.lstatSync(route + '/' + file).isDirectory()) {
        if(file == 'temp') {
          console.log('temp跳過')

          return asyncCb()
        }
        avNum = getAvNum(file)
        console.log('avNum=',avNum)
        if(avNum == '') {
          console.log('folder avNum not correct', avNum)
          console.log('跳過')
          
          return moveToTemp(route + '/' + file, route, file, function(){
            return asyncCb()
          }) 
          //return asyncCb()
        }

        // 先正名資料夾
        renameFolder(route + '/' + file, route + '/' + avNum, function(){
          fs.readdir(route + '/' + avNum, function(err, files) {
            async.eachLimit(files, 1, function(file, asyncCb2) {
            //files.forEach(function(file){
              
              if (file.match(/\.mp4$|\.avi$/)) {
                // 取得副檔名
                var extraName = file.replace(/.*(\.mp4$|\.avi$)/g, '$1')

                // 去掉副檔名
                var handledName = file.replace(/(.*)\.mp4$|\.avi$/g, '$1')
                avNum = getAvNum(handledName)


                // 將影音檔正名
                renameFolder(route + '/' + avNum + '/' + file, route + '/' + avNum + '/' + avNum + extraName, function(){
                  return asyncCb2()
                })
              } else {
                // 刪除影音外的檔案

                // 改成有callback
                fs.unlinkSync(route + '/' + avNum + '/' + file);
                return asyncCb2()
              }
            }, function(err) {
              console.log('內部迴圈結束')
              return asyncCb()
            })
            //})
          })
        }) 
      } else {
        // 判斷是不是所有影音檔的副檔名
        if (file.match(/\.mp4$|\.avi$/)) {

          // 取得副檔名
          var extraName = file.replace(/.*(\.mp4$|\.avi$)/g, '$1')

          // 去掉副檔名
          var handledName = file.replace(/(.*)\.mp4$|\.avi$/g, '$1')
          avNum = getAvNum(handledName)

          if(avNum == '') {
            console.log('mv avNum not correct', avNum)
            console.log('mv移到暫存')

            return moveToTemp(route + '/' + file, route, file, function(){
              return asyncCb()
            }) 
          }


          // 新增資料夾
          mkFolder(route + '/' + avNum, function(){
            // 移動影片並更名
            renameFolder(route + '/' + file, route + '/' + avNum + '/' + avNum + extraName, function(){
              return asyncCb()
            }) 
          })
          //mkFolder(route + '/' + avNum)
        } else {
          // 第一層不是影音和folder的砍掉
          fs.unlinkSync(route + '/' + file)
          return asyncCb()
        }
      }
    }, function(err) {
      console.log('step 1 done')
    })

       //console.log(getAvNum(file))
    //})
  })
}

function mkFolder(route, cb) {
  fs.mkdir(route, function(err, result){
    if (err) {
      console.log('route是', route)
      console.log('新增資料夾有錯喔' ,err)
    }

    cb()
  })
}

function renameFolder(oldRoute, newRoute, cb) {
  fs.rename(oldRoute, newRoute, function(err, result){
    if (err) {
      console.log('重新命名有錯喔' ,err)
    }

    cb()
  })
}


function newTemp(rootRoute, cb) {
  fs.access(rootRoute + '/temp', fs.R_OK, (err) => {
    if (err) {
        fs.mkdir(rootRoute + '/temp', function(err, result){
          console.log('新增暫存資料夾')

          return cb()
        })
    } else {
      return cb()
    }
  });
}

function moveToTemp(fileRoute, rootRoute, fileName, cb) {
  fs.rename(fileRoute, rootRoute + '/temp/' + fileName , function(err, result){
    if (err) {
      console.log('移到暫存有錯喔' ,err)
    }

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