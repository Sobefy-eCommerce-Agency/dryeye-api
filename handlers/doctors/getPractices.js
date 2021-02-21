import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  const { doctor } = event.queryStringParameters;
  const params = {
    TableName: process.env.doctors_table,
    KeyConditionExpression: "doctor = :doctor",
    ExpressionAttributeValues: {
      ":doctor": doctor,
    },
  };

  const response = await dynamoDb.query(params);
  const addresses = response.Items[0]?.addresses;
  return addresses;
}, true);
