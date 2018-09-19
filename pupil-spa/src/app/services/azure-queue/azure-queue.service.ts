import { Inject, Injectable } from '@angular/core';
import * as bluebird from 'bluebird';
import {
  IQueueStorage,
  IQueueService,
  QUEUE_STORAGE_TOKEN,
  ITextBase64QueueMessageEncoder,
} from './azureStorage';
import { TextBase64QueueMessageEncoder } from './textBase64QueueMessageEncoder';

/**
 * Declaration of azure queue service
 */

declare let AzureStorage;

@Injectable()
export class AzureQueueService {
  private serviceInstance: IQueueService;
  private encoder: ITextBase64QueueMessageEncoder;

  constructor(@Inject(QUEUE_STORAGE_TOKEN) private queueStorage: IQueueStorage) {
  }

  /**
   * Create a queue service and promisify library calls
   * @param {String} queueName
   * @param {String} url
   * @param {String} token
   * @param {Object} retryConfig
   * @returns {Object}
   */
  public initQueueService(queueName: string, url: string, token: string, retryConfig): IQueueService {
    const service = this.queueStorage
      .createQueueServiceWithSas(url.replace(queueName, ''), token)
      .withFilter(
        new this.queueStorage.LinearRetryPolicyFilter(retryConfig.checkStartAPIErrorMaxAttempts, retryConfig.checkStartAPIErrorDelay)
      );
    service.performRequest = bluebird.promisify(service.performRequest, service);
    service.createMessage = bluebird.promisify(service.createMessage, service);
    return service;
  }

  /**
   * Create a text base64 queue message encoder
   * @returns {Object}
   */
  public getTextBase64QueueMessageEncoder(): TextBase64QueueMessageEncoder {
    return new TextBase64QueueMessageEncoder(this.queueStorage.QueueMessageEncoder);
  }

  /**
   * Add message to the queue
   * @param {String} queueName
   * @param {String} url
   * @param {String} token
   * @param {Object} payload
   * @param {Object} retryConfig
   * @returns {Promise.<Object>}
   */
  public async addMessage(queueName: string, url: string, token: string, payload: object, retryConfig: object): Promise<Object> {
    if (!this.serviceInstance) {
      this.serviceInstance = this.initQueueService(queueName, url, token, retryConfig);
    }
    if (!this.encoder) {
      this.encoder = this.getTextBase64QueueMessageEncoder();
    }
    const message = JSON.stringify(payload);
    const encodedMessage = this.encoder.encode(message);
    return this.serviceInstance.createMessage(queueName, encodedMessage);
  }
}