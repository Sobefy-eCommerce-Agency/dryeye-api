import handler from "./libs/handler-lib";
import dynamoDb from "./libs/dynamodb-lib";

export const main = handler(async (event) => {
  let response = { Items: [] };
  if (event.queryStringParameters?.user) {
    const params = {
      TableName: process.env.patients_table,
      KeyConditionExpression: "#userAttribute = :user",
      ExpressionAttributeNames: {
        "#userAttribute": "user",
      },
      ExpressionAttributeValues: {
        ":user": event.queryStringParameters.user,
      },
    };
    response = await dynamoDb.query(params);
  } else {
    const params = {
      TableName: process.env.patients_table,
    };
    const patients = await dynamoDb.scan(params);
    if (patients && patients.Items.length > 0) {
      for (let i = 0; i < patients.Items.length; i++) {
        const currentPatient = patients.Items[i];
        const doctorParams = {
          TableName: process.env.doctors_table,
          KeyConditionExpression: "doctor = :doctor",
          ExpressionAttributeValues: {
            ":doctor": currentPatient.user,
          },
        };
        const currentDoctor = await dynamoDb.query(doctorParams);
        let doctorName = "";
        if (currentDoctor && currentDoctor.Items.length === 1) {
          doctorName = `${currentDoctor.Items[0].first_name} ${currentDoctor.Items[0].last_name}`;
        }
        response.Items.push({ ...currentPatient, doctorName });
      }
    }
  }

  // Return the matching list of items in response body
  return response.Items;
}, true);
