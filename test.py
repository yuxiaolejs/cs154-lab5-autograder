import ucsbcs154lab3_cpu
import pyrtl
import sys
import json
# import requests
from urllib import request, parse


ucsbcs154lab3_cpu.d_mem

memTestCases = {
    "addi": 10,
    "add": 10,
    "and": 10,
    "lui": 10,
    "ori": 10,
    "slt": 10,
    "lw": 10,
    "beq": 10,
}

regTestCases = {
    "addi": 10
}

regs = {
    "zero": 0,
    "at": 1,
    "v0": 2,
    "v1": 3,
    "a0": 4,
    "a1": 5,
    "a2": 6,
    "a3": 7,
    "t0": 8,
    "t1": 9,
    "t2": 10,
    "t3": 11,
    "t4": 12,
    "t5": 13,
    "t6": 14,
    "t7": 15,
    "s0": 16,
    "s1": 17,
    "s2": 18,
    "s3": 19,
    "s4": 20,
    "s5": 21,
    "s6": 22,
    "s7": 23,
    "t8": 24,
    "t9": 25
}

def getTestCases(path, testcases):
    url = 'https://cs154-lab3.proxied.tianleyu.com'+path
    data = json.dumps(testcases).encode()
    req = request.Request(url, data=data, headers={'content-type': 'application/json'})
    response = request.urlopen(req)
    return json.loads(response.read())

def memTest():
    print("Memory test - Fetching tests from server...")
    tests = getTestCases("/testcase",memTestCases)
    if(tests['code']!=200):
        print("Server failed to make tests:\n", tests['message'])
        sys.exit(1)
    print("Memory test - Running tests...")
    
    # print(tests['composed']['source'])
    
    binary = tests['binary'].split('\n')
    expected = tests['composed']['expected']
    tests = tests['composed']['tests']
    
    
    sim_trace = pyrtl.SimulationTrace()
    i_mem_init = {}
    i = 0
    for line in binary:
        if(line != ''):
            i_mem_init[i] = int(line, 16)
            i += 1

    sim = pyrtl.Simulation(tracer=sim_trace, memory_value_map={
        ucsbcs154lab3_cpu.i_mem: i_mem_init
    })
    for cycle in range(1000):
        sim.step({})
    dmem_info = sim.inspect_mem(ucsbcs154lab3_cpu.d_mem)
    # print(dmem_info)
    
    failed = False
    
    for i, val in enumerate(expected):
        if(i not in dmem_info):
            print("Test failed: expected", val, "got nothing")
            print("   Command was:", tests[i])
            print("")
            failed = True
        let_val = dmem_info[i]
        if(let_val > 2**31):
            let_val = -(let_val^0xffffffff) - 1
        if(val != let_val):
            print("Test failed: expected", val, "got", let_val)
            print("   Command was:", tests[i])
            print("")
            failed = True
            
    if(not failed):
        print(f"Memory test - All tests ({len(tests)} tests) passed!")
        
def regTest():
    print("Regfile test - Fetching tests from server...")
    tests = getTestCases("/rf/testcase",regTestCases)
    if(tests['code']!=200):
        print("Server failed to make tests:\n", tests['message'])
        sys.exit(1)
    print("Regfile test - Running tests...")
    
    # print(tests['composed']['source'])
    
    binary = tests['binary'].split('\n')
    expected = tests['composed']['expected']
    tests = tests['composed']['tests']
    
    
    sim_trace = pyrtl.SimulationTrace()
    i_mem_init = {}
    i = 0
    for line in binary:
        if(line != ''):
            i_mem_init[i] = int(line, 16)
            i += 1

    sim = pyrtl.Simulation(tracer=sim_trace, memory_value_map={
        ucsbcs154lab3_cpu.i_mem: i_mem_init
    })
    for cycle in range(1000):
        sim.step({})
    dmem_info = sim.inspect_mem(ucsbcs154lab3_cpu.d_mem)
    # print(dmem_info)
    
    failed = False
    
    print("Expected:", expected)
    print("Got:", dmem_info)
    
    for i, val in enumerate(expected):
        if(i not in dmem_info):
            print("Test failed: expected", val, "got nothing")
            print("   Command was:", tests[i])
            print("")
            failed = True
        let_val = dmem_info[i]
        if(let_val > 2**31):
            let_val = -(let_val^0xffffffff) - 1
        if(val != let_val):
            print("Test failed: expected", val, "got", let_val)
            print("   Command was:", tests[i])
            print("")
            failed = True
            
    if(not failed):
        print(f"Regfile test - All tests ({len(tests)} tests) passed!")

if __name__ == '__main__':
    print("Autograder for CS154 Lab 3 - Version 0.0.4")
    # memTest()
    regTest()