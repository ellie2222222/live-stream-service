const axios = require("axios");
const stream = require("stream");
require("dotenv").config();

const uploadToBunny = async (file) => {
  try {
    const zoneName = process.env.BUNNYCDN_STORAGE_ZONE_NAME;
    const password = process.env.BUNNYCDN_STORAGE_PASSWORD;
    const storageUrl = process.env.BUNNY_STORAGE_URL;
    const cdn = process.env.BUNNY_STORAGE_CDN;

    const fileStream = new stream.PassThrough();
    fileStream.end(file.buffer);

    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.originalname}`;

    const uploadUrl = `https://${storageUrl}/${zoneName}/${fileName}`;

    // Thực hiện yêu cầu tải lên
    const response = await axios.put(uploadUrl, fileStream, {
      headers: {
        "Content-Type": file.mimetype,
        AccessKey: password,
      },
    });

    return `https://${cdn}/${fileName}`;
  } catch (error) {
    throw new Error(error.message);
  }
};

const deleteFromBunny = async (fileUrl) => {
  try {
    const fileName = fileUrl.split("/").pop();
    if (!fileName) {
      throw new Error("File name could not be extracted from URL");
    }

    const zoneName = process.env.BUNNYCDN_STORAGE_ZONE_NAME;
    const password = process.env.BUNNYCDN_STORAGE_PASSWORD;
    const storageUrl = process.env.BUNNY_STORAGE_URL;

    const deleteUrl = `https://${storageUrl}/${zoneName}/${fileName}`;

    await axios.delete(deleteUrl, {
      headers: {
        AccessKey: password,
      },
    });
  } catch (error) {
    console.error("Error deleting file:", error.message);
    throw error;
  }
};

module.exports = {
  uploadToBunny,
  deleteFromBunny,
};
