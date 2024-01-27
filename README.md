# CS 154 Lab03 autograder
Yes, it is an autograder for CS154, lab3

Requirement:
- Python
- pyrtl

## Notice:
- In order to test your code properly, this script assumes that your `addi` and `sw` are working properly. If you are not sure, please test them first.

How to use:
- Copy `test.py` from this repo to the same directory as your lab3_cpu.py
- Confirm or change the test cases in `test.py`, `myTestCases`. Format is `"test": numberOfTestCases` Currently supports:
  - `addi`
  - `add`
  - `and`
  - `ori`
  - `lui`
  - `slt`
- Run `python3 test.py`

## Update:
- 01/27/2024: Use server to compile test cases. No `spim` or `nodejs` required.

## TODO:
- [ ] Add BEQ
- [ ] Add LW