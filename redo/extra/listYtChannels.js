var fs = require('fs');

let parsedVideos = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/youtubeUserList2.json', 'utf8'));
let finStr = ""

for (let i = 0; i < parsedVideos.length; i++) {
   let tmp1 = parsedVideos[i];
   let tmp2 = tmp1[tmp1.length - 1];
   if (tmp2.includes("UC")) finStr += "https://www.youtube.com/channel/" + tmp2 + "/search?query=ytpmv\n";
}

fs.writeFileSync('F:/Dropbox/NodeJS/YoutubeChannels.txt', finStr);