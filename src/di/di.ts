import { Container } from 'inversify'
import 'reflect-metadata'
import { App } from '../app'
import { User } from '../application/domain/model/user'
import { Auth } from '../application/domain/model/auth'
import { Holder } from '../application/domain/model/holder'
import { Dependent } from '../application/domain/model/dependent'
import { Image } from '../application/domain/model/image'
import { IUserRepository } from '../application/port/user.repository.interface'
import { IUserService } from '../application/port/user.service.interface'
import { IAuthRepository } from '../application/port/auth.repository.interface'
import { IAuthService } from '../application/port/auth.service.interface'
import { IHolderRepository } from '../application/port/holder.repository.interface'
import { IHolderService } from '../application/port/holder.service.interface'
import { IDependentRepository } from '../application/port/dependent.repository.interface'
import { IDependentService } from '../application/port/dependent.service.interface'
import { IGatewayRepository } from '../application/port/gateway.repository.interface'
import { IImageRepository } from '../application/port/image.repository.interface'
import { IFileRepository } from '../application/port/file.repository.interface'
import { IIntegrationEventRepository } from '../application/port/integration.event.repository.interface'
import { UserRepository } from '../infrastructure/repository/user.repository'
import { AuthRepository } from '../infrastructure/repository/auth.repository'
import { HolderRepository } from '../infrastructure/repository/holder.repository'
import { DependentRepository } from '../infrastructure/repository/dependent.repository'
import { GatewayRepository } from '../infrastructure/repository/gateway.repository'
import { ImageRepository } from '../infrastructure/repository/image.repository'
import { FileRepository } from '../infrastructure/repository/file.repository'
import { IntegrationEventRepository } from '../infrastructure/repository/integration.event.repository'
import { UserService } from '../application/service/user.service'
import { AuthService } from '../application/service/auth.service'
import { HolderService } from '../application/service/holder.service'
import { DependentService } from '../application/service/dependent.service'
import { UserRepoModel } from '../infrastructure/database/schema/user.schema'
import { AuthRepoModel } from '../infrastructure/database/schema/auth.schema'
import { ImageRepoModel } from '../infrastructure/database/schema/image.schema'
import { IntegrationEventRepoModel } from '../infrastructure/database/schema/integration.event.schema'
import { UserEntity } from '../infrastructure/entity/user.entity'
import { AuthEntity } from '../infrastructure/entity/auth.entity'
import { HolderEntity } from '../infrastructure/entity/holder.entity'
import { DependentEntity } from '../infrastructure/entity/dependent.entity'
import { ImageEntity } from '../infrastructure/entity/image.entity'
import { IEntityMapper } from '../infrastructure/port/entity.mapper.interface'
import { UserEntityMapper } from '../infrastructure/entity/mapper/user.entity.mapper'
import { AuthEntityMapper } from '../infrastructure/entity/mapper/auth.entity.mapper'
import { HolderEntityMapper } from '../infrastructure/entity/mapper/holder.entity.mapper'
import { DependentEntityMapper } from '../infrastructure/entity/mapper/dependent.entity.mapper'
import { ImageEntityMapper } from '../infrastructure/entity/mapper/image.entity.mapper'
import { UsersController } from '../ui/controllers/users.controller'
import { UsersAvatarController } from '../ui/controllers/users.avatar.controller'
import { AuthController } from '../ui/controllers/auth.controller'
import { HoldersController } from '../ui/controllers/holders.controller'
import { DependentsController } from '../ui/controllers/dependents.controller'
import { HoldersDependentsController } from '../ui/controllers/holders.dependents.controller'
import { IEventBus } from '../infrastructure/port/event.bus.interface'
import { IBackgroundTask } from '../application/port/background.task.interface'
import { IConnectionEventBus } from '../infrastructure/port/connection.event.bus.interface'
import { IConnectionDB } from '../infrastructure/port/connection.db.interface'
import { IConnectionFactory } from '../infrastructure/port/connection.factory.interface'
import { ConnectionFactoryMongodb } from '../infrastructure/database/connection.factory.mongodb'
import { ConnectionFactoryRabbitMQ } from '../infrastructure/eventbus/rabbitmq/connection.factory.rabbitmq'
import { ConnectionMongodb } from '../infrastructure/database/connection.mongodb'
import { ConnectionRabbitMQ } from '../infrastructure/eventbus/rabbitmq/connection.rabbitmq'
import { EventBusRabbitMQ } from '../infrastructure/eventbus/rabbitmq/eventbus.rabbitmq'
import { PublishEventBusTask } from '../background/task/publish.event.bus.task'
import { BackgroundService } from '../background/background.service'
import { Identifier } from './identifiers'
import { CustomLogger, ILogger } from '../utils/custom.logger'


class IoC {
    private readonly _container: Container

    constructor() {
        this._container = new Container()
        this.initDependencies()
    }

    get container(): Container {
        return this._container
    }

    private initDependencies(): void {
        this._container.bind(Identifier.APP).to(App).inSingletonScope()

        // Controllers
        this._container.bind<UsersController>(Identifier.USERS_CONTROLLER)
            .to(UsersController).inSingletonScope()
        this._container.bind<UsersAvatarController>(Identifier.USERS_AVATAR_CONTROLLER)
            .to(UsersAvatarController).inSingletonScope()
        this._container.bind<AuthController>(Identifier.AUTH_CONTROLLER)
            .to(AuthController).inSingletonScope()
        this._container.bind<HoldersController>(Identifier.HOLDERS_CONTROLLER)
            .to(HoldersController).inSingletonScope()
        this._container.bind<HoldersDependentsController>(Identifier.HOLDERS_DEPENDENTS_CONTROLLER)
            .to(HoldersDependentsController).inSingletonScope()
        this._container.bind<DependentsController>(Identifier.DEPENDENTS_CONTROLLER)
            .to(DependentsController).inSingletonScope()

        // Services
        this._container.bind<IUserService>(Identifier.USER_SERVICE).to(UserService).inSingletonScope()
        this._container.bind<IAuthService>(Identifier.AUTH_SERVICE)
            .to(AuthService).inSingletonScope()
        this._container.bind<IHolderService>(Identifier.HOLDER_SERVICE).to(HolderService).inSingletonScope()
        this._container.bind<IDependentService>(Identifier.DEPENDENT_SERVICE).to(DependentService).inSingletonScope()

        // Repositories
        this._container
            .bind<IUserRepository>(Identifier.USER_REPOSITORY)
            .to(UserRepository).inSingletonScope()
        this._container.bind<IAuthRepository>(Identifier.AUTH_REPOSITORY)
            .to(AuthRepository).inSingletonScope()
        this._container.bind<IHolderRepository>(Identifier.HOLDER_REPOSITORY)
            .to(HolderRepository).inSingletonScope()
        this._container.bind<IDependentRepository>(Identifier.DEPENDENT_REPOSITORY)
            .to(DependentRepository).inSingletonScope()
        this._container.bind<IImageRepository>(Identifier.IMAGE_REPOSITORY)
            .to(ImageRepository).inSingletonScope()
        this._container.bind<IFileRepository>(Identifier.FILE_REPOSITORY)
            .to(FileRepository).inSingletonScope()
        this._container.bind<IGatewayRepository>(Identifier.GATEWAY_REPOSITORY)
            .to(GatewayRepository).inSingletonScope()
        this._container
            .bind<IIntegrationEventRepository>(Identifier.INTEGRATION_EVENT_REPOSITORY)
            .to(IntegrationEventRepository).inSingletonScope()

        // Models
        this._container.bind(Identifier.USER_REPO_MODEL).toConstantValue(UserRepoModel)
        this._container.bind(Identifier.AUTH_REPO_MODEL).toConstantValue(AuthRepoModel)
        this._container.bind(Identifier.IMAGE_REPO_MODEL).toConstantValue(ImageRepoModel)
        this._container.bind(Identifier.INTEGRATION_EVENT_REPO_MODEL).toConstantValue(IntegrationEventRepoModel)

        // Mappers
        this._container
            .bind<IEntityMapper<User, UserEntity>>(Identifier.USER_ENTITY_MAPPER)
            .to(UserEntityMapper).inSingletonScope()
        this._container
            .bind<IEntityMapper<Auth, AuthEntity>>(Identifier.AUTH_ENTITY_MAPPER)
            .to(AuthEntityMapper).inSingletonScope()
        this._container
            .bind<IEntityMapper<Holder, HolderEntity>>(Identifier.HOLDER_ENTITY_MAPPER)
            .to(HolderEntityMapper).inSingletonScope()
        this._container
            .bind<IEntityMapper<Dependent, DependentEntity>>(Identifier.DEPENDENT_ENTITY_MAPPER)
            .to(DependentEntityMapper).inSingletonScope()
        this._container
            .bind<IEntityMapper<Image, ImageEntity>>(Identifier.IMAGE_ENTITY_MAPPER)
            .to(ImageEntityMapper).inSingletonScope()

        // Background Services
        this._container
            .bind<IConnectionFactory>(Identifier.MONGODB_CONNECTION_FACTORY)
            .to(ConnectionFactoryMongodb).inSingletonScope()
        this._container
            .bind<IConnectionDB>(Identifier.MONGODB_CONNECTION)
            .to(ConnectionMongodb).inSingletonScope()
        this._container
            .bind<IConnectionFactory>(Identifier.RABBITMQ_CONNECTION_FACTORY)
            .to(ConnectionFactoryRabbitMQ).inSingletonScope()
        this._container
            .bind<IConnectionEventBus>(Identifier.RABBITMQ_CONNECTION)
            .to(ConnectionRabbitMQ)
        this._container
            .bind<IEventBus>(Identifier.RABBITMQ_EVENT_BUS)
            .to(EventBusRabbitMQ).inSingletonScope()
        this._container
            .bind(Identifier.BACKGROUND_SERVICE)
            .to(BackgroundService).inSingletonScope()

        // Tasks
        this._container
            .bind<IBackgroundTask>(Identifier.PUBLISH_EVENT_BUS_TASK)
            .to(PublishEventBusTask).inRequestScope()

        // Log
        this._container.bind<ILogger>(Identifier.LOGGER).to(CustomLogger).inSingletonScope()
    }
}

export const DIContainer = new IoC().container
