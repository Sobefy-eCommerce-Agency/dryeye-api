import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  const { id } = event.queryStringParameters;
  const params = {
    TableName: process.env.practices_table,
    KeyConditionExpression: "practice = :practiceId",
    ExpressionAttributeValues: {
      ":practiceId": id,
    },
  };
  const result = await dynamoDb.query(params);
  const { Items } = result;
  const hasResult = Items && Items.length === 1;

  let practiceRequested = null;

  // Check if the practice is active
  if (hasResult) {
    const currentPractice = Items[0];
    const {
      active,
      practice,
      dryEyeTreatments,
      eyeCareServices,
      tests,
      insurances,
    } = currentPractice;
    if (active !== false) practiceRequested = currentPractice;

    // Add doctors
    const doctorsParams = {
      TableName: process.env.my_doctors_table,
      FilterExpression: "practice = :practice",
      ExpressionAttributeValues: {
        ":practice": practice,
      },
    };
    const doctorsResult = await dynamoDb.scan(doctorsParams);
    if (doctorsResult && doctorsResult.Items.length > 0) {
      practiceRequested.doctors = doctorsResult.Items;
    }

    // Add services & treatments
    const servicesAndTreatmentsParams = {
      TableName: process.env.services_and_treatments_table,
    };
    const servicesAndTreatmentsResult = await dynamoDb.scan(
      servicesAndTreatmentsParams
    );
    if (
      servicesAndTreatmentsResult &&
      servicesAndTreatmentsResult.Items.length > 0
    ) {
      const treatments = servicesAndTreatmentsResult.Items.filter(
        (el) => el.type === "treatment"
      );
      const services = servicesAndTreatmentsResult.Items.filter(
        (el) => el.type === "service"
      );
      const definedTests = servicesAndTreatmentsResult.Items.filter(
        (el) => el.type === "test"
      );

      let practiceTreatments = [];

      if (dryEyeTreatments && dryEyeTreatments.length > 0) {
        dryEyeTreatments.forEach((treatment) => {
          const treatmentDefinition = treatments.filter(
            (defTreatment) => defTreatment.id === treatment
          );
          if (treatmentDefinition && treatmentDefinition.length === 1) {
            practiceTreatments.push(treatmentDefinition[0].label);
          }
        });
      }

      let practiceServices = [];

      if (eyeCareServices && eyeCareServices.length > 0) {
        eyeCareServices.map((service) => {
          const serviceDefinition = services.filter(
            (defService) => defService.id === service
          );
          if (serviceDefinition && serviceDefinition.length === 1) {
            practiceServices.push(serviceDefinition[0].label);
          }
        });
      }

      let practiceTests = [];

      if (tests && tests.length > 0) {
        tests.map((test) => {
          const testDefinition = definedTests.filter(
            (defTest) => defTest.id === test
          );
          if (testDefinition && testDefinition.length === 1) {
            practiceTests.push(testDefinition[0].label);
          }
        });
      }

      practiceRequested.practiceTreatments = practiceTreatments;
      practiceRequested.practiceServices = practiceServices;
      practiceRequested.practiceTests = practiceTests;
    }

    // Add insurances definition
    if (insurances && insurances.length > 0) {
      const insuranceDefinitionParams = {
        TableName: process.env.insurances_table,
      };
      const insuranceDefinitionResult = await dynamoDb.scan(
        insuranceDefinitionParams
      );

      if (
        insuranceDefinitionResult &&
        insuranceDefinitionResult.Items.length > 0
      ) {
        let practiceInsurances = [];
        insurances.forEach((insurance) => {
          const insuranceDefinition = insuranceDefinitionResult.Items.filter(
            (insuranceDef) => insuranceDef.id === insurance
          );
          if (insuranceDefinition.length === 1) {
            practiceInsurances.push(insuranceDefinition[0].label);
          }
        });
        practiceRequested.practiceInsurances = practiceInsurances;
      }
    }
  }
  return practiceRequested;
}, true);
