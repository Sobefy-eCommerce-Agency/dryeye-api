import * as uuid from "uuid";
import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  const data = JSON.parse(event.body);
  const { doctor, name, address, address2, city, state, zip, phone } = data;
  const params = {
    TableName: process.env.practices_table,
    Item: {
      doctor,
      name,
      address,
      address2,
      city,
      state,
      zip,
      phone,
      practice: uuid.v1(),
      createdAt: Date.now(),
    },
  };
  await dynamoDb.put(params);
  return { status: 200 };
});
