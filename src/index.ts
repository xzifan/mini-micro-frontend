import './index.scss'
import * as history from 'history'
declare global {
    interface Window {
        miniMF?: any
        __router: any
        __history: any
        System: any
        microAppConfig: {
            apps: MicroApp[]
        }
    }
}
declare var System: any
interface MicroApp {
    name: string
    route: string
    resources: string[]
}

// Simple usage
// registerApplication(
//     'app2',
//     () => import('src/app2/main.js'),
//     (location) => location.pathname.startsWith('/app2'),
//     { some: 'value' }
//   );
// @ts-ignore
var router = new Router();

window.__router = router
window.__history = history.createHashHistory()
async function registerApplication(appConfig: { name: string, init: () => void, route: string, props?: Object }) {
    const container = document.createElement('div')
    container.id = appConfig.name
    container.className = 'app-container'
    document.body.appendChild(container)
    try {
        appConfig.init()
        window.__router.on(appConfig.route, function () {
            try {
                window.microAppConfig.apps.map(app => {
                    const container = document.getElementById(app.name)
                    if (container) {
                        if (appConfig.route === app.route) {
                            container.style.display = 'block'
                        } else {
                            container.style.display = 'none'
                        }
                    }
                })
            } catch (error) {
                throw new Error(`App ${appConfig.name}: initialization error\n ${JSON.stringify(error)}`,);
            }
        })
    } catch (error) {
        throw new Error(`App ${appConfig.name}: route registration error\n ${JSON.stringify(error)}`);
    }
}
const miniMF = {
    registerApplication
}
window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed', document.body.innerHTML, window.microAppConfig);
    if (window.microAppConfig?.apps && Array.isArray(window.microAppConfig.apps))
        window.microAppConfig.apps.forEach(app => {
            registerApplication({
                name: app.name,
                init: () => {
                    console.log('init app ' + app.name)
                    if (app.resources && app.resources.length > 0) {
                        app.resources.forEach(item => {
                            if (/css/.test(item)) {
                                const style = document.createElement('link')
                                style.type = 'text/css'
                                style.rel = "stylesheet"
                                style.href = item
                                document.head.appendChild(style)
                            } else 
                            System.import(item)
                        })
                    }
                },
                route: app.route
            })
        })
});
window.onload = function (e) {
    console.log('window is loaded')
    window.__router.init()
}

// const fetchCSS = (url: string) => {
//     fetch(url).then(res => {
//         return res.body
//     }).then(body => {
//         if (body) {
//             const reader = body.getReader();
//             return new ReadableStream({
//                 start(controller) {
//                     // The following function handles each data chunk
//                     function push() {
//                         // "done" is a Boolean and value a "Uint8Array"
//                         reader.read().then(({ done, value }) => {
//                             // If there is no more data to read
//                             if (done) {
//                                 console.log('done', done);
//                                 controller.close();
//                                 return;
//                             }
//                             // Get the data and send it to the browser via the controller
//                             controller.enqueue(value);
//                             // Check chunks by logging to the console
//                             console.log(done, value);
//                             push();
//                         })
//                     }

//                     push();
//                 }
//             });
//         }
//     }).then(stream => {
//         // Respond with our stream
//         return new Response(stream, { headers: { "Content-Type": "text/html" } }).text();
//     }).then(result => {
//         // Do things with result
//         console.log(result);
//         const style = document.createElement('style')
//         //   style.type = 'css/stylesheet'
//         style.innerHTML = result
//         document.head.appendChild(style)
//     });
// }

window.miniMF = miniMF

export default miniMF