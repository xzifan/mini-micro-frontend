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
            dependencies: string []
        }
        __microApp_ready: string []
        renderer: {
            [name: string] : (element?: HTMLElement) => void 
        }
    }
}
declare var System: any
interface MicroApp {
    name: string
    route: string
    resources: string[]
    props: Object
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
    const spinner = document.createElement('div')
    spinner.className = 'spinner'
    container.appendChild(spinner)
    document.body.appendChild(container)
    try {
        appConfig.init()
    } catch (error) {
        throw new Error(`App ${appConfig.name}: route registration error\n ${JSON.stringify(error)}`);
    }
}
const miniMF = {
    registerApplication
}
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

        if (container && app.props) {
            container.setAttribute('data-props', JSON.stringify(app.props))
        }
    })
}
const loadAppResources = async (app: MicroApp) => {
    if (app.resources && app.resources.length > 0) {
        app.resources.forEach(async (item) => {
            if (/css/.test(item)) {
                const style = document.createElement('link')
                style.type = 'text/css'
                style.rel = "stylesheet"
                style.href = item
                document.head.appendChild(style)
            } else 
            await System.import(item)

            try {
                // execute renderer once the resources are loaded
                window.renderer[app.name]()
            } catch (error) {
                throw new Error(`Micro app renderer error. \n There is no corresponding renderer function for app ${app.name}`)
            }
        })
        window.__microApp_ready.push(app.name)
        // if (window.renderer && window.renderer[app.name])
    }
}
window.addEventListener('hashchange', function (e) {
    console.log('hash changed')
    switchMicroApp()
})
window.onload = function (e) {
    console.log('window is loaded')
    switchMicroApp()
}
window.addEventListener('DOMContentLoaded', (event) => {
    let list = []
    if (window.microAppConfig?.dependencies && Array.isArray(window.microAppConfig.dependencies)) {
        list = window.microAppConfig.dependencies.map(item=>{
            // load vendor.js or other dependencies
            return System.import(item)
        })
    }
    Promise.all(list).then(()=>{
        if (window.microAppConfig?.apps && Array.isArray(window.microAppConfig.apps)){
            window.microAppConfig.apps.forEach(app => {
                registerApplication({
                    name: app.name,
                    init: typeof app.route === 'undefined' ? async ()=>{
                        await loadAppResources(app)
                    } : ()=>{},
                    route: app.route
                })
            })
        } 
    }).catch(error=>{
        console.error(error)
    })

    window.__router.init()
});


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