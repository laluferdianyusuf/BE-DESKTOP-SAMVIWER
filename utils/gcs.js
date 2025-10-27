const { Storage } = require("@google-cloud/storage");
const path = require("path");

const storage = new Storage({
  keyFilename: path.join(__dirname, "../config/gcs-key.json"),
  projectId: "expo-push-notification-1c962",
});

const bucketName = "raspi_videos";
const bucket = storage.bucket(bucketName);

async function uploadToGCS(localFilePath, destinationPath) {
  await bucket.upload(localFilePath, {
    destination: destinationPath,
    metadata: { cacheControl: "public, max-age=31536000" },
  });
  const file = bucket.file(destinationPath);
  const [url] = await file.getSignedUrl({
    action: "read",
    expires: "03-01-2100",
  });
  return url;
}

module.exports = { uploadToGCS };
