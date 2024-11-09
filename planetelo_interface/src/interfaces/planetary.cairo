use starknet::{ContractAddress, ClassHash, contract_address_const};
use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait, Resource, WorldStorage, WorldStorageTrait};

#[starknet::interface]
trait IPlanetaryActions<TState> {
    fn register(ref self: TState, name: felt252, world_address: ContractAddress);
    fn unregister(ref self: TState, name: felt252);
    fn get_world_address(ref self: TState, name: felt252) -> ContractAddress;
}

struct PlanetaryStorage {
    world: WorldStorage
}

#[generate_trait]
impl PlanetaryStorageImpl of PlanetaryStorageTrait {
    fn new(world_address: ContractAddress) -> WorldStorage {
        (WorldStorageTrait::new(IWorldDispatcher {contract_address: world_address}, @"planetary"))
    }
}

#[generate_trait]
impl PlanetaryInterfaceImpl of PlanetaryInterfaceTrait {

    const ACTIONS_SELECTOR: felt252 = selector_from_tag!("planetary-planetary_actions");


    fn WORLD_CONTRACT() -> ContractAddress {
        (starknet::contract_address_const::<0x12e4037b9904e439251127d689aed16e4494c3e82a12982ed3183d7bf29350b>())
    }
    //
    // create a new interface
    fn new() -> WorldStorage {
        (PlanetaryStorageTrait::new(Self::WORLD_CONTRACT()))
    }
    fn new_custom(world_address: ContractAddress) -> WorldStorage {
        (PlanetaryStorageTrait::new(world_address))
    }

    //
    // dispatchers
    fn dispatcher(self: PlanetaryStorage) -> IPlanetaryActionsDispatcher {
        let (contract_address, _) = self.world.dns(@"planetary_actions").unwrap();
        (IPlanetaryActionsDispatcher{contract_address})
    }
}
