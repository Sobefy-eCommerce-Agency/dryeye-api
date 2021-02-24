import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  const data = JSON.parse(event.body);
  const { practice, doctor: practiceOwner } = data;

  // Remove the practice of the doctors
  const doctorsParams = {
    TableName: process.env.my_doctors_table,
    FilterExpression: "#practice = :practice",
    ExpressionAttributeNames: {
      "#practice": "practice",
    },
    ExpressionAttributeValues: {
      ":practice": practice,
    },
  };
  const doctors = await dynamoDb.scan(doctorsParams);
  const doctorsList = doctors.Items;
  if (doctorsList.length > 0) {
    doctorsList.forEach(async (doctor) => {
      // check if the current doctor has the current practice
      if (doctor.practice === practice) {
        const updateDoctorsParams = {
          TableName: process.env.my_doctors_table,
          Key: {
            doctor: doctor.doctor,
            owner: practiceOwner,
          },
          UpdateExpression: "SET practice = :practice",
          ExpressionAttributeValues: {
            ":practice": "",
          },
          ReturnValues: "ALL_NEW",
        };
        await dynamoDb.update(updateDoctorsParams);
      }
    });
  }

  // Remove the practice
  const params = {
    TableName: process.env.practices_table,
    Key: {
      practice,
      doctor: practiceOwner,
    },
  };

  await dynamoDb.delete(params);

  return { status: 200 };
});
