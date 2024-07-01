const fs = require('fs')
const readline = require('readline');
const utf8 = require('utf8');

let printString = '';
let gatheredIds = [];
const checkStr1 = 'ERROR: [niconico]';
const checkStr2 = ':';

/*
try {
  const data = fs.readFileSync('tania1.txt', 'utf8')
  handleData(data);
  //console.log(data)
} catch (err) {
  console.error(err)
}  */

let readInterface = readline.createInterface({
  input: fs.createReadStream('F:/Dropbox/NodeJS/big-chungus-utf8.txt'),
  output: process.stdout,
  terminal: false
});

readInterface.on('line', (line) => {
  console.log("Read line: " + line);
  if (line.includes(checkStr1)) handleLine(line);
});

function handleLine(readLine) {

  let tmpPos1 = readLine.indexOf(checkStr1);
  let tmpStr1 = readLine.substring(checkStr1.length + tmpPos1);
  let tmpPos2 = tmpStr1.indexOf(checkStr2);
  let tmpStr2 = tmpStr1.substring(0,tmpPos2).trim();

  fs.appendFileSync('F:/Dropbox/NodeJS/delNicovids.txt', tmpStr2 + '\n');
  console.log("Added " + tmpStr2 + "!");

  /*
  let tempp1 = "[youtube]";
   let tmp1 = readLine.indexOf(tempp1);
   if (tmp1 == 0) {
      let tmp2 = readLine.indexOf(": Downloading webpage");
      if (tmp2 != -1) {
          let tmp3 = readLine.substring(tempp1.length, tmp2).trim();
          if (!gatheredIds.includes(tmp3)) {
             gatheredIds.push(tmp3);
             fs.appendFileSync('memes6.txt', tmp3 + '\n');
             console.log("Added " + tmp3 + "!");
          }
          //printString += tmp3.trim() + '\n';
      }
   } */
}