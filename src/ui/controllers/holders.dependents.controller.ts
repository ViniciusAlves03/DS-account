import HttpStatus from 'http-status-codes'
import { inject } from 'inversify'
import { controller, httpDelete, httpPatch, httpPost, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { Identifier } from '../../di/identifiers'
import { IHolderService } from '../../application/port/holder.service.interface'
import { Dependent } from '../../application/domain/model/dependent'
import { IDependentService } from '../../application/port/dependent.service.interface'
import { ApiExceptionManager } from '../exception/api.exception.manager'
import { ILogger } from '../../utils/custom.logger'


@controller('/v1/holders/:holder_id/dependents')
export class HoldersDependentsController {
    constructor(
        @inject(Identifier.HOLDER_SERVICE) private readonly _holderService: IHolderService,
        @inject(Identifier.DEPENDENT_SERVICE) private readonly _dependentService: IDependentService,
        @inject(Identifier.LOGGER) readonly _logger: ILogger
    ) {
    }

    @httpPost('/')
    public async addHolderDependent(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const dependent: Dependent = new Dependent().fromJSON({
                ...req.body,
                change_password: false,
                email_verified: false
            })
            const result: Dependent | undefined =
                await this._dependentService.addDependent(dependent, req.params.holder_id)
            await this._holderService.associateDependent(req.params.holder_id, result?.id!)
            return res.status(HttpStatus.CREATED).send(this.toJSONView(result))
        } catch (err: any) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJSON())
        }
    }

    @httpPatch('/:dependent_id')
    public async updateAuthorizationDependent(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const { isAuthorized } = req.body;
            await this._holderService.checkAssociation(req.params.holder_id, req.params.dependent_id)
            const result: Dependent | undefined = await this._dependentService.updateAuthorization(req.params.dependent_id, isAuthorized)
            return res.status(HttpStatus.OK).send(result)
        } catch (err: any) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJSON())
        }
    }

    @httpDelete('/:dependent_id')
    public async disassociatesDependentFromHolder(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            await this._holderService.removeAssociationWithDependent(req.params.holder_id, req.params.dependent_id)
            return res.status(HttpStatus.NO_CONTENT).send()
        } catch (err: any) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJSON())
        }
    }

    private toJSONView(dependent: Dependent | Array<Dependent> | undefined): object {
        if (dependent instanceof Array) return dependent.map(item => this.toJSONView(item))
        if (dependent) dependent.type = undefined
        return dependent?.toJSON()
    }
}
