import HttpStatus from 'http-status-codes'
import { inject } from 'inversify'
import { controller, httpDelete, httpGet, httpPatch, httpPost, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { Identifier } from '../../di/identifiers'
import { Holder } from '../../application/domain/model/holder'
import { IHolderService } from '../../application/port/holder.service.interface'
import { ILogger } from '../../utils/custom.logger'
import { Query } from '../../infrastructure/repository/query/query'
import { IQuery } from '../../application/port/query.interface'
import { ApiException } from '../../ui/exception/api.exception'
import { Strings } from '../../utils/strings'
import { UserType } from '../../application/domain/utils/user.type'
import { ObjectIdValidator } from '../../application/domain/validator/object.id.validator'


@controller('/v1/holders')
export class HoldersController {
    constructor(
        @inject(Identifier.HOLDER_SERVICE) private readonly _holderService: IHolderService,
        @inject(Identifier.LOGGER) readonly _logger: ILogger
    ) {
    }

    @httpGet('/')
    public async getAllHolders(@request() req: Request, @response() res: Response): Promise<Response> {
        const query: IQuery = new Query().fromJSON(req.query)
        query.addFilter({ type: UserType.HOLDER })
        const result: Array<Holder> = await this._holderService.getAll(query)
        const count: number = await this._holderService.count(query)

        res.setHeader('X-Total-Count', count)
        return res.status(HttpStatus.OK).send(this.toJSONView(result))
    }

    @httpPost('/')
    public async addHolder(@request() req: Request, @response() res: Response): Promise<Response> {
        const holder: Holder = new Holder().fromJSON({
            ...req.body,
            change_password: false,
            email_verified: false
        })
        const result: Holder | undefined = await this._holderService.add(holder)

        return res.status(HttpStatus.CREATED).send(this.toJSONView(result))
    }

    @httpGet('/:holder_id')
    public async getHolderById(@request() req: Request, @response() res: Response): Promise<Response> {
        ObjectIdValidator.validate(req.params.holder_id, Strings.HOLDER.PARAM_ID_NOT_VALID_FORMAT)

        const query: IQuery = new Query().fromJSON(req.query)
        const result: Holder | undefined = await this._holderService.getById(req.params.holder_id, query)

        if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageHolderNotFound())
        return res.status(HttpStatus.OK).send(this.toJSONView(result))
    }

    @httpPatch('/:holder_id')
    public async updateHolder(@request() req: Request, @response() res: Response): Promise<Response> {
        ObjectIdValidator.validate(req.params.holder_id, Strings.HOLDER.PARAM_ID_NOT_VALID_FORMAT)

        const holder: Holder = new Holder().fromJSON(req.body)
        holder.id = req.params.holder_id
        const result: Holder | undefined = await this._holderService.update(holder)

        if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageHolderNotFound())
        return res.status(HttpStatus.OK).send(this.toJSONView(result))
    }

    @httpDelete('/:holder_id')
    public async removeHolder(@request() req: Request, @response() res: Response): Promise<Response> {
        ObjectIdValidator.validate(req.params.holder_id, Strings.HOLDER.PARAM_ID_NOT_VALID_FORMAT)

        await this._holderService.remove(req.params.holder_id)
        return res.status(HttpStatus.NO_CONTENT).send()
    }

    private toJSONView(holder: Holder | Array<Holder> | undefined): object {
        if (holder instanceof Array) return holder.map(item => this.toJSONView(item))
        if (holder) holder.type = undefined
        return holder?.toJSON()
    }

    private getMessageHolderNotFound(): object {
        return new ApiException(
            HttpStatus.NOT_FOUND,
            Strings.HOLDER.NOT_FOUND,
            Strings.HOLDER.NOT_FOUND_DESCRIPTION
        ).toJSON()
    }
}
