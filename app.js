var fileServer = {
    config: {
        port: 80,
        folders: {
            assets: "assets",
            images: "images",
            files: "files"
        },
        blacklist: ["app.js", "package.json", "node_modules"],
        availableSizes: [
                            [100,100],
                            [200,200],
                            [500,500]
                        ], /* [width,height] */
        notFoundMessage: "404 - File Not Found",
        serverErrorMessage: "500 - Internal Server Error",
        log: true
    },
    lib: {
        http: require("http"),
        url: require("url"),
        fs: require("fs"),
        path: require("path"),
        easyimg: require('easyimage'),
        mkdirp: require('mkdirp'),
        readChunk: require('read-chunk'),
        fileType: require("file-type")
    },
    init: function(port) {
        port = port ||  fileServer.config.port;
        fileServer.lib.http.createServer(fileServer.factory).listen(8001);
        fileServer.log("PFS running at port: " + port);
    },
    detectMimeType: function(fileName) {
        return fileServer.lib.fileType(fileServer.lib.readChunk.sync(fileName, 0, 262)).mime;
    },
    serve: function(fileName, response) {
        fileServer.lib.fs.exists(fileName, function(exists) {
            if (exists) {
                if (fileServer.config.blacklist.indexOf(String(fileName.split("/".slice(-1)))) != -1) {
                    fileServer.invoke.notFound(response);
                } else if (fileServer.lib.fs.statSync(fileName).isDirectory()) {
                    fileName = fileServer.lib.path.join(__dirname, 'index.html');
                }
                fileServer.lib.fs.readFile(fileName, "binary", function(err, file) {
                    if (err) {
                        fileServer.log(err);
                        fileServer.invoke.notFound(response);
                    } else {
                        response.writeHead(200);
                        response.write(file, "binary");
                        response.end();
                    }
                });
            }else{
                fileServer.invoke.notFound(response);
            }
        });
    },
    invoke: {
        notFound: function(response) {
            response.writeHead(404, {
                "Content-Type": "text/plain"
            });
            response.write(fileServer.config.notFoundMessage);
            response.end();
            return;
        },
        serverError: function(response, error) {
            error = error ||  fileServer.config.serverErrorMessage;
            response.writeHead(500, {
                "Content-Type": "text/plain"
            });
            response.write(error);
            response.end();
            return;
        },
    },
    log: function(error) {
        if(fileServer.config.log){
            var fs = require('fs');
            var stream = fs.createWriteStream("app.log", {'flags': 'a'});
            stream.once('open', function(fd) {
              stream.write(new Date().toISOString());
              stream.write(": ");
              stream.write(String(error));
              stream.write("\n");
              stream.end();
            });
        }
    },
    factory: function(request, response) {
        var uri = fileServer.lib.url.parse(request.url).pathname,
            fileName = fileServer.lib.path.join(__dirname, fileServer.config.folders.assets, uri),
            params = uri.split("/"),
            sourceFile;

        switch (params[1]) {
            case "files":
                fileServer.serve(fileServer.lib.path.join(
                                                            __dirname,
                                                            fileServer.config.folders.assets,
                                                            fileServer.config.folders.files,
                                                            String(params.slice(2).join("/"))),
                                                            response
                                                        );
                break;
            case "images":
                fileServer.imageFactory(
                                            fileName,
                                            fileServer.lib.path.join(__dirname,
                                            fileServer.config.folders.assets,
                                            fileServer.config.folders.images,
                                            String(params.slice(4).join("/"))),
                                            params,
                                            response
                                        );
                break;
            default:
                fileServer.serve(fileName, response);
        }
    },
    imageFactory: function(fileName, sourceFile, params, response) {
        fileServer.lib.fs.exists(fileName, function(exists) {
            if (false === exists) {
                var width = parseInt(params[2]),
                    height = parseInt(params[3]),
                    destinationFolder = fileServer.lib.path.join(
                                                                    __dirname,
                                                                    fileServer.config.folders.assets,
                                                                    fileServer.config.folders.images,
                                                                    String(width),
                                                                    String(height)
                                                                ),
                    destinationFile = [destinationFolder, String(params.slice(4).join("/"))].join("/");

                if (-1 != fileServer.config.availableSizes.join().indexOf([width,height]) 
                        && false === isNaN(width) && false === isNaN(height) 
                            && fileServer.lib.fs.existsSync(sourceFile)) {
                    fileServer.lib.mkdirp(destinationFolder, function(err) {
                        if (err) {
                            fileServer.log(err);
                            fileServer.invoke.serverError(response);
                        } else {
                            fileServer.lib.easyimg.rescrop({
                                src: sourceFile,
                                dst: destinationFile,
                                width: width,
                                height: height,
                                gravity: 'Center',
                                fill: true,
                                cropwidth: width,
                                cropheight: height,
                                x: 0,
                                y: 0
                            }).then(function(file) {
                                fileServer.log(file.path+" created.");
                                fileServer.serve(file.path, response);
                            }, function(err) {
                                fileServer.log(err);
                                fileServer.invoke.serverError(response);
                            });
                        }
                    });
                } else {
                    fileServer.invoke.notFound(response);
                }
            } else {
                fileServer.serve(fileName, response);
            }
        });
    }
}

fileServer.init();