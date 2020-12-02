import * as uuid from "uuid";
import handler from "../../libs/doctors-handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  const data = JSON.parse(event.body);
  const {
    doctor,
    name,
    phone,
    address,
    address2,
    city,
    state,
    stateName,
    zip,
  } = data;
  const params = {
    TableName: process.env.practices_table,
    Item: {
      name,
      phone,
      address,
      address2,
      city,
      state,
      stateName,
      zip,
      practice: uuid.v1(),
      doctor,
      createdAt: Date.now(),
    },
  };

  await dynamoDb.put(params);

  return { status: 200 };
});
