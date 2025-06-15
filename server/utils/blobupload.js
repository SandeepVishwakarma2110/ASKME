const { BlobServiceClient } = require('@azure/storage-blob');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();}

const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(containerName);

// ✅ Accepts a Buffer, not file path
async function uploadToBlobStorage(buffer, blobName, contentType) {
    // if (!await containerClient.exists()) {
    //     await containerClient.create(); // auto-create if not found
    //   }
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  const uploadBlobResponse = await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: contentType }
  });
  console.log('Uploading to container:', containerName);
  const exists = await containerClient.exists();
  if (!exists) {
    throw new Error(`Container "${containerName}" does not exist`);
  }
  console.log('Container name from .env:', process.env.AZURE_STORAGE_CONTAINER_NAME);
  return blockBlobClient.url; // return public URL
}

module.exports = { uploadToBlobStorage };
