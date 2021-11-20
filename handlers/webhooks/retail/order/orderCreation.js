import * as uuid from "uuid";

import handler from "../../../../libs/webhook-handler-lib";
import dynamoDb from "../../../../libs/dynamodb-lib";
import {
  createConversionTrigger,
  deleteConversionTrigger,
} from "../../../../utils/fetch";
const crypto = require("crypto");

export const main = handler(async (event) => {
  console.log("ORDER CREATION - START");
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
  console.log("ORDER CREATION - VALID PAYLOAD");
  /*
    if we arrived here that means the webhook was valid and we can do something with the data
    at the end remember to repond 200 to shopify to let them know that everything worked
    */
  const data = JSON.parse(event.body);
  const {
    email: customerEmail,
    note_attributes,
    customer,
    name: orderName,
  } = data;

  // Check if the note_attributes are valid
  if (note_attributes && Array.isArray(note_attributes)) {
    console.log("ORDER CREATION - NOTe AttRIBUTES VALID");
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

    // Define payload for the triggers table
    let affiliateID = "";
    let triggeredEntity = "";
    let affiliateInteralID = "";
    let affiliateEmail = "";
    let affiliateFirstName = "";
    let affiliateLastName = "";
    let triggeredAt = "ORDER_CREATION";
    let triggerType = "EMAIL";
    let trigger = customerEmail;
    let selectedPractice = practiceID;
    let selectedDoctor = doctorID;
    let selectedPracticeOwner = ownerID;
    let doctorIsMissingAffiliate = false;

    const customerPickedDoctor = doctorID && ownerID;

    // Check if the doctor has a referral account
    if (customerPickedDoctor) {
      console.log("ORDER CREATION - DOCTOR WAY");
      const doctorParams = {
        TableName: process.env.my_doctors_table,
        Key: {
          doctor: doctorID,
          owner: ownerID,
        },
      };

      const result = await dynamoDb.get(doctorParams);
      console.log("ORDER CREATION - DOCTOR WAY - RESULT");
      console.log(result);
      if (!result.Item) {
        console.log("ORDER CREATION - DOCTOR WAY - DOCTOR MISSING AFFILIATE");
        doctorIsMissingAffiliate = true;
      } else {
        const doctor = result.Item;
        const {
          createAffiliateAccount,
          affiliateID: doctorAffiliateID,
          email: doctorEmail,
          firstName: doctorFirstName,
          lastName: doctorLastName,
          doctor: docID,
        } = doctor;

        if (createAffiliateAccount && doctorAffiliateID) {
          console.log("ORDER CREATION - DOCTOR WAY - VALID");
          affiliateID = doctorAffiliateID;
          triggeredEntity = "DOCTOR";
          affiliateInteralID = docID;
          affiliateEmail = doctorEmail;
          affiliateFirstName = doctorFirstName;
          affiliateLastName = doctorLastName;
        }
      }
    }

    const customerPickedPractice =
      (practiceID && !customerPickedDoctor) ||
      (doctorIsMissingAffiliate && customerPickedDoctor);

    if (customerPickedPractice) {
      console.log("ORDER CREATION - PRACTICE WAY");
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
        console.log("ORDER CREATION - PRACTICE WAY - VALID PRACTICE");
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

        if (selectedDoctor) {
          console.log("ORDER CREATION - PRACTICE WAY - VALID");

          const {
            doctor: selectedDoctorID,
            affiliateID: selectedDoctorAffiliateID,
            email: selectedDoctorEmail,
            first_name: selectedDoctorFirstName,
            last_name: selectedDoctorLastName,
          } = selectedDoctor;

          affiliateID = selectedDoctorAffiliateID;
          triggeredEntity = "PRACTICE_OWNER";
          affiliateInteralID = selectedDoctorID;
          affiliateEmail = selectedDoctorEmail;
          affiliateFirstName = selectedDoctorFirstName;
          affiliateLastName = selectedDoctorLastName;
        }
      }
    }

    if (affiliateID) {
      console.log("ORDER CREATION - AFFILIATE ID VALID");
      // Check the current state of the triggers table
      const triggersTableParams = {
        TableName: process.env.conversion_triggers_table,
      };
      const triggersResponse = await dynamoDb.scan(triggersTableParams);
      console.log(triggersResponse.Items);
      const validTriggers =
        triggersResponse?.Items?.length > 0 ? triggersResponse.Items : null;

      if (validTriggers) {
        console.log("ORDER CREATION - VALID TRIGGERS");
        // check if the trigger is already created
        const filteredTriggers = validTriggers.filter(
          (trig) =>
            trig.trigger === customerEmail &&
            trig.affiliateID !== affiliateID &&
            trig.triggerType === triggerType
        );

        if (filteredTriggers.length > 0) {
          console.log("ORDER CREATION - TRIGGER ALREADY CREATED");
          // Remove created triggers
          filteredTriggers.forEach(async (filteredTrigger) => {
            const {
              id: createdTriggerID,
              affiliateID: createdAffiliateID,
              trigger: createdTrigger,
              triggerType: createdTriggerType,
            } = filteredTrigger;

            const deletedConversionTrigger = await deleteConversionTrigger(
              createdAffiliateID,
              createdTrigger,
              createdTriggerType
            );
            if (deletedConversionTrigger.status === 200) {
              console.log("ORDER CREATION - TRIGGER REMOVED");
              // Remove trigger from database
              const triggersTableParams = {
                TableName: process.env.conversion_triggers_table,
                Key: {
                  id: createdTriggerID,
                },
              };

              await dynamoDb.delete(triggersTableParams);
            }
          });
        }
      }

      const conversionTrigger = await createConversionTrigger(
        affiliateID,
        triggerType,
        trigger
      );
      console.log("ORDER CREATION - CREATING CONVERSION TRIGGER");
      console.log(conversionTrigger);
      const conversionTriggerID = conversionTrigger?.data?.trigger_id || "";

      // Save conversion trigger to conversion-triggers table
      if (conversionTriggerID) {
        console.log("ORDER CREATION - CREATED CONVERSION TRIGGER");
        const params = {
          TableName: process.env.conversion_triggers_table,
          Item: {
            affiliateID,
            affiliateInteralID,
            affiliateEmail,
            affiliateFirstName,
            affiliateLastName,
            triggeredAt,
            triggeredEntity,
            triggerType,
            trigger,
            selectedPractice,
            selectedDoctor,
            selectedPracticeOwner,
            id: uuid.v1(),
            order: orderName,
            triggerID: conversionTriggerID,
            customer: customer.id,
            createdAt: Date.now(),
          },
        };
        await dynamoDb.put(params);
        return 200;
      }
    }
  }

  return 200;
});
