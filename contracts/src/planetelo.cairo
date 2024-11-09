
use starknet::ContractAddress;

//can inlude custom game specific playlists and logic here
//and create custom logic for managing the playlists
//see octoguns for an example of how to include custom playlist logic
#[starknet::interface]
pub trait IPlanetelo<T> {
    fn register(ref self: T);
    fn get_name(self: @T) -> felt252;
}

#[dojo::contract]
mod planetelo {
    use super::IPlanetelo;
    use planetelo_interface::interfaces::planetelo::{IOneOnOne, Status};
    use planetelo_interface::interfaces::planetary::{PlanetaryTrait, 
                                                    IPlanetaryActions,IPlanetaryActionsDispatcher, IPlanetaryActionsDispatcherTrait};
    use game::actions::{IActions, IActionsDispatcher, IActionsDispatcherTrait};

    use game::dice::{Dice, DiceTrait, DiceImpl};
    use game::models::{Session, Guess};

    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use dojo::world::{WorldStorage, WorldStorageTrait};

    use dojo::model::{ModelStorage, ModelValueStorage, Model};

    fn dojo_init(self: @ContractState) {
        let planetary: WorldStorage = PlanetaryTrait::new();
        let (contract_address, _) = planetary.dns(@"planetary_actions").unwrap();
        let planetary_actions = IPlanetaryActionsDispatcher {contract_address};
        planetary_actions.register('demo', self.world(@"demo").dispatcher.contract_address);
    }

    #[abi(embed_v0)]
    impl PlaneteloImpl of IPlanetelo<ContractState> {
        fn register(ref self: ContractState) {

            let planetary: WorldStorage = PlanetaryTrait::new();
            let (contract_address, _) = planetary.dns(@"planetary_actions").unwrap();
            let planetary_actions = IPlanetaryActionsDispatcher {contract_address};
            planetary_actions.register('demo', self.world(@"demo").dispatcher.contract_address);

        }

        fn get_name(self: @ContractState) -> felt252 {
            'demo'
        }
    }

    #[abi(embed_v0)]
    impl OneOnOneImpl of IOneOnOne<ContractState> {
        fn create_match(ref self: ContractState, p1: ContractAddress, p2: ContractAddress, playlist_id: u128) -> u128{
            
            //This is the worldstorage you use to access your playlists if you have any
            //let mut world = self.world(@"planetelo");


            let mut game = self.world(@"game");
            let (contract_address, _) = game.dns(@"actions").unwrap();
            let dispatcher = IActionsDispatcher {contract_address};
            let mut dice = DiceTrait::new(100, get_block_timestamp().into());

            let secret = dice.roll();
            let id: u128 = dispatcher.create_session(p1, p2, secret).into();
            id

        }

        fn settle_match(ref self: ContractState, match_id: u128) -> Status {
            let mut world = self.world(@"game");
            let session: Session = world.read_model(match_id);

            if session.winner == 0 {
                Status::Active
            } else {
                if session.winner == 1 {
                    Status::Winner(session.player1)
                } else {
                    Status::Winner(session.player2)
                }
            }
            //also can return Status::Draw if you want to support draws
        }
    }
}


