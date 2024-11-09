import "./app.css";
import App from "./App.svelte";
import { setup } from "./dojo/setup";
import { dojoConfig } from "../dojoConfig";
import { account, dojoStore } from "./stores";
import { connect } from "./dojo/controller";

async function initApp() {
    // Set up dojo
    let setupRes = await setup(dojoConfig);
    dojoStore.set(setupRes);

    let res = await connect();
    console.log(res);

    console.log("App initialized");

    const app = new App({
        target: document.getElementById("app")!,
    });

    return app;
}

export default initApp();
