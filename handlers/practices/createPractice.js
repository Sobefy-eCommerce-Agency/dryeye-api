import * as uuid from "uuid";
import handler from "../../libs/doctors-handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  const data = JSON.parse(event.body);
  const practiceID = uuid.v1();
  const {
    doctor,
    name,
    phone,
    address,
    address2,
    city,
    state,
    stateName,
    zip,
  } = data;
  const createPracticeParams = {
    TableName: process.env.practices_table,
    Item: {
      name,
      phone,
      address,
      address2,
      city,
      state,
      stateName,
      zip,
      practice: practiceID,
      doctor,
      createdAt: Date.now(),
    },
  };

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
  formattedPractices.push(practiceID);

  // update thte current practices of the doctor
  const updateDoctorPractices = {
    TableName: process.env.doctors_table,
    Key: {
      doctor,
    },
    UpdateExpression: "SET practices = :practices",
    ExpressionAttributeValues: {
      ":practices": formattedPractices,
    },
    ReturnValues: "NONE",
  };
  await dynamoDb.update(updateDoctorPractices);

  // update the doctor practices
  await dynamoDb.put(createPracticeParams);

  return { status: 200 };
});
