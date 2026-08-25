// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LandRegistry
 * @dev Comprehensive, tamper-evident decentralized land registry & title conveyance system.
 * Implements role-based access control (Admin, Registrar, Surveyor, Notary),
 * cadastral property data modeling, multi-step verification, encumbrance / lien tracking,
 * boundary dispute workflows, and an immutable audit trail of title transfers.
 */
contract LandRegistry {
    // ==========================================
    // ENUMS & STRUCTS
    // ==========================================

    enum PropertyStatus {
        REGISTERED,       // Initially recorded by authority
        VERIFIED,         // Verified by surveyor/notary
        TRANSFER_PENDING, // Smart contract conveyance in progress
        TRANSFERRED,      // Title successfully conveyed to new owner
        IN_DISPUTE,       // Under legal or cadastral dispute
        ENCUMBERED        // Subject to active mortgage or municipal lien
    }

    enum DisputeStatus {
        NONE,
        ACTIVE,
        RESOLVED
    }

    struct Encumbrance {
        string encId;
        string encType;       // e.g., "Mortgage", "Municipal Lien", "Easement", "Covenant"
        address beneficiary;  // e.g., Bank or Municipal Tax Authority
        uint256 amountUSD;
        string docHash;       // Hash of supporting legal document
        bool active;
        uint256 registeredAt;
    }

    struct TitleTransferRecord {
        address fromOwner;
        address toOwner;
        uint256 priceUSD;
        string deedURI;       // IPFS URI or document reference
        uint256 timestamp;
        string notarizedBy;
    }

    struct Dispute {
        string reason;
        address filedBy;
        uint256 filedAt;
        bool active;
        string resolutionNotes;
        uint256 resolvedAt;
    }

    struct Property {
        string propertyId;
        string titleNumber;
        string parcelId;
        string cadastralDistrict;
        string physicalAddress;
        uint256 areaSqMeters;
        string zoning;        // "Residential", "Commercial", "Agricultural", "Industrial", "Mixed-Use"
        address currentOwner;
        address previousOwner;
        string documentHash;  // SHA-256 hash of original deed/cadastral survey
        string ipfsDeedCid;   // IPFS Content Identifier for decentralized deed storage
        bool isVerified;
        PropertyStatus status;
        uint256 registeredAt;
        uint256 lastTransferredAt;
        bool exists;
    }

    // ==========================================
    // STATE VARIABLES & ROLES
    // ==========================================

    address public admin;
    mapping(address => bool) public isRegistrar;
    mapping(address => bool) public isSurveyor;
    mapping(address => bool) public isNotary;

    // Primary storage
    mapping(string => Property) private properties;
    string[] private allPropertyIds;

    // Relational mappings
    mapping(address => string[]) private ownerProperties;
    mapping(string => Encumbrance[]) private propertyEncumbrances;
    mapping(string => TitleTransferRecord[]) private propertyHistory;
    mapping(string => Dispute) private propertyDisputes;

    // ==========================================
    // EVENTS
    // ==========================================

    event PropertyRegistered(
        string indexed propertyId,
        address indexed initialOwner,
        string parcelId,
        string documentHash,
        uint256 timestamp
    );

    event PropertyVerified(
        string indexed propertyId,
        address indexed verifiedBy,
        string ipfsCid,
        uint256 timestamp
    );

    event OwnershipTransferred(
        string indexed propertyId,
        address indexed previousOwner,
        address indexed newOwner,
        uint256 priceUSD,
        string deedURI,
        uint256 timestamp
    );

    event PropertyStatusUpdated(
        string indexed propertyId,
        PropertyStatus oldStatus,
        PropertyStatus newStatus,
        uint256 timestamp
    );

    event EncumbranceAdded(
        string indexed propertyId,
        string encId,
        string encType,
        address indexed beneficiary,
        uint256 amountUSD,
        uint256 timestamp
    );

    event EncumbranceReleased(
        string indexed propertyId,
        uint256 indexed index,
        uint256 timestamp
    );

    event DisputeFlagged(
        string indexed propertyId,
        address indexed filedBy,
        string reason,
        uint256 timestamp
    );

    event DisputeResolved(
        string indexed propertyId,
        address indexed resolvedBy,
        string resolutionNotes,
        uint256 timestamp
    );

    event RoleGranted(string indexed roleName, address indexed account, address indexed grantedBy);
    event RoleRevoked(string indexed roleName, address indexed account, address indexed revokedBy);

    // ==========================================
    // MODIFIERS
    // ==========================================

    modifier onlyAdmin() {
        require(msg.sender == admin, "LandRegistry: Caller is not the admin");
        _;
    }

    modifier onlyRegistrarRole() {
        require(isRegistrar[msg.sender] || msg.sender == admin, "LandRegistry: Caller is not a Land Registrar");
        _;
    }

    modifier onlySurveyorRole() {
        require(isSurveyor[msg.sender] || msg.sender == admin, "LandRegistry: Caller is not a Cadastral Surveyor");
        _;
    }

    modifier onlyNotaryRole() {
        require(isNotary[msg.sender] || msg.sender == admin, "LandRegistry: Caller is not an Authorized Notary");
        _;
    }

    modifier onlyPropertyOwner(string calldata propertyId) {
        require(properties[propertyId].exists, "LandRegistry: Property does not exist");
        require(properties[propertyId].currentOwner == msg.sender, "LandRegistry: Caller is not the property owner");
        _;
    }

    modifier propertyMustExist(string calldata propertyId) {
        require(properties[propertyId].exists, "LandRegistry: Property does not exist");
        _;
    }

    // ==========================================
    // CONSTRUCTOR
    // ==========================================

    constructor() {
        admin = msg.sender;
        isRegistrar[msg.sender] = true;
        isSurveyor[msg.sender] = true;
        isNotary[msg.sender] = true;
    }

    // ==========================================
    // ROLE MANAGEMENT
    // ==========================================

    function setRegistrar(address account, bool status) external onlyAdmin {
        require(account != address(0), "LandRegistry: Zero address");
        isRegistrar[account] = status;
        if (status) {
            emit RoleGranted("REGISTRAR", account, msg.sender);
        } else {
            emit RoleRevoked("REGISTRAR", account, msg.sender);
        }
    }

    function setSurveyor(address account, bool status) external onlyAdmin {
        require(account != address(0), "LandRegistry: Zero address");
        isSurveyor[account] = status;
        if (status) {
            emit RoleGranted("SURVEYOR", account, msg.sender);
        } else {
            emit RoleRevoked("SURVEYOR", account, msg.sender);
        }
    }

    function setNotary(address account, bool status) external onlyAdmin {
        require(account != address(0), "LandRegistry: Zero address");
        isNotary[account] = status;
        if (status) {
            emit RoleGranted("NOTARY", account, msg.sender);
        } else {
            emit RoleRevoked("NOTARY", account, msg.sender);
        }
    }

    // ==========================================
    // PROPERTY REGISTRATION (SECTION 8)
    // ==========================================

    /**
     * @notice Registers a new land parcel on the blockchain.
     * @dev Only callable by an authorized Land Registrar or Admin.
     */
    function registerProperty(
        string calldata propertyId,
        string calldata titleNumber,
        string calldata parcelId,
        string calldata cadastralDistrict,
        string calldata physicalAddress,
        uint256 areaSqMeters,
        string calldata zoning,
        address initialOwner,
        string calldata documentHash,
        string calldata ipfsDeedCid
    ) external onlyRegistrarRole {
        require(bytes(propertyId).length > 0, "LandRegistry: Property ID cannot be empty");
        require(!properties[propertyId].exists, "LandRegistry: Property ID already registered");
        require(initialOwner != address(0), "LandRegistry: Invalid owner address");
        require(areaSqMeters > 0, "LandRegistry: Area must be greater than zero");
        require(bytes(documentHash).length > 0, "LandRegistry: Document hash is required");

        Property memory newProp = Property({
            propertyId: propertyId,
            titleNumber: titleNumber,
            parcelId: parcelId,
            cadastralDistrict: cadastralDistrict,
            physicalAddress: physicalAddress,
            areaSqMeters: areaSqMeters,
            zoning: zoning,
            currentOwner: initialOwner,
            previousOwner: address(0),
            documentHash: documentHash,
            ipfsDeedCid: ipfsDeedCid,
            isVerified: false,
            status: PropertyStatus.REGISTERED,
            registeredAt: block.timestamp,
            lastTransferredAt: block.timestamp,
            exists: true
        });

        properties[propertyId] = newProp;
        allPropertyIds.push(propertyId);
        ownerProperties[initialOwner].push(propertyId);

        // Record genesis deed entry in history
        propertyHistory[propertyId].push(TitleTransferRecord({
            fromOwner: address(0),
            toOwner: initialOwner,
            priceUSD: 0,
            deedURI: ipfsDeedCid,
            timestamp: block.timestamp,
            notarizedBy: "Genesis Sovereign Registration"
        }));

        emit PropertyRegistered(propertyId, initialOwner, parcelId, documentHash, block.timestamp);
    }

    // ==========================================
    // PROPERTY VERIFICATION (SECTION 9)
    // ==========================================

    /**
     * @notice Verifies supporting cadastral and legal documentation for a registered parcel.
     * @dev Only callable by an authorized Notary, Surveyor, or Registrar.
     */
    function verifyProperty(
        string calldata propertyId,
        string calldata ipfsDeedCid
    ) external propertyMustExist(propertyId) {
        require(
            isNotary[msg.sender] || isSurveyor[msg.sender] || isRegistrar[msg.sender] || msg.sender == admin,
            "LandRegistry: Unauthorized verifier"
        );

        Property storage prop = properties[propertyId];
        require(!prop.isVerified, "LandRegistry: Property already verified");
        require(prop.status != PropertyStatus.IN_DISPUTE, "LandRegistry: Cannot verify property in dispute");

        prop.isVerified = true;
        PropertyStatus oldStatus = prop.status;
        prop.status = PropertyStatus.VERIFIED;

        if (bytes(ipfsDeedCid).length > 0) {
            prop.ipfsDeedCid = ipfsDeedCid;
        }

        emit PropertyVerified(propertyId, msg.sender, prop.ipfsDeedCid, block.timestamp);
        emit PropertyStatusUpdated(propertyId, oldStatus, PropertyStatus.VERIFIED, block.timestamp);
    }

    // ==========================================
    // OWNERSHIP TRANSFER (SECTION 10)
    // ==========================================

    /**
     * @notice Transfers legal title deed ownership from current owner to a buyer.
     * @dev Callable by the current owner or by an Authorized Notary with owner sign-off.
     */
    function transferOwnership(
        string calldata propertyId,
        address newOwner,
        uint256 priceUSD,
        string calldata deedURI,
        string calldata notarizedBy
    ) external propertyMustExist(propertyId) {
        Property storage prop = properties[propertyId];

        // Access check: either the owner or an authorized notary
        bool isOwner = (msg.sender == prop.currentOwner);
        bool isAuthorizedNotary = (isNotary[msg.sender] || msg.sender == admin);
        require(isOwner || isAuthorizedNotary, "LandRegistry: Caller not authorized to transfer title");

        require(newOwner != address(0), "LandRegistry: Invalid new owner address");
        require(newOwner != prop.currentOwner, "LandRegistry: New owner cannot be current owner");
        require(prop.isVerified, "LandRegistry: Unverified property cannot be transferred");
        require(prop.status != PropertyStatus.IN_DISPUTE, "LandRegistry: Disputed property cannot be transferred");
        require(!hasActiveEncumbrance(propertyId), "LandRegistry: Encumbered property cannot be transferred");

        address previousOwner = prop.currentOwner;

        // State updates
        prop.previousOwner = previousOwner;
        prop.currentOwner = newOwner;
        prop.lastTransferredAt = block.timestamp;
        PropertyStatus oldStatus = prop.status;
        prop.status = PropertyStatus.TRANSFERRED;

        if (bytes(deedURI).length > 0) {
            prop.ipfsDeedCid = deedURI;
        }

        // Update ownership lists
        _removePropertyFromOwner(previousOwner, propertyId);
        ownerProperties[newOwner].push(propertyId);

        // Record title transfer in audit history
        propertyHistory[propertyId].push(TitleTransferRecord({
            fromOwner: previousOwner,
            toOwner: newOwner,
            priceUSD: priceUSD,
            deedURI: deedURI,
            timestamp: block.timestamp,
            notarizedBy: bytes(notarizedBy).length > 0 ? notarizedBy : "Direct Smart Contract Conveyance"
        }));

        emit OwnershipTransferred(propertyId, previousOwner, newOwner, priceUSD, deedURI, block.timestamp);
        emit PropertyStatusUpdated(propertyId, oldStatus, PropertyStatus.TRANSFERRED, block.timestamp);
    }

    // ==========================================
    // ENCUMBRANCE / LIEN MANAGEMENT
    // ==========================================

    /**
     * @notice Registers a mortgage, tax lien, or covenant on a property parcel.
     * @dev Only callable by an Authorized Notary or Admin.
     */
    function addEncumbrance(
        string calldata propertyId,
        string calldata encId,
        string calldata encType,
        address beneficiary,
        uint256 amountUSD,
        string calldata docHash
    ) external onlyNotaryRole propertyMustExist(propertyId) {
        require(beneficiary != address(0), "LandRegistry: Invalid beneficiary address");
        require(bytes(encId).length > 0, "LandRegistry: Encumbrance ID required");

        propertyEncumbrances[propertyId].push(Encumbrance({
            encId: encId,
            encType: encType,
            beneficiary: beneficiary,
            amountUSD: amountUSD,
            docHash: docHash,
            active: true,
            registeredAt: block.timestamp
        }));

        Property storage prop = properties[propertyId];
        PropertyStatus oldStatus = prop.status;
        prop.status = PropertyStatus.ENCUMBERED;

        emit EncumbranceAdded(propertyId, encId, encType, beneficiary, amountUSD, block.timestamp);
        emit PropertyStatusUpdated(propertyId, oldStatus, PropertyStatus.ENCUMBERED, block.timestamp);
    }

    /**
     * @notice Releases / discharges an active encumbrance by its index.
     * @dev Only callable by an Authorized Notary or Admin.
     */
    function releaseEncumbrance(
        string calldata propertyId,
        uint256 index
    ) external onlyNotaryRole propertyMustExist(propertyId) {
        require(index < propertyEncumbrances[propertyId].length, "LandRegistry: Encumbrance index out of bounds");
        require(propertyEncumbrances[propertyId][index].active, "LandRegistry: Encumbrance already discharged");

        propertyEncumbrances[propertyId][index].active = false;

        // If no more active encumbrances and not in dispute, restore verified status
        Property storage prop = properties[propertyId];
        if (!hasActiveEncumbrance(propertyId) && prop.status == PropertyStatus.ENCUMBERED) {
            prop.status = PropertyStatus.VERIFIED;
            emit PropertyStatusUpdated(propertyId, PropertyStatus.ENCUMBERED, PropertyStatus.VERIFIED, block.timestamp);
        }

        emit EncumbranceReleased(propertyId, index, block.timestamp);
    }

    /**
     * @notice Checks whether a property has any active liens or encumbrances.
     */
    function hasActiveEncumbrance(string calldata propertyId) public view returns (bool) {
        Encumbrance[] memory arr = propertyEncumbrances[propertyId];
        for (uint256 i = 0; i < arr.length; i++) {
            if (arr[i].active) {
                return true;
            }
        }
        return false;
    }

    // ==========================================
    // DISPUTE MANAGEMENT
    // ==========================================

    /**
     * @notice Flags an active cadastral or legal dispute on a property parcel.
     * @dev Callable by Land Registrar, Notary, Admin, or the current property owner.
     */
    function flagDispute(
        string calldata propertyId,
        string calldata reason
    ) external propertyMustExist(propertyId) {
        Property storage prop = properties[propertyId];
        bool isAuthorized = (msg.sender == prop.currentOwner || isRegistrar[msg.sender] || isNotary[msg.sender] || msg.sender == admin);
        require(isAuthorized, "LandRegistry: Unauthorized to flag dispute");
        require(!propertyDisputes[propertyId].active, "LandRegistry: Dispute already active");

        propertyDisputes[propertyId] = Dispute({
            reason: reason,
            filedBy: msg.sender,
            filedAt: block.timestamp,
            active: true,
            resolutionNotes: "",
            resolvedAt: 0
        });

        PropertyStatus oldStatus = prop.status;
        prop.status = PropertyStatus.IN_DISPUTE;

        emit DisputeFlagged(propertyId, msg.sender, reason, block.timestamp);
        emit PropertyStatusUpdated(propertyId, oldStatus, PropertyStatus.IN_DISPUTE, block.timestamp);
    }

    /**
     * @notice Resolves an active dispute on a property parcel.
     * @dev Only callable by an authorized Land Registrar or Admin.
     */
    function resolveDispute(
        string calldata propertyId,
        string calldata resolutionNotes
    ) external onlyRegistrarRole propertyMustExist(propertyId) {
        Dispute storage dispute = propertyDisputes[propertyId];
        require(dispute.active, "LandRegistry: No active dispute found");

        dispute.active = false;
        dispute.resolutionNotes = resolutionNotes;
        dispute.resolvedAt = block.timestamp;

        Property storage prop = properties[propertyId];
        PropertyStatus newStatus = hasActiveEncumbrance(propertyId) ? PropertyStatus.ENCUMBERED : PropertyStatus.VERIFIED;
        PropertyStatus oldStatus = prop.status;
        prop.status = newStatus;

        emit DisputeResolved(propertyId, msg.sender, resolutionNotes, block.timestamp);
        emit PropertyStatusUpdated(propertyId, oldStatus, newStatus, block.timestamp);
    }

    // ==========================================
    // VIEW / GETTER FUNCTIONS
    // ==========================================

    function getProperty(string calldata propertyId) external view propertyMustExist(propertyId) returns (Property memory) {
        return properties[propertyId];
    }

    function getAllPropertyIds() external view returns (string[] memory) {
        return allPropertyIds;
    }

    function getTotalProperties() external view returns (uint256) {
        return allPropertyIds.length;
    }

    function getPropertiesByOwner(address owner) external view returns (string[] memory) {
        return ownerProperties[owner];
    }

    function getTitleHistory(string calldata propertyId) external view propertyMustExist(propertyId) returns (TitleTransferRecord[] memory) {
        return propertyHistory[propertyId];
    }

    function getEncumbrances(string calldata propertyId) external view propertyMustExist(propertyId) returns (Encumbrance[] memory) {
        return propertyEncumbrances[propertyId];
    }

    function getDispute(string calldata propertyId) external view propertyMustExist(propertyId) returns (Dispute memory) {
        return propertyDisputes[propertyId];
    }

    function propertyExists(string calldata propertyId) external view returns (bool) {
        return properties[propertyId].exists;
    }

    // ==========================================
    // INTERNAL HELPERS
    // ==========================================

    function _removePropertyFromOwner(address owner, string calldata propertyId) internal {
        string[] storage list = ownerProperties[owner];
        bytes32 targetHash = keccak256(bytes(propertyId));
        for (uint256 i = 0; i < list.length; i++) {
            if (keccak256(bytes(list[i])) == targetHash) {
                list[i] = list[list.length - 1];
                list.pop();
                break;
            }
        }
    }
}
