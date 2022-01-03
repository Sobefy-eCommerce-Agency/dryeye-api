import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async () => {
  const params = {
    TableName: process.env.my_doctors_table,
  };
  const myDoctorsResult = await dynamoDb.scan(params);
  return myDoctorsResult.Items;
}, true);
