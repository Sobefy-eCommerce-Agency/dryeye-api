import * as uuid from "uuid";

import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";
import { createAffiliate, getAffiliate } from "../../utils/fetch";

export const main = handler(async (event) => {
  const data = JSON.parse(event.body);
  const {
    firstName,
    lastName,
    email,
    practice,
    customer,
    createAffiliateAccount,
  } = data;

  // Check if the customer has practices
  const doctorParams = {
    TableName: process.env.doctors_table,
    Key: {
      doctor: customer,
    },
  };
  const currentDoctor = await dynamoDb.get(doctorParams);
  if (currentDoctor.Item) {
    const params = {
      TableName: process.env.my_doctors_table,
      Item: {
        firstName,
        lastName,
        email,
        practice,
        createAffiliateAccount,
        owner: customer,
        doctor: uuid.v1(),
        createdAt: Date.now(),
      },
    };
    await dynamoDb.put(params);

    // Refersion - Create Affiliate Account
    // Get Afilliate ID
    if (email) {
      const affilliate = await getAffiliate(email);
      const isValidAffiliate = affilliate.data?.data?.affiliates?.length > 0;

      if (createAffiliateAccount && !isValidAffiliate) {
        // Create affiliate
        const affiliate = await createAffiliate({
          email,
          first_name: firstName,
          last_name: lastName,
          phone: null,
          send_welcome: true,
        });
        console.log(`Affiliate created: ${affiliate}`);
      } else {
        // Remove affiliate
        console.log(`removing affiliate: ${email}`);
      }
    }

    return { status: 200 };
  }
  throw new Error("An unexpected error happened");
}, true);
