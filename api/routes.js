const robot = require('./controller/robot')
const port = 5555;

const routers = (app) => {

    app.get('/', (req, res, next) => {
        return res.sendFile('robot.html', {
            // root: __dirname.replace('\\api', '') + '/client'
            root: __dirname.replace('/api', '') + '/client'
        })
    })

    app.use('/pipe', (req, res, next) => {
        console.log('parasm:', req.body)
        console.log('parasm:', req.query)
        return res.send({ res: 1, data: req.body })
    })

    //运行第三方的接口
    app.get('/get', (req, res, next) => {
        console.log('params:', req.query)
        return res.send({
            res: 1,
            data: req.query,
            msg: 'test success'
        })
    })

    app.post('/post', (req, res, next) => {
        console.log('params1111:', req.body)
        return res.send({
            res: 1,
            msg: 'test success',
            data: req.body
        })
    })

    app.use('/use', (req, res, next) => {
        console.log('params query:', req.query)
        console.log('params body:', req.body)
        return res.send({
            res: 1,
            msg: 'test success',
            data: {
                query: req.body,
                body: req.body,
            }
        })
    })

    app.get('/file', (req, res, next) => {
        console.log('__diranme:', __dirname)
        return res.sendFile('hello.html', {
            root: __dirname.replace('\\api', '') + '/public'
        })
    })

    app.get('/key', robot.getSessionkeyHtml)
    app.get('/getKey', robot.getSessionkey)

    app.post('/postxml', (req, res, next) => {
        console.log('params query:', req.query)
        console.log('params body:', req.body)
        return res.send({
            res: 1,
            data: 'xml post success'
        })
    })

    app.post('/askRobot', robot.askRobot)

    app.post('/httpExec', robot.httpExec)
}

const router = function (app) {
    let server = require('http').createServer(app);
    routers(app)
    server.listen(port, function (err) {
        if (err) {
            console.log(err);
            return;
        }
        console.log('listening on http://127.0.0.1:' + port)
    })
}

module.exports = router;
