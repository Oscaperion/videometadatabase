//requiring path and fs modules
let path = require('path');
let fs = require('fs');

const linkList = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/youtubeUserList2.json', 'utf8'));
let videoList = '';
const nimii = 'F:/Dropbox/NodeJS/youtube-channel-links.txt';

for (let j = 0; j < linkList.length; j++) {
   let tmp1 = linkList[j].length - 1;
   let tmp2 = linkList[j][tmp1];
   
   let linkTmp = 'https://www.youtube.com/channel/' + tmp2;
   if (tmp2.substring(0,2) !== "UC" && tmp2.length !== 24) linkTmp = 'https://www.youtube.com/user/' + tmp2;

   videoList += linkTmp + "\n";
   /*
   fs.appendFile(nimii, linkTmp, (err) => {
      if (err) {
        console.error('Error appending to file:', err);
      } else {
        console.log('Added ' + linkTmp);
      }
   }); */
   
   console.log('Added ' + linkTmp);

}
   fs.writeFileSync(nimii, videoList);

    /*
console.log("Saving the JSON file");
    //let jsonifyData =  JSON.stringify({videos: toBeSortedList});
    //fs.writeFileSync('videoita.json', jsonifyData);
    //let nimii = 'YTPMV Metadata Archive JSON/videoita.json';
    let nimii = 'F:/Dropbox/NodeJS/youtube-channel-links.txt';

    fs.writeFileSync(nimii, JSON.stringify({videos: toBeSortedList}));
    //fs.writeFileSync('videoita.json', JSON.stringify({videos: sortedList}));
    console.log("Saved");
    toBeSortedList = [];
    }    */

console.log('Folders read');    /*
readingDone = true;
if (readingDone) writeFile();
    }   */
