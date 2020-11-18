import AWS from "aws-sdk";
import handler from "../../libs/doctors-handler-lib";

export const main = handler(async () => {
  const params = {
    TableName: process.env.doctorsTable,
    FilterExpression: "verified_customer = :verified_customer",
    ExpressionAttributeValues: { ":verified_customer": true },
  };

  const dynamoDb = new AWS.DynamoDB.DocumentClient();

  var results = await dynamoDb.scan(params).promise();

  // Return the retrieved item
  return results;
});
