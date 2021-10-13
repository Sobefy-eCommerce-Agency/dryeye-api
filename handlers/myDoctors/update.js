import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";
import { createAffiliate, getAffiliate } from "../../utils/fetch";

export const main = handler(async (event) => {
  const data = JSON.parse(event.body);
  const {
    doctor,
    customer,
    firstName,
    lastName,
    email,
    practice,
    createAffiliateAccount,
  } = data;

  // Get Afilliate ID
  let affiliateID = "";

  if (email) {
    const affilliate = await getAffiliate(email);
    const isValidAffiliate = affilliate.data?.data?.affiliates?.length > 0;

    if (createAffiliateAccount && !isValidAffiliate) {
      // Create affiliate
      const newAffiliate = await createAffiliate({
        email,
        first_name: firstName,
        last_name: lastName,
        phone: null,
        send_welcome: true,
      });

      affiliateID = newAffiliate?.data?.id || "";
    }
    if (!createAffiliateAccount) {
      console.log(`removing affiliate: ${email}`);
    }
  }

  const params = {
    TableName: process.env.my_doctors_table,
    Key: {
      doctor,
      owner: customer,
    },
    UpdateExpression:
      "SET firstName = :firstName, lastName = :lastName, email = :email, practice = :practice, createAffiliateAccount = :createAffiliateAccount, affiliateID = :affiliateID",
    ExpressionAttributeValues: {
      ":firstName": firstName || null,
      ":lastName": lastName || null,
      ":email": email || null,
      ":practice": practice || null,
      ":createAffiliateAccount": createAffiliateAccount || false,
      ":affiliateID": affiliateID || "",
    },
    ReturnValues: "ALL_NEW",
  };

  await dynamoDb.update(params);

  return { status: 200 };
}, true);
