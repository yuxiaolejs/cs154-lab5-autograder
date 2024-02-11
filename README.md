# CS 154 Lab05 autograder v0.0.5
Yes, it is an autograder for CS154, lab5

Requirement:
- Python
- pyrtl
  
## Acknowledgement:
This script is based on the lab3 autograder by myself, and the test cases are provided by @r0ckwav3 on piazza.(Original repo:
[https://github.com/r0ckwav3/Public_CS154/blob/main/lab5/bighazard.s](https://github.com/r0ckwav3/Public_CS154/blob/main/lab5/bighazard.s))

**Thanks a lot Peter!**

## Notice:
- In order to test your code properly, this script assumes that your `addi` and `sw` are working properly. If you are not sure, please test them first.
- Please check version number of this script (will be displayed when running). If does not match this document, please update it!
- This server might not be available all the time. (It's not even a server, it's my desktop plus a FRP NAT proxy...)
<!-- - If you found any bugs, please feel free to use the issue tracker on github to report it or just post it on piazza under [this post](https://piazza.com/class/lr49arnlyiq1kg/post/45) as a follow up. -->
- If you want to help improve this script, please feel free to fork this repo and make a pull request, things happening on the server side is under the `server` directory.

## Ways to install:
1. Download `test.py` from this repo to the same directory as your lab3_cpu.py
<!-- 2. Copy from csil: `/cs/student/tianleyu/public/test.py`
   1. You can run `cp /cs/student/tianleyu/public/test.py .` in your lab3 directory to get it -->

## How to use:
- Copy `test.py` from this repo to the same directory as your lab5_forward.py
- Confirm or change the test cases in `test.py`, `myTestCases`. Format is `"test": numberOfTestCases`
- Run `python3 test.py`

## Update:
- 02/11/2024: Changed to lab5 forwarding logic test
- 01/27/2024: Use server to compile test cases. No `spim` or `nodejs` required.
- 01/30/2024: Add negative numbers to test cases
- 01/30/2024: Add register file tests

## Special thanks to:
- @r0ckwav3 - provided static test cases on piazza
- @r0ckwav3 - suggested to remove requests package to avoid missing dependency
- @r0ckwav3 - suggested to use register file to test

## Server deployment instruction:
**Note:** you don't need to read this part if you just want to use the script.

This following instructions are only test for ubuntu 22.04, but should work on any **linux** distro.
1. Install nodejs (with npm), I'm using v21, but any version should work.
2. Install `spim` - This is a tricky part, the usual spim installed by `apt` is not working, you need to download the source code and compile it yourself. Or, if you are using ubuntu/debian, you can just copy the `spim` binary from csil to your server.
3. Install Python3 (I think your server should come with it)
4. Install pyrtl (with pip) - run `pip3 install pyrtl`
5. Clone this repo
6. `cd server`
7. Install dependencies - run `npm install`
8. Run the server - run `node app.js` (please note that this will run the server in the foreground, it will stop when you close the terminal)
9. (Optional) Install pm2 - run `npm install pm2 -g` (pm2 is a process manager for nodejs, will allow you to run the server in the background)
10. (Optional) Run it as a service - run `pm2 start app.js --name lab05_autograder`
11. (Optional) Install `frp` - This is a NAT proxy, you can find it [here](https://github.com/fatedier/frp). This is only required if you want to expose your server to the internet and you don't have a public IP address.
12. (Optional) Configure `frp` - This is a little bit tricky, you need to configure it to forward port 13002 to your server's http port. Please refer to the `frp` documentation for more details
13. (Optional) Regularly update the server - run `git pull` in the `server` directory, then restart the server (if you are using pm2, run `pm2 restart lab05_autograder`)

It was long, but it's not that hard, right? Congratulations, you are contributing to the class now!
If you have any questions, please feel free to ask me on piazza.