// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SoulboundCert is ERC721, Ownable {
    uint256 private _nextId;

    struct Cert {
        address issuer;
        uint64 issuedAt;
        string ipfsCid;
        bytes32 metadataHash;
        bool revoked;
    }

    mapping(uint256 => Cert) private _certs;
    mapping(address => uint256[]) private _certsOf;

    // tiers
    mapping(address => bool) public isUniversityAdmin;
    mapping(address => bool) public isIssuer;

    error NotUniversityAdmin();
    error NotIssuer();
    error Soulbound();
    error NotCertIssuer();
    error AlreadyRevoked();

    event UniversityAdminSet(address indexed admin, bool allowed);
    event IssuerSet(address indexed issuer, bool allowed);

    event CertificateMinted(
        uint256 indexed tokenId,
        address indexed student,
        address indexed issuer,
        string ipfsCid,
        bytes32 metadataHash
    );
    event CertificateRevoked(uint256 indexed tokenId, address indexed issuer);

    constructor() ERC721("AcademicCert", "CERT") Ownable(msg.sender) {
    isUniversityAdmin[msg.sender] = true;
    isIssuer[msg.sender] = true;
    emit UniversityAdminSet(msg.sender, true);
    emit IssuerSet(msg.sender, true);
}

    modifier onlyUniversityAdmin() {
        if (!isUniversityAdmin[msg.sender]) revert NotUniversityAdmin();
        _;
    }

    modifier onlyIssuer() {
        if (!isIssuer[msg.sender]) revert NotIssuer();
        _;
    }

    // Owner manages university admins
    function setUniversityAdmin(address admin, bool allowed) external onlyOwner {
        isUniversityAdmin[admin] = allowed;
        emit UniversityAdminSet(admin, allowed);
    }

    // University admins manage issuers (departments)
    function setIssuer(address issuer, bool allowed) external onlyUniversityAdmin {
        isIssuer[issuer] = allowed;
        emit IssuerSet(issuer, allowed);
    }

    function mint(address to, string calldata ipfsCid, bytes32 metadataHash)
        external
        onlyIssuer
        returns (uint256 tokenId)
    {
        tokenId = ++_nextId;
        _safeMint(to, tokenId);

        _certs[tokenId] = Cert({
            issuer: msg.sender,
            issuedAt: uint64(block.timestamp),
            ipfsCid: ipfsCid,
            metadataHash: metadataHash,
            revoked: false
        });

        _certsOf[to].push(tokenId);

        emit CertificateMinted(tokenId, to, msg.sender, ipfsCid, metadataHash);
    }

    function revoke(uint256 tokenId) external onlyIssuer {
        if (_ownerOf(tokenId) == address(0)) revert("Nonexistent token");

        Cert storage c = _certs[tokenId];
        if (c.issuer != msg.sender) revert NotCertIssuer();
        if (c.revoked) revert AlreadyRevoked();

        c.revoked = true;
        emit CertificateRevoked(tokenId, msg.sender);
    }

    // Verification reads
    function certificate(uint256 tokenId) external view returns (Cert memory) {
        if (_ownerOf(tokenId) == address(0)) revert("Nonexistent token");
        return _certs[tokenId];
    }

    function certificatesOf(address student) external view returns (uint256[] memory) {
        return _certsOf[student];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (_ownerOf(tokenId) == address(0)) revert("Nonexistent token");
        return string(abi.encodePacked("ipfs://", _certs[tokenId].ipfsCid));
    }

    // OZ v5 soulbound enforcement
    function _update(address to, uint256 tokenId, address auth)
        internal
        virtual
        override
        returns (address from)
    {
        from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) revert Soulbound();
        return super._update(to, tokenId, auth);
    }

    function approve(address, uint256) public virtual override { revert Soulbound(); }
    function setApprovalForAll(address, bool) public virtual override { revert Soulbound(); }
}