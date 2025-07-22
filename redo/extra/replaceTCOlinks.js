//requiring path and fs modules
var path = require('path');
const fs = require('fs');
const url = require('url');
const http = require('http');

const folderName =  'F:/Dropbox/NodeJS/massJsonTesting';

const XMLHttpRequest_node = require("xmlhttprequest").XMLHttpRequest;

const br =  '\r\n';

let feats_HSL;

let requ_HSL = new XMLHttpRequest_node();
requ_HSL.onreadystatechange = function() {
   console.log("Readystate = " + requ_HSL.readyState + ', Status = ' + requ_HSL.status);
   console.log(requ_HSL.responseText);
   if (requ_HSL.readyState == 4 && (requ_HSL.status == 200 || requ_HSL.status == 301)){
      //alert(req.responseText);
      //rawdata_HSL = requ_HSL.responseText;
      //feats_HSL = JSON.parse(requ_HSL.responseText).features;
      feats_HSL = requ_HSL.responseText;
      if (requ_HSL.status == 301) {
         //console.log(requ_HSL.getAllResponseHeaders());
         feats_HSL = requ_HSL.getAllResponseHeaders();
      }
      console.log("Successfully fetched");
   } else {
      console.log("Not fetched");
      feats_HSL = ' ';
   }
};

//for (j = 1; j <= 27; j++) {
//for (j = 16; j >= 16; j--) {

  let dirName = folderName + 66;
  console.log('Luetaan kansiota ' + dirName);
  //joining path of directory
  let directoryPath = path.join(dirName);
  //passsing directoryPath and callback function
  fs.readdirSync(directoryPath).forEach(function (file) {
    if (file.localeCompare('desktop.ini') != 0) {
       let filePath = dirName + '\\' + file;
       let parsedVideo = JSON.parse(fs.readFileSync(filePath, 'utf8'));
       
       console.log(parsedVideo.upload_date + ' -- ' + parsedVideo.id);
       if (!(parsedVideo.description === undefined) && parsedVideo.extractor_key.indexOf("Twitter") != -1) {
          parsedVideo.description = findLinks(parsedVideo.description, 'https://t.co/');
          let fileLoc = 'F:/Dropbox/NodeJS/massJsonTesting-1/' + parsedVideo.id + '-tco-link-patched.json';
          fs.writeFileSync(fileLoc, JSON.stringify(parsedVideo));
       } /*if (!(parsedVideo.description === undefined)) {
          parsedVideo.description = findLinks_b23(parsedVideo.description, 'b23.tv/');
       }     */
    }

  } );
//}

  /*
console.log('Started forming the server')  ;

// Original
console.log('Loading metadata...')  ;
//var parsedVideos = JSON.parse(fs.readFileSync('videoita.json', 'utf8'));
var parsedVideo = JSON.parse(fs.readFileSync('massJsonTesting16/1344440901255499784.info.json', 'utf8'));
console.log('Loaded!')  ;

//for (i = 0; i < parsedVideos.videos.length; i++) {
    //var tmp = parsedVideos.videos[i];

    //if (tmp.extractor_key.indexOf("Twitter") != -1) {

       //var tmp = parsedVideos.videos[i];
       console.log(parsedVideo.upload_date + ' -- ' + parsedVideo.id);
       if (!(parsedVideo.description === undefined)) {
          parsedVideo.description = findLinks(parsedVideo.description, 'https://t.co/');
       }
       var fileLoc = 'massJsonTesting-1/' + parsedVideo.id + '-tco-link-fixed.json';
       fs.writeFileSync(fileLoc, JSON.stringify(parsedVideo));

    //}
//}

     */

function findLinks(ogDescription, searchString) {
    let editedDescription = ogDescription;
    let linkPos = editedDescription.indexOf(searchString);

    if (linkPos > -1) {
        while (linkPos != -1) {/*
            var tempp1 = editedDescription.indexOf(' ', linkPos);
            var tempp2 = editedDescription.indexOf('\n', linkPos);
            //console.log(tempp1 + ' -- ' + tempp2);
            var endOfLink = tempp1;
            if ((tempp2 != -1 && tempp2 < tempp1) || (tempp2 > tempp1 && tempp1 == -1)) {
                endOfLink = tempp2;
            } */
            
            let endOfLink = linkPos + 23;

            let linkara = '';
            //console.log('End of link: ' + endOfLink);



            if (endOfLink == -1) { //(tempp1 == -1 && tempp2 == -1) {
                linkara = editedDescription.substring(linkPos);
            } else {
                linkara = editedDescription.substring(linkPos,endOfLink);
            }
            //console.log(linkara);
            
            /*
            // This makes sure that it is the link that is highlighted
            var tarkLink = "youtube.com/watch?v=";
            if (linkara.indexOf(tarkLink) > -1) {
                var temperar = linkara.substring((linkara.indexOf(tarkLink) + tarkLink.length));
                if (temperar.length > 11) {
                   temperar = temperar.substring(0, 11);
                }

                linkingPark = linkingPark + '&nbsp;<code><a href="results.html?search=' + temperar + '">[Search with this ID]</a></code>';
            }   */

            let tempStr1 = editedDescription.substring(0,linkPos);
            let tempStr2 = editedDescription.substring(endOfLink);

            let linkingPark = linkara;

            /*
            // If the link has an ID to a video on YouTube, Niconico or Bilibili, this will add a link to search the archive with that ID
            tarkLink = "youtube.com/watch?v=";
            if (linkara.indexOf(tarkLink) > -1) {
                var temperar = linkara.substring((linkara.indexOf(tarkLink) + tarkLink.length));
                if (temperar.length > 11) {
                   temperar = temperar.substring(0, 11);
                }
                
                linkingPark = linkingPark + '&nbsp;<code><a href="results.html?search=' + temperar + '">[Search with this ID]</a></code>';
            }
            
            tarkLink = "youtu.be/";
            if (linkara.indexOf(tarkLink) > -1) {
                var temperar = linkara.substring((linkara.indexOf(tarkLink) + tarkLink.length));
                if (temperar.length > 11) {
                   temperar = temperar.substring(0, 11);
                }

                linkingPark = linkingPark + '&nbsp;<code><a href="results.html?search=' + temperar + '">[Search with this ID]</a></code>';
            }  */
                  /*
            tarkLink = "nico.ms/";
            if (linkara.indexOf(tarkLink) > -1) {
                var temperar = linkara.substring((linkara.indexOf(tarkLink) + tarkLink.length));
                if (temperar.indexOf('?') > -1) {
                   temperar = temperar.substring(0, temperar.indexOf('?'));
                }
                if (temperar.indexOf(')') > -1) {
                   temperar = temperar.substring(0, temperar.indexOf(')'));
                }
                
                var i = 2;

                while(i <= temperar.length && isItNumber(temperar.charAt[i])) {
                   i++;
                }
                 temperar = temperar.substring(0, i);

                 if (alreadyDownloaded.indexOf(temperar) == -1) {


                fs.appendFileSync('NiconicoVids3.txt', 'https://www.nicovideo.jp/watch/' + temperar + '\n');
                console.log('Found ID: ' + temperar);
                linkingPark = linkingPark + '&nbsp;<code><a href="results.html?search=' + temperar + '">[Search with this ID]</a></code>';
                 }
            }

            tarkLink = "nicovideo.jp/watch/";
            if (linkara.indexOf(tarkLink) > -1) {
                var temperar = linkara.substring((linkara.indexOf(tarkLink) + tarkLink.length));
                if (temperar.indexOf('?') > -1) {
                   temperar = temperar.substring(0, temperar.indexOf('?'));
                }
                if (temperar.indexOf(')') > -1) {
                   temperar = temperar.substring(0, temperar.indexOf(')'));
                }
                

                var i = 2;

                while(i <= temperar.length && isItNumber(temperar.charAt[i])) {
                   i++;
                }
                 temperar = temperar.substring(0, i);

                if (alreadyDownloaded.indexOf(temperar) == -1) {
                fs.appendFileSync('NiconicoVids3.txt', 'https://www.nicovideo.jp/watch/' + temperar + '\n');
                console.log('Found ID: ' + temperar);
                linkingPark = linkingPark + '&nbsp;<code><a href="results.html?search=' + temperar + '">[Search with this ID]</a></code>';
                }
            }
                  */
                /*
            tarkLink = "acg.tv/";
            if (linkara.indexOf(tarkLink) > -1) {
                var temperar = linkara.substring((linkara.indexOf(tarkLink) + tarkLink.length));
                if (temperar.indexOf('?') > -1) {
                   temperar = temperar.substring(0, temperar.indexOf('?'));
                }
                if (temperar.indexOf('/') > -1) {
                   temperar = temperar.substring(0, temperar.indexOf('/'));
                }
                if (temperar.indexOf(')') > -1) {
                   temperar = temperar.substring(0, temperar.indexOf(')'));
                }
                
                if (alreadyDownloaded.indexOf(temperar.substring(2)) == -1) {
                   fs.appendFileSync('BilibiliVids3.txt', 'https://bilibili.com/video/' + temperar + '\n');
                   console.log('Found ID: ' + temperar);
                   linkingPark = linkingPark + '&nbsp;<code><a href="results.html?search=' + temperar + '">[Search with this ID]</a></code>';
                }
            }
            
            tarkLink = "bilibili.com/video/";
            if (linkara.indexOf(tarkLink) > -1) {
                var temperar = linkara.substring((linkara.indexOf(tarkLink) + tarkLink.length));
                if (temperar.indexOf('?') > -1) {
                   temperar = temperar.substring(0, temperar.indexOf('?'));
                }
                if (temperar.indexOf('/') > -1) {
                   temperar = temperar.substring(0, temperar.indexOf('/'));
                }
                if (temperar.indexOf(')') > -1) {
                   temperar = temperar.substring(0, temperar.indexOf(')'));
                }
                
                if (alreadyDownloaded.indexOf(temperar.substring(2)) == -1) {
                   fs.appendFileSync('BilibiliVids3.txt', 'https://bilibili.com/video/' + temperar + '\n');
                   console.log('Found ID: ' + temperar);
                   linkingPark = linkingPark + '&nbsp;<code><a href="results.html?search=' + temperar + '">[Search with this ID]</a></code>';
                }
            }       */
            
            tarkLink = "https://t.co/";
            if (linkara.indexOf(tarkLink) > -1) {
                console.log(linkara);
                requ_HSL.open("GET", linkara, false);
                requ_HSL.send(null);
                
                let loccar = '';

                if (feats_HSL != null)  {
                   console.log(feats_HSL);
                   let lolTmp1 = feats_HSL.indexOf('location:');
                   let lolTmp2 = feats_HSL.indexOf('\n', lolTmp1);
                   loccar = feats_HSL.substring(lolTmp1 + 'location:'.length, lolTmp2).trim();
                   console.log (loccar);
                  /* loccar = 'https:' + loccar.trim();
                   loccar = loccar.substring(0,loccar.indexOf('?'));
                   console.log (loccar);

                   requ_HSL.open("GET", loccar, false);
                   requ_HSL.send(null);
                   fs.appendFileSync('memesBilibili.txt', feats_HSL);  */

                }
                
                linkingPark = loccar;
            }

            editedDescription = tempStr1 + linkingPark;
            if (endOfLink != -1) {
                editedDescription += tempStr2;
            }
            let temmie = linkPos;

            linkPos = editedDescription.indexOf(searchString, (temmie + linkingPark.length));
        }
    }
    return editedDescription;
}


function findLinks_b23(ogDescription, searchString) {
    let editedDescription = ogDescription + ' ';
    let linkPos = editedDescription.indexOf(searchString);

    if (linkPos > -1) {
        while (linkPos != -1) {
            let linkara = 'https://' + editedDescription.substring(linkPos, (searchString.length + 6));
                                                        /*
            var tempp1 = editedDescription.indexOf(' ', linkPos);
            var tempp2 = editedDescription.indexOf('\n', linkPos);
            //console.log(tempp1 + ' -- ' + tempp2);
            var endOfLink = tempp1;
            if ((tempp2 != -1 && tempp2 < tempp1) || (tempp2 > tempp1 && tempp1 == -1)) {
                endOfLink = tempp2;
            }
            var linkara = '';
            //console.log('End of link: ' + endOfLink);

            if (endOfLink == -1) { //(tempp1 == -1 && tempp2 == -1) {
                linkara = editedDescription.substring(linkPos);
            } else {
                linkara = editedDescription.substring(linkPos,endOfLink);
            }   */


            let tempStr1 = editedDescription.substring(0,linkPos);
            let tempStr2 = editedDescription.substring(linkPos + searchString.length + 6);

            let linkingPark = linkara;

            
            //tarkLink = "https://t.co/";
            //if (linkara.indexOf(tarkLink) > -1) {
                console.log(linkara);
                requ_HSL.open("GET", linkara, false);
                requ_HSL.send(null);
                
                let loccar = '';

                if (feats_HSL != null)  {
                   console.log(feats_HSL);
                   let lolTmp1 = feats_HSL.indexOf('location:');
                   let lolTmp2 = feats_HSL.indexOf('\n', lolTmp1);
                   loccar = feats_HSL.substring(lolTmp1 + 'location:'.length, lolTmp2).trim();
                   console.log (loccar);

                }
                
                linkingPark = loccar;
            //}

            editedDescription = tempStr1 + linkingPark.substring('https://'.length) + tempStr2;
                   /*
            editedDescription = tempStr1 + linkingPark;
            if (endOfLink != -1) {
                editedDescription += tempStr2;
            }    */
            let temmie = linkPos;

            linkPos = editedDescription.indexOf(searchString, (temmie + linkingPark.length));
        }
    }
    return editedDescription;
}