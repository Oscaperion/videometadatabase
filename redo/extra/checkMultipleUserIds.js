//requiring path and fs modules
let path = require('path');
let fs = require('fs');

const linkList = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/youtubeUserList.json', 'utf8'));
let videoList = 'Repeated IDs:';
let idList = {};
const nimii = 'F:/Dropbox/NodeJS/multiple-user-id-list.txt';
let numberUsers = 0;

for (let j = 0; j < linkList.length; j++) {
   let tmp1 = linkList[j].uploader_id;
   //console.log(tmp1);

   for (let k = 0; k < tmp1.length; k++) {
      let idTmp =  tmp1[k];

      if (idList[idTmp] === undefined) idList[idTmp] = 0;
      idList[idTmp]++;

      if (idList[idTmp] === 2) {
         videoList += idTmp + '\n';
         numberUsers++;
      }
   }
}
fs.writeFileSync(nimii, videoList);

//console.log(idList);
console.log('Users checked; Found ' +  numberUsers + ' repeated ids');