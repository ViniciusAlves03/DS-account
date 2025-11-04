export abstract class Identifier {
    public static readonly APP: any = Symbol.for('App')

    // Controllers
    public static readonly HOME_CONTROLLER: any = Symbol.for('HomeController')
    public static readonly USERS_CONTROLLER: any = Symbol.for('UsersController')
    public static readonly USERS_AVATAR_CONTROLLER: any = Symbol.for('UsersAvatarController')
    public static readonly HOLDERS_CONTROLLER: any = Symbol.for('HoldersController')
    public static readonly HOLDERS_DEPENDENTS_CONTROLLER: any = Symbol.for('HoldersDependentsController')
    public static readonly DEPENDENTS_CONTROLLER: any = Symbol.for('DependentsController')
    public static readonly ADMINS_CONTROLLER: any = Symbol.for('AdminsController')
    public static readonly AUTH_CONTROLLER: any = Symbol.for('AuthController')

    // Services
    public static readonly USER_SERVICE: any = Symbol.for('UserService')
    public static readonly HOLDER_SERVICE: any = Symbol.for('HolderService')
    public static readonly DEPENDENT_SERVICE: any = Symbol.for('DependentService')
    public static readonly ADMIN_SERVICE: any = Symbol.for('AdminService')
    public static readonly AUTH_SERVICE: any = Symbol.for('AuthService')

    // Repositories
    public static readonly USER_REPOSITORY: any = Symbol.for('UserRepository')
    public static readonly HOLDER_REPOSITORY: any = Symbol.for('HolderRepository')
    public static readonly DEPENDENT_REPOSITORY: any = Symbol.for('DependentRepository')
    public static readonly ADMIN_REPOSITORY: any = Symbol.for('AdminRepository')
    public static readonly AUTH_REPOSITORY: any = Symbol.for('AuthRepository')
    public static readonly IMAGE_REPOSITORY: any = Symbol.for('ImageRepository')
    public static readonly FILE_REPOSITORY: any = Symbol.for('FileRepository')
    public static readonly INTEGRATION_EVENT_REPOSITORY: any = Symbol.for('IntegrationEventRepository')
    public static readonly GATEWAY_REPOSITORY: any = Symbol.for('GatewayRepository')

    // Models
    public static readonly USER_REPO_MODEL: any = Symbol.for('UserRepoModel')
    public static readonly AUTH_REPO_MODEL: any = Symbol.for('AuthRepoModel')
    public static readonly IMAGE_REPO_MODEL: any = Symbol.for('ImageRepoModel')
    public static readonly INTEGRATION_EVENT_REPO_MODEL: any = Symbol.for('IntegrationEventRepoModel')

    // Mappers
    public static readonly USER_ENTITY_MAPPER: any = Symbol.for('UserEntityMapper')
    public static readonly HOLDER_ENTITY_MAPPER: any = Symbol.for('HolderEntityMapper')
    public static readonly DEPENDENT_ENTITY_MAPPER: any = Symbol.for('DependentEntityMapper')
    public static readonly ADMIN_ENTITY_MAPPER: any = Symbol.for('AdminEntityMapper')
    public static readonly AUTH_ENTITY_MAPPER: any = Symbol.for('AuthEntityMapper')
    public static readonly IMAGE_ENTITY_MAPPER: any = Symbol.for('ImageEntityMapper')

    // Background Services
    public static readonly MONGODB_CONNECTION_FACTORY: any = Symbol.for('ConnectionFactoryMongodb')
    public static readonly MONGODB_CONNECTION: any = Symbol.for('ConnectionMongodb')
    public static readonly RABBITMQ_CONNECTION_FACTORY: any = Symbol.for('ConnectionFactoryRabbitMQ')
    public static readonly RABBITMQ_CONNECTION: any = Symbol.for('ConnectionRabbitMQ')
    public static readonly RABBITMQ_EVENT_BUS: any = Symbol.for('EventBusRabbitMQ')
    public static readonly BACKGROUND_SERVICE: any = Symbol.for('BackgroundService')

    // Tasks
    public static readonly REGISTER_DEFAULT_ADMIN_TASK: any = Symbol.for('RegisterDefaultAdminTask')
    public static readonly PUBLISH_EVENT_BUS_TASK: any = Symbol.for('PublishEventBusTask')
    public static readonly SUBSCRIBE_EVENT_BUS_TASK: any = Symbol.for('SubscribeEventBusTask')
    public static readonly RPC_SERVER_EVENT_BUS_TASK: any = Symbol.for('RpcServerEventBusTask')

    // Log
    public static readonly LOGGER: any = Symbol.for('CustomLogger')

    // Utils
    public static readonly READ_FILE_UTILS: any = Symbol.for('ReadFileUtils')
}
