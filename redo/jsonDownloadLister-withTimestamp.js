//requiring path and fs modules
var path = require('path');
var fs = require('fs');
const url = require('url');
const http = require('http');

const br =  '\r\n';

const idSet = new Set();
// const extractorSet = new Set();

//var rString = '';
//let tu;
for (let tu = 69; tu >= -1; tu--) {
//var videoitaFile = fs.readFileSync('videoita.json', 'utf8');
//var parsedVideos = JSON.parse(videoitaFile);
    let filepath = 'K:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts/vids' + tu + '.json';
    if (tu === -1) filepath = 'K:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts/finnredo.json';
    let parsedVideos = JSON.parse(fs.readFileSync(filepath, 'utf8')).videos;
    console.log("Checking " + filepath);

//var k = 25;
//var searchWord = 'thwy';

    let parsedIds = parsedVideos.filter(ent => { return !(ent.extractor_key === "BilibiliSpaceVideo" || 
                                                            ent.extractor_key === "YoutubeTab" ||
                                                            ent.extractor_key === "SoundcloudPlaylist") &&
                                                          !!ent.timestamp
                                                ; })
                                .map(ent => {
                                   // extractorSet.add(ent.extractor_key);
                                   let idTmp = ent.id;
                                   if (Array.isArray(idTmp)) idTmp = ent.id[0];
                                   return ent.extractor_key.toLowerCase() + ' ' + idTmp;});

    // console.log(parsedIds);

    // idSet.add(...parsedIds);
    
    parsedIds.forEach(ent => { idSet.add(ent);  });

              /*
    //for (i = 0; i < 100; i++) {
    for (i = 0; i < parsedVideos.videos.length; i++) {
       //var dewIt = true;

       if (parsedVideos.videos[i].extractor_key === "BilibiliSpaceVideo") continue; // dewIt = false;

       if (parsedVideos.videos[i].extractor_key === "YoutubeTab") continue; // dewIt = false;

       let tmpId = parsedVideos.videos[i].id;

       if (parsedVideos.videos[i].extractor_key === "BiliBili" && Array.isArray(parsedVideos.videos[i].id)) tmpId = parsedVideos.videos[i].id[0];

       // console.log(tu + " ----- " + tmpId + " ----- " + parsedVideos.videos[i].extractor_key);

       let vidoId = parsedVideos.videos[i].extractor_key.toLowerCase() + ' ' + tmpId;

       rString += vidoId + '\n';
    }       */
}

    fs.writeFileSync('K:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/already-downloaded-with-timestamp.txt', Array.from(idSet).join('\n') + '\n' );
    console.log("Tallennettu");
    // console.log(extractorSet);

//console.log('List done');

