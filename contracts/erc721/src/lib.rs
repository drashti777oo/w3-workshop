extern crate alloc;

// Modules and imports
mod erc721;

/// Import the Stylus SDK along with alloy primitive types for use in our program.
use stylus_sdk::{
    abi::Bytes,
    call::Call,
    contract,
    msg,
    prelude::*,
    alloy_primitives::{Address, U256}
};
use alloy_sol_types::sol;
use crate::erc721::{Erc721, Erc721Params};

// Interfaces for the Art contract and the ERC20 contract
sol_interface! {
    interface NftArt {
        function initialize(address token_contract_address) external;
        function generateArt(uint256 token_id, address owner) external returns(string);
    }
}

struct RobinhoodNFTParams;

/// Immutable definitions
impl Erc721Params for RobinhoodNFTParams {
    const NAME: &'static str = "RobinhoodNFT";
    const SYMBOL: &'static str = "RHNFT";
}

// Define the entrypoint as a Solidity storage object. The sol_storage! macro
// will generate Rust-equivalent structs with all fields mapped to Solidity-equivalent
// storage slots and types.
sol_storage! {
    #[entrypoint]
    struct RobinhoodNFT {
        address art_contract_address;
        
        /// Base URI for token metadata (e.g., "https://api.example.com/metadata/")
        /// When tokenURI is called, it returns: baseUri + tokenId + ".json"
        String base_uri;
        
        /// Mapping from tokenId to custom URI (optional override per token)
        /// If set, this takes precedence over the baseUri approach
        mapping(uint256 => String) token_uris;

        #[borrow] // Allows erc721 to access MyToken's storage and make calls
        Erc721<RobinhoodNFTParams> erc721;
    }
}

// Declare Solidity error types
sol! {
    /// Contract has already been initialized
    error AlreadyInitialized();
    /// A call to an external contract failed
    error ExternalCallFailed();
}

/// Represents the ways methods may fail.
#[derive(SolidityError)]
pub enum RobinhoodNFTError {
    AlreadyInitialized(AlreadyInitialized),
    ExternalCallFailed(ExternalCallFailed),
}

#[public]
#[inherit(Erc721<RobinhoodNFTParams>)]
impl RobinhoodNFT {
    /// Mints an NFT, but does not call onErc712Received
    pub fn mint(&mut self) -> Result<(), Vec<u8>> {
        let minter = msg::sender();
        self.erc721.mint(minter)?;
        Ok(())
    }

    /// Mints an NFT to the specified address, and does not call onErc712Received
    pub fn mint_to(&mut self, to: Address) -> Result<(), Vec<u8>> {
        self.erc721.mint(to)?;
        Ok(())
    }

    /// Mints an NFT and calls onErc712Received with empty data
    pub fn safe_mint(&mut self, to: Address) -> Result<(), Vec<u8>> {
        Erc721::safe_mint(self, to, Vec::new())?;
        Ok(())
    }

    /// Burns an NFT
    pub fn burn(&mut self, token_id: U256) -> Result<(), Vec<u8>> {
        // This function checks that msg::sender() owns the specified token_id
        self.erc721.burn(msg::sender(), token_id)?;
        Ok(())
    }

    /// Returns the URI for a given token ID
    /// This follows the ERC-721 metadata standard
    /// 
    /// The contract stores a base URI (e.g., "https://api.example.com/metadata/")
    /// and appends the token ID with ".json" extension
    /// 
    /// Example:
    /// - baseUri = "https://api.example.com/metadata/"
    /// - tokenId = 5
    /// - returns "https://api.example.com/metadata/5.json"
    pub fn token_uri(&self, token_id: U256) -> Result<String, Vec<u8>> {
        // First check if this token exists
        if self.erc721.owner_of(token_id).is_err() {
            return Err("Token does not exist".as_bytes().to_vec());
        }

        // If a custom URI exists for this token, return it
        let custom_uri = self.token_uris.get(token_id);
        if !custom_uri.is_empty() {
            return Ok(custom_uri);
        }

        // Otherwise, construct URI from base_uri + tokenId + ".json"
        let base = self.base_uri.clone();
        let token_id_str = alloc::format!("{}", token_id);
        
        let mut uri = base;
        uri.push_str(&token_id_str);
        uri.push_str(".json");
        
        Ok(uri)
    }

    /// Sets the base URI for all tokens
    /// Only the contract owner/deployer should be able to call this
    /// 
    /// Example: "https://api.example.com/metadata/"
    /// This will make token URIs like: https://api.example.com/metadata/1.json
    pub fn set_base_uri(&mut self, new_base_uri: String) -> Result<(), Vec<u8>> {
        // In production, add access control here to ensure only owner can call
        // For now, this is public (be careful in production!)
        self.base_uri = new_base_uri;
        Ok(())
    }

    /// Sets a custom URI for a specific token
    /// This takes precedence over the baseUri + tokenId approach
    pub fn set_token_uri(&mut self, token_id: U256, uri: String) -> Result<(), Vec<u8>> {
        // Verify the token exists
        self.erc721.owner_of(token_id)?;
        
        // Store the custom URI
        self.token_uris.setter(token_id).set(uri);
        Ok(())
    }
}