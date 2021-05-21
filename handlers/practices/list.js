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
        const { practice } = currentPractice;
        // Add doctor name property
        const doctorParams = {
          TableName: process.env.doctors_table,
          KeyConditionExpression: "doctor = :doctor",
          ExpressionAttributeValues: {
            ":doctor": currentPractice.doctor,
          },
        };
        const currentDoctor = await dynamoDb.query(doctorParams);
        let doctorName = "";
        let totalSpent = 0;
        if (currentDoctor && currentDoctor.Items.length === 1) {
          doctorName = `${currentDoctor.Items[0].first_name} ${currentDoctor.Items[0].last_name}`;
          // Add total spent
          if (event.queryStringParameters?.total_spent) {
            totalSpent = currentDoctor.Items[0].total_spent
              ? Number(currentDoctor.Items[0].total_spent)
              : 0;
          }
        }
        // Add all doctors property
        let doctors = null;
        if (event.queryStringParameters?.all_doctors) {
          const doctorsParams = {
            TableName: process.env.my_doctors_table,
            FilterExpression: "practice = :practice",
            ExpressionAttributeValues: {
              ":practice": practice,
            },
          };
          const doctorsResult = await dynamoDb.scan(doctorsParams);
          if (doctorsResult && doctorsResult.Items.length > 0) {
            doctors = doctorsResult.Items;
          }
        }
        response.Items.push({
          ...currentPractice,
          doctorName,
          doctors,
          totalSpent,
        });
      }
    }
  }
  // Sort doctors result
  // Sort by treatments number
  if (
    event.queryStringParameters?.treatments &&
    response.Items &&
    response.Items.length > 0
  ) {
    const sortedByTreatmentsNumber = response.Items.sort(
      (a, b) => b.dryEyeTreatments.length - a.dryEyeTreatments.length
    );
    response.Items = sortedByTreatmentsNumber;
  }
  // Sort by total spent
  if (
    event.queryStringParameters?.total_spent &&
    response.Items &&
    response.Items.length > 0
  ) {
    const sortedByTotalSpent = response.Items.sort(
      (a, b) => b.totalSpent - a.totalSpent
    );
    response.Items = sortedByTotalSpent;
  }
  const practices = response.Items;
  return practices;
}, true);
