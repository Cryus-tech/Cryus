//! A template for creating an NFT on Solana using Anchor framework and Metaplex
//! This template provides the basic functionality for an NFT on Solana

use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, MintTo, Transfer};
use mpl_token_metadata::instruction as mpl_instruction;
use solana_program::program::{invoke, invoke_signed};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"); // Replace with actual program ID

#[program]
pub mod nft_program {
    use super::*;

    /// Create a new NFT
    pub fn create_nft(
        ctx: Context<CreateNFT>,
        name: String,
        symbol: String,
        uri: String,
        seller_fee_basis_points: u16,
    ) -> Result<()> {
        msg!("Creating new NFT: {}", name);
        
        // Mint 1 token (NFT is a token with supply of 1)
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        token::mint_to(cpi_ctx, 1)?;
        
        // Create Metadata account
        let creator = vec![
            mpl_token_metadata::state::Creator {
                address: ctx.accounts.authority.key(),
                verified: true,
                share: 100,
            }
        ];

        invoke(
            &mpl_instruction::create_metadata_accounts_v3(
                ctx.accounts.token_metadata_program.key(),
                ctx.accounts.metadata.key(),
                ctx.accounts.mint.key(),
                ctx.accounts.authority.key(),
                ctx.accounts.payer.key(),
                ctx.accounts.authority.key(),
                name,
                symbol,
                uri,
                Some(creator),
                seller_fee_basis_points,
                true,
                true,
                None,
                None,
                None,
            ),
            &[
                ctx.accounts.metadata.to_account_info(),
                ctx.accounts.mint.to_account_info(),
                ctx.accounts.authority.to_account_info(),
                ctx.accounts.payer.to_account_info(),
                ctx.accounts.authority.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
                ctx.accounts.rent.to_account_info(),
            ],
        )?;

        // Create Master Edition account
        invoke(
            &mpl_instruction::create_master_edition_v3(
                ctx.accounts.token_metadata_program.key(),
                ctx.accounts.master_edition.key(),
                ctx.accounts.mint.key(),
                ctx.accounts.authority.key(),
                ctx.accounts.authority.key(),
                ctx.accounts.metadata.key(),
                ctx.accounts.payer.key(),
                Some(0), // Max supply of 0 means non-fungible
            ),
            &[
                ctx.accounts.master_edition.to_account_info(),
                ctx.accounts.mint.to_account_info(),
                ctx.accounts.authority.to_account_info(),
                ctx.accounts.authority.to_account_info(),
                ctx.accounts.payer.to_account_info(),
                ctx.accounts.metadata.to_account_info(),
                ctx.accounts.token_program.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
                ctx.accounts.rent.to_account_info(),
            ],
        )?;
        
        msg!("NFT created successfully");
        
        Ok(())
    }

    /// Transfer an NFT to another wallet
    pub fn transfer_nft(
        ctx: Context<TransferNFT>,
    ) -> Result<()> {
        let cpi_accounts = Transfer {
            from: ctx.accounts.from.to_account_info(),
            to: ctx.accounts.to.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        token::transfer(cpi_ctx, 1)?;
        
        msg!("NFT transferred from {} to {}", ctx.accounts.from.key(), ctx.accounts.to.key());
        
        Ok(())
    }

    /// Update NFT metadata
    pub fn update_metadata(
        ctx: Context<UpdateMetadata>,
        new_uri: String,
        new_name: Option<String>,
    ) -> Result<()> {
        // Get existing metadata
        let current_name = if let Some(name) = new_name {
            name
        } else {
            "".to_string() // Will keep current name
        };
        
        invoke(
            &mpl_instruction::update_metadata_accounts_v2(
                ctx.accounts.token_metadata_program.key(),
                ctx.accounts.metadata.key(),
                ctx.accounts.authority.key(),
                None,
                Some(mpl_token_metadata::state::DataV2 {
                    name: current_name,
                    symbol: "".to_string(), // Keep current symbol
                    uri: new_uri,
                    seller_fee_basis_points: 0, // Keep current fee
                    creators: None, // Keep current creators
                    collection: None, // Keep current collection
                    uses: None, // Keep current uses
                }),
                None,
                None,
            ),
            &[
                ctx.accounts.metadata.to_account_info(),
                ctx.accounts.authority.to_account_info(),
            ],
        )?;
        
        msg!("Metadata updated for NFT");
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateNFT<'info> {
    /// The NFT mint account
    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = authority.key(),
        mint::freeze_authority = authority.key(),
    )]
    pub mint: Account<'info, Mint>,
    
    /// The token account that will hold the NFT
    #[account(
        init,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = authority,
    )]
    pub token_account: Account<'info, TokenAccount>,
    
    /// Metadata account for the NFT
    /// CHECK: Created by Metaplex program
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    
    /// Master edition account for the NFT
    /// CHECK: Created by Metaplex program
    #[account(mut)]
    pub master_edition: UncheckedAccount<'info>,
    
    /// Creator/authority of the NFT
    pub authority: Signer<'info>,
    
    /// Payer for the transaction
    #[account(mut)]
    pub payer: Signer<'info>,
    
    /// System program
    pub system_program: Program<'info, System>,
    
    /// Token program
    pub token_program: Program<'info, Token>,
    
    /// Associated Token program
    pub associated_token_program: Program<'info, anchor_spl::associated_token::AssociatedToken>,
    
    /// Metaplex Token Metadata program
    /// CHECK: This is the Metaplex program
    pub token_metadata_program: UncheckedAccount<'info>,
    
    /// Rent sysvar
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct TransferNFT<'info> {
    /// Source token account
    #[account(mut)]
    pub from: Account<'info, TokenAccount>,
    
    /// Destination token account
    #[account(mut)]
    pub to: Account<'info, TokenAccount>,
    
    /// Owner of the NFT
    pub authority: Signer<'info>,
    
    /// Token program
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateMetadata<'info> {
    /// Metadata account for the NFT
    /// CHECK: Verified by Metaplex program
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    
    /// Update authority of the NFT
    pub authority: Signer<'info>,
    
    /// Metaplex Token Metadata program
    /// CHECK: This is the Metaplex program
    pub token_metadata_program: UncheckedAccount<'info>,
} 