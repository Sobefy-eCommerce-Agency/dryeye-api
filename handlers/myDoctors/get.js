import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  const { doctor, customer } = event.queryStringParameters;
  const params = {
    TableName: process.env.my_doctors_table,
    Key: {
      doctor,
      customer,
    },
  };

  const result = await dynamoDb.get(params);
  if (!result.Item) {
    throw new Error("Item not found.");
  }

  // Return the retrieved item
  return result.Item;
});
