const fs = require('fs');
//const readline = require('readline');

const searchChannelId = ["UCpOCzT42yg0dCJSj4YVjjJg","UCmVVhneCvmhqDvsdarhIyFg","UCrondOtii9xrGGqZbwPrOJQ","UCTZtIY-D-7AMTlctwaD0eDw","UCsRDQvVimYzdAbtPab3Z4qA","UCvp4gQH2xflzUNi4cZqko5A","UCLZanFDwpj_0wwpGBc4haBQ","UC_FDcD-FztthCur5_yqLYug","UCUUM3ciG6EEAHTIpakUxxKw","UCnL_xKabQ94C3xQJrUewpsQ"];

const jsonLocation = "K:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts/";
//const jsonLocation = "D:/testtt1/";

let returnArray = [];

let files = fs.readdirSync(jsonLocation); //, (err, files) => {
   // if (err) throw err;

   console.log("mrppo");

   try {
      files.forEach(jsonFile => {
         console.log(jsonLocation + jsonFile);
         // console.log("fof");
         let tmpFile = JSON.parse(fs.readFileSync(jsonLocation + jsonFile, 'utf8'));
         // console.log(tmpFile);
         if (!!tmpFile.videos) tmpFile = tmpFile.videos;
         // console.log("faf");

         //let channelId = channel_id;

         let tmpList = tmpFile
             .filter(entry => (searchChannelId.includes(entry.channel_id) || searchChannelId.includes(entry.uploader_id)) && !returnArray.includes(entry.id))
             .map(entry => entry.id);


         returnArray.push(...tmpList);
         console.log('Processed... ' + jsonFile);
      });
   } catch(e) {
      console.log("ERROR! FILE COULDN'T BE READ!");
   }

   // console.log('All metadata loaded!');
   // console.log("Total number of entries: " + parsedVideos.length);
// });
console.log("Processed! " + jsonLocation);


fs.writeFileSync('K:/Dropbox/NodeJS/vids-' + searchChannelId[0] + '.txt', 'https://www.youtube.com/watch?v=' + returnArray.join("\nhttps://www.youtube.com/watch?v="));

console.log("List created!");