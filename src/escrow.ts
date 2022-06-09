import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import {
  Escrow,
  DefinedOfferCancelled,
  DisplayedOfferCancelled,
  OfferAccepted,
  OfferDefined,
  OfferDisplayed,
  OfferDisplayedBundleNftsStruct,
  OfferDisplayedBundlePouchesStruct,
  OfferDefinedBundleNftsStruct,
  OfferDefinedBundlePouchesStruct
} from "../generated/Escrow/Escrow"
import { User, DisplayedOffer, DefinedOffer } from "../generated/schema"

export function handleOfferDisplayed(event: OfferDisplayed): void {
  const displayedOffer = new DisplayedOffer(event.params.displayedOfferId)
  displayedOffer.maker = getUser(event.params.maker).id
  const nftContractAddresses:Bytes[] = []
  const nftTokenIds:BigInt[] = []
  const pouchContractAddresses:Bytes[] = []
  const pouchValues:BigInt[] = []
  for(let i = 0; i < event.params.bundle.nfts.length; i ++) {
    const nft:OfferDisplayedBundleNftsStruct = event.params.bundle.nfts[i]
    nftContractAddresses.push(nft.cAddr)
    nftTokenIds.push(nft.tokenId)
  }
  for(let i = 0; i < event.params.bundle.pouches.length; i ++) {
    const pouch:OfferDisplayedBundlePouchesStruct = event.params.bundle.pouches[i]
    pouchContractAddresses.push(pouch.cAddr)
    pouchValues.push(pouch.value)
  }
  displayedOffer.nftContractAddresses = nftContractAddresses
  displayedOffer.nftTokenIds = nftTokenIds
  displayedOffer.pouchContractAddresses = pouchContractAddresses
  displayedOffer.pouchValues = nftTokenIds
  displayedOffer.cancelled = false
  displayedOffer.name = event.params.name
  displayedOffer.save()
}

export function handleOfferDefined(event: OfferDefined): void {
  const definedOffer = new DefinedOffer(event.params.definedOfferId)
  definedOffer.maker = getUser(event.params.maker).id
  definedOffer.displayedOffer = event.params.displayedOfferId
  const nftContractAddresses:Bytes[] = []
  const nftTokenIds:BigInt[] = []
  const pouchContractAddresses:Bytes[] = []
  const pouchValues:BigInt[] = []
  for(let i = 0; i < event.params.bundle.nfts.length; i ++) {
    const nft:OfferDefinedBundleNftsStruct = event.params.bundle.nfts[i]
    nftContractAddresses.push(nft.cAddr)
    nftTokenIds.push(nft.tokenId)
  }
  for(let i = 0; i < event.params.bundle.pouches.length; i ++) {
    const pouch:OfferDefinedBundlePouchesStruct = event.params.bundle.pouches[i]
    pouchContractAddresses.push(pouch.cAddr)
    pouchValues.push(pouch.value)
  }
  definedOffer.nftContractAddresses = nftContractAddresses
  definedOffer.name = event.params.name
  definedOffer.nftTokenIds = nftTokenIds
  definedOffer.pouchContractAddresses = pouchContractAddresses
  definedOffer.pouchValues = nftTokenIds
  definedOffer.cancelled = false
  definedOffer.accepted = false
  definedOffer.save()
}

export function handleDefinedOfferCancelled(event: DefinedOfferCancelled): void {
  const definedOffer = DefinedOffer.load(event.params.definedOfferId)!
  definedOffer.cancelled = true
  definedOffer.save()
}

export function handleDisplayedOfferCancelled(event: DisplayedOfferCancelled): void {
  const displayedOffer = DisplayedOffer.load(event.params.displayedOfferId)!
  displayedOffer.cancelled = true
  displayedOffer.save()
}

export function handleOfferAccepted(event: OfferAccepted): void {
  const definedOffer = DefinedOffer.load(event.params.definedOfferId)!
  definedOffer.accepted = true
  definedOffer.save()

  const displayedOffer = DisplayedOffer.load(event.params.displayedOfferId)!
  displayedOffer.acceptedOffer = definedOffer.id
  displayedOffer.save()
}

function getUser(address: Address): User {
  const id = address.toHexString()
  let user = User.load(id)
  if(!user) {
    user = new User(id)
    user.address = address
    user.save()
  }
  return user
}