/**
 * Subtitle Importer v0.2
 *
 * by Christian Kirkegaard
 * lowpoly.dk
 *
 * Instructions:
 * Select your comp and run the script. Select the srt file and tadaa!
 **/

var theComp = app.project.activeItem;
var font = 'Verdana';
var fontSize = 32;
var padding = 20;
var paddingWidth = 200;
var paddingHeight = 100;
var compWidth = theComp.width;
var compHeight = theComp.height;

var theFile = File.openDialog("Select a text file to open.", "SRT subtitles:*.srt");

var addBackground = confirm('Do you want a background for the subtitles?');
var backgroundOpacity = 100;
if (addBackground) {
  backgroundOpacity = prompt('Set opacity [0-100]', 100);
}


app.beginUndoGroup('Import subtitles');

if (theFile != null) {
  theFile.open('r', "TEXT", '????');
  var content = parseSRT(theFile.read());
  theFile.close();

  for (var i = content.length - 1; i >= 0; i--) {
    var layer = theComp.layers.addBoxText([
      compWidth - (paddingWidth * 2),
      150
    ], content[i].text);

    // text = layer.sourceText;
    // style = text.value;
    // style.font = font;
    // style.fontSize = fontSize;
    // text.setValue(style);

    layer.anchorPoint.expression = 'boxTop = this.sourceRectAtTime().top; boxHeight = this.sourceRectAtTime().height; [value[0], boxTop + boxHeight/2 ];﻿';

    layer.inPoint = content[i].start;
    layer.outPoint = content[i].end;
    layer.transform.position.setValue([compWidth / 2, (compHeight - paddingHeight) + fontSize]);

    if (addBackground) {
      shapeLayer = theComp.layers.addShape();
      shapeLayer.moveAfter(layer);
      shapeLayer.position.expression = 'thisComp.layer("' + layer.name + '").transform.position';
      shapeLayer.inPoint = content[i].start;
      shapeLayer.outPoint = content[i].end;
      shapeLayer.opacity.setValue(backgroundOpacity);

      rect = shapeLayer.property("Contents").addProperty('ADBE Vector Shape - Rect');
      rect.property('Size').expression = 't = thisComp.layer("' + layer.name + '").sourceRectAtTime(); p = ' + padding + '; w = t.width + (p*2); h = t.height + (p*2); [w, h]';

      fill = shapeLayer.property("Contents").addProperty('ADBE Vector Graphic - Fill');
      fill.property('Color').setValue([0,0,0]);
    }
  }
}

app.endUndoGroup();


// Helpers

function toSeconds(time) {
  var t = time.split(':');

  try {
    var s = t[2].split(',');

    // Just in case a . is decimal seperator
    if (s.length === 1) {
      s = t[2].split('.');
    }

    return parseFloat(t[0], 10) * 3600 + parseFloat(t[1], 10) * 60 + parseFloat(s[0], 10) + parseFloat(s[1], 10) / 1000;
  } catch (e) {
    return 0;
  }
}

function nextNonEmptyLine(linesArray, position) {
  var idx = position;

  while (!linesArray[idx]) {
    idx++;
  }

  return idx;
}

function lastNonEmptyLine(linesArray) {
  var idx = linesArray.length - 1;

  while (idx >= 0 && !linesArray[idx]) {
    idx--;
  }

  return idx;
}

function parseSRT(data) {
  // declare needed variables and constants
  var subs = [];
  var lines = data.split(/(?:\r\n|\r|\n)/gm);
  var endIdx = lastNonEmptyLine(lines) + 1;
  var idx = 0;
  var time;
  var text;
  var sub;

  for (var i = 0; i < endIdx; i++) {
    sub = {};
    text = [];

    i = nextNonEmptyLine(lines, i);
    sub.id = parseInt(lines[i++], 10);

    // Split on '-->' delimiter, trimming spaces as well
    time = lines[i++].split(/[\t ]*-->[\t ]*/);

    sub.start = toSeconds(time[0]);

    // So as to trim positioning information from end
    idx = time[1].indexOf(' ');
    if (idx !== -1) {
      time[1] = time[1].substr(0, idx);
    }
    sub.end = toSeconds(time[1]);

    // Build single line of text from multi-line subtitle in file
    while (i < endIdx && lines[i]) {
      text.push(lines[i++]);
    }

    // Join into 1 line
    sub.text = text.join('\r');

    subs.push(sub);
  }

  return subs;
}
