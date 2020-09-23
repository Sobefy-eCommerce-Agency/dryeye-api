import * as uuid from "uuid";
import handler from "./libs/handler-lib";
import dynamoDb from "./libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  const data = JSON.parse(event.body);
  const { user, firstName, lastName, address, image } = data;
  const params = {
    TableName: process.env.patientsTable,
    Item: {
      firstName,
      lastName,
      address,
      image,
      user,
      patient: uuid.v1(),
      createdAt: Date.now(),
    },
  };

  await dynamoDb.put(params);

  return params.Item;
});
