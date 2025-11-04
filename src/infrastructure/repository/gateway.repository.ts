import axios, { AxiosInstance, AxiosError } from 'axios';
import https from 'https';
import { injectable } from 'inversify';
import { IGatewayRepository } from '../../application/port/gateway.repository.interface';
import { RepositoryException } from '../../application/domain/exception/repository.exception';

interface Consumer {
    username: string;
    custom_id?: string;
}

interface JwtPayload {
    consumer: {
        id: string;
    };
}

interface AclPayload {
    consumer: {
        id: string;
    };
    group: string;
}


@injectable()
export class GatewayRepository implements IGatewayRepository {
    private readonly axiosInstance: AxiosInstance;

    constructor(
    ) {
        this.axiosInstance = axios.create({
            baseURL: process.env.INTERNAL_GATEWAY_API_URL,
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            })
        });
    }

    public async createConsumer(consumer: Consumer): Promise<any> {
        try {
            const response = await this.axiosInstance.post('/consumers', consumer);
            return response.data;
        } catch (error: any) {
            const message = 'Could not create consumer.';
            if (error instanceof AxiosError && error.response) {
                const { status, data } = error.response;
                const description = JSON.stringify(data) || 'No additional description.';
                throw new RepositoryException(`${message} | Status: ${status} | Response: ${description}`);
            }
            throw new RepositoryException(message, error.message);
        }
    }

    public async findConsumerByUsername(username: string): Promise<any | null> {
        try {
            const response = await this.axiosInstance.get(`/consumers/${username}`);
            return response.data;
        } catch (error: any) {
            if (error instanceof AxiosError && error.response?.status === 404) {
                return null;
            }
            const message = `Could not find consumer "${username}".`;
            if (error instanceof AxiosError && error.response) {
                const { status, data } = error.response;
                const description = JSON.stringify(data) || 'No additional description.';
                throw new RepositoryException(`${message} | Status: ${status} | Response: ${description}`);
            }
            throw new RepositoryException(message, error.message);
        }
    }

    public async createJwt(consumerJwt: JwtPayload): Promise<any> {
        const consumerId = consumerJwt?.consumer?.id;
        if (!consumerId) {
            throw new RepositoryException('Consumer ID is required to create a JWT.');
        }

        try {
            const response = await this.axiosInstance.post(`/consumers/${consumerId}/jwt`, consumerJwt);
            return response.data;
        } catch (error: any) {
            const message = 'Could not create JWT.';
            if (error instanceof AxiosError && error.response) {
                const { status, data } = error.response;
                const description = JSON.stringify(data) || 'No additional description.';
                throw new RepositoryException(`${message} | Status: ${status} | Response: ${description}`);
            }
            throw new RepositoryException(message, error.message);
        }
    }

    public async createAcl(acl: AclPayload): Promise<any> {
        const consumerId = acl?.consumer?.id;
        if (!consumerId) {
            throw new RepositoryException('Consumer ID is required to create an ACL.');
        }

        try {
            const response = await this.axiosInstance.post(`/consumers/${consumerId}/acls`, acl);
            return response.data;
        } catch (error: any) {
            const message = 'Could not create ACL.';
            if (error instanceof AxiosError && error.response) {
                const { status, data } = error.response;
                const description = JSON.stringify(data) || 'No additional description.';
                throw new RepositoryException(`${message} | Status: ${status} | Response: ${description}`);
            }
            throw new RepositoryException(message, error.message);
        }
    }

    public async findAclsByConsumerAndGroup(consumer: { id: string }, group: string): Promise<any[]> {
        const consumerId = consumer?.id;
        if (!consumerId) {
            throw new RepositoryException('Consumer ID is required to find ACLs.');
        }

        try {
            const response = await this.axiosInstance.get(`/consumers/${consumerId}/acls`, {
                params: { group }
            });
            return response.data?.data || [];
        } catch (error: any) {
            const message = 'Could not find ACLs.';
            if (error instanceof AxiosError && error.response) {
                const { status, data } = error.response;
                const description = JSON.stringify(data) || 'No additional description.';
                throw new RepositoryException(`${message} | Status: ${status} | Response: ${description}`);
            }
            throw new RepositoryException(message, error.message);
        }
    }

    public async deleteConsumerByUsername(username: string): Promise<void> {
        try {
            await this.axiosInstance.delete(`/consumers/${username}`);
        } catch (error: any) {
            const message = `Could not delete consumer "${username}".`;
            if (error instanceof AxiosError && error.response) {
                const { status, data } = error.response;
                const description = JSON.stringify(data) || 'No additional description.';
                throw new RepositoryException(`${message} | Status: ${status} | Response: ${description}`);
            }
            throw new RepositoryException(message, error.message);
        }
    }
}
