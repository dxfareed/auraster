// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract Auraster is ERC721, ERC721URIStorage, Ownable {
    using ECDSA for bytes32;

    uint256 private _nextTokenId;
    address public signerAddress;

    error InvalidSignature();
    error SignatureExpired(); // Optional, if we add timestamps later

    event SignerUpdated(address indexed newSigner);
    event AuraMinted(address indexed recipient, uint256 tokenId, string uri);

    constructor(address _initialSigner) ERC721("Auraster", "AURA") Ownable(msg.sender) {
        signerAddress = _initialSigner;
    }

    function setSigner(address _signer) external onlyOwner {
        signerAddress = _signer;
        emit SignerUpdated(_signer);
    }

    function mintWithSignature(string calldata uri, bytes calldata signature) external {
        // Construct the hash of the data (URI + Sender) to prevent replay for other users
        // We include msg.sender to ensure the signature is only valid for the person sending the tx
        bytes32 hash = keccak256(abi.encodePacked(msg.sender, uri));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(hash);

        // Verify the signature
        if (ECDSA.recover(ethSignedMessageHash, signature) != signerAddress) {
            revert InvalidSignature();
        }

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);

        emit AuraMinted(msg.sender, tokenId, uri);
    }

    // Owner override to mint manually if needed
    function ownerMint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // The following functions are overrides required by Solidity.

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
