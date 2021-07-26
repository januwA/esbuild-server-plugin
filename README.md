## esbuild server

The server used during development and the setting of static html files

## install 
```
$ npm i esbuild-server-plugin -D
```

## usage 

Use in esbuild config

```js
import esbuild from "esbuild";
import path from "path";
import esbuildHtmlPlugin from "plugin-dist/esbuild-server";

const __dirname = path.resolve();

esbuild
  .build({
    entryPoints: ["./src/index"],
    bundle: true,

    // Outdir must be set
    outdir: path.resolve(__dirname, "out"),

    // Watch must be set
    watch: true,

    plugins: [
      esbuildHtmlPlugin({

        //   Custom data
        title: "document",

        // You must specify the template
        // The template is parsed using ejs: https://ejs.co/#install
        template: path.resolve(__dirname, "index.html"),

        // Parameters in the template
        js: ["/index.js"],
        css: ["/index.css"],

        // Start the development server
        server: {
          port: 3000,
          before() {},
          after() {},
        },
      }),
    ],
  })
  .catch(() => process.exit(1));
```

## html template 

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><%= config.title %></title>
    
    <% config.css.forEach(function(url){ %>
    <link rel="stylesheet" href="<%= url %>" />
    <% }); %>

  </head>
  <body>
    <div id="root"></div>

    <% config.js.forEach(function(url){ %>
    <script src="<%= url %>"></script>
    <% }); %>

  </body>
</html>

```