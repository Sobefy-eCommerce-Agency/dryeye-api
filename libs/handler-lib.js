export default function handler(lambda, allowAll = false) {
  return async function (event, context) {
    let body, statusCode;

    try {
      // Run the Lambda
      body = await lambda(event, context);
      statusCode = 200;
    } catch (e) {
      // Print out the full error
      console.log(e);

      body = { error: e.message };
      statusCode = 500;
    }

    // Return HTTP response
    return {
      statusCode,
      body: JSON.stringify(body),
      headers: {
        "Access-Control-Allow-Origin": allowAll
          ? "*"
          : "https://wholesale.dryeyerescue.com",
        "Access-Control-Allow-Credentials": true,
      },
    };
  };
}
