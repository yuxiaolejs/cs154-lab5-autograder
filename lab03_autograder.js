const child_process = require('child_process');
const fs = require("fs")

const compileScript =
    `
mkdir -p dump
cd dump

spim -dump -delayed_branches -notrap -file ../$1

cut -c16-23 text.asm > hex.txt
sed -i '1,2d' hex.txt

cd ..
mv dump/hex.txt $2
rm -rf dump
# mv dump/hex.txt i_mem_init.txt
`

const testRunner =
`
import ucsbcs154lab3_cpu
import pyrtl
import sys
import json
ucsbcs154lab3_cpu.d_mem
if __name__ == '__main__':
    filename = sys.argv[1]
    sim_trace = pyrtl.SimulationTrace()
    i_mem_init = {}
    with open(filename, 'r') as fin:
        i = 0
        for line in fin.readlines():
            i_mem_init[i] = int(line, 16)
            i += 1

    sim = pyrtl.Simulation(tracer=sim_trace, memory_value_map={
        ucsbcs154lab3_cpu.i_mem: i_mem_init
    })
    for cycle in range(1000):
        sim.step({})
    dmem_info = sim.inspect_mem(ucsbcs154lab3_cpu.d_mem)
    print(json.dumps(dmem_info, indent=4))

`

function compile(fileName) {
    fs.writeFileSync("compile.sh", compileScript)
    child_process.execSync("chmod +x compile.sh")
    child_process.execSync(`./compile.sh ${fileName} ${fileName}.txt`)
    fs.unlinkSync("compile.sh")
}

function runTest(fileName) {
    return new Promise((res, rej) => {
        fs.writeFileSync("test_runner.py", testRunner)
        let child = child_process.spawn("python3", ["test_runner.py", fileName])
        let dataBuffer = ""
        let errBuffer = ""
        child.stdout.on('data', (data) => {
            dataBuffer += data.toString()
        })
        child.stderr.on('data', (data) => {
            errBuffer += data.toString()
        })
        child.on("exit", (d) => {
            try {
                dataBuffer = JSON.parse(dataBuffer)
                if (d === 0) res(dataBuffer)
                else rej(d)
            } catch (e) {
                rej(e)
            }
            fs.unlinkSync("test_runner.py")
        })
    })

}

function compose(test_suites) {
    let outputSource = "main:\n"
    let expectedDRamVal = []

    for (let i = 0; i < test_suites.length; i++) {
        let test = test_suites[i]
        outputSource += test.inst + "\n"
        expectedDRamVal = expectedDRamVal.concat(test.exp)
    }
    return {
        source: outputSource,
        expected: expectedDRamVal
    }
}

function runTestSuites(composed, debug = false) {
    let fileName = parseInt(Math.random() * 100000) + ".s"
    return new Promise((res, rej) => {
        fs.writeFileSync(fileName, composed.source)
        compile(fileName)
        runTest(fileName + ".txt").then((data) => {
            if (debug) {
                console.log(data)
                console.log(composed.expected)
            }
            for (let i = 0; i < composed.expected.length; i++) {
                if (composed.expected[i] !== data[i]) {
                    console.log("Test Failed @", i, "Expected", composed.expected[i], "Got", data[i])
                    rej()
                    return
                }
            }
            fs.unlinkSync(fileName)
            fs.unlinkSync(fileName + ".txt")
            res()
        })
    })
}

function gtADDI(nums) {
    let instructions = []
    let exp_res = []

    let t1 = 0
    for (let i = 0; i < nums; i++) {
        let current = parseInt(Math.random() * 100)
        instructions.push("addi $t1, $t1, " + current)
        instructions.push("sw $t1, 0($k0)")
        instructions.push("addi $k0, $k0, 1")
        t1 += current
        exp_res.push(t1)
    }
    return {
        inst: instructions.join("\n"),
        exp: exp_res
    }
}

function gtADD(nums) {
    let instructions = []
    let exp_res = []

    let t1 = 12
    for (let i = 0; i < nums; i++) {
        let inp1 = parseInt(Math.random() * 100)
        let inp2 = parseInt(Math.random() * 100)
        instructions.push("addi $t1, $zero, " + inp1)
        instructions.push("addi $t2, $zero, " + inp2)
        instructions.push("add $t1, $t2, $t1")
        instructions.push("sw $t1, 0($k0)")
        instructions.push("addi $k0, $k0, 1")
        t1 = inp1 + inp2
        exp_res.push(t1)
    }
    return {
        inst: instructions.join("\n"),
        exp: exp_res
    }
}

function gtAND(num) {
    let instructions = []
    let exp_res = []

    let t1 = 0
    for (let i = 0; i < num; i++) {
        let inp1 = parseInt(Math.random() * 100)
        let inp2 = parseInt(Math.random() * 100)
        instructions.push("addi $t1, $zero, " + inp1)
        instructions.push("addi $t2, $zero, " + inp2)
        instructions.push("and $t1, $t1, $t2")
        instructions.push("sw $t1, 0($k0)")
        instructions.push("addi $k0, $k0, 1")
        t1 = inp1 & inp2
        exp_res.push(t1)
    }
    return {
        inst: instructions.join("\n"),
        exp: exp_res
    }

}

function gtLUI(num) {
    let instructions = []
    let exp_res = []

    let t1 = 0
    for (let i = 0; i < num; i++) {
        let inp1 = parseInt(Math.random() * 2 ^ 16)
        let inp2 = parseInt(Math.random() * 100)
        instructions.push("lui $t1, " + inp2)
        instructions.push("addi $t1, $t1, " + inp1)
        instructions.push("sw $t1, 0($k0)")
        instructions.push("addi $k0, $k0, 1")
        t1 = (inp2 << 16) + inp1
        exp_res.push(t1)
    }
    return {
        inst: instructions.join("\n"),
        exp: exp_res
    }
}

function gtORI(num) {
    let instructions = []
    let exp_res = []

    let t1 = 0
    for (let i = 0; i < num; i++) {
        let inp1 = parseInt(Math.random() * 100)
        let inp2 = parseInt(Math.random() * 100)
        instructions.push("addi $t1, $zero, " + inp1)
        instructions.push("ori $t2, $t1, " + inp2)
        instructions.push("sw $t2, 0($k0)")
        instructions.push("addi $k0, $k0, 1")
        t1 = inp1 | inp2
        exp_res.push(t1)
    }
    return {
        inst: instructions.join("\n"),
        exp: exp_res
    }
}

function gtSLT(num) {
    let instructions = []
    let exp_res = []

    let t1 = 0
    for (let i = 0; i < num; i++) {
        let inp1 = parseInt(Math.random() * 100)
        let inp2 = parseInt(Math.random() * 100)
        instructions.push("addi $t1, $zero, " + inp1)
        instructions.push("addi $t2, $zero, " + inp2)
        instructions.push("slt $t3, $t1, $t2")
        instructions.push("sw $t3, 0($k0)")
        instructions.push("addi $k0, $k0, 1")
        t1 = inp1 < inp2 ? 1 : 0
        exp_res.push(t1)
    }
    return {
        inst: instructions.join("\n"),
        exp: exp_res
    }

}

composed = compose([
    gtADDI(10),
    gtADD(10),
    gtAND(10),
    gtLUI(10),
    gtORI(10),
    gtSLT(10),
])

runTestSuites(composed, false).then(() => {
    console.log("All tests passed")
})