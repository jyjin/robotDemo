var handlebars = require('handlebars')
var fs = require('fs')
module.exports.render = (filePath, options, callback) => {
    fs.readFile(filePath, function (err, content) {
        if (err) {
            return callback(new Error(err));
        }

        // 这是一个非常简单实现。。。    
        // var rendered = content.toString().replace('123', `[${options.sessionkey}]`)

        var template = handlebars.compile(content.toString())
        console.log(options)
        var rendered = template(options)
        return callback(null, rendered);
    })

}