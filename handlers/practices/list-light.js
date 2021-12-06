import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async () => {
  const params = {
    TableName: process.env.practices_table,
  };
  const practicesResult = await dynamoDb.scan(params);
  return practicesResult.Items;
}, true);
