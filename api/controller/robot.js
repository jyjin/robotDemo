var md5 = require('md5')
var request = require('request')
const XmlReader = require('xml-reader');
const xmlQuery = require('xml-query');// query xml node

const parseString = require('xml2js').parseString; // xml parse to json

const data2xml = require('data2xml');
const convert = data2xml();  // json parse to xml

const async = require('async')
const http = require('http')

/**
 * 
 *  accountid = 1005601  【子公司编号】
 *  userid    = 221070	【调用者编号】
 *  appid     = 365webcall  【总公司标识】
 *  appkey    = adef2244abc12qwrttaggkghh 【加密密匙】
 * 
 * timestamp = 1527751975 => 2018/5/31 15:32:55 【时间戳】
 * signature = md5 url串【appid=365webcall&accountid=1005601&userid=221070&timestamp=1527751975】+appkey【adef2244abc12qwrttaggkghh】
 *            = md5("appid=365webcall&accountid=1005601&userid=221070&timestamp=1527751975adef2244abc12qwrttaggkghh")
 *            = d0bbb38838f71436 【检验串】
 */

let data = {
    accountid: 1005601,
    userid: 221070,
    appid: '365webcall',
    appkey: 'adef2244abc12qwrttaggkghh',
    timestamp: (Number(new Date()) + '').substr(0, 10),
    signature: ''
}

const getSignature = () => {
    let str = `appid=${data.appid}&accountid=${data.accountid}&userid=${data.userid}&timestamp=${data.timestamp}${data.appkey}`
    let signature = md5(str).substr(8, 16)
    console.log(`[ ${str} ] \n----------------------------------------------------\nmd5后为 =>`, signature)
    return signature
}

const queryAnd = (data) => {
    let query = []
    for (var key in data) {
        query.push(`${key}=${data[key]}`)
    }
    return query
}

const makeUrl = (param) => {
    param = Object.assign({}, data)
    param.signature = getSignature();
    delete param.appkey
    let query = queryAnd(param)
    let url = `http://robot.online000.com/robot/RobotOpenSession.aspx?${query.join('&')}`
    // console.log(`\n[ visit "${url}" ... ]\n----------------------------------------------------\n`)
    return url
}

const HttpGet = (url, data, callback) => {
    request.get(url, data, (err, result) => {
        if (err) {
            console.log('[ AJAX GET ERROR ]', err)
            callback(err)
            return
        }
        console.log(`\n AJAX GET => [ ${url} ] `)
        callback(null, result)
    })
}

const HttpPost = (url, data, callback) => {
    request.post(url, data, (err, result) => {
        if (err) {
            console.log('[ AJAX POST ERROR ]', err)
            callback(err)
            return
        }
        console.log(`\n AJAX POST => [ ${url} ] `)
        callback(null, result)
    })
}

const HttpPostXml = (url, data, callback) => {

    var body = convert('xml', data);
    console.log('[ POSTING XML ]\n', body);
    var query = url.split('?')[1];

    var postRequest = {
        host: "robot.online000.com",
        path: "/robot/RobotQuery.aspx?" + query,
        port: 80,
        method: "POST",
        headers: {
            'Cookie': "cookie",
            'Content-Type': 'text/xml',
            'Content-Length': Buffer.byteLength(body)
        }
    };

    var req = http.request(postRequest, function (res) {

        console.log(res.statusCode);
        var buffer = "";
        res.on("data", function (data) {
            buffer = buffer + data;
        });
        res.on("end", function (data) {
            console.log(`\n[ POST XML RESULT ]\n`, buffer);
            callback(null, buffer, body)
        });
    });

    req.on('error', function (e) {
        console.log('[ PROBLEM WITH REQUEST ]' + e.message);
        callback('[ PROBLEM WITH REQUEST ]' + e.message)
    });

    req.write(body);
    req.end();
}

exports.getSessionkey = (req, res, next) => {
    HttpGet(makeUrl(), null, (err, result) => {
        const ast = XmlReader.parseSync(result.body);
        const rest = xmlQuery(ast)
        var errorcode = rest.find('errorcode').text()
        var sessionkey = rest.find('sessionkey').text()
        console.log('errorcode', errorcode)
        console.log('sessionkey', sessionkey)

        if (err) {
            console.log(`[ ERROR IN async] sessionkey`)
        }
        if (errorcode) {
            console.log(`[ ERROR IN async] sessionkey`)
        }
        res.send({
            res: 1,
            data: {
                sessionkey: sessionkey
            }
        })
    })
}

exports.getSessionkeyHtml = (req, res, next) => {
    HttpGet(makeUrl(), null, (err, result) => {
        const ast = XmlReader.parseSync(result.body);
        const rest = xmlQuery(ast)
        var errorcode = rest.find('errorcode').text()
        var sessionkey = rest.find('sessionkey').text()
        console.log('errorcode', errorcode)
        console.log('sessionkey', sessionkey)

        if (err) {
            console.log(`[ ERROR IN async] sessionkey`)
        }
        if (errorcode) {
            console.log(`[ ERROR IN async] sessionkey`)
        }
        return res.render('test', {
            sessionkey: sessionkey
        })
    })
}

exports.askRobot = (req, res, next) => {
    console.log('params:', req.body)

    let opt = {
        sessionkey: req.body.sessionkey,
        clientid: req.body.clientid,                  // 【访客编号】
        way: req.body.way,                            // 【访客渠道】(PC:0,微信:1,APP:2,WAP:3,QQ:4,VOIP:5)
        defaultreply: req.body.defaultreply,          // 匹配不到， 是否【回答默认值】
        log: req.body.log,                            // 是否【记录日志】
        ipaddress: req.body.ipaddress || '',          // 【访客ip地址】
        sentence: req.body.sentence || '',            // 【访客提问的问题】
        comparetitle: req.body.comparetitle,          // 是否【只匹配标题】
        includekey: req.body.includekey,              //
        includetitle: req.body.includetitle,          //
        includeprivate: req.body.includeprivate,      // 是否【搜索私有知识库】
        maxcount: req.body.maxcount,                  // 【匹配的最多知识数】
        includeright: req.body.includeright,          // 返回列表是否需要 【权重】
        includekid: req.body.includekid,              // 返回列表是否需要 【知识编号】
        includenum: req.body.includenum,              // 返回列表是否需要 【自增编号】 
        rightdesc: req.body.rightdesc,                // 返回列表是否需要 【按权重降序排列】
    };


    (opt.way == undefined) && (opt.way = 0);
    (opt.defaultreply == undefined) && (opt.defaultreply = 1);
    (opt.log == undefined) && (opt.log = 1);
    (opt.comparetitle == undefined) && (opt.comparetitle = 1);
    (opt.includeprivate == undefined) && (opt.includeprivate = 1);
    (opt.maxcount == undefined) && (opt.maxcount = 10);
    (opt.includeright == undefined) && (opt.includeright = 1);
    (opt.includekid == undefined) && (opt.includekid = 1);
    (opt.includenum == undefined) && (opt.includenum = 1);
    (opt.rightdesc == undefined) && (opt.rightdesc = 1);

    console.log('opt:', opt)

    async.auto({
        sessionkey: (cb) => {
            // HttpGet(makeUrl(), null, (err, result) => {
            //     const ast = XmlReader.parseSync(result.body);
            //     const rest = xmlQuery(ast)

            //     var errorcode = rest.find('errorcode').text()
            //     var sessionkey = rest.find('sessionkey').text()

            //     console.log('[ errorcode ]', errorcode)
            //     console.log('[ sessionkey ]', sessionkey)

            //     if (err) {
            //         console.log(`[ ERROR IN async] sessionkey`)
            //         return cb(err)
            //     }
            //     if (errorcode) {
            //         console.log(`[ ERROR IN async] sessionkey`)
            //         return cb(errorcode)
            //     }
            //     cb(null, sessionkey)
            // })
            cb(null, opt.sessionkey)
        },
        robotQuery: ['sessionkey', (result, cb) => {
            console.log('\n\n\n')
            let url = `http://robot.online000.com/robot/RobotQuery.aspx?sessionkey=${result.sessionkey}`
            let data = opt;
            data.sentence = `<![CDATA[${opt.sentence}]]>`
            delete data.sessionkey
            HttpPostXml(url, data, (err, xmlResult, xml) => {
                if (err) {
                    console.log(`[ ERROR IN async] robotQuery`)
                    return cb(err, { xmlResult: xmlResult, xml: xml })
                }
                const _xmlResult = xmlResult;
                const ast = XmlReader.parseSync(_xmlResult);
                const rest = xmlQuery(ast)
                var errorcode = rest.find('errorcode').text()

                console.log('[ errorcode ]', errorcode)
                console.log('[ rest ]', rest)

                if (errorcode != 0) {
                    return cb(errorcode, { xmlResult: xmlResult, xml: xml })
                }
                cb(null, { xmlResult: xmlResult, xml: xml })
            })
        }]
    }, (err, result) => {


        if (err) {
            console.log(`[ ERROR IN async callback ]`, err)
            return res.send({
                res: 1,
                data: {
                    jsonResult: err,
                    xmlResult: result.robotQuery.xmlResult,
                    xml: result.robotQuery.xml,
                    url: `http://robot.online000.com/robot/RobotQuery.aspx?sessionkey=${result.sessionkey}`
                }
            })
        }

        console.log('==========result:', result.robotQuery)

        parseString(result.robotQuery.xmlResult, (err, parseResult) => {
            res.send({
                res: 1,
                data: {
                    jsonResult: parseResult,
                    xmlResult: result.robotQuery.xmlResult,
                    xml: result.robotQuery.xml,
                    url: `http://robot.online000.com/robot/RobotQuery.aspx?sessionkey=${result.sessionkey}`
                }
            })
        })

    })
}

const exec = require('child_process').exec

function addZero(n) {
    return n < 10 ? '0' + n : n
}

function dateStr(d) {
    return d.getFullYear() + '-'
        + addZero(d.getMonth() + 1) + '-'
        + addZero(d.getDay()) + ' '
        + addZero(d.getHours()) + ':'
        + addZero(d.getMinutes()) + ':'
        + addZero(d.getSeconds()) + ' '
        // + d.getMilliseconds()
}

exports.httpExec = (req, res, next) => {
    console.log('params: ', req.body)
    let opt = {
        path: req.body.path,
        commandStr: req.body.commandStr
    }

    if (!opt.path) {
        res.send({
            res: -1,
            message: `Parameter 'path' is required`
        })
    }

    if (!opt.commandStr) {
        res.send({
            res: -1,
            message: `Parameter 'path' is required`
        })
    }

    let command = `${opt.path} ${opt.commandStr}`

    console.log(`[ ${dateStr(new Date())} ] == Running command == [ ${command} ]`)
    exec(command, (err, stdOut, stdErr) => {
        if (err) {
            return res.send({
                res: -1,
                message: `Excute command [ ${command} ] error `,
                data: {
                    error: err
                }
            })
        }

        if (stdErr) {
            return res.send({
                res: 1,
                message: `Excute command [ ${command} ] success with warning `,
                data: {
                    warning: stdErr
                }
            })
        }

        res.send({
            res: 1,
            data: {
                message: `Excute command [ ${command} ] success `
            }
        })
    })



}