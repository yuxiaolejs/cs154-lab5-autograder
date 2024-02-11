const fs = require("fs")
const child_process = require("child_process")

function compose(test_suites) {
    let outputSource = "main:\n"
    let expectedDRamVal = []

    let tests = []

    let count = 0

    for (let i = 0; i < test_suites.length; i++) {
        let test = test_suites[i]
        outputSource += test.inst + "\n"
        expectedDRamVal = expectedDRamVal.concat(test.exp)
        tests = tests.concat(test.tests)
        count += test.count
    }
    count += 10 // Just in case pipeline is not flushed
    return {
        source: outputSource,
        expected: expectedDRamVal,
        tests: tests,
        count: count
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

function flushPipeline(insts) {
    insts.push("nop")
    insts.push("nop")
    insts.push("nop")
}

function getExMemForwardA(nums) {
    let instructions = []
    let exp_res = []

    let t1 = 0
    let tests = []
    for (let i = 0; i < nums; i++) {
        let current = parseInt(Math.random() * 100) - 50
        instructions.push("addi $t1, $zero, 0")
        flushPipeline(instructions)
        instructions.push("addi $t1, $t1, " + current)
        instructions.push("addi $t2, $t1, " + current)
        flushPipeline(instructions)
        instructions.push("sw $t2, 0($k0)")
        flushPipeline(instructions)
        instructions.push("addi $k0, $k0, 1")
        flushPipeline(instructions)
        tests.push("addi $t1, $t1, " + current + "; addi $t2, $t1, " + current)
        t1 = current + current
        exp_res.push(t1)
    }
    return {
        tests: tests,
        inst: instructions.join("\n"),
        exp: exp_res,
        count: instructions.length
    }
}

function getExMemForwardBoth(nums) {
    let instructions = []
    let exp_res = []

    let t1 = 0
    let tests = []
    for (let i = 0; i < nums; i++) {
        let current1 = parseInt(Math.random() * 100) - 50
        instructions.push("addi $t1, $zero, " + current1)
        instructions.push("add $t2, $t1, $t1")
        flushPipeline(instructions)
        instructions.push("sw $t2, 0($k0)")
        flushPipeline(instructions)
        instructions.push("addi $k0, $k0, 1")
        flushPipeline(instructions)
        tests.push("addi $t1, $zero, " + current1 + "; add $t2, $t1, $t1")
        t1 = current1 + current1
        exp_res.push(t1)
    }
    return {
        tests: tests,
        inst: instructions.join("\n"),
        exp: exp_res,
        count: instructions.length
    }
}

function getMemWbForwardA(nums) {
    let instructions = []
    let exp_res = []

    let t1 = 0
    let tests = []
    for (let i = 0; i < nums; i++) {
        let current = parseInt(Math.random() * 100) - 50
        instructions.push("addi $t1, $zero, 0")
        flushPipeline(instructions)
        instructions.push("addi $t1, $t1, " + current)
        instructions.push("nop")
        instructions.push("addi $t2, $t1, " + current)
        flushPipeline(instructions)
        instructions.push("sw $t2, 0($k0)")
        flushPipeline(instructions)
        instructions.push("addi $k0, $k0, 1")
        flushPipeline(instructions)
        tests.push("addi $t1, $t1, " + current + "; addi $t2, $t1, " + current)
        t1 = current + current
        exp_res.push(t1)
    }
    return {
        tests: tests,
        inst: instructions.join("\n"),
        exp: exp_res,
        count: instructions.length
    }
}

function getMemWbForwardBoth(nums) {
    let instructions = []
    let exp_res = []

    let t1 = 0
    let tests = []
    for (let i = 0; i < nums; i++) {
        let current1 = parseInt(Math.random() * 100) - 50
        instructions.push("addi $t1, $zero, " + current1)
        instructions.push("nop")
        instructions.push("add $t2, $t1, $t1")
        flushPipeline(instructions)
        instructions.push("sw $t2, 0($k0)")
        flushPipeline(instructions)
        instructions.push("addi $k0, $k0, 1")
        flushPipeline(instructions)
        tests.push("addi $t1, $zero, " + current1 + "; add $t2, $t1, $t1")
        t1 = current1 + current1
        exp_res.push(t1)
    }
    return {
        tests: tests,
        inst: instructions.join("\n"),
        exp: exp_res,
        count: instructions.length
    }
}


function getBackToBack(nums) {
    let instructions = []
    let exp_res = []

    let t1 = 0
    let t2 = 0
    let tests = []
    for (let i = 0; i < nums; i++) {
        let current1 = parseInt(Math.random() * 100) - 50
        let current2 = parseInt(Math.random() * 100) - 50
        let current3 = parseInt(Math.random() * 100) - 50
        let current4 = parseInt(Math.random() * 100) - 50
        instructions.push("addi $t1, $zero, " + current1)
        instructions.push("addi $t1, $t1, " + current2)
        instructions.push("addi $t2, $zero, " + current3)
        instructions.push("addi $t2, $t2, " + current4)
        instructions.push("addi $t1, $t1, " + current1)
        instructions.push("add $t1, $t2, $t1")
        instructions.push("add $t2, $t1, $t2")

        flushPipeline(instructions)
        instructions.push("sw $t2, 0($k0)")
        flushPipeline(instructions)
        instructions.push("addi $k0, $k0, 1")
        flushPipeline(instructions)
        tests.push("Too long, see source code for details.")
        t1 = current1 + current2 + current1
        t2 =  current3 + current4
        t1 = t2 + t1
        t2 = t1 + t2
        exp_res.push(t2)
    }
    return {
        tests: tests,
        inst: instructions.join("\n"),
        exp: exp_res,
        count: instructions.length
    }
}

function getZeroReg(nums) {
    let instructions = []
    let exp_res = []

    let t1 = 0
    let t2 = 0
    let tests = []
    for (let i = 0; i < nums; i++) {
        let current1 = parseInt(Math.random() * 100) - 50
        let current2 = parseInt(Math.random() * 100) - 50
        let current3 = parseInt(Math.random() * 100) - 50
        let current4 = parseInt(Math.random() * 100) - 50
        instructions.push("addi $zero, $zero, " + current1)
        instructions.push("addi $t1, $zero, " + current2)
        instructions.push("addi $zero, $zero, " + current3)
        instructions.push("addi $zero, $zero, " + current4)
        instructions.push("addi $t2, $zero, " + current1)
        instructions.push("add $t2, $t1, $t2")

        flushPipeline(instructions)
        instructions.push("sw $t2, 0($k0)")
        flushPipeline(instructions)
        instructions.push("addi $k0, $k0, 1")
        flushPipeline(instructions)
        tests.push("Too long, see source code for details.")
        t2 = current1 + current2
        exp_res.push(t2)
    }
    return {
        tests: tests,
        inst: instructions.join("\n"),
        exp: exp_res,
        count: instructions.length
    }
}

function getLoadWord(nums) {
    let instructions = []
    let exp_res = []

    let t1 = 0
    let t2 = 0
    let tests = []
    let stalls = 0
    for (let i = 0; i < nums; i++) {
        let current1 = parseInt(Math.random() * 100) + 1050
        let current2 = parseInt(Math.random() * 100) - 50
        instructions.push("addi $t1, $zero, " + current1)
        instructions.push("addi $t0, $zero, " + current2)
        instructions.push("sw $t0, 0($t1)")
        flushPipeline(instructions)
        instructions.push("lw $t2, 0($t1)")
        stalls++
        instructions.push("addi $t2, $t2, 4")

        flushPipeline(instructions)
        instructions.push("sw $t2, 0($k0)")
        flushPipeline(instructions)
        instructions.push("addi $k0, $k0, 1")
        flushPipeline(instructions)
        tests.push("Too long, see source code for details.")
        t2 = current2 + 4
        exp_res.push(t2)
    }
    return {
        tests: tests,
        inst: instructions.join("\n"),
        exp: exp_res,
        count: instructions.length + stalls
    }
}

function getMemBackToBack(nums) {
    let instructions = []
    let exp_res = []

    let t1 = 0
    let t2 = 0
    let tests = []
    let stalls = 0
    for (let i = 0; i < nums; i++) {
        let current1 = parseInt(Math.random() * 100) + 1050
        let current2 = parseInt(Math.random() * 100) - 50
        instructions.push("addi $t1, $zero, " + current1)
        instructions.push("addi $t0, $zero, " + current2)
        instructions.push("sw $t0, 0($t1)")
        instructions.push("lw $t2, 0($t1)")
        stalls++
        instructions.push("addi $t2, $t2, 4")

        flushPipeline(instructions)
        instructions.push("sw $t2, 0($k0)")
        flushPipeline(instructions)
        instructions.push("addi $k0, $k0, 1")
        flushPipeline(instructions)
        tests.push("Too long, see source code for details.")
        t2 = current2 + 4
        exp_res.push(t2)
    }
    return {
        tests: tests,
        inst: instructions.join("\n"),
        exp: exp_res,
        count: instructions.length + stalls
    }
}

const functionMap = {
    "ExMemForwardA": getExMemForwardA,
    "ExMemForwardBoth": getExMemForwardBoth,
    "MemWbForwardA": getMemWbForwardA,
    "MemWbForwardBoth": getMemWbForwardBoth,
    "BackToBack": getBackToBack,
    "ZeroReg": getZeroReg,
    "LoadWord": getLoadWord,
    "MemBackToBack": getMemBackToBack
}

module.exports = {
    compose,
    compile,
    functionMap
}