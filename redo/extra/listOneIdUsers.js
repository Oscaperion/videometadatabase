var fs = require('fs');


var parsedVideos = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/youtubeUserList2.json', 'utf8'));

let retStr = '';

for (let i = 0; i < parsedVideos.length; i++) {
    if (parsedVideos[i].length === 1) retStr += parsedVideos[i][0] + '\r\n';
}

fs.writeFileSync('F:/Dropbox/NodeJS/users_with_oneid.txt', retStr);