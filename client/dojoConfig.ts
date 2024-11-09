import manifest from "../contracts/manifest_dev.json";

import { createDojoConfig } from "@dojoengine/core";

export const dojoConfig = createDojoConfig({
    rpcUrl: "https://api.cartridge.gg/x/starknet/sepolia",
    toriiUrl: "https://api.cartridge.gg/x/starter-demo/torii",
    manifest,
});
