import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  const { patientID } = event.queryStringParameters;
  const params = {
    TableName: process.env.patients_by_practice_table,
  };
  const result = await dynamoDb.scan(params);
  const { Items } = result;

  // filter items by customer
  const filteredItem = Items.filter(
    (patientByPractice) => patientByPractice.patientID === patientID
  );

  return filteredItem;
}, true);
