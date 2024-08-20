import SQL, { SQLStatement } from 'sql-template-strings'
import { EmotePlayMode, GenderFilterOption, ListingStatus, Network, NFTFilters, Rarity, TradeType, WearableGender } from '@dcl/schemas'
import { getDBNetworks } from '../../utils'
import { getTradesForTypeQuery } from '../trades/queries'
import { ItemType } from './types'

// TODO: Add rental filters
// isOnRent?: boolean;
// rentalStatus?: RentalsListingsFilterBy['status'];
// rentalDays?: number[];

function getEmotePlayModeWhereStatement(emotePlayMode: EmotePlayMode | EmotePlayMode[] | undefined): SQLStatement | null {
  if (!emotePlayMode || (Array.isArray(emotePlayMode) && (emotePlayMode.length === 2 || emotePlayMode.length === 0))) {
    return null
  }

  if (emotePlayMode === EmotePlayMode.LOOP || (Array.isArray(emotePlayMode) && emotePlayMode.includes(EmotePlayMode.LOOP))) {
    return SQL` nft.search_emote_loop = true `
  }

  return SQL` nft.search_emote_loop = false `
}

function getGenderWhereStatement(isEmote: boolean, genders?: (WearableGender | GenderFilterOption)[]): SQLStatement | null {
  if (!genders || !genders.length) {
    return null
  }

  const hasUnisex = genders.includes(GenderFilterOption.UNISEX)
  const hasMale = hasUnisex || genders.includes(GenderFilterOption.MALE)
  const hasFemale = hasUnisex || genders.includes(GenderFilterOption.FEMALE)
  const searchProperty = isEmote ? 'search_emote_body_shapes' : 'search_wearable_body_shapes'
  const bodyShapesArray = []

  if (hasMale) {
    bodyShapesArray.push('BaseMale')
  }

  if (hasFemale) {
    bodyShapesArray.push('BaseFemale')
  }

  return bodyShapesArray.length ? SQL` ${searchProperty} @> ${bodyShapesArray} ` : null
}

function getRarityWhereStatement(rarities?: Rarity[]): SQLStatement | null {
  if (!rarities || !rarities.length) {
    return null
  }

  return SQL` (nft.search_wearable_rarity = ANY (${rarities}) OR nft.search_emote_rarity = ANY (${rarities})) `
}

function getNFTWhereStatement(nftFilters?: NFTFilters): SQLStatement {
  if (!nftFilters) {
    return SQL``
  }

  const FILTER_BY_CATEGORY = nftFilters.category ? SQL` LOWER(nft.category) = LOWER(${nftFilters.category}) ` : null
  const FILTER_BY_OWNER = nftFilters.owner ? SQL` LOWER(account.address) = LOWER(${nftFilters.owner}) ` : null
  const FILTER_BY_TOKEN_ID = nftFilters.tokenId ? SQL` nft.token_id = ${nftFilters.tokenId} ` : null
  const FILTER_BY_ITEM_ID = nftFilters.itemId ? SQL` LOWER(nft.item_id) = LOWER(${nftFilters.itemId}) ` : null
  const FILTER_BY_NETWORK = nftFilters.network ? SQL` nft.network = ANY (${getDBNetworks(nftFilters.network)}) ` : null
  const FILTER_BY_HAS_SOUND = nftFilters.emoteHasSound ? SQL` emote.has_sound = true ` : null
  const FILTER_BY_HAS_GEOMETRY = nftFilters.emoteHasGeometry ? SQL` emote.has_geometry = true ` : null
  const FILTER_MIN_ESTATE_SIZE = nftFilters.minEstateSize ? SQL` estate.size >= ${nftFilters.minEstateSize} ` : null
  const FILTER_MAX_ESTATE_SIZE = nftFilters.maxEstateSize ? SQL` estate.size <= ${nftFilters.maxEstateSize} ` : null
  const FILTER_BY_WEARABLE_CATEGORY = nftFilters.wearableCategory ? SQL` wearable.category = ${nftFilters.wearableCategory} ` : null
  const FILTER_BY_EMOTE_CATEGORY = nftFilters.emoteCategory ? SQL` emote.category = ${nftFilters.emoteCategory} ` : null
  const FILTER_BY_WEARABLE_HEAD = nftFilters.isWearableHead ? SQL` nft.search_is_wearable_head = true ` : null
  const FILTER_BY_LAND = nftFilters.isLand ? SQL` nft.search_is_land = true ` : null
  const FILTER_BY_WEARABLE_ACCESSORY = nftFilters.isWearableAccessory ? SQL` nft.search_is_wearable_accessory = true ` : null
  const FILTER_BY_WEARABLE_SMART = nftFilters.isWearableSmart ? SQL` nft.item_type = ${ItemType.SMART_WEARABLE_V1} ` : null
  const FILTER_BY_CONTRACT_ADDRESS =
    nftFilters.contractAddresses && nftFilters.contractAddresses.length
      ? SQL` nft.contract_address = ANY (${nftFilters.contractAddresses}) `
      : null
  const FILTER_BY_TEXT = nftFilters.search ? SQL` nft.search_text % ${nftFilters.search} ` : null
  const FILTER_BY_MIN_DISTANCE_TO_PLAZA = nftFilters.minDistanceToPlaza
    ? SQL` nft.search_distance_to_plaza >= ${nftFilters.minDistanceToPlaza} `
    : null
  const FILTER_BY_MAX_DISTANCE_TO_PLAZA = nftFilters.maxDistanceToPlaza
    ? SQL` nft.search_distance_to_plaza <= ${nftFilters.maxDistanceToPlaza} `
    : null
  const FILTER_BY_ADJACENT_TO_ROAD = nftFilters.adjacentToRoad ? SQL` nft.search_adjacent_to_road = true ` : null
  const FILTER_BY_EMOTE_PLAY_MODE = getEmotePlayModeWhereStatement(nftFilters.emotePlayMode)
  const FILTER_BY_EMOTE_GENDERS = getGenderWhereStatement(true, nftFilters.emoteGenders)
  const FILTER_BY_WEARABLE_GENDER = getGenderWhereStatement(false, nftFilters.wearableGenders)
  const FILTER_BY_CREATOR =
    nftFilters.creator && nftFilters.creator.length ? SQL` LOWER(item.creator) = LOWER(${nftFilters.creator}) ` : null
  const FILTER_BY_ID = nftFilters.ids && nftFilters.ids.length ? SQL` nft.id = ANY (${nftFilters.ids}) ` : null
  const FITLER_BY_RARITY = getRarityWhereStatement(nftFilters.itemRarities)
  const FILTER_BY_MIN_PRICE = nftFilters.minPrice
    ? SQL` (nft.search_order_price >= ${nftFilters.minPrice} OR trades.assets -> 'sent' --> amount >= ${nftFilters.minPrice})`
    : null
  const FILTER_BY_MAX_PRICE = nftFilters.minPrice
    ? SQL` (nft.search_order_price <= ${nftFilters.maxDistanceToPlaza} OR trades.assets -> 'sent' --> amount <= ${nftFilters.minPrice})`
    : null
  const FILTER_BY_ON_SALE = nftFilters.isOnSale ? SQL` (trades.id IS NOT NULL OR nft.search_order_status = ${ListingStatus.OPEN}) ` : null

  return (
    [
      FILTER_BY_CATEGORY,
      FILTER_BY_OWNER,
      FILTER_BY_TOKEN_ID,
      FILTER_BY_ITEM_ID,
      FILTER_BY_NETWORK,
      FILTER_BY_HAS_SOUND,
      FILTER_BY_HAS_GEOMETRY,
      FILTER_MIN_ESTATE_SIZE,
      FILTER_MAX_ESTATE_SIZE,
      FILTER_BY_EMOTE_CATEGORY,
      FILTER_BY_WEARABLE_CATEGORY,
      FILTER_BY_WEARABLE_HEAD,
      FILTER_BY_LAND,
      FILTER_BY_WEARABLE_ACCESSORY,
      FILTER_BY_WEARABLE_SMART,
      FILTER_BY_CONTRACT_ADDRESS,
      FILTER_BY_TEXT,
      FILTER_BY_MIN_DISTANCE_TO_PLAZA,
      FILTER_BY_MAX_DISTANCE_TO_PLAZA,
      FILTER_BY_ADJACENT_TO_ROAD,
      FILTER_BY_EMOTE_PLAY_MODE,
      FILTER_BY_EMOTE_GENDERS,
      FILTER_BY_WEARABLE_GENDER,
      FILTER_BY_CREATOR,
      FILTER_BY_ID,
      FITLER_BY_RARITY,
      FILTER_BY_MIN_PRICE,
      FILTER_BY_MAX_PRICE,
      FILTER_BY_ON_SALE
    ].reduce<SQLStatement | null>((acc, filter) => {
      if (filter === null) {
        return acc
      }

      if (acc === null) {
        return SQL` WHERE `.append(filter)
      }

      return acc.append(SQL` AND `).append(filter)
    }, null) || SQL``
  )
}

function getNFTLimitAndOffsetStatement(nftFilters?: NFTFilters) {
  const limit = nftFilters?.first ? nftFilters.first : 100
  const offset = nftFilters?.skip ? nftFilters.skip : 0

  return SQL` LIMIT ${limit} OFFSET ${offset} `
}

export function getNFTsQuery(nftFilters?: NFTFilters) {
  return SQL`
    SELECT
      COUNT(*) OVER() as count,
      nft.id,
      nft.contract_address,
      nft.token_id,
      nft.network,
      nft.created_at,
      nft.token_uri as url,
      nft.updated_at,
      nft.sold_at,
      nft.urn,
      account.address as owner,
      nft.image,
      nft.issued_id,
      nft.item_id,
      nft.category,
      coalesce (wearable.rarity, emote.rarity) as rarity,
      coalesce (wearable.name, emote.name, land_data."name", ens.subdomain) as name,
      parcel.x,
      parcel.y,
      wearable.body_shapes,
      nft.item_type,
      emote.loop,
      emote.has_sound,
      emote.has_geometry,
      estate.estate_parcels,
      estate.size as size,
      parcel.parcel_estate_token_id,
      parcel.parcel_estate_name,
      parcel.estate_id as parcel_estate_id,
      coalesce (wearable.description, emote.description, land_data.description) as description
    FROM
      squid_marketplace.nft nft
    LEFT JOIN squid_marketplace.metadata metadata on
      nft.metadata_id = metadata.id
    LEFT JOIN squid_marketplace.wearable wearable on
      metadata.wearable_id = wearable.id
    LEFT JOIN squid_marketplace.emote emote on
      metadata.emote_id = emote.id
    LEFT JOIN (
      SELECT par.*, par_est.token_id as parcel_estate_token_id, est_data.name as parcel_estate_name
      FROM squid_marketplace.parcel par
      LEFT JOIN squid_marketplace.estate par_est ON par.estate_id = par_est.id
      LEFT JOIN squid_marketplace.data est_data on par_est.data_id = est_data.id
    ) as parcel on nft.id = parcel.id
    LEFT JOIN (
      SELECT est.id, est.token_id, est.size, est.data_id, array_agg(json_build_object('x', est_parcel.x, 'y', est_parcel.y)) as estate_parcels
      FROM squid_marketplace.estate est
      LEFT JOIN squid_marketplace.parcel est_parcel ON est.id = est_parcel.estate_id
      GROUP BY est.id, est.token_id, est.size, est.data_id
    ) as estate on nft.id = estate.id
    LEFT JOIN squid_marketplace.data land_data on (estate.data_id  = land_data.id or parcel.id = land_data.id)
    LEFT JOIN squid_marketplace.ens ens on ens.id = nft.ens_id 
    LEFT JOIN squid_marketplace.account account on nft.owner_id = account.id
    LEFT JOIN squid_marketplace.item item on item.id = nft.item_id
  `
    .append(
      ` LEFT JOIN (${getTradesForTypeQuery(
        TradeType.PUBLIC_NFT_ORDER
      )}) as trades ON trades.assets -> 'sent' ->> 'token_id' = nft.token_id::text AND trades.assets -> 'sent' ->> 'contract_address' = nft.contract_address AND trades.status = '${
        ListingStatus.OPEN
      }' AND trades.signer = account.address`
    )
    .append(getNFTWhereStatement(nftFilters))
    .append(getNFTLimitAndOffsetStatement(nftFilters))
}

export function getNftByTokenIdQuery(contractAddress: string, tokenId: string, network: Network) {
  return getNFTsQuery({ tokenId, network, contractAddresses: [contractAddress] })
}
