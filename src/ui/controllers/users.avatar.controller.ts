import HttpStatus from 'http-status-codes'
import { controller, httpDelete, httpGet, httpPut, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { inject } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { ApiExceptionManager } from '../exception/api.exception.manager'
import multer from 'multer'
import { IQuery } from '../../application/port/query.interface'
import { Query } from '../../infrastructure/repository/query/query'
import { ApiException } from '../exception/api.exception'
import stream from 'stream'
import { IUserService } from '../../application/port/user.service.interface'
import { Image } from '../../application/domain/model/image'
import { ValidationException } from '../../application/domain/exception/validation.exception'
import { Strings } from '../../utils/strings'


@controller('/v1/users/:user_id/avatar')
export class UsersAvatarController {
    constructor(
        @inject(Identifier.USER_SERVICE) readonly _userService: IUserService
    ) {
    }

    @httpPut('/', multer().single('avatar'))
    public async saveOrUpdateAvatar(@request() req: any, @response() res: Response): Promise<Response> {
        try {
            if (!req.file) throw new ValidationException('Please submit a image with refer key named "avatar".')
            const image: Image = new Image().fromJSON({
                content_type: req.file.mimetype,
                filename: req.file.originalname,
                size: req.file.size,
                data: Buffer.from(req.file.buffer),
                user_id: req.params.user_id
            })
            const result: Image = await this._userService.addOrUpdateAvatar(image)
            return res.status(HttpStatus.CREATED).send(this.toJSONView(result))
        } catch (err: any) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code).send(handlerError.toJSON())
        }
    }

    @httpGet('/')
    public async getAvatar(@request() req: Request, @response() res: Response): Promise<void | Response> {
        try {
            const query: IQuery = new Query().fromJSON(req.query)
            query.addFilter({ 'file.filename': req.params.filename })
            const result: Image | undefined = await this._userService.getAvatar(req.params.user_id)
            if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageNotFound())

            const read_stream = new stream.PassThrough()
            res.set('Content-Disposition', 'inline')
            res.set('Content-Type', result.content_type)
            read_stream.pipe(res)
            read_stream.end(result.data)
        } catch (err: any) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code).send(handlerError.toJSON())
        }
    }

    @httpDelete('/')
    public async deleteImage(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            await this._userService.deleteAvatar(req.params.user_id)
            return res.status(HttpStatus.NO_CONTENT).send()
        } catch (err: any) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code).send(handlerError.toJSON())
        }
    }

    private toJSONView(item: Image | Array<Image>): any | Array<any> {
        if (item instanceof Array) return item.map(value => this.toJSONView(value))
        const result = item.toJSON()
        delete result.data
        delete result.user_id
        delete result.file_id
        return result
    }

    private getMessageNotFound(): object {
        return new ApiException(
            HttpStatus.NOT_FOUND,
            Strings.IMAGE.NOT_FOUND,
            Strings.IMAGE.NOT_FOUND_DESCRIPTION
        ).toJSON()
    }
}
