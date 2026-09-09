# Three.js local runtime files

Three.js 0.185.1 uses a split ES-module build. This folder must contain BOTH:

    three.module.min.js
    three.core.min.js

`three.module.min.js` imports `./three.core.min.js`.

Run `prepare-self-contained.bat` once to create both local files. After that,
the browser applet has no runtime CDN dependency.
