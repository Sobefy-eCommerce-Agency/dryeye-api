import * as uuid from "uuid";
import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  const data = JSON.parse(event.body);
  const { label } = data;

  // Create the element
  const params = {
    TableName: process.env.insurances_table,
    Item: {
      label,
      id: uuid.v1(),
      createdAt: Date.now(),
    },
  };
  await dynamoDb.put(params);
  return { status: 200 };
}, true);
