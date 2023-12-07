let path = require('path');
let fs = require('fs');

const folderLocation = 'F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts2/vids';
const folderLocationDest = 'F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts3/vids';
const yearMax = 202312;
const yearMin = 200601;

for (let i = yearMax; i >= yearMin; i--) {
   let jsonFile;

   try {
      jsonFile = JSON.parse(fs.readFileSync((folderLocation + i + '.json'), 'utf8'));
   } catch (error) {
      continue;
   }

   for (let j = 6; j > 0; j--) {
      let maxDate = j * 5;
      if (j === 6) maxDate++;
      let minDate = ((j - 1) * 5) + 1;

      maxDate = i + maxDate.toString().padStart(2, '0');
      minDate = i + minDate.toString().padStart(2, '0');

      let filteredJson = jsonFile.filter(ent => (ent.upload_date >= minDate) && (ent.upload_date <= maxDate)
      // TEMPORARY! Ignores BiliBili videos
        && (ent.extractor_key !== "BiliBili"));
      
      if (filteredJson.length > 0) fs.writeFileSync(folderLocationDest + i + j + '.json', JSON.stringify(filteredJson));
      console.log('Saved ' + folderLocationDest + i + j);
   }
}