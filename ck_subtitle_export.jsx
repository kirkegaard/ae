/**
 * Subtitle Exporter v0.3
 *
 * by Christian Kirkegaard
 * lowpoly.dk
 *
 * Instructions:
 * Select all comps in the project view export, run the script, and save the files as .srt
 **/

var comps = app.project.selection;
for (var x = 0; x < comps.length; x++) {

  var theComp = comps[x];
  var layers = theComp.layers;
  var tmpFile = new File(theComp.name + '.srt');
  var theFile = tmpFile.saveDlg("Save the srt file.");
  theFile.encoding = "UTF-8";

  var fps = theComp.frameRate;


  if (theFile != null) {
    theFile.open("w","TEXT","????");

    // Layer collection arrays start at 1?!
    // Probably because it stores index as key
    var item = 0;
    for (var i = layers.length; i >= 1; i--) {
      var layer = layers[i];
      if (!layer.property('Source Text')) {
        continue;
      }

      var inPoint = timeToCurrentFormat(layer.inPoint, fps);
      var outPoint = timeToCurrentFormat(layer.outPoint, fps);

      item = item+1;

      theFile.write(item);
      theFile.write("\r\n");
      theFile.write(toTimecode(inPoint, fps));
      theFile.write(" --> ");
      theFile.write(toTimecode(outPoint, fps));
      theFile.write("\r\n");
      theFile.write(layer.property("Source Text").value);
      theFile.write("\r\n\n");
    }

    theFile.close();
  }
}


// Helpers
function toTimecode(time, fps) {
  var t = time.split(':');
  for (c in t) {
    t[c] = zeroFill(2, t[c]);
  }
  //.map(function(t) { return zeroFill(2, t); });
  var f = parseInt(t[t.length-1]) * (1000 / fps);
  return t.slice(0, -1).join(':') + ',' + zeroFill(3, f);
}

function zeroFill(width, number, pad) {
  if (number === undefined) {
    return function (number, pad) {
      return zeroFill(width, number, pad);
    }
  }
  if (pad === undefined) pad = '0';
  width -= number.toString().length;
  if (width > 0) return new Array(width + (/\./.test(number) ? 2 : 1)).join(pad) + number;
  return number + '';
}
