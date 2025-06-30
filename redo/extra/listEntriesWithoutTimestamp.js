const fs = require('fs');
const readline = require('readline');

//const jsonLocation = "F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts2/";
const jsonLocation = "D:/testtt1/";
const downloadListLocation = "F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/already-downloaded-with-timestamp.txt";
// const downloadList = fs.readFileSync(downloadListLocation, 'utf8');

let timestampIds = [];
let allIds = [];

function readTimes() {
const downloadList = readline.createInterface({
    input: fs.createReadStream(downloadListLocation),
    output: process.stdout,
    terminal: false
});

downloadList.on('line', (line) => {
    //console.log(line);

    if (line.includes("youtube")) {
       timestampIds.push(line.split(" ")[1].trim());
       // console.log(line.split(" ")[1]);
    }
});

downloadList.on('close', () => {
     console.log("Processed! " + downloadListLocation);
     readditt();
  });
}

function readditt() {
let files = fs.readdirSync(jsonLocation); //, (err, files) => {
   // if (err) throw err;
   
   console.log("mrppo");

   try {
      files.forEach(jsonFile => {
         // console.log(jsonLocation + jsonFile);
         // console.log("fof");
         let tmpFile = JSON.parse(fs.readFileSync(jsonLocation + jsonFile, 'utf8'));
         // console.log("faf");
         let tmpList = tmpFile
             .filter(entry => entry.extractor_key === "Youtube")
             .map(entry => entry.id);

         allIds.push(...tmpList);
         console.log('Processed... ' + jsonFile);
      });
   } catch(e) {
      console.log("ERROR! FILE COULDN'T BE READ!");
   }

   // console.log('All metadata loaded!');
   // console.log("Total number of entries: " + parsedVideos.length);
// });
console.log("Processed! " + jsonLocation);
createList();
      }

function createList() {
  console.log("Compiling list... - " + allIds.length + " - " + timestampIds.length);
//let returnArray = allIds.filter(entry => !timestampIds.includes(entry)).map(entry => "https://www.youtube.com/watch?v=" + entry);

let returnArray = [];

for (let i = 0; i < allIds.length; i++) {


   let hasTimestamp = !timestampIds.includes(allIds[i]);

   if (hasTimestamp) {
      // console.log(allIds.length + " / " + (i + 1));
      // console.log(allIds[i]);
      returnArray.push(allIds[i]);
      //console.log(hasTimestamp);
   }

   if (i % 1000 === 0) { console.log(i + " / " + allIds.length); console.log(returnArray.length); }
}

fs.writeFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/vids-with-no-timestamp.txt', "https://www.youtube.com/watch?v=" + returnArray.join("\nhttps://www.youtube.com/watch?v="));

console.log("List created!");
}

readTimes();
// readditt();
// createList();