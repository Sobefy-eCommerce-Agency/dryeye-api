import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async () => {
  const params = {
    TableName: process.env.practices_table,
  };
  let practicesResult = await dynamoDb.scan(params);
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
    console.log(practicesResult.Items.length);
    for (let i = 0; i < practicesResult.Items.length; i++) {
      const currentPractice = practicesResult.Items[i];
      const {
        practice,
        doctor,
        name,
        phone,
        phone_tracking_number,
        email,
        website,
        facebook_url,
        instagram_url,
        twitter_url,
        monday_op_hours,
        tuesday_op_hours,
        wednesday_op_hours,
        thursday_op_hours,
        friday_op_hours,
        saturday_op_hours,
        sunday_op_hours,
        address,
        route,
        street_number,
        suite_number,
        city,
        county,
        state,
        state_short,
        country,
        country_short,
        zip,
        latitude,
        longitude,
        dryEyeTreatments,
        eyeCareServices,
        tests,
        dryEyeProducts,
        providerPlus,
        provider,
        partner,
      } = currentPractice;

      console.log(practice);

      const updateParams = {
        TableName: process.env.practices_table,
        Key: {
          practice,
          doctor,
        },
        UpdateExpression:
          "SET #nameAttr = :name, phone = :phone, phone_tracking_number = :phone_tracking_number, email = :email, website = :website, facebook_url = :facebook_url, instagram_url = :instagram_url, twitter_url = :twitter_url, monday_op_hours = :monday_op_hours, tuesday_op_hours = :tuesday_op_hours, wednesday_op_hours = :wednesday_op_hours, thursday_op_hours = :thursday_op_hours, friday_op_hours = :friday_op_hours, saturday_op_hours = :saturday_op_hours, sunday_op_hours = :sunday_op_hours, address = :address, #routeAttr = :route, street_number = :street_number, suite_number = :suite_number, city = :city, county = :county, #stateAttr = :state, state_short = :state_short, country = :country, country_short = :country_short, zip = :zip, latitude = :latitude, longitude = :longitude, dryEyeTreatments = :dryEyeTreatments, eyeCareServices = :eyeCareServices, tests = :tests, dryEyeProducts = :dryEyeProducts, providerPlus = :providerPlus, provider = :provider, partner = :partner, active = :active",
        ExpressionAttributeNames: {
          "#nameAttr": "name",
          "#stateAttr": "state",
          "#routeAttr": "route",
        },
        ExpressionAttributeValues: {
          ":name": name || "",
          ":phone": phone || "",
          ":phone_tracking_number": phone_tracking_number || "",
          ":email": email || "",
          ":website": website || "",
          ":facebook_url": facebook_url || "",
          ":instagram_url": instagram_url || "",
          ":twitter_url": twitter_url || "",
          ":monday_op_hours": monday_op_hours || "",
          ":tuesday_op_hours": tuesday_op_hours || "",
          ":wednesday_op_hours": wednesday_op_hours || "",
          ":thursday_op_hours": thursday_op_hours || "",
          ":friday_op_hours": friday_op_hours || "",
          ":saturday_op_hours": saturday_op_hours || "",
          ":sunday_op_hours": sunday_op_hours || "",
          ":address": address || "",
          ":route": route || "",
          ":street_number": street_number || "",
          ":suite_number": suite_number || "",
          ":city": city || "",
          ":county": county || "",
          ":state": state || "",
          ":state_short": state_short || "",
          ":country": country || "",
          ":country_short": country_short || "",
          ":zip": zip || "",
          ":latitude": latitude ? parseFloat(latitude) : "",
          ":longitude": longitude ? parseFloat(longitude) : "",
          ":dryEyeTreatments": dryEyeTreatments || [],
          ":eyeCareServices": eyeCareServices || [],
          ":tests": tests || [],
          ":dryEyeProducts": dryEyeProducts || [],
          ":providerPlus": providerPlus || false,
          ":provider": provider || false,
          ":partner": partner || false,
          ":active": true,
        },
        ReturnValues: "ALL_NEW",
      };

      await dynamoDb.update(updateParams);
    }
  }

  return { status: 200 };
}, true);
