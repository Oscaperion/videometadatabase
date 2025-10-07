//requiring path and fs modules
const path = require('path');
const fs = require('fs');

//let vids =  JSON.parse(fs.readFileSync('K:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/youtubeUserList-uncompressed.json', 'utf8'));
//const jsonLocation = "K:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts/";

//let recompiledVids = vids.map(item => {
let recompiledVids = JSON.parse(fs.readFileSync('K:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/niconicoUserList.json', 'utf8'));

/*
let test = recompiledVids.filter(item => { return !item.channelNames });
console.log(test); */

//console.log(recompiledVids[57808]);
for (let i = 0; i < recompiledVids.length; i++) {
   let tmpNames = recompiledVids[i].channelNames;
   // console.log(i);
   if (tmpNames.length === 1) continue;
   
   let returnTmp = [];
   for (let j = 0; j < tmpNames.length; j++) {
      if ((j + 1) >= tmpNames.length && returnTmp.length === 0) {
         returnTmp.push(tmpNames[j]);
         continue;
      }

      if (["","..","__","___"].includes(tmpNames[j])) continue;

      returnTmp.push(tmpNames[j]);
   }

   if (returnTmp.length === recompiledVids[i].channelNames.length) continue;
   
   console.log("Converted " + recompiledVids[i].channelNames + " to " + returnTmp);
   recompiledVids[i].channelNames = returnTmp;

}

console.log("Dun");
// console.log(recompiledVids);
fs.writeFileSync('K:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/niconicoUserList.json', JSON.stringify(recompiledVids));
//fs.writeFileSync('K:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/niconicoVidsWithoutUploader.json', JSON.stringify(noUploader));
