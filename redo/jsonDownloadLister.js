//requiring path and fs modules
var path = require('path');
var fs = require('fs');
const url = require('url');
const http = require('http');

const br =  '\r\n';
//var videoList = '';


//var exampleFile = fs.readFileSync('massJsonTesting\\bagiIEpLiLI.info.json', 'utf8');
//var parsedJSON = JSON.parse(exampleFile);

//console.log(exampleFile);

//var toBeSortedList = [];
    /*
videoList += '<hr/>' + br;
        videoList += '<div><b>' + parsedJSON.title + '</b><br/>' + br;
        videoList += '<code><a href=\"' + parsedJSON.webpage_url + '\" target=\"_blank\">' + parsedJSON.webpage_url + '</a></code><br/><br/>' + br;
        videoList += 'Uploader: <a href=\"' + parsedJSON.uploader_url + '\" target=\"_blank\">' + parsedJSON.uploader + ' (<code>' + parsedJSON.uploader_id + '</code>)</a><br/>' + br;
        videoList += 'Release date: ' + parsedJSON.upload_date + '</div>' + br;       */
//console.log('Started forming the server')  ;

    var rString = '';
var tu;
for (tu = 38; tu >= 0; tu--) {
//var videoitaFile = fs.readFileSync('videoita.json', 'utf8');
//var parsedVideos = JSON.parse(videoitaFile);
    var parsedVideos = JSON.parse(fs.readFileSync(('YTPMV Metadata Archive JSON/split_parts/vids' + tu + '.json'), 'utf8'));

//var k = 25;
//var searchWord = 'thwy';


    //for (i = 0; i < 100; i++) {
    for (i = 0; i < parsedVideos.videos.length; i++) {
       var dewIt = true;
       
       if (parsedVideos.videos[i].extractor_key === "BilibiliSpaceVideo") dewIt = false;

       if (parsedVideos.videos[i].extractor_key === "YoutubeTab") dewIt = false;

       if (dewIt) {
          var vidoId = parsedVideos.videos[i].extractor_key.toLowerCase() + ' ' + parsedVideos.videos[i].id;
          rString += vidoId + '\n';
       }
    }
}

    fs.writeFileSync('already-downloaded.txt', rString);
    console.log("Tallennettu");

//console.log('List done');

