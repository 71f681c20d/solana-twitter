use anchor_lang::prelude::*;

declare_id!("FV7AuEp4Z8XUhsnW3pjtgpks8H4gphkWuvZLpvDj8dLD");

#[program]
pub mod solana_twitter {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
