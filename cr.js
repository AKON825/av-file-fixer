var craw = require('./avCrawer.js')()
var fs = require('fs')
var request = require('request')

craw.getMvName('venu-592', function(mvName){
  console.log(mvName)
})

craw.getSaleNum('venu-592', function(saleName){
//craw.getSaleNum('pppd-340', function(mvName){
  console.log(saleName)
})

craw.getImgUrl('venu-592', function(imgUrl){
  download(imgUrl, '/Users/akon825/avs1/dl.png', function(){
    console.log('done');
  });
})

function download(uri, filename, cb){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', cb);
  });
};


