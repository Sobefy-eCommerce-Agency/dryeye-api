import * as uuid from "uuid";
import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";
import { createAffiliate, getAffiliate } from "../../utils/fetch";

export const main = handler(async (event) => {
  const data = JSON.parse(event.body);
  const { firstName, lastName, email, practice, customer } = data;

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
        owner: customer,
        doctor: uuid.v1(),
        createdAt: Date.now(),
      },
    };
    await dynamoDb.put(params);

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
  }
  throw new Error("An unexpected error happened");
}, true);
