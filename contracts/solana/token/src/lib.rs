use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
    program_pack::{IsInitialized, Pack, Sealed},
    sysvar::{rent::Rent, Sysvar},
};
use std::mem::size_of;

// 定义代币指令
#[repr(C)]
pub enum TokenInstruction {
    // 初始化代币
    InitializeMint {
        decimals: u8,
        mint_authority: Pubkey,
    },
    // 铸造代币
    MintTo {
        amount: u64,
    },
    // 转账代币
    Transfer {
        amount: u64,
    },
    // 销毁代币
    Burn {
        amount: u64,
    },
}

// 定义代币账户状态
#[repr(C)]
#[derive(Clone, Copy, Debug, Default, PartialEq)]
pub struct TokenAccount {
    pub is_initialized: bool,
    pub owner: Pubkey,
    pub amount: u64,
}

// 定义代币铸造账户状态
#[repr(C)]
#[derive(Clone, Copy, Debug, Default, PartialEq)]
pub struct Mint {
    pub is_initialized: bool,
    pub mint_authority: Pubkey,
    pub supply: u64,
    pub decimals: u8,
}

impl Sealed for TokenAccount {}
impl Sealed for Mint {}

impl IsInitialized for TokenAccount {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

impl IsInitialized for Mint {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

impl Pack for TokenAccount {
    const LEN: usize = size_of::<TokenAccount>();
    
    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let account = TokenAccount {
            is_initialized: src[0] != 0,
            owner: Pubkey::new(&src[1..33]),
            amount: u64::from_le_bytes([
                src[33], src[34], src[35], src[36], 
                src[37], src[38], src[39], src[40],
            ]),
        };
        Ok(account)
    }

    fn pack_into_slice(&self, dst: &mut [u8]) {
        dst[0] = self.is_initialized as u8;
        dst[1..33].copy_from_slice(self.owner.as_ref());
        dst[33..41].copy_from_slice(&self.amount.to_le_bytes());
    }
}

impl Pack for Mint {
    const LEN: usize = size_of::<Mint>();
    
    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let mint = Mint {
            is_initialized: src[0] != 0,
            mint_authority: Pubkey::new(&src[1..33]),
            supply: u64::from_le_bytes([
                src[33], src[34], src[35], src[36], 
                src[37], src[38], src[39], src[40],
            ]),
            decimals: src[41],
        };
        Ok(mint)
    }

    fn pack_into_slice(&self, dst: &mut [u8]) {
        dst[0] = self.is_initialized as u8;
        dst[1..33].copy_from_slice(self.mint_authority.as_ref());
        dst[33..41].copy_from_slice(&self.supply.to_le_bytes());
        dst[41] = self.decimals;
    }
}

// 程序入口点
entrypoint!(process_instruction);

// 处理指令
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    if instruction_data.is_empty() {
        return Err(ProgramError::InvalidInstructionData);
    }

    let instruction = match instruction_data[0] {
        0 => {
            if instruction_data.len() < 34 {
                return Err(ProgramError::InvalidInstructionData);
            }
            let decimals = instruction_data[1];
            let mint_authority = Pubkey::new(&instruction_data[2..34]);
            TokenInstruction::InitializeMint {
                decimals,
                mint_authority,
            }
        },
        1 => {
            if instruction_data.len() < 9 {
                return Err(ProgramError::InvalidInstructionData);
            }
            let amount = u64::from_le_bytes([
                instruction_data[1], instruction_data[2], instruction_data[3], instruction_data[4],
                instruction_data[5], instruction_data[6], instruction_data[7], instruction_data[8],
            ]);
            TokenInstruction::MintTo { amount }
        },
        2 => {
            if instruction_data.len() < 9 {
                return Err(ProgramError::InvalidInstructionData);
            }
            let amount = u64::from_le_bytes([
                instruction_data[1], instruction_data[2], instruction_data[3], instruction_data[4],
                instruction_data[5], instruction_data[6], instruction_data[7], instruction_data[8],
            ]);
            TokenInstruction::Transfer { amount }
        },
        3 => {
            if instruction_data.len() < 9 {
                return Err(ProgramError::InvalidInstructionData);
            }
            let amount = u64::from_le_bytes([
                instruction_data[1], instruction_data[2], instruction_data[3], instruction_data[4],
                instruction_data[5], instruction_data[6], instruction_data[7], instruction_data[8],
            ]);
            TokenInstruction::Burn { amount }
        },
        _ => return Err(ProgramError::InvalidInstructionData),
    };

    match instruction {
        TokenInstruction::InitializeMint { decimals, mint_authority } => {
            msg!("Instruction: InitializeMint");
            process_initialize_mint(accounts, decimals, mint_authority, program_id)
        },
        TokenInstruction::MintTo { amount } => {
            msg!("Instruction: MintTo");
            process_mint_to(accounts, amount, program_id)
        },
        TokenInstruction::Transfer { amount } => {
            msg!("Instruction: Transfer");
            process_transfer(accounts, amount, program_id)
        },
        TokenInstruction::Burn { amount } => {
            msg!("Instruction: Burn");
            process_burn(accounts, amount, program_id)
        },
    }
}

// 初始化代币铸造账户
fn process_initialize_mint(
    accounts: &[AccountInfo],
    decimals: u8,
    mint_authority: Pubkey,
    program_id: &Pubkey,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let mint_info = next_account_info(account_info_iter)?;
    let rent_info = next_account_info(account_info_iter)?;

    if mint_info.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    let rent = &Rent::from_account_info(rent_info)?;
    if !rent.is_exempt(mint_info.lamports(), mint_info.data_len()) {
        return Err(ProgramError::AccountNotRentExempt);
    }

    let mut mint_data = mint_info.data.borrow_mut();
    let mut mint = Mint::unpack_unchecked(&mint_data)?;
    if mint.is_initialized {
        return Err(ProgramError::AccountAlreadyInitialized);
    }

    mint.is_initialized = true;
    mint.mint_authority = mint_authority;
    mint.supply = 0;
    mint.decimals = decimals;
    
    Mint::pack(mint, &mut mint_data)?;

    Ok(())
}

// 铸造代币
fn process_mint_to(
    accounts: &[AccountInfo],
    amount: u64,
    program_id: &Pubkey,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let mint_info = next_account_info(account_info_iter)?;
    let destination_info = next_account_info(account_info_iter)?;
    let authority_info = next_account_info(account_info_iter)?;

    if mint_info.owner != program_id || destination_info.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    let mut mint_data = mint_info.data.borrow_mut();
    let mut mint = Mint::unpack(&mint_data)?;

    if authority_info.key != &mint.mint_authority {
        return Err(ProgramError::InvalidAccountData);
    }

    let mut destination_data = destination_info.data.borrow_mut();
    let mut destination = TokenAccount::unpack(&destination_data)?;

    mint.supply = mint.supply.checked_add(amount).ok_or(ProgramError::InvalidArgument)?;
    destination.amount = destination.amount.checked_add(amount).ok_or(ProgramError::InvalidArgument)?;

    Mint::pack(mint, &mut mint_data)?;
    TokenAccount::pack(destination, &mut destination_data)?;

    Ok(())
}

// 转账代币
fn process_transfer(
    accounts: &[AccountInfo],
    amount: u64,
    program_id: &Pubkey,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let source_info = next_account_info(account_info_iter)?;
    let destination_info = next_account_info(account_info_iter)?;
    let authority_info = next_account_info(account_info_iter)?;

    if source_info.owner != program_id || destination_info.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    let mut source_data = source_info.data.borrow_mut();
    let mut source = TokenAccount::unpack(&source_data)?;

    if authority_info.key != &source.owner {
        return Err(ProgramError::InvalidAccountData);
    }

    let mut destination_data = destination_info.data.borrow_mut();
    let mut destination = TokenAccount::unpack(&destination_data)?;

    if amount > source.amount {
        return Err(ProgramError::InsufficientFunds);
    }

    source.amount = source.amount.checked_sub(amount).ok_or(ProgramError::InvalidArgument)?;
    destination.amount = destination.amount.checked_add(amount).ok_or(ProgramError::InvalidArgument)?;

    TokenAccount::pack(source, &mut source_data)?;
    TokenAccount::pack(destination, &mut destination_data)?;

    Ok(())
}

// 销毁代币
fn process_burn(
    accounts: &[AccountInfo],
    amount: u64,
    program_id: &Pubkey,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let source_info = next_account_info(account_info_iter)?;
    let mint_info = next_account_info(account_info_iter)?;
    let authority_info = next_account_info(account_info_iter)?;

    if source_info.owner != program_id || mint_info.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    let mut source_data = source_info.data.borrow_mut();
    let mut source = TokenAccount::unpack(&source_data)?;

    if authority_info.key != &source.owner {
        return Err(ProgramError::InvalidAccountData);
    }

    let mut mint_data = mint_info.data.borrow_mut();
    let mut mint = Mint::unpack(&mint_data)?;

    if amount > source.amount {
        return Err(ProgramError::InsufficientFunds);
    }

    source.amount = source.amount.checked_sub(amount).ok_or(ProgramError::InvalidArgument)?;
    mint.supply = mint.supply.checked_sub(amount).ok_or(ProgramError::InvalidArgument)?;

    TokenAccount::pack(source, &mut source_data)?;
    Mint::pack(mint, &mut mint_data)?;

    Ok(())
} 