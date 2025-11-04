export abstract class Default {
    public static readonly APP_ID: string = 'expenses.app'
    public static readonly NODE_ENV: string = 'development'
    public static readonly PORT_HTTP: number = 11000
    public static readonly PORT_HTTPS: number = 11001
    public static readonly SWAGGER_VERSION: string = '1.0.0'
    public static readonly SWAGGER_PATH: string = `./src/ui/swagger/api_${Default.SWAGGER_VERSION}.yaml`
    public static readonly LOGO_URI: string = ''

    // MongoDB
    public static readonly MONGODB_URI: string = 'mongodb://localhost:27017/expensesDB'
    public static readonly MONGODB_URI_TEST: string = 'mongodb://localhost:27017/expensesDB'

    // RabbitMQ
    public static readonly RABBITMQ_RPC_TIMEOUT: number = 15000
    public static readonly RABBITMQ_URI: string = 'amqp://guest:guest@127.0.0.1:5672'

    // Log
    public static readonly LOG_DIR: string = 'logs'

    // JWT
    public static readonly JWT_SECRET: string = 's3cr3tk3y'
    public static readonly ISSUER: string = 'exps'

    // Dashboard Host
    public static readonly DASHBOARD_HOST: string = 'https://localhost:443'
}
