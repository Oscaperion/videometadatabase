var fs = require('fs');

const tagsList = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/tags.json', 'utf8'));

var maxY = 202312;
var minY = 200401;
var tagsAll = [];
{
  let parsedVideos = [];

  for (let y = maxY; y >= minY; y--) {
                //F:\Dropbox\NodeJS\YTPMV Metadata Archive JSON\split_parts2
   let terappi = 'F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts2/vids' + y + '.json';
   //let terappi = 'vidJson2/vids' + y + '.json';
   console.log('Loading ' + terappi)  ;
   try {
      parsedVideos.push(...JSON.parse(fs.readFileSync(terappi, 'utf8')));
      console.log('Loaded!')  ;
   } catch(e) {
      //console.error(`${e.name}: ${e.message}`);
      console.log("Oh wait, that doesn't exist");
   }
  }

  for (let x = 0; x < parsedVideos.length; x++) {
    let tmp1 = parsedVideos[x].tags;

    if (tmp1 === undefined || tmp1 === null || tmp1.length === 0) continue;
    console.log("Handling: " + parsedVideos[x].upload_date + " --- " + parsedVideos[x].id) ;
   
    tagsAll.push(...tmp1);
  }
}

var tagsComp = {};

let numm = 0;
tagsAll.forEach(tag => {
  let tmpTag = tag.toLowerCase().trim();
  //let tmpTag = '';
  //if (typeof tag === "string") tmpTag = tag.toLowerCase().trim();
  //else tmpTag = tagsList[tag];
  numm++;

  if (tagsComp[tmpTag]) {
    tagsComp[tmpTag]++;
  } else {
    tagsComp[tmpTag] = 1;
    console.log("Added: " + tmpTag);
  }
  console.log(numm + " / " + tagsAll.length);
});

         /*
var tagsComp = [];

for (let j = 0; j < tagsAll.length; j++) {
      let tmp2 = tagsComp.find(ent => ent.tag === tagsAll[j].toLowerCase().trim());
      if (tmp2 === undefined) {
          tagsComp.push({"tag":tagsAll[j].toLowerCase().trim(),"amount":1});
          console.log("Added: " + tagsComp[tagsComp.length - 1].tag);
      } else {
          tmp2.amount = tmp2.amount + 1;
      }
      console.log(j + " / " + tagsAll.length + " -- Unique tags amount: " + tagsComp.length);
}      */

//console.log(tagsComp);

    /*
var tagsComp2 = [];

for (let k = 0; k < tagsComp.length; k++) {
   if (tagsComp[k].amount > 500) tagsComp2.push(tagsComp[k].tag);
}       */

var tmpTaags = Object.keys(tagsComp);

var tagsComp2 = [];

for (let k = 0; k < tmpTaags.length; k++) {
   if (tagsComp[tmpTaags[k]] > 100) tagsComp2.push(tmpTaags[k]);
}
console.log(tagsComp2);

fs.writeFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/tags.json', JSON.stringify(tagsComp2));