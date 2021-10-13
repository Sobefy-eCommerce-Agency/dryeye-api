import * as uuid from "uuid";

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
  const {
    email: customerEmail,
    note_attributes,
    customer,
    number: orderNumber,
  } = data;

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

    const practiceID =
      practiceIDAttribute.length === 1 ? practiceIDAttribute[0].value : "";
    const doctorID =
      doctorIDAttribute.length === 1 ? doctorIDAttribute[0].value : "";
    const ownerID =
      ownerIDAttribute.length === 1 ? ownerIDAttribute[0].value : "";

    // Check if the doctor has a referral account
    let affiliateID = "";
    let triggeredEntity = "";
    let practiceOwner = "";
    let customerID = customer.id;
    let triggeredAt = "ORDER_CREATION";
    let triggerType = "EMAIL";
    let trigger = customerEmail;
    let selectedPractice = practiceID;
    let selectedDoctor = doctorID;
    let selectedPracticeOwner = ownerID;

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
      const { createAffiliateAccount, affiliateID: doctorAffiliateID } = doctor;

      if (createAffiliateAccount) {
        if (doctorAffiliateID) {
          affiliateID = doctorAffiliateID;
          triggeredEntity = "DOCTOR";
        }
      }
    } else if (practiceID) {
      // Add a conversion trigger for the practice owner
      const practiceParams = {
        TableName: process.env.practices_table,
        KeyConditionExpression: "practice = :practiceId",
        ExpressionAttributeValues: {
          ":practiceId": practiceID,
        },
      };
      const result = await dynamoDb.query(practiceParams);
      const { Items } = result;
      const selectedPractice = Items && Items.length === 1 ? Items[0] : null;
      if (selectedPractice) {
        const { doctor: practiceOwnerID } = selectedPractice;

        const selectedDoctorParams = {
          TableName: process.env.doctors_table,
          KeyConditionExpression: "doctor = :doctor",
          ExpressionAttributeValues: {
            ":doctor": practiceOwnerID,
          },
        };
        const selectedDoctorResult = await dynamoDb.query(selectedDoctorParams);
        const { Items } = selectedDoctorResult;
        const selectedDoctor = Items && Items.length === 1 ? Items[0] : null;

        const { affiliateID: selectedDoctorAffiliateID } = selectedDoctor;
        affiliateID = selectedDoctorAffiliateID;
        triggeredEntity = "PRACTICE_OWNER";
        practiceOwner = practiceOwnerID;
      }
    }

    const conversionTrigger = await createConversionTrigger(
      affiliateID,
      triggerType,
      trigger
    );

    const conversionTriggerID = conversionTrigger?.data?.trigger_id || "";

    // Save conversion trigger to conversion-triggers table
    if (conversionTriggerID) {
      const params = {
        TableName: process.env.conversion_triggers_table,
        Item: {
          affiliateID,
          triggeredAt,
          triggeredEntity,
          triggerType,
          trigger,
          selectedPractice,
          selectedDoctor,
          selectedPracticeOwner,
          customerID,
          orderNumber,
          practiceOwner,
          id: uuid.v1(),
          triggerID: conversionTriggerID,
          customer: customer.id,
          createdAt: Date.now(),
        },
      };
      await dynamoDb.put(params);
      return 200;
    }
  }

  return 200;
});
