//requiring path and fs modules
let path = require('path');
let fs = require('fs');

let userIds = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/niconicoUserList.json', 'utf8'));

let vids = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts/vids49.json', 'utf8'));

for (let orttt = 0; orttt < vids.videos.length; orttt++) {
   if (vids.videos[orttt].extractor_key === "Niconico") {
      if (!userIds.includes(vids.videos[orttt].uploader_id) && vids.videos[orttt].uploader_id !== undefined) {
         userIds.push(vids.videos[orttt].uploader_id);
         console.log("Added " + vids.videos[orttt].uploader_id);
      }
   }
}

console.log("Dun");
fs.writeFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/niconicoUserList.json', JSON.stringify(userIds));