import "./app.css";
import App from "./App.svelte";
import { setup } from "./dojo/setup";
import { dojoConfig } from "../dojoConfig";
import { account, dojoStore } from "./stores";
import { connect } from "./dojo/controller";
import { get } from "svelte/store";

async function initApp() {
    // Set up dojo
    let setupRes = await setup(dojoConfig);
    console.log(setupRes.actions)
    dojoStore.set(setupRes);

    console.log("App initialized");

    let { planetelo, actions } = setupRes;

    const app = new App({
        target: document.getElementById("app")!,
    });

    return app;
}

export default initApp();
