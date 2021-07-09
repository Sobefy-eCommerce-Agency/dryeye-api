import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";
import { createAffiliate, getAffiliate } from "../../utils/fetch";

export const main = handler(async (event) => {
  const data = JSON.parse(event.body);
  const { doctor, customer, firstName, lastName, email, practice } = data;
  const params = {
    TableName: process.env.my_doctors_table,
    Key: {
      doctor,
      owner: customer,
    },
    UpdateExpression:
      "SET firstName = :firstName, lastName = :lastName, email = :email, practice = :practice",
    ExpressionAttributeValues: {
      ":firstName": firstName || null,
      ":lastName": lastName || null,
      ":email": email || null,
      ":practice": practice || null,
    },
    ReturnValues: "ALL_NEW",
  };

  await dynamoDb.update(params);

  // Refersion - Get Afilliate ID
  if (email && firstName && lastName) {
    const affiliateID = await getAffiliate(email);
    if (affiliateID.data?.data?.affiliates?.length > 0) {
      // Refersion - Edit Afilliate
      console.log(affiliateID.data.data.affiliates[0].id);
    } else {
      // Refersion - Create Afilliate
      const affiliate = await createAffiliate({
        email,
        first_name: firstName,
        last_name: lastName,
        phone: null,
        send_welcome: true,
      });
      console.log(affiliate);
    }
  }

  return { status: 200 };
}, true);
