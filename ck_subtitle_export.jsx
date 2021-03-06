/**
 * Subtitle Exporter v0.5
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
  var tmpFile = new File("~/Desktop/" + theComp.name + ".srt");
  var theFile = tmpFile.saveDlg("Save the srt file.");
  theFile.encoding = "UTF-8";
  theFile.lineFeed = "Windows";

  var fps = theComp.frameRate;

  if (theFile != null) {
    theFile.open("w", "TEXT", "????");

    // Layer collection arrays start at 1?!
    // Probably because it stores index as key
    var item = 0;
    for (var i = layers.length; i >= 1; i--) {
      var layer = layers[i];
      if (!layer.property("Source Text")) {
        continue;
      }

      var inPoint = timeToCurrentFormat(layer.inPoint, fps);
      var outPoint = timeToCurrentFormat(layer.outPoint, fps);

      item = item + 1;

      theFile.writeln(item);
      theFile.writeln(
        toTimecode(inPoint, fps) + " --> " + toTimecode(outPoint, fps)
      );
      theFile.writeln(layer.property("Source Text").value);
      theFile.writeln("");
    }

    theFile.close();
  }
}

// Helpers
function toTimecode(time, fps) {
  var t = time.split(":");
  for (var c = 0; c < t.length; c++) {
    t[c] = zeroFill(2, t[c]);
  }
  var f = parseInt(t[t.length - 1]) * (1000 / fps);
  return t.slice(0, -1).join(":") + "," + zeroFill(3, f);
}

function zeroFill(width, number, pad) {
  if (number === undefined) {
    return function(number, pad) {
      return zeroFill(width, number, pad);
    };
  }
  if (pad === undefined) pad = "0";
  width -= number.toString().length;
  if (width > 0)
    return new Array(width + (/\./.test(number) ? 2 : 1)).join(pad) + number;
  return number + "";
}
