import ucsbcs154lab3_cpu
import pyrtl
import sys
import json
import requests

ucsbcs154lab3_cpu.d_mem

myTestCases = {
    "addi": 10,
    "add": 10,
    "and": 10,
    "lui": 10,
    "ori": 10,
    "slt": 10,
}

def getTestCases():
    url = 'https://cs154-lab3.proxied.tianleyu.com/testcase'
    r = requests.post(url, json=myTestCases)
    return r.json()

if __name__ == '__main__':
    tests = getTestCases()
    if(tests['code']!=200):
        print("Server failed to make tests:\n", tests['message'])
        sys.exit(1)

    binary = tests['binary'].split('\n')
    expected = tests['composed']['expected']
    tests = tests['composed']['tests']
    # print(expected)
    
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
        if(val != dmem_info[i]):
            print("Test failed: expected", val, "got", dmem_info[i])
            print("   Command was:", tests[i])
            print("")
            failed = True
            
    if(not failed):
        print("All tests passed!")
    