import { DojoProvider } from "@dojoengine/core";
import { Account } from "starknet";
import * as models from "./models.gen";

export async function setupWorld(provider: DojoProvider) {

	const planetelo_createMatch = async (account: Account, p1: string, p2: string, playlistId: number) => {
		try {
			return await provider.execute(
				account,
				{
					contractName: "planetelo",
					entryPoint: "create_match",
					calldata: [p1, p2, playlistId],
				}
			);
		} catch (error) {
			console.error(error);
		}
	};

	const planetelo_settleMatch = async (account: Account, matchId: number) => {
		try {
			return await provider.execute(
				account,
				{
					contractName: "planetelo",
					entryPoint: "settle_match",
					calldata: [matchId],
				}
			);
		} catch (error) {
			console.error(error);
		}
	};

	const actions_createSession = async (account: Account, player1: string, player2: string, secret: number) => {
		try {
			return await provider.execute(
				account,
				{
					contractName: "actions",
					entryPoint: "create_session",
					calldata: [player1, player2, secret],
				}
			);
		} catch (error) {
			console.error(error);
		}
	};

	const actions_guess = async (account: Account, sessionId: number, value: number) => {
		try {
			return await provider.execute(
				account,
				{
					contractName: "actions",
					entryPoint: "guess",
					calldata: [sessionId, value],
				}
			);
		} catch (error) {
			console.error(error);
		}
	};

	return {
		planetelo: {
			createMatch: planetelo_createMatch,
			settleMatch: planetelo_settleMatch,
		},
		actions: {
			createSession: actions_createSession,
			guess: actions_guess,
		},
	};
}