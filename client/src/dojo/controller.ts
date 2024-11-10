
import Controller from "@cartridge/controller";
import { account, username, dojoStore} from "../stores";
import manifest from "../../../contracts/manifest_dev.json";
import { get } from "svelte/store";

let contract_address = manifest.contracts[0].address;
export const planeteloContract = "0x52e3d09dd643e4d4f491b3d022d3c67f48c0bf2ceda8e7b3fc83f45d06711bd"

//let contract_address = "0x049d36570d4e46f48e99674bd3fcc8463d4990949b4c6bb434ee877b1830a794"
export const controller = new Controller({
    policies: [
        {
            target: contract_address,
            method: "guess",
        },
        {
            target: planeteloContract,
            method: "queue",
        },
        {
            target: planeteloContract,
            method: "matchmake",
        },
        {
            target: planeteloContract,
            method: "settle",
        }

        // ... other policies
    ],
     rpc: "https://api.cartridge.gg/x/starknet/sepolia" // sepolia, mainnet, or slot. (default sepolia)
});

export async function connect() {
    try {
        const res = await controller.connect();
        if (res) {
            account.set(res);
            username.set(await controller.username()!);
        }

    } catch (e) {
        console.log(e);
    }
}

export async function disconnect() {
    await controller.disconnect();
    account.set(null);
    username.set(null);
}