let path = require('path');
let fs = require('fs');

const folderLocation = 'F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts2/vids';
//const folderLocationDest = 'F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts3/vids';
const yearMax = 202312;
const yearMin = 200601;
let endIt = false;

for (let i = yearMax; i >= yearMin; i--) {
   let jsonFile;

   try {
      jsonFile = JSON.parse(fs.readFileSync((folderLocation + i + '.json'), 'utf8'));
   } catch (error) {
      continue;
   }

   for (let j = 0; j < jsonFile.length; j++) {
       if (jsonFile[j].extractor_key === "Youtube" && jsonFile[j].uId === undefined) {
          console.log(jsonFile[j]);
          endIt = true;
          break;
       }
   }
   
   if (endIt) break;
}