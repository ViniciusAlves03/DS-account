import HttpStatus from 'http-status-codes'
import { inject } from 'inversify'
import { controller, httpDelete, httpGet, httpPatch, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { Identifier } from '../../di/identifiers'
import { Dependent } from '../../application/domain/model/dependent'
import { IDependentService } from '../../application/port/dependent.service.interface'
import { ILogger } from '../../utils/custom.logger'
import { Query } from '../../infrastructure/repository/query/query'
import { IQuery } from '../../application/port/query.interface'
import { ApiException } from '../../ui/exception/api.exception'
import { Strings } from '../../utils/strings'
import { UserType } from '../../application/domain/utils/user.type'
import { ObjectIdValidator } from '../../application/domain/validator/object.id.validator'


@controller('/v1/dependents')
export class DependentsController {
    constructor(
        @inject(Identifier.DEPENDENT_SERVICE) private readonly _dependentService: IDependentService,
        @inject(Identifier.LOGGER) readonly _logger: ILogger
    ) {
    }

    @httpGet('/')
    public async getAllDependents(@request() req: Request, @response() res: Response): Promise<Response> {
        const query: IQuery = new Query().fromJSON(req.query)
        query.addFilter({ type: UserType.DEPENDENT })
        const result: Array<Dependent> = await this._dependentService.getAll(query)
        const count: number = await this._dependentService.count(query)

        res.setHeader('X-Total-Count', count)
        return res.status(HttpStatus.OK).send(this.toJSONView(result))
    }

    @httpGet('/:dependent_id')
    public async getDependentById(@request() req: Request, @response() res: Response): Promise<Response> {
        ObjectIdValidator.validate(req.params.dependent_id)

        const result: Dependent | undefined =
            await this._dependentService.getById(req.params.dependent_id, new Query().fromJSON(req.query))

        if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageDependentNotFound())
        return res.status(HttpStatus.OK).send(this.toJSONView(result))
    }

    @httpPatch('/:dependent_id')
    public async updateDependent(@request() req: Request, @response() res: Response): Promise<Response> {
        ObjectIdValidator.validate(req.params.dependent_id)

        const dependent: Dependent = new Dependent().fromJSON(req.body)
        dependent.id = req.params.dependent_id
        const result: Dependent | undefined = await this._dependentService.update(dependent)

        if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageDependentNotFound())
        return res.status(HttpStatus.OK).send(this.toJSONView(result))
    }

    @httpDelete('/:dependent_id')
    public async removeDependent(@request() req: Request, @response() res: Response): Promise<Response> {
        ObjectIdValidator.validate(req.params.dependent_id)

        await this._dependentService.remove(req.params.dependent_id)
        return res.status(HttpStatus.NO_CONTENT).send()
    }

    private toJSONView(dependent: Dependent | Array<Dependent>): object {
        if (dependent instanceof Array) return dependent.map(item => this.toJSONView(item))
        dependent.type = undefined
        return dependent.toJSON()
    }

    private getMessageDependentNotFound(): object {
        return new ApiException(
            HttpStatus.NOT_FOUND,
            Strings.DEPENDENT.NOT_FOUND,
            Strings.DEPENDENT.NOT_FOUND_DESCRIPTION
        ).toJSON()
    }
}
