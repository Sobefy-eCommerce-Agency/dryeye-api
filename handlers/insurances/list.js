import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async () => {
  const params = {
    TableName: process.env.insurances_table,
  };
  const response = await dynamoDb.scan(params);

  return response.Items;
}, true);
