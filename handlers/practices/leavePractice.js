import handler from "../../libs/doctors-handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  const { practice, doctor } = event.queryStringParameters;

  const getDoctorPracticesParams = {
    TableName: process.env.doctors_table,
    Key: {
      doctor,
    },
  };

  // get the current practices of the doctor
  const currentPractices = await dynamoDb.get(getDoctorPracticesParams);
  const formattedPractices = currentPractices?.Item?.practices
    ? currentPractices.Item.practices
    : [];
  const filteredPractices = formattedPractices.filter(
    (currentPractice) => currentPractice !== practice
  );

  // update the current practices of the doctor
  const updateDoctorPractices = {
    TableName: process.env.doctors_table,
    Key: {
      doctor,
    },
    UpdateExpression: "SET practices = :practices",
    ExpressionAttributeValues: {
      ":practices": filteredPractices,
    },
    ReturnValues: "NONE",
  };
  await dynamoDb.update(updateDoctorPractices);

  return { status: 200 };
});
