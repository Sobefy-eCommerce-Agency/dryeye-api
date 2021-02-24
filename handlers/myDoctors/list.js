import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  const params = {
    TableName: process.env.my_doctors_table,
  };
  const myDoctors = await dynamoDb.scan(params);

  const filteredDoctors = [];
  if (myDoctors.Items) {
    if (event.queryStringParameters?.practice) {
      for (let i = 0; i < myDoctors.Items.length; i++) {
        const currentDoctor = myDoctors.Items[i];
        if (currentDoctor.practice === event.queryStringParameters.practice) {
          filteredDoctors.push(currentDoctor);
        }
      }
    } else {
      for (let i = 0; i < myDoctors.Items.length; i++) {
        const currentDoctor = myDoctors.Items[i];
        if (currentDoctor.owner === event.queryStringParameters.owner) {
          filteredDoctors.push(currentDoctor);
        }
      }
    }
  }

  return filteredDoctors;
}, true);
