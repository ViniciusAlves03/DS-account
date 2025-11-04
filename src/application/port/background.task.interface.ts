export interface IBackgroundTask {
    run(): void

    stop(): Promise<void>
}
