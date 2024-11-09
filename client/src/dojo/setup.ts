import type { DojoConfig } from "@dojoengine/core";
import { DojoProvider } from "@dojoengine/core";
import * as torii from "@dojoengine/torii-client";
import { createClientComponents } from "./createClientComponents";
import { defineContractComponents } from "./typescript/models.gen";
import { world } from "./world";
import { setupWorld } from "./typescript/contracts.gen";
import { Account } from "starknet";
import type { ArraySignatureType } from "starknet";
import { BurnerManager } from "@dojoengine/create-burner";
import { getSyncEntities, getSyncEvents } from "@dojoengine/state";
import { connect } from "./controller";
import manifest from "./manifest_sepolia.json";
import { Contract } from "starknet";
import { type Abi } from "starknet";
export type SetupResult = Awaited<ReturnType<typeof setup>>;

export async function setup({ ...config }: DojoConfig) {
    // torii clientc
    console.log(config);
    const toriiClient = await torii.createClient({
        rpcUrl: config.rpcUrl,
        toriiUrl: config.toriiUrl,
        relayUrl: "",
        worldAddress: config.manifest.world.address || "",
    });

    // create contract components
    const contractComponents = defineContractComponents(world);

    // create client components
    const clientComponents = createClientComponents({ contractComponents });

    // create dojo provider
    console.log(config.rpcUrl);
    const dojoProvider = new DojoProvider(config.manifest, config.rpcUrl);

    const planetelo = new Contract(manifest.contracts[0].abi, manifest.contracts[0].address).typedv2(manifest.contracts[0].abi as Abi);

    const sync = await getSyncEntities(
        toriiClient,
        contractComponents as any,
        undefined,
        []
    );

    const eventSync = getSyncEvents(
        toriiClient,
        contractComponents as any,
        undefined,
        []
    );

    // setup world
    const client = await setupWorld(dojoProvider);
    await connect();

    
    return {
        client,
        clientComponents,
        contractComponents,
        publish: (typedData: string, signature: ArraySignatureType) => {
            toriiClient.publishMessage(typedData, signature);
        },
        planetelo,
        config,
        dojoProvider,
        toriiClient,
        eventSync,
        torii,
        sync,
    };
}
