
import Controller from "@cartridge/controller";
import { account, username, dojoStore} from "../stores";
import manifest from "../../../contracts/manifest_dev.json";
import { get } from "svelte/store";

let contract_address = "0x3de1fae0c2a57d87794bc2da95a7fda4f33b7314aa2c045cabce591f4762c80";
export const planeteloContract = "0x7a9e8de4cf849402d115efdae32b892235dddbf29e15dcde2222fbcd928a30c"

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