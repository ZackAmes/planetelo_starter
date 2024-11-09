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

    // @ts-ignore
    let player_status = await planetelo.get_status(get(account)!.address, 'demo'.toString(16), '0x50');
    console.log(player_status);

    const app = new App({
        target: document.getElementById("app")!,
    });

    return app;
}

export default initApp();
