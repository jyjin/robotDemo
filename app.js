const express = require('express')
const bodyParser = require('body-parser');
const serverRoutes = require('./api/routes');
const myEngine = require('./api/myEngine').render
const app = express();

var xmlparser = require('express-xml-bodyparser'); //xml 解析器
app.use(xmlparser());

//=======================使用ejs模板==================================== 
// appKey adef2244abc12qwrttaggkghh
// app.set('views', __dirname + '\\components');    
// app.set('view engine', 'ejs')
//---------------------------------------------------------------------

//=======================自己任意定制其他模板============================
app.engine('hdb', myEngine)                         //自定义视图引擎
app.set('views', __dirname + '\\view');             //指定视图目录
app.set('view engine', 'hdb')                       //注册自定义模板
//---------------------------------------------------------------------

app.use(bodyParser.json({ type: 'application/*+json' }))
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: false }));
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization,x-access-token,x-access-lan');
    res.setHeader('Access-Control-Allow-Credentials', true);
    if ('OPTIONS' === req.method) {
        res.sendStatus(200);
    }
    else {
        next();
    }
});

serverRoutes(app);

