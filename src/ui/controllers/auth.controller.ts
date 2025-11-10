import HttpStatus from 'http-status-codes'
import { inject } from 'inversify'
import { controller, httpPost, httpPatch, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { Identifier } from '../../di/identifiers'
import { Strings } from '../../utils/strings'
import { Credentials } from '../../application/domain/model/credentials'
import { Auth } from '../../application/domain/model/auth'
import { IAuthService } from '../../application/port/auth.service.interface'
import { ApiException } from '../../ui/exception/api.exception'


@controller('/v1/auth')
export class AuthController {
    constructor(
        @inject(Identifier.AUTH_SERVICE) private readonly _authService: IAuthService
    ) {
    }

    @httpPost('/')
    public async auth(@request() req: Request, @response() res: Response): Promise<Response> {
        const credentials: Credentials = new Credentials().fromJSON(req.body)
        const result: Auth | undefined = await this._authService.authenticate(credentials)

        if (result) return res.status(HttpStatus.OK).send(this.toJSONView(result))

        return res.status(HttpStatus.UNAUTHORIZED)
            .send(new ApiException(HttpStatus.UNAUTHORIZED, 'Invalid login or password!').toJSON())
    }

    @httpPost('/refresh')
    public async refreshToken(@request() req: Request, @response() res: Response): Promise<Response> {
        const auth: Auth = new Auth().fromJSON({
            access_token: req.body.access_token,
            refresh_token: { hash: req.body.refresh_token }
        })
        const result: Auth | undefined = await this._authService.refreshToken(auth)

        if (result) return res.status(HttpStatus.OK).send(this.toJSONView(result))

        return res.status(HttpStatus.UNAUTHORIZED)
            .send(new ApiException(HttpStatus.UNAUTHORIZED, 'Invalid access ou refresh token!').toJSON())
    }

    @httpPost('/forgot')
    public async resetPassword(@request() req: Request, @response() res: Response): Promise<Response> {
        const result: object = await this._authService.forgotPassword(req.body.email)
        return res.status(HttpStatus.ACCEPTED).send(result)
    }

    @httpPatch('/password')
    public async changePassword(@request() req: Request, @response() res: Response): Promise<Response> {
        const result: boolean =
            await this._authService
                .changePassword(
                    req.body.email,
                    req.body.old_password,
                    req.body.new_password,
                    req.headers.authorization ? req.headers.authorization.split(' ')[1] : '')

        if (!result) return res.status(HttpStatus.BAD_REQUEST).send(this.getMessageInvalidOperation())
        return res.status(HttpStatus.NO_CONTENT).send()
    }

    private toJSONView(auth: Auth): object {
        const result: any = auth.toJSON()
        delete result.id
        delete result.created_at
        delete result.user_id
        result.refresh_token = result.refresh_token.hash
        return result
    }

    private getMessageInvalidOperation(): object {
        return new ApiException(
            HttpStatus.BAD_REQUEST,
            Strings.ERROR_MESSAGE.OPERATION_CANT_BE_COMPLETED,
            Strings.ERROR_MESSAGE.OPERATION_CANT_BE_COMPLETED_DESC
        ).toJSON()
    }
}
