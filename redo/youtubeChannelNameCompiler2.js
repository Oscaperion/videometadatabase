//requiring path and fs modules
const path = require('path');
const fs = require('fs');

//let vids =  JSON.parse(fs.readFileSync('K:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/youtubeUserList-uncompressed.json', 'utf8'));
const jsonLocation = "K:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts/";

//let recompiledVids = vids.map(item => {
let recompiledVids = JSON.parse(fs.readFileSync('K:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/youtubeUserList-uncompressed.json', 'utf8'));

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

for (let i = 68; i >= 68; --i) {
//for (let i = 10; i >= 10; --i) {
   files.push("vids" + i + ".json");
}
//files.push("finnredo.json");
//files.push("finnredo-og.json");

console.log(files);

try {
   files.forEach(jsonFile => {
      console.log(jsonLocation + jsonFile);
      // console.log("fof");
      let tmpFile = JSON.parse(fs.readFileSync(jsonLocation + jsonFile, 'utf8'));
      if (!!tmpFile.videos) tmpFile = tmpFile.videos;

      for (let i = 0; i < tmpFile.length; i++) {
         if (i % 100 === 0) console.log(i + " / " + tmpFile.length);

         if (tmpFile[i].extractor_key !== "Youtube") continue;

         let userIds = [];
         if (!!tmpFile[i].channel_id)  userIds.push(tmpFile[i].channel_id);
         if (!!tmpFile[i].uploader_id) userIds.push(tmpFile[i].uploader_id);
         let isPresentAt = checkForPresence(userIds);
         // let isPresentAt = checkForPresence(tmpFile.channelIds);
         // if (isPresentAt === -1) { console.log("Check video at " + jsonFile + " with id: " + tmpFile[i].id); throw new Error(""); }
         if (isPresentAt === -1) {
            let newItem = {};
            newItem["channelIds"] = userIds;
            recompiledVids.push(newItem);
            isPresentAt = recompiledVids.length - 1;
            console.log("Added new channel info!");
            console.log(newItem);
         }
         
         if (isPresentAt !== -1) {
            // let preVal = recompiledVids[isPresentAt];
            for (let p = 0; p < userIds.length; p++) {
               if (!recompiledVids[isPresentAt].channelIds.includes(userIds[p])) {
                  recompiledVids[isPresentAt].channelIds.push(userIds[p]);
                  console.log("Added more channel info!");
                  console.log(recompiledVids[isPresentAt]);
               }
            }
         }

         let channelName = tmpFile[i].uploader;
         if (!recompiledVids[isPresentAt]["channelNames"]) recompiledVids[isPresentAt]["channelNames"] = [];
         if (!recompiledVids[isPresentAt]["channelNames"].includes(channelName) && !!channelName) {
            /*
            let namesTmp = recompiledVids[isPresentAt]["channelNames"];
            recompiledVids[isPresentAt]["channelNames"] = [channelName].push(...namesTmp);
            */
            recompiledVids[isPresentAt]["channelNames"].unshift(channelName);
            console.log(jsonFile + " --- " + i + "/" + tmpFile.length);
            console.log(recompiledVids[isPresentAt]);
            console.log("\n");
         }
      }
   });
} catch(e) {
   // console.log("ERROR! FILE COULDN'T BE READ!");
   console.log(e);
}

function checkForPresence(_channelIds) {
   // First we check if there is a UC id present, since those are the most individual ids tied to any given channel
   let initialCheck = _channelIds.findIndex(item => item.substring(0,2) === "UC" && item.length === 24);
   if (initialCheck > -1) {
      let checkTmp = recompiledVids.findIndex(item => item.channelIds.includes(_channelIds[initialCheck]));
      if (checkTmp > -1) { /* console.log("Found UC id!"); */ return checkTmp; }
   }
       /*
   // Then we check if this has a user/ ID present
   let userCheck = _channelIds.findIndex(item => item.substring(0,1) === "@");
   if (userCheck > -1) {
      let checkTmp = recompiledVids.findIndex(item => item.channelIds.includes(_channelIds[userCheck]));
      if (checkTmp > -1) { return checkTmp; }
   } */

   // Otherwise this goes through all given ids
   for (let i = 0; i < _channelIds.length; i++) {
      if (_channelIds[i].substring(0,1) === '@') continue;
      let checkTmp = recompiledVids.findIndex(item => item.channelIds.includes(_channelIds[i]));
      if (checkTmp > -1) return checkTmp;
   }
   
   return -1;
}

console.log("Dun");
// console.log(recompiledVids);
fs.writeFileSync('K:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/youtubeUserList-uncompressed.json', JSON.stringify(recompiledVids));
