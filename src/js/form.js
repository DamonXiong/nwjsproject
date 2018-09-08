var id = 0
var process = require('child_process')
var iframe = document.getElementById('hearthstone')
iframe.scrollTop = 250
var gui = require('nw.gui')
var win = gui.Window.get()
var regUrl, logoutUrl
var bookdate = document.getElementById('bookdate')
var start_btn = document.getElementById('start_btn')
var roomname = document.getElementById('index')
initSrc()

function initSrc () {
  Date.prototype.Format = function (fmt) {
    var o = {
      'M+': this.getMonth() + 1,
      'd+': this.getDate(),
      'h+': this.getHours(),
      'm+': this.getMinutes(),
      's+': this.getSeconds(),
      'q+': Math.floor((this.getMonth() + 3) / 3),
      'S': this.getMilliseconds()
    }
    if (/(y+)/.test(fmt))
      fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length))
    for (var k in o)
      if (new RegExp('(' + k + ')').test(fmt))
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
    return fmt
  }
  regUrl = 'http://seatlib.fjtcm.edu.cn'
  logoutUrl = 'http://seatlib.fjtcm.edu.cn'
  smsUrl = 'http://47.106.141.142:9180/service.asmx'
  iframe.src = regUrl
  var date = new Date()
  date.setDate(date.getDate() + 2)
  bookdate.value = date.Format('yyyy-MM-dd')
}

function start () {
  start_btn.disabled = true
  id = setInterval(function () {
    var title = iframe.contentDocument.title

    if (title == 'IC空间管理系统') {
      var listDiv = iframe.contentDocument.getElementsByClassName('cld-list-qzs')[0]
      var listHeader = iframe.contentDocument.getElementsByClassName('cld-h-row')[0]
      var confirmDialog = iframe.contentDocument.getElementsByClassName('ui-dialog')[0]
      var btnConfirm = iframe.contentDocument.getElementsByClassName('mt_sub_resv')[0]
      var startTime = iframe.contentDocument.getElementsByName('start_time')[2]
      var endTime = iframe.contentDocument.getElementsByName('end_time')[2]
      var roomtitle = iframe.contentDocument.getElementsByClassName('it')[0]
      var nextWeek = iframe.contentDocument.getElementsByClassName('cld-bt-next')[0]

      if (confirmDialog && confirmDialog.style['display'] == 'block') {
        startTime.selectedIndex = 0
        endTime.selectedIndex = 78
        var change = document.createEvent('MouseEvents'); // 创建事件对象              
        change.initEvent('change', true, true); // 初始化事件对象initMouseEvent需要更多参数
        endTime[2].dispatchEvent(change); // 触发事件
        btnConfirm.click()
      } else if (listDiv && listHeader) {
        var isSelectedHeader = false
        var selectedHead = null
        for (var i = 0; i < listHeader.childNodes.length; i++) {
          if (listHeader.childNodes[i].getAttribute('date') == bookdate.value) {
            selectedHead = listHeader.childNodes[i]
            if (selectedHead.getAttribute('class').indexOf('cld-d-sel') !== -1) {
              isSelectedHeader = true
            }
          }
        }

        if (isSelectedHeader == true) {
          for (var i = 0; i < listDiv.childNodes.length; i++) {
            if (listDiv.childNodes[i].getAttribute('objname') == roomname.value) {
              var roomdiv = listDiv.childNodes[i]
              var nodes = roomdiv.getElementsByClassName('cld-row')[0].childNodes
              if (nodes.length > 2) {
                var time = roomdiv.getElementsByClassName('cld-row')[0].childNodes[2]
                var emousedown = document.createEvent('MouseEvents'); // 创建事件对象              
                emousedown.initEvent('mousedown', true, true); // 初始化事件对象initMouseEvent需要更多参数
                time.dispatchEvent(emousedown); // 触发事件
                var emouseup = document.createEvent('MouseEvents'); // 创建事件对象              
                emouseup.initEvent('mouseup', true, true); // 初始化事件对象initMouseEvent需要更多参数
                time.dispatchEvent(emouseup); // 触发事件
              } else {
                roomtitle.click()
              }
            }
          }
        } else {
          if (selectedHead) {
            selectedHead.click()
          } else {
            var selectDate = iframe.contentDocument.getElementsByClassName('cld-d-sel')[0]
            if (new Date(bookdate.value) < new Date(selectDate.getAttribute('date'))) {
              roomtitle.click()
            } else {
              nextWeek.click()
            }
          }
        }
      } else {
        roomtitle.click()
      }
    }
  }, 3000)
}

function stop () {
  var iframe = document.getElementById('hearthstone')
  clearInterval(id)
  start_btn.disabled = false
}

function login () {
  iframe.src = logoutUrl
}

// 以下是数据库操作,使用indexedDB

var db = $.indexedDB('HeartStone').objectStore('accounts', {
  'keyPath': 'account',
  'autoIncrement': true
})
