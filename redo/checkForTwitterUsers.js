var path = require('path');
var fs = require('fs');

const folderName =  'K:/Dropbox/NodeJS/massJsonTesting';
let userList =  JSON.parse(fs.readFileSync('K:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/twitterUserList.json', 'utf8'));

let dirName = folderName + 68;
console.log('Reading folder ' + dirName);
let directoryPath = path.join(dirName);
let changed = false;

fs.readdirSync(directoryPath).forEach(function (file) {
                                               // This will check, if video's title only had numbers.
  if (file.localeCompare('desktop.ini') != 0 && (/^\d+$/.test(file.split('.')[0]))) {
     let filePath = dirName + '\\' + file;
     let parsedVideo = JSON.parse(fs.readFileSync(filePath, 'utf8'));

     if (parsedVideo.extractor_key === "Twitter") console.log("Checking " + parsedVideo.webpage_url);

     if (parsedVideo.extractor_key === "Twitter" && parsedVideo.channel_id) {

        let userIdText = parsedVideo.uploader_id;
        let userIdNum  = parsedVideo.channel_id;

        let matchedNumId = userList.findIndex(item => (item.id === userIdNum));
        console.log();

        if (matchedNumId > -1) {
           let alreadyPresent = userList[matchedNumId].handle.includes(userIdText);
           if (!alreadyPresent) {

              let tmpVal = userList[matchedNumId];
              tmpVal.handle.push(userIdText);
              changed = true;

              console.log("Adding to an old user ID! -- " + tmpVal.handle + " (" + userIdNum + ")");

              userList[matchedNumId] = tmpVal;
           }
        } else {
           let newVal = { };
           newVal["id"] = userIdNum;
           newVal["handle"] = [userIdText];

           console.log("Adding a new user ID! -- " + userIdText + " (" + userIdNum + ")");
           changed = true;

           userList.push(newVal);
        }
     }
  }
});

if (changed) {
   fs.writeFileSync('K:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/twitterUserList.json', JSON.stringify(userList));
   console.log("Changes saved!");
} else {
   console.log("No (new) Twitter user IDs found! Not saving!");
}