// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title CustomToken
 * @dev ERC20 token with burning, pausing, and role-based access control capabilities.
 */
contract CustomToken is ERC20, ERC20Burnable, ERC20Pausable, AccessControl, ReentrancyGuard {
    // Roles
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    
    // Token configuration
    uint8 private _decimals;
    uint256 private _cap;
    
    // Events
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    event TokensPaused(address indexed pauser);
    event TokensUnpaused(address indexed pauser);
    
    /**
     * @dev Constructor that gives the specified address all available roles.
     * @param name_ The name of the token
     * @param symbol_ The symbol of the token
     * @param decimals_ The number of decimals for the token
     * @param initialSupply_ The initial token supply to mint
     * @param cap_ The maximum token supply
     * @param owner The address to receive the initial supply and roles
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply_,
        uint256 cap_,
        address owner
    ) ERC20(name_, symbol_) {
        require(cap_ > 0, "CustomToken: cap must be greater than 0");
        require(initialSupply_ <= cap_, "CustomToken: initial supply exceeds cap");
        require(owner != address(0), "CustomToken: owner cannot be zero address");
        
        _decimals = decimals_;
        _cap = cap_;
        
        // Set up roles
        _grantRole(DEFAULT_ADMIN_ROLE, owner);
        _grantRole(MINTER_ROLE, owner);
        _grantRole(PAUSER_ROLE, owner);
        _grantRole(BURNER_ROLE, owner);
        
        // Mint initial supply
        if (initialSupply_ > 0) {
            _mint(owner, initialSupply_ * (10 ** decimals_));
        }
    }
    
    /**
     * @dev Returns the number of decimals used for token.
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    /**
     * @dev Returns the cap on the token's total supply.
     */
    function cap() public view returns (uint256) {
        return _cap;
    }
    
    /**
     * @dev Mints new tokens to the specified address.
     * @param to The address to receive the minted tokens
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) external nonReentrant onlyRole(MINTER_ROLE) {
        require(totalSupply() + amount <= _cap, "CustomToken: cap exceeded");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @dev Burns tokens from the specified address.
     * @param from The address from which to burn tokens
     * @param amount The amount of tokens to burn
     */
    function burnFrom(address from, uint256 amount) public override onlyRole(BURNER_ROLE) {
        super.burnFrom(from, amount);
        emit TokensBurned(from, amount);
    }
    
    /**
     * @dev Pauses all token transfers.
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
        emit TokensPaused(_msgSender());
    }
    
    /**
     * @dev Unpauses all token transfers.
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
        emit TokensUnpaused(_msgSender());
    }
    
    /**
     * @dev Updates the token name and symbol.
     * @param name_ The new token name
     * @param symbol_ The new token symbol
     */
    function updateTokenInfo(string memory name_, string memory symbol_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _updateERC20Name(name_);
        _updateERC20Symbol(symbol_);
    }
    
    /**
     * @dev Required override for _update to handle both ERC20 and ERC20Pausable.
     */
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Pausable) {
        super._update(from, to, value);
    }
} 