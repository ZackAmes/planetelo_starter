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
    let planetelo: Contract;
    let actions: Contract;
    let dojoProvider: any;

    $: if ($dojoStore) {
        ({ planetelo, actions, dojoProvider } = $dojoStore);
    }

    //@ts-ignore
    let game_name = "ph".toString(16);
    console.log(game_name)

    let get_status = async () => {
        if ($account) {

            console.log(planetelo?.address) 
            console.log(actions?.address)
            status = parseInt(await planetelo.get_status($account!.address, "0x7068", "0x50"));
            elo = await planetelo.get_elo($account!.address, "0x7068", "0x50");
            queue_length = parseInt(await planetelo.get_queue_length("0x7068", "0x50"));
            if (status == 2) {
                game_id = parseInt(await planetelo.get_player_game_id($account!.address, "0x7068", "0x50"));
                winner = parseInt(await actions.get_game_winner(game_id));
                console.log(winner)
                console.log(status)
                secret = parseInt(await actions.get_secret(game_id));
            }
        } else {
            // Reset status-related variables if no account is connected
            status = 0;
            elo = 0;
            queue_length = 0;
            game_id = null;
            winner = 0;
            secret = 0;
        }
    }

    onMount(() => {
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
                calldata: ["0x7068", "0x50"]
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
                calldata: ["0x7068", "0x50"]
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

    async function handleGuess(value: number) {
        if ($account && game_id !== null) {
            let res = await $account?.execute(
                [{
                    contractAddress: actions.address,
                    entrypoint: 'guess',
                    calldata: [game_id!, value]
                }]
            );
            console.log(res);
        }
    }

    async function handleSettle() {
        if ($account && game_id !== null) {
            let res = await $account?.execute(
                [{
                    contractAddress: planetelo.address,
                    entrypoint: 'settle',
                    calldata: ["0x64656d6f", game_id!]
                }]
            );
            console.log(res);
        }
    }
</script>

<!-- Main Content -->
<main>
    <a href="https://github.com/Runelabsxyz/planetelo_starter" class="github-link" target="_blank" rel="noopener noreferrer">
        <svg height="32" width="32" viewBox="0 0 16 16">
            <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
        </svg>
    </a>

    <!-- Connection Button -->
    <button 
        class="connection-button" 
        on:click={handleConnection}
    >
        {$account ? 'Disconnect' : 'Connect'}
    </button>

    {#if !$account}
        <div class="overlay" aria-modal="true" role="dialog">
            <div class="overlay-content">
                <a href="https://github.com/Runelabxyz/planetelo_starter" class="github-link-overlay" target="_blank" rel="noopener noreferrer">
                    <svg height="24" width="24" viewBox="0 0 16 16">
                        <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                    </svg>
                </a>
                <h2>Connect Your Controller</h2>
                <button class="connect-button" on:click={handleConnection}>
                    <img src="/controller.png" alt="Controller" class="controller-icon" />
                    Connect
                </button>
            </div>
        </div>
    {/if}

    {#if $dojoStore && $account}
        {#if secret != 0}
            <div class="secret-container">
                <p class="secret">{secret}</p>
            </div>
        {/if}
        <div class="queue-container">
            <div class="stats">
                <p>ELO: {elo}</p>
                <p>Players in Queue: {queue_length}</p>
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
                        <input 
                            type="number" 
                            bind:value={guessValue}
                            min="0"
                            max="100"
                            class="guess-input"
                        />
                        <button 
                            class="queue-button playing" 
                            on:click={() => handleGuess(guessValue)}
                        >
                            Guess
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
    {/if}
</main>

<style>
    /* GitHub Link Styles */
    .github-link, .github-link-overlay {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #000000;
        padding: 8px;
        border-radius: 50%;
        color: #ffffff;
        transition: all 0.3s ease;
    }

    .github-link {
        position: fixed;
        top: 1rem;
        left: 1rem;
    }

    .github-link:hover, .github-link-overlay:hover {
        transform: scale(1.1);
        background-color: #333333;
    }

    .github-link svg, .github-link-overlay svg {
        width: 24px;
        height: 24px;
    }

    /* Connection Button */
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

    /* Overlay Styles */
    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .overlay-content {
        background: #fff;
        padding: 2rem;
        border-radius: 1rem;
        text-align: center;
        max-width: 400px;
        width: 90%;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .overlay-content h2 {
        margin-bottom: 1rem;
        font-size: 2rem;
        color: #333;
    }

    .overlay-content p {
        margin-bottom: 1.5rem;
        font-size: 1.2rem;
        color: #555;
    }

    /* Connect Button Styles */
    .connect-button {
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
        font-weight: bold;
        border: none;
        border-radius: 0.5rem;
        background-color: #4CAF50;
        color: white;
        cursor: pointer;
        transition: background-color 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        justify-content: center; /* Center content horizontally */
        width: auto; /* Adjust width to fit content */
    }

    .connect-button:hover {
        background-color: #45a049;
    }

    /* Controller Icon Styles */
    .controller-icon {
        width: 24px; /* Adjust the width as needed */
        height: 24px; /* Adjust the height as needed */
    }

    /* Ensure GitHub Link in Overlay is Consistent */
    .github-link-overlay svg {
        width: 24px;
        height: 24px;
    }

    /* Queue Container */
    .queue-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2rem;
        padding: 2rem;
        max-width: 600px;
        margin: 0 auto;
    }

    /* Stats Styles */
    .stats {
        display: flex;
        gap: 2rem;
        font-size: 1.2rem;
        font-weight: 500;
    }

    .stats p {
        font-size: 1.4rem;
        margin: 0.5rem 0;
        color: #1E88E5;
        font-weight: bold;
    }

    /* Queue Button Styles */
    .queue-button {
        padding: 1rem 2rem;
        font-size: 1.2rem;
        font-weight: 600;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
        background-color: #4CAF50;
        color: white;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .queue-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .queue-button.queuing {
        background-color: #FFA500;
    }

    .queue-button.queuing:hover {
        background-color: #da190b;
    }

    .queue-button.playing {
        background-color: #2196F3;
    }

    .queue-button.playing:hover {
        background-color: #1976D2;
    }

    .queue-button.settle {
        background-color: #9C27B0;
    }

    .queue-button.settle:hover {
        background-color: #7B1FA2;
    }

    /* Status Styles */
    .status {
        font-size: 1.4rem;
        color: #FF4081;
        font-weight: bold;
    }

    .status-message {
        font-size: 1.2rem;
        font-weight: 500;
        margin-bottom: 1rem;
        text-align: center;
    }

    /* Guess Container */
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

    /* Winner Container */
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

    /* Secret Number Styles */
    .secret-container {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        width: 200px;
        height: 100px;
        color: inherit;
    }

    .secret {
        position: absolute;
        color: #444444;
        font-size: 1.2rem;
        user-select: none;
        pointer-events: none;
        left: calc(random() * 100%);
        top: calc(random() * 100%);
    }

    /* Controller Icon in Overlay */
    .overlay-content .controller-icon {
        width: 24px;
        height: 24px;
    }

    /* GitHub Link in Overlay */
    .github-link-overlay {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1.5rem;
    }

    .github-link-overlay svg {
        width: 24px;
        height: 24px;
    }

    /* Responsive Adjustments */
    @media (max-width: 600px) {
        .queue-button {
            padding: 1rem 2rem;
            font-size: 1.2rem;
        }

        .overlay-content h2 {
            font-size: 1.5rem;
        }

        .overlay-content p {
            font-size: 1rem;
        }

        .connect-button {
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
        }

        .controller-icon {
            width: 20px;
            height: 20px;
        }

        .github-link-overlay svg {
            width: 20px;
            height: 20px;
        }
    }
</style>
