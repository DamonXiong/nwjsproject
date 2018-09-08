var rids = [],
	accounts = [],
	curAccount = {},
	id = 0,
	isSave = true;
var token = '';
var phUser = 'auphahua'; //短信平台账号
var phPwd = 'aupha3721'; //短信平台密码
var process = require('child_process');
var iframe = document.getElementById("hearthstone");
iframe.scrollTop = 250;
var gui = require('nw.gui');
var win = gui.Window.get();
var lastAccout = "";
var nc = true;
var regUrl, btcUrl, logoutUrl, smsUrl;
var phNumber = '';
var smsCode = '';
initSrc();
smsLogin();

function removeCookie(cookie) {
	var url = "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain +
		cookie.path;
	win.cookies.remove({
		"url": url,
		"name": cookie.name
	});
}

function removeCookies() {

	win.cookies.getAll({}, function (cookies) {
		for (i = 0; i < cookies.length; i++) {
			removeCookie(cookies[i]);
		}
	})
}


function initSrc() {
	regUrl = 'https://accounts.google.com/signup/v2/webcreateaccount?service=mail&continue=https%3A%2F%2Fmail.google.com%2Fmail%2F%3Fpc%3Dtopnav-about-en&flowName=GlifWebSignIn&flowEntry=SignUp';
	btcUrl = 'https://accounts.google.com/signin/v2/identifier?service=mail&continue=https%3A%2F%2Fmail.google.com%2Fmail%2F%3Fpc%3Dtopnav-about-en&flowName=GlifWebSignIn&flowEntry=ServiceLogin';
	logoutUrl = 'https://www.battlenet.com.cn/account/management/battletag-create.html?logout';
	smsUrl = 'http://47.106.141.142:9180/service.asmx';
	iframe.src = regUrl;
}




function importRID() {
	var dataElement = document.getElementById('rid_div');
	var filename = document.all.accountRID.value;
	var file = fs.readFileSync(filename);
	rids = file.toString().split('\r\n');

	dataElement.innerHTML = '导入招募链接：' + rids.length + '个';
}

function importAccount() {
	accounts = [];
	var dataElement = document.getElementById('account_div');
	var filename = document.all.account.value;
	var file = fs.readFileSync(filename);
	var datas = file.toString().split('\r\n');
	for (var i = 0; i < datas.length; i++) {
		var account = {};
		var value = datas[i].split('----');
		account.account = value[0];
		account.mailPwd = value[1];
		accounts.push(account);
	}

	alert('导入帐号：' + (datas.length) + '个');
}

function selectServer(obj) {
	if (obj.checked) {
		initSrc(parseInt(obj.value));
	}
}

function start() {
	var start_btn = document.getElementById("start_btn");
	var server = document.getElementById("server");
	var index = document.getElementById("index");
	start_btn.disabled = true;

	id = setInterval(function () {

		var title = iframe.contentDocument.title;
		if (title == '') {

			var battleTag = iframe.contentDocument.getElementById('battleTag');
			var ssdd = iframe.contentDocument.getElementById('generate-random-battletag');
			if (battleTag && ssdd) {
				if (battleTag.value == '') {
					battleTag.value = randomNumAsi(4);
				}

			}

		} else if (title == '暴雪帳號登入') {
			var xieyi = iframe.contentDocument.getElementById('legal-submit');
			if (xieyi) {
				xieyi.click();
			} else {
				var num = parseInt(index.value);
				if (num > accounts.length) {
					clearInterval(id);
					alert('注册结束');
				} else {

					iframe.contentWindow.location.href = regUrl;
				}
			}

		} else if (title == '创建您的 Google 帐号') {

			var lastname = iframe.contentDocument.getElementById('lastName');
			var firstname = iframe.contentDocument.getElementById('firstName');
			var username = iframe.contentDocument.getElementById('username');
			var password = iframe.contentDocument.getElementsByName('Passwd')[0];
			var confirmpasswd = iframe.contentDocument.getElementsByName('ConfirmPasswd')[0];
			var phoneNumberId = iframe.contentDocument.getElementById('phoneNumberId');
			var code = iframe.contentDocument.getElementById('code');

			if (firstname && firstname.value == '') {
				// curAccount = accounts[parseInt(index.value) - 1];

				firstname.value = randomEN(4);
				lastname.value = randomEN(4);
				username.value = randomEN(8);

				confirmpasswd.value = password.value = randomNumAsi(8);

			} else if (phoneNumberId && phoneNumberId.value == '') {
				if (phNumber == '') {
					return getPhNumber();
				}
				phoneNumberId.value = phNumber;
			} else if (code && code.value == '') {
				if (smsCode == '') {
					return getMsg();
				}
				code.value = smsCode;
			} else {
				if (iframe.contentDocument.body.dataset.analyticsView && iframe.contentDocument.body.dataset.analyticsView == '/creation/success/success') {
					iframe.contentWindow.location.href = btcUrl;
					if (lastAccout !== curAccount.account) {
						var num = parseInt(index.value) + 1;
						index.value = num;
						var log = curAccount.account + '----' + curAccount.password + '----' + curAccount.mailPwd + '----' + curAccount.idCard + '----' + curAccount.answer + '----' + curAccount.idCard + '----' + curAccount.question;
						console.log(log);
						save(log);
						lastAccout = curAccount.account;
					}
				}

			}


		}
	}, 6000);

}

function save(txt) {
	fs.appendFile('注册成功.txt', txt + ' \r\n', function (err) {
		if (err) throw err;
	});

}

function changePassword() {
	var oldPassword = iframe.contentDocument.getElementById('oldPassword');
	var newPassword = iframe.contentDocument.getElementById('newPassword');
	var newPasswordVerify = iframe.contentDocument.getElementById('newPasswordVerify');

	if (oldPassword && newPassword && newPasswordVerify) {
		oldPassword.value = curAccount.password;
		curAccount.password = newPasswordVerify.value = newPassword.value = 'chenqiao1';
		console.log(newPassword.value);
		var submit = iframe.contentDocument.getElementById('password-submit');
		if (submit) submit.click();
	}
}

function clearCookie() {
	var keys = iframe.contentDocument.cookie.match(/[^ =;]+(?=\=)/g);
	if (keys) {
		for (var i = keys.length; i--;)
			iframe.contentDocument.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString()
	}
}

function stop() {
	var iframe = document.getElementById("hearthstone");
	clearInterval(id);
	start_btn.disabled = false;
}

function execBat() {
	//参数1是拨号连接的本地名称,参数2是此拨号连接所用的用户名,参数3是密码 
	var name = '宽带拨号';
	var account = '宽带账号';
	var password = '宽带密码';
	var child_proc = process.execFileSync('internet.bat', [name, account, password], {
		'encoding': 'utf-8'
	});
	alert(child_proc);
}

function randomNumAsi(len) {　　
	var $chars = 'abcdefhijkmnprstwxyz'; /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/ 　　
	var maxPos = $chars.length;　　
	var pwd = '';　　
	for (i = 0; i < len; i++) {　　　　
		pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
		pwd += Math.floor(Math.random() * 10);　　
	}　　
	return pwd;
}

function randomEN(len) {　　
	var $chars = 'abcdefhijkmnprstwxyz'; /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/ 　　
	var maxPos = $chars.length;　　
	var pwd = '';　　
	for (i = 0; i < len; i++) {　　　　
		pwd += $chars.charAt(Math.floor(Math.random() * maxPos));　　
	}　　
	return pwd;
}

function login() {
	iframe.src = logoutUrl;
}

function smsLogin() {
	var url = smsUrl + '/UserLoginStr?name=' + phUser + '&psw=' + phPwd;
	$.get(url, function (data, status) {
		if (data.length < 4) {
			alert('登陆短信平台失败');
		} else {
			token = data;
		}
	});
}

function getPhNumber() {
	if (token != '') {
		var url = smsUrl + '/GetHM2Str?token=' + token + '&xmid=14946&sl=1&lx=0&a1=&a2=&pk=&ks=0&rj=auphahua1';
		$.get(url, function (data, status) {
			if (data.indexOf("hm=") != -1) {
				phNumber = '+86 ' + data.slice(3);
			} else {
				console.log('获取手机号码失败，重新获取');
			}
		});
	} else {
		alert('请先登陆短信平台');
	}
}

function getMsg() {
	if (token != '') {
		var url = smsUrl + '/GetYzm2Str?token=' + token + '&xmid=14946&hm=' + phNumber + '&sf=0';
		$.get(url, function (data, status) {
			var i = data.indexOf("您的验证码为");
			if (i != -1) {
				smsCode = data.slice(3);
			} else {
				console.log('获取手机号码失败，重新获取');
			}
		});
	} else {
		alert('请先登陆短信平台');
	}


}
// 以下是数据库操作,使用indexedDB

var db = $.indexedDB("HeartStone").objectStore("accounts", {
	"keyPath": "account",
	"autoIncrement": true
});