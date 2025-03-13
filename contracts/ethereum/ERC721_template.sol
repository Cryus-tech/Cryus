// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title CustomNFT
 * @dev ERC721 token with minting, burning, pausing, and role-based access control capabilities.
 */
contract CustomNFT is 
    ERC721, 
    ERC721Enumerable, 
    ERC721URIStorage, 
    ERC721Pausable, 
    AccessControl, 
    ReentrancyGuard 
{
    using Counters for Counters.Counter;
    
    // Roles
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant URI_SETTER_ROLE = keccak256("URI_SETTER_ROLE");
    
    // Token tracking
    Counters.Counter private _tokenIdCounter;
    mapping(uint256 => string) private _tokenNames;
    
    // Collection metadata
    string private _collectionURI;
    uint256 private _maxSupply;
    
    // Royalty information
    uint256 private _royaltyFee;
    address private _royaltyReceiver;
    
    // Events
    event NFTMinted(address indexed to, uint256 indexed tokenId, string uri);
    event NFTBurned(address indexed from, uint256 indexed tokenId);
    event URIUpdated(uint256 indexed tokenId, string uri);
    event CollectionURIUpdated(string uri);
    event TokenNameUpdated(uint256 indexed tokenId, string name);
    
    /**
     * @dev Constructor that gives the specified address all available roles.
     * @param name The name of the token collection
     * @param symbol The symbol of the token collection
     * @param maxSupply The maximum supply of tokens (0 for unlimited)
     * @param royaltyFee Royalty fee basis points (e.g., 250 = 2.5%)
     * @param royaltyReceiver Address to receive royalties
     * @param owner Address to receive all roles
     */
    constructor(
        string memory name,
        string memory symbol,
        uint256 maxSupply,
        uint256 royaltyFee,
        address royaltyReceiver,
        address owner
    ) ERC721(name, symbol) {
        require(owner != address(0), "CustomNFT: owner cannot be zero address");
        
        _maxSupply = maxSupply;
        _royaltyFee = royaltyFee;
        _royaltyReceiver = royaltyReceiver;
        
        // Set up roles
        _grantRole(DEFAULT_ADMIN_ROLE, owner);
        _grantRole(MINTER_ROLE, owner);
        _grantRole(PAUSER_ROLE, owner);
        _grantRole(URI_SETTER_ROLE, owner);
    }
    
    /**
     * @dev Creates a new token for `to`. Its token ID will be automatically
     * assigned (and available on the emitted {IERC721-Transfer} event).
     *
     * @param to The address that will own the minted token
     * @param uri URI for the token metadata
     * @param name Name for the specific token (optional)
     */
    function mint(
        address to,
        string memory uri,
        string memory name
    ) external nonReentrant onlyRole(MINTER_ROLE) {
        if (_maxSupply > 0) {
            require(totalSupply() < _maxSupply, "CustomNFT: max supply reached");
        }
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        if (bytes(name).length > 0) {
            _tokenNames[tokenId] = name;
        }
        
        emit NFTMinted(to, tokenId, uri);
    }
    
    /**
     * @dev Burns a specific token
     * @param tokenId Token ID to burn
     */
    function burn(uint256 tokenId) external {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "CustomNFT: caller is not owner nor approved");
        
        emit NFTBurned(ownerOf(tokenId), tokenId);
        _burn(tokenId);
    }
    
    /**
     * @dev Sets the token URI for a given token
     * @param tokenId Token ID to update
     * @param uri New URI for the token
     */
    function setTokenURI(uint256 tokenId, string memory uri) external onlyRole(URI_SETTER_ROLE) {
        require(_exists(tokenId), "CustomNFT: URI set of nonexistent token");
        _setTokenURI(tokenId, uri);
        emit URIUpdated(tokenId, uri);
    }
    
    /**
     * @dev Sets the name for a given token
     * @param tokenId Token ID to update
     * @param name New name for the token
     */
    function setTokenName(uint256 tokenId, string memory name) external onlyRole(URI_SETTER_ROLE) {
        require(_exists(tokenId), "CustomNFT: name set of nonexistent token");
        _tokenNames[tokenId] = name;
        emit TokenNameUpdated(tokenId, name);
    }
    
    /**
     * @dev Gets the name for a given token
     * @param tokenId Token ID to query
     * @return The name of the token
     */
    function tokenName(uint256 tokenId) external view returns (string memory) {
        require(_exists(tokenId), "CustomNFT: name query for nonexistent token");
        return _tokenNames[tokenId];
    }
    
    /**
     * @dev Sets URI for the collection metadata
     * @param uri New URI for collection metadata
     */
    function setCollectionURI(string memory uri) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _collectionURI = uri;
        emit CollectionURIUpdated(uri);
    }
    
    /**
     * @dev Gets URI for the collection metadata
     * @return The URI of the collection
     */
    function collectionURI() external view returns (string memory) {
        return _collectionURI;
    }
    
    /**
     * @dev Gets the maximum supply of tokens
     * @return The maximum supply (0 means unlimited)
     */
    function maxSupply() external view returns (uint256) {
        return _maxSupply;
    }
    
    /**
     * @dev Get royalty information for a token
     * @param tokenId The token ID to query
     * @param salePrice The sale price of the token
     * @return receiver The address that should receive royalties
     * @return royaltyAmount The royalty amount to be paid
     */
    function royaltyInfo(uint256 tokenId, uint256 salePrice) external view returns (address, uint256) {
        require(_exists(tokenId), "CustomNFT: royalty query for nonexistent token");
        return (_royaltyReceiver, (salePrice * _royaltyFee) / 10000);
    }
    
    /**
     * @dev Pauses all token transfers.
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpauses all token transfers.
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    // Required overrides
    
    /**
     * @dev Required override for the supportsInterface function
     */
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable, ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    /**
     * @dev Required override for the _update function
     */
    function _update(address to, uint256 tokenId, address auth) internal override(ERC721, ERC721Enumerable, ERC721Pausable) returns (address) {
        return super._update(to, tokenId, auth);
    }
    
    /**
     * @dev Required override for the _increaseBalance function
     */
    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }
    
    /**
     * @dev Required override for the tokenURI function
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    /**
     * @dev Required override for the _burn function
     */
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        delete _tokenNames[tokenId];
        super._burn(tokenId);
    }
} 