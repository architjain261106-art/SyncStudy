import { CloudantV1 } from '@ibm-cloud/cloudant';

let cloudantClient: CloudantV1 | null = null;

export const getCloudantClient = (): CloudantV1 => {
  if (!cloudantClient) {
    // CloudantV1.newInstance() automatically reads CLOUDANT_URL and CLOUDANT_APIKEY from process.env
    cloudantClient = CloudantV1.newInstance({});
  }
  return cloudantClient;
};
