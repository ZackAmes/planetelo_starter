import type { SchemaType } from "@dojoengine/sdk";

// Type definition for `game::models::CounterValue` struct
export interface CounterValue {
	fieldOrder: string[];
	value: number;
}

// Type definition for `game::models::Counter` struct
export interface Counter {
	fieldOrder: string[];
	key: number;
	value: number;
}

// Type definition for `game::models::Guess` struct
export interface Guess {
	fieldOrder: string[];
	player: string;
	session_id: number;
	guess: number;
}

// Type definition for `game::models::GuessValue` struct
export interface GuessValue {
	fieldOrder: string[];
	guess: number;
}

// Type definition for `game::models::SessionValue` struct
export interface SessionValue {
	fieldOrder: string[];
	player1: string;
	player2: string;
	secret: number;
	winner: number;
}

// Type definition for `game::models::Session` struct
export interface Session {
	fieldOrder: string[];
	session_id: number;
	player1: string;
	player2: string;
	secret: number;
	winner: number;
}

export interface GameSchemaType extends SchemaType {
	game: {
		CounterValue: CounterValue,
		Counter: Counter,
		Guess: Guess,
		GuessValue: GuessValue,
		SessionValue: SessionValue,
		Session: Session,
		ERC__Balance: ERC__Balance,
		ERC__Token: ERC__Token,
		ERC__Transfer: ERC__Transfer,
	},
}
export const schema: GameSchemaType = {
	game: {
		CounterValue: {
			fieldOrder: ['value'],
			value: 0,
		},
		Counter: {
			fieldOrder: ['key', 'value'],
			key: 0,
			value: 0,
		},
		Guess: {
			fieldOrder: ['player', 'session_id', 'guess'],
			player: "",
			session_id: 0,
			guess: 0,
		},
		GuessValue: {
			fieldOrder: ['guess'],
			guess: 0,
		},
		SessionValue: {
			fieldOrder: ['player1', 'player2', 'secret', 'winner'],
			player1: "",
			player2: "",
			secret: 0,
			winner: 0,
		},
		Session: {
			fieldOrder: ['session_id', 'player1', 'player2', 'secret', 'winner'],
			session_id: 0,
			player1: "",
			player2: "",
			secret: 0,
			winner: 0,
		},
		ERC__Balance: {
			fieldOrder: ['balance', 'type', 'tokenmetadata'],
			balance: '',
			type: 'ERC20',
			tokenMetadata: {
				fieldOrder: ['name', 'symbol', 'tokenId', 'decimals', 'contractAddress'],
				name: '',
				symbol: '',
				tokenId: '',
				decimals: '',
				contractAddress: '',
			},
		},
		ERC__Token: {
			fieldOrder: ['name', 'symbol', 'tokenId', 'decimals', 'contractAddress'],
			name: '',
			symbol: '',
			tokenId: '',
			decimals: '',
			contractAddress: '',
		},
		ERC__Transfer: {
			fieldOrder: ['from', 'to', 'amount', 'type', 'executed', 'tokenMetadata'],
			from: '',
			to: '',
			amount: '',
			type: 'ERC20',
			executedAt: '',
			tokenMetadata: {
				fieldOrder: ['name', 'symbol', 'tokenId', 'decimals', 'contractAddress'],
				name: '',
				symbol: '',
				tokenId: '',
				decimals: '',
				contractAddress: '',
			},
			transactionHash: '',
		},

	},
};
// Type definition for ERC__Balance struct
export type ERC__Type = 'ERC20' | 'ERC721';
export interface ERC__Balance {
    fieldOrder: string[];
    balance: string;
    type: string;
    tokenMetadata: ERC__Token;
}
export interface ERC__Token {
    fieldOrder: string[];
    name: string;
    symbol: string;
    tokenId: string;
    decimals: string;
    contractAddress: string;
}
export interface ERC__Transfer {
    fieldOrder: string[];
    from: string;
    to: string;
    amount: string;
    type: string;
    executedAt: string;
    tokenMetadata: ERC__Token;
    transactionHash: string;
}