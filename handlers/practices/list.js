import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  let response = { Items: [] };
  if (event.queryStringParameters?.doctor) {
    const params = {
      TableName: process.env.practices_table,
      FilterExpression: "#doctor = :doctor",
      ExpressionAttributeNames: {
        "#doctor": "doctor",
      },
      ExpressionAttributeValues: {
        ":doctor": event.queryStringParameters.doctor,
      },
    };
    response = await dynamoDb.scan(params);
  } else {
    const params = {
      TableName: process.env.practices_table,
    };
    const practicesResult = await dynamoDb.scan(params);
    if (practicesResult && practicesResult.Items.length > 0) {
      for (let i = 0; i < practicesResult.Items.length; i++) {
        const currentPractice = practicesResult.Items[i];
        const doctorParams = {
          TableName: process.env.doctors_table,
          KeyConditionExpression: "doctor = :doctor",
          ExpressionAttributeValues: {
            ":doctor": currentPractice.doctor,
          },
        };
        const currentDoctor = await dynamoDb.query(doctorParams);
        let doctorName = "";
        if (currentDoctor && currentDoctor.Items.length === 1) {
          doctorName = `${currentDoctor.Items[0].first_name} ${currentDoctor.Items[0].last_name}`;
        }
        response.Items.push({ ...currentPractice, doctorName });
      }
    }
  }
  const practices = response.Items;
  return practices;
}, true);
