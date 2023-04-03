const fs = require('fs')
const readline = require('readline');
const utf8 = require('utf8');

var printString = '';
var gatheredIds = [];

/*
try {
  const data = fs.readFileSync('tania1.txt', 'utf8')
  handleData(data);
  //console.log(data)
} catch (err) {
  console.error(err)
}  */

var readInterface = readline.createInterface({
  input: fs.createReadStream('big-chungus-utf8.txt'),
  output: process.stdout,
  terminal: false
});

readInterface.on('line', (line) => {
  handleLine(line);
});

function handleLine(readLine) {
  /*
  var deron = Buffer(readline1);
  var readline = daro.write(deron);*/

  //readLine = readLine1.replace(/\s/g,'');

  //console.log("Read line: " + daro.write(deron));
  console.log("Read line: " + readLine);
  var tempp1 = "[youtube]";
   var tmp1 = readLine.indexOf(tempp1);
   if (tmp1 == 0) {
      var tmp2 = readLine.indexOf(": Downloading webpage");
      if (tmp2 != -1) {
          var tmp3 = readLine.substring(tempp1.length, tmp2);
          if (!gatheredIds.includes(tmp3)) {
             gatheredIds.push(tmp3);
             fs.appendFileSync('memes6.txt', tmp3.trim() + '\n');
             console.log("Added " + tmp3.trim() + "!");
          }
          //printString += tmp3.trim() + '\n';
      }
   }
}