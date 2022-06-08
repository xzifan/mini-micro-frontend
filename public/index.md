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

- [x] Routing
  - [x] Vertical split
  - [x] Horizontal split
  - [x] Lazy loading
- [ ] Micro Application communication

## Architectural details
Currently this demo has following micro applications:

- navigation bar - React + [Alibaba Fusion Design](https://fusion.design/pc/)
- markdown editor - React + [react-md-editor](https://uiwjs.github.io/react-md-editor/)
- vue info page - vue3


### Routing

Hash routing is important to a spa since its an efficient and precise way of controlling content to be rendered. However, in MF, the knowledge of how the routing is being defined always needs to be clearly documented. Otherwise the `<a>` link may not work as they expect.

### Resource importing

All javascript dependencies are fetched by using [System.js](https://www.npmjs.com/package/systemjs)

Once DOM is ready, it will try to import all dependencies and bundles for each micro apps. This can also be optimized to lazy load each bundle according to the current url.

```html
<script>
    window.microAppConfig = {
            apps: [
                {
                    name: 'nav',
                    route: undefined, // Always visible
                    resources: [
                        "https://mini-mf-react.vercel.app/nav.js",
                    ]
                }, {
                    name: 'markdown-container',
                    route: '/',
                    resources: [
                        "https://mini-mf-react.vercel.app/md.js"
                    ]
                },
                {
                    name: 'vue-micro-app',
                    route: '/vue',
                    resources: [
                        "https://mini-mf-vue3.vercel.app/assets/index.css",
                        "https://mini-mf-vue3.vercel.app/assets/index.js"
                    ]
                }
            ],
            dependencies: [
                "https://cdn.jsdelivr.net/npm/react@18.1.0/umd/react.production.min.js",
                "https://cdn.jsdelivr.net/npm/react-dom@18.1.0/umd/react-dom.production.min.js",
            ],   
        }
</script>
```
## Decoupling the web application   
  
To implement micro-frontends, one crucial and challenging step is decoupling the web application. The application can be vertically split, which displays one micro frontend at a time. It can also be horizontally split, which shows multiple micro-frontends at the same time (Mezzalira, 2021).  

In the case of micro-frontends with vertical split, a routing mechanism that switches the micro-frontends to be displayed is required. This mechanism should be a part of the root micro-frontend, which serves as an application shell. With React or Vue, there is a router library  that helps us handle the route changes and renders corresponding contents for us. It is a viable choice if we use React Router or Vue Router in the root micro-frontend. However, that would bind the application shell to framework dependencies like React/Vue. Thus, if a development team has a specific framework that they would use in the long term, and most of their web pages are using this frontend framework, it is convenient and fast to develop the micro frontend routing system with that framework.  

In this demo, the micro-frontend routing was implemented without a frontend framework. Instead, my root micro-frontend application creates listeners on “hashchange” event and toggles the display attribute between “none” and “block” accordingly. In this way, the micro-frontends that are registered into different containers display one at a time based on the current hash route. 

```js
window.addEventListener('hashchange', function (e) {
    switchMicroApp()
})
const switchMicroApp = () => {
    let microAppKey = window.__router.getRoute(0)
    // check each microAppConfig according to the rule 
    window.microAppConfig.apps.forEach(app=>{
        const container = document.getElementById(app.name)
        if (typeof app.route === 'undefined'){
            // undefined route means this microApp displays in all cases
            if (container) container.style.display = 'block'
        } else if ( app.route === '/'+microAppKey) {
            // Lazy load: 
            // fetch resources if resource for this microApp haven't been loaded
            if (!window.__microApp_ready.includes(app.name)) loadAppResources(app)
            // display the microApp if the current route matches
            if (container) container.style.display = 'block'
        } else {
            // hide container if there is no match 
            if (container) container.style.display = 'none'
        }
    })
}
```

### Horizontal Split  
A horizontal split makes the web application display multiple micro-frontends at the same time. For example, a navigation micro-frontend and a content micro-frontend. These micro-frontends may use different sets of technologies, and running the bundled JavaScript once only renders the micro-frontend once at a given container element. However, most frontend frameworks require a real DOM element as the mount point. Once the state is computed, the framework will render the content inside the mount point.  
```jsx
// React v17
import ReactDOM from 'react-dom';
import App from 'App';

const container = document.getElementById('root');

ReactDOM.render(<App />, container);
```

```jsx
// React v18
import ReactDOM from "react-dom";
import App from 'App';

const container = document.getElementById('root');

const root = ReactDOM.createRoot(container);
root.render(<App />);
```

```js
// Vue 2
var app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!'
  }
})
```

```js
// Vue3
import { createApp } from 'vue'
const app = createApp(/* ... */)

app.mount('#root')
```        
If we take a closer look at the APIs for rendering, root.render in React and app.mount in Vue, they both return a void function which is possible to be reused. These functions are the renderers of micro frontends. We can make use of these functions when we want to render a complete copy of that micro frontend application. In order to access these functions from the application shell, we can expose them to the window instance (see example below). 

With a frontend framework, like React, we can easily define a MicroApp component in the application shell that calls the renderer function once the route matches a micro frontend. 

Assuming that the renderer functions are on the window.renderer object with the micro-frontend’s name as the key, we can call these functions once this React component has been initialized (example code below).
``` tsx
function MicroApp(props: { name: string, microAppProps?: Object}) {
    const { name, appProps } = props
    // runs once this component has been initialized, 
    // About React Hooks https://reactjs.org/docs/hooks-effect.html 
    React.useEffect(()=>{
        // call the renderer function that was exposed on the window instance
        if (window.renderer[name] && typeof window.renderer[name] === 'function'){
            window.renderer[name](document.getElementById(name))
        }
    },[])
    return <div className="app-container" id={name} {...microAppProps}></div>
}
```

### Communication between micro-frontends
In a traditional SPA, an application can change or update the views according to the states of a component. However, in micro-frontends, most component states are only accessible within the JavaScript bundle or even only inside that component. In some cases, there are web applications that uses several different frameworks which makes it even more complicated to synchronize the states of different micro-frontends. 
One most common solution is CustomEvent. Within the same web app, one micro-frontend can dispatch a custom event to a HTML element. At the same time, one micro-frontend can create a listener on the same HTML element that handles custom event. Assuming that there are two developer teams building two different micro-frontends, they should agree on what HTML element they would use as the target of custom event, what event name should be used, and what data format they are transmitting through this custom event.

![](https://raw.githubusercontent.com/xzifan/mini-micro-frontend/main/public/CustomEvent.png)


There are also other solutions, like localStorage, URL hash values, and cookies. These would not be the most common way to implement communication between micro-frontends, but they also work well on some special occasions. 
Even though it is possible to implement communication between micro-frontends, it is not recommended to implement a lot of communication between micro-frontends. Micro-frontends are supposed to be separated around their own domain. According to the Single-spa team (Single-spa team, 2022), “A good architecture is one in which micro-frontends are decoupled and do not need to frequently communicate.” When we realize we have to implement a lot of communication to make the micro-frontends work together, we should consider redefining the scope of each micro-frontends instead of maintaining the code for communication between these micro-frontends. 
