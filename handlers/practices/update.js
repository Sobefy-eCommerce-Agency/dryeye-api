import AWS from "aws-sdk";
import * as fileType from "file-type";
import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

const s3 = new AWS.S3();
const allowedMimes = ["image/jpeg", "image/png", "image/jpg"];

export const main = handler(async (event) => {
  const data = JSON.parse(event.body);
  const {
    practice,
    doctor,
    name,
    phone,
    phone_tracking_number,
    email,
    website,
    facebook_url,
    instagram_url,
    twitter_url,
    monday_op_hours,
    tuesday_op_hours,
    wednesday_op_hours,
    thursday_op_hours,
    friday_op_hours,
    saturday_op_hours,
    sunday_op_hours,
    address,
    route,
    street_number,
    suite_number,
    city,
    county,
    state,
    state_short,
    country,
    country_short,
    zip,
    latitude,
    longitude,
    dryEyeTreatments,
    eyeCareServices,
    tests,
    dryEyeProducts,
    providerPlus,
    provider,
    partner,
    active,
    practice_image,
    imageGallery,
    insurances,
  } = data;

  const imageGalleryArray = [];

  // Check image gallery
  if (imageGallery && imageGallery.length > 0) {
    for (let index = 0; index < imageGallery.length; index++) {
      const image = imageGallery[index];
      const { id, base64, imageURL } = image;

      if (imageURL !== "" && imageURL !== null) {
        imageGalleryArray.push(id + imageURL.split(id)[1]);
      } else {
        // TODO: check if image already exists
        const imageData = base64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(imageData, "base64");
        const fileInfo = await fileType.fromBuffer(buffer);
        const detectedExt = fileInfo.ext;
        const detectedMime = fileInfo.mime;
        const key = `${id}.${detectedExt}`;

        if (!allowedMimes.includes(detectedMime)) {
          return { status: 400, message: "mime not allowed" };
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
  } else {
    // TODO: remove image gallery
  }

  const params = {
    TableName: process.env.practices_table,
    Key: {
      practice,
      doctor,
    },
    UpdateExpression:
      "SET #nameAttr = :name, phone = :phone, phone_tracking_number = :phone_tracking_number, email = :email, website = :website, facebook_url = :facebook_url, instagram_url = :instagram_url, twitter_url = :twitter_url, monday_op_hours = :monday_op_hours, tuesday_op_hours = :tuesday_op_hours, wednesday_op_hours = :wednesday_op_hours, thursday_op_hours = :thursday_op_hours, friday_op_hours = :friday_op_hours, saturday_op_hours = :saturday_op_hours, sunday_op_hours = :sunday_op_hours, address = :address, #routeAttr = :route, street_number = :street_number, suite_number = :suite_number, city = :city, county = :county, #stateAttr = :state, state_short = :state_short, country = :country, country_short = :country_short, zip = :zip, latitude = :latitude, longitude = :longitude, dryEyeTreatments = :dryEyeTreatments, eyeCareServices = :eyeCareServices, tests = :tests, dryEyeProducts = :dryEyeProducts, providerPlus = :providerPlus, provider = :provider, partner = :partner, active = :active, practice_image = :practice_image, imageGallery = :imageGallery, insurances = :insurances, updatedAt = :updatedAt",
    ExpressionAttributeNames: {
      "#nameAttr": "name",
      "#stateAttr": "state",
      "#routeAttr": "route",
    },
    ExpressionAttributeValues: {
      ":name": name || "",
      ":phone": phone || "",
      ":phone_tracking_number": phone_tracking_number || "",
      ":email": email || "",
      ":website": website || "",
      ":facebook_url": facebook_url || "",
      ":instagram_url": instagram_url || "",
      ":twitter_url": twitter_url || "",
      ":monday_op_hours": monday_op_hours || "",
      ":tuesday_op_hours": tuesday_op_hours || "",
      ":wednesday_op_hours": wednesday_op_hours || "",
      ":thursday_op_hours": thursday_op_hours || "",
      ":friday_op_hours": friday_op_hours || "",
      ":saturday_op_hours": saturday_op_hours || "",
      ":sunday_op_hours": sunday_op_hours || "",
      ":address": address || "",
      ":route": route || "",
      ":street_number": street_number || "",
      ":suite_number": suite_number || "",
      ":city": city || "",
      ":county": county || "",
      ":state": state || "",
      ":state_short": state_short || "",
      ":country": country || "",
      ":country_short": country_short || "",
      ":zip": zip || "",
      ":latitude": latitude ? parseFloat(latitude) : "",
      ":longitude": longitude ? parseFloat(longitude) : "",
      ":dryEyeTreatments": dryEyeTreatments || [],
      ":eyeCareServices": eyeCareServices || [],
      ":tests": tests || [],
      ":dryEyeProducts": dryEyeProducts || [],
      ":providerPlus": providerPlus || false,
      ":provider": provider || false,
      ":partner": partner || false,
      ":active": active || false,
      ":practice_image": practice_image || "",
      ":imageGallery": imageGalleryArray,
      ":insurances": insurances || [],
      ":updatedAt": Date.now(),
    },
    ReturnValues: "ALL_NEW",
  };

  await dynamoDb.update(params);

  return { status: 200 };
}, true);
