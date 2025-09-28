//requiring path and fs modules
let path = require('path');
let fs = require('fs');

//var vids =  JSON.parse(fs.readFileSync('K:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/youtubeUserList-uncompressed.json', 'utf8'));
let vids = JSON.parse(fs.readFileSync('K:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/youtubeUserList-uncompressed-with-channelNames.json', 'utf8'));
let ignoreUsers =  JSON.parse(fs.readFileSync('K:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/ignoreChannels.json', 'utf8'));
let replll = [];

for (let j = 0; j < vids.length; j++) {
    let doIt = true;
    let checkTmp = vids[j];

    for (let i = 0; i < checkTmp.channelIds.length; i++) {
        if (ignoreUsers.includes(checkTmp.channelIds[i])) {
           doIt = false;
           console.log("Ignored " + checkTmp.channelIds[i]);
           break;
        }
        /*
        for (var k = 0; k < ignoreUsers.length; k++) {
            if (checkTmp.channelIds[i] === ignoreUsers[k]) {
              doIt = false;
              break;
            }
        }
        if (!doIt) break;
        */
    }

    // console.log(checkTmp.channelIds);
    let tmpChannel = checkTmp.channelIds.findIndex(ent => ent.substring(0,2) === "UC" && ent.length === 24);
    let tmpUser = checkTmp.channelIds.findIndex(ent => !(ent.substring(0,2) === "UC" && ent.length === 24) && ent.substring(0,1) !== '@');
    let tmpAt = [];
    for (let k = 0; k < checkTmp.channelIds.length; k++) {
       if (k !== tmpChannel && k !== tmpUser) tmpAt.push(checkTmp.channelIds[k]);
    }
    
    let retArray = [];

    if (tmpUser !== -1) retArray.push(checkTmp.channelIds[tmpUser]);
    if (tmpAt.length > 0) retArray.push(...tmpAt);
    if (tmpChannel !== -1) retArray.push(checkTmp.channelIds[tmpChannel]);
    
    let newItem = {};
    newItem["channelIds"] = retArray;
    newItem["channelNames"] = checkTmp.channelNames;

    if (doIt) replll.push(newItem);
}

console.log("Dun");
console.log(replll.length);
fs.writeFileSync('K:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/youtubeUserList-with-channelNames.json', JSON.stringify(replll));