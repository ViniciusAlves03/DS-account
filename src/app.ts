import bodyParser from 'body-parser'
import express, { Application, NextFunction, Request, Response } from 'express'
import helmet from 'helmet'
import HttpStatus from 'http-status-codes'
import { inject, injectable } from 'inversify'
import { InversifyExpressServer } from 'inversify-express-utils'
import morgan from 'morgan'
import qs from 'query-strings-parser'
import 'reflect-metadata'
import swaggerUi from 'swagger-ui-express'
import yaml from 'yamljs'
import { DIContainer } from './di/di'
import { Identifier } from './di/identifiers'
import { ApiException } from './ui/exception/api.exception'
import { ILogger } from './utils/custom.logger'
import { Default } from './utils/default'
import { Strings } from './utils/strings'


@injectable()
export class App {
    private readonly express: Application

    constructor(@inject(Identifier.LOGGER) private readonly _logger: ILogger) {
        this.express = express()
        this.bootstrap()
    }

    public getExpress(): Application {
        return this.express
    }

    private bootstrap(): void {
        this.initMiddleware()
    }

    private initMiddleware(): void {
        this.setupInversifyExpress()
        this.setupSwaggerUI()
        this.setupErrorsHandler()
    }

    private setupInversifyExpress(): void {
        const inversifyExpress: InversifyExpressServer = new InversifyExpressServer(
            DIContainer, null, { rootPath: '/' })

        inversifyExpress.setConfig((app: Application) => {
            app.use(qs({
                use_page: true,
                default: {
                    pagination: { page: 1, limit: 100 }
                }
            }))
            app.use(helmet())
            app.use(bodyParser.json())
            app.use(bodyParser.urlencoded({ extended: false }))
            app.use(morgan(':remote-addr :remote-user ":method :url HTTP/:http-version" ' +
                ':status :res[content-length] :response-time ms ":referrer" ":user-agent"', {
                stream: { write: (str: string) => this._logger.info(str) }
            }
            ))
        })
        this.express.use(inversifyExpress.build())
    }

    private setupSwaggerUI(): void {
        const options = {
            customCss: '.swagger-ui .topbar { display: none }',
            // customfavIcon: Default.LOGO_URI,
            customSiteTitle: `API Reference | ${Strings.APP.TITLE}`
        }
        this.express.use(
            '/v1/reference', swaggerUi.serve, swaggerUi.setup(yaml.load(Default.SWAGGER_PATH), options))
    }

    private setupErrorsHandler(): void {
        this.express.use((req, res) => {
            const errorMessage: ApiException = new ApiException(
                404,
                Strings.ERROR_MESSAGE.ENDPOINT_NOT_FOUND.replace('{0}', req.url)
            )
            res.status(HttpStatus.NOT_FOUND).send(errorMessage.toJSON())
        })

        this.express.use((err: any, req: Request, res: Response, next: NextFunction) => {
            let statusCode = HttpStatus.INTERNAL_SERVER_ERROR
            const errorMessage: ApiException = new ApiException(statusCode, err.message)
            if (err && err.statusCode === HttpStatus.BAD_REQUEST) {
                statusCode = HttpStatus.BAD_REQUEST
                errorMessage.code = statusCode
                errorMessage.message = Strings.ERROR_MESSAGE.REQUEST_BODY_INVALID
                errorMessage.description = Strings.ERROR_MESSAGE.REQUEST_BODY_INVALID_DESC
            }
            res.status(statusCode).send(errorMessage.toJSON())
        })
    }
}
