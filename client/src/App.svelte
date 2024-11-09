<script lang="ts">
    import type { Entity } from "@dojoengine/recs";
    import {
        componentValueStore,
        type ComponentStore,
    } from "./dojo/componentValueStore";
    import { dojoStore, account, username } from "./stores";
    import { onMount } from "svelte";
    import { connect, disconnect } from "./dojo/controller";
    import manifest from "../../contracts/manifest_dev.json";
  import { Contract, type Abi } from "starknet";
  import { getEntityIdFromKeys } from "@dojoengine/utils";

    let entityId: Entity;
    let session: ComponentStore;
    let status: number = 0;
    let elo: number = 0;
    let intervalId: number;
    let queue_length: number = 0;
    let game_id: number | null = null;
    let guessValue: number = 0;
    let secret: number = 0;

    $: ({ clientComponents, torii, client, planetelo, actions, dojoProvider } = $dojoStore);

    
    let get_status = async () => {
        status = parseInt(await planetelo.get_status($account!.address, "0x64656d6f", "0x50"));
        elo = await planetelo.get_elo($account!.address, "0x64656d6f", "0x50");
        queue_length = await planetelo.get_queue_length("0x64656d6f", "0x50");
        if (game_id) {
            secret = parseInt(await actions.get_secret(game_id!));
            console.log(secret)
        }
        console.log(status)
        if (status == 2) {
            game_id = parseInt(await planetelo.get_player_game_id($account!.address, "0x64656d6f", "0x50"));
            console.log(game_id)

        let winner = await actions.get_game_winner(game_id);
        console.log(winner)
        }

    }

    onMount(() => {
        if (!$account) {
            connect();
        }
        get_status();
        // Poll status every 2 seconds
        intervalId = setInterval(get_status, 2000);

        // Cleanup interval on component destroy
        return () => {
            clearInterval(intervalId);
        };
    });

    async function handleQueue() {
        console.log(planetelo.address);
        let res = await $account?.execute(
            [{
                contractAddress: planetelo.address,
                entrypoint: 'queue',
                calldata: ["0x64656d6f", "0x50"]
            }]
        );
        console.log(res);
    }

    async function handleMatchmake() {
        console.log(planetelo.address);
        let res = await $account?.execute(
            [{
                contractAddress: planetelo.address,
                entrypoint: 'matchmake',
                calldata: ["0x64656d6f", "0x50"]
            }]
        );
        console.log(res);
    }

    async function handleGuess() {
        console.log(planetelo.address);
        let res = await $account?.execute(
            [{
                contractAddress: actions.address,
                entrypoint: 'guess',
                calldata: [game_id!, guessValue]
            }]
        );
        console.log(res);
    }

    async function handlePlay() {
        console.log("Play");
    }

    $: buttonText = status === 0 ? 'Queue' 
                  : status === 1 ? 'Matchmake' 
                  : 'Play';

    $: buttonClass = status === 0 ? '' 
                  : status === 1 ? 'queuing'
                  : 'playing';

    async function handleConnection() {
        if ($account) {
            disconnect();
        } else {
            connect();
        }
    }
</script>

<!-- TODO: Add a status display -->

<main>
    <button 
        class="connection-button" 
        on:click={handleConnection}
    >
        {$account ? 'Disconnect' : 'Connect'}
    </button>

    {#if $dojoStore}
        <div class="queue-container">
            <div class="stats">
                <p>ELO: {elo}</p>
                <p>Players in Queue: {queue_length}</p>
            </div>
            {#if status === 2}
                <div class="guess-container">
                    <input 
                        type="number" 
                        bind:value={guessValue}
                        min="0"
                        max="100"
                        class="guess-input"
                    />
                    <button 
                        class="queue-button playing" 
                        on:click={handleGuess}
                    >
                        Guess
                    </button>
                </div>
            {:else}
                <button 
                    class="queue-button {buttonClass}" 
                    on:click={status == 0 ? handleQueue : handleMatchmake}
                >
                    {buttonText}
                </button>
            {/if}
            {#if status === 1}
                <p class="status">Finding a match...</p>
            {/if}
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

    .queue-button.playing {
        background-color: #2196F3;
    }

    .queue-button.playing:hover {
        background-color: #1976D2;
    }

    .stats {
        text-align: center;
        margin-bottom: 2rem;
    }

    .stats p {
        font-size: 1.2rem;
        margin: 0.5rem 0;
        color: #333;
    }

    .connection-button {
        position: fixed;
        top: 1rem;
        right: 1rem;
        padding: 0.5rem 1rem;
        font-size: 1rem;
        font-weight: bold;
        border-radius: 0.5rem;
        border: none;
        cursor: pointer;
        background-color: #666;
        color: white;
        transition: all 0.3s ease;
    }

    .guess-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }

    .guess-input {
        padding: 1rem;
        font-size: 1.5rem;
        width: 150px;
        text-align: center;
        border: 2px solid #2196F3;
        border-radius: 0.5rem;
        outline: none;
    }
</style>
