const request = require('request')

request.post({
    url: 'http://192.168.129.21:5556/pipe',
    form: {
        name: 'monica'
    },
}, (err, res, body) => {
    console.log(body)
})

request.post('http://192.168.129.21:5556/pipe', {
    form: {
        name: 'monica'
    },
}, (err, res, body) => {
    console.log(body)
})

request({
    url: 'http://192.168.129.21:5556/pipe',
    method: 'POST',
    json: {
        name: 'monica'
    },
}, (err, res, body) => {
    console.log(body)
})


request.post({
    url: 'http://192.168.129.21:5556/pipe',
    body: {
        name: 'monica'
    },
    json: true
}, (err, res, body) => {
    console.log(body)
})

request.post({
    url: 'http://192.168.129.21:5556/pipe',
    form: {
        name: 'monica'
    },
}).pipe((res)=>{
    console.log(res)
})