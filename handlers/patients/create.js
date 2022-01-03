import * as uuid from "uuid";
import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  const data = JSON.parse(event.body);
  const { patientID, practiceID, doctorID } = data;

  // Check if theres a register with the same patientID
  const patientsByPracticeTable = {
    TableName: process.env.patients_by_practice_table,
  };
  const patientsByPracticeResult = await dynamoDb.scan(patientsByPracticeTable);
  const { Items: patientsByPracticeItems } = patientsByPracticeResult;

  if (patientsByPracticeItems.length > 1) {
    throw new Error("There are multiple registers with the same patientID");
  }

  if (patientsByPracticeItems.length === 1) {
    const { patientByPractice } = patientsByPracticeItems[0];

    if (practiceID || doctorID) {
      const updateParams = {
        ...patientsByPracticeTable,
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

      await dynamoDb.update(updateParams);

      return { status: 200 };
    } else {
      const deleteParams = {
        ...patientsByPracticeTable,
        Key: {
          patientByPractice,
        },
      };

      await dynamoDb.delete(deleteParams);
      return { status: 200 };
    }
  } else {
    // Create the element
    const createParams = {
      ...patientsByPracticeTable,
      Item: {
        patientID,
        practiceID,
        doctorID,
        patientByPractice: uuid.v1(),
        createdAt: Date.now(),
      },
    };
    await dynamoDb.put(createParams);
    return { status: 200 };
  }
}, true);
