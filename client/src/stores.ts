import { writable } from "svelte/store";
import { type SetupResult } from "./dojo/setup";
import { type AccountInterface } from "starknet";

export const dojoStore = writable<SetupResult>();
export const account = writable<AccountInterface | null>();
export const username = writable<string | null>();

