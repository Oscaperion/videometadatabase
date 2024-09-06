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
  input: fs.createReadStream('memes6.txt'),
  // input: fs.createReadStream('big-chungus-utf8.txt'),
  output: process.stdout,
  terminal: false
});

readInterface.on('line', (line) => {
  handleLine(line);
});

function handleLine(readLine) {
  // https://web.archive.org/web/20130731234159/
  // https://web.archive.org/web/20060000000000/http://www.youtube.com/watch?v=
  // https://web.archive.org/web/20150000000000/https://www.youtube.com/watch?v=
  // https://web.archive.org/web/20240000000000/https://www.youtube.com/watch?v=
  
  // fs.appendFileSync('wayb.txt', 'https://web.archive.org/web/20060000000000/http://www.youtube.com/watch?v=' + readLine + '\n');
  fs.appendFileSync('wayb77.txt', 'https://web.archive.org/web/20150000000000/https://www.youtube.com/watch?v=' + readLine + '\n');
  // fs.appendFileSync('wayb.txt', 'https://web.archive.org/web/20240000000000/https://www.youtube.com/watch?v=' + readLine + '\n');
  console.log("Added " + readLine + "!");
}

/*
function handleLine(readLine) {
  console.log("Read line: " + readLine);
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
      }
   }
}   */