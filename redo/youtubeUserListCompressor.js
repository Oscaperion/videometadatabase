//requiring path and fs modules
var path = require('path');
var fs = require('fs');
const url = require('url');
const http = require('http');

var vids =  JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/youtubeUserList.json', 'utf8'));
var ignoreUsers =  JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/ignoreChannels.json', 'utf8'));
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
    
    if (doIt) replll.push(checkTmp.uploader_id);
}

console.log("Dun");
fs.writeFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/youtubeUserList2.json', JSON.stringify(replll));