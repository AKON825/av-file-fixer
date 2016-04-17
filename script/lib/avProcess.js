module.exports = AvProcess

var fs = require('fs')
var async = require('async')
var request = require('request')
var craw = require('./avCrawer.js')()

function AvProcess () {
  if (!(this instanceof AvProcess)) {
    return new AvProcess()
  }

  this.processByRule1 = function(rule, route){
    route = '/Users/akon825/avs1'
    
    newOk(route, function(){
      newTemp(route, function(){
        return step1(rule, route)
      })
    })
  }
}

// 將檔案名稱用備註資料 + 番號標準化
// 整理歸檔(影音檔新增資料夾放入, 非影音非資料夾的刪掉)
// 無法辨識的影音和資料夾移到temp
function step1 (rule, route) { 
  fs.readdir(route, function(err, files) {
    // 這邊用async做 （一次限制個位數筆）
    //files.forEach(function(file){
    async.eachLimit(files, 1, function(file, asyncCb) {
      console.log('開始幹')
      console.log(file)

      var noteDataFanNum

      // 是資料夾 - 
      if (fs.lstatSync(route + '/' + file).isDirectory()) {
        if(file == 'temp' || file == 'ok') {
          return asyncCb()
        }

        noteDataFanNum = getNoteDataFanNum(file)
        console.log('noteDataFanNum=',noteDataFanNum)
        // 抓不到番號就移到temp
        if(noteDataFanNum == '') {
          return moveToTemp(route + '/' + file, route, file, function(){
            return asyncCb()
          }) 
        }

        // 依規則的完整組合名稱
        var noteData = ''
        var fanNum = ''

        getSplitNoteDataFanNum(file, function(n, f){
          noteData = n
          fanNum = f
          console.log('註記資料', noteData)
          console.log('番號名稱', fanNum)
        })

        return getDataByRule(rule, noteData, fanNum, function(err, fullName, imgUrl){
          if(err) {
            // 先不處理這筆
            return asyncCb()
          }

          return handleFolder(fullName, imgUrl)
        })

        function handleFolder(fullName, imgUrl) {
          // 先正名資料夾, 並且搬到ok
          renameFolder(route + '/' + file, route + '/ok/' + fullName, function(){
            download(imgUrl, route + '/ok/' + fullName + '/' + fullName + '.jpg', function(){
              console.log('download')
            });

            fs.readdir(route + '/ok/' + fullName, function(err, files) {
              async.eachLimit(files, 1, function(file, asyncCb2) {
                if (file.match(/\.mp4$|\.avi$/)) {
                  // 取得副檔名
                  var extraName = file.replace(/.*(\.mp4$|\.avi$)/g, '$1')

                  // // 去掉副檔名
                  // var handledName = file.replace(/(.*)\.mp4$|\.avi$/g, '$1')
                  // noteDataFanNum = getNoteDataFanNum(handledName)

                  // 將影音檔正名
                  renameFolder(route + '/ok/' + fullName + '/' + file, route + '/ok/' + fullName + '/' + fullName + extraName, function(){
                    return asyncCb2()
                  })
                } else {
                  // 刪除影音外的檔案

                  // 改成有callback
                  fs.unlinkSync(route + '/ok/' + fullName + '/' + file);
                  return asyncCb2()
                }
              }, function(err) {
                console.log('內部迴圈結束')
                return asyncCb()
              })
            })
          }) 
        }
      } else {
        // 判斷是不是所有影音檔的副檔名
        if (file.match(/\.mp4$|\.avi$/)) {
          console.log(file, '是影音')
          // 取得副檔名
          var extraName = file.replace(/.*(\.mp4$|\.avi$)/g, '$1')

          // 去掉副檔名
          var handledName = file.replace(/(.*)\.mp4$|\.avi$/g, '$1')

          noteDataFanNum = getNoteDataFanNum(handledName)

          // 無法取得番號則移到暫存
          if(noteDataFanNum == '') {
            console.log('mv noteDataFanNum not correct', noteDataFanNum)
            console.log('mv移到暫存')

            return moveToTemp(route + '/' + file, route, file, function(){
              return asyncCb()
            }) 
          }

          var noteData = ''
          var fanNum = ''

          // 將檔名拆成註解和番號
          getSplitNoteDataFanNum(handledName, function(n, f){
            noteData = n
            fanNum = f
            console.log('註記資料', noteData)
            console.log('番號名稱', fanNum)
          })

          return getDataByRule(rule, noteData, fanNum, function(err, fullName, imgUrl){
            if(err) {
              // 先不處理這筆
              return asyncCb()
            }

            return moveVideo(fullName, imgUrl)
          })

          function moveVideo(fullName, imgUrl) {
            // 新增資料夾
            mkFolder(route + '/ok/' + fullName, function(){
              download(imgUrl, route + '/ok/' + fullName + '/' + fullName + '.jpg', function(){
                console.log('download')
              });

              // 移動影片並更名
              renameFolder(route + '/' + file, route + '/ok/' + fullName + '/' + fullName + extraName, function(){
                return asyncCb()
              }) 
            })
          }
        } else {
          // 第一層不是影音和folder的砍掉
          fs.unlinkSync(route + '/' + file)
          return asyncCb()
        }
      }
    }, function(err) {
      console.log('step 1 done')
    })

       //console.log(getNoteDataFanNum(file))
    //})
  })
}

function getDataByRule(rule, noteData, fanNum, cb) {
 // 依規則的完整組合名稱
  var fullName = ''
  var mvName = ''
  var saleName = ''
  var imgUrl = ''

  if (rule === 1) {
    var getMvName = function () {
      craw.getMvName(fanNum, function(err, m){
        // 失敗則先不處理這筆
        if (!m) {
          return cb(new Error('get mv name error'))
        }

        mvName = m
        getSaleNum()
      })
    }

    var getSaleNum = function () {
      craw.getSaleNum(fanNum, function(err, s){
        // 失敗待處理
       if (!s && err) {
          return cb(new Error('get sale num error'))
        }

        saleName = s
        getImgUrl()
      })
    }

    var getImgUrl = function () {
      craw.getImgUrl(fanNum, function(err, i){
        // 失敗則先不處理這筆
        if (!i) {
          return cb(new Error('get img error'))
        }

        imgUrl = i

        fullName = noteData + saleName + mvName + '_' + fanNum

        return cb(null, fullName, imgUrl)
      }) 
    }

    return getMvName()
  }

  if (rule === 2) {
    var getMvName = function () {
      craw.getMvName(fanNum, function(err, m){
        // 失敗則先不處理這筆
        if (!m) {
          return cb(new Error('get mv name error'))
        }

        mvName = m
        return getImgUrl()
      })
    }

    var getImgUrl = function () {
      craw.getImgUrl(fanNum, function(err, i){
        // 失敗則先不處理這筆
        if (!i) {
          return cb(new Error('get img error'))
        }

        imgUrl = i

        fullName = noteData + fanNum + '_' + mvName 
        console.log(fullName)
        return cb(null, fullName, imgUrl)
      }) 
    }

    return getMvName()
  }
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

function newOk(rootRoute, cb) {
  fs.access(rootRoute + '/ok', fs.R_OK, (err) => {
    if (err) {
        fs.mkdir(rootRoute + '/ok', function(err, result){
          console.log('新增ok資料夾')

          return cb()
        })
    } else {
      return cb()
    }
  });
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


function getNoteDataFanNum(fileName){
  // 備註資料
  var noteData = ''
  // 番號
  var fanNum = ''

  // 去所有空格
  fileName = fileName.replace(/\s+/g, '') 

  // 先抓出備註資料 ex (GGG--FBSP)
  if (fileName.match(/^[(].*[)]/)) {
    console.log('幹', fileName, '有括號啦')
    console.log('乾濕分離1', fileName.replace(/^([(].*[)])(.*)/g, '$1'))
    noteData = fileName.replace(/^([(].*[)])(.*)/g, '$1')
    console.log('乾濕分離2', fileName.replace(/^([(].*[)])(.*)/g, '$2'))
    fileName = fileName.replace(/^([(].*[)])(.*)/g, '$2')
  }

  if (fileName.match(/^[0-9]+[-][a-zA-Z]+[0-9]+$/)) {
    fanNum = fileName.replace(/^[0-9]+[-]([a-zA-Z]+)([0-9]+$)/g, '$1-$2')
  }

  if (fileName.match(/^[0-9]+[a-zA-Z]+[0-9]+$/)) {
    fanNum = fileName.replace(/^[0-9]+([a-zA-Z]+)([0-9]+$)/g, '$1-$2')
  }

  if (fileName.match(/^[a-zA-Z]+[-][0-9]+$/)) {
    fanNum = fileName
  }

  if (fileName.match(/^[0-9]+[a-zA-Z]+[-][0-9]+$/)) {
    fanNum = fileName.replace(/^[0-9]+([a-zA-Z]+[-]+[0-9]+$)/g, '$1')
  }

  if (fileName.match(/^[a-zA-Z]+[0-9]+$/)) {
    fanNum = fileName.replace(/^([a-zA-Z]+)([0-9]+$)/g, '$1-$2')
  }

  //番號轉大寫
  fanNum = fanNum.toUpperCase()

  var output = noteData + fanNum

  if (fanNum == '') {
    // 如果找不到番號就不處理
    output = ''
  }

  return output
}

function getSplitNoteDataFanNum(fileName, cb){
  // 備註資料
  var noteData = ''
  // 番號
  var fanNum = ''

  // 去所有空格
  fileName = fileName.replace(/\s+/g, '') 

  // 先抓出備註資料 ex (GGG--FBSP)
  if (fileName.match(/^[(].*[)]/)) {
    console.log('幹', fileName, '有括號啦')
    console.log('乾濕分離1', fileName.replace(/^([(].*[)])(.*)/g, '$1'))
    noteData = fileName.replace(/^([(].*[)])(.*)/g, '$1')
    console.log('乾濕分離2', fileName.replace(/^([(].*[)])(.*)/g, '$2'))
    fileName = fileName.replace(/^([(].*[)])(.*)/g, '$2')
  }

  if (fileName.match(/^[0-9]+[-][a-zA-Z]+[0-9]+$/)) {
    fanNum = fileName.replace(/^[0-9]+[-]([a-zA-Z]+)([0-9]+$)/g, '$1-$2')
  }

  if (fileName.match(/^[0-9]+[a-zA-Z]+[0-9]+$/)) {
    fanNum = fileName.replace(/^[0-9]+([a-zA-Z]+)([0-9]+$)/g, '$1-$2')
  }

  if (fileName.match(/^[a-zA-Z]+[-][0-9]+$/)) {
    fanNum = fileName
  }

  if (fileName.match(/^[0-9]+[a-zA-Z]+[-][0-9]+$/)) {
    fanNum = fileName.replace(/^[0-9]+([a-zA-Z]+[-]+[0-9]+$)/g, '$1')
  }

  if (fileName.match(/^[a-zA-Z]+[0-9]+$/)) {
    fanNum = fileName.replace(/^([a-zA-Z]+)([0-9]+$)/g, '$1-$2')
  }

  //番號轉大寫
  fanNum = fanNum.toUpperCase()

  return cb(noteData, fanNum)
}

function download(uri, filename, cb){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type'])
    console.log('content-length:', res.headers['content-length'])

    request(uri).pipe(fs.createWriteStream(filename)).on('close', cb)
  })
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