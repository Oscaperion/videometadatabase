//requiring path and fs modules
let path = require('path');
let fs = require('fs');

// let userIds = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/niconicoUserList.json', 'utf8'));

let jsonLocation = "F:/Dropbox/NodeJS/massJsonTesting65/";
let comments = [];

fs.readdir(jsonLocation, (err, files) => {
   if (err) throw err;
   // localeCompare is meant to put the files in a most-to-least-recent order
   files.forEach(fileName => {

      console.log(fileName);

      try {
         let jsonFile = JSON.parse(fs.readFileSync(jsonLocation + fileName, 'utf8'));
         //let jsonFile = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/massJsonTesting65/Q16KpquGsIc.info.json', 'utf8'));
         console.log("Loa");

         //if (!!jsonFile.comments) {

         //console.log(jsonFile.comments);
         let jsonStats = fs.statSync(jsonLocation + fileName, 'utf8');
         console.log('Loaded!');
         console.log(jsonStats);
         
         let newEnt = {};
         newEnt["id"] = jsonFile.id;
         newEnt["fetchTimestamp"] = jsonStats.birthtimeMs;
         newEnt["comments"] = jsonFile.comments;

         // console.log(jsonStats.birthtimeMs / 1000);

         if (!!jsonFile.comments && jsonFile.comments.length > 0) comments.push(newEnt);

         //console.log(newEnt);
         console.log(jsonFile.comment_count);
         console.log(comments.length);
         // }

      } catch(e) {
         console.log("ERROR! FILE COULDN'T BE READ!");
      }


   });
   console.log("Dun");
   fs.writeFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/commentList.json', JSON.stringify(comments));
   
   // console.log(comments);
});



