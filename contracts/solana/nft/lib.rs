use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
    rent::Rent,
    sysvar::Sysvar,
};

// 定义NFT元数据结构
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct NFTMetadata {
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub creator: Pubkey,
    pub royalty_percentage: u8,
    pub is_mutable: bool,
}

// 定义NFT指令
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum NFTInstruction {
    // 创建NFT
    CreateNFT {
        name: String,
        symbol: String,
        uri: String,
        royalty_percentage: u8,
        is_mutable: bool,
    },
    // 转移NFT
    TransferNFT {
        new_owner: Pubkey,
    },
    // 更新NFT元数据 (如果可变)
    UpdateMetadata {
        name: Option<String>,
        symbol: Option<String>,
        uri: Option<String>,
    },
}

// 程序入口点
entrypoint!(process_instruction);

// 处理指令
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = NFTInstruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    match instruction {
        NFTInstruction::CreateNFT {
            name,
            symbol,
            uri,
            royalty_percentage,
            is_mutable,
        } => {
            msg!("Instruction: CreateNFT");
            process_create_nft(
                program_id,
                accounts,
                name,
                symbol,
                uri,
                royalty_percentage,
                is_mutable,
            )
        }
        NFTInstruction::TransferNFT { new_owner } => {
            msg!("Instruction: TransferNFT");
            process_transfer_nft(program_id, accounts, new_owner)
        }
        NFTInstruction::UpdateMetadata { name, symbol, uri } => {
            msg!("Instruction: UpdateMetadata");
            process_update_metadata(program_id, accounts, name, symbol, uri)
        }
    }
}

// 创建NFT
fn process_create_nft(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    name: String,
    symbol: String,
    uri: String,
    royalty_percentage: u8,
    is_mutable: bool,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    
    // 获取账户信息
    let nft_account = next_account_info(account_info_iter)?;
    let creator_account = next_account_info(account_info_iter)?;
    let rent_account = next_account_info(account_info_iter)?;

    // 验证账户所有权
    if nft_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    // 验证创建者签名
    if !creator_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // 验证租金豁免
    let rent = &Rent::from_account_info(rent_account)?;
    if !rent.is_exempt(nft_account.lamports(), nft_account.data_len()) {
        return Err(ProgramError::AccountNotRentExempt);
    }

    // 检查版税百分比是否有效 (0-100)
    if royalty_percentage > 100 {
        return Err(ProgramError::InvalidArgument);
    }

    // 创建NFT元数据
    let nft_metadata = NFTMetadata {
        name,
        symbol,
        uri,
        creator: *creator_account.key,
        royalty_percentage,
        is_mutable,
    };

    // 序列化并存储元数据
    nft_metadata.serialize(&mut &mut nft_account.data.borrow_mut()[..])?;

    msg!("NFT创建成功");
    Ok(())
}

// 转移NFT
fn process_transfer_nft(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    new_owner: Pubkey,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    
    // 获取账户信息
    let nft_account = next_account_info(account_info_iter)?;
    let current_owner = next_account_info(account_info_iter)?;
    let new_owner_account = next_account_info(account_info_iter)?;

    // 验证账户所有权
    if nft_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    // 反序列化NFT元数据
    let mut nft_metadata = NFTMetadata::try_from_slice(&nft_account.data.borrow())?;

    // 验证当前所有者
    if nft_metadata.creator != *current_owner.key {
        return Err(ProgramError::InvalidAccountData);
    }

    // 验证当前所有者签名
    if !current_owner.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // 验证新所有者账户存在
    if new_owner != *new_owner_account.key {
        return Err(ProgramError::InvalidArgument);
    }

    // 更新所有者
    nft_metadata.creator = new_owner;

    // 序列化并存储更新后的元数据
    nft_metadata.serialize(&mut &mut nft_account.data.borrow_mut()[..])?;

    msg!("NFT转移成功");
    Ok(())
}

// 更新NFT元数据
fn process_update_metadata(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    name: Option<String>,
    symbol: Option<String>,
    uri: Option<String>,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    
    // 获取账户信息
    let nft_account = next_account_info(account_info_iter)?;
    let owner_account = next_account_info(account_info_iter)?;

    // 验证账户所有权
    if nft_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    // 反序列化NFT元数据
    let mut nft_metadata = NFTMetadata::try_from_slice(&nft_account.data.borrow())?;

    // 验证NFT是否可变
    if !nft_metadata.is_mutable {
        return Err(ProgramError::InvalidArgument);
    }

    // 验证所有者
    if nft_metadata.creator != *owner_account.key {
        return Err(ProgramError::InvalidAccountData);
    }

    // 验证所有者签名
    if !owner_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // 更新元数据
    if let Some(new_name) = name {
        nft_metadata.name = new_name;
    }
    if let Some(new_symbol) = symbol {
        nft_metadata.symbol = new_symbol;
    }
    if let Some(new_uri) = uri {
        nft_metadata.uri = new_uri;
    }

    // 序列化并存储更新后的元数据
    nft_metadata.serialize(&mut &mut nft_account.data.borrow_mut()[..])?;

    msg!("NFT元数据更新成功");
    Ok(())
} 