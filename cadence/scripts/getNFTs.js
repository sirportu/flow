export const getNFTsScript = `
import NonFungibleToken from 0x631e88ae7f1d7c20
import PiratesOfTheMetaverse from 0xc97017ed85e496bf
import MetadataViews from 0x631e88ae7f1d7c20

// This script returns an array of all the NFT IDs in an account's collection.
pub fun main(address: Address): [UInt64] {
    let account = getAccount(address)

    let collectionRef = account.getCapability(PiratesOfTheMetaverse.CollectionPublicPath)!.borrow<&{NonFungibleToken.CollectionPublic}>()
        ?? panic("Could not borrow capability from public collection")
    
    return collectionRef.getIDs()
}
`;
