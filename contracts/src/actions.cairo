
use starknet::ContractAddress;

#[starknet::interface]
trait IActions<T> {
    fn create_session(ref self: T, player1: ContractAddress, player2: ContractAddress, secret: u32) -> u32;
    fn guess(ref self: T, session_id: u32, value: u32);
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

        // Implementation of the move function for the ContractState struct.
        fn guess(ref self: ContractState, session_id: u32, value: u32) {
            let mut world = self.world(@"game");

            let player = get_caller_address();
            let mut session: Session = world.read_model(session_id);
            assert!(session.player1 == player || session.player2 == player, "Player is not in this session");
            let mut guess: Guess = world.read_model((player, session_id));
            assert!(guess.guess == 0, "Player has already guessed");

            let player_id = if session.player1 == player { 1 } else { 2 };
            if session.secret == value {
                session.winner = player_id;
            }

            guess.guess = value;
            world.write_model(@guess);
        }
    }

}
