## Horizontal Split  

### The root of a micro frontend

When using different virtual dom frameworks, operating elements across framworks can be difficult. These frameworks have their own lifecycle and their states are computed in based on their own rules.

However, most frontend frameworks that uses virtual DOM will have a real DOM element as the mount point.  Once the state is computed, the framework will render the content inside the mount point.

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

These functions are the roots of micro frontends. We can make use of these functions when we want to render a complete copy of that micro frontend application.

### Communication between micro frontends

In Horizontal Split, there are more cases that two micro-frontends need to communicate. 

Parent & Child Micro Frontends

It is very important for teams to document correctly what events do the micro frontends listen to and emits.

Evaluating the extensibility of a micro frontend. “When the  business domain leaks into its container, you have to review whether you are implementing a micro frontend or a component” --Building Micro Frontends by Luca Mezzalira
