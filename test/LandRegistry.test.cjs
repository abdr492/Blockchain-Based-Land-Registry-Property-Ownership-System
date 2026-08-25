const { expect } = require("chai");
const hre = require("hardhat");

describe("LandRegistry Smart Contract Comprehensive Test Suite", function () {
  let landRegistry;
  let admin, registrar, notary, surveyor, ownerA, buyerB, unauthorizedUser;

  const SAMPLE_PROP_ID = "PROP-TEST-001";
  const SAMPLE_TITLE_NO = "TIT-TEST-1001";
  const SAMPLE_PARCEL_ID = "CAD-SEC1-PL01";
  const SAMPLE_DISTRICT = "Hudson Valley North (Sec. 01)";
  const SAMPLE_ADDRESS = "100 Blockchain Way, Metro City";
  const SAMPLE_AREA = 1200;
  const SAMPLE_ZONING = "Residential";
  const SAMPLE_DOC_HASH = "0xe3d38838a495ef125635b5acae677cbec990a7896640fca0a492500fbc778832";
  const SAMPLE_IPFS_CID = "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";

  beforeEach(async function () {
    [admin, registrar, notary, surveyor, ownerA, buyerB, unauthorizedUser] = await hre.ethers.getSigners();

    const LandRegistryFactory = await hre.ethers.getContractFactory("LandRegistry");
    landRegistry = await LandRegistryFactory.deploy();
    await landRegistry.waitForDeployment();

    // Assign roles
    await landRegistry.setRegistrar(registrar.address, true);
    await landRegistry.setNotary(notary.address, true);
    await landRegistry.setSurveyor(surveyor.address, true);
  });

  // =========================================================================
  // 1. DEPLOYMENT & ROLE CONFIGURATION TESTS
  // =========================================================================

  it("1. Should deploy successfully with the deployer set as admin and default roles assigned", async function () {
    expect(await landRegistry.admin()).to.equal(admin.address);
    expect(await landRegistry.isRegistrar(admin.address)).to.be.true;
    expect(await landRegistry.isNotary(admin.address)).to.be.true;
    expect(await landRegistry.isSurveyor(admin.address)).to.be.true;
  });

  it("2. Should allow admin to grant and revoke registrar, notary, and surveyor roles", async function () {
    await expect(landRegistry.connect(admin).setRegistrar(unauthorizedUser.address, true))
      .to.emit(landRegistry, "RoleGranted")
      .withArgs("REGISTRAR", unauthorizedUser.address, admin.address);

    expect(await landRegistry.isRegistrar(unauthorizedUser.address)).to.be.true;

    await expect(landRegistry.connect(admin).setRegistrar(unauthorizedUser.address, false))
      .to.emit(landRegistry, "RoleRevoked")
      .withArgs("REGISTRAR", unauthorizedUser.address, admin.address);

    expect(await landRegistry.isRegistrar(unauthorizedUser.address)).to.be.false;
  });

  it("3. Should revert if non-admin attempts to grant or revoke roles", async function () {
    await expect(
      landRegistry.connect(unauthorizedUser).setRegistrar(unauthorizedUser.address, true)
    ).to.be.revertedWith("LandRegistry: Caller is not the admin");

    await expect(
      landRegistry.connect(unauthorizedUser).setNotary(unauthorizedUser.address, true)
    ).to.be.revertedWith("LandRegistry: Caller is not the admin");

    await expect(
      landRegistry.connect(unauthorizedUser).setSurveyor(unauthorizedUser.address, true)
    ).to.be.revertedWith("LandRegistry: Caller is not the admin");
  });

  // =========================================================================
  // 2. PROPERTY REGISTRATION TESTS (SECTION 8)
  // =========================================================================

  it("4. Should allow authorized Registrar to register a new parcel and emit PropertyRegistered", async function () {
    await expect(
      landRegistry.connect(registrar).registerProperty(
        SAMPLE_PROP_ID,
        SAMPLE_TITLE_NO,
        SAMPLE_PARCEL_ID,
        SAMPLE_DISTRICT,
        SAMPLE_ADDRESS,
        SAMPLE_AREA,
        SAMPLE_ZONING,
        ownerA.address,
        SAMPLE_DOC_HASH,
        SAMPLE_IPFS_CID
      )
    )
      .to.emit(landRegistry, "PropertyRegistered")
      .withArgs(SAMPLE_PROP_ID, ownerA.address, SAMPLE_PARCEL_ID, SAMPLE_DOC_HASH, (val) => val > 0);

    const prop = await landRegistry.getProperty(SAMPLE_PROP_ID);
    expect(prop.exists).to.be.true;
    expect(prop.propertyId).to.equal(SAMPLE_PROP_ID);
    expect(prop.currentOwner).to.equal(ownerA.address);
    expect(prop.areaSqMeters).to.equal(SAMPLE_AREA);
    expect(prop.isVerified).to.be.false;
    expect(prop.status).to.equal(0); // PropertyStatus.REGISTERED
  });

  it("5. Should revert when registering a duplicate property ID", async function () {
    await landRegistry.connect(registrar).registerProperty(
      SAMPLE_PROP_ID,
      SAMPLE_TITLE_NO,
      SAMPLE_PARCEL_ID,
      SAMPLE_DISTRICT,
      SAMPLE_ADDRESS,
      SAMPLE_AREA,
      SAMPLE_ZONING,
      ownerA.address,
      SAMPLE_DOC_HASH,
      SAMPLE_IPFS_CID
    );

    await expect(
      landRegistry.connect(registrar).registerProperty(
        SAMPLE_PROP_ID,
        "TIT-DIFF",
        "CAD-DIFF",
        SAMPLE_DISTRICT,
        SAMPLE_ADDRESS,
        SAMPLE_AREA,
        SAMPLE_ZONING,
        ownerA.address,
        SAMPLE_DOC_HASH,
        SAMPLE_IPFS_CID
      )
    ).to.be.revertedWith("LandRegistry: Property ID already registered");
  });

  it("6. Should revert when registering with zero address as owner", async function () {
    await expect(
      landRegistry.connect(registrar).registerProperty(
        "PROP-ZERO",
        SAMPLE_TITLE_NO,
        SAMPLE_PARCEL_ID,
        SAMPLE_DISTRICT,
        SAMPLE_ADDRESS,
        SAMPLE_AREA,
        SAMPLE_ZONING,
        hre.ethers.ZeroAddress,
        SAMPLE_DOC_HASH,
        SAMPLE_IPFS_CID
      )
    ).to.be.revertedWith("LandRegistry: Invalid owner address");
  });

  it("7. Should revert when registering with area equal to zero", async function () {
    await expect(
      landRegistry.connect(registrar).registerProperty(
        "PROP-ZERO-AREA",
        SAMPLE_TITLE_NO,
        SAMPLE_PARCEL_ID,
        SAMPLE_DISTRICT,
        SAMPLE_ADDRESS,
        0,
        SAMPLE_ZONING,
        ownerA.address,
        SAMPLE_DOC_HASH,
        SAMPLE_IPFS_CID
      )
    ).to.be.revertedWith("LandRegistry: Area must be greater than zero");
  });

  it("8. Should revert when unauthorized user attempts to register a property", async function () {
    await expect(
      landRegistry.connect(unauthorizedUser).registerProperty(
        "PROP-UNAUTH",
        SAMPLE_TITLE_NO,
        SAMPLE_PARCEL_ID,
        SAMPLE_DISTRICT,
        SAMPLE_ADDRESS,
        SAMPLE_AREA,
        SAMPLE_ZONING,
        ownerA.address,
        SAMPLE_DOC_HASH,
        SAMPLE_IPFS_CID
      )
    ).to.be.revertedWith("LandRegistry: Caller is not a Land Registrar");
  });

  // =========================================================================
  // 3. PROPERTY VERIFICATION TESTS (SECTION 9)
  // =========================================================================

  it("9. Should allow authorized Notary to verify registered property and update status", async function () {
    await landRegistry.connect(registrar).registerProperty(
      SAMPLE_PROP_ID,
      SAMPLE_TITLE_NO,
      SAMPLE_PARCEL_ID,
      SAMPLE_DISTRICT,
      SAMPLE_ADDRESS,
      SAMPLE_AREA,
      SAMPLE_ZONING,
      ownerA.address,
      SAMPLE_DOC_HASH,
      SAMPLE_IPFS_CID
    );

    await expect(
      landRegistry.connect(notary).verifyProperty(SAMPLE_PROP_ID, SAMPLE_IPFS_CID)
    )
      .to.emit(landRegistry, "PropertyVerified")
      .withArgs(SAMPLE_PROP_ID, notary.address, SAMPLE_IPFS_CID, (v) => v > 0);

    const prop = await landRegistry.getProperty(SAMPLE_PROP_ID);
    expect(prop.isVerified).to.be.true;
    expect(prop.status).to.equal(1); // PropertyStatus.VERIFIED
  });

  it("10. Should revert if property is verified more than once", async function () {
    await landRegistry.connect(registrar).registerProperty(
      SAMPLE_PROP_ID,
      SAMPLE_TITLE_NO,
      SAMPLE_PARCEL_ID,
      SAMPLE_DISTRICT,
      SAMPLE_ADDRESS,
      SAMPLE_AREA,
      SAMPLE_ZONING,
      ownerA.address,
      SAMPLE_DOC_HASH,
      SAMPLE_IPFS_CID
    );

    await landRegistry.connect(notary).verifyProperty(SAMPLE_PROP_ID, SAMPLE_IPFS_CID);

    await expect(
      landRegistry.connect(notary).verifyProperty(SAMPLE_PROP_ID, SAMPLE_IPFS_CID)
    ).to.be.revertedWith("LandRegistry: Property already verified");
  });

  it("11. Should revert when verifying a non-existent property", async function () {
    await expect(
      landRegistry.connect(notary).verifyProperty("NON-EXISTENT", SAMPLE_IPFS_CID)
    ).to.be.revertedWith("LandRegistry: Property does not exist");
  });

  it("12. Should revert when unauthorized caller attempts to verify property", async function () {
    await landRegistry.connect(registrar).registerProperty(
      SAMPLE_PROP_ID,
      SAMPLE_TITLE_NO,
      SAMPLE_PARCEL_ID,
      SAMPLE_DISTRICT,
      SAMPLE_ADDRESS,
      SAMPLE_AREA,
      SAMPLE_ZONING,
      ownerA.address,
      SAMPLE_DOC_HASH,
      SAMPLE_IPFS_CID
    );

    await expect(
      landRegistry.connect(unauthorizedUser).verifyProperty(SAMPLE_PROP_ID, SAMPLE_IPFS_CID)
    ).to.be.revertedWith("LandRegistry: Unauthorized verifier");
  });

  // =========================================================================
  // 4. OWNERSHIP TRANSFER TESTS (SECTION 10)
  // =========================================================================

  it("13. Should allow current owner to transfer verified title to buyer and emit OwnershipTransferred", async function () {
    await landRegistry.connect(registrar).registerProperty(
      SAMPLE_PROP_ID,
      SAMPLE_TITLE_NO,
      SAMPLE_PARCEL_ID,
      SAMPLE_DISTRICT,
      SAMPLE_ADDRESS,
      SAMPLE_AREA,
      SAMPLE_ZONING,
      ownerA.address,
      SAMPLE_DOC_HASH,
      SAMPLE_IPFS_CID
    );

    await landRegistry.connect(notary).verifyProperty(SAMPLE_PROP_ID, SAMPLE_IPFS_CID);

    const transferPrice = 750000;
    const newDeedURI = "ipfs://bafybeicnewdeedtransferredtobuyer";

    await expect(
      landRegistry.connect(ownerA).transferOwnership(
        SAMPLE_PROP_ID,
        buyerB.address,
        transferPrice,
        newDeedURI,
        "Direct Smart Contract"
      )
    )
      .to.emit(landRegistry, "OwnershipTransferred")
      .withArgs(SAMPLE_PROP_ID, ownerA.address, buyerB.address, transferPrice, newDeedURI, (v) => v > 0);
  });

  it("14. Should update currentOwner, previousOwner, and owner property mappings after transfer", async function () {
    await landRegistry.connect(registrar).registerProperty(
      SAMPLE_PROP_ID,
      SAMPLE_TITLE_NO,
      SAMPLE_PARCEL_ID,
      SAMPLE_DISTRICT,
      SAMPLE_ADDRESS,
      SAMPLE_AREA,
      SAMPLE_ZONING,
      ownerA.address,
      SAMPLE_DOC_HASH,
      SAMPLE_IPFS_CID
    );
    await landRegistry.connect(notary).verifyProperty(SAMPLE_PROP_ID, SAMPLE_IPFS_CID);

    await landRegistry.connect(ownerA).transferOwnership(
      SAMPLE_PROP_ID,
      buyerB.address,
      500000,
      "ipfs://new-deed",
      "Notary Seal"
    );

    const prop = await landRegistry.getProperty(SAMPLE_PROP_ID);
    expect(prop.currentOwner).to.equal(buyerB.address);
    expect(prop.previousOwner).to.equal(ownerA.address);
    expect(prop.status).to.equal(3); // PropertyStatus.TRANSFERRED

    const ownerAProps = await landRegistry.getPropertiesByOwner(ownerA.address);
    expect(ownerAProps).to.not.include(SAMPLE_PROP_ID);

    const buyerBProps = await landRegistry.getPropertiesByOwner(buyerB.address);
    expect(buyerBProps).to.include(SAMPLE_PROP_ID);

    const history = await landRegistry.getTitleHistory(SAMPLE_PROP_ID);
    expect(history.length).to.equal(2); // Genesis + 1 Transfer
    expect(history[1].fromOwner).to.equal(ownerA.address);
    expect(history[1].toOwner).to.equal(buyerB.address);
  });

  it("15. Should revert when transferring an unverified property", async function () {
    await landRegistry.connect(registrar).registerProperty(
      SAMPLE_PROP_ID,
      SAMPLE_TITLE_NO,
      SAMPLE_PARCEL_ID,
      SAMPLE_DISTRICT,
      SAMPLE_ADDRESS,
      SAMPLE_AREA,
      SAMPLE_ZONING,
      ownerA.address,
      SAMPLE_DOC_HASH,
      SAMPLE_IPFS_CID
    );

    await expect(
      landRegistry.connect(ownerA).transferOwnership(
        SAMPLE_PROP_ID,
        buyerB.address,
        100000,
        "ipfs://deed",
        "Direct"
      )
    ).to.be.revertedWith("LandRegistry: Unverified property cannot be transferred");
  });

  it("16. Should revert when non-owner (or previous owner) tries to transfer property", async function () {
    await landRegistry.connect(registrar).registerProperty(
      SAMPLE_PROP_ID,
      SAMPLE_TITLE_NO,
      SAMPLE_PARCEL_ID,
      SAMPLE_DISTRICT,
      SAMPLE_ADDRESS,
      SAMPLE_AREA,
      SAMPLE_ZONING,
      ownerA.address,
      SAMPLE_DOC_HASH,
      SAMPLE_IPFS_CID
    );
    await landRegistry.connect(notary).verifyProperty(SAMPLE_PROP_ID, SAMPLE_IPFS_CID);

    // Transfer from ownerA to buyerB
    await landRegistry.connect(ownerA).transferOwnership(
      SAMPLE_PROP_ID,
      buyerB.address,
      100000,
      "ipfs://deed",
      "Direct"
    );

    // Old owner ownerA tries to transfer again
    await expect(
      landRegistry.connect(ownerA).transferOwnership(
        SAMPLE_PROP_ID,
        unauthorizedUser.address,
        100000,
        "ipfs://deed",
        "Direct"
      )
    ).to.be.revertedWith("LandRegistry: Caller not authorized to transfer title");
  });

  it("17. Should revert when transferring to zero address", async function () {
    await landRegistry.connect(registrar).registerProperty(
      SAMPLE_PROP_ID,
      SAMPLE_TITLE_NO,
      SAMPLE_PARCEL_ID,
      SAMPLE_DISTRICT,
      SAMPLE_ADDRESS,
      SAMPLE_AREA,
      SAMPLE_ZONING,
      ownerA.address,
      SAMPLE_DOC_HASH,
      SAMPLE_IPFS_CID
    );
    await landRegistry.connect(notary).verifyProperty(SAMPLE_PROP_ID, SAMPLE_IPFS_CID);

    await expect(
      landRegistry.connect(ownerA).transferOwnership(
        SAMPLE_PROP_ID,
        hre.ethers.ZeroAddress,
        100000,
        "ipfs://deed",
        "Direct"
      )
    ).to.be.revertedWith("LandRegistry: Invalid new owner address");
  });

  it("18. Should revert when transferring to current owner itself", async function () {
    await landRegistry.connect(registrar).registerProperty(
      SAMPLE_PROP_ID,
      SAMPLE_TITLE_NO,
      SAMPLE_PARCEL_ID,
      SAMPLE_DISTRICT,
      SAMPLE_ADDRESS,
      SAMPLE_AREA,
      SAMPLE_ZONING,
      ownerA.address,
      SAMPLE_DOC_HASH,
      SAMPLE_IPFS_CID
    );
    await landRegistry.connect(notary).verifyProperty(SAMPLE_PROP_ID, SAMPLE_IPFS_CID);

    await expect(
      landRegistry.connect(ownerA).transferOwnership(
        SAMPLE_PROP_ID,
        ownerA.address,
        100000,
        "ipfs://deed",
        "Direct"
      )
    ).to.be.revertedWith("LandRegistry: New owner cannot be current owner");
  });

  // =========================================================================
  // 5. ENCUMBRANCES & LIENS TESTS
  // =========================================================================

  it("19. Should block transfer when an active mortgage/lien encumbrance exists, and permit transfer after discharge", async function () {
    await landRegistry.connect(registrar).registerProperty(
      SAMPLE_PROP_ID,
      SAMPLE_TITLE_NO,
      SAMPLE_PARCEL_ID,
      SAMPLE_DISTRICT,
      SAMPLE_ADDRESS,
      SAMPLE_AREA,
      SAMPLE_ZONING,
      ownerA.address,
      SAMPLE_DOC_HASH,
      SAMPLE_IPFS_CID
    );
    await landRegistry.connect(notary).verifyProperty(SAMPLE_PROP_ID, SAMPLE_IPFS_CID);

    // Add Mortgage
    await landRegistry.connect(notary).addEncumbrance(
      SAMPLE_PROP_ID,
      "ENC-01",
      "Mortgage",
      notary.address,
      250000,
      "0xhash"
    );

    expect(await landRegistry.hasActiveEncumbrance(SAMPLE_PROP_ID)).to.be.true;

    // Transfer attempt must revert
    await expect(
      landRegistry.connect(ownerA).transferOwnership(
        SAMPLE_PROP_ID,
        buyerB.address,
        500000,
        "ipfs://deed",
        "Direct"
      )
    ).to.be.revertedWith("LandRegistry: Encumbered property cannot be transferred");

    // Discharge Lien
    await landRegistry.connect(notary).releaseEncumbrance(SAMPLE_PROP_ID, 0);
    expect(await landRegistry.hasActiveEncumbrance(SAMPLE_PROP_ID)).to.be.false;

    // Transfer should now succeed
    await expect(
      landRegistry.connect(ownerA).transferOwnership(
        SAMPLE_PROP_ID,
        buyerB.address,
        500000,
        "ipfs://deed",
        "Direct"
      )
    ).to.emit(landRegistry, "OwnershipTransferred");
  });

  // =========================================================================
  // 6. DISPUTES WORKFLOW TESTS
  // =========================================================================

  it("20. Should block transfer when a boundary dispute is active, and permit transfer once resolved", async function () {
    await landRegistry.connect(registrar).registerProperty(
      SAMPLE_PROP_ID,
      SAMPLE_TITLE_NO,
      SAMPLE_PARCEL_ID,
      SAMPLE_DISTRICT,
      SAMPLE_ADDRESS,
      SAMPLE_AREA,
      SAMPLE_ZONING,
      ownerA.address,
      SAMPLE_DOC_HASH,
      SAMPLE_IPFS_CID
    );
    await landRegistry.connect(notary).verifyProperty(SAMPLE_PROP_ID, SAMPLE_IPFS_CID);

    // Flag Dispute
    await landRegistry.connect(ownerA).flagDispute(SAMPLE_PROP_ID, "Adjacent plot encroachment complaint");

    const prop = await landRegistry.getProperty(SAMPLE_PROP_ID);
    expect(prop.status).to.equal(4); // PropertyStatus.IN_DISPUTE

    // Transfer attempt must revert
    await expect(
      landRegistry.connect(ownerA).transferOwnership(
        SAMPLE_PROP_ID,
        buyerB.address,
        500000,
        "ipfs://deed",
        "Direct"
      )
    ).to.be.revertedWith("LandRegistry: Disputed property cannot be transferred");

    // Resolve Dispute
    await landRegistry.connect(registrar).resolveDispute(SAMPLE_PROP_ID, "Cadastral survey boundary reaffirmed");

    const resolvedProp = await landRegistry.getProperty(SAMPLE_PROP_ID);
    expect(resolvedProp.status).to.equal(1); // PropertyStatus.VERIFIED

    // Transfer should now succeed
    await expect(
      landRegistry.connect(ownerA).transferOwnership(
        SAMPLE_PROP_ID,
        buyerB.address,
        500000,
        "ipfs://deed",
        "Direct"
      )
    ).to.emit(landRegistry, "OwnershipTransferred");
  });
});
