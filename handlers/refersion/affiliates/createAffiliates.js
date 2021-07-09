import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";
import { createAffiliate, getAffiliate } from "../../../utils/fetch";

export const main = handler(async (event) => {
  const data = JSON.parse(event.body);
  const { key } = data;
  if (key === process.env.sobefy_internal_key) {
    // Get all doctors
    const allDoctorsParams = {
      TableName: process.env.doctors_table,
      ExpressionAttributeNames: {
        "#n": "first_name",
        "#ln": "last_name",
        "#e": "email",
      },
      Select: "SPECIFIC_ATTRIBUTES",
      ProjectionExpression: "#n,#ln,#e",
    };
    const allDoctors = await dynamoDb.scan(allDoctorsParams);
    if (allDoctors.Items) {
      for (let i = 0; i < allDoctors.Items.length; i++) {
        const currentDoctor = allDoctors.Items[i];
        const { first_name, last_name, email } = currentDoctor;
        if (email && first_name && last_name) {
          // Refersion - Check if theres an affiliate created
          try {
            const affiliateID = await getAffiliate(email);
            console.log(
              affiliateID.data?.data?.affiliates
                ? JSON.stringify(affiliateID.data?.data?.affiliates)
                : ""
            );
            if (affiliateID.data?.data?.affiliates?.length > 0) {
              // Affiliate exists
            } else {
              // Refersion - Create Afilliate
              try {
                const affiliate = await createAffiliate({
                  email,
                  first_name,
                  last_name,
                  phone: null,
                  send_welcome: false,
                });
                console.log(affiliate);
              } catch (e) {
                console.log(e);
              }
            }
          } catch (e) {
            console.log(e);
          }
        }
      }
      return { status: 200 };
    }
  }
  return { status: 500 };
}, true);
