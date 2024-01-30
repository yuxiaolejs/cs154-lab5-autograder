const fs = require("fs")
const child_process = require("child_process")

let regs = ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"]

function compose(test_suites) {
    let outputSource = "main:\n"
    let expectedDRamVal = []

    let tests = []

    let reg

    for (let i = 0; i < test_suites.length; i++) {
        let test = test_suites[i]
        outputSource += test.inst + "\n"
        expectedDRamVal = expectedDRamVal.concat(test.exp)
        tests = tests.concat(test.tests)
        reg = reg.concat(test.reg)
    }
    return {
        source: outputSource,
        expected: expectedDRamVal,
        tests: tests,
        reg:reg
    }
}

function compile(sourceCode) {
    return new Promise((res, rej) => {
        let fileName = parseInt(Math.random() * 100000) + ".s"
        let binary = ""
        fs.promises.writeFile(fileName, sourceCode).then(() => {
            return new Promise((res1, rej1) => {
                let std = ""
                let child = child_process.spawn(`bash`, [`compile.sh`, fileName, `${fileName}.txt`], { cwd: __dirname })
                child.stdout.on('data', (data) => {
                    std += data.toString()
                })
                child.stderr.on('data', (data) => {
                    std += data.toString()
                })
                child.on("exit", (d) => {
                    if (d === 0) res1()
                    else rej1(new Error("Compile Error: " + d + "\n\nOutput:\n" + std))
                })
            })
        }).then(() => {
            return fs.promises.readFile(fileName + ".txt")
        }).then((data) => {
            binary = data.toString()
            return fs.promises.unlink(fileName)
        }).then(() => {
            return fs.promises.unlink(fileName + ".txt")
        }).then(() => {
            res(binary)
        }).catch((e) => {
            rej(e)
        })
    })
}
function rfADDI(num) {
    let instructions = []
    let exp_res = []

    let tests = []

    let reg = []

    for (let i = 0; i < num; i++) {
        let t1 = regs[parseInt(Math.random() * regs.length)]
        let current = parseInt(Math.random() * 100)
        instructions.push(`addi $${t1}, $zero, current`)
        tests.push(`addi $${t1}, $zero, ${current}`)
        exp_res.push(current)
        reg.push(t1)
    }
    return {
        tests: tests,
        inst: instructions.join("\n"),
        exp: exp_res,
        reg: reg
    }
}

function rfADD(num) {
    let instructions = []
    let exp_res = []

    let tests = []

    let reg = []

    for (let i = 0; i < num; i++) {
        let t1 = regs[parseInt(Math.random() * regs.length)]
        let t2 = regs[parseInt(Math.random() * regs.length)]
        let inp1 = parseInt(Math.random() * 100) - 50
        let inp2 = parseInt(Math.random() * 100) - 50
        instructions.push(`addi $${t1}, $zero, ${inp1}`)
        instructions.push(`addi $${t2}, $zero, ${inp2}`)
        instructions.push(`add $${t1}, $${t2}, $${t1}`)
        tests.push(`add $${t1}, $${t2}, $${t1}`)
        exp_res.push(inp1 + inp2)
        reg.push(t1)
    }
    return {
        tests: tests,
        inst: instructions.join("\n"),
        exp: exp_res,
        reg: reg
    }
}

const functionMap = {
    "addi": rfADDI,
    "add": rfADD
}

module.exports = {
    compose,
    compile,
    functionMap
}