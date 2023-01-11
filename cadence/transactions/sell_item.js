export const sellItem = `
import FlowToken from 0x7e60df042a9c0868
import FungibleToken from 0x9a0766d93b6608b7
import NonFungibleToken from 0x631e88ae7f1d7c20
import PiratesOfTheMetaverse from 0xc97017ed85e496bf
import NFTStorefrontV2 from 0xdf202fd6391aaf5d

transaction(saleItemID: UInt64, saleItemPrice: UFix64, customID: String?, commissionAmount: UFix64) {
    let flowReceiver: Capability<&AnyResource{FungibleToken.Receiver}>
    let PiratesOfTheMetaverseProvider: Capability<&AnyResource{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>
    let storefront: &NFTStorefrontV2.Storefront
    var saleCuts: [NFTStorefrontV2.SaleCut]

    prepare(acct: AuthAccount) {
        self.saleCuts = []

        // We need a provider capability, but one is not provided by default so we create one if needed.
        let PiratesOfTheMetaverseCollectionProviderPrivatePath = /private/PiratesOfTheMetaverseCollectionProviderForNFTStorefront

        // Receiver for the sale cut.
        self.flowReceiver = acct.getCapability<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)!

        if !acct.getCapability<&{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>(PiratesOfTheMetaverseCollectionProviderPrivatePath)!.check() {
            acct.link<&{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>(PiratesOfTheMetaverseCollectionProviderPrivatePath, target: PiratesOfTheMetaverse.CollectionStoragePath)
        }

        self.PiratesOfTheMetaverseProvider = acct.getCapability<&{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>(PiratesOfTheMetaverseCollectionProviderPrivatePath)!
        let effectiveSaleItemPrice = saleItemPrice - commissionAmount

        // Append the cut for the seller.
        self.saleCuts.append(NFTStorefrontV2.SaleCut(
            receiver: self.flowReceiver,
            amount: effectiveSaleItemPrice
        ))
        self.storefront = acct.borrow<&NFTStorefrontV2.Storefront>(from: NFTStorefrontV2.StorefrontStoragePath)
            ?? panic("Missing or mis-typed NFTStorefront Storefront")
    }

    execute {
        // Create listing
        self.storefront.createListing(
            nftProviderCapability: self.PiratesOfTheMetaverseProvider,
            nftType: Type<@PiratesOfTheMetaverse.NFT>(),
            nftID: saleItemID,
            salePaymentVaultType: Type<@FlowToken.Vault>(),
            saleCuts: self.saleCuts,
            marketplacesCapability: nil,
            customID: customID,
            commissionAmount: commissionAmount,
            expiry: UInt64(getCurrentBlock().timestamp + (60.0 * 60.0 * 30.0))
        )
        log("Listing created")
    }
}
`