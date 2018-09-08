var id = '20125';//'109010';
var key = 'd09f345f52a547f6b4e18cc8b4ae2914';//'726c6fa271bd499b84edc70d238a0849';
var CryptoJS = require('crypto-js');
var UserID = '100';
var MAC = '99EE99EE99EE';
var UserName = 'noiceman1';
var password = 'chenqiao';
var UserKey;
var headers = {
'SID':id,
'HASH':MD5(id+key.toUpperCase()),
'UUVersion':'1.0.0.1',
'UID':UserID,
'User-Agent':MD5(key.toUpperCase()+UserID)
};
var loginSer,loginPort,uploadSer,uploadPort,resultSer,resultPort;
refresh();
function refresh(){
	var deferred = Q.defer();
	var req = http.get('http://common.taskok.com:9000/Service/ServerConfig.aspx', function(res) {
		  var data = '';
			 res.on("data", function(chunk){
				data+=chunk;
			});

			res.on("end", function(){
				console.log(data);
				var servers = data.split(',');
				var a = servers[1].split(':');
				loginSer = a[0];
				loginPort = a[1];
				var a = servers[2].split(':');
				uploadSer = a[0];
				uploadPort = a[1];
				var a = servers[3].split(':');
				resultSer = a[0];
				resultPort = a[1];
				console.log('刷新服务器');
				deferred.resolve();
			});
		}).on('error', function(e) {  
			deferred.reject();
			console.log("获取答题服务器列表失败: " + e.message);  
	}); 
	return deferred.promise;
}
function login(){
	loginUU().then(getScore);
}

function getScore(){
	var uuAgent = MD5(UserKey.toUpperCase() + UserID + key);
	
	var headers = {
	'SID':id,
	'HASH':MD5(id+key.toUpperCase()),
	'UUVersion':'1.0.0.1',
	'UID':UserID,
	'User-Agent':MD5(key+UserID),
	'KEY': UserKey,
	'UUAgent':uuAgent
	};
console.log(UserID);
	var options = {
	  hostname: loginSer,
	  port: loginPort,
	  path: '/Upload/GetPoint.aspx?U='+UserName+'&p='+MD5(password),
	  method: 'POST',
	  headers:headers
	};

	var deferred = Q.defer();
	var req = http.request(options, function(res) {
		var data = '';

		res.on("data", function(chunk){
			data+=chunk;
		});

		res.on("end", function(){

			if(data<0){
				alert('查分失败:'+data);
				deferred.reject();
			}else{
				 document.getElementById('d1').innerHTML = '剩余题分:'+data;
				deferred.resolve();
			}
		});
	});

	req.on('error', function(e) {
		console.log('problem with request: ' + e.message);
	});
	req.write('');
	req.end();
	return deferred.promise;
}

function loginUU(){
	if(loginSer){
		headers.KEY = MD5(key.toUpperCase() + UserName.toUpperCase()) + MAC;    				
		headers.UUKEY = MD5(UserName.toUpperCase() + MAC + key.toUpperCase());	
		var options = {
		  hostname: loginSer,
		  port: loginPort,
		  path: '/Upload/UULogin.aspx?U='+UserName+'&p='+MD5(password),
		  method: 'GET',
		  headers:headers
		};
		var deferred = Q.defer();
		var req = http.request(options, function(res) {
			var data = '';
			res.on("data", function(chunk){
				data+=chunk;
			});

			res.on("end", function(){
				var ret = data.indexOf('_');
				console.log(data);
				if(ret<0){
					alert('登录失败:'+ret);
					deferred.reject();
				}else{
					alert('登录成功');
					UserID = data.substr(0,ret);
					UserKey = data;
					deferred.resolve();
				}
			});
		});

		req.on('error', function(e) {
			console.log('problem with request: ' + e.message);
			deferred.reject();
		});
		req.end();
		
	}else{
		alert('服务器忙，请稍等.....');
	}
	return deferred.promise;
}

function uploadPic(){
 uploadPicToUUWish();
}

function uploadPicToUUWish(){
	var fileData = fs.readFileSync(picPath);
	var img = fileData.toString("Hex")
	var guid = MD5(img);
	var postData = querystring.stringify({
	  'key':UserKey.toUpperCase(),
	  'sid':id,
	  'skey':MD5(UserKey.toLowerCase()+id+key),
	  'Version':100,
	  'TimeOut':60000,
	  'Type':3109,
	  'GUID':guid,
//	  'img':''
	});
	console.log(postData);
	var deferred = Q.defer();
	var headers = {
	'SID':id,
	'HASH':MD5(id+key.toUpperCase()),
	'UUVersion':'1.1.1.3',
	'UID':UserID,
	'User-Agent':MD5(key.toUpperCase()+UserID),
    'Content-Type':'multipart/form-data;boundary=------aabbccdd',
//	'Content-Length': postData.length+fileData.length
	};
console.log(headers);
	var options = {
	  hostname: uploadSer,
	  port: uploadPort,
	  path: '/Upload/Processing.aspx',
	  method: 'POST',
	  headers: headers
	};
console.log(uploadSer+':'+uploadPort);
	var req = http.request(options, function(res) {
		console.log("statusCode: ", res.statusCode);
		
		var data = '';
		 res.on("data", function(chunk){
			data+=chunk;
		});

		res.on("end", function(){
			console.log(data);
			deferred.resolve();
		});
	});

	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	  deferred.reject();
	});

	// write data to request body
	req.write(postData);
//	req.write(fileData);
	req.end();
	return deferred.promise;
}

function MD5(src){
	var hash = CryptoJS.MD5(src);
	return hash.toString();
}

function readPic(){
	var fileData = fs.readFileSync(picPath);
	console.log(fileData.toString("Hex"));
}