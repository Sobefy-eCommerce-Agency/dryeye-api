import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  const { doctor } = event.queryStringParameters;
  const params = {
    TableName: process.env.practices_table,
    KeyConditionExpression: "doctor = :doctor",
    ExpressionAttributeValues: {
      ":doctor": doctor,
    },
  };

  const response = await dynamoDb.query(params);
  const practices = response.Items;
  return practices;
}, true);
