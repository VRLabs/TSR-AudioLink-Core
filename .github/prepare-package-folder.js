const fs = require('fs-extra');
const yaml = require('js-yaml');
const path = require('path');

/*let folder = "Editor"
if (!process.argv[2]) {
    console.log("a version number is needed");
    return;
}

if (process.argv[3]) {
    folder = process.argv[3];
}
*/
function fromDir(startPath,filter,callback){

    //console.log('Starting from dir '+startPath+'/');

    if (!fs.existsSync(startPath)){
        console.log("no dir ",startPath);
        return;
    }

    var files=fs.readdirSync(startPath);
    for(var i=0;i<files.length;i++){
        var filename=path.join(startPath,files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()){
            fromDir(filename,filter,callback); //recurse
        }
        else if (filter.test(filename)) callback(filename);
    }
}

try {

    if (!fs.existsSync(".github/package-extra-folders.yml")){
        console.log("Extra folders not found, using the root");
    }
    else
    {
        console.log("Extra folders found");
        let fileContents = fs.readFileSync('.github/package-extra-folders.yml', 'utf8');
        let data = yaml.load(fileContents);

        console.log("   Using folder: " + data['destination-folder']);

        var files=fs.readdirSync("tmp");

        fs.mkdirSync(data['destination-folder'], { recursive: true });

        data['extra-generated-meta'].forEach(element => {
            fs.mkdirSync("tmp/" + element.path, { recursive: true });
            fs.writeFileSync("tmp/" + element.path + ".meta", "fileFormatVersion: 2\nguid: " + element.guid + "\nfolderAsset: yes\nDefaultImporter:\n  externalObjects: {}\n  userData: \n  assetBundleName: \n  assetBundleVariant: ");
        });

        for(var i=0;i<files.length;i++){
            if(!path.basename(files[i]).startsWith(".")) {
                fs.moveSync(files[i], data['destination-folder'] + "/" + files[i], function (err) {
                    if (err) throw err
                    console.log('moved files')
                });
            }
        }
    }
} catch (e) {
    console.log(e);
}