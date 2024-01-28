const fs = require("fs")
const child_process = require("child_process")

function compose(test_suites) {
    let outputSource = "main:\n"
    let expectedDRamVal = []

    let tests = []

    for (let i = 0; i < test_suites.length; i++) {
        let test = test_suites[i]
        outputSource += test.inst + "\n"
        expectedDRamVal = expectedDRamVal.concat(test.exp)
        tests = tests.concat(test.tests)
    }
    return {
        source: outputSource,
        expected: expectedDRamVal,
        tests: tests
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

function gtADDI(nums) {
    let instructions = []
    let exp_res = []

    let t1 = 0
    let tests = []
    instructions.push("addi $t1, $zero, 0")
    for (let i = 0; i < nums; i++) {
        let current = parseInt(Math.random() * 100)
        instructions.push("addi $t1, $t1, " + current)
        instructions.push("sw $t1, 0($k0)")
        instructions.push("addi $k0, $k0, 1")
        tests.push(`addi ${t1}, ${current}`)
        t1 += current
        exp_res.push(t1)
    }
    return {
        tests: tests,
        inst: instructions.join("\n"),
        exp: exp_res
    }
}

function gtADD(nums) {
    let instructions = []
    let exp_res = []

    let tests = []

    let t1 = 12
    for (let i = 0; i < nums; i++) {
        let inp1 = parseInt(Math.random() * 100)
        let inp2 = parseInt(Math.random() * 100)
        instructions.push("addi $t1, $zero, " + inp1)
        instructions.push("addi $t2, $zero, " + inp2)
        instructions.push("add $t1, $t2, $t1")
        instructions.push("sw $t1, 0($k0)")
        instructions.push("addi $k0, $k0, 1")
        tests.push(`add ${inp1}, ${inp2}`)
        t1 = inp1 + inp2
        exp_res.push(t1)
    }
    return {
        tests: tests,
        inst: instructions.join("\n"),
        exp: exp_res
    }
}

function gtAND(num) {
    let instructions = []
    let exp_res = []

    let tests = []

    let t1 = 0
    for (let i = 0; i < num; i++) {
        let inp1 = parseInt(Math.random() * 100)
        let inp2 = parseInt(Math.random() * 100)
        instructions.push("addi $t1, $zero, " + inp1)
        instructions.push("addi $t2, $zero, " + inp2)
        instructions.push("and $t1, $t1, $t2")
        instructions.push("sw $t1, 0($k0)")
        instructions.push("addi $k0, $k0, 1")
        tests.push(`and ${inp1}, ${inp2}`)
        t1 = inp1 & inp2
        exp_res.push(t1)
    }
    return {
        tests: tests,
        inst: instructions.join("\n"),
        exp: exp_res
    }

}

function gtLUI(num) {
    let instructions = []
    let exp_res = []

    let tests = []

    let t1 = 0
    for (let i = 0; i < num; i++) {
        let inp1 = parseInt(Math.random() * 2 ^ 16)
        let inp2 = parseInt(Math.random() * 100)
        instructions.push("lui $t1, " + inp2)
        instructions.push("addi $t1, $t1, " + inp1)
        instructions.push("sw $t1, 0($k0)")
        instructions.push("addi $k0, $k0, 1")
        tests.push(`lui ${inp2}; addi ${inp1}`)
        t1 = (inp2 << 16) + inp1
        exp_res.push(t1)
    }
    return {
        tests: tests,
        inst: instructions.join("\n"),
        exp: exp_res
    }
}

function gtORI(num) {
    let instructions = []
    let exp_res = []

    let tests = []

    let t1 = 0
    for (let i = 0; i < num; i++) {
        let inp1 = parseInt(Math.random() * 100)
        let inp2 = parseInt(Math.random() * 100)
        instructions.push("addi $t1, $zero, " + inp1)
        instructions.push("ori $t2, $t1, " + inp2)
        instructions.push("sw $t2, 0($k0)")
        instructions.push("addi $k0, $k0, 1")
        tests.push(`ori ${inp1}, ${inp2}`)
        t1 = inp1 | inp2
        exp_res.push(t1)
    }
    return {
        tests: tests,
        inst: instructions.join("\n"),
        exp: exp_res
    }
}

function gtSLT(num) {
    let instructions = []
    let exp_res = []

    let tests = []

    let t1 = 0
    for (let i = 0; i < num; i++) {
        let inp1 = parseInt(Math.random() * 100)
        let inp2 = parseInt(Math.random() * 100)
        instructions.push("addi $t1, $zero, " + inp1)
        instructions.push("addi $t2, $zero, " + inp2)
        instructions.push("slt $t3, $t1, $t2")
        instructions.push("sw $t3, 0($k0)")
        instructions.push("addi $k0, $k0, 1")
        tests.push(`slt ${inp1}, ${inp2}`)
        t1 = inp1 < inp2 ? 1 : 0
        exp_res.push(t1)
    }
    return {
        tests: tests,
        inst: instructions.join("\n"),
        exp: exp_res
    }
}

function gtLW(num) {
    let instructions = []
    let exp_res = []

    let tests = []

    let t1 = 0
    for (let i = 0; i < num; i++) {
        let inp1 = parseInt(Math.random() * 100 + 100)
        let inp2 = parseInt(Math.random() * 100)
        instructions.push("addi $t1, $zero, " + inp1)
        instructions.push("addi $t2, $zero, " + inp2)
        instructions.push("sw $t2, 0($t1)")
        instructions.push("lw $t3, 0($t1)")
        instructions.push("sw $t3, 0($k0)")
        instructions.push("addi $k0, $k0, 1")
        tests.push(`lw ${inp1}, ${inp2}`)
        t1 = inp2
        exp_res.push(t1)
    }
    return {
        tests: tests,
        inst: instructions.join("\n"),
        exp: exp_res
    }

}

function gtBEQ(num) {
    let instructions = []
    let exp_res = []

    let tests = []

    let t1 = 0
    for (let i = 0; i < num; i++) {
        let inp1 = parseInt(Math.random() * 100)
        let inp2 = parseInt(Math.random() * 100)
        instructions.push("addi $t1, $zero, " + inp1)
        instructions.push("addi $t2, $zero, " + inp2)
        instructions.push("slt $t3, $t1, $t2")
        instructions.push("beq $t3, $zero, BEQ_TEST_END_" + i)
        instructions.push("BEQ_TEST" + i + ":")
        instructions.push("addi $t3, $zero, 0")
        instructions.push("sw $t3, 0($k0)")
        instructions.push("addi $k0, $k0, 1")
        instructions.push("BEQ_TEST_END_" + i + ":")
        instructions.push("addi $t3, $zero, 1")
        instructions.push("sw $t3, 0($k0)")
        instructions.push("addi $k0, $k0, 1")
        tests.push(`beq ${inp1}, ${inp2}`)
        t1 = inp2
        exp_res.push(t1)
    }
    return {
        tests: tests,
        inst: instructions.join("\n"),
        exp: exp_res
    }


}

const functionMap = {
    "addi": gtADDI,
    "add": gtADD,
    "and": gtAND,
    "lui": gtLUI,
    "ori": gtORI,
    "slt": gtSLT,
    "lw": gtLW
}

module.exports = {
    gtADDI,
    gtADD,
    gtAND,
    gtLUI,
    gtORI,
    gtSLT,
    compose,
    compile,
    functionMap
}