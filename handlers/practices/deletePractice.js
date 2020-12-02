import handler from "../../libs/doctors-handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  const data = JSON.parse(event.body);
  const { practice, doctor } = data;

  const deletePracticeParams = {
    TableName: process.env.practices_table,
    Key: {
      practice,
      doctor,
    },
  };

  // Get all available doctors
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
  const allDoctors = await dynamoDb.scan(allDoctorsParams);

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

  // update the current practices of the doctor
  if (filteredDoctors.length > 0) {
    for (let i = 0; i < filteredDoctors.length; i++) {
      const currentFilteredDoctor = filteredDoctors[i];
      const formattedPractices = currentFilteredDoctor?.practices
        ? currentFilteredDoctor.practices
        : [];
      const filteredPractices = formattedPractices.filter(
        (currentPractice) => currentPractice !== practice
      );
      const updateDoctorPractices = {
        TableName: process.env.doctors_table,
        Key: {
          doctor: currentFilteredDoctor.doctor,
        },
        UpdateExpression: "SET practices = :practices",
        ExpressionAttributeValues: {
          ":practices": filteredPractices,
        },
        ReturnValues: "NONE",
      };
      await dynamoDb.update(updateDoctorPractices);
    }
  }

  // delete the corresponding practice
  await dynamoDb.delete(deletePracticeParams);

  return { status: 200 };
});
