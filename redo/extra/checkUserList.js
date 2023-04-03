var fs = require('fs');


var parsedVideos = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/youtubeUserList2.json', 'utf8'));
var retStr = '<!DOCTYPE html>\n<html>\n<head><meta http-equiv="Content-Type" content="text/html; charset=utf-8">\n<link rel="stylesheet" href="https://finnrepo.a2hosted.com/assets/dark_theme_style.css">\n<title>YTPMV Metadata Archive</title>\n</head>\n<body>\n';

      /*
for (let i = 0; i < parsedVideos.length; i++) {
    if (parsedVideos[i].length === 1 && parsedVideos[i][0].substring(0,2) !== "UC") {
       let linkk = 'https://finnrepo.a2hosted.com/YTPMV_Database/results.html?hey_didyou_know=selen_tatsuki_is_kool&uploader_id=' + parsedVideos[i][0];
       retStr += '<a href="' + linkk + '">' + linkk + '</a><br/><br/>\n';
    }
}   */

var gathered = [];

for (let tu = 202304; tu >= 200601; tu--) {
    try {
       console.log("Loading " + tu);
       let parsedVideos = JSON.parse(fs.readFileSync(('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts2/vids' + tu + '.json'), 'utf8'));

       /*
       let parss = parsedVideos.filter(vid => {
           if (vid.extractor_key === "Youtube" && vid.uId === undefined && !gathered.includes(vid.uploader_id)) {
              gathered.push(vid.uploader_id);
              return true;
           }
           return false;
       }); */

       for (let i = 0; i < parsedVideos.length; i++) {
          if (parsedVideos[i].extractor_key === "Youtube" && parsedVideos[i].uploader_id !== undefined && !gathered.includes(parsedVideos[i].uploader_id)) {            
             gathered.push(parsedVideos[i].uploader_id);
             let linkk = 'https://finnrepo.a2hosted.com/YTPMV_Database/results.html?hey_didyou_know=selen_tatsuki_is_kool&uploader_id=' + parsedVideos[i].uploader_id;
             retStr += '<a href="' + linkk + '">' + linkk + '</a><br/><br/>\n';
          }
       }
    } catch (e) {
        console.log("Nopoe");
        //console.log(e);
    }
}

retStr += "</body></html>";

fs.writeFileSync('F:/Dropbox/NodeJS/users_with_less.html', retStr);