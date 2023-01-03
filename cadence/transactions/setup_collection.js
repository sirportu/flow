export const setupCollection = `
import PiratesOfTheMetaverse from 0xc97017ed85e496bf
import NonFungibleToken from 0x631e88ae7f1d7c20


transaction {

    prepare(signer: AuthAccount) {
        // Return early if the account already has a collection
        if signer.borrow<&ExampleNFT.Collection>(from: PiratesOfTheMetaverse.CollectionStoragePath) != nil {
            return
        }

        // Create a new empty collection
        let collection <- PiratesOfTheMetaverse.createEmptyCollection()

        // save it to the account
        signer.save(<-collection, to: PiratesOfTheMetaverse.CollectionStoragePath)

        // create a public capability for the collection
        signer.link<&{NonFungibleToken.CollectionPublic, PiratesOfTheMetaverse.ExampleNFTCollectionPublic}>(
            PiratesOfTheMetaverse.CollectionPublicPath,
            target: PiratesOfTheMetaverse.CollectionStoragePath
        )
    }
    execute {
      log("A user stored a Collection inside their account")
    }
}
`;
