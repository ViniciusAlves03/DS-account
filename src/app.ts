import bodyParser from 'body-parser'
import express, { Application, NextFunction, Request, Response } from 'express'
import helmet from 'helmet'
import HttpStatus from 'http-status-codes'
import { inject, injectable } from 'inversify'
import { InversifyExpressServer } from 'inversify-express-utils'
import morgan from 'morgan'
import 'reflect-metadata'
import swaggerUi from 'swagger-ui-express'
import yaml from 'yamljs'
import { DIContainer } from './di/di'
import { Identifier } from './di/identifiers'
import { ApiException } from './ui/exception/api.exception'
import { ILogger } from './utils/custom.logger'
import { Default } from './utils/default'
import { Strings } from './utils/strings'
import { ApiExceptionManager } from './ui/exception/api.exception.manager'
import { Exception } from './application/domain/exception/exception'


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
            app.set('query parser', (qs: string) => {
                return require('qs').parse(qs, { allowPrototypes: true });
            });
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
        // Handle 404
        this.express.use((req, res) => {
            const errorMessage: ApiException = new ApiException(
                404,
                Strings.ERROR_MESSAGE.ENDPOINT_NOT_FOUND.replace('{0}', req.url)
            )
            res.status(HttpStatus.NOT_FOUND).send(errorMessage.toJSON())
        })

        // Handle 400, 409, 500...
        this.express.use((err: any, req: Request, res: Response, next: NextFunction) => {
            let apiException: ApiException;

            this._logger.error(err.stack || err.message)

            if (err instanceof Exception) {
                apiException = ApiExceptionManager.build(err);
            } else if (err && err.statusCode === HttpStatus.BAD_REQUEST) {
                apiException = new ApiException(
                    HttpStatus.BAD_REQUEST,
                    Strings.ERROR_MESSAGE.REQUEST_BODY_INVALID,
                    Strings.ERROR_MESSAGE.REQUEST_BODY_INVALID_DESC
                );
            } else {
                apiException = new ApiException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    Strings.ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
                    err.message
                );
            }
            res.status(apiException.code).send(apiException.toJSON())
        })
    }
}
