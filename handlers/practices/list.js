import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  const { doctor } = event.queryStringParameters;

  const params = {
    TableName: process.env.practices_table,
  };

  const myPractices = await dynamoDb.scan(params);

  const filteredPractices = [];
  if (myPractices.Items) {
    for (let i = 0; i < myPractices.Items.length; i++) {
      const currentPractice = myPractices.Items[i];
      if (currentPractice.doctor === doctor) {
        filteredPractices.push(currentPractice);
      }
    }
  }

  return filteredPractices;
}, true);
