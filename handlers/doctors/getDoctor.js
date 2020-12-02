import AWS from "aws-sdk";
import handler from "../../libs/doctors-handler-lib";

export const main = handler(async (event) => {
  const { practice } = event.queryStringParameters;
  const allDoctorsParams = {
    TableName: process.env.doctors_table,
    ExpressionAttributeNames: {
      "#n": "first_name",
      "#ln": "last_name",
      "#d": "doctor",
      "#p": "practices",
      "#e": "email",
    },
    Select: "SPECIFIC_ATTRIBUTES",
    ProjectionExpression: "#n,#ln,#d,#p,#e",
  };

  const dynamoDb = new AWS.DynamoDB.DocumentClient();

  // Get all available doctors
  const allDoctors = await dynamoDb.scan(allDoctorsParams).promise();

  // Filter the doctors with the current practice
  const filteredDoctors = [];
  if (allDoctors.Items) {
    for (let i = 0; i < allDoctors.Items.length; i++) {
      const currentDoctor = allDoctors.Items[i];
      const currentDoctorPractices = currentDoctor.practices;
      const includesPractice = currentDoctorPractices
        ? currentDoctorPractices.includes(practice)
        : false;
      if (includesPractice) {
        filteredDoctors.push(currentDoctor);
      }
    }
  }

  // Return the retrieved item
  return filteredDoctors;
});
