import { Params } from '../../logic/http/params'
import { HandlerContextWithPath, StatusCode } from '../../types'

export async function createENSImageGeratorHandler(
  context: Pick<HandlerContextWithPath<'ens', '/v1/ens/generate'>, 'url' | 'components' | 'request'>
) {
  const {
    url,
    components: { ens }
  } = context

  const params = new Params(url.searchParams)
  const ensName = params.getValue<string>('ens')
  const width = params.getNumber('width')
  const height = params.getNumber('height')
  const onlyLogo = params.getBoolean('onlyLogo')

  if (!ensName || !width || !height) {
    return {
      status: StatusCode.BAD_REQUEST,
      body: {
        ok: false,
        message: 'Bad Request'
      }
    }
  }

  try {
    return {
      status: 200,
      headers: {
        'content-type': 'image/png'
      },
      body: await ens.generateImage(ensName, width, height, onlyLogo)
    }
  } catch (error) {
    console.log('error: ', error)
    return {
      status: 400,
      body: {
        ok: false,
        message: 'Something went wrong generating the image'
      }
    }
  }
}
