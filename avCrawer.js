module.exports = AvCrawer

var async = require('async')
var request = require('request')
var moment = require('moment')
var cheerio = require('cheerio')
var iconv = require('iconv-lite')

function AvCrawer () {
  if (!(this instanceof AvCrawer)) {
    return new AvCrawer()
  }

  var uri = ''
  var method = 'get'
  var params = {}

  /**
   * 取得 片名
   */
  this.getMvName = function (fanNum, cb) {
    uri = 'https://www.javbus.com/' + fanNum
    apiRequest(method, uri, params, function(body){

        var $ = cheerio.load(body)
        var videoName = $('h3').text()

        return cb(videoName)
    })
  }

  /**
   * 取得 販售編號
   */
  this.getSaleNum = function (fanNum, cb) {
    uri = 'http://www.avdvd.net/shop/advanced_search_result.php?keywords=' + fanNum + '&x=8&y=8&search_in_select=1&categories_id='
      apiRequest(method, uri, params, function(body){

        var $ = cheerio.load(body)
        var saleNamesObjs = $('tr td.productListing-data font[color="red"]')
        console.log(saleNamesObjs.length)

        var saleName = ''

        if (saleNamesObjs.length == 1) {
          saleName = saleNamesObjs.text()

          // 去所有空格
          saleName = saleName.replace(/\s+/g, '') 
          saleName = saleName.replace(/\[+|\]/g, '') 
        } 

        if (saleNamesObjs.length > 1) {
          var tempName = ''
          var dInString = false

          console.log(saleNamesObjs.length)

          var saleNamesObj = ''
          saleNamesObjs.each(function(){
            saleNamesObj = $(this)

            tempName = saleNamesObj.text()

            // 去所有空格
            //tempName = tempName.replace(/\s+/g, '') 
            //tempName = tempName.replace(/\[+|\]+/g, '')

            // 如果有Ｄ開頭的販售編號就取Ｄ開頭的
            if(tempName.match(/^[a-zA-Z]+[-][0-9]+$/)) {
              dInString = true

              saleName = tempName
            }

            // 沒有Ｄ開頭的販售編號就先取
            if(!dInString) {
              //console.log(saleName)
              saleName = tempName
            }
          })
        } 

        // 選DF開頭的處理s
        return cb(saleName)
    })
  }

  /**
   * 取得 圖片網址
   */
  this.getImgUrl = function (fanNum, cb) {
      uri = 'https://www.javbus.com/' + fanNum
      apiRequest(method, uri, params, function(body){

        var $ = cheerio.load(body)
        var imageUrl = $('.container .row.movie .screencap a.bigImage').attr('href')

        return cb(imageUrl)
    })
  }
}

/**
 * 發Request
 *
 * @param {String} method
 * @param {String} uri
 * @param {Object} params
 * @param {Function} cb
 */
function apiRequest (method, uri, params, cb) {
  // durian連線設定值
  var parameters = {
    headers: {
    //   // 'Host': '2captcha.com',

    //   //'Accept-Language': 'zh-TW',
    //   //'Content-Type': 'application/json; charset=UTF-8',
    //   // 'Origin': 'http://localhost:3000'
    //   //'Content-Encoding':'gzip',
    //   'Accept-Encoding':'gzip',
      'Content-Type': 'text/html; charset=UTF-8'
    }
  }

  //parameters.encoding = null
  parameters.method = method
  parameters.url = uri

  if (method === 'GET') {
    parameters.qs = params
  } else {
    parameters.form = params
  }

  var begin = moment().valueOf()

  return request(parameters, function (error, response, body) {
    var end = moment().valueOf()
    var elapse = end - begin

    return checkError()

    function checkError () {
      var errorMsg

      if (error) {
        errorMsg = error.message

        return console.log(errorMsg)
      }

      // if (response.statusCode !== 200) {
      //   errorMsg = util.format('HTTP %s error', response.statusCode)

      //   return writeErrorLog(errorMsg)
      // }

      //var body = JSON.parse(response.body)
      var body = response.body

      console.log('花費時間', elapse)


      //var preLink = $('.btn-group.pull-right a').eq(1).attr('href')

      return cb(body)
    }
  })
}