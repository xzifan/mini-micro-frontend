import './index.scss'
declare global {
    interface Window {
        miniMF?: any
        __router: any
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
async function registerApplication(appConfig: {name: string, init: () => void , route: string, props?: Object}) {
    const container = document.createElement('div')
    container.id = appConfig.name
    container.className = 'app-container'
    document.body.appendChild(container)
    try {       
        appConfig.init()
        window.__router.on(appConfig.route, function(){
            try {
                window.microAppConfig.apps.map(app=>{
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
                throw new Error(`App ${appConfig.name}: initialization error\n ${JSON.stringify(error)}`, );
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
                init: ()=>{
                    console.log('init app '+app.name)
                    if (app.resources && app.resources.length > 0) {
                        app.resources.forEach(item=>{ 
                            System.import(item).then((module: any)=>{
                                if (/css/.test(item)) {
                                    const styleSheet = module.default; // A CSSStyleSheet object
                                    console.log(module)
                                    // @ts-ignore
                                    // document.styleSheets[document.styleSheets.length]
                                    document.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet];
                                }
                            })
                        })
                    }
                },
                route: app.route
            })
        })
});
window.onload = function(e) {
    console.log('window is loaded')
    window.__router.init()
}

window.miniMF = miniMF

export default miniMF