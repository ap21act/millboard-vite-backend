import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import plimit from "p-limit";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Configure Cloudinary with API credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Limit the number of concurrent uploads
const limit = plimit(Number(process.env.UPLOAD_CONCURRENT_LIMIT) || 8);

// Utility to sanitize public_id (replaces spaces and special characters with underscores)
const sanitizePublicId = (publicId) => {
  return publicId.replace(/[^a-zA-Z0-9-_\/]/g, '_');
};

// Utility to extract the original file name without extension
const getOriginalFileName = (localFilePath) => {
  const rawFileName = localFilePath.split('/').pop().split('.').slice(0, -1).join('.');
  return sanitizePublicId(rawFileName);
};

// Function to delete a local file
const deleteLocalFile = async (filePath) => {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    await fs.promises.unlink(filePath);
  } catch (unlinkError) {
    console.error(`Error deleting local file ${filePath}: ${unlinkError.message}`);
  }
};

// Function to upload a single file to Cloudinary
const uploadOnCloudinary = async (localFilePath, folderPath) => {
  if (!localFilePath || typeof localFilePath !== "string") {
    console.error("Invalid localFilePath");
    return { status: 'error', message: 'Invalid localFilePath' };
  }

  if (!fs.existsSync(localFilePath)) {
    console.error(`File does not exist at path: ${localFilePath}`);
    return { status: 'error', message: `File does not exist at path: ${localFilePath}` };
  }

  if (!folderPath || typeof folderPath !== "string") {
    console.error("Invalid folderPath");
    return { status: 'error', message: 'Invalid folderPath' };
  }

  const sanitizedFolderPath = sanitizePublicId(folderPath);
  const originalFileName = getOriginalFileName(localFilePath);

  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: sanitizedFolderPath,
      public_id: originalFileName,
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    });

    console.log(`File successfully uploaded to Cloudinary: ${response.secure_url}`);

    // Clean up local file after successful upload
    await deleteLocalFile(localFilePath);

    return { status: 'success', data: response };
  } catch (error) {
    console.error(`Cloudinary upload error for ${localFilePath}: ${error.message}`);
    return { status: 'error', message: `Cloudinary upload error for ${localFilePath}: ${error.message}`, cloudinaryError: error };
  }
};

// Function to upload multiple files to Cloudinary
const uploadAllOnCloudinary = async (localFilePaths, folderPath) => {
  if (!Array.isArray(localFilePaths) || localFilePaths.length === 0) {
    console.error("Invalid localFilePaths");
    return { status: 'error', message: 'Invalid localFilePaths' };
  }
  if (!folderPath || typeof folderPath !== "string") {
    console.error("Invalid folderPath");
    return { status: 'error', message: 'Invalid folderPath' };
  }

  const sanitizedFolderPath = sanitizePublicId(folderPath);

  const uploadPromises = localFilePaths.map((localFilePath) =>
    limit(async () => {
      if (!localFilePath || typeof localFilePath !== "string") {
        console.error(`Invalid localFilePath: ${localFilePath}`);
        return { status: 'error', message: `Invalid localFilePath: ${localFilePath}` };
      }

      if (!fs.existsSync(localFilePath)) {
        console.error(`File does not exist at path: ${localFilePath}`);
        return { status: 'error', message: `File does not exist at path: ${localFilePath}` };
      }

      const originalFileName = getOriginalFileName(localFilePath);

      try {
        const response = await cloudinary.uploader.upload(localFilePath, {
          resource_type: "auto",
          folder: sanitizedFolderPath,
          public_id: originalFileName,
          use_filename: true,
          unique_filename: false,
          overwrite: true,
        });

        console.log(`File successfully uploaded to Cloudinary: ${response.secure_url}`);

        // Clean up local file after successful upload
        await deleteLocalFile(localFilePath);

        return { status: 'success', data: response };
      } catch (error) {
        console.error(`Upload failed for ${localFilePath}: ${error.message}`);
        return { status: 'error', message: `Upload failed for ${localFilePath}: ${error.message}` };
      }
    })
  );

  const results = await Promise.all(uploadPromises);
  return results;
};

// Export the functions for use in other modules
export { uploadOnCloudinary, uploadAllOnCloudinary };