
use starknet::ContractAddress;

#[starknet::interface]
trait IActions<T> {
    fn create_session(ref self: T, player1: ContractAddress, player2: ContractAddress, secret: u32) -> u32;
    fn guess(ref self: T, session_id: u32, value: u32);
    fn get_secret(self: @T, session_id: u32) -> u32;
    fn get_game_winner(self: @T, session_id: u32) -> u8;
}

// dojo decorator
#[dojo::contract]
pub mod actions {
    use super::{IActions};
    use starknet::{ContractAddress, get_caller_address};
    use game::models::{Session, Guess, Counter, CounterTrait};

    use dojo::model::{ModelStorage, ModelValueStorage};
    use dojo::event::EventStorage;

   

    #[abi(embed_v0)]
    impl ActionsImpl of IActions<ContractState> {
        fn create_session(ref self: ContractState, player1: ContractAddress, player2: ContractAddress, secret: u32) -> u32{
            let mut world = self.world(@"game");
            let mut counter: Counter = world.read_model(0);
            let id = counter.uuid();
            world.write_model(@counter);

            let session = Session {
                session_id: id, player1, player2, secret, winner: 0
            };
            world.write_model(@session);
            id
        }

        fn get_secret(self: @ContractState, session_id: u32) -> u32 {
            let mut world = self.world(@"game");
            let session: Session = world.read_model(session_id);
            session.secret
        }

        // Implementation of the move function for the ContractState struct.
        fn guess(ref self: ContractState, session_id: u32, value: u32) {
            let mut world = self.world(@"game");

            let player = get_caller_address();
            let mut session: Session = world.read_model(session_id);
            assert!(session.player1 == player || session.player2 == player, "Player is not in this session");
            let mut guess: Guess = world.read_model((player, session_id));
            assert!(session.winner == 0, "Game is already over");

            if session.player1 == player && session.secret == value {
                session.winner = 1;
            }
            else if session.player2 == player && session.secret == value {
                session.winner = 2;
            }

            guess.guess = value;
            world.write_model(@guess);
            world.write_model(@session);
        }

        fn get_game_winner(self: @ContractState, session_id: u32) -> u8 {
            let mut world = self.world(@"game");
            let session: Session = world.read_model(session_id);
            session.winner
        }
    }


}
