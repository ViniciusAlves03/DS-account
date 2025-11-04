import { Application } from 'express'
import { Identifier } from './src/di/identifiers'
import { DIContainer } from './src/di/di'
import { ILogger } from './src/utils/custom.logger'
import { BackgroundService } from './src/background/background.service'
import { Default } from './src/utils/default'
import { App } from './src/app'

require('dotenv').config()

const logger: ILogger = DIContainer.get<ILogger>(Identifier.LOGGER)
const app: Application = (DIContainer.get<App>(Identifier.APP)).getExpress()
const backgroundServices: BackgroundService = DIContainer.get(Identifier.BACKGROUND_SERVICE)
const port = process.env.PORT_HTTP || Default.PORT_HTTP

app.listen(port, () => {
    logger.debug(`Servidor HTTP rodando na porta ${port} 🚀`)

    initListener()
    backgroundServices.startServices()
        .then(() => {
            logger.debug('Serviços em background inicializados com sucesso...')
        })
        .catch(err => {
            logger.error(err.message)
            process.exit()
        })
})


function initListener(): void {
    process.on('SIGINT', async () => {
        try {
            await backgroundServices.stopServices()
        } catch (err: any) {
            logger.error(`Erro ao parar todos os serviços: ${err.message}`)
        } finally {
            logger.debug('Serviços em background finalizados com sucesso...')
        }
        process.exit()
    })
}
