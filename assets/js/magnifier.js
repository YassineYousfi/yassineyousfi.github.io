// Original source: http://webdeveloper.earthweb.com/repository/javascripts/2005/03/660841/vergrootglas.html
// 
// Changes and improvements:
// - supports multiple images, anywhere on page, not just at top
// - calculates magnification from the image width's
// - supports non-square individually-sized magnifiers
// - uses standardized methods for event capture if available (captureEvents
//   disappearing in Firefox 3)
// - replaces clip rect with clipping div's because clip computed style not well
//   supported in Safari 3 or IE 7 (thanks, dhtml)
// - more modular code, no public names

// Put code inside function to avoid conflict with other Javascript
// - http://www.davidflanagan.com/blog/2005_07.html
//
// At end of file, change true to false if you want to silence error messages
// from missing image information.
//
// Exported function:
//   MAGNIFIER.data() - returns the array of image data being used
//   MAGNIFIER.reset() - rescans for images (used by magnifier_maker.html)

var MAGNIFIER = function (alertOnErrors) {

// Default magnifier is 150 wide by 150 high.
// It can be overridden by an inline clip rect on a specific large image.
//
// Reminder: clip rect numbers are top, right, bottom, and left.
// px is required. While commas are correct, they are not accepted by IE.
// Browsers are encouraged by W3C to handle the non-comma version.
var defaultClipRect = "rect(0px 150px 150px 0px)";
var defaultClipWidth = 150;
var defaultClipHeight = 150;

// For internal use
//
// imagePairData: a list of data about all small / large image pairs.
// Calculated at load time, each element data contains:
//
//  data.small - the small image, with position and size
//  data.large - the large magnified image and its size
//  data.mag - the x and y magnification factors
//  data.lens - the maglens div object with width and height
//  data.rect - the clipping rectangle with width and height
//  -- only one of data.lens and data.rect should exist
 
var imagePairData = [];

// currentImagePair: the imagePairData for the item currently being magnified, if any
var currentImagePair;


// Simon Willison's addLoadEvent -- http://simonwillison.net/2004/May/26/addLoadEvent/
function addLoadEvent(fn) {
  var oldfn = window.onload;
  window.onload = (typeof oldfn != 'function') ? fn : function() { oldfn(); fn(); };
}

// center the magnifier lens on x, y
function centerLens(data, x, y) {
  var lens = data.lens.node;
  lens.style.left = (x - (data.lens.width / 2)) + "px";
  lens.style.top = (y - (data.lens.height / 2)) + "px";
}

// create a rect() from a rect() with same size but centered on x,y
function centerRect(rect, x, y) {
  var dx = Math.round(rect.width / 2);
  var dy = Math.round(rect.height / 2);
    
  return "rect(" + (y - dy) + "px " + (x + dx) + "px " + (y + dy) + "px " + (x - dx) + "px)";
}


function findImagePairData(x, y) {
  for (var i = 0; i < imagePairData.length; ++i) {
    if (imagePairData[i].contains(x, y)) {
      return imagePairData[i];
    }
  }
  return null;
}

// Don't use getCurrentStyle() -- Opera 9.5 calculates a zero-sized clipping
// rectangle as a default. 
function getClipRect(node) {
  var rect = node.style.clip || defaultClipRect;
  var matches = /([\-.0-9]+)[^\-.0-9]+([\-.0-9]+)[^\-.0-9]+([\-.0-9]+)[^\-.0-9]+([\-.0-9]+)/.exec(rect);
  var top = + matches[1];
  var right = + matches[2];
  var bottom = + matches[3];
  var left = + matches[4];
  var width = !(left || right) ? defaultClipWidth : right - left;
  var height = !(top || bottom) ? defaultClipHeight : bottom - top;
  return { width: width, height: height };
}


// try every place style info might be
function getCurrentStyle(elt, property) {
  var dv = document.defaultView && document.defaultView.getComputedStyle &&
            document.defaultView.getComputedStyle(elt, null)[property];
  var cs = elt.currentStyle && elt.currentStyle[property] && elt.currentStyle[property];
  var rs = elt.runtimeStyle && elt.runtimeStyle[property] && elt.runtimeStyle[property];
  var es = elt.style && elt.style[property] && elt.style[property];
  return dv || cs || rs || es;
}

function getComputedValue(elt, property) {
  return parseFloat(getCurrentStyle(elt, property));
}

function getImagePairData(x, y) {
  // reuse current data if possible
  if (currentImagePair) {
    if (currentImagePair.contains(x, y)) {
      return currentImagePair;
    }
    // don't search for another if only one pair
    else if (imagePairData.length < 2) {
      return null;
    }
  }
  else {
    return findImagePairData(x, y);
  }
}

function getInlineValue(elt, property) {
  return parseFloat(elt.style[property] || elt[property]);
}

// Return something useful as a label in error messages
function getLabel(node) {
  return node.id || node.name || node.src || node;
}

function getLargeImages() {
  var largeImages = [];
  for (var i = 0; i < document.images.length; ++i) {
    if (isLargeImage(document.images[i])) {
      largeImages[largeImages.length] = document.images[i];
    }
  }
  return largeImages;
}

function getLens(image) {
  if (image && isLens(image.parentNode)) {
    var node = image.parentNode;
    return {
      node: node,
      width: getComputedValue(node, "width"),
      height: getComputedValue(node, "height")
    };
  }
  else {
    return null;
  }
}

function getMagnifierParent(node) {
  var parent = node.parentNode;
  if (isLens(parent)) {
    parent = parent.parentNode;
  }
  return parent;
}

function getOffset(obj, field) {
  var sum = 0;
  do { sum += obj[field];  }
  while ((obj = obj.offsetParent));
  return sum;
}

function getSmallImage(largeImage) {
  var parent = getMagnifierParent(largeImage);
  var images = parent.getElementsByTagName("IMG");
  for (var i = 0; i < images.length; ++i) {
    if (isSmallImage(images[i])) {
      return images[i];
    }
  }
  return null;
}

function hideMagnifiedImage(image) {
  image.style.display = "none";
}

function isLargeImage(image) {
  return image.className == "maglarge" || nameStartsWith(image, "large");
}

function isLens(node) {
  return node && (node.className == "maglens" || nameStartsWith(node, "lens"));
}

function isSmallImage(image) {
  return image.className == "magsmall" || nameStartsWith(image, "small");
}

function magAlert(msg) {
  if (alertOnErrors) {
    alert("Magnifier error: " + msg);
  }
}

// Pair the large image with the small image in the same container. If
// there is no small image, create one. Return an object with data on
// the images, magnifier lens, and magnification factor.
function makeImagePairData(i, largeImage) {
  if (!largeImage) {
    magAlert("No large image for magnifier " + (i + 1));
    return null;
  }
  
  var imageLabel = "image: " + getLabel(largeImage);

  // There's either a clipping maglens DIV...
  var lens = getLens(largeImage);
  if (lens && (!lens.width || !lens.height || isNaN(lens.width) || isNaN(lens.height))) {
    magAlert("Can't get lens dimensions for " + imageLabel);
    return null;
  }
  
  // ... or a clipping rectangle on the large image.
  var rect = lens ? null : getClipRect(largeImage);
  if (rect && (!rect.width || !rect.height || isNaN(rect.width) || isNaN(rect.height))) {
    magAlert("Can't get clip dimensions for " + imageLabel);
    return null;
  }
  
  // The size of the small image is set by the parent DIV.
  var parent = getMagnifierParent(largeImage);
  if (!parent) {
    magAlert("No parent DIV found for " + imageLabel);
    return null;
  }

  // There's either a small image given, or one is constructed.
  var smallImage = getSmallImage(largeImage) ||
                   makeSmallImage(largeImage, parent, lens ? lens.node : largeImage);
  if (!smallImage) {
    magAlert("No small image for " + imageLabel);
    return null;
  }
  
  var sx = getOffset(smallImage, "offsetLeft");
  var sy = getOffset(smallImage, "offsetTop");
  
  var sw = getInlineValue(parent, "width");
  var sh = getInlineValue(parent, "height");
  if (isNaN(sw) || isNaN(sh)) {
    magAlert("Can't get small image dimensions for " + imageLabel);
    return null;
  }
  else {
    smallImage.width = sw;
    smallImage.height = sh;
  }
  
  // The size of the large image is specifed on the image.
  var lw = getInlineValue(largeImage, "width");
  var lh = getInlineValue(largeImage, "height");
  if (!lw || !lh) {
    magAlert("Can't get large image dimensions for " + imageLabel);
    return null;
  }
  
  return {
    small: { image: smallImage, x: sx, y: sy, width: sw, height: sh },
    large: { image: largeImage, width: lw, height: lh },
    mag: { x: lw / sw, y: lh / sh },
    lens: lens,
    rect: rect,
    contains: function(x, y) {
                return (sx <= x && x <= sx + sw && sy <= y && y <= sy + sh);
              }
  };
}

// Passed the largeImage to copy, and where to insert it.
function makeSmallImage(largeImage, parent, refChild) {
  if (refChild.parentNode != parent) {
    magAlert("Problem getting parent DIV for " + getLabel(largeImage));
    return null;
  }
  
  var smallImage = new Image();
  smallImage.className = "magsmall";
  smallImage.style.position = "absolute";
  smallImage.style.top = "0px";
  smallImage.style.left = "0px";
  smallImage.style.width = parent.style.width;
  smallImage.style.height = parent.style.height;
  smallImage.style.borderStyle = "none";
  // IE flashes the large image on insertion unless hidden
  smallImage.style.display = "none";
  smallImage.src = largeImage.src;
  parent.insertBefore(smallImage, refChild);
  smallImage.style.display = "block";
  return smallImage;
}

function mouseTrack(evt) {
  var x, y;
  if (evt && !(evt.pageX === undefined)) {
     x = evt.pageX;
     y = evt.pageY;
     evt.stopPropagation();
  }
  else { // Internet Explorer
     x = event.clientX + (document.body.scrollLeft || document.documentElement.scrollLeft) - document.body.clientLeft;
     y = event.clientY + (document.body.scrollTop || document.documentElement.scrollTop) - document.body.clientTop;
     event.cancelBubble = true;
  }
  
  var data = getImagePairData(x, y);
  
  if (data) {
    updateMagnifiedImage(x, y, data);
  }
  else if (currentImagePair) {
    hideMagnifiedImage(currentImagePair.large.image);
    currentImagePair = null;
  }
}

function nameStartsWith(node, name) {
  return startsWith(node.name, name) || startsWith(node.id, name);
}

function startsWith(str1, str2) {
  return str1 && str2 !== undefined && str2 !== null && str1.indexOf(str2) === 0;
}

function updateMagnifiedImage(x, y, data) {
  // upper left of small image
  var sx = data.small.x;
  var sy = data.small.y;
  // mouse x,y relative to small image
  var rx = x - sx;
  var ry = y - sy;
  // mouse x, y relative to large image
  var Rx = Math.floor(rx * data.mag.x);
  var Ry = Math.floor(ry * data.mag.y);
  var Sx, Sy;
  var largeStyle = data.large.image.style;    
  
  // if using lens div
  if (data.lens) {
    // position lens
    centerLens(data, rx, ry);
    // then calculate upper left of large image relative to lens div
    Sx = x - Rx - getOffset(data.lens.node, "offsetLeft");
    Sy = y - Ry - getOffset(data.lens.node, "offsetTop");
  }
  else { // if using clip rect
    // position clip region
    largeStyle.clip = centerRect(data.rect, Rx, Ry);
   // then calculate upper left of large image relative to magnifier div
    Sx = x - Rx - sx;
    Sy = y - Ry - sy;
  }
  
  largeStyle.left = Sx + "px";
  largeStyle.top = Sy + "px";
//  window.status = "xy (" + x + "," + y + ") sxy (" + sx + "," + sy  + ") rxy (" + rx + "," + ry  + ") Rxy (" + Rx + "," + Ry + ") Sy (" + Sx + "," + Sy + ")";
  
  largeStyle.display = "block";
  currentImagePair = data;
}

// Set up mousetracking; support W3C standard and IE
function initListeners() {
  if (document.addEventListener) {
    document.addEventListener('mousemove', mouseTrack, true);
  }
  else if (document.attachEvent) {
    document.attachEvent('onmousemove', mouseTrack);
  }
  else {
    if (!document.all) {
      document.captureEvents(Event.MOUSEMOVE);
    }
    document.onmousemove = mouseTrack;
  }
}

// Create magnifier data for every "large" image.
function registerImagePairs() {
  // Careful! makeImagePairData() inserts small images before the large
  // images so collect large images first to avoid endless insertion.
  var largeImages = getLargeImages();
  imagePairData = [];
  
  for (var i = 0; i < largeImages.length; ++i) {
    var data = makeImagePairData(i, largeImages[i]);
    if (data) {
      imagePairData[imagePairData.length] = data;
      hideMagnifiedImage(largeImages[i]);
    }
  }
}

// javascript:MAGNIFIER.status()
function makeStatusString() {
  var missing = [];
  var i = 0;
  var testImage = function(i) {
    if (i < imagePairData.length) {
      img.src = imagePairData[i].large.image.src;
    }
    else {
      showImageSummary(missing);
    }
  }
  var img = new Image();
  img.onerror = function (evt) {
    missing[missing.length] = this.src;
    testImage(++i);
  }
  img.onload = function (evt) {
    testImage(++i);
  }
  testImage(i);
  return "Number of magnified images: " + imagePairData.length + "\n";
}

function showImageSummary(missing) {
  var text = "";
  for (var i = 0; i <  missing.length; ++i) {
    text += "\n  " + makeRelativePath(missing[i]) + " not found";
  }
  alert(text);
}


function makeRelativePath(url) {
  var locParts = window.location.href.split("/");
  var urlParts = url.split("/");
  var i = 0;
  while (i < locParts.length && locParts[i] == urlParts[i]) {
    ++i;
  }
  if (i == 0) {
    return url;
  }
  else {
    var relUrl = urlParts.slice(i).join("/");
    while (++i < locParts.length) {
      relUrl = "../" + relUrl;
    }
    return relUrl;
  }
}

// startup code adds onload events to get image data and start mouse tracking
addLoadEvent(function () {
  registerImagePairs();
  initListeners();
});

return {
  data: function () { return imagePairData; },
  reset: function() { registerImagePairs(); },
  status: function() { alert(makeStatusString()); }
};

// End private function; call it to initialize event handlers
// Change true to false to silence errors noticed in loading images
}(true);


