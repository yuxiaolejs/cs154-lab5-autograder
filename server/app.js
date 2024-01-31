const app = require('express')();
const bodyParser = require('body-parser');
const mipsmem = require("./mips")
const mipsrf = require("./mipsrf")

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

process.on('uncaughtException', function (err) {
    console.log(err);
})

process.on('unhandledRejection', function (err) {
    console.log(err);
})

app.all('*', (req, res, next) => {
    let time = new Date()
    let date = time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + time.getDate() + " " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()
    console.log(date,req.method, req.url, req.headers['x-real-ip'])
    next()
})

app.get('/', (req, res) => {
    res.redirect("https://github.com/yuxiaolejs/cs154-lab3-autograder")
})

app.post('/testcase', (req, res) => {
    let mips = mipsmem
    let testSuit = []
    let keys = Object.keys(req.body)
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i]
        let value = req.body[key]
        if (value && mips.functionMap[key] && typeof mips.functionMap[key] === "function" && typeof value === "number") {
            testSuit.push(mips.functionMap[key](value))
        }
    }
    let composed = mips.compose(testSuit)
    mips.compile(composed.source).then((binary) => {
        res.json({
            code: 200,
            binary: binary,
            composed: composed
        })
    }).catch((e) => {
        console.log(e)
        res.json({
            code: 500,
            message: e.message
        })
    })
})

app.post('/rf/testcase', (req, res) => {
    let mips = mipsrf
    let testSuit = []
    let keys = Object.keys(req.body)
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i]
        let value = req.body[key]
        if (value && mips.functionMap[key] && typeof mips.functionMap[key] === "function" && typeof value === "number") {
            testSuit.push(mips.functionMap[key](value))
        }
    }
    let composed = mips.compose(testSuit)
    mips.compile(composed.source).then((binary) => {
        res.json({
            code: 200,
            binary: binary,
            composed: composed
        })
    }).catch((e) => {
        console.log(e)
        res.json({
            code: 500,
            message: e.message
        })
    })
})

app.listen(13002, () => {
    console.log("Listening on port 13002")
})