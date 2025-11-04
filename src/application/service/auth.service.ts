import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IAuthService } from '../port/auth.service.interface'
import { IAuthRepository } from '../port/auth.repository.interface'
import { IIntegrationEventRepository } from '../port/integration.event.repository.interface'
import { CredentialsValidator } from '../domain/validator/credentials.validator'
import { IUserRepository } from '../port/user.repository.interface'
import { Credentials } from '../domain/model/credentials'
import { Auth } from '../domain/model/auth'
import { User } from '../domain/model/user'
import { Email } from '../domain/model/email'
import { RefreshTokenValidator } from '../domain/validator/refresh.token.validator'
import { EmailResetPasswordEvent } from '../integration-event/event/email.reset.password.event'
import { ChangePasswordValidator } from '../domain/validator/change.password.validator'
import { ResetPasswordValidator } from '../domain/validator/reset.password.validator'
import { EmailUpdatePasswordEvent } from '../integration-event/event/email.update.password.event'
import { Default } from '../../utils/default'
import { EmailValidator } from '../domain/validator/email.validator'


@injectable()
export class AuthService implements IAuthService {
    constructor(
        @inject(Identifier.AUTH_REPOSITORY) private readonly _authRepository: IAuthRepository,
        @inject(Identifier.USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @inject(Identifier.INTEGRATION_EVENT_REPOSITORY) private readonly _integrationEventRepo: IIntegrationEventRepository
    ) {
    }

    public async authenticate(credentials: Credentials): Promise<Auth | undefined> {
        try {
            CredentialsValidator.validate(credentials)
            const result: Auth | undefined = await this._authRepository.authenticate(credentials)
            if (result) await this._userRepository.updateLastLogin(credentials.login!!)
            return Promise.resolve(result)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async refreshToken(auth: Auth): Promise<Auth | undefined> {
        try {
            RefreshTokenValidator.validate(auth)
            const payload: any = await this._authRepository.getTokenPayload(auth.access_token!)
            auth.user_id = payload.sub
            const result: Auth | undefined = await this._authRepository.refreshToken(auth)
            if (result) await this._userRepository.updateLastLoginById(payload.sub)
            return Promise.resolve(result)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async forgotPassword(email: string): Promise<object> {
        try {
            const host: string = process.env.DASHBOARD_HOST || Default.DASHBOARD_HOST
            EmailValidator.validate(email)
            const result: User = await this._authRepository.resetPassword(email)
            if (result) {
                const mail: Email = new Email().fromJSON({
                    to: {
                        name: result.name,
                        email: result.email
                    },
                    action_url: `${host}/${result.language}/password-reset?token=${result.reset_password_token}`,
                    lang: result.language
                })
                await this._integrationEventRepo.publishEvent(
                    new EmailResetPasswordEvent(new Date(), mail), EmailResetPasswordEvent.ROUTING_KEY
                )
            }
            return Promise.resolve({
                message: `If a matching account is found, an email has been sent to ${email} to allow you to reset your password.`
            })
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async changePassword(email: string, old_password: string, new_password: string, token: string): Promise<boolean> {
        try {
            EmailValidator.validate(email)
            const isValid: boolean = await this._authRepository.validateToken(token)
            if (!isValid) return Promise.resolve(false)
            const payload = await this._authRepository.getTokenPayload(token)
            if (!payload.reset_password) {
                ChangePasswordValidator.validate(email, old_password, new_password)
                const resultChange = await this._userRepository.changePassword(email, old_password, new_password)
                if (resultChange) await this._publishEmailUpdatePasswordEvent(resultChange)
                return Promise.resolve(!!resultChange)
            }
            ResetPasswordValidator.validate(email, new_password)
            const encryptPassword: string = await this._userRepository.encryptPassword(new_password)
            const resultReset = await this._authRepository.updatePassword(payload.sub, email, encryptPassword, token)
            if (resultReset) await this._publishEmailUpdatePasswordEvent(resultReset)
            return Promise.resolve(!!resultReset)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    private async _publishEmailUpdatePasswordEvent(user: User): Promise<void> {
        try {
            const mail: Email = new Email().fromJSON({
                to: {
                    name: user.name,
                    email: user.email
                },
                action_url: process.env.DASHBOARD_HOST || Default.DASHBOARD_HOST,
                lang: user.language
            })
            await this._integrationEventRepo.publishEvent(
                new EmailUpdatePasswordEvent(new Date(), mail), EmailUpdatePasswordEvent.ROUTING_KEY
            )
            return Promise.resolve()
        } catch (err) {
            return Promise.reject(err)
        }
    }
}
