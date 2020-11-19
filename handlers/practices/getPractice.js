import AWS from "aws-sdk";
import handler from "../../libs/doctors-handler-lib";

export const main = handler(async () => {
  const params = {
    TableName: process.env.practices_table,
  };

  const dynamoDb = new AWS.DynamoDB.DocumentClient();

  const results = await dynamoDb.scan(params).promise();

  // Return the retrieved item
  return results;
});
