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
    let winner: number = 0;

    $: ({ clientComponents, torii, client, planetelo, actions, dojoProvider } = $dojoStore);

    
    let get_status = async () => {
        status = parseInt(await planetelo.get_status($account!.address, "0x64656d6f", "0x50"));
        elo = await planetelo.get_elo($account!.address, "0x64656d6f", "0x50");
        queue_length = parseInt(await planetelo.get_queue_length("0x64656d6f", "0x50"));
        if (status == 2) {
            game_id = parseInt(await planetelo.get_player_game_id($account!.address, "0x64656d6f", "0x50"));
            winner = parseInt(await actions.get_game_winner(game_id));
            console.log(winner)
            console.log(status)
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

    async function handleSettle() {
        let res = await $account?.execute(
            [{
                contractAddress: planetelo.address,
                entrypoint: 'settle',
                calldata: ["0x64656d6f", game_id!]
            }]
        );
        console.log(res);
    }
</script>

<!-- TODO: Add a status display -->

<main>
    <a href="https://github.com/ZackAmes/planetelo_starter" class="github-link" target="_blank" rel="noopener noreferrer">
        <svg height="32" width="32" viewBox="0 0 16 16">
            <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
        </svg>
    </a>

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
                {#if secret != 0}
                    <p class="secret">{secret}</p>
                {/if}
            </div>
            {#if status === 2}
                {#if winner !== 0}
                    <div class="winner-container">
                        <p class="winner-text">Player {winner} Won!</p>
                        <button 
                            class="queue-button settle" 
                            on:click={handleSettle}
                        >
                            Settle
                        </button>
                    </div>
                {:else}
                    <div class="guess-container">
                        <button 
                            class="queue-button playing" 
                            on:click={handleSettle}
                        >
                            Settle
                        </button>
                    </div>
                {/if}
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
        font-size: 1.4rem;
        color: #FF4081;
        font-weight: bold;
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
        font-size: 1.4rem;
        margin: 0.5rem 0;
        color: #1E88E5;
        font-weight: bold;
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

    .winner-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }

    .winner-text {
        font-size: 2.5rem;
        font-weight: bold;
        color: #FF4081;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        margin: 0;
    }

    .queue-button.settle {
        background-color: #9C27B0;
    }

    .queue-button.settle:hover {
        background-color: #7B1FA2;
    }

    .secret {
        color: transparent;
        user-select: none;
        pointer-events: none;
    }

    .github-link {
        position: fixed;
        top: 1rem;
        left: 1rem;
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
</style>
