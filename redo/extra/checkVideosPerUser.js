let path = require('path');
let fs = require('fs');

const folderLocation = 'F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts2/vids';
//const folderLocationDest = 'F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts3/vids';
const yearMax = 202312;
const yearMin = 200601;
const youtubeUserList = JSON.parse(fs.readFileSync(('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/youtubeUserList2.json'), 'utf8'));
let endIt = false;

let userVideoAmount = {};

for (let i = yearMax; i >= yearMin; i--) {
   let jsonFile;

   try {
      jsonFile = JSON.parse(fs.readFileSync((folderLocation + i + '.json'), 'utf8'));
   } catch (error) {
      continue;
   }
   
   console.log(folderLocation + i + '.json');

   for (let j = 0; j < jsonFile.length; j++) {
       if (jsonFile[j].extractor_key === "Youtube" && jsonFile[j].uId === undefined) {
          console.log(jsonFile[j]);
          endIt = true;
          break;
       }
       
       if (jsonFile[j].extractor_key === "Youtube") {
          let userIDs = youtubeUserList[jsonFile[j].uId];
          let UCChannelID = userIDs.findIndex(ent => (ent.substring(0,2) === "UC" && ent.length === 24) && ent.substring(0,1) !== '@');
          let userIDforRef = userIDs[0];
          if (UCChannelID !== -1) {
             userIDforRef = userIDs[UCChannelID];
          }
          
          if (userVideoAmount[userIDforRef]) {
             userVideoAmount[userIDforRef]++;
          } else {
             userVideoAmount[userIDforRef] = 1;
          }

       }
   }
   
   if (endIt) break;
}

let sortedList = Object.entries(userVideoAmount)
                 // .filter(entry => entry.num > 10000)
                 .sort((a,b) => b[1] - a[1])
                 .slice(0,30);

console.log(sortedList);