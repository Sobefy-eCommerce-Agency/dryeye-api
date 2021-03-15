import * as uuid from "uuid";
import handler from "./libs/handler-lib";
import dynamoDb from "./libs/dynamodb-lib";

export const main = handler(async (event) => {
  const data = JSON.parse(event.body);
  const {
    user,
    firstName,
    lastName,
    email,
    phone,
    address,
    address2,
    city,
    state,
    zip,
  } = data;
  const params = {
    TableName: process.env.patients_table,
    Item: {
      firstName,
      lastName,
      email,
      phone,
      address,
      address2,
      city,
      state,
      zip,
      user,
      patient: uuid.v1(),
      createdAt: Date.now(),
    },
  };

  await dynamoDb.put(params);

  return { status: 200 };
}, true);
