//requiring path and fs modules
var path = require('path');
var fs = require('fs');
const url = require('url');
const http = require('http');

var vids =  JSON.parse(fs.readFileSync('K:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/youtubeUserList-uncompressed.json', 'utf8'));
var ignoreUsers =  JSON.parse(fs.readFileSync('K:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/ignoreChannels.json', 'utf8'));
var replll = [];

for (let j = 0; j < vids.length; j++) {
    let doIt = true;
    let checkTmp = vids[j];

    for (let i = 0; i < checkTmp.uploader_id.length; i++) {
        if (ignoreUsers.includes(checkTmp.uploader_id[i])) {
           doIt = false;
           console.log("Ignored " + checkTmp.uploader_id[i]);
           break;
        }
        /*
        for (var k = 0; k < ignoreUsers.length; k++) {
            if (checkTmp.uploader_id[i] === ignoreUsers[k]) {
              doIt = false;
              break;
            }
        }
        if (!doIt) break;
        */
    }

    // console.log(checkTmp.uploader_id);
    let tmpChannel = checkTmp.uploader_id.findIndex(ent => ent.substring(0,2) === "UC" && ent.length === 24);
    let tmpUser = checkTmp.uploader_id.findIndex(ent => !(ent.substring(0,2) === "UC" && ent.length === 24) && ent.substring(0,1) !== '@');
    let tmpAt = [];
    for (let k = 0; k < checkTmp.uploader_id.length; k++) {
       if (k !== tmpChannel && k !== tmpUser) tmpAt.push(checkTmp.uploader_id[k]);
    }
    
    let retArray = [];

    if (tmpUser !== -1) retArray.push(checkTmp.uploader_id[tmpUser]);
    if (tmpAt.length > 0) retArray.push(...tmpAt);
    if (tmpChannel !== -1) retArray.push(checkTmp.uploader_id[tmpChannel]);

    if (doIt) replll.push(retArray);
}

console.log("Dun");
console.log(replll.length);
fs.writeFileSync('K:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/youtubeUserList.json', JSON.stringify(replll));