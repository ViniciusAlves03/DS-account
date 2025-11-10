import HttpStatus from 'http-status-codes'
import { inject } from 'inversify'
import { controller, httpDelete, httpGet, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { Identifier } from '../../di/identifiers'
import { IUserService } from '../../application/port/user.service.interface'
import { ILogger } from '../../utils/custom.logger'
import { IQuery } from '../../application/port/query.interface'
import { Query } from '../../infrastructure/repository/query/query'
import { User } from '../../application/domain/model/user'
import { ObjectIdValidator } from '../../application/domain/validator/object.id.validator'
import { Strings } from '../../utils/strings'


@controller('/v1/users')
export class UsersController {
    constructor(
        @inject(Identifier.USER_SERVICE) private readonly _userService: IUserService,
        @inject(Identifier.LOGGER) readonly _logger: ILogger
    ) {
    }

    @httpGet('/')
    public async getAllUsers(@request() req: Request, @response() res: Response): Promise<Response> {
        const query: IQuery = new Query().fromJSON(req.query)
        const result: Array<User> = await this._userService.getAll(query)
        const count: number = await this._userService.count(query)

        res.setHeader('X-Total-Count', count)
        return res.status(HttpStatus.OK).send(this.toJSONView(result))
    }

    @httpDelete('/:user_id')
    public async removeUser(@request() req: Request, @response() res: Response): Promise<Response> {
        ObjectIdValidator.validate(req.params.user_id, Strings.USER.PARAM_ID_NOT_VALID_FORMAT)

        await this._userService.remove(req.params.user_id)
        return res.status(HttpStatus.NO_CONTENT).send()
    }

    private toJSONView(user: User | Array<User>): object {
        if (user instanceof Array) return user.map(item => this.toJSONView(item))
        return user.toJSON()
    }
}
