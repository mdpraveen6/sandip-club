const cloudinary = require('cloudinary').v2;

const enabled =
  Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
  Boolean(process.env.CLOUDINARY_API_KEY) &&
  Boolean(process.env.CLOUDINARY_API_SECRET);

if (enabled) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.warn('[cloudinary] env vars missing — uploads fall back to local disk (ephemeral on Render)');
}

function isCloudinaryEnabled() {
  return enabled;
}

// Upload a multer memory-storage buffer. Returns the full Cloudinary result.
// Always public + unsigned delivery, otherwise raw/pdf hits 401 "deny or ACL failure".
function uploadBuffer(buffer, { folder, resourceType = 'auto', filename } = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        public_id: filename,
        overwrite: false,
        type: 'upload',
        access_mode: 'public',
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

module.exports = { cloudinary, isCloudinaryEnabled, uploadBuffer };
