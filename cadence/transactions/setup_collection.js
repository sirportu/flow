export const setupCollection = `
import NonFungibleToken from 0x631e88ae7f1d7c20
import PiratesOfTheMetaverse from 0xc97017ed85e496bf
import MetadataViews from 0x631e88ae7f1d7c20

// Set up account
// This transaction configures an account to hold Kitty Items.
transaction {
  prepare(signer: AuthAccount) {
    // if the account doesn't already have a collection
    if signer.borrow<&PiratesOfTheMetaverse.Collection>(from: PiratesOfTheMetaverse.CollectionStoragePath) == nil {

      // create a new empty collection
      let collection <- PiratesOfTheMetaverse.createEmptyCollection()
      
      // save it to the account
      signer.save(<-collection, to: PiratesOfTheMetaverse.CollectionStoragePath)

      // create a public capability for the collection
      signer.link<&PiratesOfTheMetaverse.Collection{NonFungibleToken.CollectionPublic, PiratesOfTheMetaverse.PiratesOfTheMetaverseCollectionPublic,
      MetadataViews.ResolverCollection}>(PiratesOfTheMetaverse.CollectionPublicPath, target: PiratesOfTheMetaverse.CollectionStoragePath)
    }
  }
}
`;
