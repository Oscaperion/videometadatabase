var fs = require('fs');

let retStr = '';
let tablerooni = [];
let orderId = 0;

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

let checkingVidFileId = 43;
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

while (checkingVidFileId >= 42) {
    let fileSource = 'F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts/vids' + checkingVidFileId + '.json';
    console.log(fileSource);
    let checkingFile = JSON.parse(fs.readFileSync(fileSource, 'utf8'));
    // console.log(checkingFile);

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
       console.log(k);
       console.log(checkingFile[k].uId);
       if (presentIds.includes(checkingFile[k].uId)) {
          console.log(k);
          let indexr = presentIds.indexOf(checkingFile[k].uId);
          tablerooni[indexr]["userName"] =  checkingFile[k].uploader;
          //foundIds.push({"id":checkingFile[k].uId,"userName":checkingFile[k].uploader});
          presentIds[indexr] = -1;
          console.log(tablerooni[indexr]);
       }
    }

    checkingVidFileId--;
}

// fs.writeFileSync('F:/Dropbox/NodeJS/users_with_oneid.txt', retStr);