//requiring path and fs modules
const path = require('path');
const fs = require('fs');

//let vids =  JSON.parse(fs.readFileSync('K:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/youtubeUserList-uncompressed.json', 'utf8'));
const jsonLocation = "K:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts/";

//let recompiledVids = vids.map(item => {
let recompiledVids = JSON.parse(fs.readFileSync('K:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/niconicoUserList.json', 'utf8'));

/*
let test = recompiledVids.filter(item => { return !item.channelNames });
console.log(test); */

/*
let recompiledVids2 = JSON.parse(fs.readFileSync('K:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/youtubeUserList-uncompressed.json', 'utf8'))
   .map(item => {
      let newValue = {};
      newValue["channelIds"] = item.uploader_id;
      return newValue;
   }); */
//console.log(recompiledVids);

//let files = fs.readdirSync(jsonLocation).reverse();
let files = [];

for (let i = 69; i <= 69; i++) {
//for (let i = 10; i >= 10; --i) {
   files.push("vids" + i + ".json");
}
//files.push("finnredo.json");
//files.push("finnredo-og.json");

let noUploader = [];

console.log(files);

try {
  files.forEach(jsonFile => {
      console.log(jsonLocation + jsonFile);
      let tmpFile = JSON.parse(fs.readFileSync(jsonLocation + jsonFile, 'utf8'));
      
      /*
      let tmpFile = JSON.parse(fs.readFileSync('K:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/missingNicoUid2.json', 'utf8'));

      for (let i = 0; i < tmpFile.length; i++) {
         if (i % 100 === 0) console.log(i + " / " + tmpFile.length);
         if (!tmpFile[i].nicologEntry) continue;
         
         let isPresentAt = checkForPresence(tmpFile[i].uId);

         if (isPresentAt === -1) {
            let newItem = {};
            newItem["channelId"] = tmpFile[i].uId;
            recompiledVids.push(newItem);
            isPresentAt = recompiledVids.length - 1;
            console.log("Added new channel info!");
            console.log(newItem);
         }
         
         if (isPresentAt !== -1) {
            if (!recompiledVids[isPresentAt]["channelNames"]) recompiledVids[isPresentAt]["channelNames"] = [];

            if (!recompiledVids[isPresentAt]["channelNames"].includes(tmpFile[i].uploader)) {
               recompiledVids[isPresentAt]["channelNames"].unshift(tmpFile[i].uploader);
               console.log("Added more channel info!");
               console.log(recompiledVids[isPresentAt]);
            }
         }
      }     */

      if (!!tmpFile.videos) tmpFile = tmpFile.videos;

      for (let i = 0; i < tmpFile.length; i++) {
         if (i % 100 === 0) console.log(i + " / " + tmpFile.length);

         if (tmpFile[i].extractor_key !== "Niconico") continue;

         let userId = tmpFile[i].uploader_id;
         
         if (!userId) { console.log(tmpFile[i]); noUploader.push(tmpFile[i].id); continue; } // throw new Error("Check that file!"); }
         // if (!!tmpFile[i].channel_id)  userIds.push(tmpFile[i].channel_id);
         // if (!!tmpFile[i].uploader_id) userIds.push(tmpFile[i].uploader_id);
         let isPresentAt = checkForPresence(userId);
         // let isPresentAt = checkForPresence(tmpFile.channelIds);
         // if (isPresentAt === -1) { console.log("Check video at " + jsonFile + " with id: " + tmpFile[i].id); throw new Error(""); }
         if (isPresentAt === -1) {
            let newItem = {};
            newItem["channelId"] = userId;
            recompiledVids.push(newItem);
            isPresentAt = recompiledVids.length - 1;
            console.log("Added new channel info!");
            console.log(newItem);
         }
         
         if (isPresentAt !== -1) {
            if (!recompiledVids[isPresentAt]["channelNames"]) recompiledVids[isPresentAt]["channelNames"] = [];

            if (!recompiledVids[isPresentAt]["channelNames"].includes(tmpFile[i].uploader)) {
               recompiledVids[isPresentAt]["channelNames"].unshift(tmpFile[i].uploader);
               console.log("Added more channel info!");
               console.log(recompiledVids[isPresentAt]);
            }
         }
      }
  });
} catch(e) {
   // console.log("ERROR! FILE COULDN'T BE READ!");
   console.log(e);
}

function checkForPresence(_channelId) {
   // First we check if there is a UC id present, since those are the most individual ids tied to any given channel
   // let initialCheck = _channelIds.findIndex(item => item.substring(0,2) === "UC" && item.length === 24);
   // if (initialCheck > -1) {
      let checkTmp = recompiledVids.findIndex(item => (item.channelId === _channelId));
      if (checkTmp > -1) { /* console.log("Found UC id!"); */ return checkTmp; }
   // }
       /*
   // Then we check if this has a user/ ID present
   let userCheck = _channelIds.findIndex(item => item.substring(0,1) === "@");
   if (userCheck > -1) {
      let checkTmp = recompiledVids.findIndex(item => item.channelIds.includes(_channelIds[userCheck]));
      if (checkTmp > -1) { return checkTmp; }
   } */
        /*
   // Otherwise this goes through all given ids
   for (let i = 0; i < _channelIds.length; i++) {
      if (_channelIds[i].substring(0,1) === '@') continue;
      let checkTmp = recompiledVids.findIndex(item => item.channelIds.includes(_channelIds[i]));
      if (checkTmp > -1) return checkTmp;
   }  */
   
   return -1;
}

console.log("Dun");
// console.log(recompiledVids);
fs.writeFileSync('K:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/niconicoUserList.json', JSON.stringify(recompiledVids));
//fs.writeFileSync('K:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/niconicoVidsWithoutUploader.json', JSON.stringify(noUploader));
