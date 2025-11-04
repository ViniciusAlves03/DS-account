import HttpStatus from 'http-status-codes'
import { inject } from 'inversify'
import { controller, httpDelete, httpGet, httpPatch, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { Identifier } from '../../di/identifiers'
import { Dependent } from '../../application/domain/model/dependent'
import { IDependentService } from '../../application/port/dependent.service.interface'
import { ApiExceptionManager } from '../exception/api.exception.manager'
import { ILogger } from '../../utils/custom.logger'
import { Query } from '../../infrastructure/repository/query/query'
import { IQuery } from '../../application/port/query.interface'
import { ApiException } from '../../ui/exception/api.exception'
import { Strings } from '../../utils/strings'
import { UserType } from '../../application/domain/utils/user.type'


@controller('/v1/dependents')
export class DependentsController {
    constructor(
        @inject(Identifier.DEPENDENT_SERVICE) private readonly _dependentService: IDependentService,
        @inject(Identifier.LOGGER) readonly _logger: ILogger
    ) {
    }

    @httpGet('/')
    public async getAllDependents(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const query: IQuery = new Query().fromJSON(req.query)
            query.addFilter({ type: UserType.DEPENDENT })
            const result: Array<Dependent> = await this._dependentService.getAll(query)
            const count: number = await this._dependentService.count(query)
            res.setHeader('X-Total-Count', count)
            return res.status(HttpStatus.OK).send(this.toJSONView(result))
        } catch (err: any) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJSON())
        }
    }

    @httpGet('/:dependent_id')
    public async getDependentById(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result: Dependent | undefined =
                await this._dependentService.getById(req.params.dependent_id, new Query().fromJSON(req.query))
            if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageDependentNotFound())
            return res.status(HttpStatus.OK).send(this.toJSONView(result))
        } catch (err: any) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJSON())
        }
    }

    @httpPatch('/:dependent_id')
    public async updateDependent(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const dependent: Dependent = new Dependent().fromJSON(req.body)
            dependent.id = req.params.dependent_id
            const result: Dependent | undefined = await this._dependentService.update(dependent)
            if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageDependentNotFound())
            return res.status(HttpStatus.OK).send(this.toJSONView(result))
        } catch (err: any) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJSON())
        }
    }

    @httpDelete('/:dependent_id')
    public async removeDependent(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            await this._dependentService.remove(req.params.dependent_id)
            return res.status(HttpStatus.NO_CONTENT).send()
        }
        catch (err: any) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJSON())
        }
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
