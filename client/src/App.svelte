<script lang="ts">
    import type { Entity } from "@dojoengine/recs";
    import {
        componentValueStore,
        type ComponentStore,
    } from "./dojo/componentValueStore";
    import { dojoStore, account } from "./stores";

    let entityId: Entity;
    let session: ComponentStore;

    $: ({ clientComponents, torii, client, planetelo } = $dojoStore);

    async function handleQueue() {
        console.log(planetelo.address)

        let res = await $account?.execute(
            [{
                contractAddress: planetelo.address,
                entrypoint: 'queue',
                calldata: ["0x64656d6f", "0x50"]
            }]
        );
        console.log(res);
    }

</script>

<main>
    {#if $dojoStore}
        <div class="queue-container">
            <button 
                class="queue-button" 
                on:click={handleQueue}
            >
            </button>
        </div>
    {:else}
        <p>Setting up...</p>
    {/if}
</main>

<style>
    .queue-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        gap: 1rem;
    }

    .queue-button {
        padding: 2rem 4rem;
        font-size: 1.5rem;
        font-weight: bold;
        border-radius: 1rem;
        border: none;
        cursor: pointer;
        background-color: #4CAF50;
        color: white;
        transition: all 0.3s ease;
    }

    .queue-button:hover {
        transform: scale(1.05);
        background-color: #45a049;
    }

    .queue-button.queuing {
        background-color: #f44336;
    }

    .queue-button.queuing:hover {
        background-color: #da190b;
    }

    .status {
        font-size: 1.2rem;
        color: #666;
    }
</style>
