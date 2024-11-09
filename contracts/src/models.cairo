use starknet::ContractAddress;
#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct Session {
    #[key]
    pub session_id: u32,
    pub player1: ContractAddress,
    pub player2: ContractAddress,
    pub secret: u32,
    pub winner: u8
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct Guess {
    #[key]
    pub player: ContractAddress,
    #[key]
    pub session_id: u32,
    pub guess: u32,
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct Counter {
    #[key]
    pub key: felt252,
    pub value: u32,
}

#[generate_trait]
impl CounterImpl of CounterTrait {
    fn uuid(ref self: Counter) -> u32 {
        let id = self.value;
        self.value += 1;
        id
    }
}


