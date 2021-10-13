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

  // Get Afilliate ID
  let affiliateID = "";

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

      affiliateID = affiliate?.data?.id || "";
    }
    if (!createAffiliateAccount) {
      console.log(`removing affiliate: ${email}`);
    }
  }

  const params = {
    TableName: process.env.my_doctors_table,
    Item: {
      firstName,
      lastName,
      email,
      practice,
      createAffiliateAccount,
      affiliateID,
      owner: customer,
      doctor: uuid.v1(),
      createdAt: Date.now(),
    },
  };
  await dynamoDb.put(params);
  return { status: 200 };
}, true);
