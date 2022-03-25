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
    let practicesResult = await dynamoDb.scan(params);
    // Check if theres more items
    // TODO: Add a function fetcher to fetch again if LastEvaluatedKey is present
    if (
      practicesResult &&
      practicesResult.Items.length > 0 &&
      practicesResult.LastEvaluatedKey
    ) {
      const lastEvaluatedKey = practicesResult.LastEvaluatedKey;
      const newParams = {
        TableName: process.env.practices_table,
        ExclusiveStartKey: lastEvaluatedKey,
      };
      const newResult = await dynamoDb.scan(newParams);
      if (newResult && newResult.Items.length > 0) {
        practicesResult.Items.push(...newResult.Items);
      }
    }
    if (practicesResult && practicesResult.Items.length > 0) {
      // Fetch doctors
      let allDoctorsTable = [];
      if (event.queryStringParameters?.all_doctors) {
        const doctorsParams = {
          TableName: process.env.my_doctors_table,
        };
        const doctorsResult = await dynamoDb.scan(doctorsParams);
        if (doctorsResult && doctorsResult.Items.length > 0) {
          allDoctorsTable = doctorsResult.Items;
        }
      }

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
        if (
          event.queryStringParameters?.all_doctors &&
          allDoctorsTable &&
          allDoctorsTable.length > 0
        ) {
          // filter doctors by practice
          const filteredDoctors = allDoctorsTable.filter(
            (doc) => doc.practice === practice
          );
          if (filteredDoctors.length > 0) {
            doctors = filteredDoctors;
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
  // Sort
  // Sort - By treatments number
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

  // Sort - By total spent
  if (
    event.queryStringParameters?.total_spent &&
    response.Items &&
    response.Items.length > 0
  ) {
    const sortedByTotalSpent = response.Items.sort(
      (a, b) => b.totalSpent - a.totalSpent
    );
    response.Items = sortedByTotalSpent;

    // Remove total spent property
    const filteredPractices = response.Items.map(
      ({ totalSpent, ...rest }) => rest
    );
    response.Items = filteredPractices;
  }

  // Sort - By active practices
  if (
    event.queryStringParameters?.activeOnly &&
    response.Items &&
    response.Items.length > 0
  ) {
    const sortedPractices = response.Items.filter((el) => el.active !== false);
    response.Items = sortedPractices;
  }

  const practices = response.Items;
  return practices;
}, true);
