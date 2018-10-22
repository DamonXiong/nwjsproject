var id = 0
var process = require('child_process')
var iframe = document.getElementById('hearthstone')
iframe.scrollTop = 250
var gui = require('nw.gui')
var win = gui.Window.get()
var regUrl, logoutUrl
var bookdate = document.getElementById('bookdate')
var startbook = document.getElementById('startbook')
var start_btn = document.getElementById('start_btn')
var roomname = document.getElementById('index')
var refresh_time = document.getElementById('refreshtime')
var login_name = document.getElementById('loginname')
var login_pwd = document.getElementById('loginpassword')

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
initSrc()

function initSrc () {
  regUrl = 'http://seatlib.fjtcm.edu.cn'
  logoutUrl = 'http://seatlib.fjtcm.edu.cn'
  smsUrl = 'http://47.106.141.142:9180/service.asmx'
  iframe.src = regUrl
  var date = new Date()
  date.setDate(date.getDate() + 2)
  bookdate.value = date.Format('yyyy-MM-dd')
  date.setHours(23)
  date.setMinutes(58)
  roomname.value = localStorage.getItem('bookroom_roomname')
  startbook.value = date.Format('hh:mm')
  login_name.value = localStorage.getItem('bookroom_loginuser')
  login_pwd.value = localStorage.getItem('bookroom_loginpwd')
  start();
}

function start () {
  var input = /^[\s]*$/
  if (input.test(roomname.value)) {
    alert('预定房间不能为空，请输入"预定房间*"')
    return false
  }
  start_btn.disabled = true
  refresh_time.disabled = true
  var intervaltime = parseInt(refresh_time.value)
  var isCofirmBook = false
  var isStartBook = false

  localStorage.setItem('bookroom_loginuser', login_name.value)
  localStorage.setItem('bookroom_loginpwd', login_pwd.value)
  id = setInterval(function () {
    var title = iframe.contentDocument.title

    localStorage.setItem('bookroom_roomname', roomname.value)
    // 是否达到启动时间
    var localtime = new Date()
    var cmptime = startbook.value.split(':')
    if (isStartBook === false && !((localtime.getHours() > cmptime[0]) || (localtime.getHours() == cmptime[0] && localtime.getMinutes() >= cmptime[1]))) {
      isStartBook = false
      return
    }

    if (isStartBook === false) {
      isStartBook = true
      iframe.contentDocument.location.reload(true)
      return
    }

    if (title == 'IC空间管理系统') {
      var listDiv = iframe.contentDocument.getElementsByClassName('cld-list-qzs')[0]
      var listHeader = iframe.contentDocument.getElementsByClassName('cld-h-row')[0]
      var confirmDialog = iframe.contentDocument.getElementsByClassName('ui-dialog')[0]
      var btnConfirm = iframe.contentDocument.getElementsByClassName('mt_sub_resv')[0]
      var startTime = iframe.contentDocument.getElementsByName('start_time')[2]
      var endTime = iframe.contentDocument.getElementsByName('end_time')[2]
      var roomtitle = iframe.contentDocument.getElementsByClassName('it')[0]
      var nextWeek = iframe.contentDocument.getElementsByClassName('cld-bt-next')[0]
      var confirmDlgClose = iframe.contentDocument.getElementsByClassName('ui-dialog-titlebar-close')[0]
      var confirmOKDlg = iframe.contentDocument.getElementById('uni_confirm')
      var userCenter = iframe.contentDocument.getElementById('user_center')
      var confirmOKDlgClose = iframe.contentDocument.getElementsByClassName('ui-dialog-titlebar-close')[0]

      var username = iframe.contentDocument.getElementById('username')
      var password = iframe.contentDocument.getElementById('password')

      if (username && password) {
        username.value = login_name.value
        password.value = login_pwd.value
        iframe.contentDocument.getElementsByClassName('btn-success')[0].click()
      } else if (confirmOKDlg && confirmOKDlg.style['display'] == 'block') {
        clearInterval(id)
        confirmOKDlgClose.click()
        start_btn.disabled = false
        refresh_time.disabled = false
        userCenter.click()
      } else if (confirmDialog && confirmDialog.style['display'] == 'block') {
        if (isCofirmBook === false) {
          startTime.selectedIndex = 0
          var change = document.createEvent('MouseEvents'); // 创建事件对象              
          change.initEvent('change', true, true); // 初始化事件对象initMouseEvent需要更多参数
          startTime.dispatchEvent(change);
          endTime.selectedIndex = endTime.options.length - 1;
          endTime.dispatchEvent(change); // 触发事件
          btnConfirm.click()
          isCofirmBook = true
        } else {
          confirmDlgClose.click()
          isCofirmBook = false
          changeUnBookRoom()
        }
      } else if (listDiv && listHeader) {
        var isSelectedHeader = false
        var selectedHead = null
        var tmpHead = null
        for (var i = 0; i < listHeader.childNodes.length; i++) {
          if (listHeader.childNodes[i].getAttribute('date') == bookdate.value) {
            selectedHead = listHeader.childNodes[i]
            if (selectedHead.getAttribute('class').indexOf('cld-d-sel') !== -1) {
              if (i === 0) {
                tmpHead = listHeader.childNodes[2]
              } else if (i === (listHeader.childNodes.length - 4)) {
                tmpHead = listHeader.childNodes[i - 1]
              } else {
                tmpHead = listHeader.childNodes[i + 1]
              }
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
                tmpHead.click()
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
  }, intervaltime)
}

function changeUnBookRoom () {
}

function stop () {
  var iframe = document.getElementById('hearthstone')
  clearInterval(id)
  start_btn.disabled = false
  refresh_time.disabled = false
}

function login () {
  iframe.src = logoutUrl
}

// 以下是数据库操作,使用indexedDB

var db = $.indexedDB('HeartStone').objectStore('accounts', {
  'keyPath': 'account',
  'autoIncrement': true
})
