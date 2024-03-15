var fs = require('fs');

let retStr = '';
let tablerooni = [];
let orderId = 0;
let searchPhrase = ' - Topic';
//let searchPhrase = 'Klasky';


{
    let parsedVideos = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/youtubeUserList2.json', 'utf8'));

    for (let i = 0; i < parsedVideos.length; i++) {
        if (parsedVideos[i].length === 1) {
           tablerooni.push({"order": orderId, "id":i, "userId":parsedVideos[i][0]});
           orderId++;
        }
    }
}

let maxAmount = tablerooni.length;

let checkingVidFileId = 45;
let extraFileName = 'finnredo';
let presentIds = tablerooni.map(ent => ent.id);
let foundIds = [];

//console.log(tablerooni[200]);
//console.log(presentIds[200]);

console.log(tablerooni);
//tablerooni[0]["userName"] = "Yasja";
//console.log(tablerooni[0]);

console.log(presentIds);
console.log(presentIds.includes(2));

let foundUsers = [];

for (var ty = 202412; ty > 200600; ty--) {
    let fileSource = 'F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts2/vids' + ty + '.json';
    var checkingFile;
    try {
       checkingFile = JSON.parse(fs.readFileSync(fileSource, 'utf8'));
    } catch (err) {
       console.log("No file found");
       continue;
    }
    // console.log(checkingFile);
    // console.log(checkingFile[6]);
    //console.log(fileSource);

    /*
    The following refused to work for some reason

    checkingFile.forEach((ent, ind, arr) => {
          if (presentIds.includes(ent.uId)) {
             foundIds.push({"id":ent.uId,"userName":ent.uploader});
             presentIds[ind] = -1;
             console.log({"id":ent.uId,"userName":ent.uploader});
          }
       }
    ) */

    for (let k = 0; k < checkingFile.length; k++) {
       if (checkingFile[k].extractor_key === 'Youtube' && presentIds.includes(checkingFile[k].uId) && checkingFile[k].uploader.includes(searchPhrase)) {
          console.log(k);
          console.log(checkingFile[k]);
          console.log(k);
          let indexr = presentIds.indexOf(checkingFile[k].uId);


          let tmpCell = tablerooni[indexr];
          tmpCell["userName"] =  checkingFile[k].uploader;
          if (!foundUsers.map(ent => ent.uploader).includes(checkingFile[k].uploader)) foundUsers.push(tmpCell);
          // tablerooni[indexr]["userName"] =  checkingFile[k].uploader;
          //foundIds.push({"id":checkingFile[k].uId,"userName":checkingFile[k].uploader});
          presentIds[indexr] = -1;
          // console.log(tablerooni[indexr]);
       }
    }
}

console.log(foundUsers);
console.log(foundUsers.map(ent => ent.userId));

let finStr = '"' + foundUsers.map(ent => ent.userId).join('","') + '"';

//console.log(finStr);

fs.writeFileSync('F:/Dropbox/NodeJS/topic-users.txt', finStr);