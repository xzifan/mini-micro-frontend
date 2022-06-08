![](https://raw.githubusercontent.com/xzifan/mini-micro-frontend/main/public/micro-frontend.jpg)

This is a minimal implementation of micro-frontend. 

## What are Micro frontends
You might want to check these following articles: 

Michael Geers https://micro-frontends.org/

Cam Jackson https://martinfowler.com/articles/micro-frontends.html

## Progress
- [x] Independent deployment
- [ ] Application shell
  - [ ] Retrieving global configurations
  - [ ] Fetching the available routes and associated micro-frontends to load
  - [ ] Handling errors if a micro-frontend cannot be loaded

- [ ] Routing
  - [x] Vertical split
  - [ ] Horizontal split
  - [x] Lazy loading
- [ ] Micro Application communication

## Architectural details
Currently this demo has following micro applications:

- navigation bar - React + [Alibaba Fusion Design](https://fusion.design/pc/)
- markdown editor - React + [react-md-editor](https://uiwjs.github.io/react-md-editor/)
- vue info page - vue3


### Routing

Hash routing is important to a spa since its an efficient and precise way of controlling content to be rendered. However, in MF, the knowledge of how the routing is being defined always needs to be clearly documented. Otherwise the `<a>` link may not work as they expect.

### Configuration and resource importing

All javascript dependencies are fetched by using [System.js](https://www.npmjs.com/package/systemjs)

Once DOM is ready, it will try to import all dependencies and bundles for each micro apps. This can also be optimized to lazy load each bundle according to the current url.

```html
<script>
    window.microAppConfig = {
        apps: [
            {
                name: 'react-micro-app',
                route: undefined,
                resources: [
                    "https://demo.com/bundle.js",
                ]
            }, 
            {
                name: 'vue-micro-app',
                route: '/vue',
                resources: [
                    "https://demo.com/assets/index.css",
                    "https://demo.com/assets/index.js"
                ]
            }
        ],
        dependencies: [
            "https://cdn.jsdelivr.net/npm/react@18.1.0/umd/react.production.min.js",
            "https://cdn.jsdelivr.net/npm/react-dom@18.1.0/umd/react-dom.production.min.js",
        ] 
    }
</script>
```

### The initialization of MFs
We can create a configuration json to setup the micro frontends. With these configurations, 

