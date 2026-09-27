export async function GET() {
  const results: Record<string, unknown> = {};

  try {
    const ipRes = await fetch("https://api.ipify.org?format=json");
    results.egressIp = await ipRes.json();
  } catch (error) {
    results.egressIpError = String(error);
  }

  try {
    const getRes = await fetch("https://test-api.kashier.io/v3/payment/sessions");
    results.getStatus = getRes.status;
    results.getBody = (await getRes.text()).slice(0, 300);
  } catch (error) {
    results.getError = String(error);
  }

  try {
    const postRes = await fetch(
      "https://test-api.kashier.io/v3/payment/sessions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "dummy",
          "api-key": "dummy",
        },
        body: JSON.stringify({
          amount: "10.00",
          currency: "EGP",
          merchantId: "MID-51035-895",
        }),
      },
    );
    results.postStatus = postRes.status;
    results.postBody = (await postRes.text()).slice(0, 300);
  } catch (error) {
    results.postError = String(error);
  }

  try {
    const fullBody = {
      amount: "10.00",
      currency: "EGP",
      order: `debug-${crypto.randomUUID()}`,
      merchantId: "MID-51035-895",
      merchantRedirect: "https://metamen-ecommerce.vercel.app/checkout/result",
      display: "en",
      type: "one-time",
      brandColor: "#45543F",
      customer: {
        email: "guest@metamen.demo",
        reference: `guest-${crypto.randomUUID()}`,
      },
    };
    const fullRes = await fetch(
      "https://test-api.kashier.io/v3/payment/sessions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "dummy",
          "api-key": "dummy",
        },
        body: JSON.stringify(fullBody),
      },
    );
    results.fullBodySent = fullBody;
    results.fullStatus = fullRes.status;
    results.fullBody = (await fullRes.text()).slice(0, 300);
  } catch (error) {
    results.fullError = String(error);
  }

  return Response.json(results);
}
