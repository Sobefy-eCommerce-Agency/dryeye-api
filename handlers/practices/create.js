import * as uuid from "uuid";
import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  const data = JSON.parse(event.body);
  const { doctor, address, address2, city, name, phone, state, zip } = data;
  const params = {
    TableName: process.env.practices_table,
    Item: {
      doctor,
      name,
      address,
      address2,
      city,
      phone,
      state,
      zip,
      practice: uuid.v1(),
      createdAt: Date.now(),
    },
  };
  await dynamoDb.put(params);
  return { status: 200 };
});
