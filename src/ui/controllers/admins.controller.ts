import HttpStatus from 'http-status-codes'
import { controller, httpGet, httpPatch, httpPost, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { inject } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IAdminService } from '../../application/port/admin.service.interface'
import { Admin } from '../../application/domain/model/admin'
import { ApiException } from '../../ui/exception/api.exception'
import { Strings } from '../../utils/strings'
import { Query } from '../../infrastructure/repository/query/query'
import { ILogger } from '../../utils/custom.logger'
import { IQuery } from '../../application/port/query.interface'
import { UserType } from '../../application/domain/utils/user.type'
import { ObjectIdValidator } from '../../application/domain/validator/object.id.validator'


@controller('/v1/admins')
export class AdminsController {
    constructor(
        @inject(Identifier.ADMIN_SERVICE) private readonly _adminService: IAdminService,
        @inject(Identifier.LOGGER) readonly _logger: ILogger
    ) {
    }

    @httpPost('/')
    public async addAdminUser(@request() req: Request, @response() res: Response): Promise<Response> {
        const admin: Admin = new Admin().fromJSON({ ...req.body, change_password: false, email_verified: false })
        const result: Admin | undefined = await this._adminService.add(admin)

        return res.status(HttpStatus.CREATED).send(this.toJSONView(result))
    }

    @httpGet('/')
    public async getAllAdmins(@request() req: Request, @response() res: Response): Promise<Response> {
        const query: IQuery = new Query().fromJSON(req.query)
        query.addFilter({ type: UserType.ADMIN })
        const result: Array<Admin> = await this._adminService.getAll(query)
        const count: number = await this._adminService.count(query)

        res.setHeader('X-Total-Count', count)
        return res.status(HttpStatus.OK).send(this.toJSONView(result))
    }

    @httpGet('/:admin_id')
    public async getAdminById(@request() req: Request, @response() res: Response): Promise<Response> {
        ObjectIdValidator.validate(req.params.admin_id)

        const result: Admin | undefined =
            await this._adminService.getById(req.params.admin_id, new Query().fromJSON(req.query))

        if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageAdminNotFound())
        return res.status(HttpStatus.OK).send(this.toJSONView(result))
    }

    @httpPatch('/:admin_id')
    public async updateAdminById(@request() req: Request, @response() res: Response): Promise<Response> {
        ObjectIdValidator.validate(req.params.admin_id)

        const admin: Admin = new Admin().fromJSON(req.body)
        admin.id = req.params.admin_id
        const result: Admin | undefined = await this._adminService.update(admin)

        if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageAdminNotFound())
        return res.status(HttpStatus.OK).send(this.toJSONView(result))
    }

    private toJSONView(admin: Admin | Array<Admin> | undefined): object {
        if (admin instanceof Array) return admin.map(item => this.toJSONView(item))
        if (admin) admin.type = undefined
        return admin?.toJSON()
    }

    private getMessageAdminNotFound(): object {
        return new ApiException(
            HttpStatus.NOT_FOUND,
            Strings.ADMIN.NOT_FOUND,
            Strings.ADMIN.NOT_FOUND_DESCRIPTION
        ).toJSON()
    }
}
