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
      if (event.queryStringParameters?.owner) {
        for (let i = 0; i < myDoctors.Items.length; i++) {
          const currentDoctor = myDoctors.Items[i];
          if (currentDoctor.owner === event.queryStringParameters.owner) {
            filteredDoctors.push(currentDoctor);
          }
        }
      } else {
        for (let i = 0; i < myDoctors.Items.length; i++) {
          const currentDoctor = myDoctors.Items[i];
          // Get the entities name
          let practiceName = "";
          let doctorName = "";

          if (currentDoctor.owner) {
            const doctorParams = {
              TableName: process.env.doctors_table,
              KeyConditionExpression: "doctor = :doctor",
              ExpressionAttributeValues: {
                ":doctor": currentDoctor.owner,
              },
            };
            const filteredDoctor = await dynamoDb.query(doctorParams);
            if (filteredDoctor && filteredDoctor.Items.length === 1) {
              doctorName = `${filteredDoctor.Items[0].first_name} ${filteredDoctor.Items[0].last_name}`;
            }
          }
          if (currentDoctor.practice) {
            const practiceParams = {
              TableName: process.env.practices_table,
              KeyConditionExpression: "practice = :practice",
              ExpressionAttributeValues: {
                ":practice": currentDoctor.practice,
              },
            };
            const currentPractice = await dynamoDb.query(practiceParams);
            if (currentPractice && currentPractice.Items.length === 1) {
              practiceName = `${currentPractice.Items[0].name} (${currentPractice.Items[0].city}, ${currentPractice.Items[0].state})`;
            }
          }
          filteredDoctors.push({
            ...currentDoctor,
            doctorName: doctorName || "",
            practiceName: practiceName || "",
          });
        }
      }
    }
  }

  return filteredDoctors;
}, true);
