//requiring path and fs modules
var path = require('path');
var fs = require('fs');
const url = require('url');
const http = require('http');

var ignoreUsers = JSON.parse(fs.readFileSync('ignoreChannels.json', 'utf8'));

var toBeSortedList = [];

for (var yy = 2023; yy >= 2004; yy--) {
  for (var mm = 12; mm >= 1; mm--) {
    var mm_tmp = mm + '';
    if (mm < 10) {
       mm_tmp  = '0' + mm;
    }
    var mm_tmp2 = (mm + 1) + '';
    if ((mm + 1) < 10) {
       mm_tmp2 = '0' + (mm + 1);
    }

    var minDate = '' + yy + mm_tmp + '00';
    var maxDate = '' + yy + mm_tmp2 + '00';
    console.log("Videos from period: " + yy + mm_tmp);

    for (var tu = 38; tu >= 0; tu--) {
        console.log("Checking vids" + tu);
       //var videoitaFile = fs.readFileSync('videoita.json', 'utf8');
       //var parsedVideos = JSON.parse(videoitaFile);
       var parsedVideos = JSON.parse(fs.readFileSync(('YTPMV Metadata Archive JSON/split_parts/vids' + tu + '.json'), 'utf8'));
       var lrn = parsedVideos.videos.length;
       for (var oi = 0; oi < lrn; oi++) {
           if (parsedVideos.videos[oi].extractor_key === "BiliBili" && parsedVideos.videos[oi].upload_date === undefined) {
              // console.log("Bilibili with undefined release date: not adding");
              continue;
           }

           if (parsedVideos.videos[oi].upload_date > minDate && parsedVideos.videos[oi].upload_date < maxDate)
           {
             
               var tmpVid =  parsedVideos.videos[oi];
               var addForSure = true;
               for (var lkj = 0; lkj < ignoreUsers.length; lkj++) {
                   if (tmpVid.uploader_id === ignoreUsers[lkj]) {
                       addForSure = false;
                       break;
                   }
               }

               if (tmpVid.extractor_key === "Twitter") {
                  var truId = tmpVid.webpage_url.substring(tmpVid.webpage_url.indexOf('/status/') + 8);
                  tmpVid.id = truId;
                  tmpVid.title = '';
               }

               if (tmpVid.extractor_key === "Youtube" || tmpVid.extractor_key === "Niconico" || tmpVid.extractor_key === "Twitter") {
                  delete tmpVid["webpage_url"];
               }
               
               if (tmpVid.extractor_key === "BiliBili" && tmpVid.id.search("_part") > 0) {
                  var teypi = tmpVid.id.indexOf("_part");
                  var teyp2 = tmpVid.id.substring(teypi);
                  
                  if (teyp2.length === 6) {
                      if (!(teyp2 === "_part1")) {
                          addForSure = false;
                          console.log("Bilibili non page 1 video: " + tmpVid.id);
                      }
                  } else {
                     addForSure = false;
                     console.log("Bilibili non page 1 video: " + tmpVid.id);
                  }

               } else if (tmpVid.extractor_key === "BiliBili" && tmpVid.id.search("_p") > 0) {
                  var teypi = tmpVid.id.indexOf("_p");
                  var teyp2 = tmpVid.id.substring(teypi);
                  
                  if (teyp2.length === 3) {
                      if (!(teyp2 === "_p1")) {
                          addForSure = false;
                          console.log("Bilibili non page 1 video: " + tmpVid.id);
                      }
                  } else {
                     addForSure = false;
                     console.log("Bilibili non page 1 video: " + tmpVid.id);
                  }

               }

               if (addForSure) {
                  console.log("Found: " + tmpVid.upload_date + " -- " + tmpVid.id);
                  toBeSortedList.push(tmpVid);
               } else {
                  console.log("Ignoring: " + tmpVid.upload_date + " -- " + tmpVid.id + " (Blacklisted user)");
               }
           }
       }
    }

    // First, we sort by title
    toBeSortedList = toBeSortedList.sort(function(a,b) {
       /*
       var nameA = a.title.toUpperCase(); // ignore upper and lowercase
       var nameB = b.title.toUpperCase(); // ignore upper and lowercase
       */
                    /*
       var nameA = a;
       var nameB = b;

       if (nameA === undefined) nameA = "undefined";
       if (nameB === undefined) nameB = "undefined";

       nameA = nameA.title.toUpperCase();
       nameB = nameB.title.toUpperCase();
                      */
                      
       var nameA = (a.title + ' ' + a.id).toUpperCase();
       var nameB = (b.title + ' ' + b.id).toUpperCase();

       if (nameA < nameB) {
          return -1; //nameA comes first
       }
       if (nameA > nameB) {
          return 1; // nameB comes first
       }
       return 0;  // names must be equal

    });
    console.log("Sorting 1");
    // Then by upload date
    toBeSortedList = toBeSortedList.sort(function(a,b) {
       var nameA = a.upload_date ;
       var nameB = b.upload_date ;
       
       if (nameA === undefined) nameA = "0";
       if (nameB === undefined) nameB = "0";

       if (nameA < nameB) {
          return 1; //nameB comes first
       }
       if (nameA > nameB) {
          return -1; // nameA comes first
       }
       return 0;  // names must be equal

    });
    console.log("Sorting 2");

    if (toBeSortedList.length > 0) {
      var miii = 'YTPMV Metadata Archive JSON/split_parts2/vids' + yy + mm_tmp + '.json';
      //fs.writeFileSync(miii, JSON.stringify({videos: toBeSortedList}));
      fs.writeFileSync(miii, JSON.stringify(toBeSortedList));
    } else {
      console.log("Nothing found on " + yy + mm_tmp);
    }
    toBeSortedList = [];
}
    }