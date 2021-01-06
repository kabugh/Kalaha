import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import VueProgressBar from "@aacassandra/vue3-progressbar";

const options = {
  color: "rgb(143, 255, 199)",
  failedColor: "#e26a6a",
  thickness: "6px",
  transition: {
    speed: "0.1s",
    opacity: "0.2s",
    termination: 100
  },
  autoRevert: true,
  location: "top",
  inverse: true,
  autoFinish: false
};

const app = createApp(App);
app
  .use(store)
  .use(router)
  .use(VueProgressBar, options)
  .provide("progressBar", app.config.globalProperties.$Progress)
  .mount("#app");
