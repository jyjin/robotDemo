var md5 = require('md5')
var request = require('request')
const XmlReader = require('xml-reader');
const xmlQuery = require('xml-query');
const data2xml = require('data2xml');
const convert = data2xml();
const async = require('async')
var fs = require('fs')
const http = require('http')

const HttpPostXml = (url, data, callback) => {
    var xml = convert('xml', data);
    console.log('[ POST XML ]\n', xml);

    var body = `<?xml version="1.0" encoding="utf-8"?><xml><clientid>1528089216176</clientid><way>0</way><defaultreply>1</defaultreply><log>1</log><ipaddress></ipaddress><sentence>&lt;![CDATA[你好]]&gt;</sentence><comparetitle>1</comparetitle><includeprivate>1</includeprivate><maxcount>10</maxcount><includeright>1</includeright><includekid>1</includekid><includenum>1</includenum><rightdesc>1</rightdesc></xml>`

    var query = url.split('?')[1]
    var postRequest = {
        host: "robot.online000.com",
        path: "/RobotQuery.aspx?sessionkey=mw76INI6Pm660w6m6wNNm6P6mIN6m7z2D6wz2D60z206Iz3ANIz3AbXm6m0N7mwNN6NIw",
        port: 80,
        method: "POST",
        headers: {
            'Cookie': "cookie",
            'Content-Type': 'text/xml',
            'Content-Length': Buffer.byteLength(body)
        }
    };

    var buffer = "";

    var req = http.request(postRequest, function (res) {

        console.log(res.statusCode);
        var buffer = "";
        res.on("data", function (data) { buffer = buffer + data; });
        res.on("end", function (data) { console.log(buffer); });

    });

    req.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });

    req.write(body);
    req.end();
}

let url = `http://127.0.0.1:5555/postxml`
let data = {
    clientid: '1528089216176',
    way: 0,
    defaultreply: 1,
    log: 1,
    ipaddress: '',
    sentence: '你好',
    comparetitle: 1,
    includeprivate: 1,
    maxcount: 10,
    includeright: 1,
    includekid: 1,
    includenum: 1,
    rightdesc: 1
}

HttpPostXml(url, data, (err, result) => {
    console.log('err:', err)
    console.log('result:', result)
})