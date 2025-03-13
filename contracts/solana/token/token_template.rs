//! A template for creating an SPL Token on Solana using Anchor framework
//! This template provides the basic functionality for a fungible token on Solana

use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, MintTo, Transfer, Burn};
use std::mem::size_of;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"); // Replace with actual program ID

#[program]
pub mod spl_token_program {
    use super::*;

    /// Initialize a new token mint with specified authority
    pub fn initialize_mint(
        ctx: Context<InitializeMint>,
        decimals: u8,
        name: String,
        symbol: String,
    ) -> Result<()> {
        msg!("Initializing token mint: {}", name);
        
        // Store token metadata in program account
        let token_metadata = &mut ctx.accounts.token_metadata;
        token_metadata.name = name;
        token_metadata.symbol = symbol;
        token_metadata.decimals = decimals;
        token_metadata.mint = ctx.accounts.mint.key();
        token_metadata.authority = ctx.accounts.authority.key();
        token_metadata.total_supply = 0;
        
        Ok(())
    }

    /// Mint new tokens to a token account
    pub fn mint_tokens(
        ctx: Context<MintTokens>,
        amount: u64,
    ) -> Result<()> {
        // Update total supply in metadata
        let token_metadata = &mut ctx.accounts.token_metadata;
        token_metadata.total_supply = token_metadata.total_supply.checked_add(amount).ok_or(ErrorCode::ArithmeticOverflow)?;
        
        // Mint tokens
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        token::mint_to(cpi_ctx, amount)?;
        
        msg!("Minted {} tokens to {}", amount, ctx.accounts.token_account.key());
        
        Ok(())
    }

    /// Transfer tokens from one account to another
    pub fn transfer_tokens(
        ctx: Context<TransferTokens>,
        amount: u64,
    ) -> Result<()> {
        let cpi_accounts = Transfer {
            from: ctx.accounts.from.to_account_info(),
            to: ctx.accounts.to.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        token::transfer(cpi_ctx, amount)?;
        
        msg!("Transferred {} tokens from {} to {}", amount, ctx.accounts.from.key(), ctx.accounts.to.key());
        
        Ok(())
    }

    /// Burn tokens (destroy them)
    pub fn burn_tokens(
        ctx: Context<BurnTokens>,
        amount: u64,
    ) -> Result<()> {
        // Update total supply in metadata
        let token_metadata = &mut ctx.accounts.token_metadata;
        token_metadata.total_supply = token_metadata.total_supply.checked_sub(amount).ok_or(ErrorCode::ArithmeticUnderflow)?;
        
        // Burn tokens
        let cpi_accounts = Burn {
            mint: ctx.accounts.mint.to_account_info(),
            from: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        token::burn(cpi_ctx, amount)?;
        
        msg!("Burned {} tokens from {}", amount, ctx.accounts.token_account.key());
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeMint<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + size_of::<TokenMetadata>(),
        seeds = [b"metadata", mint.key().as_ref()],
        bump
    )]
    pub token_metadata: Account<'info, TokenMetadata>,
    
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    
    pub authority: Signer<'info>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct MintTokens<'info> {
    #[account(
        mut,
        seeds = [b"metadata", mint.key().as_ref()],
        bump,
        has_one = mint,
        has_one = authority
    )]
    pub token_metadata: Account<'info, TokenMetadata>,
    
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct TransferTokens<'info> {
    #[account(mut)]
    pub from: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub to: Account<'info, TokenAccount>,
    
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct BurnTokens<'info> {
    #[account(
        mut,
        seeds = [b"metadata", mint.key().as_ref()],
        bump,
        has_one = mint,
        has_one = authority
    )]
    pub token_metadata: Account<'info, TokenMetadata>,
    
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct TokenMetadata {
    pub name: String,
    pub symbol: String,
    pub decimals: u8,
    pub mint: Pubkey,
    pub authority: Pubkey,
    pub total_supply: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Arithmetic operation overflow")]
    ArithmeticOverflow,
    
    #[msg("Arithmetic operation underflow")]
    ArithmeticUnderflow,
} 