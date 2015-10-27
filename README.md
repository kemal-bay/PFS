# PFS
PFS is a file server and on-the-fly image resizer. It requires node.js 0.10.0 or later.

**Dependencies:**
 - easyimage
 - file-type
 - mkdirp
 - read-chunk
 
 **Configuration:**
 
    config: {
		    //Port: The port number for your server.
            port: 80, 
            //Folders: You can change your folder names without changing in code. 
            folders: {
                assets: "assets",
                images: "images",
                files: "files"
            },
            //Blacklist: You can put filenames that you want to prevent for download
            blacklist: ["app.js", "package.json", "node_modules"],
            //Available sizes: You need to specify sizes for image resizing. Don't leave it empty. It causes a security breach for your disk space.
            availableSizes: [
                                [100,100],
                                [200,200],
                                [500,500]
                            ], /* [width,height] */
            //Not found message: You can use text or html for not found page
            notFoundMessage: "404 - File Not Found",
            //Server error message: You can use text or html for server error page
            serverErrorMessage: "500 - Internal Server Error",
            //Log: If you want log all processes leave it true. Otherwise set it to false
            log: true
        }

**How to use:**

 - Clone the code
 - npm install for dependencies
 - Create a root folder for the assets defined as in configuration object.
 - Create sub folders into your root folder for files and images
 - Run in terminal: node app.js
 - For example you have a file in assets/images/original.jpg
 You can call in browser: http://localhost/images/500/500/original.jpg
 If 500x500 version of your image does not exist, it instantly creates a 500x500 copy of your original image and serves it.
 - If your file is not an image then it serves directly. e.g. http://localhost/files/hello-world.txt
 - You can call your original images like http://localhost/images/original.jpg

**TODO:**

 - Node.js vs. nginx benchmark
 - Start/stop daemon
 - Force download option