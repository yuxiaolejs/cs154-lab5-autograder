const app = require('express')();
const bodyParser = require('body-parser');
const mips = require("./mips")

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.redirect("https://github.com/yuxiaolejs/cs154-lab3-autograder")
})

app.post('/testcase', (req, res) => {
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