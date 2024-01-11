import { Router } from '@well-known-components/http-server'
import * as authorizationMiddleware from 'decentraland-crypto-middleware'
import { GlobalContext } from '../types'
import { createBalanceHandler } from './handlers/balance-handler'
import { createCatalogHandler } from './handlers/catalog-handler'
import { createENSImageGeratorHandler } from './handlers/ens'
import { pingHandler } from './handlers/ping-handler'
import { createWertSignerHandler } from './handlers/wert-signer-handler'

const FIVE_MINUTES = 5 * 60 * 1000

// We return the entire router because it will be easier to test than a whole server
export async function setupRouter(globalContext: GlobalContext): Promise<Router<GlobalContext>> {
  const { components } = globalContext
  const router = new Router<GlobalContext>()

  router.get('/ping', pingHandler)
  router.get(
    '/v1/catalog',
    authorizationMiddleware.wellKnownComponents({
      optional: true,
      expiration: FIVE_MINUTES
    }),
    createCatalogHandler(components)
  )
  router.post(
    '/v1/wert/sign',
    authorizationMiddleware.wellKnownComponents({
      optional: true,
      expiration: FIVE_MINUTES
    }),
    createWertSignerHandler
  )
  router.get('/v1/ens/generate', createENSImageGeratorHandler)
  router.get('/v1/:chainId/address/:wallet/balance', createBalanceHandler)

  return router
}
