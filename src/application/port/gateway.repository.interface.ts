export interface IGatewayRepository {
    createConsumer(consumer: any): Promise<any>;
    findConsumerByUsername(username: string): Promise<any | null>;
    createJwt(consumerJwt: any): Promise<any>;
    createAcl(acl: any): Promise<any>;
    findAclsByConsumerAndGroup(consumer: { id: string }, group: string): Promise<any[]>;
    deleteConsumerByUsername(username: string): Promise<void>;
}
