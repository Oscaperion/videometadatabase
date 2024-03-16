let fs = require('fs');

const folderLocation = 'F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts2/vids';
const saveLocation = 'F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/missingNicoUid.json';
let noUidVids = [];
const yearMax = 202412;
const yearMin = 200601;

for (let i = yearMax; i >= yearMin; i--) {
   let jsonFile;

   try {
      jsonFile = JSON.parse(fs.readFileSync((folderLocation + i + '.json'), 'utf8'));
   } catch (error) {
      continue;
   }

   for (let j = 0; j < jsonFile.length; j++) {
      if (jsonFile[j].extractor_key === "Niconico" && jsonFile[j].uId === undefined) noUidVids.push(jsonFile[j].id);
   }
}

fs.writeFileSync(saveLocation, JSON.stringify(noUidVids));
