import HttpStatus from 'http-status-codes'
import { inject } from 'inversify'
import { controller, httpDelete, httpPatch, httpPost, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { Identifier } from '../../di/identifiers'
import { IHolderService } from '../../application/port/holder.service.interface'
import { Dependent } from '../../application/domain/model/dependent'
import { IDependentService } from '../../application/port/dependent.service.interface'
import { ApiException } from '../../ui/exception/api.exception'
import { ILogger } from '../../utils/custom.logger'
import { Strings } from '../../utils/strings'
import { ObjectIdValidator } from '../../application/domain/validator/object.id.validator'



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
        ObjectIdValidator.validate(req.params.holder_id, Strings.HOLDER.PARAM_ID_NOT_VALID_FORMAT)

        const dependent: Dependent = new Dependent().fromJSON({
            ...req.body,
            change_password: false,
            email_verified: false
        })
        const result: Dependent | undefined =
            await this._dependentService.addDependent(dependent, req.params.holder_id)

        if (!result || !result.id) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, 'Dependent creation failed or did not return an ID.');
        }

        await this._holderService.associateDependent(req.params.holder_id, result.id)
        return res.status(HttpStatus.CREATED).send(this.toJSONView(result))
    }

    @httpPatch('/:dependent_id')
    public async updateAuthorizationDependent(@request() req: Request, @response() res: Response): Promise<Response> {
        ObjectIdValidator.validate(req.params.holder_id, Strings.HOLDER.PARAM_ID_NOT_VALID_FORMAT)
        ObjectIdValidator.validate(req.params.dependent_id, Strings.DEPENDENT.PARAM_ID_NOT_VALID_FORMAT)

        const { isAuthorized } = req.body;
        await this._holderService.checkAssociation(req.params.holder_id, req.params.dependent_id)

        const result: Dependent | undefined = await this._dependentService.updateAuthorization(req.params.dependent_id, isAuthorized)

        if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageDependentNotFound())
        return res.status(HttpStatus.OK).send(this.toJSONView(result))
    }

    @httpDelete('/:dependent_id')
    public async disassociatesDependentFromHolder(@request() req: Request, @response() res: Response): Promise<Response> {
        ObjectIdValidator.validate(req.params.holder_id, Strings.HOLDER.PARAM_ID_NOT_VALID_FORMAT)
        ObjectIdValidator.validate(req.params.dependent_id, Strings.DEPENDENT.PARAM_ID_NOT_VALID_FORMAT)

        await this._holderService.removeAssociationWithDependent(req.params.holder_id, req.params.dependent_id)
        return res.status(HttpStatus.NO_CONTENT).send()
    }

    private toJSONView(dependent: Dependent | Array<Dependent> | undefined): object {
        if (dependent instanceof Array) return dependent.map(item => this.toJSONView(item))
        if (dependent) dependent.type = undefined
        return dependent?.toJSON()
    }

    private getMessageDependentNotFound(): object {
        return new ApiException(
            HttpStatus.NOT_FOUND,
            Strings.DEPENDENT.NOT_FOUND,
            Strings.DEPENDENT.NOT_FOUND_DESCRIPTION
        ).toJSON()
    }
}
