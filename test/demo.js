var md5 = require('md5')
var request = require('request')
const XmlReader = require('xml-reader');
const xmlQuery = require('xml-query');
const async = require('async')

// accountid = 1005601  【子公司编号】
// userid    = 221070	【调用者编号】
// appid     = 365webcall  【总公司标识】
// appkey    = adef2244abc12qwrttaggkghh 【加密密匙】

// timestamp = 1527751975 => 2018/5/31 15:32:55 【时间戳】
// signature = md5 url串【appid=365webcall&accountid=1005601&userid=221070&timestamp=1527751975】+appkey【adef2244abc12qwrttaggkghh】
//           = md5("appid=365webcall&accountid=1005601&userid=221070&timestamp=1527751975adef2244abc12qwrttaggkghh")
//           = d0bbb38838f71436 【检验串】

var data = {
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

const ajaxGet = (url, data, callback) => {
    request.get(url, data, (err, result) => {
        if (err) {
            console.log('[ AJAX GET ERROR ]', err)
            callback(err)
            return
        }
        console.log(` AJAX GET => [ ${url} ] `)
        callback(null, result)
    })
}

const ajaxPost = (url, data, callback) => {
    request.post(url, data, (err, result) => {
        if (err) {
            console.log('[ AJAX POST ERROR ]', err)
            callback(err)
            return
        }
        console.log(` AJAX POST => [ ${url} ] `)
        callback(null, result)
    })
}



async.auto({
    sessionkey: (cb) => {
        ajaxGet(makeUrl(), null, (err, result) => {
            const ast = XmlReader.parseSync(result.body);
            const rest = xmlQuery(ast)
            var errorcode = rest.find('errorcode').text()
            var sessionkey = rest.find('sessionkey').text()
            console.log('errorcode', errorcode)
            console.log('sessionkey', sessionkey)
            if (err) {
                console.log(`[ ERROR IN async] sessionkey`)
                return cb(err)
            }
            if (errorcode) {
                console.log(`[ ERROR IN async] sessionkey`)
                return cb(errorcode)
            }
            cb(null, sessionkey)
        })
    },
    robotQuery: ['sessionkey', (result, cb) => {
        let url = `http://robot.online000.com/robot/RobotQuery.aspx?sessionkey=${result.sessionkey}`
        let param = {
            // clientid: '',                 // 【访客编号】
            // way: 0,                       // 【访客渠道】(PC:0,微信:1,APP:2,WAP:3,QQ:4,VOIP:5)
            // defaultreply: 1,              // 匹配不到， 是否【回答默认值】
            // log: 1,                       // 是否【记录日志】
            // ipaddress: '',                // 【访客ip地址】
            // sentence: '',                 // 【访客提问的问题】
            // comparetitle: 1,              // 是否【只匹配标题】
            // includeprivate: 1,            // 是否【搜索私有知识库】
            // maxcount: 10,                 // 【匹配的最多知识数】

            // includeright: 1,          // 返回列表是否需要 【权重】
            // includekid: 1,            // 返回列表是否需要 【知识编号】
            // includenum: 1,            // 返回列表是否需要 【自增编号】 
            // rightdesc: 1,             // 返回列表是否需要 【按权重降序排列】
        };

        // param.clientid = Number(new Date())
        param.sentence = "<![CDATA[你好]]>"


        ajaxPost(url, param, (err, result) => {
            if (err) {
                console.log(`[ ERROR IN async] robotQuery`)
                return cb(err)
            }
            console.log('[ query result ]', result)
        })
    }]
}, (err, result) => {
    if (err) {
        console.log(`[ ERROR IN async callback ]`, err)
    }
})