import AWS from "aws-sdk";
import * as fileType from "file-type";

const s3 = new AWS.S3();

export const GenerateRandomString = () => {
  return Math.random().toString(36).substr(2, 12);
};

export const GenerateImageBuffer = async (imageGallery) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/jpg"];
  const imageGalleryArray = [];

  for (let index = 0; index < imageGallery.length; index++) {
    const image = imageGallery[index];
    const { id, base64, imageURL } = image;

    if (imageURL !== "" && imageURL !== null) {
      imageGalleryArray.push(id + imageURL.split(id)[1]);
    } else {
      const imageData = base64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(imageData, "base64");
      const fileInfo = await fileType.fromBuffer(buffer);
      const detectedExt = fileInfo.ext;
      const detectedMime = fileInfo.mime;
      const key = `${id}.${detectedExt}`;

      if (!allowedMimes.includes(detectedMime)) {
        // return { status: 400, message: "mime not allowed" };
        return;
      }

      await s3
        .putObject({
          Body: buffer,
          Key: key,
          ContentType: detectedMime,
          Bucket: process.env.uploads_bucket,
          ACL: "public-read",
        })
        .promise();

      imageGalleryArray.push(key);
    }
  }

  return imageGalleryArray;
};

export const FormatURL = (url) => {
  const prefix = "https://";
  if (!url || url === prefix) return "";

  if (!/^https?:\/\//i.test(url)) {
    url = prefix + url;
  }
  return url;
};
