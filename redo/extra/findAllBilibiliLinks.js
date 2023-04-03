//requiring path and fs modules
const fs = require('fs');
const url = require('url');
const http = require('http');

// For HSL
const XMLHttpRequest_node = require("xmlhttprequest").XMLHttpRequest;

const br =  '\r\n';

console.log('Started forming the server')  ;

// Original
console.log('Loading metadata...')  ;
var parsedVideos; // = JSON.parse(fs.readFileSync('YTPMV Metadata Archive JSON/split_parts/vids1.json', 'utf8'));


var alreadyDownloaded = fs.readFileSync('already-downloaded.txt', 'utf8')
console.log('Loaded!')  ;

  var pp = 31;
   // for (pp = 1; pp < 22; pp++) {
//fs.appendFileSync('memesBilibili.txt', feats_HSL);
               var atmp = 'YTPMV Metadata Archive JSON/split_parts/vids' + pp + '.json';
               parsedVideos = JSON.parse(fs.readFileSync(atmp, 'utf8'));
for (i = 0; i < parsedVideos.videos.length; i++) {
    var tmp = parsedVideos.videos[i];
    console.log(tmp.upload_date + ' -- ' + tmp.id);
    if (!(tmp.description === undefined)) {
       //findLinks_bilibili(tmp.description,tmp.title);
       //findLinks_nicovideo(tmp.description,tmp.title);
       findLinks(tmp.description, 'http');
       //listVideos(tmp.webpage_url, tmp.id, tmp.upload_date);
    }
}

    //}

function listVideos(webpageUrl, vidId, uploadDate) {
    var compart = 'bilibili.com/video/BV';

    if (webpageUrl.includes(compart)) {
       if (webpageUrl.includes(vidId) && !(uploadDate === undefined)) {
          fs.appendFileSync('soarr.txt', webpageUrl + '\n');
       }
    }
}

function isItNumber(checkChar) {
    if (checkChar === '0' || checkChar === '1' || checkChar === '2' || checkChar === '3' || checkChar === '4' || checkChar === '5' || checkChar === '6' || checkChar === '7' || checkChar === '8' || checkChar === '9') return true;
    console.log(checkChar + ' is not an integer')
    return false;
}

function findLinks_bilibili(ogDescription, videoTitle) {
    var editedDescription = videoTitle + ' ' + ogDescription + ' ';

    var tmppp = "av";
    var textFile = 'soarr.txt'

    var linkPos = editedDescription.indexOf(tmppp);

    if (linkPos > -1) {
        while (linkPos != -1) {  /*
            var tempp1 = editedDescription.indexOf(' ', linkPos);
            var tempp2 = editedDescription.indexOf('\n', linkPos);
            
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
            }         */

            var smLink = 'av';
            var tmmmp = linkPos + 2;
            while (isItNumber(editedDescription.charAt(tmmmp))) {
                smLink = smLink + editedDescription.charAt(tmmmp);
                tmmmp++;
            }

            console.log(smLink);
            
            if (smLink.length > 2) {
               fs.appendFileSync(textFile, 'https://www.bilibili.com/video/' + smLink + '\n');

            }
            
            var tempStr2 = editedDescription.substring(linkPos);
            var temmie = tempStr2.length;
            if (temmie > 2) {
                tempStr2 = editedDescription.substring(linkPos + 2);
            }
            
            editedDescription = tempStr2;

            linkPos = editedDescription.indexOf(tmppp);
        }
    }
}

function findLinks_nicovideo(ogDescription, videoTitle) {
    var editedDescription = videoTitle + ' ' + ogDescription + ' ';

    var tmppp = "sm";
    var textFile = 'soarr.txt'

    var linkPos = editedDescription.indexOf(tmppp);

    if (linkPos > -1) {
        while (linkPos != -1) {  /*
            var tempp1 = editedDescription.indexOf(' ', linkPos);
            var tempp2 = editedDescription.indexOf('\n', linkPos);
            
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
            }         */

            var smLink = 'sm';
            var tmmmp = linkPos + 2;
            while (isItNumber(editedDescription.charAt(tmmmp))) {
                smLink = smLink + editedDescription.charAt(tmmmp);
                tmmmp++;
            }

            console.log(smLink);
            
            if (smLink.length > 2) {
               fs.appendFileSync(textFile, 'https://www.nicovideo.jp/watch/' + smLink + '\n');

            }
            
            var tempStr2 = editedDescription.substring(linkPos);
            var temmie = tempStr2.length;
            if (temmie > 2) {
                tempStr2 = editedDescription.substring(linkPos + 2);
            }
            
            editedDescription = tempStr2;

            linkPos = editedDescription.indexOf(tmppp);
        }
    }
}

function findLinks(ogDescription, searchString) {
    var editedDescription = ogDescription + ' ';
    var linkPos = editedDescription.indexOf(searchString);

    if (linkPos > -1) {
        while (linkPos != -1) {
            var textFile = 'soarr50.txt' ;

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

            var tempStr1 = editedDescription.substring(0,linkPos);
            var tempStr2 = editedDescription.substring(endOfLink);

            var linkingPark = '<a href="' + linkara + '" target="_blank">' + linkara + '</a>';

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


                 //if (alreadyDownloaded.indexOf(temperar) == -1) {


                fs.appendFileSync(textFile, 'https://www.nicovideo.jp/watch/' + temperar + '\n');
                console.log('Found ID: ' + temperar);
                linkingPark = linkingPark + '&nbsp;<code><a href="results.html?search=' + temperar + '">[Search with this ID]</a></code>';
                 //}
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
                

               // if (alreadyDownloaded.indexOf(temperar) == -1) {
                fs.appendFileSync(textFile, 'https://www.nicovideo.jp/watch/' + temperar + '\n');
                console.log('Found ID: ' + temperar);
                linkingPark = linkingPark + '&nbsp;<code><a href="results.html?search=' + temperar + '">[Search with this ID]</a></code>';
               // }
            }           */


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
                   fs.appendFileSync(textFile, 'https://bilibili.com/video/' + temperar + '\n');
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
                   fs.appendFileSync(textFile, 'https://bilibili.com/video/' + temperar + '\n');
                   console.log('Found ID: ' + temperar);
                   linkingPark = linkingPark + '&nbsp;<code><a href="results.html?search=' + temperar + '">[Search with this ID]</a></code>';
                }
            }
            
            tarkLink = "b23.tv/";
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
                   fs.appendFileSync(textFile, 'https://b23.tv/' + temperar + '\n');
                   console.log('Found ID: ' + temperar);
                   linkingPark = linkingPark + '&nbsp;<code><a href="results.html?search=' + temperar + '">[Search with this ID]</a></code>';
                }
            }

            editedDescription = tempStr1 + linkingPark;
            if (endOfLink != -1) {
                editedDescription += tempStr2;
            }
            var temmie = linkPos;

            linkPos = editedDescription.indexOf(searchString, (temmie + linkingPark.length));
        }
    }

}