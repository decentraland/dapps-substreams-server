import { GetBidsParameters } from '@dcl/schemas'
import { fromDBBidToBid } from '../../adapters/bids/bids'
import { AppComponents } from '../../types'
import { getBidsQuery } from './queries'
import { DBBid, IBidsComponent } from './types'

export function createBidsComponents(components: Pick<AppComponents, 'dappsDatabase'>): IBidsComponent {
  const { dappsDatabase: pg } = components

  async function getBids(options: GetBidsParameters) {
    const result = await pg.query<DBBid>(getBidsQuery(options))

    return {
      data: result.rows.map(fromDBBidToBid),
      count: result.rows.length ? Number(result.rows[0].bids_count) : 0
    }
  }

  return {
    getBids
  }
}
