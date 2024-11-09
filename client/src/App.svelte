<script lang="ts">
    import type { Entity } from "@dojoengine/recs";
    import {
        componentValueStore,
        type ComponentStore,
    } from "./dojo/componentValueStore";
    import { dojoStore, account } from "./stores";

    let entityId: Entity;
    let session: ComponentStore;

    $: ({ clientComponents, torii, client } = $dojoStore);

</script>

<main>
    {#if $dojoStore}
        <p>Setup completed</p>
    {:else}
        <p>Setting up...</p>
    {/if}

    
</main>
