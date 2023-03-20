const path = require('path');
const glob = require("glob");
const sharp = require("sharp");
const fse = require('fs-extra');
const fs = require('fs');

const sourcePath = 'src/img-src';
const outputPath = 'src/img';

var getDirectories = function (src, callback) {
  glob(src + '/**/*', callback);
};

getDirectories(sourcePath, function (err, res) {
  if (err) {
    console.log('Error', err);
  } else {
    let imagesSourceJs = '';
    res.forEach(imagePath => {
      if (imagePath.match(/\.(png|jpe?g)$/)) {
        imagesSourceJs += imageProcess(imagePath);
      }

      if (imagePath.match(/\.(svg)$/)) {
        let newOutPath = imagePath.replace('src/img-src/svg', 'src/img/svg');
        imagesSourceJs += "require('../../" + newOutPath + "');";
      }
    });

    fs.writeFile('src/js/images.js', imagesSourceJs, function (err) {
      if (err) return console.log(err);
      console.log('images.js save');
    });
  }

  // Copy SVG
  try {
    fse.copySync('src/img-src/svg', 'src/img/svg', { overwrite: true })
    console.log('SVG copy success!');

  } catch (err) {
    console.error(err)
  }
});


var imageProcess = function (imagePath) {
  // File name
  let fileName = path.basename(imagePath);
  let originName = path.parse(fileName).name;
  let newOutPath = imagePath.replace(sourcePath, outputPath).replace(fileName, '') + originName;
  let imagesSourceJs = resize(imagePath, newOutPath, originName);



  return imagesSourceJs;
};

var resize = function (imagePath, newOutPath, name) {
  // Make x1
  let resultPathX2Png = newOutPath + "x2.png";
  let resultPathPng = newOutPath + ".png";

  let resultPathX2Webp = newOutPath + "x2.webp";
  let resultPathWebp = newOutPath + ".webp";

  let image = sharp(imagePath);

  try {
    if (!fs.existsSync("./"+newOutPath+"/")) {
      fs.mkdirSync("./"+newOutPath.replace(name, '')+"/", { recursive: true } );
    }
  } catch (err) {
    console.error(err);
  }


  image.metadata()
    .then((metadata) => {

      return image
        .png()
        .toFile(resultPathX2Png, (err, info) => {
          console.log('File ' + resultPathX2Png + ' has successfully.')
        })
        .webp()
        .toFile(resultPathX2Webp, (err, info) => {
          console.log('File ' + resultPathX2Webp + ' has successfully.')
        })
        .resize(Math.round(metadata.width / 2))
        .png()
        .toFile(resultPathPng, (err, info) => {
          console.log('File ' + resultPathPng + ' has successfully resized.')
        })
        .webp()
        .toFile(resultPathWebp, (err, info) => {
          console.log('File ' + resultPathWebp + ' has successfully resized.')
        });
    })

  return "require('../../" + resultPathX2Png + "'); require('../../" + resultPathX2Webp + "'); require('../../" + resultPathPng + "'); require('../../" + resultPathWebp + "'); \r\n";

}