import HttpStatus from 'http-status-codes'
import { inject } from 'inversify'
import { controller, httpDelete, httpGet, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { Identifier } from '../../di/identifiers'
import { IUserService } from '../../application/port/user.service.interface'
import { ApiExceptionManager } from '../exception/api.exception.manager'
import { ILogger } from '../../utils/custom.logger'
import { IQuery } from '../../application/port/query.interface'
import { Query } from '../../infrastructure/repository/query/query'
import { User } from '../../application/domain/model/user'


@controller('/v1/users')
export class UsersController {
    constructor(
        @inject(Identifier.USER_SERVICE) private readonly _userService: IUserService,
        @inject(Identifier.LOGGER) readonly _logger: ILogger
    ) {
    }

    @httpGet('/')
    public async getAllUsers(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const query: IQuery = new Query().fromJSON(req.query)
            const result: Array<User> = await this._userService.getAll(query)
            const count: number = await this._userService.count(query)
            res.setHeader('X-Total-Count', count)
            return res.status(HttpStatus.OK).send(this.toJSONView(result))
        } catch (err: any) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJSON())
        }
    }

    @httpDelete('/:user_id')
    public async removeUser(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            await this._userService.remove(req.params.user_id)
            return res.status(HttpStatus.NO_CONTENT).send()
        } catch (err: any) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJSON())
        }
    }

    private toJSONView(user: User | Array<User>): object {
        if (user instanceof Array) return user.map(item => this.toJSONView(item))
        return user.toJSON()
    }
}
