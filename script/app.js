var moment = require('moment')
var fs = require('fs')

$(function() {
  $("h1").on("click", function() {
    alert("Heading 1 is clicked" + moment().format('YYYY-MM-DD'));
  });

  $("button").on("click", function() {
    alert($('input[name="route"]').val());

    var route = $('input[name="route"]').val()

    fs.readdir(route, function(err, files){
      files.forEach(function(file){
        console.log(file)
      })
      
      $("h3.list").text(JSON.stringify(files));
    })

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
  });


  // fs.mkdir(route + '/createByffssss', function(err, result){
  //   console.log('新增結束', err, result)

  //   fs.rename(route + '/createByffssss', route + '/renameByffssss', function(err, result){
  //     console.log('修改結束 ', err, result)
  //   })
  // })
});