const $ = require("jquery");

let REGISTERS_SIZE;
let commandList = $("#instructions").html();
let registers;
let program;
let indexes;
let functions;
let labels;
let index;
let showFinalRegisters = true;
let executionSpeed;
// let showRegisters;
let firstRun = true;
let machine;
let tempText;
$(window).ready(function() {
  $("#showExample").on("change", () => {
    $("#exampleInput").toggle();
  });
  $("#showCommandList").on("click", () => {
    $("#codeInput").toggle();
    $("#instructions").toggle();
  });
});
console.log(commandList);
$(window).ready(function() {
  // $('#codeInput').keypress(function (e) {
  //   e.stopPropagation();
  // });
  $("#showRegisters").on("change", function() {
    $(".regDiv").toggle();
  });
  $("#interpreterInput").on("submit", e => {
    e.preventDefault();
    machine = new Machine();
    machine.loadCommands();
    $("#interpreterOutput").html("");
    let prog = machine.compile();
    runProgram(prog);
    machine.printregisters();
  });
});

class Machine {
  constructor() {
    REGISTERS_SIZE = 32;
    program = new Map();
    indexes = new Map();
    functions = new Map();
    labels = [];
    index = 0;

    // $('#interpreterOutput').append(`Starting the machine.`);
    registers = [];
    for (let i = 0; i < REGISTERS_SIZE + 1; i++) {
      registers.push(i);
      // registers.push(0);
      // $('#interpreterOutput').append(`${registers[i]}<br>`);
    }
  }

  loadCommands() {
    commandList = new Map();
    // $('#interpreterOutput').append("Initializing commands list...");
    commandList.set("add", new Add());
    commandList.set("addi", new Addi());
    commandList.set("bez", new Bez());
    commandList.set("bei", new Bei());
    commandList.set("bnez", new Bnez());
    commandList.set("bnei", new Bnei());
    commandList.set("bltz", new Bltz());
    commandList.set("blti", new Blti());
    commandList.set("blez", new Blez());
    commandList.set("blei", new Blei());
    commandList.set("bgtz", new Bgtz());
    commandList.set("bgti", new Bgti());
    commandList.set("bgez", new Bgez());
    commandList.set("bgei", new Bgei());
    commandList.set("cube", new Cube());
    commandList.set("div", new Div());
    commandList.set("divi", new Divi());
    commandList.set("mul", new Mul());
    commandList.set("muli", new Muli());
    commandList.set("out", new Out());
    commandList.set("pow", new Pow());
    commandList.set("powi", new Powi());
    commandList.set("squ", new Squ());
    commandList.set("sto", new Sto());
    commandList.set("sub", new Sub());
    commandList.set("subi", new Subi());

    // $('#interpreterOutput').append(commandList.size);
  }

  compile() {
    // let program = new Map();
    // let indexes = new Map();
    // let functions = new Map();
    // let labels = [];
    // let index = 0;

    // $('#interpreterOutput').append("Compiling program...");
    let input = $("#codeInput").val();
    let result = input.split(/\r?\n/);
    console.log("result:", result);
    // $('#interpreterOutput').append(result[3]);

    result.forEach(line => {
      // console.log(line);
      // $('#interpreterOutput').append(`${words[2]}<br>`);

      if (line.startsWith("#") || line === "") {
        /* Skip the line */
      } else {
        let instruction = line.split(/\s+/); // Split the line at spaces and put the
        // instructions in an array
        let label = instruction[0];

        if (program.get(label) != null) {
          // console.log(label + ' already exists');
        } else {
          // $('#interpreterOutput').append("..." + label + " ");
          for (let i = 1; i < instruction.length; i++) {
            // $('#interpreterOutput').append(instruction[i] + " ");
          }
          // $('#interpreterOutput').append("<br>");

          labels.push(label);
          indexes.set(label, index++);
          program.set(label, instruction);

          // Label starting with '~' indicate end of a function block
          if (label.startsWith("~")) {
            let tempLabel = label.replace("~", ""); // Remove '~' to differenciate name of the block at
            // compile time and the name to call the function
            let funcArr = storeFunction(instruction[0]);
            functions.set(tempLabel, funcArr);
            let tempInstruction = [];
            tempInstruction[0] = tempLabel;
            tempInstruction[1] = "funct";
            // console.log(tempInstruction);
            program.set(tempLabel, tempInstruction);
          }
        }
      }
    });
    // $('#interpreterOutput').append("...");
    // $('#interpreterOutput').append("Program ready to execute!");

    function storeFunction(L2) {
      let fstart = L2.replace("~", "") + "~";
      let temp = labels.slice(indexes.get(fstart) + 1, indexes.get(L2));
      let f = [];
      temp.forEach(label => {
        f.push(label);
      });
      return f;
    }
    return labels;
  }

  printregisters() {
    let output = "";
    // if (showFinalRegisters) {
    //   {
    $("#interpreterOutput").append("<br>" + "Final Registers");
    for (let i = 0; i < REGISTERS_SIZE + 1; i++) {
      if (i < 10) {
        output = `r[0${i}] = ${registers[i]}`;
        $("#interpreterOutput").append("<br>" + output);
      } else {
        output = `r[${i}] = ${registers[i]}`;
        $("#interpreterOutput").append("<br>" + output);
      }
    }
  }
  // }
  // }
}

function runProgram(prog) {
  for (let [ index, label ] of prog.entries()) {
    let L, opCode, L2;
    let r, s1, s2;
    let n;

    // Sleep executionSpeed second in between executions
    // try {
    //   Thread.sleep(Machine.executionSpeed);
    // } catch (InterruptedException) {
    //   Thread.currentThread().interrupt();
    // }

    if (label === ".END") {
      // End of program
      break;
    }
    console.log(label);
    let instructions = program.get(label);
    L = instructions[0];

    if (!L.includes("~")) {
      $("#interpreterOutput").append(`${L}<br>`);
    }

    switch (instructions.length) {
      // Label~
      case 1:
        break;

      // Label opCode <-- functions
      case 2:
        firstRun = false;
        let funcArr = [];
        funcArr = functions.get(L);
        // console.log(funcArr);
        // runFunction(functions.get(L)[0]);
        funcArr.forEach((el, i) => {
          labels.splice(index + 1 + i, 0, el);
        });
        // console.log("ALLLL");
        // console.log(labels);
        break;

      // Label opCode r
      case 3:
        opCode = instructions[1];
        r = parseInt(instructions[2]);
        n = commandList.get(opCode);
        n.executes(r);
        break;

      // Label opCode r x  OR  Label opCode s1 L2
      case 4:
        // Label opCode s1 L2
        opCode = instructions[1];
        r = parseInt(instructions[2]);
        if (opCode.startsWith("b")) {
          L2 = instructions[3];
          n = commandList.get(instructions[1]);
          if (n.executes(r, L2)) {
            labels.splice(index + 1, 0, L2);
            // i.previous();
          }
        } else {
          // Label opCode r x
          s1 = parseInt(instructions[3]);
          n = commandList.get(instructions[1]);
          n.executes(r, s1);
        }

        break;

      // Label opCode r s1 s2
      case 5:
        opCode = instructions[1];
        r = parseInt(instructions[2]);
        s1 = parseInt(instructions[3]);

        if (opCode.startsWith("b")) {
          L2 = instructions[4];
          let n = commandList.get(opCode);
          if (n.executes(r, s1, L2)) {
            labels.splice(index + 1, 0, L2);
            // i.previous();
          }
        } else {
          s2 = parseInt(instructions[4]);
          let n = commandList.get(opCode);
          n.executes(r, s1, s2);
        }

        break;

      default:
        break;
    }

    let regdiv = document.createElement("div");
    $(regdiv).addClass("regDiv");
    let output = "";

    for (let reg = 0; reg < 32; reg++) {
      let spaces = "";
      let value = registers[reg];

      if (reg < 10) {
        output = `0${reg}:${value}     `;
      } else {
        output = `${reg}:${value}     `;
      }
      $(regdiv).append(output);
    }
    $(regdiv).append("<br>~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~<br>");
    $("#interpreterOutput").append(regdiv);

    // }
  }
  return 0;
}

function getExecSpeed() {
  return executionSpeed;
}

class Instruction {
  setRegister(r, x) {
    registers[r] = x;
  }
}

class Add extends Instruction {
  executes(r, s1, s2) {
    let x = registers[s1];
    let y = registers[s2];
    let result = x + y;
    Instruction.prototype.setRegister(r, result);
    let output = `r[${r}] = r[${s1}] + r[${s2}] = ${result}<br><br>`;
    $("#interpreterOutput").append(output);
  }
}

class Addi extends Instruction {
  executes(r, s1, x) {
    let y = registers[s1];
    let result = x + y;
    Instruction.prototype.setRegister(r, result);
    let output = `r[${r}] = r[${s1}] + ${x} = ${result}<br><br>`;
    $("#interpreterOutput").append(output);
  }
}

class Div extends Instruction {
  executes(r, s1, s2) {
    let x = registers[s1];
    let y = registers[s2];
    let result = x / y;
    Instruction.prototype.setRegister(r, result);
    let output = `r[${r}] = r[${s1}] / r[${s2}] = ${result}<br><br>`;
    $("#interpreterOutput").append(output);
  }
}

class Divi extends Instruction {
  executes(r, s1, x) {
    let y = registers[s1];
    let result = y / x;
    Instruction.prototype.setRegister(r, result);
    let output = `r[${r}] = r[${s1}] / ${x} = ${result}<br><br>`;
    $("#interpreterOutput").append(output);
  }
}

class Bez extends Instruction {
  executes(x, L2) {
    if (registers[x] == 0) {
      let output = `r[${x}] == 0, branching to ${L2}<br><br>`;
      $("#interpreterOutput").append(output);
    } else {
      let output = `r[${x}] != 0, not branching\n`;
      $("#interpreterOutput").append(output);
    }
    return registers[x] == 0;
  }
}

class Bei extends Instruction {
  executes(x, y, L2) {
    if (registers[x] == y) {
      let output = `r[${x}] == ${y}, branching to ${L2}<br><br>`;
      $("#interpreterOutput").append(output);
    } else {
      let output = `r[${x}] != ${y}, not branching<br><br>`;
      $("#interpreterOutput").append(output);
    }
    return registers[x] == y;
  }
}

class Bnez extends Instruction {
  executes(x, L2) {
    if (registers[x] != 0) {
      let output = `r[${x}] != 0, branching to ${L2}<br><br>`;
      $("#interpreterOutput").append(output);
    } else {
      let output = `r[${x}] == 0, not branching<br><br>`;
      $("#interpreterOutput").append(output);
    }
    return registers[x] != 0;
  }
}

class Bnei extends Instruction {
  executes(x, y, L2) {
    if (registers[x] != y) {
      let output = `r[${x}] != r${x}, branching to ${L2}<br><br>`;
      $("#interpreterOutput").append(output);
    } else {
      let output = `r[${x}] == r${y}, not branching<br><br>`;
      $("#interpreterOutput").append(output);
    }
    return registers[x] != y;
  }
}

class Bltz extends Instruction {
  executes(x, L2) {
    if (registers[x] < 0) {
      let output = `r[${x}] < 0, branching to ${L2}<br><br>`;
      $("#interpreterOutput").append(output);
    } else {
      let output = `r[${x}] >= 0, not branching<br><br>`;
      $("#interpreterOutput").append(output);
    }
    return registers[x] < 0;
  }
}

class Blti extends Instruction {
  executes(x, y, L2) {
    if (registers[x] < y) {
      let output = `r[${x}] < ${y}, branching to ${L2}<br><br>`;
      $("#interpreterOutput").append(output);
    } else {
      let output = `r[${x}] >= ${y}, not branching<br><br>`;
      $("#interpreterOutput").append(output);
    }
    return registers[x] < y;
  }
}

class Blez extends Instruction {
  executes(x, L2) {
    if (registers[x] <= 0) {
      let output = `r[$x{}] <= 0, branching to ${L2}<br><br>`;
      $("#interpreterOutput").append(output);
    } else {
      let output = `r[${x}] > 0, not branching<br><br>`;
      $("#interpreterOutput").append(output);
    }
    return registers[x] < 0;
  }
}

class Blei extends Instruction {
  executes(x, y, L2) {
    if (registers[x] <= y) {
      let output = `r[${x}] <= ${y}, branching to ${L2}<br><br>`;
      $("#interpreterOutput").append(output);
    } else {
      let output = `r[${x}] > ${y}, not branching<br><br>`;
      $("#interpreterOutput").append(output);
    }
    return registers[x] <= y;
  }
}

class Bgtz extends Instruction {
  executes(x, L2) {
    if (registers[x] > 0) {
      let output = `r[${x}] > 0, branching to ${L2}<br><br>`;
      $("#interpreterOutput").append(output);
    } else {
      let output = `r[${x}] <= 0, not branching<br><br>`;
      $("#interpreterOutput").append(output);
    }
    return registers[x] > 0;
  }
}

class Bgti extends Instruction {
  executes(x, y, L2) {
    if (registers[x] > y) {
      let output = `r[${x}] > ${y}, branching to ${L2}<br><br>`;
      $("#interpreterOutput").append(output);
    } else {
      let output = `r[${x}] < ${y}, not branching<br><br>`;
      $("#interpreterOutput").append(output);
    }
    return registers[x] > y;
  }
}

class Bgez extends Instruction {
  executes(x, L2) {
    if (registers[x] >= 0) {
      let output = `r[${x}] >= 0, branching to ${L2}<br><br>`;
      $("#interpreterOutput").append(output);
    } else {
      let output = `r[${x}] < 0, not branching<br><br>`;
      $("#interpreterOutput").append(output);
    }
    return registers[x] >= 0;
  }
}

class Bgei extends Instruction {
  executes(x, y, L2) {
    if (registers[x] >= y) {
      let output = `r[${x}] >= ${y}, branching to ${L2}<br><br>`;
      $("#interpreterOutput").append(output);
    } else {
      let output = `r[${x}] < ${y}, not branching<br><br>`;
      $("#interpreterOutput").append(output);
    }
    return registers[x] >= y;
  }
}

class Cube extends Instruction {
  executes(r, s1) {
    let x = registers[s1];
    let result = x * x * x;
    Instruction.prototype.setRegister(r, result);
    let output = `r[${r}] = r[${s1}] ^ 3 = ${result}<br><br>`;
    $("#interpreterOutput").append(output);
  }
}

class Mul extends Instruction {
  executes(r, s1, s2) {
    let x = registers[s1];
    let y = registers[s2];
    let result = x * y;
    Instruction.prototype.setRegister(r, result);
    let output = `r[${r}] = r[${s1}] * r[${s2}] = ${result}<br><br>`;
    $("#interpreterOutput").append(output);
  }
}

class Muli extends Instruction {
  executes(r, s1, x) {
    let y = registers[s1];
    let result = x * y;
    Instruction.prototype.setRegister(r, result);
    let output = `r[${r}] = r[${s1}] * ${x} = ${result}<br><br>`;
    $("#interpreterOutput").append(output);
  }
}

class Out extends Instruction {
  executes(s1) {
    let result = registers[s1];
    let output = `The value stored in register ${s1} is ${result}<br><br>`;
    $("#interpreterOutput").append(output);
  }
}

class Pow extends Instruction {
  executes(r, s1, s2) {
    let x = registers[s1];
    let y = registers[s2];
    let result = Math.pow(x, y);
    Instruction.prototype.setRegister(r, result);
    let output = `r[${r}] = r[${s1}] ^ r[${s2}]  = ${result}<br><br>`;
    $("#interpreterOutput").append(output);
  }
}

class Powi extends Instruction {
  executes(r, s1, y) {
    let x = registers[s1];
    let result = Math.pow(x, y);
    Instruction.prototype.setRegister(r, result);
    let output = `r[${r}] = r[${s1}] ^ ${y} = ${result}<br><br>`;
    $("#interpreterOutput").append(output);
  }
}

class Sto extends Instruction {
  executes(r, x) {
    let output = `Storing ${x} in r[${r}]<br><br>`;
    $("#interpreterOutput").append(output);
    Instruction.prototype.setRegister(r, x);
  }
}

class Sub extends Instruction {
  executes(r, s1, s2) {
    let x = registers[s1];
    let y = registers[s2];
    let result = x - y;
    Instruction.prototype.setRegister(r, result);
    let output = `r[${r}] = r[${s1}] - r[${s2}] = ${result}<br><br>`;
    $("#interpreterOutput").append(output);
  }
}

class Subi extends Instruction {
  executes(r, s1, x) {
    let y = registers[s1];
    let result = y - x;
    Instruction.prototype.setRegister(r, result);
    let output = `r[${r}] = r[${s1}] - ${x} = ${result}<br><br>`;
    $("#interpreterOutput").append(output);
  }
}

class Squ extends Instruction {
  executes(r, s1) {
    let x = registers[s1];
    let result = x * x;
    Instruction.prototype.setRegister(r, result);
    let output = `r[${r}] = r[${s1}] ^ 2 = ${result}<br><br>`;
    $("#interpreterOutput").append(output);
  }
}

// String.prototype.format = function() {
//   a = this;
//   for (k in arguments) {
//     a = a.replace("{" + k + "}", arguments[k]);
//   }
//   return a;
// };

const BORDER_SIZE = 10;
const rightPanel = document.getElementById("outputDiv");
const leftPanel = document.getElementById("interpreterInput");

let m_pos;
let m_posY;
let m_posY2;

function resize(e) {
  const dx = m_pos - e.x;
  m_pos = e.x;
  if (m_pos < 1300 && m_pos > 500) {
    rightPanel.style.width =
      parseInt(getComputedStyle(rightPanel, "").width) + dx + "px";
    leftPanel.style.width =
      parseInt(getComputedStyle(leftPanel, "").width) - dx + "px";
  }
}

rightPanel.addEventListener(
  "mousedown",
  function(e) {
    if (e.offsetX < BORDER_SIZE) {
      m_pos = e.x;
      document.addEventListener("mousemove", resize, false);
    }
  },
  false
);

document.addEventListener(
  "mouseup",
  function() {
    document.removeEventListener("mousemove", resize, false);
  },
  false
);

const comm_ex = document.getElementById("command-example");
const ex_code = document.getElementById("example-code");
const commandsPannel = document.getElementById("instructions");
const examplePannel = document.getElementById("exampleInput");
const inputPannel = document.getElementById("codeInput");
const panelsContainer = document.getElementById("panels-container");
const interpreterInput = document.getElementById("interpreterInput");
const totalHeight =
  parseInt(getComputedStyle(commandsPannel, "").height) +
  parseInt(getComputedStyle(examplePannel, "").height) +
  parseInt(getComputedStyle(inputPannel, "").height);

const borderSize = 3 * getHeight(comm_ex);
const panelsContainerHeight = getHeight(panelsContainer) - borderSize;
console.log("panelsContainerHeight:", panelsContainerHeight);

function resizevert(e) {
  const dy = m_posY - e.y;
  m_posY = e.y;
  let tempTotalHeight =
    getHeight(commandsPannel) +
    getHeight(examplePannel) +
    getHeight(inputPannel);
  // console.log(totalHeight);
  // console.log((getHeight(interpreterInput)) +
  // "uity");

  if (getHeight(examplePannel) > 1) {
    commandsPannel.style.height = getHeight(commandsPannel) - dy + "px";
    examplePannel.style.height =
      totalHeight - (getHeight(inputPannel) + getHeight(commandsPannel)) + "px";
    inputPannel.style.height =
      totalHeight -
      (getHeight(commandsPannel) + getHeight(examplePannel)) +
      "px";
  } else if (getHeight(examplePannel) <= 1 && getHeight(inputPannel) <= 1) {
    examplePannel.style.height = getHeight(examplePannel) + dy + "px";
    commandsPannel.style.height =
      totalHeight - (getHeight(inputPannel) + getHeight(examplePannel)) + "px";
    inputPannel.style.height =
      totalHeight -
      (getHeight(commandsPannel) + getHeight(examplePannel)) +
      "px";
  } else {
    examplePannel.style.height = getHeight(examplePannel) - dy + "px";
    commandsPannel.style.height =
      totalHeight - (getHeight(inputPannel) + getHeight(examplePannel)) + "px";
    inputPannel.style.height =
      totalHeight -
      (getHeight(commandsPannel) + getHeight(examplePannel)) +
      "px";
  }
  // }
}

function resizeInputPannel(event) {
  const dy = m_posY - event.y;
  m_posY = event.y;

  const examplePannelHeight = getHeight(examplePannel);
  const inputPannelHeight = getHeight(inputPannel);

  commandsPannel.style.height =
    panelsContainerHeight - inputPannelHeight - examplePannelHeight + "px";
  examplePannel.style.height = examplePannelHeight - dy + "px";
  inputPannel.style.height = inputPannelHeight + dy + "px";
}

function resizeCommandPannel(event) {
  const dy = m_posY - event.y;
  m_posY = event.y;

  const commandsPannelHeight = getHeight(commandsPannel);
  const examplePannelHeight = getHeight(examplePannel);

  inputPannel.style.height =
    panelsContainerHeight - commandsPannelHeight - examplePannelHeight + "px";
  examplePannel.style.height = examplePannelHeight + dy + "px";
  commandsPannel.style.height = commandsPannelHeight - dy + "px";
}

function getHeight(pannel) {
  return parseInt(getComputedStyle(pannel, "").height);
}

function setPanelsSize() {
  commandsPannel.style.height = "0px";
  examplePannel.style.height = "0px";
  inputPannel.style.height = panelsContainerHeight + "px";
}

setPanelsSize();

comm_ex.addEventListener("mousedown", e => {
  m_posY = e.y;
  document.addEventListener("mousemove", resizeCommandPannel);
});

ex_code.addEventListener("mousedown", e => {
  m_posY2 = e.y;
  document.addEventListener("mousemove", resizeInputPannel);
});

document.addEventListener("mouseup", () => {
  document.removeEventListener("mousemove", resizeCommandPannel);
});

document.addEventListener("mouseup", () => {
  document.removeEventListener("mousemove", resizeInputPannel);
});
