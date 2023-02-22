//requiring path and fs modules
var path = require('path');
var fs = require('fs');
const url = require('url');
const http = require('http');

var vids =  JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/youtubeUserList.json', 'utf8'));
var ignoreUsers =  JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/ignoreChannels.json', 'utf8'));
var replll = [];

for (var j = 0; j < vids.length; j++) {
    var doIt = true;
    var checkTmp = vids[j];
    delete checkTmp["channel_id"];
    
    for (var i = 0; i < checkTmp.uploader_id.length; i++) {
        for (var k = 0; k < ignoreUsers.length; k++) {
            if (checkTmp.uploader_id[i] === ignoreUsers[k]) {
              doIt = false;
              //console.log("Ignoring " + ignoreUsers[k]);
              break;
            }
        }
        if (!doIt) break;
    }
    
    if (doIt) replll.push(checkTmp.uploader_id);
}

console.log("Dun");
fs.writeFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/youtubeUserList2.json', JSON.stringify(replll));