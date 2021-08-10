// Node.js demo - YTPMV Metadata Archive
// by FinnOtaku; ver. 2021.08.10

/*
   The values of the JSON file:
   
   'videos':
        All the singular videos are stored under this value.
        This is the sole topmost value of the JSON file.
        
   'upload_date':
        The upload date of a video; formatted as YYYYMMDD (e.g. 20091224)
        The value is saved as a String, not as an Integer. Might be 'undefined' in some cases

   'id':
        The ID of a video (e.g. In 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' the ID is 'dQw4w9WgXcQ'). In case there being multiple videos by the same name, this is used to definitively differentiate them.
        
   'webpage_url':
        The direct URL of the video (e.g. Just 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')

   'title':
        The video's title/name.

   'uploader':
        The name of the channel that uploaded the video.
        
   'uploader_id':
        The ID of the channel that uploaded the video. In case there being multiple users by the same name, this is used to definitively differentiate them.
        
   'uploader_url':
        The direct URL to the channel that uploaded the video. (e.g. Just 'https://www.youtube.com/channel/UCuAXFkgsw1L7xaCfnd5JJOw')
        
   'duration':
        The duration of the video, saved in seconds. The duration is turned to HH:MM format by this script.    
        
   'description':
        The description of the video, if available. Most do not have links that are understood by HTML as-is, they are added during runtime by the script.
        
   'tags':
        The tags bundled with the video, if available.
        
   'extractor_key':
        The value that determines the source site of the video (e.g. 'Youtube', 'Niconico', etc.)

*/

// Requiring path and fs modules
const fs = require('fs');
const url = require('url');
const http = require('http');

// This is for freeing up unneeded space once a JSON file has been processed. (Optional)
// https://www.xarg.org/2016/06/forcing-garbage-collection-in-node-js-and-javascript/
function forceGC() {
   if (global.gc) {
      global.gc();
   } else {
      console.warn('No GC hook! Start your program as `node --expose-gc file.js`.');
   }
}

// This will be used to make the HTML created during runtime more comprehensible, adds a linebreak when inserted
const br = '\r\n';

console.log('Started forming the server')  ;
console.log('Loading metadata...')  ;

var parsedVideos = [];
var y;
// The JSON has been currently spliced into 20 parts: 'vids0.json' to 'vids19.json'. minY and maxY determine the part amount. The parts in question can be currently found behind the "Download JSON File". For this script to currently work these JSON files need to be in the same folder.
var minY = 0;
var maxY = 19;
for (y = minY; y <= maxY; y++) {
   var terappi = 'YTPMV Metadata Archive JSON/split_parts/vids' + y + '.json';
   console.log('Loading ' + terappi)  ;
   var teray = fs.readFileSync(terappi, 'utf8');
   console.log('Check 1')  ;
   forceGC();
   console.log('Check 2')  ;
   parsedVideos.push(JSON.parse(teray));
   console.log('Check 3')  ;
   forceGC();
   console.log('Loaded!')  ;
}
forceGC();

console.log('All metadata loaded! Sorting things out...')  ;

// The following bit will create an overarching list of entry values. Later on this will be sorted alphabetically, so the values derived from the separate JSON files will not be changed or sorted in any way. This searchVars will then be referenced when the script searches through metadata in alphabetical order, which in turn then references the unsorted metadata derived from JSON files.
var searchVars = [];
var overaro = 0;
for (y = minY; y <= maxY; y++) {
   var perryPla;

   for (perryPla = 0; perryPla < parsedVideos[y - minY].videos.length; perryPla++) {
       var pusherian = {id: overaro, vids: (y - minY), subvid: perryPla};
       overaro++;
       //console.log(pusherian);
       searchVars.push (pusherian );
   }
}

// This sorts the searchVars list by looking up the values that match the vid and subvid values coupled with each ID value
searchVars = searchVars.sort(function(a,b) {
       var tmpA = getVideo(a.id);
       var tmpB = getVideo(b.id);


       var nameA = (tmpA.title + ' ' + tmpA.id).toUpperCase();
       var nameB = (tmpB.title + ' ' + tmpB.id).toUpperCase();
       
       var dateA = tmpA.upload_date ;
       var dateB = tmpB.upload_date ;

       // DON'T UNCOMMENT THIS BIT. I wanted to test if this saves RAM but all it did was rendering the sorting function slow af and borderline useless. This remains here as a cautionary example
       //forceGC();

       if (dateA === undefined) dateA = "000000";
       if (dateB === undefined) dateB = "000000";

       var compA = dateA + ' -- ' + nameA;
       var compB = dateB + ' -- ' + nameB;
       //console.log(compA);

       if (compA < compB) {
          return 1; //nameB comes first
       }
       if (compA > compB) {
          return -1; // nameA comes first
       }
       return 0;  // names must be equal

    });

forceGC();
console.log("Yeees!");


// This was used when there was only one JSON file before
// var parsedVideos = JSON.parse(fs.readFileSync('YTPMV-2021-06-01.json', 'utf8'));


console.log('Loaded! Carbage collecting...')  ;

forceGC();

console.log('Done?');
//console.log(getVideo(10000));

const lastUpdated = '2021/06/01';
const videosPerPage = 25;
const dropboxLink = 'https://www.dropbox.com/sh/veadx97ot0pmhvs/AACiy1Pqa7dMj33v-yqG_1GYa?dl=0';
var showcasedVideos;
var nullUploaderPlaceholder = 'skaPiPiduuDelierp';

// Uploaders whose videos are either deleted or scarcely available. This adds a link to the assumed reuploads at Archive.org
const exceptionUsers = ['Rlcemaster3',
    'ARetaproductions',
    'DKCplayer',
    'KinkyOats',
    'GingpoopBR',
    'SpectraDash',
    'Arcoviso32',
    'GurchikAlt',
    'marcelozcanarioa',
    'MrXarlable',
    'ProPantsuWrestler',
    'faugapeengana',            // Tris AF
    'gcon1350',                 // Tris
    'RP1234BITCH',              // Neavy
    'SiemaTuRusek',             // +TEK's alt
    'TerraMr99',                // Terrablade('s old account?)
    'TimeLegacy',               // yasendai
    'loquenderabrenda',         // Br3ND4
    'INTELSPARTA',              // Tea
    '123benjl123',              // Rosie
    'MineTakkunCH',             // Yuicheon Express
    'UCRwd3zsU0hwQBSrZaz-qGWA',
    'UClzjW7WE8o-ZrJAJ4nIBWcw', // Reuploader
    'UC3rfEppAd8qeBfyMF253B6A', // Greg
    'UCkaAQFfaaOmaxx_LRAA8Hzg', // I YTPMV Everything
    'UConHV3bogSwNmfWx6GZmhBQ', // TastyFlash =>
    'UCN91ZeOvrfcAqkG0vffP73g', // <= Milly
    'UCCjfUXE45ige09sjt1AsQ7A', // SakiZ
    'UCeLlhnvwBA_2EJu_1jD3Yxg', // Lorne
    'UC5DvrQXnfIqcn2bzfjqM5Uw', // Lorne's alt
    'UCRGSpid5qtmaQ_Em8IzEKjg', // nankanohito
    'UC6FQ1CCsTVdr5DrE4JXOVUA', // Night 0125
    'UCiGSlqsZgLw_hQeajPRJL6w', // Pkeneras
    'UCdCGgpm7a1LbaZHiQbrg2Dw', // Zuzusi / voxel (Kem's alt)
    'UC_welmHirHnI7IqbmYX7fcw', // ryuya akabane
    'UCBtFPFHOy6kDFfzN_NchJYQ', // Camille
    'UCNtp6pUSuXrjPLIkrhIch6A', // akindo
    'UCK-Kd5I0rvdpprAyis9UeSg', // Jake
    'UCIHiaW0aBQfYc7gOLvHvTdA', // Senji
    'UCL_nFJ4ItFUd9sXKHERKjCA', // passantea
    'UCP3oP9jNvMeGT9qNVr0eX5Q', // umi nae
    'UCK-ps_sc5rY7Xt7j1hTtXjw', // Lee (male sign)
    'UCimBvWLwntbNAKxw_7gufBw', // Detrimental Derivation
    'UCNVTR24Mzg7_3HrgmX9bUhQ', // Fasolt Alt
    'UC1qzdvmhmxFVBjbvfCowgtQ', // Alex2
    'UC4ft1MHe2gpFFWVstwfA5Hw', // Pac Man
    'UClobvUCGR2VUkBlN0ax570g'];// pongayu

// Get video based on the order in the searchVars list, NOT based on ID.
function getVideo(orderNumber) {
   var terpm = searchVars[orderNumber];
   //console.log(terpm);
   return parsedVideos[terpm.vids].videos[terpm.subvid];
}

// This will create the HTML compatible results page to be shown for the browser. A string value equal to nullUploaderPlaceholder value will be passed through searchUploaderId if the page were to show results of the search word only.
function showList(searchWord, searchUploaderId, page) {
    var searchingForUploaderToo = !(searchUploaderId.localeCompare(nullUploaderPlaceholder) == 0);
    console.log('Searching: ' + searchWord);

    // These will create the appropriate type of list based on the search values. The list will be saved in the global showcasedVideos variable and includes ALL videos that fit the search values.
    if (searchingForUploaderToo) {
       createListForUploader(searchWord,searchUploaderId);
    }
    else {
       createList(searchWord);
    }

    var videoList = '';

    var totalPages = 1;
    while ((totalPages * videosPerPage) <= showcasedVideos.length) {
       totalPages++;
    }
    
    var currentPage = page;
    if (page > totalPages) currentPage = totalPages;
    if (page < 1) currentPage = 1;

    var startValue = videosPerPage * (currentPage - 1);
    var endValue = videosPerPage * currentPage;
    if (endValue > showcasedVideos.length) endValue = showcasedVideos.length;

    var linkThing = '';

    // Writing page links on top of page
    if (totalPages > 1) {
         linkThing += '<hr/>';
         var keepGoing = true;

         if (currentPage != 1) {
             linkThing += '<a href="results.html?search=' + searchWord + '&page=1';
             if (searchingForUploaderToo) {
                 linkThing += '&uploader_id=' + searchUploaderId;
             }
             linkThing += '">&#171;&nbsp;1</a> &#9674; ' + br;
         }

         if (currentPage == 1) {
             linkThing += '<b>&#139;1&#155;</b> &#9674; ' + br;
             if (totalPages == 2) {
                linkThing += '<a href="results.html?search=' + searchWord + '&page=2';
                if (searchingForUploaderToo) {
                 linkThing += '&uploader_id=' + searchUploaderId;
                }  
                linkThing += '">2&nbsp;&#187;</a>' + br;
                keepGoing = false;
             }
             if (keepGoing && totalPages > 2) {
                linkThing += '<a href="results.html?search=' + searchWord + '&page=2';
                if (searchingForUploaderToo) {
                   linkThing += '&uploader_id=' + searchUploaderId;
                }
                linkThing += '">2&nbsp;&#155;</a> &#9674; ' + br;
                linkThing += '<a href="results.html?search=' + searchWord + '&page=' + totalPages;
                if (searchingForUploaderToo) {
                   linkThing += '&uploader_id=' + searchUploaderId;
                }
                linkThing +='">' + totalPages + '&nbsp;&#187;</a>' + br;
                keepGoing = false;
             }
         }

         if (keepGoing && currentPage == 2 && totalPages == 2) {
             linkThing += '<b>&#139;2&#155;</b>';
             keepGoing = false;
         }

         if (keepGoing && currentPage == totalPages) {
             linkThing += '<a href="results.html?search=' + searchWord + '&page=' + (totalPages - 1);
             if (searchingForUploaderToo) {
                 linkThing += '&uploader_id=' + searchUploaderId;
             }
             linkThing += '">&#139;&nbsp;' + (totalPages - 1) + '</a> &#9674; ' + br;
             linkThing += '<b>&#139;' + totalPages + '&#155;</b>';
             keepGoing = false;
         }
         
         if (keepGoing) {
             var previousPage = currentPage - 1;
             var nextPage = currentPage - 1 + 2;
             if (currentPage > 2) {
                linkThing += '<a href="results.html?search=' + searchWord + '&page=' + previousPage;
                if (searchingForUploaderToo) {
                    linkThing += '&uploader_id=' + searchUploaderId;
                }
                linkThing +='">&#139;&nbsp;' + previousPage + '</a> &#9674; ' + br;
             }
             linkThing += '<b>&#139;' + currentPage + '&#155;</b> &#9674; ' + br;
             if (nextPage != totalPages) {
                linkThing += '<a href="results.html?search=' + searchWord + '&page=' + nextPage;
                if (searchingForUploaderToo) {
                    linkThing += '&uploader_id=' + searchUploaderId;
                }
                linkThing += '">' + nextPage + '&nbsp;&#155;</a> &#9674; ' + br;
             }
             linkThing += '<a href="results.html?search=' + searchWord + '&page=' + totalPages;
             if (searchingForUploaderToo) {
                    linkThing += '&uploader_id=' + searchUploaderId;
                }
             linkThing += '">' + totalPages + '&nbsp;&#187;</a>' + br;
         }
    }
    
    videoList += linkThing;

    videoList += '<br/>Search word: "' + unableCodingInSearch(searchWord) + '"';

    if (searchingForUploaderToo) {
       videoList += '<br/>Searched Uploader ID: "' + unableCodingInSearch(searchUploaderId) + '"';
    }

    // This will be used to create the entries for the page
    for (i = startValue; i < endValue; i++) {
       videoList += '<hr/><div>' + br;
       var listedVideo = getVideo(showcasedVideos[i]);
       videoList += '<b>' + listedVideo.title + '</b> (' + formatDuration(listedVideo.duration) +')<br/>' + br;
       videoList += '<code><a href=\"' + listedVideo.webpage_url + '\" target=\"_blank\">' + listedVideo.webpage_url + '</a></code>';

       // This will determine if a link to a supposed Archive.org reupload will be added
       if (checkForAcrhiveOrgLink(listedVideo))  {
       
            // Exception for DKCplayer     
            if (isTheUserSame(listedVideo,'DKCplayer')) {
                videoList += '&nbsp;&#124; <a href=\"https://archive.org/details/yt-DKCplayer_201509\">(Archive.org reupload)</a>';
            }
            // Exception for KinkyOats
            else if (isTheUserSame(listedVideo,'KinkyOats')) {
                videoList += '&nbsp;&#124; <a href=\"https://archive.org/details/183b1uU3XIELr6c\">(Archive.org reupload)</a>';
            
            }
            // Exception for HyperFlameXLI
            else if (isTheUserSame_String(listedVideo.uploader,'HyperFlameXLI')) {
                videoList += '&nbsp;&#124; <a href=\"https://archive.org/details/HyperFlameXLI_Archive\">(Archive.org reupload)</a>'; 
            }
            // For everyone else
            else {
                videoList += '&nbsp;&#124; <a href=\"https://archive.org/details/youtube-' + listedVideo.id + '\">(Archive.org reupload)</a>';
            }
       }
       
       videoList += '<br/><br/>' + br;
       
       var uploader_Str = '<a href=\"' + listedVideo.uploader_url + '\" target=\"_blank\">' + listedVideo.uploader + ' [<code>' + listedVideo.uploader_id + '</code>]</a>';

       if (listedVideo.uploader == null && listedVideo.uploader_id == null) {
          uploader_Str = '<code>undefined</code>';
       } else if (listedVideo.uploader_id == null) {
          uploader_Str = listedVideo.uploader;
       }

       videoList += 'Uploader: ' + uploader_Str + '<br/>' + br;
       videoList += 'Release date: ' + listedVideo.upload_date + '<br/><br/>' + br;
       
       if (!(listedVideo.description === undefined)) {
         videoList += editDescription(listedVideo.description, listedVideo.extractor_key) + br;
       } else {
           videoList += '<code>[No description]</code>' + br;
       }
       
       if (!(listedVideo.tags === undefined)) {
         var tagN;
         var thereAreNoTags = true;
         videoList += '<br/><br/><code><b>Tags:</b> ';
         try {
         for (tagN = 0; tagN < listedVideo.tags.length; tagN++) {
           thereAreNoTags = false;  
           videoList += '<a href=\"results.html?search=' + listedVideo.tags[tagN] + '\">' + listedVideo.tags[tagN] + '</a> ';
         }
         } catch(err) {
            thereAreNoTags = true; 
         }
         if (thereAreNoTags) {
             videoList += '&#60;NONE&#62;';
         }
         videoList += '</code>';
       }

       if (!searchingForUploaderToo) {
       videoList += br + '<br/><br/><a href="results.html?uploader_id=' + listedVideo.uploader_id + '">Search more videos from <code>' + listedVideo.uploader + '</code></a><br/>' + br;
       videoList += '<a href="results.html?search=' + searchWord + '&uploader_id=' + listedVideo.uploader_id + '">Search more videos from <code>' + listedVideo.uploader + '</code> with the current search word</a>';
       }
       
       videoList += '</div>';

    }
    
    videoList += linkThing;

    return videoList;
}

// Crude unabling of running code through the searched string
function unableCodingInSearch(searchWord) {
    var searchChar = '<';
    var replaceCode = '&#60;';

    if (searchWord.indexOf(searchChar) == -1) {
        return searchWord;
    }
    
    var temppo = searchWord;
    
    while (temppo.indexOf(searchChar) != -1) {
        var charPlace = temppo.indexOf(searchChar);
        var tmp1 = '';
        if (charPlace != 0) {
            tmp1 = temppo.substring(0,charPlace);
        }
        var tmp2 = temppo.substring(charPlace + 1);
        
        temppo = tmp1 + replaceCode + tmp2;
    }

    return temppo;
}

// This checks if a video's author is in the exceptionUsers list. Returns 'true' if they are.
function checkForAcrhiveOrgLink(videoInfo) {

    var exp;

    for (exp = 0; exp < exceptionUsers.length; exp++) {
        if (isTheUserSame(videoInfo,exceptionUsers[exp])) {
            return true;
        }
    }

    return false;
}

function isTheUserSame(videoInfo, uploaderName) {
    if (videoInfo.uploader_id == null) {
        return false;
    }

    return isTheUserSame_String(videoInfo.uploader_id.trim(), uploaderName);
}

function isTheUserSame_String(videoUploader, uploaderName) {
    return (videoUploader.localeCompare(uploaderName) == 0);
}

// Turns the seconds of video duration into more comprehensible format, goes up to hours (HH:MM:SS)
function formatDuration(justSeconds) {
    var minute = 60;
    
    var mins = 0;
    var secs = justSeconds;
    
    while (secs >= minute) {
        mins++;
        secs = secs - minute;
    }
    
    if (secs < 10 && mins < 60) {
        return mins + ':0' + secs;
    }
    
    if (mins < 60) {
        return mins + ':' + secs;
    }
    
    var hours = 0;
    
    while (mins >= minute) {
        hours++;
        mins = mins - minute;
    }
    
    var retStr = hours + ':';
    
    if (mins < 10) {
        retStr = retStr + '0';
    }
    
    retStr = retStr + mins + ':';
    
    if (secs < 10) {
        retStr = retStr + '0';
    }
    
    retStr = retStr + secs;
    
    return retStr;
}

// Adds HTML compatible links in the description as well as adds (Search with this ID) links. Returns altered description. This is ran through editDescription(ogDescription, extractorKey) function.
function addLinks(ogDescription, searchString) {
    var editedDescription = ogDescription;
    var linkPos = editedDescription.indexOf(searchString);

    if (linkPos > -1) {
        while (linkPos != -1) {
            var tempp1 = editedDescription.indexOf(' ', linkPos);
            var tempp2 = editedDescription.indexOf('\n', linkPos);
            //console.log(tempp1 + ' -- ' + tempp2);
            var endOfLink = tempp1;
            if ((tempp2 != -1 && tempp2 < tempp1) || (tempp2 > tempp1 && tempp1 == -1)) {
                endOfLink = tempp2;
            }
            var linkara = '';

            if (endOfLink == -1) {
                linkara = editedDescription.substring(linkPos);
            } else {
                linkara = editedDescription.substring(linkPos,endOfLink);
            }

            var tempStr1 = editedDescription.substring(0,linkPos);
            var tempStr2 = editedDescription.substring(endOfLink);

            var linkingPark = '<a href="' + linkara + '" target="_blank">' + linkara + '</a>';


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
            }
            
            tarkLink = "nico.ms/";
            if (linkara.indexOf(tarkLink) > -1) {
                var temperar = linkara.substring((linkara.indexOf(tarkLink) + tarkLink.length));
                if (temperar.indexOf('?') > -1) {
                   temperar = temperar.substring(0, temperar.indexOf('?'));
                }
                if (temperar.indexOf(')') > -1) {
                   temperar = temperar.substring(0, temperar.indexOf(')'));
                }
                
                linkingPark = linkingPark + '&nbsp;<code><a href="results.html?search=' + temperar + '">[Search with this ID]</a></code>';
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
                
                linkingPark = linkingPark + '&nbsp;<code><a href="results.html?search=' + temperar + '">[Search with this ID]</a></code>';
            }
            
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
                
                linkingPark = linkingPark + '&nbsp;<code><a href="results.html?search=' + temperar + '">[Search with this ID]</a></code>';
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
                
                linkingPark = linkingPark + '&nbsp;<code><a href="results.html?search=' + temperar + '">[Search with this ID]</a></code>';
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
                
                linkingPark = linkingPark + '&nbsp;<code><a href="results.html?search=' + temperar + '">[Search with this ID]</a></code>';
            }


            editedDescription = tempStr1 + linkingPark;
            if (endOfLink != -1) {
                editedDescription += tempStr2;
            }
            var temmie = linkPos;

            linkPos = editedDescription.indexOf(searchString, (temmie + linkingPark.length));
        }
    }
    
    return editedDescription;
}

// This will be used to make the description more HTML compatible, most notably by adding line breaks. Also identifies and adds HTML compatible links
function editDescription(ogDescription, extractorKey) {
    var editedDescription = ogDescription;
    
    if (ogDescription == null) {
        return "<code>[No description]</code>";
    }
    
    // Most of Niconico videos are already HTML compatible with hyperlinks, so descriptions from that site won't be edited by this link adding function
    if (extractorKey.indexOf("Niconico") == -1) {
        // These two bugged out the links in some cases, so I settled with the string that all properly written links would share
        // editedDescription = addLinks(editedDescription,'https://');
        // editedDescription = addLinks(editedDescription,'http://');
        editedDescription = addLinks(editedDescription,'http');
    }

    // This rest of this function will add line breaks if needed
    var brPos = editedDescription.indexOf('\n');

    if (brPos == -1) {
        return editedDescription;
    }

    while (brPos != -1) {
        var temp1 = editedDescription.substring(0,brPos);
        var temp2 = editedDescription.substring(brPos);
        editedDescription = temp1 + '<br/>' + temp2;
        var temp3 = brPos + 6;
        brPos = editedDescription.indexOf('\n', temp3);
    }
    
    return editedDescription;
}

// Creates a list of numbers that will refer to searchVars values. The values will refer to number of order, not the IDs. Intended just for search word
function createList(searchWord) {
    showcasedVideos = [];
    
    // For making a list
    listTmp = ' ';

    for (i = 0; i < searchVars.length; i++) {
       var compareVid =  parsedVideos[searchVars[i].vids].videos[searchVars[i].subvid];
       var compareStr =  compareVid.title + ' ' + compareVid.id + ' ' + compareVid.uploader + ' ' + compareVid.uploader_id + ' ' + compareVid.upload_date;
       // This has been added because Bilibili IDs exclude the first two letters when the metadata is saved in JSON. Makes sure that searching with full ID brings up the appropriate videos.
       if (compareVid.extractor_key.indexOf("BiliBili") == 0) {
           compareStr += ' av' + compareVid.id + ' BV' + compareVid.id;
       }
       if (!(compareVid.description === undefined)) {
          compareStr += ' ' + compareVid.description;
       }
       if (!(compareVid.tags === undefined)) {
          try {
          var tagN;
          for (tagN = 0; tagN < compareVid.tags.length; tagN++) {
              compareStr += ' ' + compareVid.tags[tagN];
          }
          } catch(err) {
              compareStr += ' ';
          }
       }

       if (compareStr.toLowerCase().trim().indexOf(searchWord.toLowerCase().trim()) > -1) {
          showcasedVideos.push(i);
          // For list
          listTmp = compareVid.webpage_url + '\n' + listTmp ;
          //listTmp = listTmp + '\n' + compareVid.webpage_url ;
       }
    }
    // This is for video download purposes, not necessary to run the database. This creates a list of URLs based on the search results. (e.g. searching for 'YTPMV' creates a list of URLs for videos that have this search word in them)
    // fs.writeFileSync('searchingList1.txt', listTmp);
}

// Creates a list of numbers that will refer to searchVars values. The values will refer to number of order, not the IDs. Intended for both search word and uploader
function createListForUploader(searchWord,uploaderId) {
    showcasedVideos = [];
    
    for (i = 0; i < searchVars.length; i++) {
       var compareVid =  parsedVideos[searchVars[i].vids].videos[searchVars[i].subvid];

       var tmp1 = compareVid.uploader_id + ' '; // Seems like some saved uploader_id values are undefined or something similar, VITAL that there is an empty string to not make the site glitch out
       var tmp2 = uploaderId.trim();
       if (tmp1.trim().localeCompare(tmp2) != 0) continue;
       
       if (searchWord.trim().length == 0) {
          showcasedVideos.push(i);
          continue;
       }
        
       var compareStr =  compareVid.title + ' ' + compareVid.id + ' ' + compareVid.uploader + ' ' + compareVid.uploader_id + ' ' + compareVid.upload_date;
       if (!(compareVid.description === undefined)) {
          compareStr += ' ' + compareVid.description;
       }
       if (!(compareVid.tags === undefined)) {
           try {
          var tagN;
          for (tagN = 0; tagN < compareVid.tags.length; tagN++) {
              compareStr += ' ' + compareVid.tags[tagN];
          } 
               
           } catch(err) {
              compareStr += ' '; 
           }
           
       }

       if (compareStr.toLowerCase().trim().indexOf(searchWord.toLowerCase().trim()) > -1) {
          showcasedVideos.push(i);
       }
    }
}

//console.log('List done');

// This is used to create the index.html page
function htmlStrIndex(querie) {
  var htmlStrIndex = '<hr/><p>' + br + 'Search for videos:' + br;
 
  if ('/YTPMV_Database'.localeCompare(querie) == 0) {
     htmlStrIndex += '<form action="YTPMV_Database/results.html" method="GET">';
  } else {
     htmlStrIndex += '<form action="results.html" method="GET">'; 
  }
 
  /* This works too
  if ('/YTPMV_Database/'.localeCompare(querie) == 0 || '/YTPMV_Database/index.html'.localeCompare(querie) == 0) {
     htmlStrIndex += '<form action="results.html" method="GET">';
  } else {
     htmlStrIndex += '<form action="YTPMV_Database/results.html" method="GET">';
  } */
 
  htmlStrIndex +=  br + '<input type="text" name="search" />&nbsp;' + br;
  htmlStrIndex += '<input type="submit" value="Search" />' + br;
  htmlStrIndex += '</form><br/>' + br + '</p>' + br + '</body>' + br + '</html>';
  
  return htmlStrIndex;
}

// This will be used at the beginning of every HTML page related to this database
var htmlStrBegin = '<!DOCTYPE html>' + br;
htmlStrBegin += '<html>' + br;

htmlStrBegin += '<head><meta http-equiv="Content-Type" content="text/html; charset=utf-8">' + br;
//htmlStrBegin += '<link rel="stylesheet" href="dark_theme_style.css">' + br;
htmlStrBegin += '<style>body { background-color: #292929; color: white; } a:link { color: #788BFF; } a:visited { color: #9BB1FF; } a:hover { color: #BFD7FF; } a:active { color: #E2FDFF; }</style>'+ br;
htmlStrBegin += '<title>Node.js demo - YTPMV Metadata Archive</title>' + br;
htmlStrBegin += '</head>' + br;

htmlStrBegin += '<body>' + br;
htmlStrBegin += '<div><h2>Node.js demo - YTPMV Metadata Archive</h2>Last updated: ' + lastUpdated + '&nbsp;&#124; <a href="' + dropboxLink + '" target="_blank">Download JSON File</a></div>' + br;
// Hosted by FinnOtaku &#151; 

// This creates the pages of the database
// If the code is ran locally, the site can be accessed through "http://localhost:3535/YTPMV_Database/index.html"
http.createServer(function (req, res) {
  var q = url.parse(req.url, true);
  
  // For potential debugging purposes
  console.log(q.pathname);
  console.log(q.query);
  console.log(q.search);
  console.log(q.query.search);
  console.log(q.query.search === undefined);
  console.log(q.query.page);
  console.log(q.query.page === undefined);
  console.log(q.query.uploader_id);
  console.log(q.query.uploader_id === undefined);
  
  console.log(showcasedVideos);

  var searchingFor = q.query.search;
  var searchWordPresent = !(q.query.search === undefined);
  if (!searchWordPresent) searchingFor = ' ';

  var pageNumber = q.query.page;
  var pageListed = !(q.query.page === undefined);
  if (!pageListed) pageNumber = 1;
  if (pageListed) {
       if (!isFinite(pageNumber)) {
          console.log('Page set to 1')
          pageNumber = 1;
       }
  }
  console.log('Page number is ' + pageNumber);

  var fromUploaderId = q.query.uploader_id;
  var uploaderIdListed = !(q.query.uploader_id === undefined);
  if (!uploaderIdListed) fromUploaderId = nullUploaderPlaceholder;

  const htmPage = '/YTPMV_Database';

  // Creates the page for results.html along with the appropriate lists
  if ((htmPage + '/results.html').localeCompare(q.pathname) == 0) {
     res.writeHead(200, {'Content-Type': 'text/html'});
 
     var htmlStrSearch = '<hr/><p>' + br + 'Search for videos:' + br;
     htmlStrSearch += '<form action="results.html" method="GET">';
     htmlStrSearch +=  br + '<input type="text" name="search" />&nbsp;' + br;
     htmlStrSearch += '<input type="submit" value="Search" />' + br;
     htmlStrSearch += '</form>';

     res.write(htmlStrBegin);
     res.write(htmlStrSearch);
     res.write(showList(searchingFor, fromUploaderId, pageNumber));
     res.write('</body></html>');

     res.end();
  }
  
  // Creates the index of the database
  if (htmPage.localeCompare(q.pathname) == 0 || (htmPage + '/').localeCompare(q.pathname) == 0 || (htmPage + '/index.html').localeCompare(q.pathname) == 0) {
     res.writeHead(200, {'Content-Type': 'text/html'});

     res.write(htmlStrBegin);
     res.write(htmlStrIndex(q.pathname));

     res.end();
  } 
  
  else {
      console.log('Tried to get to: ' +  q.pathname);
      res.writeHead(404, {'Content-Type': 'text/html'});
      res.end("404 Not Found. Tried to get to: " +  q.pathname);
  }

// This is the port that the server will use
}).listen(3535);