import handler from "../../../../libs/webhook-handler-lib";
import dynamoDb from "../../../../libs/dynamodb-lib";
import { createConversionTrigger } from "../../../../utils/fetch";
// import dynamoDb from "../../../libs/dynamodb-lib";
const crypto = require("crypto");

export const main = handler(async (event) => {
  let response;
  //get the env variable
  const { webhook_verify_hash_retail } = process.env;

  //get the header with validation hash from webhook
  const shopify_hmac_hash = event.headers
    ? event.headers["X-Shopify-Hmac-Sha256"] ||
      event.headers["x-shopify-hmac-sha256"]
    : "";

  //let's calculate the hash of the content that webhook has sent to us
  const content_hmac_hash = crypto
    .createHmac("sha256", webhook_verify_hash_retail)
    .update(Buffer.from(event.body, "utf8"))
    .digest("base64");

  // that is left is just to compare our hashes
  if (content_hmac_hash !== shopify_hmac_hash) {
    console.log("Integrity of request compromised, aborting");

    response = {
      statusCode: 500,
      body: JSON.stringify("Bad request"),
      //what you return here doesn't matter anything other than 200 for shopify is failed request
    };

    return response;
  }

  /*
    if we arrived here that means the webhook was valid and we can do something with the data
    at the end remember to repond 200 to shopify to let them know that everything worked
    */
  const data = JSON.parse(event.body);
  const { email: customerEmail, note_attributes } = data;

  // Check if the note_attributes are valid
  if (note_attributes && Array.isArray(note_attributes)) {
    const practiceIDAttribute = note_attributes.filter(
      (attribute) => attribute.name === "practice-id"
    );
    const doctorIDAttribute = note_attributes.filter(
      (attribute) => attribute.name === "doctor-id"
    );
    const ownerIDAttribute = note_attributes.filter(
      (attribute) => attribute.name === "owner-id"
    );
    // const practiceID =
    //   practiceIDAttribute.length === 1 ? practiceIDAttribute[0].value : "";
    const doctorID =
      doctorIDAttribute.length === 1 ? doctorIDAttribute[0].value : "";
    const ownerID =
      practiceIDAttribute.length === 1 ? ownerIDAttribute[0].value : "";

    // Check if the doctor has a referral account
    if (doctorID && ownerID) {
      const doctorParams = {
        TableName: process.env.my_doctors_table,
        Key: {
          doctor: doctorID,
          owner: ownerID,
        },
      };

      const result = await dynamoDb.get(doctorParams);
      if (!result.Item) {
        response = {
          statusCode: 500,
          body: JSON.stringify("Bad request"),
        };
        return response;
      }
      const doctor = result.Item;
      const { createAffiliateAccount, affiliateID } = doctor;

      if (createAffiliateAccount) {
        if (affiliateID) {
          const conversionType = "EMAIL";
          console.log(affiliateID);
          console.log(customerEmail);
          const conversionTrigger = await createConversionTrigger(
            affiliateID,
            conversionType,
            customerEmail
          );
          console.log(conversionTrigger);
        }
      }
      return;
    }
  }

  return 200;
});
