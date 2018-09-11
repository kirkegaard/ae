/**
 * Subtitle Exporter v0.1
 *
 * by Christian Kirkegaard
 * lowpoly.dk
 *
 * Instructions:
 * Select all the Text Layers you want to export, run the script, and save the file as .srt
 **/

var theComp = app.project.activeItem;
var layers = theComp.selectedLayers;
var theFile = File.saveDialog("Save the srt file.", "untitled.srt", "TEXT srt");

var fps = theComp.frameRate;

if (theFile != null) {
  theFile.open("w","TEXT","????");

  for (var i = 0; i < layers.length; i++) {
    var layer = layers[i];
    var inPoint = timeToCurrentFormat(layer.inPoint, fps);
    var outPoint = timeToCurrentFormat(layer.outPoint, fps);

    theFile.write(i+1);
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
