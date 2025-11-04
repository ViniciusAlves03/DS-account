import jwt from 'jsonwebtoken'
import moment from 'moment'
import crypto from 'crypto'
import { readFileSync } from 'fs'
import { inject, injectable } from 'inversify'
import { IAuthRepository } from '../../application/port/auth.repository.interface'
import { Identifier } from '../../di/identifiers'
import { User } from '../../application/domain/model/user'
import { UserEntity } from '../entity/user.entity'
import { Default } from '../../utils/default'
import { RepositoryException } from '../../application/domain/exception/repository.exception'
import { Strings } from '../../utils/strings'
import { AuthenticationException } from '../../application/domain/exception/authentication.exception'
import { IEntityMapper } from '../port/entity.mapper.interface'
import { BaseRepository } from './base/base.repository'
import { ILogger } from '../../utils/custom.logger'
import { IUserRepository } from '../../application/port/user.repository.interface'
import { IGatewayRepository } from '../../application/port/gateway.repository.interface'
import { Query } from './query/query'
import { Credentials } from '../../application/domain/model/credentials'
import { AuthEntity } from '../entity/auth.entity'
import { Auth } from '../../application/domain/model/auth'
import { UsersScopes } from '../../application/domain/utils/users.scopes'
import { RefreshToken } from '../../application/domain/model/refresh.token'


@injectable()
export class AuthRepository extends BaseRepository<Auth, AuthEntity> implements IAuthRepository {
    constructor(
        @inject(Identifier.AUTH_REPO_MODEL) readonly _authModel: any,
        @inject(Identifier.USER_REPO_MODEL) readonly _userModel: any,
        @inject(Identifier.AUTH_ENTITY_MAPPER) readonly _authMapper: IEntityMapper<Auth, AuthEntity>,
        @inject(Identifier.USER_ENTITY_MAPPER) readonly _userMapper: IEntityMapper<User, UserEntity>,
        @inject(Identifier.USER_REPOSITORY) readonly _userRepo: IUserRepository,
        @inject(Identifier.GATEWAY_REPOSITORY) private readonly _gatewayRepo: IGatewayRepository,
        @inject(Identifier.LOGGER) _logger: ILogger,
    ) {
        super(_authModel, _authMapper, _logger)
    }

    public authenticate(credentials: Credentials): Promise<Auth | undefined> {
        return new Promise<Auth | undefined>((resolve, reject) => {
            this._userModel.findOne({ email: credentials.login })
                .then(async user => {
                    if (!user || !user.password ||
                        !this._userRepo.comparePasswords(credentials.password!!, user.password)) {
                        return reject(new AuthenticationException(
                            'Authentication failed due to invalid authentication credentials.'))
                    }
                    const userRef: User = this._userMapper.transform(user)
                    return resolve(await this.generateToken(userRef))
                }).catch(err => reject(new RepositoryException(Strings.ERROR_MESSAGE.UNEXPECTED)))
        })
    }

    public refreshToken(auth: Auth): Promise<Auth | undefined> {
        return new Promise<Auth | undefined>((resolve, reject) => {
            this._authModel.findOne({ user_id: auth.user_id, access_token: auth.access_token })
                .then(async data => {
                    if (!data) {
                        return reject(new AuthenticationException('Access token invalid.',
                            'A new authentication is required.'))
                    }
                    if (data.refresh_token.hash !== auth.refresh_token?.hash) {
                        return reject(new AuthenticationException('Refresh token invalid.',
                            'A new authentication is required.'))
                    }
                    if (await this.isRefreshTokenExpired(data.refresh_token)) {
                        return reject(new AuthenticationException('Refresh token expired.',
                            'A new authentication is required.'))
                    }
                    await this._authModel.findOneAndDelete({ _id: data.id })
                    const user: User | undefined =
                        await this._userRepo.findOne(new Query().fromJSON({ filters: { _id: auth.user_id } }))
                    if (!user) return Promise.resolve(undefined)
                    return resolve(await this.generateToken(user))
                })
        })
    }

    public async generateToken(user: User): Promise<Auth | undefined> {
        try {
            const access_token: string = await this.generateAccessToken(user)
            const refresh_token: string = await this.generateRefreshToken(user)
            const user_id: string = user.id!

            const auth: Auth = new Auth().fromJSON({
                access_token,
                refresh_token,
                user_id
            })
            const result: Auth | undefined = await super.create(auth)
            return Promise.resolve(result)
        } catch (err) {
            return Promise.reject(new RepositoryException(Strings.ERROR_MESSAGE.UNEXPECTED))
        }
    }

    public async resetPassword(_email: string): Promise<User> {
        try {
            const user: User | undefined = await this._userRepo.findOne(new Query().fromJSON({ filters: { email: _email } }))
            if (!user) return Promise.resolve(undefined!)
            const scopeLiterals = {
                'admin': () => 'ad:rp',
                'holder': () => 'ho:rp',
                'dependent': () => 'dp:rp',
            }
            const token: string = await this.generateResetPasswordToken(user, scopeLiterals[user.type!]())
            if (!token) return Promise.resolve(undefined!)
            const result: User =
                await this._userModel.findOneAndUpdate(
                    { _id: user.id },
                    { reset_password_token: token },
                    { new: true })
            return Promise.resolve(this._userMapper.transform(result))
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async updatePassword(userId: string, userEmail: string, new_password: string, token: string): Promise<User> {
        return new Promise<User>((resolve, reject) => {
            this._userModel.findOneAndUpdate(
                { _id: userId, email: userEmail, reset_password_token: token },
                { password: new_password, $unset: { reset_password_token: 1 } })
                .then(result => {
                    if (!result) {
                        return reject(new AuthenticationException('Invalid password reset token!',
                            'Token probably expired or already used. You can only use the reset token once' +
                            ' while it is within its validity period.'))
                    }
                    return resolve(this._userMapper.transform(result))
                })
        })
    }

    public validateToken(token: string): Promise<boolean> {
        try {
            const public_key = readFileSync(`${process.env.JWT_PUBLIC_KEY_PATH}`, 'utf-8')
            const result = jwt.verify(token, public_key, { algorithms: ['RS256'] })
            return Promise.resolve(!!result)
        } catch (err) {
            return Promise.reject(new AuthenticationException('Invalid password reset token!',
                'Token probably expired or already used. You can only use the reset token once while it is within its ' +
                'validity period.'))
        }
    }

    public getTokenPayload(token: string): Promise<any> {
        try {
            return Promise.resolve(jwt.decode(token))
        } catch (err) {
            return Promise.reject(new AuthenticationException('Could not complete change password request. ' +
                'Please try again later.'))
        }
    }

    private async generateAccessToken(user: User): Promise<string> {
        try {
            const headers: { kid?: string } = {};

            if (process.env.INTERNAL_GATEWAY_API_URL) {
                const consumerJwt = await this.generateGatewayConsumerJwt(user);
                if (!consumerJwt || !consumerJwt.key) {
                    throw new AuthenticationException("Failed to register consumer JWT on Gateway!");
                }
                headers.kid = consumerJwt.key;
            }

            const private_key = readFileSync(`${process.env.JWT_PRIVATE_KEY_PATH}`, 'utf-8')

            const payload: object = {
                sub: user.id,
                sub_type: user.type,
                iss: process.env.ISSUER || Default.ISSUER,
                iat: Math.floor(Date.now() / 1000),
                scope: UsersScopes.getUserScopes(user.type!).join(' '),
                check_email: user.check_email,
                change_password: user.change_password
            }

            return Promise.resolve(jwt.sign(payload, private_key, { expiresIn: '8h', algorithm: 'RS256', header: headers }))
        } catch (err) {
            return Promise.reject(
                new AuthenticationException('Authentication failed due to failure at generate the access token.'))
        }
    }

    private generateRefreshToken(user: User): any {
        return {
            hash: crypto.randomBytes(32).toString('hex'),
            issued_at: moment().unix(),
            expiration: moment().add(7, 'd').unix()
        }
    }

    private async generateResetPasswordToken(user: User, userScope: string): Promise<string> {
        try {
            const private_key = readFileSync(`${process.env.JWT_PRIVATE_KEY_PATH}`, 'utf-8')
            const payload: object = {
                sub: user.id,
                sub_type: user.type,
                email: user.email,
                iss: process.env.ISSUER || Default.ISSUER,
                iat: Math.floor(Date.now() / 1000),
                scope: userScope,
                reset_password: true
            }
            return Promise.resolve(jwt.sign(payload, private_key, { expiresIn: '1h', algorithm: 'RS256' }))
        } catch (err) {
            return Promise.reject(err)
        }
    }

    private isRefreshTokenExpired(refreshToken: RefreshToken): boolean {
        return refreshToken.expiration! < moment().unix()
    }

    private async generateGatewayConsumerJwt(user: User): Promise<any> {
        const username = user.email!;
        try {
            const consumer = await this.getGatewayConsumer(user);
            if (!consumer) {
                throw new AuthenticationException("Gateway Consumer not registered!");
            }

            const rsaPublicKey = readFileSync(process.env.JWT_PUBLIC_KEY_PATH!, "utf-8");
            const consumerJwtPayload = {
                consumer,
                algorithm: "RS256",
                rsa_public_key: rsaPublicKey,
                tags: ["consumer-jwt"]
            };

            return await this._gatewayRepo.createJwt(consumerJwtPayload);
        } catch (error) {
            await this._gatewayRepo.deleteConsumerByUsername(username);
            throw error;
        }
    }

    private async getGatewayConsumer(user: User): Promise<any> {
        const username = user.email!;
        const profile = user.type!;

        let consumer = await this._gatewayRepo.findConsumerByUsername(username);

        if (!consumer) {
            const newConsumerPayload = { username, tags: ["consumer"] };
            consumer = await this._gatewayRepo.createConsumer(newConsumerPayload);
        }

        await this.getGatewayConsumerAcl(consumer, profile);
        return consumer;
    }

    private async getGatewayConsumerAcl(consumer: any, profile: string): Promise<any> {
        const aclList = await this._gatewayRepo.findAclsByConsumerAndGroup(consumer, profile);
        if (aclList && aclList.length > 0) {
            return aclList[0];
        }

        const aclPayload = { group: profile, consumer };
        return await this._gatewayRepo.createAcl(aclPayload);
    }
}
