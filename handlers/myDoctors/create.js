import * as uuid from "uuid";
import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  const data = JSON.parse(event.body);
  const {
    firstName,
    lastName,
    email,
    phone,
    birthdate,
    address,
    address2,
    city,
    state,
    zip,
    customer,
  } = data;
  const params = {
    TableName: process.env.my_doctors_table,
    Item: {
      firstName,
      lastName,
      email,
      phone,
      birthdate,
      address,
      address2,
      city,
      state,
      zip,
      owner: customer,
      doctor: uuid.v1(),
      createdAt: Date.now(),
    },
  };

  await dynamoDb.put(params);

  return { status: 200 };
});
