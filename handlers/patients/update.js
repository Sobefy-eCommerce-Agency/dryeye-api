import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  const data = JSON.parse(event.body);
  const { patientByPractice, patientID, practiceID, doctorID } = data;

  const params = {
    TableName: process.env.patients_by_practice_table,
    Key: {
      patientByPractice,
    },
    UpdateExpression:
      "SET patientID = :patientID, practiceID = :practiceID, doctorID = :doctorID",
    ExpressionAttributeValues: {
      ":patientID": patientID || null,
      ":practiceID": practiceID || null,
      ":doctorID": doctorID || null,
    },
    ReturnValues: "ALL_NEW",
  };

  await dynamoDb.update(params);

  return { status: 200 };
}, true);
